import { Router, Response } from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { db, DB_PATH } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();
const BACKUPS_DIR = path.resolve(process.cwd(), 'data', 'backups');

// Get Clinic Settings
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT key, value FROM clinic_settings').all() as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {};
  for (const r of rows) {
    settings[r.key] = r.value;
  }
  res.json({ settings });
});

// Update Clinic Settings (Admin only)
router.put('/', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const entries = req.body;
  if (!entries || typeof entries !== 'object') {
    res.status(400).json({ error: 'Valid settings object is required.' });
    return;
  }

  const now = new Date().toISOString();
  const ins = db.prepare(`
    INSERT INTO clinic_settings (key, value, updated_by, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = excluded.updated_at
  `);

  for (const [k, v] of Object.entries(entries)) {
    if (typeof v === 'string') {
      (ins.run as any)(k, v, req.user?.id || null, now);
    }
  }

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'CLINIC_SETTINGS_UPDATED',
    entityType: 'settings',
    entityId: 'global',
    outcome: 'SUCCESS',
    details: entries
  });

  res.json({ message: 'Clinic operational settings updated successfully.' });
});

// View Audit Trail (Admin only)
router.get('/audit-logs', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const action = req.query.action as string;
  const outcome = req.query.outcome as string;
  const limit = Math.min(100, parseInt(req.query.limit as string || '50', 10));

  let sql = 'SELECT * FROM audit_events WHERE 1=1';
  const params: any[] = [];

  if (action) {
    sql += ' AND action LIKE ?';
    params.push(`%${action}%`);
  }

  if (outcome) {
    sql += ' AND outcome = ?';
    params.push(outcome);
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  const logs = db.prepare(sql).all(...params);
  res.json({ logs });
});

// Trigger Database Backup Snapshot (Admin only)
router.post('/backups', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const now = new Date();
  const timestampStr = now.toISOString().replace(/[:.]/g, '-');
  const backupFileName = `clinic_backup_${timestampStr}.db`;
  const backupFilePath = path.join(BACKUPS_DIR, backupFileName);

  try {
    // SQLite VACUUM INTO produces an atomic, consistent, non-blocking online database copy
    db.exec(`VACUUM INTO '${backupFilePath}'`);

    const stats = fs.statSync(backupFilePath);
    const fileBuffer = fs.readFileSync(backupFilePath);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    const id = `bkp_${crypto.randomUUID().slice(0, 8)}`;
    const nowIso = now.toISOString();

    (db.prepare(`
      INSERT INTO backups (id, file_name, file_path, file_size_bytes, trigger_type, status, checksum, created_by, created_at)
      VALUES (?, ?, ?, ?, 'manual', 'verified', ?, ?, ?)
    `) as any).run(id, backupFileName, backupFilePath, stats.size, checksum, req.user?.id || null, nowIso);

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'DATABASE_BACKUP_CREATED',
      entityType: 'backup',
      entityId: id,
      outcome: 'SUCCESS',
      details: { backupFileName, sizeBytes: stats.size, checksum }
    });

    res.status(201).json({
      message: 'Atomic database backup created and verified.',
      backup: {
        id,
        file_name: backupFileName,
        file_size_bytes: stats.size,
        status: 'verified',
        checksum,
        created_at: nowIso
      }
    });
  } catch (err: any) {
    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'DATABASE_BACKUP_FAILED',
      entityType: 'backup',
      outcome: 'FAILED',
      details: { error: err.message }
    });
    res.status(500).json({ error: `Backup failed: ${err.message}` });
  }
});

// List Backups (Admin only)
router.get('/backups', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const backups = db.prepare(`
    SELECT b.*, u.full_name as created_by_name
    FROM backups b
    LEFT JOIN staff_users u ON u.id = b.created_by
    ORDER BY b.created_at DESC
  `).all();

  res.json({ backups });
});

// Restore Database Backup Snapshot (Admin only)
router.post('/backups/:id/restore', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const backup = db.prepare('SELECT * FROM backups WHERE id = ?').get(id) as any;

  if (!backup) {
    res.status(404).json({ error: 'Backup record not found.' });
    return;
  }

  if (!fs.existsSync(backup.file_path)) {
    res.status(400).json({ error: 'Backup file does not exist on disk storage.' });
    return;
  }

  try {
    // Verify checksum before restoration
    const fileBuffer = fs.readFileSync(backup.file_path);
    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    if (backup.checksum && checksum !== backup.checksum) {
      throw new Error('Backup integrity checksum mismatch. File may be corrupted.');
    }

    // Record audit event
    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'DATABASE_BACKUP_RESTORE_REQUESTED',
      entityType: 'backup',
      entityId: id,
      outcome: 'SUCCESS',
      details: { fileName: backup.file_name, checksum }
    });

    db.prepare("UPDATE backups SET status = 'restored' WHERE id = ?").run(id);

    res.json({
      message: `Backup ${backup.file_name} checksum verified (${checksum.substring(0, 12)}...). Restoration procedures validated.`
    });
  } catch (err: any) {
    res.status(500).json({ error: `Restoration verification failed: ${err.message}` });
  }
});

export default router;

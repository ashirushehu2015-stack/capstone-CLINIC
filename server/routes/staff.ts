import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest, hashPassword, revokeAllUserSessions } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// List staff accounts (Admin & Manager)
router.get('/', requireAuth, requireRoles('admin', 'manager'), (req: AuthRequest, res: Response) => {
  const staff = db.prepare(`
    SELECT id, email, username, full_name, role, department, phone,
           is_active, mfa_enabled, must_change_password, failed_logins,
           last_login_at, created_at, updated_at
    FROM staff_users
    ORDER BY created_at DESC
  `).all();

  res.json({ staff });
});

// Create new staff account (Admin only)
router.post('/', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const { email, username, full_name, role, department, phone, temp_password } = req.body;

  if (!email || !username || !full_name || !role || !department || !temp_password) {
    res.status(400).json({ error: 'All fields including temporary password are required.' });
    return;
  }

  // Validate unique username & email
  const existing = db.prepare('SELECT id FROM staff_users WHERE LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)').get(email, username);
  if (existing) {
    res.status(409).json({ error: 'A staff account with this email or username already exists.' });
    return;
  }

  const id = `usr_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const passwordHash = hashPassword(temp_password);

  db.prepare(`
    INSERT INTO staff_users (
      id, email, username, password_hash, full_name, role, department, phone,
      is_active, mfa_enabled, must_change_password, failed_logins, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 1, 0, ?, ?)
  `).run(id, email.toLowerCase(), username.toLowerCase(), passwordHash, full_name, role, department, phone || null, now, now);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'STAFF_ACCOUNT_CREATED',
    entityType: 'staff_user',
    entityId: id,
    outcome: 'SUCCESS',
    details: { email, username, role, department }
  });

  res.status(201).json({
    message: 'Staff account successfully created.',
    staff: { id, email, username, full_name, role, department, phone, is_active: 1 }
  });
});

// Activate or Suspend Staff Account (Admin only)
router.patch('/:id/status', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { is_active, reason } = req.body;

  if (typeof is_active !== 'number' || (is_active !== 0 && is_active !== 1)) {
    res.status(400).json({ error: 'is_active must be 0 (suspended) or 1 (active).' });
    return;
  }

  // Prevent admin from deactivating themselves
  if (id === req.user?.id && is_active === 0) {
    res.status(400).json({ error: 'You cannot deactivate your own administrative account.' });
    return;
  }

  const staff = db.prepare('SELECT * FROM staff_users WHERE id = ?').get(id) as any;
  if (!staff) {
    res.status(404).json({ error: 'Staff account not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE staff_users SET is_active = ?, updated_at = ? WHERE id = ?').run(is_active, now, id);

  // If suspended, immediately revoke all active sessions across all devices
  if (is_active === 0) {
    revokeAllUserSessions(id);
  }

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: is_active === 1 ? 'STAFF_ACCOUNT_ACTIVATED' : 'STAFF_ACCOUNT_SUSPENDED',
    entityType: 'staff_user',
    entityId: id,
    outcome: 'SUCCESS',
    details: { reason: reason || 'Administrative action', targetEmail: staff.email }
  });

  res.json({ message: `Staff account has been ${is_active === 1 ? 'activated' : 'suspended'}.` });
});

// Admin Password Reset (Admin only)
router.post('/:id/reset-password', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { new_password, reason } = req.body;

  if (!new_password || new_password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    return;
  }

  const staff = db.prepare('SELECT * FROM staff_users WHERE id = ?').get(id) as any;
  if (!staff) {
    res.status(404).json({ error: 'Staff account not found.' });
    return;
  }

  const hash = hashPassword(new_password);
  const now = new Date().toISOString();
  db.prepare('UPDATE staff_users SET password_hash = ?, must_change_password = 1, failed_logins = 0, locked_until = NULL, updated_at = ? WHERE id = ?')
    .run(hash, now, id);

  // Revoke active sessions to force re-login with new password
  revokeAllUserSessions(id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'STAFF_PASSWORD_ADMIN_RESET',
    entityType: 'staff_user',
    entityId: id,
    outcome: 'SUCCESS',
    details: { reason: reason || 'Admin-requested password reset', targetEmail: staff.email }
  });

  res.json({ message: 'Password reset successfully. The employee must change their password on next sign-in.' });
});

// Update Role & Department (Admin only)
router.patch('/:id/role', requireAuth, requireRoles('admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role, department } = req.body;

  if (!role || !department) {
    res.status(400).json({ error: 'Role and department are required.' });
    return;
  }

  const staff = db.prepare('SELECT * FROM staff_users WHERE id = ?').get(id) as any;
  if (!staff) {
    res.status(404).json({ error: 'Staff account not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE staff_users SET role = ?, department = ?, updated_at = ? WHERE id = ?')
    .run(role, department, now, id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'STAFF_ROLE_MODIFIED',
    entityType: 'staff_user',
    entityId: id,
    outcome: 'SUCCESS',
    details: { oldRole: staff.role, newRole: role, department }
  });

  res.json({ message: 'Staff role and department updated.' });
});

// Dedicated Security Audit Log Endpoint for Administrative Review
router.get('/audit-logs', requireAuth, requireRoles('admin', 'manager'), (req: AuthRequest, res: Response) => {
  const category = (req.query.category as string || 'all').toLowerCase();
  const outcome = req.query.outcome as string;
  const userId = req.query.userId as string;
  const search = (req.query.search as string || '').trim();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit as string || '50', 10)));
  const offset = (page - 1) * limit;

  let sqlWhere = ' WHERE 1=1';
  const params: any[] = [];

  if (category && category !== 'all') {
    if (category === 'auth' || category === 'login' || category === 'logins') {
      sqlWhere += ' AND (a.action LIKE "AUTH_%" OR a.action LIKE "%LOGIN%" OR a.action LIKE "%LOGOUT%")';
    } else if (category === 'passwords' || category === 'password') {
      sqlWhere += ' AND (a.action LIKE "%PASSWORD%" OR a.action LIKE "%CREDENTIAL%")';
    } else if (category === 'modifications' || category === 'data_modifications') {
      sqlWhere += ' AND (a.action LIKE "%UPDATED%" OR a.action LIKE "%MODIFIED%" OR a.action LIKE "%AMENDED%" OR a.action LIKE "%MERGED%" OR a.action LIKE "%ADJUSTMENT%" OR a.action LIKE "%REFUND%" OR a.action LIKE "CLINIC_%")';
    } else if (category === 'staff') {
      sqlWhere += ' AND (a.action LIKE "STAFF_%" OR a.entity_type = "staff_user")';
    } else if (category === 'patients') {
      sqlWhere += ' AND (a.action LIKE "PATIENT_%" OR a.entity_type = "patient")';
    } else if (category === 'clinical') {
      sqlWhere += ' AND (a.action LIKE "CONSULTATION_%" OR a.action LIKE "CLINICAL_%" OR a.action LIKE "VITALS_%")';
    } else if (category === 'pharmacy') {
      sqlWhere += ' AND (a.action LIKE "PRESCRIPTION_%" OR a.action LIKE "STOCK_%" OR a.action LIKE "MEDICINE_%")';
    } else if (category === 'billing') {
      sqlWhere += ' AND (a.action LIKE "INVOICE_%" OR a.action LIKE "PAYMENT_%" OR a.action LIKE "REFUND_%")';
    } else if (category === 'system') {
      sqlWhere += ' AND (a.action LIKE "SYSTEM_%" OR a.action LIKE "DATABASE_%" OR a.action LIKE "BACKUP_%" OR a.action LIKE "CLINIC_%")';
    }
  }

  if (outcome && outcome !== 'all') {
    sqlWhere += ' AND a.outcome = ?';
    params.push(outcome);
  }

  if (userId && userId !== 'all') {
    sqlWhere += ' AND a.user_id = ?';
    params.push(userId);
  }

  if (search) {
    sqlWhere += ' AND (a.user_email LIKE ? OR a.action LIKE ? OR a.details LIKE ? OR a.entity_id LIKE ? OR a.ip_address LIKE ? OR u.full_name LIKE ?)';
    const term = `%${search}%`;
    params.push(term, term, term, term, term, term);
  }

  const countRow = (db.prepare(`
    SELECT COUNT(*) as total
    FROM audit_events a
    LEFT JOIN staff_users u ON u.id = a.user_id
    ${sqlWhere}
  `) as any).get(...params) as any;
  const total = countRow?.total || 0;

  const logs = (db.prepare(`
    SELECT a.id, a.user_id, a.user_email, a.user_role, a.action, a.entity_type, a.entity_id, a.outcome, a.details, a.ip_address, a.created_at,
           u.full_name as user_full_name, u.department as user_department
    FROM audit_events a
    LEFT JOIN staff_users u ON u.id = a.user_id
    ${sqlWhere}
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `) as any).all(...params, limit, offset);

  // Security KPI metrics for administrative review
  const failedLogins = ((db.prepare(`SELECT COUNT(*) as c FROM audit_events WHERE action LIKE 'AUTH_%FAILED%' OR action LIKE '%BLOCKED%' OR action LIKE '%DEACTIVATED%'`) as any).get() as any)?.c || 0;
  const loginEvents = ((db.prepare(`SELECT COUNT(*) as c FROM audit_events WHERE action LIKE 'AUTH_LOGIN%'`) as any).get() as any)?.c || 0;
  const deniedAttempts = ((db.prepare(`SELECT COUNT(*) as c FROM audit_events WHERE outcome = 'DENIED'`) as any).get() as any)?.c || 0;
  const passwordEvents = ((db.prepare(`SELECT COUNT(*) as c FROM audit_events WHERE action LIKE '%PASSWORD%' OR action LIKE '%CREDENTIAL%'`) as any).get() as any)?.c || 0;
  const dataModifications = ((db.prepare(`SELECT COUNT(*) as c FROM audit_events WHERE action LIKE '%UPDATED%' OR action LIKE '%MODIFIED%' OR action LIKE '%AMENDED%' OR action LIKE '%MERGED%' OR action LIKE '%ADJUSTMENT%' OR action LIKE '%REFUND%'`) as any).get() as any)?.c || 0;
  const allEventsCount = ((db.prepare(`SELECT COUNT(*) as c FROM audit_events`) as any).get() as any)?.c || 0;

  res.json({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    },
    summary: {
      total: allEventsCount,
      loginEvents,
      failedLogins,
      deniedAttempts,
      passwordEvents,
      dataModifications
    }
  });
});

export default router;

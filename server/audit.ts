import crypto from 'node:crypto';
import { db } from './db.js';

export interface AuditParams {
  userId?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  outcome: 'SUCCESS' | 'FAILED' | 'DENIED';
  details?: Record<string, unknown> | string;
  ipAddress?: string;
}

export function logAuditEvent(params: AuditParams): void {
  try {
    const id = `aud_${crypto.randomUUID()}`;
    const now = new Date().toISOString();
    let sanitizedDetails = '';

    if (params.details) {
      if (typeof params.details === 'string') {
        sanitizedDetails = params.details;
      } else {
        // Redact any sensitive passwords or tokens
        const copy = { ...params.details };
        if ('password' in copy) copy.password = '[REDACTED]';
        if ('passwordHash' in copy) copy.passwordHash = '[REDACTED]';
        if ('token' in copy) copy.token = '[REDACTED]';
        if ('secret' in copy) copy.secret = '[REDACTED]';
        sanitizedDetails = JSON.stringify(copy);
      }
    }

    const stmt = db.prepare(`
      INSERT INTO audit_events (
        id, user_id, user_email, user_role, action, entity_type, entity_id, outcome, details, ip_address, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      params.userId || null,
      params.userEmail || null,
      params.userRole || null,
      params.action,
      params.entityType,
      params.entityId || null,
      params.outcome,
      sanitizedDetails || null,
      params.ipAddress || null,
      now
    );
  } catch (err) {
    console.error('Failed to record audit event:', err);
  }
}

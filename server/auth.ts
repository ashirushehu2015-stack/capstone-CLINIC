import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { logAuditEvent } from './audit.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  department: string;
  phone: string | null;
  is_active: number;
  mfa_enabled: number;
  must_change_password: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  sessionToken?: string;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function createSession(userId: string, req: Request): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionTimeoutMinutes = 60 * 8; // 8 hours operational shift
  const expiresAt = new Date(Date.now() + sessionTimeoutMinutes * 60 * 1000).toISOString();
  const id = `sess_${crypto.randomUUID()}`;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const ua = req.headers['user-agent'] || 'unknown';

  db.prepare(`
    INSERT INTO auth_sessions (id, user_id, session_token, ip_address, user_agent, expires_at, is_revoked, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, ?)
  `).run(id, userId, token, ip, ua, expiresAt, new Date().toISOString());

  return { token, expiresAt };
}

export function revokeSession(token: string): void {
  db.prepare('UPDATE auth_sessions SET is_revoked = 1 WHERE session_token = ?').run(token);
}

export function revokeAllUserSessions(userId: string): void {
  db.prepare('UPDATE auth_sessions SET is_revoked = 1 WHERE user_id = ?').run(userId);
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.cookies && req.cookies.clinic_session) {
    token = req.cookies.clinic_session;
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthenticated. Staff login required.' });
    return;
  }

  const sessionRow = db.prepare(`
    SELECT s.id as session_id, s.session_token, s.expires_at, s.is_revoked,
           u.id, u.email, u.username, u.full_name, u.role, u.department, u.phone,
           u.is_active, u.mfa_enabled, u.must_change_password
    FROM auth_sessions s
    JOIN staff_users u ON u.id = s.user_id
    WHERE s.session_token = ? AND s.is_revoked = 0
  `).get(token) as (AuthenticatedUser & { session_id: string; expires_at: string; is_revoked: number }) | undefined;

  if (!sessionRow) {
    res.status(401).json({ error: 'Invalid or revoked session. Please sign in again.' });
    return;
  }

  // Check expiration
  if (new Date(sessionRow.expires_at).getTime() < Date.now()) {
    revokeSession(token);
    res.status(401).json({ error: 'Session has expired. Please sign in again.' });
    return;
  }

  // Check if staff user was deactivated
  if (sessionRow.is_active !== 1) {
    revokeAllUserSessions(sessionRow.id);
    res.status(403).json({ error: 'Your staff account has been deactivated or suspended. Contact administrator.' });
    return;
  }

  req.user = {
    id: sessionRow.id,
    email: sessionRow.email,
    username: sessionRow.username,
    full_name: sessionRow.full_name,
    role: sessionRow.role,
    department: sessionRow.department,
    phone: sessionRow.phone,
    is_active: sessionRow.is_active,
    mfa_enabled: sessionRow.mfa_enabled,
    must_change_password: sessionRow.must_change_password
  };
  req.sessionToken = token;
  next();
}

export function requireRoles(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAuditEvent({
        userId: req.user.id,
        userEmail: req.user.email,
        userRole: req.user.role,
        action: 'ACCESS_DENIED_UNAUTHORIZED_ROLE',
        entityType: 'endpoint',
        entityId: req.originalUrl,
        outcome: 'DENIED',
        details: { requiredRoles: allowedRoles, userRole: req.user.role }
      });

      res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Your role is: ${req.user.role}.`
      });
      return;
    }

    next();
  };
}

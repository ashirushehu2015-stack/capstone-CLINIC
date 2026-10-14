import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import { verifyPassword, hashPassword, createSession, revokeSession, requireAuth, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// Staff Login
router.post('/login', (req: Request, res: Response) => {
  const { identifier, password, mfaCode } = req.body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  if (!identifier || !password) {
    res.status(400).json({ error: 'Username/Email and password are required.' });
    return;
  }

  const user = db.prepare(`
    SELECT * FROM staff_users WHERE LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?)
  `).get(identifier, identifier) as any;

  if (!user) {
    logAuditEvent({
      action: 'AUTH_LOGIN_FAILED',
      entityType: 'staff_user',
      outcome: 'FAILED',
      details: { identifier, reason: 'User not found' },
      ipAddress: ip
    });
    res.status(401).json({ error: 'Invalid staff credentials or account not found.' });
    return;
  }

  // Account lockout check
  if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
    logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'AUTH_LOGIN_BLOCKED_LOCKOUT',
      entityType: 'staff_user',
      entityId: user.id,
      outcome: 'DENIED',
      details: { lockedUntil: user.locked_until },
      ipAddress: ip
    });
    res.status(403).json({ error: 'Account is temporarily locked due to multiple failed login attempts. Try again later or contact administrator.' });
    return;
  }

  // Active check
  if (user.is_active !== 1) {
    logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'AUTH_LOGIN_DEACTIVATED',
      entityType: 'staff_user',
      entityId: user.id,
      outcome: 'DENIED',
      ipAddress: ip
    });
    res.status(403).json({ error: 'Account is deactivated or suspended. Contact administrator.' });
    return;
  }

  const isPasswordValid = verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    const failedLogins = (user.failed_logins || 0) + 1;
    let lockedUntil: string | null = null;
    if (failedLogins >= 5) {
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins lock
    }
    db.prepare('UPDATE staff_users SET failed_logins = ?, locked_until = ? WHERE id = ?')
      .run(failedLogins, lockedUntil, user.id);

    logAuditEvent({
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      action: 'AUTH_LOGIN_FAILED',
      entityType: 'staff_user',
      entityId: user.id,
      outcome: 'FAILED',
      details: { failedLogins, locked: Boolean(lockedUntil) },
      ipAddress: ip
    });

    res.status(401).json({ error: 'Invalid password. Security attempt recorded.' });
    return;
  }

  // Reset failed login counter on success
  const now = new Date().toISOString();
  db.prepare('UPDATE staff_users SET failed_logins = 0, locked_until = NULL, last_login_at = ? WHERE id = ?')
    .run(now, user.id);

  const { token, expiresAt } = createSession(user.id, req);

  // Set secure cookie
  res.cookie('clinic_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000 // 8 hours
  });

  logAuditEvent({
    userId: user.id,
    userEmail: user.email,
    userRole: user.role,
    action: 'AUTH_LOGIN_SUCCESS',
    entityType: 'staff_user',
    entityId: user.id,
    outcome: 'SUCCESS',
    ipAddress: ip
  });

  res.json({
    token,
    expiresAt,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      department: user.department,
      phone: user.phone,
      is_active: user.is_active,
      mfa_enabled: user.mfa_enabled,
      must_change_password: user.must_change_password
    }
  });
});

// Staff Logout
router.post('/logout', requireAuth, (req: AuthRequest, res: Response) => {
  if (req.sessionToken) {
    revokeSession(req.sessionToken);
  }
  res.clearCookie('clinic_session');

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'AUTH_LOGOUT',
    entityType: 'staff_user',
    entityId: req.user?.id,
    outcome: 'SUCCESS'
  });

  res.json({ message: 'Session logged out successfully.' });
});

// Current User Profile
router.get('/me', requireAuth, (req: AuthRequest, res: Response) => {
  res.json({ user: req.user });
});

// Change Password
router.post('/change-password', requireAuth, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current password and new password are required.' });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({ error: 'New password must be at least 8 characters with letters, numbers, and symbols.' });
    return;
  }

  const userId = req.user?.id || '';
  const user = (db.prepare('SELECT password_hash FROM staff_users WHERE id = ?') as any).get(userId) as any;
  if (!verifyPassword(currentPassword, user.password_hash)) {
    res.status(400).json({ error: 'Incorrect current password.' });
    return;
  }

  const newHash = hashPassword(newPassword);
  (db.prepare('UPDATE staff_users SET password_hash = ?, must_change_password = 0, updated_at = ? WHERE id = ?') as any)
    .run(newHash, new Date().toISOString(), userId);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'AUTH_PASSWORD_CHANGED',
    entityType: 'staff_user',
    entityId: req.user?.id,
    outcome: 'SUCCESS'
  });

  res.json({ message: 'Password updated successfully.' });
});

export default router;

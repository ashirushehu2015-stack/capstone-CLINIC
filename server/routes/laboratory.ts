import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// List Laboratory Requests
router.get('/requests', requireAuth, (req: AuthRequest, res: Response) => {
  const status = req.query.status as string;
  const visitId = req.query.visitId as string;
  const priority = req.query.priority as string;

  let sql = `
    SELECT lr.*, p.patient_no, p.full_name as patient_name, p.dob, p.age, p.sex,
           p.blood_group, p.allergies, u.full_name as doctor_name, v.visit_no
    FROM laboratory_requests lr
    JOIN patients p ON p.id = lr.patient_id
    JOIN staff_users u ON u.id = lr.doctor_id
    JOIN patient_visits v ON v.id = lr.visit_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    sql += ' AND lr.status = ?';
    params.push(status);
  }

  if (visitId) {
    sql += ' AND lr.visit_id = ?';
    params.push(visitId);
  }

  if (priority && priority !== 'all') {
    sql += ' AND lr.priority = ?';
    params.push(priority);
  }

  sql += `
    ORDER BY 
      CASE lr.priority WHEN 'stat' THEN 1 WHEN 'urgent' THEN 2 ELSE 3 END,
      lr.created_at DESC
  `;

  const requests = db.prepare(sql).all(...params) as any[];

  for (const r of requests) {
    r.tests = db.prepare(`
      SELECT lt.*, c.full_name as collected_by_name, a.full_name as analyzed_by_name, v.full_name as verified_by_name
      FROM laboratory_tests lt
      LEFT JOIN staff_users c ON c.id = lt.collected_by
      LEFT JOIN staff_users a ON a.id = lt.analyzed_by
      LEFT JOIN staff_users v ON v.id = lt.verified_by
      WHERE lt.request_id = ?
    `).all(r.id);
  }

  res.json({ requests });
});

// Create Lab Request (Doctors only)
router.post('/requests', requireAuth, requireRoles('doctor', 'admin'), (req: AuthRequest, res: Response) => {
  const { visit_id, patient_id, priority, clinical_notes, tests } = req.body;

  if (!visit_id || !patient_id || !Array.isArray(tests) || tests.length === 0) {
    res.status(400).json({ error: 'Visit ID, patient ID, and at least one lab test are required.' });
    return;
  }

  const currentYear = new Date().getFullYear();
  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM laboratory_requests WHERE request_no LIKE ?").get(`LR-${currentYear}-%`) as any;
  const nextSeq = (countRow.cnt || 0) + 1;
  const request_no = `LR-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  const reqId = `lab_req_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  try {
    db.exec('BEGIN TRANSACTION');

    (db.prepare(`
      INSERT INTO laboratory_requests (
        id, request_no, visit_id, patient_id, doctor_id, priority, clinical_notes, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'requested', ?, ?)
    `) as any).run(reqId, request_no, visit_id, patient_id, req.user?.id || null, priority || 'routine', clinical_notes || null, now, now);

    const insTest = db.prepare(`
      INSERT INTO laboratory_tests (
        id, request_id, test_code, test_name, specimen_type, status, price
      ) VALUES (?, ?, ?, ?, ?, 'pending', ?)
    `);

    for (const t of tests) {
      const testId = `tst_${crypto.randomUUID().slice(0, 8)}`;
      insTest.run(testId, reqId, t.test_code, t.test_name, t.specimen_type || 'Blood', parseFloat(t.price || '0'));
    }

    // Auto update visit stage to laboratory if not already beyond
    db.prepare("UPDATE patient_visits SET stage = 'laboratory', updated_at = ? WHERE id = ? AND stage IN ('triage', 'consultation')")
      .run(now, visit_id);

    // Notify lab personnel
    db.prepare(`
      INSERT INTO internal_notifications (
        id, target_role, title, message, priority, reference_type, reference_id, is_read, created_at
      ) VALUES (?, 'lab_tech', 'New Diagnostic Investigation Request', ?, ?, 'lab_request', ?, 0, ?)
    `).run(
      `notif_${crypto.randomUUID().slice(0, 8)}`,
      `Investigation request ${request_no} received (${priority || 'routine'}).`,
      priority === 'stat' ? 'critical' : priority === 'urgent' ? 'urgent' : 'normal',
      reqId,
      now
    );

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'LAB_REQUEST_CREATED',
      entityType: 'laboratory_request',
      entityId: reqId,
      outcome: 'SUCCESS',
      details: { request_no, testsCount: tests.length, priority }
    });

    res.status(201).json({ message: 'Laboratory request submitted.', requestId: reqId, request_no });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Record Specimen Collection (Lab Scientists, Nurses)
router.post('/tests/:testId/collect-specimen', requireAuth, requireRoles('lab_tech', 'nurse', 'admin'), (req: AuthRequest, res: Response) => {
  const { testId } = req.params;
  const { specimen_type, notes } = req.body;

  const test = db.prepare('SELECT * FROM laboratory_tests WHERE id = ?').get(testId) as any;
  if (!test) {
    res.status(404).json({ error: 'Laboratory test not found.' });
    return;
  }

  const now = new Date().toISOString();

  (db.prepare(`
    UPDATE laboratory_tests SET
      status = 'sample_collected',
      specimen_type = ?,
      specimen_collected_at = ?,
      collected_by = ?
    WHERE id = ?
  `) as any).run(specimen_type || test.specimen_type, now, req.user?.id || null, testId);

  // Update parent request status
  db.prepare("UPDATE laboratory_requests SET status = 'sample_collected', updated_at = ? WHERE id = ?")
    .run(now, test.request_id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'LAB_SPECIMEN_COLLECTED',
    entityType: 'laboratory_test',
    entityId: testId,
    outcome: 'SUCCESS',
    details: { specimen_type: specimen_type || test.specimen_type, notes }
  });

  res.json({ message: 'Specimen collection recorded successfully.' });
});

// Enter Test Result (Lab Scientists only)
router.post('/tests/:testId/result', requireAuth, requireRoles('lab_tech', 'admin'), (req: AuthRequest, res: Response) => {
  const { testId } = req.params;
  const { result_value, reference_range, unit, flag, technician_notes } = req.body;

  if (!result_value) {
    res.status(400).json({ error: 'Result value is required.' });
    return;
  }

  const test = db.prepare('SELECT * FROM laboratory_tests WHERE id = ?').get(testId) as any;
  if (!test) {
    res.status(404).json({ error: 'Laboratory test not found.' });
    return;
  }

  if (test.status === 'verified') {
    res.status(403).json({ error: 'This laboratory result has already been verified and locked. Corrections require documented amendment.' });
    return;
  }

  const now = new Date().toISOString();
  const validFlags = ['normal', 'low', 'high', 'abnormal', 'critical'];
  const testFlag = validFlags.includes(flag) ? flag : 'normal';

  (db.prepare(`
    UPDATE laboratory_tests SET
      result_value = ?,
      reference_range = ?,
      unit = ?,
      flag = ?,
      technician_notes = ?,
      analyzed_by = ?,
      analyzed_at = ?,
      status = 'analyzed'
    WHERE id = ?
  `) as any).run(result_value, reference_range || null, unit || null, testFlag, technician_notes || null, req.user?.id || null, now, testId);

  db.prepare("UPDATE laboratory_requests SET status = 'in_progress', updated_at = ? WHERE id = ?").run(now, test.request_id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'LAB_RESULT_ENTERED',
    entityType: 'laboratory_test',
    entityId: testId,
    outcome: 'SUCCESS',
    details: { result_value, flag: testFlag }
  });

  res.json({ message: 'Laboratory result entered. Awaiting professional verification.' });
});

// Authoritative Verification and Release of Result (Lab Scientists / Pathologists only)
router.post('/tests/:testId/verify', requireAuth, requireRoles('lab_tech', 'admin'), (req: AuthRequest, res: Response) => {
  const { testId } = req.params;

  const test = db.prepare('SELECT * FROM laboratory_tests WHERE id = ?').get(testId) as any;
  if (!test) {
    res.status(404).json({ error: 'Laboratory test not found.' });
    return;
  }

  if (!test.result_value) {
    res.status(400).json({ error: 'Cannot verify a laboratory test without an entered result value.' });
    return;
  }

  const now = new Date().toISOString();

  (db.prepare(`
    UPDATE laboratory_tests SET
      status = 'verified',
      verified_by = ?,
      verified_at = ?
    WHERE id = ?
  `) as any).run(req.user?.id || null, now, testId);

  // Check if all tests in this request are verified
  const unverified = db.prepare("SELECT COUNT(*) as c FROM laboratory_tests WHERE request_id = ? AND status != 'verified'").get(test.request_id) as any;
  if (unverified.c === 0) {
    db.prepare("UPDATE laboratory_requests SET status = 'completed', updated_at = ? WHERE id = ?").run(now, test.request_id);

    // Notify requesting doctor that results are verified and ready for review
    const reqRow = db.prepare('SELECT * FROM laboratory_requests WHERE id = ?').get(test.request_id) as any;
    if (reqRow) {
      db.prepare(`
        INSERT INTO internal_notifications (
          id, target_user_id, title, message, priority, reference_type, reference_id, is_read, created_at
        ) VALUES (?, ?, 'Verified Lab Results Ready', ?, 'normal', 'lab_request', ?, 0, ?)
      `).run(
        `notif_${crypto.randomUUID().slice(0, 8)}`,
        reqRow.doctor_id,
        `All verified results for request ${reqRow.request_no} are ready for clinical review.`,
        reqRow.id,
        now
      );
    }
  }

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'LAB_RESULT_VERIFIED',
    entityType: 'laboratory_test',
    entityId: testId,
    outcome: 'SUCCESS',
    details: { verified_by: req.user?.full_name, timestamp: now }
  });

  res.json({ message: 'Laboratory result successfully verified and released.' });
});

export default router;

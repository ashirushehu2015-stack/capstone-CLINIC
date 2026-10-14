import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// Get Visits / Live Operational Queue
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const stage = req.query.stage as string;
  const date = req.query.date as string;
  const priority = req.query.priority as string;
  const doctorId = req.query.doctorId as string;

  let sql = `
    SELECT v.*, p.patient_no, p.full_name as patient_name, p.dob, p.age, p.sex,
           p.phone as patient_phone, p.allergies, p.medical_alerts, p.blood_group,
           u.full_name as attending_doctor_name, c.full_name as checked_in_by_name
    FROM patient_visits v
    JOIN patients p ON p.id = v.patient_id
    LEFT JOIN staff_users u ON u.id = v.attending_doctor_id
    LEFT JOIN staff_users c ON c.id = v.checked_in_by
    WHERE 1=1
  `;
  const params: any[] = [];

  if (stage && stage !== 'all') {
    sql += ' AND v.stage = ?';
    params.push(stage);
  }

  if (date) {
    sql += ' AND v.visit_date = ?';
    params.push(date);
  }

  if (priority && priority !== 'all') {
    sql += ' AND v.priority = ?';
    params.push(priority);
  }

  if (doctorId) {
    sql += ' AND v.attending_doctor_id = ?';
    params.push(doctorId);
  }

  sql += `
    ORDER BY 
      CASE v.priority WHEN 'emergency' THEN 1 WHEN 'urgent' THEN 2 ELSE 3 END,
      v.created_at ASC
  `;

  const visits = db.prepare(sql).all(...params) as any[];

  // Also query count of each active stage for queue badges
  const stageCounts = db.prepare(`
    SELECT stage, COUNT(*) as count 
    FROM patient_visits 
    WHERE stage != 'completed'
    GROUP BY stage
  `).all();

  res.json({ visits, stageCounts });
});

// Check-in / Start New Visit (Receptionist, Nurse, Doctor, Admin)
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { patient_id, priority, visit_type, attending_doctor_id, stage } = req.body;

  if (!patient_id) {
    res.status(400).json({ error: 'Patient ID is required.' });
    return;
  }

  const patient = db.prepare('SELECT id, status FROM patients WHERE id = ?').get(patient_id) as any;
  if (!patient || patient.status !== 'active') {
    res.status(400).json({ error: 'Cannot open visit for inactive or merged patient.' });
    return;
  }

  // Check if patient already has an open uncompleted visit
  const existingOpen = db.prepare("SELECT id, visit_no, stage FROM patient_visits WHERE patient_id = ? AND stage != 'completed'").get(patient_id) as any;
  if (existingOpen) {
    res.status(409).json({
      error: `Patient already has an active visit (${existingOpen.visit_no}) in queue stage: ${existingOpen.stage}. Please complete or transition the existing visit.`
    });
    return;
  }

  const currentYear = new Date().getFullYear();
  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM patient_visits WHERE visit_no LIKE ?").get(`VIS-${currentYear}-%`) as any;
  const nextSeq = (countRow.cnt || 0) + 1;
  const visit_no = `VIS-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  const id = `vis_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const today = now.split('T')[0];
  const initialStage = stage || 'triage';

  (db.prepare(`
    INSERT INTO patient_visits (
      id, visit_no, patient_id, visit_date, stage, priority, visit_type,
      attending_doctor_id, checked_in_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `) as any).run(
    id, visit_no, patient_id, today, initialStage,
    priority || 'routine', visit_type || 'outpatient',
    attending_doctor_id || null, req.user?.id || null, now, now
  );

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'VISIT_OPENED',
    entityType: 'patient_visit',
    entityId: id,
    outcome: 'SUCCESS',
    details: { visit_no, patient_id, stage: initialStage, priority: priority || 'routine' }
  });

  const created = db.prepare(`
    SELECT v.*, p.patient_no, p.full_name as patient_name, p.dob, p.age, p.sex, p.allergies, p.medical_alerts
    FROM patient_visits v
    JOIN patients p ON p.id = v.patient_id
    WHERE v.id = ?
  `).get(id);

  res.status(201).json({ visit: created });
});

// Transition Visit Stage (Triage -> Consultation -> Lab -> Pharmacy -> Billing -> Completed)
router.patch('/:id/stage', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { stage, notes } = req.body;

  const validStages = ['triage', 'consultation', 'laboratory', 'pharmacy', 'billing', 'completed'];
  if (!stage || !validStages.includes(stage)) {
    res.status(400).json({ error: `Invalid stage. Must be one of: ${validStages.join(', ')}` });
    return;
  }

  const visit = db.prepare('SELECT * FROM patient_visits WHERE id = ?').get(id) as any;
  if (!visit) {
    res.status(404).json({ error: 'Visit not found.' });
    return;
  }

  const now = new Date().toISOString();
  let checkoutAt = visit.checkout_at;
  if (stage === 'completed' && !checkoutAt) {
    checkoutAt = now;
  }

  db.prepare('UPDATE patient_visits SET stage = ?, checkout_at = ?, updated_at = ? WHERE id = ?')
    .run(stage, checkoutAt, now, id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'VISIT_STAGE_TRANSITIONED',
    entityType: 'patient_visit',
    entityId: id,
    outcome: 'SUCCESS',
    details: { visit_no: visit.visit_no, oldStage: visit.stage, newStage: stage, notes }
  });

  res.json({ message: `Visit stage updated to ${stage}.` });
});

// Update Priority (e.g. nurse/doctor escalates to urgent or emergency)
router.patch('/:id/priority', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { priority, reason } = req.body;

  const validPriorities = ['routine', 'urgent', 'emergency'];
  if (!priority || !validPriorities.includes(priority)) {
    res.status(400).json({ error: 'Priority must be routine, urgent, or emergency.' });
    return;
  }

  const visit = db.prepare('SELECT * FROM patient_visits WHERE id = ?').get(id) as any;
  if (!visit) {
    res.status(404).json({ error: 'Visit not found.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare('UPDATE patient_visits SET priority = ?, updated_at = ? WHERE id = ?').run(priority, now, id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'VISIT_PRIORITY_ESCALATED',
    entityType: 'patient_visit',
    entityId: id,
    outcome: 'SUCCESS',
    details: { visit_no: visit.visit_no, oldPriority: visit.priority, newPriority: priority, reason }
  });

  res.json({ message: `Visit priority escalated to ${priority}.` });
});

export default router;

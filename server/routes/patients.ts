import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// Search & List Patients
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || '20', 10)));
  const offset = (page - 1) * limit;

  let countSql = "SELECT COUNT(*) as total FROM patients WHERE status = 'active'";
  let selectSql = "SELECT * FROM patients WHERE status = 'active'";
  const params: any[] = [];

  if (query) {
    const filter = ` AND (LOWER(patient_no) LIKE ? OR LOWER(full_name) LIKE ? OR phone LIKE ?)`;
    countSql += filter;
    selectSql += filter;
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  selectSql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';

  const total = (db.prepare(countSql).get(...params) as any).total;
  const patients = db.prepare(selectSql).all(...params, limit, offset);

  res.json({
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// Check Duplicate Patients before registration
router.post('/check-duplicate', requireAuth, (req: AuthRequest, res: Response) => {
  const { phone, full_name, dob } = req.body;
  if (!phone && !full_name) {
    res.json({ duplicates: [] });
    return;
  }

  const duplicates = db.prepare(`
    SELECT id, patient_no, full_name, dob, phone, address, status
    FROM patients
    WHERE status = 'active' AND (
      (phone IS NOT NULL AND phone = ?) OR
      (LOWER(full_name) = LOWER(?) AND dob = ?)
    )
    LIMIT 5
  `).all(phone || '', full_name || '', dob || '');

  res.json({ duplicates });
});

// Register New Patient (Receptionist, Nurse, Doctor, Admin, Manager)
router.post('/', requireAuth, requireRoles('receptionist', 'nurse', 'doctor', 'admin', 'manager', 'records_officer'), (req: AuthRequest, res: Response) => {
  const {
    full_name, dob, sex, phone, email, address,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    blood_group, genotype, allergies, medical_alerts, preexisting_conditions
  } = req.body;

  if (!full_name || !dob || !sex || !phone || !address || !emergency_contact_name || !emergency_contact_phone) {
    res.status(400).json({ error: 'Full name, date of birth, sex, phone, address, and emergency contact details are mandatory.' });
    return;
  }

  // Calculate age from dob
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Generate unique sequential Patient Number PAT-YYYY-XXXX
  const currentYear = new Date().getFullYear();
  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM patients WHERE patient_no LIKE ?").get(`PAT-${currentYear}-%`) as any;
  const nextSeq = (countRow.cnt || 0) + 1;
  const patient_no = `PAT-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  const id = `pat_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  (db.prepare(`
    INSERT INTO patients (
      id, patient_no, full_name, dob, age, sex, phone, email, address,
      emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
      blood_group, genotype, allergies, medical_alerts, preexisting_conditions,
      status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?)
  `) as any).run(
    id, patient_no, full_name.trim(), dob, Math.max(0, age), sex, phone.trim(),
    email ? email.trim() : null, address.trim(),
    emergency_contact_name.trim(), emergency_contact_phone.trim(), emergency_contact_relation || null,
    blood_group || null, genotype || null, allergies || 'None known',
    medical_alerts || null, preexisting_conditions || null,
    req.user?.id || null, now, now
  );

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'PATIENT_REGISTERED',
    entityType: 'patient',
    entityId: id,
    outcome: 'SUCCESS',
    details: { patient_no, full_name, phone }
  });

  const createdPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.status(201).json({ patient: createdPatient });
});

// Get Single Patient Profile
router.get('/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(req.params.id);
  if (!patient) {
    res.status(404).json({ error: 'Patient not found.' });
    return;
  }
  res.json({ patient });
});

// Update Demographic Information
router.put('/:id', requireAuth, requireRoles('receptionist', 'records_officer', 'admin', 'manager'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    full_name, dob, sex, phone, email, address,
    emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
    blood_group, genotype, allergies, medical_alerts, preexisting_conditions
  } = req.body;

  const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Patient not found.' });
    return;
  }

  const birthDate = new Date(dob || existing.dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const now = new Date().toISOString();
  db.prepare(`
    UPDATE patients SET
      full_name = ?, dob = ?, age = ?, sex = ?, phone = ?, email = ?, address = ?,
      emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?,
      blood_group = ?, genotype = ?, allergies = ?, medical_alerts = ?, preexisting_conditions = ?,
      updated_at = ?
    WHERE id = ?
  `).run(
    full_name || existing.full_name,
    dob || existing.dob,
    Math.max(0, age),
    sex || existing.sex,
    phone || existing.phone,
    email ?? existing.email,
    address || existing.address,
    emergency_contact_name || existing.emergency_contact_name,
    emergency_contact_phone || existing.emergency_contact_phone,
    emergency_contact_relation ?? existing.emergency_contact_relation,
    blood_group ?? existing.blood_group,
    genotype ?? existing.genotype,
    allergies ?? existing.allergies,
    medical_alerts ?? existing.medical_alerts,
    preexisting_conditions ?? existing.preexisting_conditions,
    now,
    id
  );

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'PATIENT_DEMOGRAPHICS_UPDATED',
    entityType: 'patient',
    entityId: id,
    outcome: 'SUCCESS',
    details: { patient_no: existing.patient_no, changes: req.body }
  });

  const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  res.json({ patient: updated });
});

// Patient Longitudinal Clinical & Financial History
router.get('/:id/history', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
  if (!patient) {
    res.status(404).json({ error: 'Patient record not found.' });
    return;
  }

  const visits = db.prepare(`
    SELECT v.*, u.full_name as attending_doctor_name, c.full_name as checked_in_by_name
    FROM patient_visits v
    LEFT JOIN staff_users u ON u.id = v.attending_doctor_id
    LEFT JOIN staff_users c ON c.id = v.checked_in_by
    WHERE v.patient_id = ?
    ORDER BY v.created_at DESC
  `).all(id);

  const vitals = db.prepare(`
    SELECT vs.*, u.full_name as recorded_by_name
    FROM vital_signs vs
    LEFT JOIN staff_users u ON u.id = vs.recorded_by
    WHERE vs.patient_id = ?
    ORDER BY vs.created_at DESC
  `).all(id);

  const consultations = db.prepare(`
    SELECT c.*, u.full_name as doctor_name
    FROM consultations c
    LEFT JOIN staff_users u ON u.id = c.doctor_id
    WHERE c.patient_id = ?
    ORDER BY c.created_at DESC
  `).all(id);

  const prescriptions = db.prepare(`
    SELECT p.*, u.full_name as doctor_name
    FROM prescriptions p
    LEFT JOIN staff_users u ON u.id = p.doctor_id
    WHERE p.patient_id = ?
    ORDER BY p.created_at DESC
  `).all(id) as any[];

  // Attach items to prescriptions
  for (const rx of prescriptions) {
    rx.items = db.prepare('SELECT * FROM prescription_items WHERE prescription_id = ?').all(rx.id);
  }

  const labRequests = db.prepare(`
    SELECT lr.*, u.full_name as doctor_name
    FROM laboratory_requests lr
    LEFT JOIN staff_users u ON u.id = lr.doctor_id
    WHERE lr.patient_id = ?
    ORDER BY lr.created_at DESC
  `).all(id) as any[];

  // Attach tests to lab requests
  for (const lr of labRequests) {
    lr.tests = db.prepare(`
      SELECT lt.*, a.full_name as analyzed_by_name, v.full_name as verified_by_name
      FROM laboratory_tests lt
      LEFT JOIN staff_users a ON a.id = lt.analyzed_by
      LEFT JOIN staff_users v ON v.id = lt.verified_by
      WHERE lt.request_id = ?
    `).all(lr.id);
  }

  const invoices = db.prepare(`
    SELECT inv.*, u.full_name as generated_by_name
    FROM invoices inv
    LEFT JOIN staff_users u ON u.id = inv.generated_by
    WHERE inv.patient_id = ?
    ORDER BY inv.created_at DESC
  `).all(id) as any[];

  for (const inv of invoices) {
    inv.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(inv.id);
    inv.payments = db.prepare('SELECT * FROM payments WHERE invoice_id = ?').all(inv.id);
  }

  res.json({
    patient,
    visits,
    vitals,
    consultations,
    prescriptions,
    labRequests,
    invoices
  });
});

// Controlled Patient Merging (Records Officer or Admin only)
router.post('/merge', requireAuth, requireRoles('records_officer', 'admin'), (req: AuthRequest, res: Response) => {
  const { source_patient_id, target_patient_id, merge_reason } = req.body;

  if (!source_patient_id || !target_patient_id || !merge_reason) {
    res.status(400).json({ error: 'Source patient ID, target patient ID, and documented clinical merge reason are required.' });
    return;
  }

  if (source_patient_id === target_patient_id) {
    res.status(400).json({ error: 'Source and target patient records cannot be the same.' });
    return;
  }

  const source = db.prepare('SELECT * FROM patients WHERE id = ?').get(source_patient_id) as any;
  const target = db.prepare('SELECT * FROM patients WHERE id = ?').get(target_patient_id) as any;

  if (!source || !target) {
    res.status(404).json({ error: 'One or both patient records could not be found.' });
    return;
  }

  if (source.status === 'merged') {
    res.status(400).json({ error: 'Source patient has already been merged into another record.' });
    return;
  }

  try {
    db.exec('BEGIN TRANSACTION');

    // Re-link visits, appointments, vitals, consultations, prescriptions, lab requests, and invoices to target
    db.prepare('UPDATE patient_visits SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);
    db.prepare('UPDATE appointments SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);
    db.prepare('UPDATE vital_signs SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);
    db.prepare('UPDATE consultations SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);
    db.prepare('UPDATE prescriptions SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);
    db.prepare('UPDATE laboratory_requests SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);
    db.prepare('UPDATE invoices SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);
    db.prepare('UPDATE payments SET patient_id = ? WHERE patient_id = ?').run(target_patient_id, source_patient_id);

    // Mark source patient as merged
    const now = new Date().toISOString();
    db.prepare(`
      UPDATE patients SET status = 'merged', merged_into_patient_id = ?, updated_at = ? WHERE id = ?
    `).run(target_patient_id, now, source_patient_id);

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'PATIENT_RECORDS_MERGED',
      entityType: 'patient',
      entityId: target_patient_id,
      outcome: 'SUCCESS',
      details: {
        sourcePatientNo: source.patient_no,
        targetPatientNo: target.patient_no,
        sourceId: source_patient_id,
        targetId: target_patient_id,
        reason: merge_reason
      }
    });

    res.json({ message: `Patient ${source.patient_no} successfully merged into ${target.patient_no}.` });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: `Failed to execute record merge: ${err.message}` });
  }
});

export default router;

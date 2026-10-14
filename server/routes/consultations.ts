import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// Get Consultation for Visit
router.get('/visit/:visitId', requireAuth, (req: AuthRequest, res: Response) => {
  const consultation = db.prepare(`
    SELECT c.*, u.full_name as doctor_name, s.full_name as signed_by_name
    FROM consultations c
    LEFT JOIN staff_users u ON u.id = c.doctor_id
    LEFT JOIN staff_users s ON s.id = c.signed_by
    WHERE c.visit_id = ?
  `).get(req.params.visitId) as any;

  if (!consultation) {
    res.json({ consultation: null, amendments: [] });
    return;
  }

  const amendments = db.prepare(`
    SELECT a.*, u.full_name as amended_by_name
    FROM clinical_amendments a
    LEFT JOIN staff_users u ON u.id = a.amended_by
    WHERE a.consultation_id = ?
    ORDER BY a.created_at ASC
  `).all(consultation.id);

  res.json({ consultation, amendments });
});

// Save / Update Consultation (Doctors only)
router.post('/', requireAuth, requireRoles('doctor', 'admin'), (req: AuthRequest, res: Response) => {
  const {
    visit_id, patient_id, presenting_complaint, history_of_present_illness,
    past_medical_history, physical_examination, clinical_assessment,
    primary_diagnosis, secondary_diagnoses, treatment_plan,
    follow_up_date, referral_notes, sign_immediately
  } = req.body;

  if (!visit_id || !patient_id || !presenting_complaint || !history_of_present_illness || !physical_examination || !clinical_assessment || !primary_diagnosis || !treatment_plan) {
    res.status(400).json({ error: 'Presenting complaint, history, physical exam, assessment, primary diagnosis, and treatment plan are required.' });
    return;
  }

  // Check if consultation exists
  const existing = db.prepare('SELECT * FROM consultations WHERE visit_id = ?').get(visit_id) as any;
  const now = new Date().toISOString();

  if (existing) {
    if (existing.is_signed === 1) {
      res.status(403).json({
        error: 'This consultation note is already signed and locked. You must use the Addendum / Amendment feature to append verified clinical corrections.'
      });
      return;
    }

    const isSigned = sign_immediately ? 1 : 0;
    const signedAt = sign_immediately ? now : null;
    const signedBy = sign_immediately ? (req.user?.id || null) : null;

    (db.prepare(`
      UPDATE consultations SET
        presenting_complaint = ?, history_of_present_illness = ?, past_medical_history = ?,
        physical_examination = ?, clinical_assessment = ?, primary_diagnosis = ?,
        secondary_diagnoses = ?, treatment_plan = ?, follow_up_date = ?, referral_notes = ?,
        is_signed = ?, signed_at = ?, signed_by = ?, updated_at = ?
      WHERE id = ?
    `) as any).run(
      presenting_complaint, history_of_present_illness, past_medical_history || null,
      physical_examination, clinical_assessment, primary_diagnosis,
      secondary_diagnoses || null, treatment_plan, follow_up_date || null, referral_notes || null,
      isSigned, signedAt, signedBy, now, existing.id
    );

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: sign_immediately ? 'CONSULTATION_SIGNED' : 'CONSULTATION_DRAFT_UPDATED',
      entityType: 'consultation',
      entityId: existing.id,
      outcome: 'SUCCESS',
      details: { visit_id, primary_diagnosis, is_signed: isSigned }
    });

    const updated = db.prepare('SELECT * FROM consultations WHERE id = ?').get(existing.id);
    res.json({ consultation: updated });
    return;
  }

  const id = `cons_${crypto.randomUUID().slice(0, 8)}`;
  const isSigned = sign_immediately ? 1 : 0;
  const signedAt = sign_immediately ? now : null;
  const signedBy = sign_immediately ? (req.user?.id || null) : null;

  (db.prepare(`
    INSERT INTO consultations (
      id, visit_id, patient_id, doctor_id, presenting_complaint,
      history_of_present_illness, past_medical_history, physical_examination,
      clinical_assessment, primary_diagnosis, secondary_diagnoses, treatment_plan,
      follow_up_date, referral_notes, is_signed, signed_at, signed_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `) as any).run(
    id, visit_id, patient_id, req.user?.id || null, presenting_complaint,
    history_of_present_illness, past_medical_history || null, physical_examination,
    clinical_assessment, primary_diagnosis, secondary_diagnoses || null, treatment_plan,
    follow_up_date || null, referral_notes || null, isSigned, signedAt, signedBy, now, now
  );

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: sign_immediately ? 'CONSULTATION_CREATED_AND_SIGNED' : 'CONSULTATION_DRAFT_CREATED',
    entityType: 'consultation',
    entityId: id,
    outcome: 'SUCCESS',
    details: { visit_id, patient_id, primary_diagnosis }
  });

  const created = db.prepare('SELECT * FROM consultations WHERE id = ?').get(id);
  res.status(201).json({ consultation: created });
});

// Sign & Lock Consultation Record
router.post('/:id/sign', requireAuth, requireRoles('doctor', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const cons = db.prepare('SELECT * FROM consultations WHERE id = ?').get(id) as any;
  if (!cons) {
    res.status(404).json({ error: 'Consultation record not found.' });
    return;
  }

  if (cons.is_signed === 1) {
    res.status(400).json({ error: 'Consultation is already signed.' });
    return;
  }

  const now = new Date().toISOString();
  (db.prepare('UPDATE consultations SET is_signed = 1, signed_at = ?, signed_by = ?, updated_at = ? WHERE id = ?') as any)
    .run(now, req.user?.id || null, now, id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'CONSULTATION_LOCKED_AND_SIGNED',
    entityType: 'consultation',
    entityId: id,
    outcome: 'SUCCESS',
    details: { doctor: req.user?.full_name, signed_at: now }
  });

  res.json({ message: 'Consultation record locked and signed authoritatively.' });
});

// Append Audited Clinical Addendum / Amendment
router.post('/:id/amend', requireAuth, requireRoles('doctor', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { amendment_reason, amended_content } = req.body;

  if (!amendment_reason || !amended_content) {
    res.status(400).json({ error: 'Amendment reason and amended clinical content are mandatory.' });
    return;
  }

  const cons = db.prepare('SELECT * FROM consultations WHERE id = ?').get(id) as any;
  if (!cons) {
    res.status(404).json({ error: 'Consultation record not found.' });
    return;
  }

  const amdId = `amd_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  // Snapshot original content
  const originalSnapshot = JSON.stringify({
    primary_diagnosis: cons.primary_diagnosis,
    clinical_assessment: cons.clinical_assessment,
    treatment_plan: cons.treatment_plan
  });

  (db.prepare(`
    INSERT INTO clinical_amendments (
      id, consultation_id, amended_by, amendment_reason, original_content, amended_content, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `) as any).run(amdId, id, req.user?.id || null, amendment_reason, originalSnapshot, amended_content, now);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'CLINICAL_RECORD_AMENDED',
    entityType: 'consultation',
    entityId: id,
    outcome: 'SUCCESS',
    details: { amendmentId: amdId, reason: amendment_reason }
  });

  const created = db.prepare(`
    SELECT a.*, u.full_name as amended_by_name
    FROM clinical_amendments a
    LEFT JOIN staff_users u ON u.id = a.amended_by
    WHERE a.id = ?
  `).get(amdId);

  res.status(201).json({ amendment: created });
});

export default router;

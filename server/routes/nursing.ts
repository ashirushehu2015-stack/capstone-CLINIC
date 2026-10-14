import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// Get Vitals for a Visit
router.get('/vitals/:visitId', requireAuth, (req: AuthRequest, res: Response) => {
  const vitals = db.prepare(`
    SELECT vs.*, u.full_name as recorded_by_name
    FROM vital_signs vs
    LEFT JOIN staff_users u ON u.id = vs.recorded_by
    WHERE vs.visit_id = ?
    ORDER BY vs.created_at DESC
  `).all(req.params.visitId);

  res.json({ vitals });
});

// Record Nursing Vitals & Triage (Nurses, Doctors)
router.post('/vitals', requireAuth, requireRoles('nurse', 'doctor', 'admin'), (req: AuthRequest, res: Response) => {
  const {
    visit_id, patient_id, bp_systolic, bp_diastolic, pulse_rate,
    temperature, respiratory_rate, oxygen_saturation, weight_kg, height_cm,
    pain_score, clinical_notes, transition_to_consultation
  } = req.body;

  if (!visit_id || !patient_id || !bp_systolic || !bp_diastolic || !pulse_rate || !temperature || !respiratory_rate || !oxygen_saturation) {
    res.status(400).json({ error: 'All core vital signs (BP systolic/diastolic, pulse, temperature, respiratory rate, SpO2) are mandatory.' });
    return;
  }

  // Plausible Range Validations
  if (bp_systolic < 50 || bp_systolic > 260 || bp_diastolic < 30 || bp_diastolic > 160) {
    res.status(400).json({ error: 'Blood pressure readings are outside clinically plausible human physiological limits.' });
    return;
  }
  if (pulse_rate < 30 || pulse_rate > 220) {
    res.status(400).json({ error: 'Pulse rate must be between 30 and 220 bpm.' });
    return;
  }
  if (temperature < 34.0 || temperature > 43.0) {
    res.status(400).json({ error: 'Body temperature must be between 34.0°C and 43.0°C.' });
    return;
  }
  if (oxygen_saturation < 50 || oxygen_saturation > 100) {
    res.status(400).json({ error: 'Oxygen saturation must be between 50% and 100%.' });
    return;
  }

  // Calculate BMI if weight and height provided
  let bmi: number | null = null;
  if (weight_kg && height_cm && height_cm > 0) {
    const heightM = height_cm / 100;
    bmi = Number((weight_kg / (heightM * heightM)).toFixed(1));
  }

  // Abnormal Flags Assessment
  const isAbnormal = (
    bp_systolic >= 140 || bp_systolic <= 90 ||
    bp_diastolic >= 90 || bp_diastolic <= 60 ||
    temperature >= 38.0 || temperature <= 35.5 ||
    pulse_rate >= 100 || pulse_rate <= 55 ||
    oxygen_saturation < 95
  ) ? 1 : 0;

  const id = `vit_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  (db.prepare(`
    INSERT INTO vital_signs (
      id, visit_id, patient_id, bp_systolic, bp_diastolic, pulse_rate, temperature,
      respiratory_rate, oxygen_saturation, weight_kg, height_cm, bmi, pain_score,
      clinical_notes, is_abnormal, recorded_by, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `) as any).run(
    id, visit_id, patient_id, bp_systolic, bp_diastolic, pulse_rate, temperature,
    respiratory_rate, oxygen_saturation, weight_kg || null, height_cm || null,
    bmi, pain_score || 0, clinical_notes || null, isAbnormal, req.user?.id || null, now
  );

  // If transition requested or if currently in triage, move visit stage to consultation
  if (transition_to_consultation) {
    db.prepare("UPDATE patient_visits SET stage = 'consultation', updated_at = ? WHERE id = ?").run(now, visit_id);
  }

  // If critical vitals, also create internal notification for doctors
  if (isAbnormal) {
    db.prepare(`
      INSERT INTO internal_notifications (
        id, target_role, title, message, priority, reference_type, reference_id, is_read, created_at
      ) VALUES (?, 'doctor', 'Abnormal Vitals Alert', ?, 'urgent', 'visit', ?, 0, ?)
    `).run(
      `notif_${crypto.randomUUID().slice(0, 8)}`,
      `Patient visit has critical triage observations: BP ${bp_systolic}/${bp_diastolic}, Temp ${temperature}°C, SpO2 ${oxygen_saturation}%.`,
      visit_id,
      now
    );
  }

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'VITALS_RECORDED',
    entityType: 'vital_signs',
    entityId: id,
    outcome: 'SUCCESS',
    details: { visit_id, patient_id, bp: `${bp_systolic}/${bp_diastolic}`, temperature, isAbnormal }
  });

  const created = db.prepare(`
    SELECT vs.*, u.full_name as recorded_by_name
    FROM vital_signs vs
    LEFT JOIN staff_users u ON u.id = vs.recorded_by
    WHERE vs.id = ?
  `).get(id);

  res.status(201).json({ vitals: created });
});

export default router;

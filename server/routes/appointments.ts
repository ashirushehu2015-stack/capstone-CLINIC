import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// List Appointments
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const date = req.query.date as string;
  const status = req.query.status as string;
  const clinicianId = req.query.clinicianId as string;

  let sql = `
    SELECT a.*, p.patient_no, p.full_name as patient_name, p.phone as patient_phone,
           p.dob, p.age, p.sex, u.full_name as clinician_name, c.full_name as created_by_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN staff_users u ON u.id = a.clinician_id
    LEFT JOIN staff_users c ON c.id = a.created_by
    WHERE 1=1
  `;
  const params: any[] = [];

  if (date) {
    sql += ' AND a.appointment_date = ?';
    params.push(date);
  }

  if (status && status !== 'all') {
    sql += ' AND a.status = ?';
    params.push(status);
  }

  if (clinicianId) {
    sql += ' AND a.clinician_id = ?';
    params.push(clinicianId);
  }

  sql += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

  const appointments = db.prepare(sql).all(...params);
  res.json({ appointments });
});

// Create / Schedule Appointment
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const { patient_id, clinician_id, appointment_date, appointment_time, department, reason } = req.body;

  if (!patient_id || !clinician_id || !appointment_date || !appointment_time || !department || !reason) {
    res.status(400).json({ error: 'Patient, clinician, appointment date, time, department, and reason are required.' });
    return;
  }

  // Conflict detection: verify doctor doesn't already have an appointment at the exact same date & time
  const conflict = db.prepare(`
    SELECT a.id, a.appointment_time, p.full_name as patient_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.clinician_id = ? AND a.appointment_date = ? AND a.appointment_time = ? AND a.status = 'scheduled'
  `).get(clinician_id, appointment_date, appointment_time) as any;

  if (conflict) {
    res.status(409).json({
      error: `Clinician is already booked at ${appointment_time} on ${appointment_date} with patient ${conflict.patient_name}. Please choose another time slot.`
    });
    return;
  }

  const id = `apt_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  (db.prepare(`
    INSERT INTO appointments (
      id, patient_id, clinician_id, appointment_date, appointment_time, department, reason, status, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?, ?, ?)
  `) as any).run(id, patient_id, clinician_id, appointment_date, appointment_time, department, reason, req.user?.id || null, now, now);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'APPOINTMENT_SCHEDULED',
    entityType: 'appointment',
    entityId: id,
    outcome: 'SUCCESS',
    details: { patient_id, clinician_id, appointment_date, appointment_time }
  });

  const created = db.prepare(`
    SELECT a.*, p.patient_no, p.full_name as patient_name, u.full_name as clinician_name
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN staff_users u ON u.id = a.clinician_id
    WHERE a.id = ?
  `).get(id);

  res.status(201).json({ appointment: created });
});

// Update Appointment Status (Check-in, Reschedule, Cancel)
router.patch('/:id/status', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status, cancellation_reason, new_date, new_time } = req.body;

  const validStatuses = ['scheduled', 'checked_in', 'completed', 'cancelled', 'rescheduled'];
  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const apt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id) as any;
  if (!apt) {
    res.status(404).json({ error: 'Appointment not found.' });
    return;
  }

  const now = new Date().toISOString();

  if (status === 'rescheduled') {
    if (!new_date || !new_time) {
      res.status(400).json({ error: 'New date and new time are required when rescheduling.' });
      return;
    }
    db.prepare(`
      UPDATE appointments SET appointment_date = ?, appointment_time = ?, status = 'scheduled', updated_at = ? WHERE id = ?
    `).run(new_date, new_time, now, id);
  } else {
    db.prepare(`
      UPDATE appointments SET status = ?, cancellation_reason = ?, updated_at = ? WHERE id = ?
    `).run(status, cancellation_reason || null, now, id);
  }

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: `APPOINTMENT_${status.toUpperCase()}`,
    entityType: 'appointment',
    entityId: id,
    outcome: 'SUCCESS',
    details: { oldStatus: apt.status, newStatus: status, cancellation_reason, new_date, new_time }
  });

  res.json({ message: `Appointment status updated to ${status}.` });
});

export default router;

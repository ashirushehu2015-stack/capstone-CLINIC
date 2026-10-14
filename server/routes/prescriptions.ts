import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// List Prescriptions
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const status = req.query.status as string;
  const visitId = req.query.visitId as string;

  let sql = `
    SELECT pr.*, p.patient_no, p.full_name as patient_name, p.dob, p.age, p.sex,
           p.allergies, p.medical_alerts, u.full_name as doctor_name, v.visit_no
    FROM prescriptions pr
    JOIN patients p ON p.id = pr.patient_id
    JOIN staff_users u ON u.id = pr.doctor_id
    JOIN patient_visits v ON v.id = pr.visit_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    sql += ' AND pr.status = ?';
    params.push(status);
  }

  if (visitId) {
    sql += ' AND pr.visit_id = ?';
    params.push(visitId);
  }

  sql += ' ORDER BY pr.created_at DESC';

  const prescriptions = db.prepare(sql).all(...params) as any[];

  for (const rx of prescriptions) {
    rx.items = db.prepare(`
      SELECT pi.*, m.stock_quantity as current_stock, m.batch_number, m.expiry_date
      FROM prescription_items pi
      JOIN medicines m ON m.id = pi.medicine_id
      WHERE pi.prescription_id = ?
    `).all(rx.id);
  }

  res.json({ prescriptions });
});

// Create Prescription (Doctors only)
router.post('/', requireAuth, requireRoles('doctor', 'admin'), (req: AuthRequest, res: Response) => {
  const { visit_id, patient_id, items } = req.body;

  if (!visit_id || !patient_id || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Visit ID, patient ID, and at least one medication item are required.' });
    return;
  }

  const currentYear = new Date().getFullYear();
  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM prescriptions WHERE prescription_no LIKE ?").get(`RX-${currentYear}-%`) as any;
  const nextSeq = (countRow.cnt || 0) + 1;
  const prescription_no = `RX-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  const rxId = `rx_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  try {
    db.exec('BEGIN TRANSACTION');

    (db.prepare(`
      INSERT INTO prescriptions (id, prescription_no, visit_id, patient_id, doctor_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
    `) as any).run(rxId, prescription_no, visit_id, patient_id, req.user?.id || null, now, now);

    const insItem = db.prepare(`
      INSERT INTO prescription_items (
        id, prescription_id, medicine_id, medicine_name, dosage, route,
        frequency, duration_days, quantity_prescribed, quantity_dispensed, unit_price, instructions, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 'pending')
    `);

    for (const itm of items) {
      const med = db.prepare('SELECT id, generic_name, brand_name, selling_price FROM medicines WHERE id = ?').get(itm.medicine_id) as any;
      if (!med) {
        throw new Error(`Medicine ${itm.medicine_id} not found in pharmacy catalogue.`);
      }

      const itemId = `rxi_${crypto.randomUUID().slice(0, 8)}`;
      const medName = `${med.generic_name} (${med.brand_name})`;

      insItem.run(
        itemId, rxId, med.id, medName, itm.dosage, itm.route || 'Oral',
        itm.frequency, parseInt(itm.duration_days, 10) || 5, parseInt(itm.quantity, 10) || 1,
        med.selling_price, itm.instructions || null
      );
    }

    // Auto-progress visit to pharmacy stage if currently at consultation
    db.prepare("UPDATE patient_visits SET stage = 'pharmacy', updated_at = ? WHERE id = ? AND stage = 'consultation'")
      .run(now, visit_id);

    // Notify pharmacy staff
    db.prepare(`
      INSERT INTO internal_notifications (
        id, target_role, title, message, priority, reference_type, reference_id, is_read, created_at
      ) VALUES (?, 'pharmacist', 'New Prescription Issued', ?, 'normal', 'prescription', ?, 0, ?)
    `).run(
      `notif_${crypto.randomUUID().slice(0, 8)}`,
      `Prescription ${prescription_no} issued for dispensing review.`,
      rxId,
      now
    );

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'PRESCRIPTION_CREATED',
      entityType: 'prescription',
      entityId: rxId,
      outcome: 'SUCCESS',
      details: { prescription_no, itemCount: items.length, visit_id }
    });

    res.status(201).json({ message: 'Prescription created successfully.', prescriptionId: rxId, prescription_no });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Dispense Prescription (Pharmacists only, with full stock movement ledger)
router.post('/:id/dispense', requireAuth, requireRoles('pharmacist', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { items_to_dispense, patient_notes } = req.body;

  const rx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) as any;
  if (!rx) {
    res.status(404).json({ error: 'Prescription not found.' });
    return;
  }

  if (rx.status === 'dispensed') {
    res.status(400).json({ error: 'This prescription has already been fully dispensed. Duplicate dispensing is prohibited.' });
    return;
  }
  if (rx.status === 'cancelled') {
    res.status(400).json({ error: 'Cannot dispense a cancelled prescription.' });
    return;
  }

  const rxItems = db.prepare('SELECT * FROM prescription_items WHERE prescription_id = ?').all(id) as any[];

  try {
    db.exec('BEGIN TRANSACTION');

    const now = new Date().toISOString();
    let allDispensed = true;

    for (const rxItem of rxItems) {
      // Find dispense request for this item if array supplied, otherwise dispense full prescribed qty
      let dispenseQty = rxItem.quantity_prescribed - rxItem.quantity_dispensed;
      if (items_to_dispense && Array.isArray(items_to_dispense)) {
        const found = items_to_dispense.find((d: any) => d.item_id === rxItem.id);
        if (found) {
          dispenseQty = Math.min(dispenseQty, parseInt(found.quantity, 10));
        } else {
          dispenseQty = 0;
        }
      }

      if (dispenseQty <= 0) {
        if (rxItem.quantity_dispensed < rxItem.quantity_prescribed) {
          allDispensed = false;
        }
        continue;
      }

      // Check stock availability
      const med = db.prepare('SELECT * FROM medicines WHERE id = ?').get(rxItem.medicine_id) as any;
      if (!med) {
        throw new Error(`Medicine ${rxItem.medicine_name} not found.`);
      }

      if (med.stock_quantity < dispenseQty) {
        throw new Error(
          `Insufficient stock for ${med.generic_name} (${med.brand_name}). In stock: ${med.stock_quantity}, Requested: ${dispenseQty}.`
        );
      }

      // Deduct stock from medicine
      const newStock = med.stock_quantity - dispenseQty;
      db.prepare('UPDATE medicines SET stock_quantity = ?, updated_at = ? WHERE id = ?').run(newStock, now, med.id);

      // Create Stock Movement Ledger entry
      const countMov = db.prepare("SELECT COUNT(*) as cnt FROM stock_movements").get() as any;
      const movSeq = (countMov.cnt || 0) + 1;
      const movement_no = `SM-2026-${String(movSeq).padStart(4, '0')}`;
      const movId = `mov_${crypto.randomUUID().slice(0, 8)}`;

      (db.prepare(`
        INSERT INTO stock_movements (
          id, movement_no, medicine_id, transaction_type, quantity, balance_before,
          balance_after, unit_cost, reference_id, batch_number, reason, performed_by, created_at
        ) VALUES (?, ?, ?, 'dispense', ?, ?, ?, ?, ?, ?, 'Prescription dispensing', ?, ?)
      `) as any).run(
        movId, movement_no, med.id, -dispenseQty, med.stock_quantity, newStock,
        med.selling_price, rx.id, med.batch_number, req.user?.id || null, now
      );

      // Record dispensing item record
      const dispId = `disp_${crypto.randomUUID().slice(0, 8)}`;
      (db.prepare(`
        INSERT INTO dispensing_records (
          id, prescription_id, prescription_item_id, medicine_id, quantity_dispensed,
          batch_number, dispensed_by, patient_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `) as any).run(dispId, rx.id, rxItem.id, med.id, dispenseQty, med.batch_number, req.user?.id || null, patient_notes || null, now);

      // Update prescription item quantity dispensed
      const updatedItemDispensed = rxItem.quantity_dispensed + dispenseQty;
      const itemStatus = updatedItemDispensed >= rxItem.quantity_prescribed ? 'dispensed' : 'pending';
      if (itemStatus !== 'dispensed') {
        allDispensed = false;
      }

      db.prepare('UPDATE prescription_items SET quantity_dispensed = ?, status = ? WHERE id = ?')
        .run(updatedItemDispensed, itemStatus, rxItem.id);
    }

    const finalRxStatus = allDispensed ? 'dispensed' : 'partially_dispensed';
    db.prepare('UPDATE prescriptions SET status = ?, updated_at = ? WHERE id = ?').run(finalRxStatus, now, id);

    // If fully dispensed and visit is in pharmacy, advance to billing or completion
    if (finalRxStatus === 'dispensed') {
      db.prepare("UPDATE patient_visits SET stage = 'billing', updated_at = ? WHERE id = ? AND stage = 'pharmacy'")
        .run(now, rx.visit_id);
    }

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'PRESCRIPTION_DISPENSED',
      entityType: 'prescription',
      entityId: id,
      outcome: 'SUCCESS',
      details: { prescription_no: rx.prescription_no, finalRxStatus }
    });

    res.json({ message: `Medications successfully dispensed (${finalRxStatus}). Stock balances updated.` });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Cancel Prescription
router.post('/:id/cancel', requireAuth, requireRoles('doctor', 'pharmacist', 'admin'), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason) {
    res.status(400).json({ error: 'Documented cancellation reason is mandatory.' });
    return;
  }

  const rx = db.prepare('SELECT * FROM prescriptions WHERE id = ?').get(id) as any;
  if (!rx) {
    res.status(404).json({ error: 'Prescription not found.' });
    return;
  }

  if (rx.status === 'dispensed') {
    res.status(400).json({ error: 'Cannot cancel a prescription that has already been dispensed to the patient.' });
    return;
  }

  const now = new Date().toISOString();
  db.prepare("UPDATE prescriptions SET status = 'cancelled', cancellation_reason = ?, updated_at = ? WHERE id = ?")
    .run(reason, now, id);

  db.prepare("UPDATE prescription_items SET status = 'cancelled' WHERE prescription_id = ?").run(id);

  logAuditEvent({
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role,
    action: 'PRESCRIPTION_CANCELLED',
    entityType: 'prescription',
    entityId: id,
    outcome: 'SUCCESS',
    details: { prescription_no: rx.prescription_no, reason }
  });

  res.json({ message: 'Prescription marked as cancelled.' });
});

export default router;

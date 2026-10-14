import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// Get Service Catalog
router.get('/services', requireAuth, (req: AuthRequest, res: Response) => {
  const services = db.prepare('SELECT * FROM service_catalog WHERE is_active = 1 ORDER BY category ASC, name ASC').all();
  res.json({ services });
});

// Add/Update Service in Catalog (Admin, Accountant)
router.post('/services', requireAuth, requireRoles('accountant', 'admin'), (req: AuthRequest, res: Response) => {
  const { code, name, category, price, description } = req.body;

  if (!code || !name || !category || price === undefined) {
    res.status(400).json({ error: 'Code, name, category, and price are required.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM service_catalog WHERE LOWER(code) = LOWER(?)').get(code) as any;
  if (existing) {
    db.prepare('UPDATE service_catalog SET name = ?, category = ?, price = ?, description = ? WHERE id = ?')
      .run(name, category, parseFloat(price), description || null, existing.id);
    res.json({ message: 'Service updated.' });
    return;
  }

  const id = `srv_${crypto.randomUUID().slice(0, 8)}`;
  db.prepare(`
    INSERT INTO service_catalog (id, code, name, category, price, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(id, code.toUpperCase(), name, category, parseFloat(price), description || null);

  res.status(201).json({ message: 'Service created.', id });
});

// List Invoices
router.get('/invoices', requireAuth, (req: AuthRequest, res: Response) => {
  const status = req.query.status as string;
  const patientId = req.query.patientId as string;
  const visitId = req.query.visitId as string;

  let sql = `
    SELECT inv.*, p.patient_no, p.full_name as patient_name, p.phone as patient_phone,
           u.full_name as generated_by_name, v.visit_no
    FROM invoices inv
    JOIN patients p ON p.id = inv.patient_id
    JOIN staff_users u ON u.id = inv.generated_by
    JOIN patient_visits v ON v.id = inv.visit_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    sql += ' AND inv.status = ?';
    params.push(status);
  }

  if (patientId) {
    sql += ' AND inv.patient_id = ?';
    params.push(patientId);
  }

  if (visitId) {
    sql += ' AND inv.visit_id = ?';
    params.push(visitId);
  }

  sql += ' ORDER BY inv.created_at DESC';

  const invoices = db.prepare(sql).all(...params) as any[];

  for (const inv of invoices) {
    inv.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(inv.id);
    inv.payments = db.prepare(`
      SELECT p.*, c.full_name as cashier_name
      FROM payments p
      JOIN staff_users c ON c.id = p.cashier_id
      WHERE p.invoice_id = ?
    `).all(inv.id);
  }

  res.json({ invoices });
});

// Auto-generate invoice from visit services, lab investigations, and pharmacy prescriptions
router.post('/invoices/auto-generate', requireAuth, requireRoles('accountant', 'admin', 'receptionist'), (req: AuthRequest, res: Response) => {
  const { visit_id } = req.body;

  if (!visit_id) {
    res.status(400).json({ error: 'Visit ID is required.' });
    return;
  }

  const visit = db.prepare('SELECT * FROM patient_visits WHERE id = ?').get(visit_id) as any;
  if (!visit) {
    res.status(404).json({ error: 'Visit not found.' });
    return;
  }

  // Check if invoice already exists for this visit
  const existingInv = db.prepare('SELECT * FROM invoices WHERE visit_id = ? AND status != "reversed"').get(visit_id) as any;
  if (existingInv) {
    res.json({ message: 'Invoice already exists for this visit.', invoice: existingInv });
    return;
  }

  const itemsToBill: Array<{ type: string; refId: string; description: string; qty: number; unitPrice: number; total: number }> = [];

  // 1. General Consultation fee
  const consultService = db.prepare('SELECT * FROM service_catalog WHERE code = "CONS-GP"').get() as any;
  if (consultService) {
    itemsToBill.push({
      type: 'service',
      refId: consultService.id,
      description: consultService.name,
      qty: 1,
      unitPrice: consultService.price,
      total: consultService.price
    });
  }

  // 2. Triage fee
  const triageService = db.prepare('SELECT * FROM service_catalog WHERE code = "TRIAGE-STD"').get() as any;
  if (triageService) {
    itemsToBill.push({
      type: 'service',
      refId: triageService.id,
      description: triageService.name,
      qty: 1,
      unitPrice: triageService.price,
      total: triageService.price
    });
  }

  // 3. Lab tests for this visit
  const labTests = db.prepare(`
    SELECT lt.* FROM laboratory_tests lt
    JOIN laboratory_requests lr ON lr.id = lt.request_id
    WHERE lr.visit_id = ?
  `).all(visit_id) as any[];

  for (const lt of labTests) {
    itemsToBill.push({
      type: 'lab_test',
      refId: lt.id,
      description: `Lab Test: ${lt.test_name}`,
      qty: 1,
      unitPrice: lt.price || 3500.00,
      total: lt.price || 3500.00
    });
  }

  // 4. Prescriptions items
  const rxItems = db.prepare(`
    SELECT pi.* FROM prescription_items pi
    JOIN prescriptions pr ON pr.id = pi.prescription_id
    WHERE pr.visit_id = ? AND pi.status != 'cancelled'
  `).all(visit_id) as any[];

  for (const rxi of rxItems) {
    const total = rxi.quantity_prescribed * rxi.unit_price;
    itemsToBill.push({
      type: 'medicine',
      refId: rxi.id,
      description: `Medication: ${rxi.medicine_name} (${rxi.quantity_prescribed} units)`,
      qty: rxi.quantity_prescribed,
      unitPrice: rxi.unit_price,
      total: total
    });
  }

  const subtotal = itemsToBill.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal;
  const balanceDue = totalAmount;

  const currentYear = new Date().getFullYear();
  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM invoices WHERE invoice_no LIKE ?").get(`INV-${currentYear}-%`) as any;
  const nextSeq = (countRow.cnt || 0) + 1;
  const invoice_no = `INV-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  const invId = `inv_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  try {
    db.exec('BEGIN TRANSACTION');

    (db.prepare(`
      INSERT INTO invoices (
        id, invoice_no, visit_id, patient_id, subtotal, discount, tax,
        total_amount, paid_amount, balance_due, status, notes, generated_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, 0, ?, 'unpaid', 'Aggregated clinic invoice', ?, ?, ?)
    `) as any).run(invId, invoice_no, visit_id, visit.patient_id, subtotal, totalAmount, balanceDue, req.user?.id || null, now, now);

    const insItem = db.prepare(`
      INSERT INTO invoice_items (id, invoice_id, item_type, reference_id, description, quantity, unit_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const itm of itemsToBill) {
      const itmId = `invi_${crypto.randomUUID().slice(0, 8)}`;
      insItem.run(itmId, invId, itm.type, itm.refId, itm.description, itm.qty, itm.unitPrice, itm.total);
    }

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'INVOICE_GENERATED',
      entityType: 'invoice',
      entityId: invId,
      outcome: 'SUCCESS',
      details: { invoice_no, totalAmount, visit_id }
    });

    res.status(201).json({ message: 'Invoice generated successfully.', invoiceId: invId, invoice_no });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Process Payment / Cashiering (Accountant, Cashier, Admin)
router.post('/payments', requireAuth, requireRoles('accountant', 'admin'), (req: AuthRequest, res: Response) => {
  const { invoice_id, amount, payment_method, transaction_reference, notes } = req.body;

  if (!invoice_id || amount === undefined || amount <= 0 || !payment_method || !transaction_reference) {
    res.status(400).json({ error: 'Invoice ID, payment amount, payment method (cash/pos/bank_transfer), and transaction reference are required.' });
    return;
  }

  const validMethods = ['cash', 'pos', 'bank_transfer'];
  if (!validMethods.includes(payment_method)) {
    res.status(400).json({ error: `Payment method must be one of: ${validMethods.join(', ')}` });
    return;
  }

  const inv = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice_id) as any;
  if (!inv) {
    res.status(404).json({ error: 'Invoice not found.' });
    return;
  }

  if (inv.status === 'paid') {
    res.status(400).json({ error: 'This invoice has already been fully paid.' });
    return;
  }

  const payAmount = parseFloat(amount);
  if (payAmount > inv.balance_due + 0.01) {
    res.status(400).json({
      error: `Payment amount (₦${payAmount.toFixed(2)}) cannot exceed the outstanding balance due (₦${inv.balance_due.toFixed(2)}).`
    });
    return;
  }

  // Check unique transaction reference
  const existingRef = db.prepare('SELECT id FROM payments WHERE transaction_reference = ?').get(transaction_reference);
  if (existingRef) {
    res.status(409).json({ error: `Payment reference '${transaction_reference}' has already been processed. Duplicate financial transaction denied.` });
    return;
  }

  const currentYear = new Date().getFullYear();
  const countRow = db.prepare("SELECT COUNT(*) as cnt FROM payments WHERE payment_no LIKE ?").get(`REC-${currentYear}-%`) as any;
  const nextSeq = (countRow.cnt || 0) + 1;
  const payment_no = `REC-${currentYear}-${String(nextSeq).padStart(4, '0')}`;

  const payId = `pay_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const newPaidAmount = inv.paid_amount + payAmount;
  const newBalanceDue = Math.max(0, inv.total_amount - newPaidAmount);
  const newStatus = newBalanceDue <= 0.01 ? 'paid' : 'partially_paid';

  try {
    db.exec('BEGIN TRANSACTION');

    (db.prepare(`
      INSERT INTO payments (
        id, payment_no, invoice_id, patient_id, amount, payment_method,
        transaction_reference, cashier_id, status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)
    `) as any).run(
      payId, payment_no, inv.id, inv.patient_id, payAmount,
      payment_method, transaction_reference, req.user?.id || null, notes || null, now
    );

    db.prepare(`
      UPDATE invoices SET paid_amount = ?, balance_due = ?, status = ?, updated_at = ? WHERE id = ?
    `).run(newPaidAmount, newBalanceDue, newStatus, now, inv.id);

    // If fully paid, also update visit stage to completed if ready
    if (newStatus === 'paid') {
      db.prepare("UPDATE patient_visits SET stage = 'completed', checkout_at = ?, updated_at = ? WHERE id = ? AND stage = 'billing'")
        .run(now, now, inv.visit_id);
    }

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'PAYMENT_COLLECTED',
      entityType: 'payment',
      entityId: payId,
      outcome: 'SUCCESS',
      details: { payment_no, invoice_no: inv.invoice_no, amount: payAmount, method: payment_method, transaction_reference }
    });

    res.status(201).json({
      message: 'Payment recorded and official receipt issued.',
      payment_no,
      amount: payAmount,
      balance_due: newBalanceDue,
      invoice_status: newStatus
    });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Daily Cashier Reconciliation Report
router.get('/reconciliation', requireAuth, requireRoles('accountant', 'admin', 'manager'), (req: AuthRequest, res: Response) => {
  const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const summary = db.prepare(`
    SELECT payment_method, COUNT(*) as count, SUM(amount) as total_amount
    FROM payments
    WHERE date(created_at) = date(?) AND status = 'confirmed'
    GROUP BY payment_method
  `).all(date);

  const cashierBreakdown = db.prepare(`
    SELECT u.full_name as cashier_name, p.payment_method, COUNT(*) as count, SUM(p.amount) as total_amount
    FROM payments p
    JOIN staff_users u ON u.id = p.cashier_id
    WHERE date(p.created_at) = date(?) AND p.status = 'confirmed'
    GROUP BY u.id, p.payment_method
  `).all(date);

  const totalCollected = db.prepare(`
    SELECT SUM(amount) as grand_total, COUNT(*) as transaction_count
    FROM payments
    WHERE date(created_at) = date(?) AND status = 'confirmed'
  `).get(date) as any;

  res.json({
    date,
    grandTotal: totalCollected.grand_total || 0,
    transactionCount: totalCollected.transaction_count || 0,
    summary,
    cashierBreakdown
  });
});

export default router;

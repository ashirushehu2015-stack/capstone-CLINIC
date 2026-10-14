import { Router, Response } from 'express';
import crypto from 'node:crypto';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';
import { logAuditEvent } from '../audit.js';

const router = Router();

// Get Medicines Inventory
router.get('/inventory', requireAuth, (req: AuthRequest, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  const category = req.query.category as string;
  const lowStockOnly = req.query.lowStock === 'true';
  const expiringOnly = req.query.expiring === 'true';

  let sql = 'SELECT * FROM medicines WHERE is_active = 1';
  const params: any[] = [];

  if (query) {
    sql += ' AND (LOWER(generic_name) LIKE ? OR LOWER(brand_name) LIKE ? OR LOWER(code) LIKE ?)';
    params.push(`%${query}%`, `%${query}%`, `%${query}%`);
  }

  if (category && category !== 'all') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (lowStockOnly) {
    sql += ' AND stock_quantity <= reorder_level';
  }

  if (expiringOnly) {
    // Within 90 days
    const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    sql += ' AND expiry_date <= ?';
    params.push(ninetyDays);
  }

  sql += ' ORDER BY generic_name ASC';

  const medicines = db.prepare(sql).all(...params);
  res.json({ medicines });
});

// Add New Medicine to Catalogue (Pharmacist, Admin)
router.post('/inventory', requireAuth, requireRoles('pharmacist', 'admin'), (req: AuthRequest, res: Response) => {
  const {
    code, generic_name, brand_name, category, strength, dosage_form, unit,
    purchase_cost, selling_price, initial_stock, reorder_level,
    batch_number, expiry_date, supplier, location
  } = req.body;

  if (!code || !generic_name || !brand_name || !category || !strength || !dosage_form || !unit || purchase_cost === undefined || selling_price === undefined || !batch_number || !expiry_date || !supplier) {
    res.status(400).json({ error: 'All medicine specifications including code, names, batch, and expiry date are required.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM medicines WHERE LOWER(code) = LOWER(?)').get(code);
  if (existing) {
    res.status(409).json({ error: `A medicine with code ${code} already exists.` });
    return;
  }

  const id = `med_${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  const stockQty = parseInt(initial_stock, 10) || 0;
  const reorderLvl = parseInt(reorder_level, 10) || 20;

  try {
    db.exec('BEGIN TRANSACTION');

    db.prepare(`
      INSERT INTO medicines (
        id, code, generic_name, brand_name, category, strength, dosage_form, unit,
        purchase_cost, selling_price, stock_quantity, reorder_level, batch_number,
        expiry_date, supplier, location, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).run(
      id, code.toUpperCase(), generic_name, brand_name, category, strength, dosage_form, unit,
      parseFloat(purchase_cost), parseFloat(selling_price), stockQty, reorderLvl,
      batch_number, expiry_date, supplier, location || 'Main Pharmacy', now, now
    );

    if (stockQty > 0) {
      const countMov = db.prepare("SELECT COUNT(*) as cnt FROM stock_movements").get() as any;
      const movSeq = (countMov.cnt || 0) + 1;
      const movId = `mov_${crypto.randomUUID().slice(0, 8)}`;
      (db.prepare(`
        INSERT INTO stock_movements (
          id, movement_no, medicine_id, transaction_type, quantity, balance_before,
          balance_after, unit_cost, reference_id, batch_number, reason, performed_by, created_at
        ) VALUES (?, ?, ?, 'receipt', ?, 0, ?, ?, 'INITIAL_FORMULARY_ENTRY', ?, 'Initial stock setup', ?, ?)
      `) as any).run(
        movId, `SM-2026-${String(movSeq).padStart(4, '0')}`, id, stockQty,
        stockQty, parseFloat(purchase_cost), batch_number, req.user?.id || null, now
      );
    }

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'MEDICINE_CATALOGUE_ADDED',
      entityType: 'medicine',
      entityId: id,
      outcome: 'SUCCESS',
      details: { code, generic_name, brand_name, stockQty }
    });

    const created = db.prepare('SELECT * FROM medicines WHERE id = ?').get(id);
    res.status(201).json({ medicine: created });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Record Stock Receipt from Supplier (Increases stock transactionally)
router.post('/stock-receipt', requireAuth, requireRoles('pharmacist', 'admin'), (req: AuthRequest, res: Response) => {
  const { medicine_id, quantity, unit_cost, batch_number, expiry_date, supplier, invoice_reference } = req.body;

  if (!medicine_id || !quantity || quantity <= 0 || !batch_number || !expiry_date) {
    res.status(400).json({ error: 'Medicine, positive quantity, batch number, and expiry date are required.' });
    return;
  }

  const med = db.prepare('SELECT * FROM medicines WHERE id = ?').get(medicine_id) as any;
  if (!med) {
    res.status(404).json({ error: 'Medicine not found.' });
    return;
  }

  const qty = parseInt(quantity, 10);
  const now = new Date().toISOString();
  const newStock = med.stock_quantity + qty;

  try {
    db.exec('BEGIN TRANSACTION');

    db.prepare(`
      UPDATE medicines SET
        stock_quantity = ?, batch_number = ?, expiry_date = ?,
        purchase_cost = ?, supplier = ?, updated_at = ?
      WHERE id = ?
    `).run(newStock, batch_number, expiry_date, unit_cost ? parseFloat(unit_cost) : med.purchase_cost, supplier || med.supplier, now, medicine_id);

    const countMov = db.prepare("SELECT COUNT(*) as cnt FROM stock_movements").get() as any;
    const movSeq = (countMov.cnt || 0) + 1;
    const movId = `mov_${crypto.randomUUID().slice(0, 8)}`;

    (db.prepare(`
      INSERT INTO stock_movements (
        id, movement_no, medicine_id, transaction_type, quantity, balance_before,
        balance_after, unit_cost, reference_id, batch_number, reason, performed_by, created_at
      ) VALUES (?, ?, ?, 'receipt', ?, ?, ?, ?, ?, ?, 'Supplier delivery receipt', ?, ?)
    `) as any).run(
      movId, `SM-2026-${String(movSeq).padStart(4, '0')}`, medicine_id, qty,
      med.stock_quantity, newStock, unit_cost ? parseFloat(unit_cost) : med.purchase_cost,
      invoice_reference || 'DIRECT-PO', batch_number, req.user?.id || null, now
    );

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'STOCK_RECEIPT_RECORDED',
      entityType: 'stock_movement',
      entityId: movId,
      outcome: 'SUCCESS',
      details: { medicine: med.generic_name, quantity: qty, batch_number, newStock }
    });

    res.json({ message: `Successfully received ${qty} units. New stock balance: ${newStock}.` });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// Audited Stock Adjustment / Wastage
router.post('/stock-adjustment', requireAuth, requireRoles('pharmacist', 'admin'), (req: AuthRequest, res: Response) => {
  const { medicine_id, adjustment_type, quantity, reason } = req.body;

  if (!medicine_id || !adjustment_type || quantity === undefined || !reason) {
    res.status(400).json({ error: 'Medicine ID, adjustment type (breakage/expiry/count_correction), quantity, and reason are required.' });
    return;
  }

  const med = db.prepare('SELECT * FROM medicines WHERE id = ?').get(medicine_id) as any;
  if (!med) {
    res.status(404).json({ error: 'Medicine not found.' });
    return;
  }

  const qty = parseInt(quantity, 10);
  const now = new Date().toISOString();
  const newStock = med.stock_quantity + qty;

  if (newStock < 0) {
    res.status(400).json({ error: `Cannot reduce stock below zero. Current balance is ${med.stock_quantity}.` });
    return;
  }

  try {
    db.exec('BEGIN TRANSACTION');

    db.prepare('UPDATE medicines SET stock_quantity = ?, updated_at = ? WHERE id = ?').run(newStock, now, medicine_id);

    const countMov = db.prepare("SELECT COUNT(*) as cnt FROM stock_movements").get() as any;
    const movSeq = (countMov.cnt || 0) + 1;
    const movId = `mov_${crypto.randomUUID().slice(0, 8)}`;

    (db.prepare(`
      INSERT INTO stock_movements (
        id, movement_no, medicine_id, transaction_type, quantity, balance_before,
        balance_after, unit_cost, reference_id, batch_number, reason, performed_by, created_at
      ) VALUES (?, ?, ?, 'adjustment', ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `) as any).run(
      movId, `SM-2026-${String(movSeq).padStart(4, '0')}`, medicine_id, qty,
      med.stock_quantity, newStock, med.purchase_cost,
      `ADJ-${adjustment_type.toUpperCase()}`, med.batch_number,
      `[${adjustment_type}] ${reason}`, req.user?.id || null, now
    );

    db.exec('COMMIT');

    logAuditEvent({
      userId: req.user?.id,
      userEmail: req.user?.email,
      userRole: req.user?.role,
      action: 'STOCK_ADJUSTMENT_RECORDED',
      entityType: 'stock_movement',
      entityId: movId,
      outcome: 'SUCCESS',
      details: { medicine: med.generic_name, adjustment: qty, newStock, reason }
    });

    res.json({ message: `Stock adjusted by ${qty}. New balance: ${newStock}.` });
  } catch (err: any) {
    db.exec('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// View Stock Movement Ledger
router.get('/stock-movements', requireAuth, requireRoles('pharmacist', 'admin', 'manager', 'accountant'), (req: AuthRequest, res: Response) => {
  const medicineId = req.query.medicineId as string;
  const limit = Math.min(100, parseInt(req.query.limit as string || '50', 10));

  let sql = `
    SELECT sm.*, m.generic_name, m.brand_name, m.unit, u.full_name as performed_by_name
    FROM stock_movements sm
    JOIN medicines m ON m.id = sm.medicine_id
    LEFT JOIN staff_users u ON u.id = sm.performed_by
    WHERE 1=1
  `;
  const params: any[] = [];

  if (medicineId) {
    sql += ' AND sm.medicine_id = ?';
    params.push(medicineId);
  }

  sql += ' ORDER BY sm.created_at DESC LIMIT ?';
  params.push(limit);

  const movements = db.prepare(sql).all(...params);
  res.json({ movements });
});

// Stock Alerts (Low stock and near-expiry medicines)
router.get('/alerts', requireAuth, (req: AuthRequest, res: Response) => {
  const lowStock = db.prepare(`
    SELECT id, code, generic_name, brand_name, category, stock_quantity, reorder_level, unit
    FROM medicines
    WHERE is_active = 1 AND stock_quantity <= reorder_level
    ORDER BY stock_quantity ASC
  `).all();

  const ninetyDays = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const expiringSoon = db.prepare(`
    SELECT id, code, generic_name, brand_name, category, batch_number, expiry_date, stock_quantity, unit
    FROM medicines
    WHERE is_active = 1 AND expiry_date <= ?
    ORDER BY expiry_date ASC
  `).all(ninetyDays);

  res.json({ lowStock, expiringSoon });
});

export default router;

import { Router, Response } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRoles, AuthRequest } from '../auth.js';

const router = Router();

// Clinic Dashboard Metrics (Real calculated database counts, respecting permissions)
router.get('/dashboard', requireAuth, (req: AuthRequest, res: Response) => {
  const role = req.user?.role || '';
  const today = new Date().toISOString().split('T')[0];

  // Base clinical counts
  const totalPatients = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE status = 'active'").get() as any).c;
  const patientsToday = (db.prepare("SELECT COUNT(*) as c FROM patients WHERE date(created_at) = date(?)").get(today) as any).c;
  const visitsToday = (db.prepare("SELECT COUNT(*) as c FROM patient_visits WHERE date(visit_date) = date(?)").get(today) as any).c;

  const queueCounts = db.prepare(`
    SELECT stage, COUNT(*) as count
    FROM patient_visits
    WHERE stage != 'completed'
    GROUP BY stage
  `).all() as Array<{ stage: string; count: number }>;

  const waitingForConsultation = (db.prepare("SELECT COUNT(*) as c FROM patient_visits WHERE stage = 'consultation'").get() as any).c;
  const pendingLabRequests = (db.prepare("SELECT COUNT(*) as c FROM laboratory_requests WHERE status != 'completed' AND status != 'cancelled'").get() as any).c;
  const pendingPrescriptions = (db.prepare("SELECT COUNT(*) as c FROM prescriptions WHERE status = 'pending'").get() as any).c;
  const lowStockCount = (db.prepare("SELECT COUNT(*) as c FROM medicines WHERE is_active = 1 AND stock_quantity <= reorder_level").get() as any).c;

  const baseMetrics: any = {
    totalPatients,
    patientsToday,
    visitsToday,
    waitingForConsultation,
    pendingLabRequests,
    pendingPrescriptions,
    lowStockCount,
    queueCounts
  };

  // Financial Metrics: strictly permission-gated (accountant, manager, admin only)
  if (['accountant', 'manager', 'admin'].includes(role)) {
    const todayRevenue = (db.prepare(`
      SELECT SUM(amount) as s FROM payments WHERE date(created_at) = date(?) AND status = 'confirmed'
    `).get(today) as any).s || 0;

    const outstandingBalance = (db.prepare(`
      SELECT SUM(balance_due) as s FROM invoices WHERE status IN ('unpaid', 'partially_paid')
    `).get() as any).s || 0;

    const totalCollectedMonth = (db.prepare(`
      SELECT SUM(amount) as s FROM payments WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now') AND status = 'confirmed'
    `).get() as any).s || 0;

    baseMetrics.financial = {
      todayRevenue,
      outstandingBalance,
      totalCollectedMonth
    };
  }

  // Doctor-specific metrics
  if (role === 'doctor') {
    const myConsultationsToday = ((db.prepare(`
      SELECT COUNT(*) as c FROM consultations WHERE doctor_id = ? AND date(created_at) = date(?)
    `) as any).get(req.user?.id || '', today) as any).c;
    baseMetrics.myConsultationsToday = myConsultationsToday;
  }

  // Nurse-specific metrics
  if (role === 'nurse') {
    const vitalsRecordedToday = ((db.prepare(`
      SELECT COUNT(*) as c FROM vital_signs WHERE recorded_by = ? AND date(created_at) = date(?)
    `) as any).get(req.user?.id || '', today) as any).c;
    baseMetrics.vitalsRecordedToday = vitalsRecordedToday;
  }

  // Lab-specific metrics
  if (role === 'lab_tech') {
    const unverifiedTests = (db.prepare(`
      SELECT COUNT(*) as c FROM laboratory_tests WHERE status IN ('sample_collected', 'analyzed')
    `).get() as any).c;
    baseMetrics.unverifiedTests = unverifiedTests;
  }

  res.json({ metrics: baseMetrics });
});

// Comprehensive Reports
router.get('/analytics', requireAuth, requireRoles('manager', 'admin', 'accountant'), (req: AuthRequest, res: Response) => {
  // Top Diagnoses
  const topDiagnoses = db.prepare(`
    SELECT primary_diagnosis, COUNT(*) as count
    FROM consultations
    GROUP BY primary_diagnosis
    ORDER BY count DESC
    LIMIT 5
  `).all();

  // Visits by stage
  const visitsByStage = db.prepare(`
    SELECT stage, COUNT(*) as count
    FROM patient_visits
    GROUP BY stage
  `).all();

  // Revenue by payment method
  const revenueByMethod = db.prepare(`
    SELECT payment_method, SUM(amount) as total, COUNT(*) as count
    FROM payments
    WHERE status = 'confirmed'
    GROUP BY payment_method
  `).all();

  // Stock inventory valuation
  const inventoryValuation = db.prepare(`
    SELECT SUM(stock_quantity * purchase_cost) as total_cost_value,
           SUM(stock_quantity * selling_price) as total_retail_value,
           COUNT(*) as active_medicines
    FROM medicines
    WHERE is_active = 1
  `).get() as any;

  res.json({
    topDiagnoses,
    visitsByStage,
    revenueByMethod,
    inventoryValuation
  });
});

export default router;

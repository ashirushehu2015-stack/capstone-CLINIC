import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const BACKUPS_DIR = path.resolve(DATA_DIR, 'backups');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR, { recursive: true });
}

export const DB_PATH = path.join(DATA_DIR, 'clinic.db');
export const db = new DatabaseSync(DB_PATH);

// Enforce foreign key constraints and enable WAL mode for high concurrency
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');

export function queryGet<T = any>(sql: string, ...params: any[]): T | undefined {
  return (db.prepare(sql) as any).get(...params);
}

export function queryAll<T = any>(sql: string, ...params: any[]): T[] {
  return (db.prepare(sql) as any).all(...params);
}

export function queryRun(sql: string, ...params: any[]): any {
  return (db.prepare(sql) as any).run(...params);
}

export function initDatabase() {
  db.exec(`
    -- Staff Users
    CREATE TABLE IF NOT EXISTS staff_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      department TEXT NOT NULL,
      phone TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      mfa_enabled INTEGER NOT NULL DEFAULT 0,
      mfa_secret TEXT,
      must_change_password INTEGER NOT NULL DEFAULT 0,
      failed_logins INTEGER NOT NULL DEFAULT 0,
      locked_until TEXT,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Authentication Sessions
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES staff_users(id) ON DELETE CASCADE,
      session_token TEXT UNIQUE NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      is_revoked INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Patients
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      patient_no TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      dob TEXT NOT NULL,
      age INTEGER NOT NULL,
      sex TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT NOT NULL,
      emergency_contact_name TEXT NOT NULL,
      emergency_contact_phone TEXT NOT NULL,
      emergency_contact_relation TEXT,
      blood_group TEXT,
      genotype TEXT,
      allergies TEXT,
      medical_alerts TEXT,
      preexisting_conditions TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      merged_into_patient_id TEXT REFERENCES patients(id),
      created_by TEXT NOT NULL REFERENCES staff_users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Patient Visits & Queue
    CREATE TABLE IF NOT EXISTS patient_visits (
      id TEXT PRIMARY KEY,
      visit_no TEXT UNIQUE NOT NULL,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      visit_date TEXT NOT NULL,
      stage TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'routine',
      visit_type TEXT NOT NULL DEFAULT 'outpatient',
      attending_doctor_id TEXT REFERENCES staff_users(id),
      checked_in_by TEXT NOT NULL REFERENCES staff_users(id),
      checkout_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Appointments
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id),
      clinician_id TEXT NOT NULL REFERENCES staff_users(id),
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      department TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      cancellation_reason TEXT,
      created_by TEXT NOT NULL REFERENCES staff_users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Vital Signs & Nursing Triage
    CREATE TABLE IF NOT EXISTS vital_signs (
      id TEXT PRIMARY KEY,
      visit_id TEXT NOT NULL REFERENCES patient_visits(id),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      bp_systolic INTEGER NOT NULL,
      bp_diastolic INTEGER NOT NULL,
      pulse_rate INTEGER NOT NULL,
      temperature REAL NOT NULL,
      respiratory_rate INTEGER NOT NULL,
      oxygen_saturation INTEGER NOT NULL,
      weight_kg REAL,
      height_cm REAL,
      bmi REAL,
      pain_score INTEGER,
      clinical_notes TEXT,
      is_abnormal INTEGER NOT NULL DEFAULT 0,
      recorded_by TEXT NOT NULL REFERENCES staff_users(id),
      created_at TEXT NOT NULL
    );

    -- Consultations (EMR)
    CREATE TABLE IF NOT EXISTS consultations (
      id TEXT PRIMARY KEY,
      visit_id TEXT UNIQUE NOT NULL REFERENCES patient_visits(id),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      doctor_id TEXT NOT NULL REFERENCES staff_users(id),
      presenting_complaint TEXT NOT NULL,
      history_of_present_illness TEXT NOT NULL,
      past_medical_history TEXT,
      physical_examination TEXT NOT NULL,
      clinical_assessment TEXT NOT NULL,
      primary_diagnosis TEXT NOT NULL,
      secondary_diagnoses TEXT,
      treatment_plan TEXT NOT NULL,
      follow_up_date TEXT,
      referral_notes TEXT,
      is_signed INTEGER NOT NULL DEFAULT 0,
      signed_at TEXT,
      signed_by TEXT REFERENCES staff_users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Clinical Amendments (Locked signed record audit)
    CREATE TABLE IF NOT EXISTS clinical_amendments (
      id TEXT PRIMARY KEY,
      consultation_id TEXT NOT NULL REFERENCES consultations(id),
      amended_by TEXT NOT NULL REFERENCES staff_users(id),
      amendment_reason TEXT NOT NULL,
      original_content TEXT NOT NULL,
      amended_content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Medicines & Inventory
    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      generic_name TEXT NOT NULL,
      brand_name TEXT NOT NULL,
      category TEXT NOT NULL,
      strength TEXT NOT NULL,
      dosage_form TEXT NOT NULL,
      unit TEXT NOT NULL,
      purchase_cost REAL NOT NULL,
      selling_price REAL NOT NULL,
      stock_quantity INTEGER NOT NULL DEFAULT 0,
      reorder_level INTEGER NOT NULL DEFAULT 20,
      batch_number TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      supplier TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT 'Main Pharmacy',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Stock Movement Ledger
    CREATE TABLE IF NOT EXISTS stock_movements (
      id TEXT PRIMARY KEY,
      movement_no TEXT UNIQUE NOT NULL,
      medicine_id TEXT NOT NULL REFERENCES medicines(id),
      transaction_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      balance_before INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      unit_cost REAL NOT NULL,
      reference_id TEXT,
      batch_number TEXT NOT NULL,
      reason TEXT NOT NULL,
      performed_by TEXT NOT NULL REFERENCES staff_users(id),
      created_at TEXT NOT NULL
    );

    -- Prescriptions
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      prescription_no TEXT UNIQUE NOT NULL,
      visit_id TEXT NOT NULL REFERENCES patient_visits(id),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      doctor_id TEXT NOT NULL REFERENCES staff_users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      cancellation_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Prescription Items
    CREATE TABLE IF NOT EXISTS prescription_items (
      id TEXT PRIMARY KEY,
      prescription_id TEXT NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
      medicine_id TEXT NOT NULL REFERENCES medicines(id),
      medicine_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      route TEXT NOT NULL,
      frequency TEXT NOT NULL,
      duration_days INTEGER NOT NULL,
      quantity_prescribed INTEGER NOT NULL,
      quantity_dispensed INTEGER NOT NULL DEFAULT 0,
      unit_price REAL NOT NULL,
      instructions TEXT,
      status TEXT NOT NULL DEFAULT 'pending'
    );

    -- Dispensing Records
    CREATE TABLE IF NOT EXISTS dispensing_records (
      id TEXT PRIMARY KEY,
      prescription_id TEXT NOT NULL REFERENCES prescriptions(id),
      prescription_item_id TEXT NOT NULL REFERENCES prescription_items(id),
      medicine_id TEXT NOT NULL REFERENCES medicines(id),
      quantity_dispensed INTEGER NOT NULL,
      batch_number TEXT NOT NULL,
      dispensed_by TEXT NOT NULL REFERENCES staff_users(id),
      patient_notes TEXT,
      created_at TEXT NOT NULL
    );

    -- Laboratory Requests
    CREATE TABLE IF NOT EXISTS laboratory_requests (
      id TEXT PRIMARY KEY,
      request_no TEXT UNIQUE NOT NULL,
      visit_id TEXT NOT NULL REFERENCES patient_visits(id),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      doctor_id TEXT NOT NULL REFERENCES staff_users(id),
      priority TEXT NOT NULL DEFAULT 'routine',
      clinical_notes TEXT,
      status TEXT NOT NULL DEFAULT 'requested',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Laboratory Tests & Results
    CREATE TABLE IF NOT EXISTS laboratory_tests (
      id TEXT PRIMARY KEY,
      request_id TEXT NOT NULL REFERENCES laboratory_requests(id) ON DELETE CASCADE,
      test_code TEXT NOT NULL,
      test_name TEXT NOT NULL,
      specimen_type TEXT NOT NULL,
      specimen_collected_at TEXT,
      collected_by TEXT REFERENCES staff_users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      result_value TEXT,
      reference_range TEXT,
      unit TEXT,
      flag TEXT DEFAULT 'normal',
      technician_notes TEXT,
      analyzed_by TEXT REFERENCES staff_users(id),
      analyzed_at TEXT,
      verified_by TEXT REFERENCES staff_users(id),
      verified_at TEXT,
      price REAL NOT NULL DEFAULT 0
    );

    -- Service Catalog
    CREATE TABLE IF NOT EXISTS service_catalog (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1
    );

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_no TEXT UNIQUE NOT NULL,
      visit_id TEXT NOT NULL REFERENCES patient_visits(id),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      subtotal REAL NOT NULL,
      discount REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total_amount REAL NOT NULL,
      paid_amount REAL NOT NULL DEFAULT 0,
      balance_due REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      notes TEXT,
      generated_by TEXT NOT NULL REFERENCES staff_users(id),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Invoice Line Items
    CREATE TABLE IF NOT EXISTS invoice_items (
      id TEXT PRIMARY KEY,
      invoice_id TEXT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      item_type TEXT NOT NULL,
      reference_id TEXT,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      total_price REAL NOT NULL
    );

    -- Payments (Cashiering)
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      payment_no TEXT UNIQUE NOT NULL,
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      patient_id TEXT NOT NULL REFERENCES patients(id),
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_reference TEXT NOT NULL UNIQUE,
      cashier_id TEXT NOT NULL REFERENCES staff_users(id),
      status TEXT NOT NULL DEFAULT 'confirmed',
      notes TEXT,
      created_at TEXT NOT NULL
    );

    -- Payment Refunds / Reversals
    CREATE TABLE IF NOT EXISTS payment_refunds (
      id TEXT PRIMARY KEY,
      refund_no TEXT UNIQUE NOT NULL,
      payment_id TEXT NOT NULL REFERENCES payments(id),
      invoice_id TEXT NOT NULL REFERENCES invoices(id),
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      approved_by TEXT NOT NULL REFERENCES staff_users(id),
      processed_by TEXT NOT NULL REFERENCES staff_users(id),
      created_at TEXT NOT NULL
    );

    -- Comprehensive Audit Events (Append-only)
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_email TEXT,
      user_role TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      outcome TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at TEXT NOT NULL
    );

    -- Clinic Settings
    CREATE TABLE IF NOT EXISTS clinic_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_by TEXT,
      updated_at TEXT NOT NULL
    );

    -- Internal Notifications
    CREATE TABLE IF NOT EXISTS internal_notifications (
      id TEXT PRIMARY KEY,
      target_role TEXT,
      target_user_id TEXT REFERENCES staff_users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'normal',
      reference_type TEXT,
      reference_id TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Backups Registry
    CREATE TABLE IF NOT EXISTS backups (
      id TEXT PRIMARY KEY,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size_bytes INTEGER NOT NULL,
      trigger_type TEXT NOT NULL,
      status TEXT NOT NULL,
      checksum TEXT,
      created_by TEXT REFERENCES staff_users(id),
      created_at TEXT NOT NULL
    );

    -- Indexes for performance & rapid query retrieval
    CREATE INDEX IF NOT EXISTS idx_patients_no ON patients(patient_no);
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(full_name);
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
    CREATE INDEX IF NOT EXISTS idx_visits_patient ON patient_visits(patient_id);
    CREATE INDEX IF NOT EXISTS idx_visits_stage ON patient_visits(stage);
    CREATE INDEX IF NOT EXISTS idx_vitals_visit ON vital_signs(visit_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_visit ON prescriptions(visit_id);
    CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
    CREATE INDEX IF NOT EXISTS idx_lab_requests_visit ON laboratory_requests(visit_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_patient ON invoices(patient_id);
    CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
    CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_stock_movements_med ON stock_movements(medicine_id);
  `);

  seedInitialData();
}

function seedInitialData() {
  const now = new Date().toISOString();

  // 1. Clinic Settings
  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM clinic_settings').get() as { c: number };
  if (settingsCount.c === 0) {
    const defaultSettings: [string, string][] = [
      ['clinic_name', 'CAPSTONE CLINIC SYSTEM'],
      ['clinic_phone', '+234 803 123 4567'],
      ['clinic_email', 'ops@medipulseclinic.ng'],
      ['clinic_address', '14 Victoria Island Boulevard, Lagos, Nigeria'],
      ['currency_code', 'NGN'],
      ['currency_symbol', '₦'],
      ['timezone', 'Africa/Lagos'],
      ['mfa_enforced_privileged', '1'],
      ['session_timeout_minutes', '60'],
      ['auto_backup_enabled', '1']
    ];
    const ins = db.prepare('INSERT INTO clinic_settings (key, value, updated_at) VALUES (?, ?, ?)');
    for (const [k, v] of defaultSettings) {
      ins.run(k, v, now);
    }
  } else {
    db.prepare("UPDATE clinic_settings SET value = 'CAPSTONE CLINIC SYSTEM' WHERE key = 'clinic_name'").run();
  }

  // 2. Initial Staff Users (Real credentials hashed with bcrypt)
  const staffCount = db.prepare('SELECT COUNT(*) as c FROM staff_users').get() as { c: number };
  if (staffCount.c === 0) {
    const passwordHash = bcrypt.hashSync('ClinicPass@2026', 10);
    const staffList = [
      {
        id: 'usr_admin_01',
        email: 'admin@medipulse.ng',
        username: 'admin',
        full_name: 'Dr. Kelechi Nwosu',
        role: 'admin',
        department: 'Administration',
        phone: '+234 802 111 2233'
      },
      {
        id: 'usr_doc_01',
        email: 'doctor.adeyemi@medipulse.ng',
        username: 'dr.adeyemi',
        full_name: 'Dr. Adeyemi Alabi, MBBS, FWACP',
        role: 'doctor',
        department: 'General Outpatient & Internal Medicine',
        phone: '+234 803 222 3344'
      },
      {
        id: 'usr_nurse_01',
        email: 'nurse.funke@medipulse.ng',
        username: 'nurse.funke',
        full_name: 'RN Funke Adeleke',
        role: 'nurse',
        department: 'Nursing & Triage',
        phone: '+234 804 333 4455'
      },
      {
        id: 'usr_pharm_01',
        email: 'pharm.ibrahim@medipulse.ng',
        username: 'pharm.ibrahim',
        full_name: 'Pharm. Ibrahim Bello, B.Pharm',
        role: 'pharmacist',
        department: 'Pharmacy & Drug Dispensing',
        phone: '+234 805 444 5566'
      },
      {
        id: 'usr_lab_01',
        email: 'lab.chinedu@medipulse.ng',
        username: 'lab.chinedu',
        full_name: 'MLS Chinedu Okafor, AMLSCN',
        role: 'lab_tech',
        department: 'Diagnostic Laboratory',
        phone: '+234 806 555 6677'
      },
      {
        id: 'usr_recept_01',
        email: 'reception.ngozi@medipulse.ng',
        username: 'rec.ngozi',
        full_name: 'Ngozi Eze',
        role: 'receptionist',
        department: 'Front Desk & Patient Services',
        phone: '+234 807 666 7788'
      },
      {
        id: 'usr_cashier_01',
        email: 'billing.fatima@medipulse.ng',
        username: 'cashier.fatima',
        full_name: 'Fatima Danjuma, ACA',
        role: 'accountant',
        department: 'Revenue & Accounts',
        phone: '+234 808 777 8899'
      },
      {
        id: 'usr_mgr_01',
        email: 'manager.olumide@medipulse.ng',
        username: 'mgr.olumide',
        full_name: 'Olumide Bakare',
        role: 'manager',
        department: 'Clinical Operations',
        phone: '+234 809 888 9900'
      },
      {
        id: 'usr_records_01',
        email: 'records.amaka@medipulse.ng',
        username: 'rec.amaka',
        full_name: 'Amaka Obi',
        role: 'records_officer',
        department: 'Health Records & Archive',
        phone: '+234 810 999 0011'
      }
    ];

    const insStaff = db.prepare(`
      INSERT INTO staff_users (
        id, email, username, password_hash, full_name, role, department, phone,
        is_active, mfa_enabled, must_change_password, failed_logins, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 0, ?, ?)
    `);

    for (const s of staffList) {
      insStaff.run(s.id, s.email, s.username, passwordHash, s.full_name, s.role, s.department, s.phone, now, now);
    }
  }

  // 3. Service Catalog
  const scCount = db.prepare('SELECT COUNT(*) as c FROM service_catalog').get() as { c: number };
  if (scCount.c === 0) {
    const services = [
      ['srv_01', 'CONS-GP', 'General Medical Consultation', 'consultation', 7500.00, 'Standard initial or routine GP consultation'],
      ['srv_02', 'CONS-SPEC', 'Specialist Physician Review', 'consultation', 15000.00, 'Review by Internal Medicine Consultant'],
      ['srv_03', 'TRIAGE-STD', 'Comprehensive Nursing Triage & Vitals', 'nursing', 2000.00, 'Full vital signs, oxygenation, and BMI assessment'],
      ['srv_04', 'INJ-ADMIN', 'Intramuscular / IV Injection Administration', 'nursing', 3000.00, 'Professional medication administration with aseptic technique'],
      ['srv_05', 'WOUND-DRS', 'Aseptic Wound Dressing (Minor/Intermediate)', 'procedure', 6500.00, 'Cleaning, antiseptic lavage, and sterile bandaging'],
      ['srv_06', 'LAB-FBC', 'Full Blood Count (FBC) with 5-Part Diff', 'laboratory', 6000.00, 'Complete automated hematological panel'],
      ['srv_07', 'LAB-MP', 'Malaria Parasite Microscopic Examination', 'laboratory', 3500.00, 'Thick and thin blood film Giemsa stain'],
      ['srv_08', 'LAB-WIDAL', 'Widal Agglutination Reaction', 'laboratory', 3500.00, 'Typhoid screening panel'],
      ['srv_09', 'LAB-FBS', 'Fasting Blood Glucose / Random Glucose', 'laboratory', 2500.00, 'Point of care and photometric enzymatic glucose'],
      ['srv_10', 'LAB-LIPID', 'Comprehensive Lipid Profile', 'laboratory', 12000.00, 'Cholesterol, Triglycerides, HDL, LDL, VLDL'],
      ['srv_11', 'LAB-EUC', 'Electrolytes, Urea & Creatinine (E/U/Cr)', 'laboratory', 14000.00, 'Renal function biochemical panel'],
      ['srv_12', 'LAB-URINE', 'Urinalysis (10-Parameter Strip & Microscopy)', 'laboratory', 3000.00, 'Urine dipstick with sediment microscopic evaluation']
    ];

    const insSrv = db.prepare('INSERT INTO service_catalog (id, code, name, category, price, description, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)');
    for (const s of services) {
      insSrv.run(...s);
    }
  }

  // 4. Pharmacy Formulary & Medicines Inventory
  const medCount = db.prepare('SELECT COUNT(*) as c FROM medicines').get() as { c: number };
  if (medCount.c === 0) {
    const meds = [
      ['med_01', 'MED-ACT-01', 'Artemether + Lumefantrine', 'Coartem', 'Antimalarials', '20mg/120mg', 'Tablet', 'pack', 1800.00, 2800.00, 140, 25, 'ACT-2025-08', '2027-11-30', 'Novartis Pharma'],
      ['med_02', 'MED-AMX-01', 'Amoxicillin + Clavulanic Acid', 'Augmentin', 'Antibiotics', '625mg', 'Tablet', 'pack', 4200.00, 6500.00, 85, 20, 'AUG-2026-01', '2027-08-31', 'GSK Healthcare'],
      ['med_03', 'MED-CIP-01', 'Ciprofloxacin HCl', 'Ciprotab', 'Antibiotics', '500mg', 'Tablet', 'pack', 1500.00, 2400.00, 95, 20, 'CIP-2025-11', '2028-02-28', 'Fidson Healthcare'],
      ['med_04', 'MED-PCM-01', 'Paracetamol / Acetaminophen', 'Panadol Extra', 'Analgesics', '500mg/65mg', 'Tablet', 'card', 350.00, 600.00, 320, 50, 'PAN-2026-03', '2028-06-30', 'Emzor Pharmaceuticals'],
      ['med_05', 'MED-IBU-01', 'Ibuprofen', 'Brufen', 'Analgesics', '400mg', 'Tablet', 'card', 400.00, 750.00, 110, 30, 'BRU-2025-10', '2027-09-30', 'Abbott Nigeria'],
      ['med_06', 'MED-AML-01', 'Amlodipine Besylate', 'Norvasc', 'Antihypertensives', '5mg', 'Tablet', 'pack', 2500.00, 4200.00, 75, 20, 'AML-2025-12', '2028-01-31', 'Pfizer Global'],
      ['med_07', 'MED-LOS-01', 'Losartan Potassium', 'Cozaar', 'Antihypertensives', '50mg', 'Tablet', 'pack', 3100.00, 5000.00, 60, 20, 'LOS-2026-02', '2027-12-31', 'Merck Sharp & Dohme'],
      ['med_08', 'MED-MET-01', 'Metformin HCl', 'Glucophage', 'Antidiabetics', '500mg', 'Tablet', 'pack', 2000.00, 3400.00, 80, 25, 'MET-2025-09', '2027-10-31', 'Merck Group'],
      ['med_09', 'MED-OMP-01', 'Omeprazole', 'Losec', 'Gastrointestinal', '20mg', 'Capsule', 'pack', 1800.00, 3000.00, 105, 25, 'OMP-2026-04', '2028-03-31', 'AstraZeneca'],
      ['med_10', 'MED-SAL-01', 'Salbutamol Inhaler', 'Ventolin', 'Respiratory', '100mcg/dose', 'Inhaler', 'canister', 3500.00, 5500.00, 45, 15, 'SAL-2025-07', '2027-06-30', 'GSK Healthcare'],
      ['med_11', 'MED-ORS-01', 'Oral Rehydration Salts + Zinc', 'HydraSalt', 'Gastrointestinal', 'Standard Sachet', 'Powder', 'sachet', 250.00, 500.00, 200, 40, 'ORS-2026-02', '2028-04-30', 'May & Baker Nigeria'],
      ['med_12', 'MED-DEX-01', 'Dextrose Saline 5% IV Infusion', 'Dextro infusion', 'IV Fluids', '500ml', 'Bottle', 'bottle', 1200.00, 2200.00, 65, 20, 'DEX-2026-01', '2027-05-31', 'Dana Pharmaceuticals']
    ];

    const insMed = db.prepare(`
      INSERT INTO medicines (
        id, code, generic_name, brand_name, category, strength, dosage_form, unit,
        purchase_cost, selling_price, stock_quantity, reorder_level, batch_number,
        expiry_date, supplier, location, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Main Pharmacy', 1, ?, ?)
    `);

    const insStock = db.prepare(`
      INSERT INTO stock_movements (
        id, movement_no, medicine_id, transaction_type, quantity, balance_before,
        balance_after, unit_cost, reference_id, batch_number, reason, performed_by, created_at
      ) VALUES (?, ?, ?, 'receipt', ?, 0, ?, ?, 'INIT-STOCK', ?, 'Initial system ledger stock intake', 'usr_admin_01', ?)
    `);

    let movIdx = 1;
    for (const m of meds) {
      insMed.run(...m, now, now);
      const stockQty = m[10] as number;
      const pCost = m[8] as number;
      insStock.run(
        `mov_${movIdx}`,
        `SM-2026-${String(movIdx).padStart(4, '0')}`,
        m[0],
        stockQty,
        stockQty,
        pCost,
        m[12],
        now
      );
      movIdx++;
    }
  }

  // 5. Initial Sample Patients & Visits for operational clinical workflow validation
  const patCount = db.prepare('SELECT COUNT(*) as c FROM patients').get() as { c: number };
  if (patCount.c === 0) {
    const patients = [
      {
        id: 'pat_01',
        patient_no: 'PAT-2026-0001',
        full_name: 'Babajide Emmanuel Ogunlesi',
        dob: '1984-06-15',
        age: 42,
        sex: 'M',
        phone: '+234 802 334 5566',
        email: 'b.ogunlesi@yahoo.com',
        address: '22 Admiralty Way, Lekki Phase 1, Lagos',
        emergency_contact_name: 'Folashade Ogunlesi',
        emergency_contact_phone: '+234 802 998 7766',
        emergency_contact_relation: 'Spouse',
        blood_group: 'O+',
        genotype: 'AA',
        allergies: 'Penicillin (severe hives & bronchospasm)',
        medical_alerts: 'Hypertension stage 2; G6PD Normal',
        preexisting_conditions: 'Essential Hypertension (diagnosed 2021)'
      },
      {
        id: 'pat_02',
        patient_no: 'PAT-2026-0002',
        full_name: 'Amina Zainab Yusuf',
        dob: '1995-11-20',
        age: 30,
        sex: 'F',
        phone: '+234 803 776 1122',
        email: 'amina.yusuf@gmail.com',
        address: '8 Garki District Crescent, Abuja / Lagos Branch',
        emergency_contact_name: 'Dr. Usman Yusuf',
        emergency_contact_phone: '+234 803 554 9988',
        emergency_contact_relation: 'Brother',
        blood_group: 'B+',
        genotype: 'AS',
        allergies: 'Sulfonamides / Septrin (angioedema)',
        medical_alerts: 'Mild bronchial asthma (uses Ventolin SOS)',
        preexisting_conditions: 'Allergic Rhinitis, Intermittent Asthma'
      },
      {
        id: 'pat_03',
        patient_no: 'PAT-2026-0003',
        full_name: 'Chukwudi Jude Okeke',
        dob: '1976-03-09',
        age: 50,
        sex: 'M',
        phone: '+234 805 998 3311',
        email: 'cj.okeke@enterprise.ng',
        address: '54 Allen Avenue, Ikeja, Lagos',
        emergency_contact_name: 'Nkechi Okeke',
        emergency_contact_phone: '+234 805 112 4433',
        emergency_contact_relation: 'Wife',
        blood_group: 'A+',
        genotype: 'AA',
        allergies: 'None known',
        medical_alerts: 'Type 2 Diabetes Mellitus',
        preexisting_conditions: 'T2DM, Dyslipidemia'
      }
    ];

    const insPat = db.prepare(`
      INSERT INTO patients (
        id, patient_no, full_name, dob, age, sex, phone, email, address,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        blood_group, genotype, allergies, medical_alerts, preexisting_conditions,
        status, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 'usr_recept_01', ?, ?)
    `);

    for (const p of patients) {
      insPat.run(
        p.id, p.patient_no, p.full_name, p.dob, p.age, p.sex, p.phone, p.email, p.address,
        p.emergency_contact_name, p.emergency_contact_phone, p.emergency_contact_relation,
        p.blood_group, p.genotype, p.allergies, p.medical_alerts, p.preexisting_conditions,
        now, now
      );
    }

    // Seed Active Visits
    const visits = [
      {
        id: 'vis_01',
        visit_no: 'VIS-2026-0001',
        patient_id: 'pat_01',
        stage: 'consultation',
        priority: 'urgent',
        doctor_id: 'usr_doc_01'
      },
      {
        id: 'vis_02',
        visit_no: 'VIS-2026-0002',
        patient_id: 'pat_02',
        stage: 'laboratory',
        priority: 'routine',
        doctor_id: 'usr_doc_01'
      },
      {
        id: 'vis_03',
        visit_no: 'VIS-2026-0003',
        patient_id: 'pat_03',
        stage: 'pharmacy',
        priority: 'routine',
        doctor_id: 'usr_doc_01'
      }
    ];

    const insVis = db.prepare(`
      INSERT INTO patient_visits (
        id, visit_no, patient_id, visit_date, stage, priority, visit_type,
        attending_doctor_id, checked_in_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'outpatient', ?, 'usr_recept_01', ?, ?)
    `);

    for (const v of visits) {
      insVis.run(v.id, v.visit_no, v.patient_id, now.split('T')[0], v.stage, v.priority, v.doctor_id, now, now);
    }

    // Seed Vitals for visit 1 & 2
    const insVitals = db.prepare(`
      INSERT INTO vital_signs (
        id, visit_id, patient_id, bp_systolic, bp_diastolic, pulse_rate, temperature,
        respiratory_rate, oxygen_saturation, weight_kg, height_cm, bmi, pain_score,
        clinical_notes, is_abnormal, recorded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'usr_nurse_01', ?)
    `);

    insVitals.run(
      'vit_01', 'vis_01', 'pat_01', 158, 98, 88, 37.8, 19, 97, 86.5, 178, 27.3, 3,
      'Patient reports moderate throbbing frontal headache and fatigue. Elevated BP noted; alerted attending physician.',
      1, now
    );

    insVitals.run(
      'vit_02', 'vis_02', 'pat_02', 118, 76, 74, 38.6, 18, 99, 61.0, 165, 22.4, 4,
      'High pyrexia (38.6°C) with rigors and generalised arthralgia. Triage priority maintained for urgent MP & FBC lab panel.',
      1, now
    );

    insVitals.run(
      'vit_03', 'vis_03', 'pat_03', 132, 84, 76, 36.7, 16, 98, 79.0, 172, 26.7, 0,
      'Routine review vitals stable. Blood pressure within target range for diabetic cohort.',
      0, now
    );

    // Seed Consultation for visit 3 & Lab for visit 2
    const insCons = db.prepare(`
      INSERT INTO consultations (
        id, visit_id, patient_id, doctor_id, presenting_complaint,
        history_of_present_illness, past_medical_history, physical_examination,
        clinical_assessment, primary_diagnosis, secondary_diagnoses, treatment_plan,
        follow_up_date, referral_notes, is_signed, signed_at, signed_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 'usr_doc_01', ?, ?)
    `);

    insCons.run(
      'cons_03', 'vis_03', 'pat_03', 'usr_doc_01',
      'Routine 3-month follow-up for chronic diabetes care. No polyuria or polydipsia.',
      'Patient is compliant with Metformin 500mg BD. Self-monitored fasting blood glucose ranges between 5.8 - 6.6 mmol/L.',
      'Type 2 Diabetes Mellitus x 4 years. No macro/microvascular complications reported.',
      'Alert, oriented x3. CVS: S1 S2 normal. Chest clear. Peripheral pulses intact, no diabetic foot ulcers or neuropathy.',
      'Stable glycemic control under current oral antidiabetic regimen.',
      'Type 2 Diabetes Mellitus - Controlled',
      'Mild Essential Dyslipidemia',
      'Continue Metformin 500mg BD with meals. Maintain balanced low-glycemic dietary regimen and 30 mins brisk walking daily.',
      '2026-11-14',
      'Dietary counselling reinforced. Routine HbA1c scheduled for next quarter.',
      now, now, now
    );

    // Seed Prescription for visit 3
    db.prepare(`
      INSERT INTO prescriptions (
        id, prescription_no, visit_id, patient_id, doctor_id, status, created_at, updated_at
      ) VALUES ('rx_03', 'RX-2026-0001', 'vis_03', 'pat_03', 'usr_doc_01', 'pending', ?, ?)
    `).run(now, now);

    db.prepare(`
      INSERT INTO prescription_items (
        id, prescription_id, medicine_id, medicine_name, dosage, route,
        frequency, duration_days, quantity_prescribed, quantity_dispensed, unit_price, instructions, status
      ) VALUES ('rxi_01', 'rx_03', 'med_08', 'Metformin HCl (Glucophage 500mg)', '500mg', 'Oral', 'BD', 30, 60, 0, 3400.00, 'Take 1 tablet twice daily with or immediately after meals', 'pending')
    `).run();

    // Seed Lab Request for visit 2
    db.prepare(`
      INSERT INTO laboratory_requests (
        id, request_no, visit_id, patient_id, doctor_id, priority, clinical_notes, status, created_at, updated_at
      ) VALUES ('lab_req_02', 'LR-2026-0001', 'vis_02', 'pat_02', 'usr_doc_01', 'urgent', 'Pyrexia of unknown origin with chills and headache. Rule out acute plasmodiasis and typhoid enteritis.', 'requested', ?, ?)
    `).run(now, now);

    db.prepare(`
      INSERT INTO laboratory_tests (
        id, request_id, test_code, test_name, specimen_type, status, price
      ) VALUES 
      ('tst_01', 'lab_req_02', 'LAB-MP', 'Malaria Parasite Microscopic Examination', 'Blood', 'pending', 3500.00),
      ('tst_02', 'lab_req_02', 'LAB-FBC', 'Full Blood Count (FBC) with 5-Part Diff', 'Blood', 'pending', 6000.00)
    `).run();

    // Seed Invoice for visit 3
    db.prepare(`
      INSERT INTO invoices (
        id, invoice_no, visit_id, patient_id, subtotal, discount, tax, total_amount, paid_amount, balance_due, status, notes, generated_by, created_at, updated_at
      ) VALUES ('inv_01', 'INV-2026-0001', 'vis_03', 'pat_03', 10900.00, 0, 0, 10900.00, 10900.00, 0.00, 'paid', 'Consultation fee and 30-day oral medication', 'usr_cashier_01', ?, ?)
    `).run(now, now);

    db.prepare(`
      INSERT INTO invoice_items (
        id, invoice_id, item_type, reference_id, description, quantity, unit_price, total_price
      ) VALUES 
      ('invi_01', 'inv_01', 'service', 'srv_01', 'General Medical Consultation', 1, 7500.00, 7500.00),
      ('invi_02', 'inv_01', 'medicine', 'med_08', 'Metformin HCl 500mg (60 tabs)', 1, 3400.00, 3400.00)
    `).run();

    db.prepare(`
      INSERT INTO payments (
        id, payment_no, invoice_id, patient_id, amount, payment_method, transaction_reference, cashier_id, status, notes, created_at
      ) VALUES ('pay_01', 'REC-2026-0001', 'inv_01', 'pat_03', 10900.00, 'pos', 'POS-STANBIC-998812', 'usr_cashier_01', 'confirmed', 'Stanbic IBTC POS Terminal Auth 44109', ?)
    `).run(now);
  }

  // Initial Audit Event
  const auditCount = db.prepare('SELECT COUNT(*) as c FROM audit_events').get() as { c: number };
  if (auditCount.c === 0) {
    db.prepare(`
      INSERT INTO audit_events (
        id, user_id, user_email, user_role, action, entity_type, entity_id, outcome, details, ip_address, created_at
      ) VALUES ('aud_boot_01', 'usr_admin_01', 'admin@medipulse.ng', 'admin', 'SYSTEM_BOOTSTRAP', 'system', 'clinic.db', 'SUCCESS', ?, '127.0.0.1', ?)
    `).run(JSON.stringify({ note: 'Initial secure system database bootstrap executed with strict RBAC rules and seed ledger' }), now);
  }
}

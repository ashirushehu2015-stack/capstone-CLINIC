# CAPSTONE CLINIC SYSTEM

Enterprise-grade, secure, staff-only Clinic Information & Management System designed for hospital outpatient and specialist clinical workflows.

---

## 1. Fundamental Architecture & Security Model

This system is built exclusively for authorized clinical personnel.
- **Zero Public Access**: No public patient registration, no patient self-service portal, and no unauthenticated endpoints.
- **Server-Side Authorization**: Every API route enforces session validity, active account status, and role-based permissions (`requireAuth`, `requireRoles`).
- **Instant Revocation**: When an administrator suspends or deactivates an account, all active browser sessions for that user are immediately revoked server-side.
- **Immutable Append-Only Audit Trail**: Every sensitive operation (logins, failures, record locks, addenda, prescriptions, dispensing, payments, and backups) is recorded with actor ID, timestamp, IP address, and parameters.
- **Patient Safety Identifiers**: Clinical workspaces feature a high-visibility patient banner prominently displaying allergies (e.g., penicillin bronchospasm warnings) and vital alerts to eliminate wrong-patient errors.
- **Currency & Localization**: Real transactional finance denominated in Nigerian Naira (₦, NGN) with POS, cash, and bank-transfer reconciliation.

---

## 2. Role & Permission Matrix

| Role | Key Capabilities & Enforced Boundaries |
| :--- | :--- |
| **System Administrator** (`admin`) | Staff account provisioning, password resets, suspension, audit trail inspection, atomic database backups, clinic configuration. |
| **Clinic Manager** (`manager`) | Operational oversight, queue throughput metrics, clinical morbidity reports, revenue summary, staff directory. |
| **Receptionist** (`receptionist`) | Patient demographic intake, duplicate detection, visit check-in, appointment booking, queue routing. |
| **Doctor / Clinician** (`doctor`) | Clinical consultations, physical exam documentation, primary/secondary diagnoses, authoritatively locked signatures, addenda, e-prescriptions, diagnostic lab requests. |
| **Staff Nurse** (`nurse`) | Triage queue management, physiological vitals entry with range validation, automated abnormal alerts, pain score tracking, consultation escalation. |
| **Laboratory Scientist** (`lab_tech`) | Specimen collection logging, diagnostic test result entry, reference range and flag markers (normal/abnormal/critical), MLSCN professional result verification and release. |
| **Pharmacist** (`pharmacist`) | Drug formulary management, prescription dispensing with automated stock deductions, batch & expiry monitoring, stock receipts, and audited adjustments. |
| **Accountant / Cashier** (`accountant`) | Automated visit invoice generation, payment processing (POS terminal auth, cash, bank transfer), receipt issuance, daily cashier shift reconciliation. |
| **Medical Records Officer** (`records_officer`) | Health records retrieval, demographic amendments, controlled duplicate patient merging with mandatory clinical justification and audit logging. |

---

## 3. Pre-Configured Operational Staff Accounts

All initial demonstration accounts use the password: `ClinicPass@2026`

| Username | Name | Role | Clinical Department |
| :--- | :--- | :--- | :--- |
| `admin` | Dr. Kelechi Nwosu | System Administrator | Administration & Executive |
| `dr.adeyemi` | Dr. Adeyemi Alabi, MBBS, FWACP | Doctor / Clinician | General Outpatient & Internal Medicine |
| `nurse.funke` | RN Funke Adeleke | Staff Nurse | Nursing & Triage |
| `pharm.ibrahim`| Pharm. Ibrahim Bello, B.Pharm | Pharmacist | Pharmacy & Formulary |
| `lab.chinedu` | MLS Chinedu Okafor, AMLSCN | Medical Lab Scientist | Diagnostic Laboratory |
| `rec.ngozi` | Ngozi Eze | Receptionist | Front Desk & Admissions |
| `cashier.fatima`| Fatima Danjuma, ACA | Accountant / Cashier | Revenue & Accounts |
| `mgr.olumide` | Olumide Bakare | Clinic Manager | Clinical Operations |
| `rec.amaka` | Amaka Obi | Records Officer | Health Records & Archive |

*Tip: Click the **"Switch Role"** button in the header bar to immediately test distinct roles and observe role-specific UI and backend permission enforcement.*

---

## 4. Clinical Workflow Overview

1. **Front Desk / Reception**:
   - Register patient (`PAT-YYYY-XXXX`). The system automatically validates phone and Name+DOB to prevent duplicate profiles.
   - Admit patient to live queue (`VIS-YYYY-XXXX`) and assign initial triage priority (Routine, Urgent, Emergency).
2. **Nursing & Triage**:
   - Select patient from triage waiting list.
   - Enter BP, pulse rate, temperature, respiratory rate, SpO2, height, weight (BMI auto-computed), and pain scale.
   - Physiological validation flags abnormal values (e.g. SBP $\ge 140$ mmHg, Temp $\ge 38.0^\circ\text{C}$, SpO2 $< 95\%$).
   - Automatically route visit to Doctor's queue.
3. **Doctor Consultation**:
   - Review presenting complaint, HPI, exam, and vitals.
   - Enter primary diagnosis and treatment plan.
   - Issue structured prescription orders directly against pharmacy inventory.
   - Order diagnostic tests from laboratory catalogue.
   - Lock & authoritatively sign record. Once locked, records cannot be overwritten; clinical corrections must be appended as formal addenda.
4. **Diagnostic Laboratory**:
   - Log specimen collection (Blood, Urine, Swab, etc.).
   - Enter analyzed values, units, reference intervals, and flags.
   - Lab Scientist verifies and releases report. Attending clinician is notified.
5. **Pharmacy Dispensary**:
   - Review valid prescriptions.
   - Dispense medications against active batches.
   - Stock balances deduct transactionally in the immutable movement ledger.
6. **Cashier & Billing**:
   - One-click auto-generation of itemized invoice bundling consultation, nursing, lab investigations, and dispensed medications.
   - Process settlement via POS (terminal auth ref), cash, or verified bank transfer.
   - Issue unique official receipt (`REC-YYYY-XXXX`) with printable voucher.
   - Conduct end-of-shift cashier reconciliation.

---

## 5. Database Schema & Disaster Recovery

- **Engine**: SQLite in WAL mode with strict foreign keys (`PRAGMA foreign_keys = ON;`).
- **Atomic Online Backups**: Generates non-blocking snapshot copies using `VACUUM INTO 'data/backups/clinic_backup_<timestamp>.db'`.
- **Integrity Verification**: Computes SHA-256 hash checksums to verify that backup snapshots are uncorrupted before simulating or performing restoration.

export type StaffRole =
  | 'admin'
  | 'manager'
  | 'receptionist'
  | 'doctor'
  | 'nurse'
  | 'lab_tech'
  | 'pharmacist'
  | 'accountant'
  | 'records_officer';

export interface StaffUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: StaffRole;
  department: string;
  phone: string | null;
  is_active: number;
  mfa_enabled: number;
  must_change_password: number;
  last_login_at?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  patient_no: string;
  full_name: string;
  dob: string;
  age: number;
  sex: 'M' | 'F' | 'Other';
  phone: string;
  email?: string | null;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation?: string | null;
  blood_group?: string | null;
  genotype?: string | null;
  allergies?: string | null;
  medical_alerts?: string | null;
  preexisting_conditions?: string | null;
  status: 'active' | 'merged' | 'archived';
  merged_into_patient_id?: string | null;
  created_at: string;
  updated_at: string;
}

export type VisitStage = 'triage' | 'consultation' | 'laboratory' | 'pharmacy' | 'billing' | 'completed';
export type VisitPriority = 'routine' | 'urgent' | 'emergency';

export interface PatientVisit {
  id: string;
  visit_no: string;
  patient_id: string;
  patient_no: string;
  patient_name: string;
  dob?: string;
  age?: number;
  sex?: string;
  allergies?: string;
  medical_alerts?: string;
  blood_group?: string;
  visit_date: string;
  stage: VisitStage;
  priority: VisitPriority;
  visit_type: string;
  attending_doctor_id?: string | null;
  attending_doctor_name?: string | null;
  checked_in_by_name?: string | null;
  checkout_at?: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_no: string;
  patient_name: string;
  patient_phone: string;
  age: number;
  sex: string;
  clinician_id: string;
  clinician_name: string;
  appointment_date: string;
  appointment_time: string;
  department: string;
  reason: string;
  status: 'scheduled' | 'checked_in' | 'completed' | 'cancelled' | 'rescheduled';
  cancellation_reason?: string | null;
  created_at: string;
}

export interface VitalSign {
  id: string;
  visit_id: string;
  patient_id: string;
  bp_systolic: number;
  bp_diastolic: number;
  pulse_rate: number;
  temperature: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  weight_kg?: number | null;
  height_cm?: number | null;
  bmi?: number | null;
  pain_score?: number;
  clinical_notes?: string | null;
  is_abnormal: number;
  recorded_by_name?: string;
  created_at: string;
}

export interface Consultation {
  id: string;
  visit_id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name?: string;
  presenting_complaint: string;
  history_of_present_illness: string;
  past_medical_history?: string | null;
  physical_examination: string;
  clinical_assessment: string;
  primary_diagnosis: string;
  secondary_diagnoses?: string | null;
  treatment_plan: string;
  follow_up_date?: string | null;
  referral_notes?: string | null;
  is_signed: number;
  signed_at?: string | null;
  signed_by_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClinicalAmendment {
  id: string;
  consultation_id: string;
  amended_by: string;
  amended_by_name?: string;
  amendment_reason: string;
  original_content: string;
  amended_content: string;
  created_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id: string;
  medicine_name: string;
  dosage: string;
  route: string;
  frequency: string;
  duration_days: number;
  quantity_prescribed: number;
  quantity_dispensed: number;
  unit_price: number;
  instructions?: string | null;
  status: 'pending' | 'dispensed' | 'cancelled';
  current_stock?: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface Prescription {
  id: string;
  prescription_no: string;
  visit_id: string;
  visit_no: string;
  patient_id: string;
  patient_no: string;
  patient_name: string;
  doctor_name: string;
  allergies?: string;
  status: 'pending' | 'partially_dispensed' | 'dispensed' | 'cancelled';
  cancellation_reason?: string | null;
  created_at: string;
  items?: PrescriptionItem[];
}

export interface Medicine {
  id: string;
  code: string;
  generic_name: string;
  brand_name: string;
  category: string;
  strength: string;
  dosage_form: string;
  unit: string;
  purchase_cost: number;
  selling_price: number;
  stock_quantity: number;
  reorder_level: number;
  batch_number: string;
  expiry_date: string;
  supplier: string;
  location: string;
  is_active: number;
  created_at: string;
}

export interface StockMovement {
  id: string;
  movement_no: string;
  medicine_id: string;
  generic_name: string;
  brand_name: string;
  unit: string;
  transaction_type: 'receipt' | 'dispense' | 'adjustment' | 'return' | 'wastage';
  quantity: number;
  balance_before: number;
  balance_after: number;
  unit_cost: number;
  reference_id?: string;
  batch_number: string;
  reason: string;
  performed_by_name?: string;
  created_at: string;
}

export interface LaboratoryTest {
  id: string;
  request_id: string;
  test_code: string;
  test_name: string;
  specimen_type: string;
  specimen_collected_at?: string | null;
  collected_by_name?: string | null;
  status: 'pending' | 'sample_collected' | 'analyzed' | 'verified';
  result_value?: string | null;
  reference_range?: string | null;
  unit?: string | null;
  flag: 'normal' | 'low' | 'high' | 'abnormal' | 'critical';
  technician_notes?: string | null;
  analyzed_by_name?: string | null;
  analyzed_at?: string | null;
  verified_by_name?: string | null;
  verified_at?: string | null;
  price: number;
}

export interface LaboratoryRequest {
  id: string;
  request_no: string;
  visit_id: string;
  visit_no: string;
  patient_id: string;
  patient_no: string;
  patient_name: string;
  doctor_name: string;
  priority: 'routine' | 'urgent' | 'stat';
  clinical_notes?: string | null;
  status: 'requested' | 'sample_collected' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  tests?: LaboratoryTest[];
}

export interface ServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  is_active: number;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_type: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Payment {
  id: string;
  payment_no: string;
  invoice_id: string;
  patient_id: string;
  amount: number;
  payment_method: 'cash' | 'pos' | 'bank_transfer';
  transaction_reference: string;
  cashier_name?: string;
  status: 'confirmed' | 'refunded';
  notes?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_no: string;
  visit_id: string;
  visit_no: string;
  patient_id: string;
  patient_no: string;
  patient_name: string;
  patient_phone?: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  paid_amount: number;
  balance_due: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'reversed';
  notes?: string;
  generated_by_name?: string;
  created_at: string;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface AuditEvent {
  id: string;
  user_id?: string;
  user_email?: string;
  user_role?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  outcome: 'SUCCESS' | 'FAILED' | 'DENIED';
  details?: string;
  ip_address?: string;
  created_at: string;
  user_full_name?: string;
  user_department?: string;
}

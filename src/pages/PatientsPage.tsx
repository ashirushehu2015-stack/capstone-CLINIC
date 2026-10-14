import React, { useState, useEffect } from 'react';
import { Patient, StaffUser } from '../types';
import { apiRequest, formatDate, formatDateTime, formatNGN } from '../lib/api';
import {
  Users,
  Search,
  UserPlus,
  GitMerge,
  Eye,
  CalendarPlus,
  ShieldAlert,
  AlertCircle,
  FileText,
  Phone,
  CheckCircle2,
  X
} from 'lucide-react';

interface PatientsPageProps {
  user: StaffUser;
  onSelectPatient: (patient: Patient) => void;
  onOpenVisitForPatient: (patient: Patient) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({
  user,
  onSelectPatient,
  onOpenVisitForPatient
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<any>(null);

  // Registration form state
  const [regForm, setRegForm] = useState({
    full_name: '',
    dob: '',
    sex: 'M',
    phone: '',
    email: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: 'Spouse',
    blood_group: 'O+',
    genotype: 'AA',
    allergies: 'None known',
    medical_alerts: '',
    preexisting_conditions: ''
  });
  const [duplicateWarning, setDuplicateWarning] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Merge form state
  const [mergeSourceId, setMergeSourceId] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [mergeReason, setMergeReason] = useState('');
  const [mergeError, setMergeError] = useState<string | null>(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await apiRequest(`/api/patients?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=15`);
      setPatients(data.patients);
      setTotalPages(data.pagination.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchQuery, page]);

  // Duplicate detection on typing phone or name+dob
  const checkDuplicates = async (phone: string, full_name: string, dob: string) => {
    if (!phone && (!full_name || !dob)) return;
    try {
      const res = await apiRequest('/api/patients/check-duplicate', {
        method: 'POST',
        body: JSON.stringify({ phone, full_name, dob })
      });
      setDuplicateWarning(res.duplicates || []);
    } catch {
      // Ignore
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await apiRequest('/api/patients', {
        method: 'POST',
        body: JSON.stringify(regForm)
      });
      setShowRegisterModal(false);
      fetchPatients();
      onSelectPatient(res.patient);
    } catch (err: any) {
      setFormError(err.message || 'Failed to register patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewPatientHistory = async (patientId: string) => {
    try {
      const data = await apiRequest(`/api/patients/${patientId}/history`);
      setSelectedPatientHistory(data);
      setShowHistoryModal(true);
    } catch (err: any) {
      alert(`Could not load patient history: ${err.message}`);
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMergeError(null);
    try {
      await apiRequest('/api/patients/merge', {
        method: 'POST',
        body: JSON.stringify({
          source_patient_id: mergeSourceId,
          target_patient_id: mergeTargetId,
          merge_reason: mergeReason
        })
      });
      setShowMergeModal(false);
      fetchPatients();
      alert('Patient records merged successfully with full audit trail.');
    } catch (err: any) {
      setMergeError(err.message || 'Failed to merge records.');
    }
  };

  const canMerge = ['records_officer', 'admin'].includes(user.role);

  return (
    <div className="space-y-6">
      
      {/* Header Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Patient Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized clinical identity & medical record index
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {canMerge && (
            <button
              onClick={() => {
                setMergeSourceId('');
                setMergeTargetId('');
                setMergeReason('');
                setMergeError(null);
                setShowMergeModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span>Merge Duplicates</span>
            </button>
          )}

          <button
            onClick={() => {
              setFormError(null);
              setDuplicateWarning([]);
              setShowRegisterModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register New Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by Patient No (e.g. PAT-2026-0001), Name, or Phone..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3">Patient No</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Age / Sex</th>
                <th className="p-3">Phone & Address</th>
                <th className="p-3">Clinical Alerts & Allergies</th>
                <th className="p-3">Registered</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading patient registry records...
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No matching patients found.
                  </td>
                </tr>
              ) : (
                patients.map((pat) => {
                  const hasAllergy = pat.allergies && pat.allergies.toLowerCase() !== 'none known' && pat.allergies.toLowerCase() !== 'none';
                  return (
                    <tr key={pat.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-teal-800">
                        {pat.patient_no}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{pat.full_name}</div>
                        <div className="text-[11px] text-slate-500">
                          Blood: <strong className="text-slate-700">{pat.blood_group || '—'}</strong> ({pat.genotype || 'AA'})
                        </div>
                      </td>
                      <td className="p-3 text-slate-700">
                        {pat.age} yrs · {pat.sex === 'M' ? 'Male' : pat.sex === 'F' ? 'Female' : pat.sex}
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{pat.phone}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{pat.address}</div>
                      </td>
                      <td className="p-3">
                        {hasAllergy ? (
                          <div className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded inline-block">
                            Allergy: {pat.allergies}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">None documented</span>
                        )}
                        {pat.medical_alerts && (
                          <div className="text-[11px] text-amber-800 mt-0.5">
                            Alert: {pat.medical_alerts}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-slate-500">
                        {formatDate(pat.created_at)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => viewPatientHistory(pat.id)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded transition-colors"
                            title="View Full Clinical & Financial History"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onSelectPatient(pat)}
                            className="px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                            title="Select Patient for Consultation or Nursing"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => onOpenVisitForPatient(pat)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                            title="Check-in / Start New Visit"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>Page {page} of {totalPages}</div>
            <div className="flex gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-2.5 py-1 rounded border border-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Patient Longitudinal History Modal */}
      {showHistoryModal && selectedPatientHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Patient Longitudinal Record: {selectedPatientHistory.patient.full_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedPatientHistory.patient.patient_no} · {selectedPatientHistory.patient.age} yrs · {selectedPatientHistory.patient.sex} · Phone: {selectedPatientHistory.patient.phone}
                </p>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Demographics & Alerts Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400">Blood Group:</span>
                  <div className="font-semibold text-slate-800">{selectedPatientHistory.patient.blood_group || 'Not recorded'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Genotype:</span>
                  <div className="font-semibold text-slate-800">{selectedPatientHistory.patient.genotype || 'Not recorded'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Documented Allergies:</span>
                  <div className="font-semibold text-red-700">{selectedPatientHistory.patient.allergies || 'None'}</div>
                </div>
                <div>
                  <span className="text-slate-400">Emergency Contact:</span>
                  <div className="font-semibold text-slate-800">
                    {selectedPatientHistory.patient.emergency_contact_name} ({selectedPatientHistory.patient.emergency_contact_phone})
                  </div>
                </div>
              </div>

              {/* Consultations History */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Clinical Consultations ({selectedPatientHistory.consultations.length})</span>
                </h4>
                {selectedPatientHistory.consultations.length === 0 ? (
                  <p className="text-slate-400 italic">No past consultations recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedPatientHistory.consultations.map((c: any) => (
                      <div key={c.id} className="p-3 border border-slate-200 rounded-lg bg-white space-y-1.5">
                        <div className="flex justify-between font-semibold text-slate-800">
                          <span className="text-teal-900 font-bold">{c.primary_diagnosis}</span>
                          <span className="text-slate-400 font-normal">{formatDateTime(c.created_at)} · {c.doctor_name}</span>
                        </div>
                        <p className="text-slate-600"><strong>Complaints:</strong> {c.presenting_complaint}</p>
                        <p className="text-slate-600"><strong>Plan:</strong> {c.treatment_plan}</p>
                        {c.is_signed === 1 && (
                          <div className="text-[10px] text-emerald-700 font-medium">✓ Authoritatively Signed & Locked</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Vital Signs History */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Recorded Vital Signs ({selectedPatientHistory.vitals.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPatientHistory.vitals.map((v: any) => (
                    <div key={v.id} className="p-2.5 border border-slate-200 rounded bg-white">
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>{formatDateTime(v.created_at)}</span>
                        <span>Nurse: {v.recorded_by_name}</span>
                      </div>
                      <div className="mt-1 font-semibold text-slate-800">
                        BP: {v.bp_systolic}/{v.bp_diastolic} mmHg · Pulse: {v.pulse_rate} bpm · Temp: {v.temperature}°C · SpO2: {v.oxygen_saturation}%
                      </div>
                      {v.clinical_notes && <p className="text-slate-500 mt-0.5">{v.clinical_notes}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescriptions History */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Prescriptions ({selectedPatientHistory.prescriptions.length})</h4>
                <div className="space-y-2">
                  {selectedPatientHistory.prescriptions.map((rx: any) => (
                    <div key={rx.id} className="p-3 border border-slate-200 rounded bg-white">
                      <div className="flex justify-between font-mono font-semibold text-slate-700">
                        <span>{rx.prescription_no} · Status: <span className="uppercase text-teal-700">{rx.status}</span></span>
                        <span className="font-sans font-normal text-slate-400">{formatDate(rx.created_at)}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {rx.items && rx.items.map((itm: any) => (
                          <div key={itm.id} className="text-slate-600 pl-2 border-l-2 border-teal-500">
                            <strong>{itm.medicine_name}</strong> - {itm.dosage} ({itm.frequency} x {itm.duration_days} days, qty: {itm.quantity_prescribed})
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoices History */}
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">Financial Invoices & Receipts ({selectedPatientHistory.invoices.length})</h4>
                <div className="space-y-2">
                  {selectedPatientHistory.invoices.map((inv: any) => (
                    <div key={inv.id} className="p-2.5 border border-slate-200 rounded flex justify-between items-center bg-white">
                      <div>
                        <div className="font-mono font-bold text-slate-800">{inv.invoice_no}</div>
                        <div className="text-slate-500">{formatDate(inv.created_at)} · Status: <strong className="uppercase">{inv.status}</strong></div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">{formatNGN(inv.total_amount)}</div>
                        <div className="text-slate-500 font-mono">Paid: {formatNGN(inv.paid_amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register New Patient</h3>
                <p className="text-xs text-slate-500">Automatic unique patient number generation & duplicate detection</p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Duplicate Detection Warning */}
              {duplicateWarning.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Possible Existing Patient Detected!</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    The following active records share the same phone number or full name + DOB:
                  </p>
                  <div className="mt-2 space-y-1">
                    {duplicateWarning.map((d) => (
                      <div key={d.id} className="p-1.5 bg-white rounded border border-amber-300 font-mono text-[11px] flex justify-between">
                        <span>{d.patient_no} - {d.full_name} ({d.dob})</span>
                        <span>{d.phone}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={regForm.full_name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegForm({ ...regForm, full_name: val });
                      checkDuplicates(regForm.phone, val, regForm.dob);
                    }}
                    placeholder="e.g. Babajide Emmanuel Ogunlesi"
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={regForm.dob}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegForm({ ...regForm, dob: val });
                      checkDuplicates(regForm.phone, regForm.full_name, val);
                    }}
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sex *</label>
                  <select
                    value={regForm.sex}
                    onChange={(e) => setRegForm({ ...regForm, sex: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 bg-white"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRegForm({ ...regForm, phone: val });
                      checkDuplicates(val, regForm.full_name, regForm.dob);
                    }}
                    placeholder="+234 803 123 4567"
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="patient@example.ng"
                    className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address *</label>
                <input
                  type="text"
                  required
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="Street address, city, state"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Emergency Contact */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="font-semibold text-slate-800">Emergency Contact (Next of Kin) *</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={regForm.emergency_contact_name}
                      onChange={(e) => setRegForm({ ...regForm, emergency_contact_name: e.target.value })}
                      placeholder="e.g. Folashade Ogunlesi"
                      className="w-full px-3 py-1.5 border rounded border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={regForm.emergency_contact_phone}
                      onChange={(e) => setRegForm({ ...regForm, emergency_contact_phone: e.target.value })}
                      placeholder="+234 802 998 7766"
                      className="w-full px-3 py-1.5 border rounded border-slate-300 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={regForm.emergency_contact_relation}
                      onChange={(e) => setRegForm({ ...regForm, emergency_contact_relation: e.target.value })}
                      placeholder="Spouse / Parent / Sibling"
                      className="w-full px-3 py-1.5 border rounded border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Clinical Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Blood Group & Genotype</label>
                  <div className="flex gap-2">
                    <select
                      value={regForm.blood_group}
                      onChange={(e) => setRegForm({ ...regForm, blood_group: e.target.value })}
                      className="w-1/2 px-3 py-2 border rounded-lg border-slate-300 bg-white"
                    >
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                    <select
                      value={regForm.genotype}
                      onChange={(e) => setRegForm({ ...regForm, genotype: e.target.value })}
                      className="w-1/2 px-3 py-2 border rounded-lg border-slate-300 bg-white"
                    >
                      <option value="AA">AA</option>
                      <option value="AS">AS</option>
                      <option value="SS">SS</option>
                      <option value="AC">AC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-red-700 mb-1">Known Drug Allergies</label>
                  <input
                    type="text"
                    value={regForm.allergies}
                    onChange={(e) => setRegForm({ ...regForm, allergies: e.target.value })}
                    placeholder="e.g. Penicillin, Sulfa drugs, or 'None known'"
                    className="w-full px-3 py-2 border rounded-lg border-red-200 bg-red-50/40 text-red-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Alerts & Pre-existing Conditions</label>
                <input
                  type="text"
                  value={regForm.medical_alerts}
                  onChange={(e) => setRegForm({ ...regForm, medical_alerts: e.target.value })}
                  placeholder="e.g. Hypertensive, Asthmatic, Diabetic, G6PD Deficient"
                  className="w-full px-3 py-2 border rounded-lg border-slate-300"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering Patient...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Controlled Duplicate Record Merging Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Merge Duplicate Records</h3>
                <p className="text-slate-500 mt-0.5">Audited clinical data consolidation workflow</p>
              </div>
              <button onClick={() => setShowMergeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {mergeError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded">
                {mergeError}
              </div>
            )}

            <form onSubmit={handleMergeSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Source Patient (Duplicate to be merged & deactivated)
                </label>
                <select
                  required
                  value={mergeSourceId}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  <option value="">Select source duplicate...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_no} - {p.full_name} ({p.dob})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Patient (Primary surviving patient record)
                </label>
                <select
                  required
                  value={mergeTargetId}
                  onChange={(e) => setMergeTargetId(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  <option value="">Select primary master record...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_no} - {p.full_name} ({p.dob})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clinical & Administrative Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  placeholder="Document reason for merge: e.g. accidental duplicate admission created with nickname; confirmed identical identity after verifying next of kin and phone."
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed">
                <strong>Attention:</strong> All clinical encounters, vitals, prescriptions, lab results, and financial invoices from the source patient will be permanently reassigned to the target patient record. An immutable audit record will be logged with your staff identity.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMergeModal(false)}
                  className="px-3 py-1.5 border rounded border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded"
                >
                  Execute Record Merge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { PatientVisit, Patient, StaffUser, VitalSign, Consultation, ClinicalAmendment } from '../types';
import { apiRequest, formatDate, formatDateTime, formatNGN } from '../lib/api';
import { PatientBanner } from '../components/PatientBanner';
import { PrintDocumentModal } from '../components/PrintDocumentModal';
import {
  Stethoscope,
  Lock,
  Edit3,
  FileCheck2,
  Pill,
  FlaskConical,
  Printer,
  AlertCircle,
  CheckCircle2,
  Clock,
  History,
  Plus,
  Trash2,
  X
} from 'lucide-react';

interface ConsultationPageProps {
  user: StaffUser;
  activeVisit?: PatientVisit | null;
  onSelectVisit: (visit: PatientVisit) => void;
  onNavigate: (tab: string) => void;
}

export const ConsultationPage: React.FC<ConsultationPageProps> = ({
  user,
  activeVisit,
  onSelectVisit,
  onNavigate
}) => {
  const [consultQueue, setConsultQueue] = useState<PatientVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(activeVisit || null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [amendments, setAmendments] = useState<ClinicalAmendment[]>([]);
  const [loading, setLoading] = useState(false);

  // Consultation Form
  const [form, setForm] = useState({
    presenting_complaint: '',
    history_of_present_illness: '',
    past_medical_history: '',
    physical_examination: '',
    clinical_assessment: '',
    primary_diagnosis: '',
    secondary_diagnoses: '',
    treatment_plan: '',
    follow_up_date: '',
    referral_notes: ''
  });

  // Amendment modal
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendReason, setAmendReason] = useState('');
  const [amendContent, setAmendContent] = useState('');

  // Prescription modal
  const [showRxModal, setShowRxModal] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [rxItems, setRxItems] = useState<any[]>([
    { medicine_id: 'med_01', dosage: '20mg/120mg', route: 'Oral', frequency: 'BD', duration_days: 3, quantity: 24, instructions: 'Take with food' }
  ]);

  // Lab request modal
  const [showLabModal, setShowLabModal] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedTests, setSelectedTests] = useState<any[]>([]);
  const [labPriority, setLabPriority] = useState('routine');
  const [labNotes, setLabNotes] = useState('');

  // Print Modal
  const [printDoc, setPrintDoc] = useState<any>(null);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchConsultQueue = async () => {
    try {
      const res = await apiRequest('/api/visits?stage=consultation');
      setConsultQueue(res.visits || []);
    } catch (err) {
      console.error('Failed to load consultation queue:', err);
    }
  };

  const loadVisitEncounter = async (visit: PatientVisit) => {
    setLoading(true);
    setMessage(null);
    try {
      const pRes = await apiRequest(`/api/patients/${visit.patient_id}`);
      setPatient(pRes.patient);

      const vRes = await apiRequest(`/api/nursing/vitals/${visit.id}`);
      setVitals(vRes.vitals || []);

      const cRes = await apiRequest(`/api/consultations/visit/${visit.id}`);
      if (cRes.consultation) {
        setConsultation(cRes.consultation);
        setAmendments(cRes.amendments || []);
        setForm({
          presenting_complaint: cRes.consultation.presenting_complaint || '',
          history_of_present_illness: cRes.consultation.history_of_present_illness || '',
          past_medical_history: cRes.consultation.past_medical_history || '',
          physical_examination: cRes.consultation.physical_examination || '',
          clinical_assessment: cRes.consultation.clinical_assessment || '',
          primary_diagnosis: cRes.consultation.primary_diagnosis || '',
          secondary_diagnoses: cRes.consultation.secondary_diagnoses || '',
          treatment_plan: cRes.consultation.treatment_plan || '',
          follow_up_date: cRes.consultation.follow_up_date || '',
          referral_notes: cRes.consultation.referral_notes || ''
        });
      } else {
        setConsultation(null);
        setAmendments([]);
        setForm({
          presenting_complaint: '',
          history_of_present_illness: '',
          past_medical_history: pRes.patient.preexisting_conditions || '',
          physical_examination: '',
          clinical_assessment: '',
          primary_diagnosis: '',
          secondary_diagnoses: '',
          treatment_plan: '',
          follow_up_date: '',
          referral_notes: ''
        });
      }

      // Load formulary & services for prescription and lab modal
      const medRes = await apiRequest('/api/pharmacy/inventory');
      setMedicines(medRes.medicines || []);

      const srvRes = await apiRequest('/api/billing/services');
      setServices(srvRes.services?.filter((s: any) => s.category === 'laboratory') || []);
    } catch (err) {
      console.error('Failed to load visit encounter:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultQueue();
    if (activeVisit) {
      setSelectedVisit(activeVisit);
      loadVisitEncounter(activeVisit);
    }
  }, [activeVisit]);

  const handleSelectVisit = (v: PatientVisit) => {
    setSelectedVisit(v);
    onSelectVisit(v);
    loadVisitEncounter(v);
  };

  const handleSaveConsultation = async (signImmediately: boolean = false) => {
    if (!selectedVisit || !patient) return;
    setMessage(null);

    try {
      const res = await apiRequest('/api/consultations', {
        method: 'POST',
        body: JSON.stringify({
          visit_id: selectedVisit.id,
          patient_id: patient.id,
          ...form,
          sign_immediately: signImmediately
        })
      });

      setConsultation(res.consultation);
      setMessage({
        type: 'success',
        text: signImmediately
          ? 'Consultation note has been authoritatively signed, timestamped, and locked.'
          : 'Consultation draft saved successfully.'
      });
      fetchConsultQueue();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save consultation.' });
    }
  };

  const handleAmendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consultation) return;

    try {
      const res = await apiRequest(`/api/consultations/${consultation.id}/amend`, {
        method: 'POST',
        body: JSON.stringify({
          amendment_reason: amendReason,
          amended_content: amendContent
        })
      });
      setAmendments([...amendments, res.amendment]);
      setShowAmendModal(false);
      setMessage({ type: 'success', text: 'Clinical amendment addendum appended with complete audit record.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePrescribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit || !patient) return;

    try {
      await apiRequest('/api/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          visit_id: selectedVisit.id,
          patient_id: patient.id,
          items: rxItems
        })
      });
      setShowRxModal(false);
      setMessage({ type: 'success', text: 'Prescription sent to pharmacy dispensary.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleLabRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit || !patient) return;

    try {
      await apiRequest('/api/laboratory/requests', {
        method: 'POST',
        body: JSON.stringify({
          visit_id: selectedVisit.id,
          patient_id: patient.id,
          priority: labPriority,
          clinical_notes: labNotes,
          tests: selectedTests.map((t) => ({
            test_code: t.code,
            test_name: t.name,
            specimen_type: 'Blood',
            price: t.price
          }))
        })
      });
      setShowLabModal(false);
      setMessage({ type: 'success', text: 'Laboratory investigation request submitted.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const isSigned = consultation?.is_signed === 1;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinician Consultation EMR</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Electronic Medical Records, signed encounter documentation, and clinical ordering
          </p>
        </div>

        <button
          onClick={fetchConsultQueue}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Refresh Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left: Consultation Queue */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Waiting for Doctor ({consultQueue.length})
            </h3>
            <span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold">
              Queue
            </span>
          </div>

          {consultQueue.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 text-center">
              No patients waiting for consultation.
            </p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {consultQueue.map((v) => {
                const isSelected = selectedVisit?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVisit(v)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-blue-400 bg-blue-50/60 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-xs text-slate-900">{v.patient_name}</div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        v.priority === 'emergency' ? 'bg-red-100 text-red-800' : v.priority === 'urgent' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {v.priority}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      {v.patient_no} · {v.age}y/{v.sex} · Ref: {v.visit_no}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Clinical Consultation Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {patient && selectedVisit ? (
            <>
              {/* Patient Safety Banner */}
              <PatientBanner patient={patient} />

              {/* Status & Alerts */}
              {message && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* Latest Triage Vitals Ribbon */}
              {vitals.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="font-bold text-slate-700">Triage Vitals:</span>
                    <span>BP: <strong className="font-mono">{vitals[0].bp_systolic}/{vitals[0].bp_diastolic}</strong> mmHg</span>
                    <span>Pulse: <strong className="font-mono">{vitals[0].pulse_rate}</strong> bpm</span>
                    <span>Temp: <strong className="font-mono">{vitals[0].temperature}°C</strong></span>
                    <span>SpO2: <strong className="font-mono">{vitals[0].oxygen_saturation}%</strong></span>
                    {vitals[0].weight_kg && <span>Weight: <strong className="font-mono">{vitals[0].weight_kg}kg</strong></span>}
                    {vitals[0].bmi && <span>BMI: <strong className="font-mono">{vitals[0].bmi}</strong></span>}
                  </div>
                  <span className="text-[11px] text-slate-400">Recorded {formatDateTime(vitals[0].created_at)}</span>
                </div>
              )}

              {/* Signed Status Banner */}
              {isSigned && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>
                      <strong>RECORD LOCKED:</strong> Signed by {consultation.signed_by_name || 'Attending Clinician'} on {formatDateTime(consultation.signed_at)}. Amendments require formal clinical addendum.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAmendModal(true)}
                      className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 rounded text-xs font-semibold text-emerald-800"
                    >
                      + Addendum
                    </button>
                    <button
                      onClick={() => setPrintDoc({ ...consultation, patient_name: patient.full_name, patient_no: patient.patient_no })}
                      className="px-2.5 py-1 bg-white border border-emerald-300 hover:bg-emerald-100 rounded text-xs font-semibold text-emerald-800 flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Summary
                    </button>
                  </div>
                </div>
              )}

              {/* Consultation Editor Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5 text-xs">
                
                {/* Clinical Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Stethoscope className="w-4 h-4 text-blue-600" />
                    <span>Clinical Encounter Documentation</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLabModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200 rounded-lg font-semibold"
                    >
                      <FlaskConical className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Order Lab Tests</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRxModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg font-semibold"
                    >
                      <Pill className="w-3.5 h-3.5 text-amber-600" />
                      <span>Write Prescription</span>
                    </button>
                  </div>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Presenting Complaint (PC) *
                    </label>
                    <textarea
                      disabled={isSigned}
                      rows={2}
                      value={form.presenting_complaint}
                      onChange={(e) => setForm({ ...form, presenting_complaint: e.target.value })}
                      placeholder="e.g. Throbbing frontal headache x 3 days, intermittent fever, rigors"
                      className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      History of Present Illness (HPI) *
                    </label>
                    <textarea
                      disabled={isSigned}
                      rows={2}
                      value={form.history_of_present_illness}
                      onChange={(e) => setForm({ ...form, history_of_present_illness: e.target.value })}
                      placeholder="e.g. Illness began insidiously 3 days ago. Associated with nausea and generalized myalgia..."
                      className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Physical Examination Findings (O/E) *
                    </label>
                    <textarea
                      disabled={isSigned}
                      rows={3}
                      value={form.physical_examination}
                      onChange={(e) => setForm({ ...form, physical_examination: e.target.value })}
                      placeholder="e.g. Alert, pyrexic to touch. CVS: Heart sounds 1 & 2 normal. Chest clear. Abdomen soft, mild epigastric tenderness."
                      className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Clinical Assessment & Impression *
                    </label>
                    <textarea
                      disabled={isSigned}
                      rows={3}
                      value={form.clinical_assessment}
                      onChange={(e) => setForm({ ...form, clinical_assessment: e.target.value })}
                      placeholder="e.g. Acute uncomplicated febrile illness with moderate plasmodial parasitemia risk..."
                      className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Primary & Secondary Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Primary Diagnosis *
                    </label>
                    <input
                      type="text"
                      disabled={isSigned}
                      value={form.primary_diagnosis}
                      onChange={(e) => setForm({ ...form, primary_diagnosis: e.target.value })}
                      placeholder="e.g. Acute Uncomplicated Malaria / Stage 2 Essential Hypertension"
                      className="w-full p-2 border rounded-lg border-slate-300 font-semibold text-slate-900 bg-white disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Secondary Diagnoses / Differential
                    </label>
                    <input
                      type="text"
                      disabled={isSigned}
                      value={form.secondary_diagnoses}
                      onChange={(e) => setForm({ ...form, secondary_diagnoses: e.target.value })}
                      placeholder="e.g. Typhoid enteritis / Dyslipidemia"
                      className="w-full p-2 border rounded-lg border-slate-300 bg-white disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Treatment Plan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Management & Treatment Plan *
                  </label>
                  <textarea
                    disabled={isSigned}
                    rows={3}
                    value={form.treatment_plan}
                    onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })}
                    placeholder="e.g. 1. Oral Artemether-Lumefantrine 20/120mg tabs as prescribed. 2. Paracetamol 1g TDS for fever. 3. Liberal oral rehydration and 48hr clinical review."
                    className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50"
                  />
                </div>

                {/* Follow-up & Referrals */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Follow-up Review Date
                    </label>
                    <input
                      type="date"
                      disabled={isSigned}
                      value={form.follow_up_date}
                      onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })}
                      className="w-full p-2 border rounded-lg border-slate-300 bg-white disabled:bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Referral / Specialist Notes
                    </label>
                    <input
                      type="text"
                      disabled={isSigned}
                      value={form.referral_notes}
                      onChange={(e) => setForm({ ...form, referral_notes: e.target.value })}
                      placeholder="e.g. Referred to Cardiology outpatient clinic if BP remains uncontrolled"
                      className="w-full p-2 border rounded-lg border-slate-300 bg-white disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                {!isSigned && (
                  <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveConsultation(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                    >
                      Save Draft
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveConsultation(true)}
                      className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock & Authoritatively Sign</span>
                    </button>
                  </div>
                )}

              </div>

              {/* Historical Addenda / Amendments */}
              {amendments.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-amber-600" />
                    <span>Signed Record Addenda & Historical Amendments ({amendments.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {amendments.map((a) => (
                      <div key={a.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between font-semibold text-amber-900">
                          <span>Reason: {a.amendment_reason}</span>
                          <span className="font-normal text-slate-500">{formatDateTime(a.created_at)} · {a.amended_by_name}</span>
                        </div>
                        <p className="text-slate-700 mt-1"><strong>Addendum Text:</strong> {a.amended_content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-2xs text-xs">
              <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="font-semibold text-slate-700">No Patient Selected for Consultation</div>
              <p className="mt-1 text-slate-400">
                Select a waiting patient from the consultation queue on the left to begin documenting clinical encounter.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Write Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-amber-600" />
                <span>Write Structured Prescription Order</span>
              </h3>
              <button onClick={() => setShowRxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePrescribeSubmit} className="mt-4 space-y-4 overflow-y-auto">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                Patient: <strong>{patient?.full_name}</strong> ({patient?.patient_no}) · Known Allergies: <strong className="text-red-700">{patient?.allergies || 'None'}</strong>
              </div>

              <div className="space-y-3">
                {rxItems.map((item, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Item #{idx + 1}</span>
                      {rxItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setRxItems(rxItems.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-1">Medication *</label>
                        <select
                          required
                          value={item.medicine_id}
                          onChange={(e) => {
                            const val = e.target.value;
                            const copy = [...rxItems];
                            copy[idx].medicine_id = val;
                            setRxItems(copy);
                          }}
                          className="w-full p-1.5 border rounded bg-white"
                        >
                          {medicines.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.generic_name} ({m.brand_name}) · {m.strength} (Stock: {m.stock_quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Dosage & Route</label>
                        <input
                          type="text"
                          value={item.dosage}
                          onChange={(e) => {
                            const copy = [...rxItems];
                            copy[idx].dosage = e.target.value;
                            setRxItems(copy);
                          }}
                          placeholder="e.g. 500mg Oral"
                          className="w-full p-1.5 border rounded bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-slate-600 mb-1">Frequency</label>
                        <select
                          value={item.frequency}
                          onChange={(e) => {
                            const copy = [...rxItems];
                            copy[idx].frequency = e.target.value;
                            setRxItems(copy);
                          }}
                          className="w-full p-1.5 border rounded bg-white"
                        >
                          <option value="OD">OD (Once daily)</option>
                          <option value="BD">BD (Twice daily)</option>
                          <option value="TDS">TDS (Three times daily)</option>
                          <option value="QDS">QDS (Four times daily)</option>
                          <option value="PRN">PRN (As needed)</option>
                          <option value="STAT">STAT (Immediately)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Duration (days)</label>
                        <input
                          type="number"
                          value={item.duration_days}
                          onChange={(e) => {
                            const copy = [...rxItems];
                            copy[idx].duration_days = Number(e.target.value);
                            setRxItems(copy);
                          }}
                          className="w-full p-1.5 border rounded bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 mb-1">Quantity Prescribed</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const copy = [...rxItems];
                            copy[idx].quantity = Number(e.target.value);
                            setRxItems(copy);
                          }}
                          className="w-full p-1.5 border rounded bg-white font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-600 mb-1">Patient Instructions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => {
                          const copy = [...rxItems];
                          copy[idx].instructions = e.target.value;
                          setRxItems(copy);
                        }}
                        placeholder="e.g. Take with food, finish entire course"
                        className="w-full p-1.5 border rounded bg-white"
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setRxItems([...rxItems, { medicine_id: medicines[0]?.id || 'med_01', dosage: '500mg', route: 'Oral', frequency: 'BD', duration_days: 5, quantity: 10, instructions: '' }])}
                  className="w-full py-1.5 border border-dashed border-slate-300 text-slate-600 hover:bg-slate-50 rounded font-semibold text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Medication Item</span>
                </button>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRxModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Transmit to Pharmacy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Laboratory Investigation Modal */}
      {showLabModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-cyan-600" />
                <span>Order Diagnostic Laboratory Tests</span>
              </h3>
              <button onClick={() => setShowLabModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLabRequestSubmit} className="mt-4 space-y-4 overflow-y-auto">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Investigation Priority</label>
                <select
                  value={labPriority}
                  onChange={(e) => setLabPriority(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT / Immediate Life Threat</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Tests from Laboratory Catalogue *</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 rounded p-2 bg-slate-50">
                  {services.map((srv) => {
                    const isChecked = selectedTests.some((t) => t.code === srv.code);
                    return (
                      <label key={srv.code} className="flex items-center justify-between p-1.5 hover:bg-white rounded cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTests([...selectedTests, srv]);
                              } else {
                                setSelectedTests(selectedTests.filter((t) => t.code !== srv.code));
                              }
                            }}
                            className="accent-teal-600"
                          />
                          <span className="font-medium text-slate-800">{srv.name}</span>
                        </div>
                        <span className="font-mono text-slate-500">{formatNGN(srv.price)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Indication / Notes for Lab Scientist</label>
                <textarea
                  rows={2}
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  placeholder="e.g. Febrile illness x 3 days. Rule out acute plasmodiasis and typhoid bacteremia."
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLabModal(false)}
                  className="px-3 py-1.5 border rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedTests.length === 0}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded disabled:opacity-50"
                >
                  Submit Lab Request ({selectedTests.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Addendum / Amendment Modal */}
      {showAmendModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Append Clinical Addendum</h3>
              <button onClick={() => setShowAmendModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAmendSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Justification for Amendment *</label>
                <input
                  type="text"
                  required
                  value={amendReason}
                  onChange={(e) => setAmendReason(e.target.value)}
                  placeholder="e.g. Subsequent verified lab results indicate Plasmodium falciparum +++; adjusted regimen."
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Addendum Clinical Notes *</label>
                <textarea
                  required
                  rows={4}
                  value={amendContent}
                  onChange={(e) => setAmendContent(e.target.value)}
                  placeholder="Document new clinical findings, adjusted management plan, or physician remarks..."
                  className="w-full p-2.5 border rounded border-slate-300"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                The original locked record remains intact. This addendum will be permanently bound with your cryptographic staff identity and timestamp.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAmendModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Save Addendum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Document Modal */}
      {printDoc && (
        <PrintDocumentModal
          title="Clinical Consultation Summary"
          documentType="consultation"
          data={printDoc}
          onClose={() => setPrintDoc(null)}
        />
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { PatientVisit, Patient, StaffUser, VitalSign } from '../types';
import { apiRequest, formatDate, formatDateTime } from '../lib/api';
import { PatientBanner } from '../components/PatientBanner';
import {
  HeartPulse,
  Activity,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

interface NursingPageProps {
  user: StaffUser;
  activeVisit?: PatientVisit | null;
  onSelectVisit: (visit: PatientVisit) => void;
  onNavigate: (tab: string) => void;
}

export const NursingPage: React.FC<NursingPageProps> = ({
  user,
  activeVisit,
  onSelectVisit,
  onNavigate
}) => {
  const [triageQueue, setTriageQueue] = useState<PatientVisit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<PatientVisit | null>(activeVisit || null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [pastVitals, setPastVitals] = useState<VitalSign[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Vitals form
  const [form, setForm] = useState({
    bp_systolic: 120,
    bp_diastolic: 80,
    pulse_rate: 75,
    temperature: 36.8,
    respiratory_rate: 16,
    oxygen_saturation: 98,
    weight_kg: 70,
    height_cm: 170,
    pain_score: 0,
    clinical_notes: '',
    transition_to_consultation: true
  });

  // Calculate BMI
  const bmi = (form.weight_kg && form.height_cm > 0)
    ? (form.weight_kg / Math.pow(form.height_cm / 100, 2)).toFixed(1)
    : null;

  // Real-time abnormal alerts
  const isAbnormalBp = form.bp_systolic >= 140 || form.bp_systolic <= 90 || form.bp_diastolic >= 90 || form.bp_diastolic <= 60;
  const isAbnormalTemp = form.temperature >= 38.0 || form.temperature <= 35.5;
  const isAbnormalSpo2 = form.oxygen_saturation < 95;
  const isAbnormalPulse = form.pulse_rate >= 100 || form.pulse_rate <= 55;

  const fetchTriageQueue = async () => {
    try {
      const res = await apiRequest('/api/visits?stage=triage');
      setTriageQueue(res.visits || []);
    } catch (err) {
      console.error('Failed to load triage queue:', err);
    }
  };

  const loadPatientAndVitals = async (visit: PatientVisit) => {
    setLoading(true);
    setSubmitSuccess(null);
    setSubmitError(null);
    try {
      const pRes = await apiRequest(`/api/patients/${visit.patient_id}`);
      setSelectedPatient(pRes.patient);

      const vRes = await apiRequest(`/api/nursing/vitals/${visit.id}`);
      setPastVitals(vRes.vitals || []);
    } catch (err) {
      console.error('Failed to load vitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTriageQueue();
    if (activeVisit) {
      setSelectedVisit(activeVisit);
      loadPatientAndVitals(activeVisit);
    }
  }, [activeVisit]);

  const handleSelectVisit = (v: PatientVisit) => {
    setSelectedVisit(v);
    onSelectVisit(v);
    loadPatientAndVitals(v);
  };

  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisit) return;
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      await apiRequest('/api/nursing/vitals', {
        method: 'POST',
        body: JSON.stringify({
          visit_id: selectedVisit.id,
          patient_id: selectedVisit.patient_id,
          bp_systolic: Number(form.bp_systolic),
          bp_diastolic: Number(form.bp_diastolic),
          pulse_rate: Number(form.pulse_rate),
          temperature: Number(form.temperature),
          respiratory_rate: Number(form.respiratory_rate),
          oxygen_saturation: Number(form.oxygen_saturation),
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          height_cm: form.height_cm ? Number(form.height_cm) : null,
          pain_score: Number(form.pain_score),
          clinical_notes: form.clinical_notes || null,
          transition_to_consultation: form.transition_to_consultation
        })
      });

      setSubmitSuccess('Vital signs successfully recorded into electronic medical chart.');
      fetchTriageQueue();
      loadPatientAndVitals(selectedVisit);

      if (form.transition_to_consultation) {
        setTimeout(() => {
          onNavigate('queue');
        }, 1200);
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to record vital signs.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nursing Station & Triage</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Physiological measurement validation, clinical flags, and acuity escalation
          </p>
        </div>

        <button
          onClick={fetchTriageQueue}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          Refresh Triage Queue
        </button>
      </div>

      {/* Main Grid: Left Triage Queue, Right Vitals Recording */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Triage Waiting List */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Patients in Triage ({triageQueue.length})
            </h3>
            <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-semibold">
              Waiting
            </span>
          </div>

          {triageQueue.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-4 text-center">
              No patients currently in triage queue.
            </p>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {triageQueue.map((v) => {
                const isSelected = selectedVisit?.id === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectVisit(v)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-rose-400 bg-rose-50/60 shadow-2xs'
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
                    {v.allergies && v.allergies !== 'None known' && (
                      <div className="text-[10px] text-red-600 font-semibold mt-1">
                        Allergy: {v.allergies}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Vitals Entry & Triage Assessment */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPatient ? (
            <>
              {/* Patient Banner */}
              <PatientBanner patient={selectedPatient} />

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>Record Vital Signs & Nursing Observations</span>
                  </h3>
                  <span className="text-xs text-slate-500">Visit Ref: {selectedVisit?.visit_no}</span>
                </div>

                {submitSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{submitSuccess}</span>
                  </div>
                )}

                {submitError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitVitals} className="space-y-4 text-xs">
                  
                  {/* Physiological Alerts Bar */}
                  {(isAbnormalBp || isAbnormalTemp || isAbnormalSpo2 || isAbnormalPulse) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Potentially Critical Observations Detected:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                          {isAbnormalBp && <li>Blood Pressure is outside normal parameters ({form.bp_systolic}/{form.bp_diastolic} mmHg).</li>}
                          {isAbnormalTemp && <li>Body temperature indicates pyrexia / hypothermia ({form.temperature}°C).</li>}
                          {isAbnormalSpo2 && <li>Oxygen saturation is below 95% ({form.oxygen_saturation}%).</li>}
                          {isAbnormalPulse && <li>Pulse rate indicates tachycardia / bradycardia ({form.pulse_rate} bpm).</li>}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Vitals Form Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    
                    {/* BP Systolic */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        BP Systolic (mmHg) *
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="260"
                        required
                        value={form.bp_systolic}
                        onChange={(e) => setForm({ ...form, bp_systolic: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Norm: 90 - 139 mmHg</span>
                    </div>

                    {/* BP Diastolic */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        BP Diastolic (mmHg) *
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="160"
                        required
                        value={form.bp_diastolic}
                        onChange={(e) => setForm({ ...form, bp_diastolic: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Norm: 60 - 89 mmHg</span>
                    </div>

                    {/* Pulse Rate */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Pulse Rate (bpm) *
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="220"
                        required
                        value={form.pulse_rate}
                        onChange={(e) => setForm({ ...form, pulse_rate: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Norm: 60 - 100 bpm</span>
                    </div>

                    {/* Temperature */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Body Temp (°C) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="34.0"
                        max="43.0"
                        required
                        value={form.temperature}
                        onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Norm: 36.1 - 37.5 °C</span>
                    </div>

                    {/* Respiratory Rate */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Respiratory Rate (cpm) *
                      </label>
                      <input
                        type="number"
                        min="8"
                        max="60"
                        required
                        value={form.respiratory_rate}
                        onChange={(e) => setForm({ ...form, respiratory_rate: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Norm: 12 - 20 cpm</span>
                    </div>

                    {/* SpO2 */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Oxygen Saturation (%) *
                      </label>
                      <input
                        type="number"
                        min="50"
                        max="100"
                        required
                        value={form.oxygen_saturation}
                        onChange={(e) => setForm({ ...form, oxygen_saturation: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono font-bold text-sm bg-white"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Norm: 95 - 100%</span>
                    </div>

                    {/* Weight & Height */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={form.weight_kg}
                        onChange={(e) => setForm({ ...form, weight_kg: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono text-sm bg-white"
                      />
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={form.height_cm}
                        onChange={(e) => setForm({ ...form, height_cm: Number(e.target.value) })}
                        className="w-full p-2 border rounded font-mono text-sm bg-white"
                      />
                    </div>

                    {/* Calculated BMI */}
                    <div className="p-3 bg-slate-100 border border-slate-200 rounded-lg flex flex-col justify-center">
                      <span className="font-semibold text-slate-600">Calculated BMI</span>
                      <div className="text-base font-bold font-mono text-slate-900 mt-1">
                        {bmi ? `${bmi} kg/m²` : '—'}
                      </div>
                      <span className="text-[10px] text-slate-500">Auto-computed</span>
                    </div>

                  </div>

                  {/* Pain Score (0 - 10) */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pain Severity Score (0 = No pain, 10 = Worst imaginable pain)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={form.pain_score}
                        onChange={(e) => setForm({ ...form, pain_score: Number(e.target.value) })}
                        className="w-full accent-teal-600"
                      />
                      <span className="font-mono font-bold text-sm w-6 text-center">{form.pain_score}</span>
                    </div>
                  </div>

                  {/* Nursing Clinical Notes */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nursing Assessment & Triage Notes
                    </label>
                    <textarea
                      rows={3}
                      value={form.clinical_notes}
                      onChange={(e) => setForm({ ...form, clinical_notes: e.target.value })}
                      placeholder="e.g. Patient presents with high fever and rigors for 2 days. Frontal headache reported. Escalate to Doctor for urgent malarial / febrile workup."
                      className="w-full p-2.5 border rounded-lg border-slate-300 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Auto transition toggle */}
                  <div className="flex items-center gap-2 p-3 bg-teal-50/70 border border-teal-200 rounded-lg">
                    <input
                      type="checkbox"
                      id="trans_to_doc"
                      checked={form.transition_to_consultation}
                      onChange={(e) => setForm({ ...form, transition_to_consultation: e.target.checked })}
                      className="w-4 h-4 accent-teal-600"
                    />
                    <label htmlFor="trans_to_doc" className="font-semibold text-teal-900 cursor-pointer">
                      Automatically advance visit to Doctor Consultation queue upon submission
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Vital Signs to Record</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* Past Vitals History for this Visit */}
              {pastVitals.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Previous Vitals Logged for this Visit ({pastVitals.length})
                  </h4>
                  <div className="space-y-2">
                    {pastVitals.map((pv) => (
                      <div key={pv.id} className="p-3 border border-slate-200 rounded-lg text-xs bg-slate-50 flex justify-between items-center">
                        <div>
                          <div className="font-mono font-semibold text-slate-800">
                            BP: {pv.bp_systolic}/{pv.bp_diastolic} mmHg · Pulse: {pv.pulse_rate} bpm · Temp: {pv.temperature}°C · SpO2: {pv.oxygen_saturation}%
                          </div>
                          {pv.clinical_notes && (
                            <p className="text-slate-500 mt-1">{pv.clinical_notes}</p>
                          )}
                        </div>
                        <div className="text-right text-[11px] text-slate-400">
                          <div>{formatDateTime(pv.created_at)}</div>
                          <div>{pv.recorded_by_name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-2xs text-xs">
              <HeartPulse className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <div className="font-semibold text-slate-700">No Patient Selected for Triage</div>
              <p className="mt-1 text-slate-400">
                Select a waiting patient from the triage queue on the left to begin recording vital signs.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

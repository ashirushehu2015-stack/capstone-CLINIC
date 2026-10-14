import React, { useState, useEffect } from 'react';
import { PatientVisit, Appointment, Patient, StaffUser } from '../types';
import { apiRequest, formatDate, formatDateTime } from '../lib/api';
import {
  CalendarClock,
  Clock,
  Plus,
  AlertTriangle,
  Flame,
  ArrowRight,
  Filter,
  CheckCircle,
  Calendar,
  X
} from 'lucide-react';

interface QueuePageProps {
  user: StaffUser;
  onSelectVisit: (visit: PatientVisit, targetTab?: string) => void;
}

export const QueuePage: React.FC<QueuePageProps> = ({ user, onSelectVisit }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'appointments'>('queue');
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [stageFilter, setStageFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [showNewAptModal, setShowNewAptModal] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  // New visit form
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [visitPriority, setVisitPriority] = useState('routine');
  const [visitType, setVisitType] = useState('outpatient');
  const [initialStage, setInitialStage] = useState('triage');

  // New appointment form
  const [aptPatientId, setAptPatientId] = useState('');
  const [aptDoctorId, setAptDoctorId] = useState('usr_doc_01');
  const [aptDate, setAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [aptTime, setAptTime] = useState('10:00');
  const [aptDept, setAptDept] = useState('Internal Medicine');
  const [aptReason, setAptReason] = useState('');
  const [aptError, setAptError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const vRes = await apiRequest(`/api/visits?stage=${stageFilter}&priority=${priorityFilter}`);
      setVisits(vRes.visits || []);

      const aRes = await apiRequest('/api/appointments');
      setAppointments(aRes.appointments || []);

      const pRes = await apiRequest('/api/patients?limit=50');
      setPatients(pRes.patients || []);
    } catch (err) {
      console.error('Failed to load queue data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [stageFilter, priorityFilter]);

  const handleStageTransition = async (visitId: string, nextStage: string) => {
    try {
      await apiRequest(`/api/visits/${visitId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: nextStage })
      });
      fetchData();
    } catch (err: any) {
      alert(`Error updating stage: ${err.message}`);
    }
  };

  const handlePriorityEscalation = async (visitId: string, priority: string) => {
    try {
      await apiRequest(`/api/visits/${visitId}/priority`, {
        method: 'PATCH',
        body: JSON.stringify({ priority, reason: 'Clinical triage escalation' })
      });
      fetchData();
    } catch (err: any) {
      alert(`Error escalating priority: ${err.message}`);
    }
  };

  const handleCreateVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/visits', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: selectedPatientId,
          priority: visitPriority,
          visit_type: visitType,
          stage: initialStage
        })
      });
      setShowNewVisitModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to start visit.');
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAptError(null);
    try {
      await apiRequest('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: aptPatientId,
          clinician_id: aptDoctorId,
          appointment_date: aptDate,
          appointment_time: aptTime,
          department: aptDept,
          reason: aptReason
        })
      });
      setShowNewAptModal(false);
      fetchData();
    } catch (err: any) {
      setAptError(err.message || 'Failed to schedule appointment.');
    }
  };

  const stageLabels: Record<string, string> = {
    triage: 'Triage / Nursing',
    consultation: 'Doctor Consultation',
    laboratory: 'Diagnostic Lab',
    pharmacy: 'Pharmacy Dispensing',
    billing: 'Cashier / Billing',
    completed: 'Visit Completed'
  };

  const priorityBadges: Record<string, { label: string; style: string }> = {
    routine: { label: 'Routine', style: 'text-slate-600 bg-slate-100 border-slate-200' },
    urgent: { label: 'Urgent', style: 'text-amber-700 bg-amber-50 border-amber-300 font-bold' },
    emergency: { label: 'Emergency', style: 'text-red-700 bg-red-100 border-red-300 font-black animate-pulse' }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Clinic Flow & Queue</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active patient progression through clinical care points
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'queue' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Queue ({visits.length})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'appointments' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Appointments ({appointments.length})
            </button>
          </div>

          {activeTab === 'queue' ? (
            <button
              onClick={() => setShowNewVisitModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Check-in Patient</span>
            </button>
          ) : (
            <button
              onClick={() => setShowNewAptModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'queue' ? (
        <>
          {/* Queue Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                Stage:
              </span>
              {['all', 'triage', 'consultation', 'laboratory', 'pharmacy', 'billing', 'completed'].map((stg) => (
                <button
                  key={stg}
                  onClick={() => setStageFilter(stg)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    stageFilter === stg
                      ? 'bg-teal-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {stg === 'all' ? 'All Stages' : stageLabels[stg]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1 border rounded-md border-slate-200 bg-white text-xs"
              >
                <option value="all">All Priorities</option>
                <option value="routine">Routine Only</option>
                <option value="urgent">Urgent Only</option>
                <option value="emergency">Emergency Only</option>
              </select>
            </div>
          </div>

          {/* Visits Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <tr>
                    <th className="p-3">Visit Ref</th>
                    <th className="p-3">Patient Details</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Current Care Stage</th>
                    <th className="p-3">Arrival Time</th>
                    <th className="p-3 text-right">Workflow Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        Refreshing queue...
                      </td>
                    </tr>
                  ) : visits.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">
                        No patient visits currently in this queue stage.
                      </td>
                    </tr>
                  ) : (
                    visits.map((v) => {
                      const pBadge = priorityBadges[v.priority] || priorityBadges.routine;
                      return (
                        <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-900">
                            {v.visit_no}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{v.patient_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {v.patient_no} · {v.age}y/{v.sex}
                            </div>
                            {v.allergies && v.allergies !== 'None known' && (
                              <div className="text-[10px] text-red-600 font-semibold">
                                Allergy: {v.allergies}
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] border ${pBadge.style}`}>
                              {pBadge.label}
                            </span>
                            {/* Escalation quick control */}
                            {v.priority !== 'emergency' && (
                              <button
                                onClick={() => handlePriorityEscalation(v.id, v.priority === 'routine' ? 'urgent' : 'emergency')}
                                className="block mt-1 text-[10px] text-amber-700 hover:underline font-semibold"
                              >
                                Escalate ↑
                              </button>
                            )}
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {stageLabels[v.stage] || v.stage}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">
                            {formatDateTime(v.created_at)}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Open care module */}
                              {v.stage === 'triage' && (
                                <button
                                  onClick={() => onSelectVisit(v, 'nursing')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-xs"
                                >
                                  Take Vitals
                                </button>
                              )}
                              {v.stage === 'consultation' && (
                                <button
                                  onClick={() => onSelectVisit(v, 'consultation')}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs"
                                >
                                  Consult
                                </button>
                              )}
                              {v.stage === 'laboratory' && (
                                <button
                                  onClick={() => onSelectVisit(v, 'laboratory')}
                                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded text-xs"
                                >
                                  Lab Tests
                                </button>
                              )}
                              {v.stage === 'pharmacy' && (
                                <button
                                  onClick={() => onSelectVisit(v, 'pharmacy')}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs"
                                >
                                  Dispense
                                </button>
                              )}
                              {v.stage === 'billing' && (
                                <button
                                  onClick={() => onSelectVisit(v, 'billing')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs"
                                >
                                  Cashier
                                </button>
                              )}

                              {/* Manual transition dropdown */}
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) handleStageTransition(v.id, e.target.value);
                                }}
                                className="px-2 py-1 border rounded border-slate-200 text-slate-600 text-xs bg-white"
                              >
                                <option value="">Move to...</option>
                                <option value="triage">Triage</option>
                                <option value="consultation">Consultation</option>
                                <option value="laboratory">Laboratory</option>
                                <option value="pharmacy">Pharmacy</option>
                                <option value="billing">Billing</option>
                                <option value="completed">Complete Visit</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Appointments Table */
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="p-3">Appointment Date/Time</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Doctor / Clinician</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="p-3 font-semibold text-slate-900">
                      {formatDate(a.appointment_date)} at {a.appointment_time}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{a.patient_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{a.patient_no} · {a.patient_phone}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-medium">{a.clinician_name}</td>
                    <td className="p-3 text-slate-600">{a.department}</td>
                    <td className="p-3 text-slate-600">{a.reason}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {a.status === 'scheduled' && (
                        <button
                          onClick={async () => {
                            try {
                              await apiRequest(`/api/appointments/${a.id}/status`, {
                                method: 'PATCH',
                                body: JSON.stringify({ status: 'checked_in' })
                              });
                              // Also open visit
                              await apiRequest('/api/visits', {
                                method: 'POST',
                                body: JSON.stringify({
                                  patient_id: a.patient_id,
                                  priority: 'routine',
                                  visit_type: 'appointment',
                                  stage: 'triage'
                                })
                              });
                              fetchData();
                              alert('Patient checked in and admitted to Nursing Triage.');
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Check-in / Start New Visit Modal */}
      {showNewVisitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Open Clinical Visit</h3>
              <button onClick={() => setShowNewVisitModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVisit} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                >
                  <option value="">Select registered patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_no} - {p.full_name} ({p.age}y/{p.sex})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Triage Priority</label>
                  <select
                    value={visitPriority}
                    onChange={(e) => setVisitPriority(e.target.value)}
                    className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                  >
                    <option value="routine">Routine</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency / Red Alert</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Type</label>
                  <select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value)}
                    className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                  >
                    <option value="outpatient">Outpatient</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Care Point</label>
                <select
                  value={initialStage}
                  onChange={(e) => setInitialStage(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                >
                  <option value="triage">Nursing Triage (Recommended for vital signs)</option>
                  <option value="consultation">Direct Doctor Consultation</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewVisitModal(false)}
                  className="px-3 py-1.5 border rounded-lg border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                >
                  Admit to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showNewAptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Schedule Clinical Appointment</h3>
              <button onClick={() => setShowNewAptModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {aptError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded">
                {aptError}
              </div>
            )}

            <form onSubmit={handleCreateAppointment} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient *</label>
                <select
                  required
                  value={aptPatientId}
                  onChange={(e) => setAptPatientId(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                >
                  <option value="">Select registered patient...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.patient_no} - {p.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Clinician *</label>
                <select
                  required
                  value={aptDoctorId}
                  onChange={(e) => setAptDoctorId(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                >
                  <option value="usr_doc_01">Dr. Adeyemi Alabi, MBBS, FWACP (Internal Medicine)</option>
                  <option value="usr_admin_01">Dr. Kelechi Nwosu, MD (Chief Consultant)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    className="w-full p-2 border rounded-lg border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot *</label>
                  <select
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="09:30">09:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="15:00">03:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={aptDept}
                  onChange={(e) => setAptDept(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Visit *</label>
                <textarea
                  required
                  rows={2}
                  value={aptReason}
                  onChange={(e) => setAptReason(e.target.value)}
                  placeholder="e.g. Hypertension management follow-up, recurring migraine review"
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewAptModal(false)}
                  className="px-3 py-1.5 border rounded-lg border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

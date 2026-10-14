import React, { useState, useEffect } from 'react';
import { LaboratoryRequest, StaffUser } from '../types';
import { apiRequest, formatDate, formatDateTime } from '../lib/api';
import { PrintDocumentModal } from '../components/PrintDocumentModal';
import {
  FlaskConical,
  TestTubes,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ShieldCheck,
  Clock,
  Search,
  X
} from 'lucide-react';

interface LaboratoryPageProps {
  user: StaffUser;
}

export const LaboratoryPage: React.FC<LaboratoryPageProps> = ({ user }) => {
  const [requests, setRequests] = useState<LaboratoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [printDoc, setPrintDoc] = useState<any>(null);

  // Result entry form
  const [resultValue, setResultValue] = useState('');
  const [refRange, setRefRange] = useState('');
  const [unit, setUnit] = useState('');
  const [flag, setFlag] = useState('normal');
  const [techNotes, setTechNotes] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/api/laboratory/requests?status=${statusFilter}`);
      setRequests(res.requests || []);
    } catch (err) {
      console.error('Failed to load lab requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleCollectSpecimen = async (testId: string) => {
    try {
      await apiRequest(`/api/laboratory/tests/${testId}/collect-specimen`, {
        method: 'POST',
        body: JSON.stringify({ specimen_type: 'Blood' })
      });
      fetchRequests();
    } catch (err: any) {
      alert(`Specimen collection failed: ${err.message}`);
    }
  };

  const handleOpenResultModal = (test: any, request: any) => {
    setSelectedTest(test);
    setSelectedRequest(request);
    setResultValue(test.result_value || '');
    setRefRange(test.reference_range || (test.test_name.includes('Malaria') ? 'Negative' : 'Normal range'));
    setUnit(test.unit || (test.test_name.includes('Count') ? 'x10^9/L' : ''));
    setFlag(test.flag || 'normal');
    setTechNotes(test.technician_notes || '');
    setShowResultModal(true);
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) return;
    setMessage(null);

    try {
      await apiRequest(`/api/laboratory/tests/${selectedTest.id}/result`, {
        method: 'POST',
        body: JSON.stringify({
          result_value: resultValue,
          reference_range: refRange,
          unit,
          flag,
          technician_notes: techNotes
        })
      });
      setShowResultModal(false);
      setMessage({ type: 'success', text: 'Diagnostic result entered. Ready for verification.' });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleVerify = async (testId: string) => {
    setMessage(null);
    try {
      await apiRequest(`/api/laboratory/tests/${testId}/verify`, {
        method: 'POST'
      });
      setMessage({ type: 'success', text: 'Result verified and released to attending clinician.' });
      fetchRequests();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const canVerify = ['lab_tech', 'admin'].includes(user.role);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Diagnostic Laboratory Workflows</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Specimen tracking, test analysis, abnormal flag markers, and MLSCN verification
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['all', 'requested', 'sample_collected', 'in_progress', 'completed'].map((stg) => (
            <button
              key={stg}
              onClick={() => setStatusFilter(stg)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === stg ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {stg === 'all' ? 'All Requests' : stg.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            Loading laboratory requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs">
            No laboratory requests match this filter.
          </div>
        ) : (
          requests.map((r) => (
            <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">{r.request_no}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                      r.priority === 'stat' ? 'bg-red-100 text-red-800' : r.priority === 'urgent' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {r.priority}
                    </span>
                    <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 uppercase text-[10px]">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-slate-500 mt-1">
                    Patient: <strong className="text-slate-900">{r.patient_name}</strong> ({r.patient_no}) · Requesting Doctor: {r.doctor_name} · Visit Ref: {r.visit_no}
                  </div>
                  {r.clinical_notes && (
                    <div className="text-slate-600 italic mt-0.5">Indication: {r.clinical_notes}</div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPrintDoc(r)}
                    className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-semibold flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>

              {/* Individual Laboratory Tests */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-700 font-semibold text-[11px]">
                    <tr>
                      <th className="p-2.5">Test Specification</th>
                      <th className="p-2.5">Specimen</th>
                      <th className="p-2.5">Diagnostic Result</th>
                      <th className="p-2.5">Reference Range</th>
                      <th className="p-2.5">Status & Verification</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {r.tests?.map((t) => {
                      const isVerified = t.status === 'verified';
                      const isCollected = t.status !== 'pending';
                      return (
                        <tr key={t.id} className={t.flag === 'critical' || t.flag === 'abnormal' ? 'bg-red-50/40' : ''}>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{t.test_name}</div>
                            <div className="font-mono text-[10px] text-slate-400">{t.test_code}</div>
                          </td>
                          <td className="p-2.5 text-slate-600">
                            {t.specimen_type}
                            {t.specimen_collected_at && (
                              <div className="text-[10px] text-emerald-700 font-medium">Sample In Lab</div>
                            )}
                          </td>
                          <td className="p-2.5">
                            {t.result_value ? (
                              <div className="font-mono font-bold text-slate-900">
                                {t.result_value} {t.unit || ''}
                                {t.flag !== 'normal' && (
                                  <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-800 uppercase font-bold">
                                    {t.flag}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Result Pending</span>
                            )}
                          </td>
                          <td className="p-2.5 text-slate-600">{t.reference_range || '—'}</td>
                          <td className="p-2.5">
                            {isVerified ? (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verified ({t.verified_by_name || 'MLS'})</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold uppercase text-slate-500">
                                {t.status.replace('_', ' ')}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isCollected && (
                                <button
                                  onClick={() => handleCollectSpecimen(t.id)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs"
                                >
                                  Collect Sample
                                </button>
                              )}

                              {!isVerified && (
                                <>
                                  <button
                                    onClick={() => handleOpenResultModal(t, r)}
                                    className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded text-xs"
                                  >
                                    Enter Result
                                  </button>

                                  {t.result_value && canVerify && (
                                    <button
                                      onClick={() => handleVerify(t.id)}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs flex items-center gap-1"
                                    >
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>Verify & Release</span>
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Result Entry Modal */}
      {showResultModal && selectedTest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Enter Diagnostic Result</h3>
              <button onClick={() => setShowResultModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="mt-4 space-y-3">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                Test: <strong className="text-slate-900">{selectedTest.test_name}</strong>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Result Value *</label>
                <input
                  type="text"
                  required
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  placeholder="e.g. Plasmodium falciparum +++ (Ring trophozoites seen) or 12.4"
                  className="w-full p-2 border rounded border-slate-300 font-bold font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Units</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. g/dL, mmol/L, /uL"
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reference Range</label>
                  <input
                    type="text"
                    value={refRange}
                    onChange={(e) => setRefRange(e.target.value)}
                    placeholder="e.g. Negative or 11.5 - 16.5"
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Flag</label>
                <select
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  className="w-full p-2 border rounded border-slate-300 bg-white"
                >
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                  <option value="high">High</option>
                  <option value="abnormal">Abnormal / Positive</option>
                  <option value="critical">Critical / Life Threat</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Laboratory Remarks</label>
                <textarea
                  rows={2}
                  value={techNotes}
                  onChange={(e) => setTechNotes(e.target.value)}
                  placeholder="e.g. Repeated in duplicate for quality assurance."
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Document Modal */}
      {printDoc && (
        <PrintDocumentModal
          title="Diagnostic Laboratory Report"
          documentType="lab_report"
          data={printDoc}
          onClose={() => setPrintDoc(null)}
        />
      )}

    </div>
  );
};

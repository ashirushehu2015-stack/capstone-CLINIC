import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import { formatNGN, formatDate, formatDateTime } from '../lib/api';
import { ClinicLogo } from './ClinicLogo';

interface PrintDocumentModalProps {
  title: string;
  documentType: 'receipt' | 'lab_report' | 'prescription' | 'consultation';
  data: any;
  onClose: () => void;
}

export const PrintDocumentModal: React.FC<PrintDocumentModalProps> = ({
  title,
  documentType,
  data,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:p-0 print:bg-white">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col print:border-none print:shadow-none print:max-h-none">
        
        {/* Modal Top Actions (Hidden in print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 print:hidden">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Printable Sheet */}
        <div className="p-8 overflow-y-auto print:p-0 text-slate-800 text-xs font-sans print:text-black">
          
          {/* Clinic Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 shrink-0">
                <ClinicLogo variant="icon-only" className="w-14 h-14" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-950 uppercase">
                  AL-EMAN CLINIC AND MATERNITY HOME
                </h1>
                <p className="text-[11px] text-slate-600">
                  NO. 19 GULMA ROAD, ARGUNGU, KEBBI STATE · Tel: 08069452164, 07066694834
                </p>
                <p className="text-[11px] text-slate-500">
                  FMOH / State Ministry of Health Licensed Private Clinic &amp; Maternity Home
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono font-semibold text-slate-600 uppercase border border-slate-300 px-2 py-0.5 rounded">
                Official Staff Record
              </span>
              <p className="text-[10px] text-slate-500 mt-1">Printed: {formatDateTime(new Date().toISOString())}</p>
            </div>
          </div>

          {/* Document Body depending on Type */}
          {documentType === 'receipt' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Official Receipt No:</span>
                  <div className="font-mono font-bold text-sm text-slate-900">{data.payment_no || 'REC-2026-0001'}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Payment Status:</span>
                  <div className="font-bold text-emerald-700 uppercase">Confirmed & Reconciled</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Patient:</span>
                  <div className="font-semibold text-slate-900">{data.patient_name}</div>
                  <div className="font-mono text-slate-600">{data.patient_no}</div>
                </div>
                <div>
                  <span className="text-slate-500">Payment Details:</span>
                  <div>Method: <strong className="uppercase">{data.payment_method}</strong></div>
                  <div>Ref: <span className="font-mono">{data.transaction_reference}</span></div>
                  <div>Cashier: {data.cashier_name || 'Accounts Desk'}</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Unit Price</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.items && data.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2">{item.description}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right font-mono">{formatNGN(item.unit_price)}</td>
                        <td className="p-2 text-right font-mono font-medium">{formatNGN(item.total_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-900 font-semibold bg-slate-50">
                    <tr>
                      <td colSpan={3} className="p-2 text-right text-xs">Amount Paid:</td>
                      <td className="p-2 text-right font-mono text-sm text-teal-800">{formatNGN(data.amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p>Computer-generated receipt. Authentic without physical seal if transaction reference is verified.</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 w-48">
                  <span>Authorized Cashier Signature</span>
                </div>
              </div>
            </div>
          )}

          {documentType === 'lab_report' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Laboratory Request Ref:</span>
                  <div className="font-mono font-bold text-sm text-slate-900">{data.request_no}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Doctor in Charge:</span>
                  <div className="font-semibold text-slate-800">{data.doctor_name}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                <div>Patient: <strong>{data.patient_name}</strong></div>
                <div>ID: <strong className="font-mono">{data.patient_no}</strong></div>
                <div>Age/Sex: {data.age}y / {data.sex}</div>
              </div>

              <div className="border border-slate-200 rounded mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2">Test Name</th>
                      <th className="p-2">Specimen</th>
                      <th className="p-2">Result</th>
                      <th className="p-2">Reference Range</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.tests && data.tests.map((t: any, i: number) => (
                      <tr key={i} className={t.flag === 'critical' || t.flag === 'abnormal' ? 'bg-red-50/50' : ''}>
                        <td className="p-2 font-medium">{t.test_name}</td>
                        <td className="p-2">{t.specimen_type}</td>
                        <td className="p-2 font-mono font-bold text-slate-900">
                          {t.result_value || 'Pending'} {t.unit || ''}
                          {t.flag !== 'normal' && (
                            <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-red-100 text-red-800 uppercase font-bold">
                              {t.flag}
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-slate-600">{t.reference_range || '—'}</td>
                        <td className="p-2 uppercase text-[10px] font-semibold text-emerald-700">
                          {t.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p>Electronically Verified Laboratory Report.</p>
                  <p className="text-[10px]">Medical Laboratory Science Council of Nigeria (MLSCN) Standardized Diagnostic Record.</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 w-52">
                  <span className="font-semibold text-slate-800">MLS Chinedu Okafor</span>
                  <div className="text-[10px] text-slate-500">Verified Medical Laboratory Scientist</div>
                </div>
              </div>
            </div>
          )}

          {documentType === 'prescription' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Prescription Order No:</span>
                  <div className="font-mono font-bold text-sm text-slate-900">{data.prescription_no}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Prescribing Clinician:</span>
                  <div className="font-semibold text-slate-800">{data.doctor_name}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded border border-slate-200 text-xs">
                <div>Patient: <strong>{data.patient_name}</strong></div>
                <div>ID: <strong className="font-mono">{data.patient_no}</strong></div>
                <div>Known Allergies: <strong className="text-red-700">{data.allergies || 'None'}</strong></div>
              </div>

              <div className="border border-slate-200 rounded mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Medication (Generic/Brand)</th>
                      <th className="p-2">Dosage & Route</th>
                      <th className="p-2">Frequency & Duration</th>
                      <th className="p-2 text-center">Qty Prescribed</th>
                      <th className="p-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data.items && data.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="p-2 font-mono">{i + 1}</td>
                        <td className="p-2 font-semibold text-slate-900">{item.medicine_name}</td>
                        <td className="p-2">{item.dosage} · {item.route}</td>
                        <td className="p-2">{item.frequency} x {item.duration_days} days</td>
                        <td className="p-2 text-center font-bold">{item.quantity_prescribed}</td>
                        <td className="p-2 text-slate-600">{item.instructions || 'As directed'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p>Valid official medical prescription. Requires dispensing authorization by registered pharmacist.</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 w-52">
                  <span className="font-semibold text-slate-800">{data.doctor_name}</span>
                  <div className="text-[10px] text-slate-500">Prescribing Clinician Signature</div>
                </div>
              </div>
            </div>
          )}

          {documentType === 'consultation' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Consultation Note:</span>
                  <div className="font-mono font-bold text-sm text-slate-900">Signed Clinical Encounter</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Attending Physician:</span>
                  <div className="font-semibold text-slate-800">{data.doctor_name}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500">Presenting Complaint:</span>
                  <p className="font-medium text-slate-900 mt-0.5">{data.presenting_complaint}</p>
                </div>
                <div>
                  <span className="text-slate-500">History of Present Illness:</span>
                  <p className="font-medium text-slate-900 mt-0.5">{data.history_of_present_illness}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-slate-200">
                <div>
                  <span className="text-slate-500">Physical Examination:</span>
                  <p className="font-medium text-slate-900 mt-0.5">{data.physical_examination}</p>
                </div>
                <div>
                  <span className="text-slate-500">Clinical Assessment:</span>
                  <p className="font-medium text-slate-900 mt-0.5">{data.clinical_assessment}</p>
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded">
                <span className="text-[10px] uppercase font-bold text-teal-800">Primary Diagnosis:</span>
                <div className="text-sm font-bold text-teal-950 mt-0.5">{data.primary_diagnosis}</div>
                {data.secondary_diagnoses && (
                  <div className="text-xs text-teal-800 mt-1">Secondary: {data.secondary_diagnoses}</div>
                )}
              </div>

              <div className="text-xs">
                <span className="text-slate-500">Management & Treatment Plan:</span>
                <p className="font-medium text-slate-900 mt-0.5">{data.treatment_plan}</p>
              </div>

              <div className="pt-8 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p>Confidential Electronic Health Record. Protected under medical data privacy legislation.</p>
                </div>
                <div className="text-center border-t border-slate-400 pt-1 w-52">
                  <span className="font-semibold text-slate-800">{data.doctor_name}</span>
                  <div className="text-[10px] text-slate-500">Locked & Authoritatively Signed</div>
                </div>
              </div>
            </div>
          )}

          {/* Document Base Notice */}
          <div className="mt-8 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
            AL-EMAN CLINIC AND MATERNITY HOME · Copyright @ MIT Capstone Project · No. 19 Gulma Road, Argungu, Kebbi State · Tel: 08069452164, 07066694834
          </div>

        </div>
      </div>
    </div>
  );
};

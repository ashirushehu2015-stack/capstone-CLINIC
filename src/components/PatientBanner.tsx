import React from 'react';
import { Patient } from '../types';
import { AlertCircle, ShieldAlert, Phone, UserCheck, X } from 'lucide-react';

interface PatientBannerProps {
  patient: Patient;
  onClearPatient?: () => void;
}

export const PatientBanner: React.FC<PatientBannerProps> = ({ patient, onClearPatient }) => {
  const hasAllergies = patient.allergies && patient.allergies.toLowerCase() !== 'none known' && patient.allergies.toLowerCase() !== 'none';

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Core Patient Identity */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-teal-100/70 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
            {patient.sex === 'M' ? 'M' : patient.sex === 'F' ? 'F' : 'PT'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {patient.full_name}
              </h2>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800">
                {patient.patient_no}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {patient.age} yrs · {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex} · DOB: {patient.dob}
              </span>
            </div>

            {/* Demographics row */}
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 flex-wrap">
              {patient.blood_group && (
                <span>
                  Blood: <strong className="text-slate-800 font-semibold">{patient.blood_group}</strong> ({patient.genotype || 'AA'})
                </span>
              )}
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {patient.phone}
              </span>
              <span className="text-slate-300">|</span>
              <span>
                ICE: {patient.emergency_contact_name} ({patient.emergency_contact_phone})
              </span>
            </div>
          </div>
        </div>

        {/* Dismiss / Change Selection */}
        {onClearPatient && (
          <button
            onClick={onClearPatient}
            className="self-start md:self-center p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition-colors"
            title="Deselect patient"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* High Alert Banners (Allergies & Medical Alerts) */}
      <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row gap-2">
        {hasAllergies ? (
          <div className="flex-1 flex items-center gap-2 bg-red-50 border border-red-200 text-red-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              <strong className="font-semibold text-red-700">KNOWN ALLERGY:</strong> {patient.allergies}
            </span>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs">
            <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No documented drug allergies on record</span>
          </div>
        )}

        {patient.medical_alerts && (
          <div className="flex-1 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1.5 rounded-lg text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong className="font-semibold text-amber-700">ALERT:</strong> {patient.medical_alerts}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

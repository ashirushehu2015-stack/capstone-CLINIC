import React from 'react';
import {
  X,
  Phone,
  Baby,
  Activity,
  Microscope,
  Stethoscope,
  Pill,
  FileCheck,
  MapPin,
  Clock,
  CheckCircle2,
  Building
} from 'lucide-react';

interface FacilityServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FacilityServicesModal: React.FC<FacilityServicesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-blue-800/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="bg-[#002868] px-6 py-4 flex items-center justify-between border-b border-blue-700/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0047AB] border border-[#FFC72C]/40 flex items-center justify-center text-[#FFC72C]">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Al-Eman Clinical Services &amp; Facility Directory
              </h2>
              <p className="text-xs text-blue-200">
                No. 19 Gulma Road, Argungu, Kebbi State · 24/7 Operational Facility
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-800/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Quick Hotlines Banner */}
          <div className="p-4 rounded-xl bg-blue-950/80 border border-blue-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#FFC72C] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#FFC72C] uppercase tracking-wider">
                  24/7 Emergency &amp; Maternity Hotlines
                </div>
                <div className="text-xs text-blue-100">Direct admission dispatch to on-duty midwives and clinicians</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="tel:08069452164"
                className="px-3.5 py-1.5 rounded-lg bg-[#FFC72C] hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono shadow-sm transition-all"
              >
                08069452164
              </a>
              <a
                href="tel:07066694834"
                className="px-3.5 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 border border-blue-600 text-white font-bold text-xs font-mono shadow-sm transition-all"
              >
                07066694834
              </a>
            </div>
          </div>

          {/* 6 Core Clinical Departments */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FFC72C]" />
              <span>Core Clinical &amp; Maternity Specialties</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                    <Baby className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">24/7 Maternity &amp; Labor Ward</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Antenatal clinics (ANC), skilled midwife deliveries, neonatal resuscitation, postpartum observation, and maternal monitoring suites.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                    <Activity className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Ultrasound &amp; Sonography</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  High-resolution obstetric ultrasonography, fetal anatomy scans, gestational dating, placenta localization, and abdominal/pelvic examinations.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                    <Microscope className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Medical Pathology &amp; Lab</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Full blood count (FBC), blood grouping and crossmatch, malaria microscopy, prenatal serology, urinalysis, and rapid infectious disease screening.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Outpatient &amp; Inpatient Care</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  General clinical consultations, pediatric healthcare, emergency stabilization, intravenous fluid therapy, and continuous patient ward supervision.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                    <Pill className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Pharmacy &amp; Dispensary</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Stocked essential maternal medications, intravenous antibiotics, neonatal therapeutics, nutritional supplements, and strict temperature-controlled storage.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-sm text-white">Secured EMR &amp; Digital Records</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Longitudinal electronic medical records, automated patient numbering, barcode identification, verified receipts, and tamper-evident audit logs.
                </p>
              </div>

            </div>
          </div>

          {/* Location & Hours Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#FFC72C] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">Facility Address</div>
                <div className="text-xs text-slate-200 mt-0.5">No. 19 Gulma Road, Argungu, Kebbi State, Nigeria</div>
                <div className="text-[11px] text-slate-400 mt-1">Dedicated emergency entrance &amp; ambulance bay</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FFC72C] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-white uppercase tracking-wider">Operational Hours</div>
                <div className="text-xs text-slate-200 mt-0.5">Maternity &amp; Emergencies: 24 Hours / 7 Days</div>
                <div className="text-[11px] text-slate-400 mt-1">General Outpatient: 8:00 AM – 10:00 PM Daily</div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>© {new Date().getFullYear()} Al-Eman Clinic &amp; Maternity Home</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};

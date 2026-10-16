import React, { useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { apiRequest } from '../lib/api';
import { ClinicLogo } from '../components/ClinicLogo';
import { ChapterOneModal } from '../components/ChapterOneModal';
import { FacilityServicesModal } from '../components/FacilityServicesModal';
import {
  ShieldCheck,
  Lock,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Activity,
  CheckCircle2,
  Building,
  Phone,
  UserCheck,
  Baby,
  Pill,
  Microscope,
  Stethoscope,
  MapPin,
  FileCheck,
  FileText,
  Key
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: StaffUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [showChapterOne, setShowChapterOne] = useState(false);
  const [showFacilityServices, setShowFacilityServices] = useState(false);
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('ClinicPass@2026');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Update live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const demoPresets = [
    {
      label: 'Dr. Kelechi Nwosu',
      user: 'admin',
      role: 'System Admin',
      dept: 'Chief Medical Directorate',
      badgeColor: 'border-purple-200 bg-purple-50 text-purple-800'
    },
    {
      label: 'Dr. Adeyemi Alabi',
      user: 'dr.adeyemi',
      role: 'Clinician / EMR',
      dept: 'Outpatient & Internal Medicine',
      badgeColor: 'border-blue-200 bg-blue-50 text-blue-800'
    },
    {
      label: 'RN Funke Adeleke',
      user: 'nurse.funke',
      role: 'Staff Nurse',
      dept: 'Triage & Vital Signs',
      badgeColor: 'border-emerald-200 bg-emerald-50 text-emerald-800'
    },
    {
      label: 'Pharm. Ibrahim Bello',
      user: 'pharm.ibrahim',
      role: 'Pharmacist',
      dept: 'Formulary & Dispensing',
      badgeColor: 'border-amber-200 bg-amber-50 text-amber-800'
    },
    {
      label: 'MLS Chinedu Okafor',
      user: 'lab.chinedu',
      role: 'Lab Scientist',
      dept: 'Diagnostic Pathology',
      badgeColor: 'border-cyan-200 bg-cyan-50 text-cyan-800'
    },
    {
      label: 'Ngozi Eze',
      user: 'rec.ngozi',
      role: 'Receptionist',
      dept: 'Patient Registration & Queue',
      badgeColor: 'border-indigo-200 bg-indigo-50 text-indigo-800'
    },
    {
      label: 'Fatima Danjuma',
      user: 'cashier.fatima',
      role: 'Cashier / Revenue',
      dept: 'Billing & POS Reconciliation',
      badgeColor: 'border-teal-200 bg-teal-50 text-teal-800'
    },
    {
      label: 'Olumide Bakare',
      user: 'mgr.olumide',
      role: 'Clinic Manager',
      dept: 'Operations & Compliance',
      badgeColor: 'border-rose-200 bg-rose-50 text-rose-800'
    }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, mfaCode: mfaCode || undefined })
      });

      localStorage.setItem('clinic_auth_token', data.token);
      localStorage.setItem('clinic_staff_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (username: string) => {
    setIdentifier(username);
    setPassword('ClinicPass@2026');
    setErrorMessage(null);
  };

  return (
    <div className="h-screen w-screen max-h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col selection:bg-[#FFC72C] selection:text-slate-950">
      
      {/* ============================================================== */}
      {/* 1. TOP STATUS & NAVIGATION BAR                                 */}
      {/* ============================================================== */}
      <header className="h-11 sm:h-12 shrink-0 border-b border-blue-900/50 bg-[#020b18]/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-20 text-xs">
        {/* Left: Operational status and location */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono tracking-wider text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-ping" />
            <span className="text-[#FFC72C] font-semibold uppercase">Operational 24/7</span>
            <span className="text-blue-400/60">|</span>
            <span className="text-white font-medium">AL-EMAN EMR V3.4</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-blue-300/80 text-[11px] pl-3 border-l border-blue-900/60 font-sans">
            <MapPin className="w-3 h-3 text-[#FFC72C]" />
            <span>No. 19 Gulma Road, Argungu, Kebbi State</span>
          </div>
        </div>

        {/* Right: Quick actions and emergency lines */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Emergency Hotlines */}
          <div className="hidden sm:flex items-center gap-2 text-[11px]">
            <a
              href="tel:08069452164"
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-700/50 text-[#FFC72C] hover:bg-blue-900 transition-colors font-mono"
              title="Click to dial 24/7 admission line"
            >
              <Phone className="w-2.5 h-2.5 text-[#FFC72C]" />
              <span>08069452164</span>
            </a>
          </div>

          {/* Facility Services Directory Modal Button */}
          <button
            onClick={() => setShowFacilityServices(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-700/50 text-blue-200 hover:text-white text-[11px] font-medium transition-colors cursor-pointer"
            title="View medical departments, diagnostic equipment, and operating hours"
          >
            <Activity className="w-3 h-3 text-[#FFC72C]" />
            <span className="hidden sm:inline">Facility</span>
            <span>Services</span>
          </button>

          {/* Academic Capstone Thesis Button */}
          <button
            onClick={() => setShowChapterOne(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFC72C] hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all cursor-pointer"
            title="View and download complete MIT Capstone Thesis (Chapters 1–5, Diagrams & Appendices) as Microsoft Word docx"
          >
            <FileText className="w-3 h-3 text-slate-950" />
            <span className="hidden md:inline">MIT</span>
            <span>Thesis (Docx)</span>
          </button>

          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-blue-300 pl-2 border-l border-blue-900/60">
            <Clock className="w-3 h-3 text-[#FFC72C]" />
            <span>{currentTime || '08:00 AM'}</span>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MAIN SPLIT BODY (SINGLE NON-SCROLLABLE SCREEN)              */}
      {/* ============================================================== */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* ------------------------------------------------------------ */}
        {/* LEFT COLUMN: BRAND EMBLEM & INSTITUTIONAL SHOWCASE          */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between p-4 sm:p-6 lg:p-7 bg-gradient-to-br from-slate-950 via-[#031d45] to-[#002868] relative overflow-hidden border-b lg:border-b-0 lg:border-r border-blue-900/40">
          
          {/* Subtle Ambient Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(#0047AB_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#0047AB]/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#FFC72C]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Center Brand Emblem Showcase */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
            
            {/* Scaled Responsive Emblem */}
            <ClinicLogo variant="single-page" showTagline={true} />

            {/* Compact Highlight Badges */}
            <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3 max-w-md w-full text-center">
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-950/70 border border-blue-700/50 backdrop-blur-xs">
                <div className="text-sm sm:text-base font-bold text-[#FFC72C]">24 / 7</div>
                <div className="text-[9px] sm:text-[10px] text-blue-200 uppercase tracking-wider font-medium">
                  Maternity &amp; Care
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-950/70 border border-blue-700/50 backdrop-blur-xs">
                <div className="text-sm sm:text-base font-bold text-[#FFC72C]">Argungu</div>
                <div className="text-[9px] sm:text-[10px] text-blue-200 uppercase tracking-wider font-medium">
                  Kebbi State
                </div>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-blue-950/70 border border-blue-700/50 backdrop-blur-xs">
                <div className="text-sm sm:text-base font-bold text-[#FFC72C]">100%</div>
                <div className="text-[9px] sm:text-[10px] text-blue-200 uppercase tracking-wider font-medium">
                  Audit Protected
                </div>
              </div>
            </div>

            {/* Quick Clinical Specialty Pills */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 max-w-lg text-[10px] text-blue-200">
              <span className="px-2 py-0.5 rounded-full bg-blue-900/50 border border-blue-700/40 flex items-center gap-1">
                <Baby className="w-2.5 h-2.5 text-[#FFC72C]" />
                Maternity &amp; ANC
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-900/50 border border-blue-700/40 flex items-center gap-1">
                <Activity className="w-2.5 h-2.5 text-[#FFC72C]" />
                Diagnostic Ultrasound
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-900/50 border border-blue-700/40 flex items-center gap-1">
                <Microscope className="w-2.5 h-2.5 text-[#FFC72C]" />
                Automated Pathology Lab
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-900/50 border border-blue-700/40 flex items-center gap-1">
                <Pill className="w-2.5 h-2.5 text-[#FFC72C]" />
                Regulated Pharmacy
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-900/50 border border-blue-700/40 flex items-center gap-1">
                <FileCheck className="w-2.5 h-2.5 text-[#FFC72C]" />
                Digital EMR
              </span>
            </div>

          </div>

          {/* Bottom Dispatch & Thesis Bar */}
          <div className="relative z-10 pt-2 border-t border-blue-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-200/90 shrink-0">
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
              <span className="font-semibold text-white tracking-wide uppercase font-mono text-[10px] sm:text-[11px]">
                NO. 19 GULMA ROAD, ARGUNGU, KEBBI STATE
              </span>
            </div>
            
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <Phone className="w-3 h-3 text-[#FFC72C]" />
              <a href="tel:08069452164" className="hover:text-[#FFC72C] transition-colors text-white font-bold">
                08069452164
              </a>
              <span className="text-blue-400">·</span>
              <a href="tel:07066694834" className="hover:text-[#FFC72C] transition-colors text-white font-bold">
                07066694834
              </a>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT COLUMN: SECURE CLINICAL STAFF LOGIN & ROLE SELECTOR   */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-5 h-full bg-slate-100 text-slate-900 flex flex-col justify-center items-center p-3 sm:p-5 lg:p-6 overflow-hidden">
          
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-200 overflow-hidden flex flex-col my-auto">
            
            {/* Card Header */}
            <div className="bg-[#002868] px-4 sm:px-5 py-3 text-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FFC72C] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFC72C]" />
                  <span>Authorized Staff Terminal</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-blue-200">
                  <Clock className="w-3 h-3 text-blue-300" />
                  <span>{currentTime || '08:00 AM'}</span>
                </div>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight mt-1">
                Sign In to Clinical Portal
              </h2>
            </div>

            {/* Card Body */}
            <div className="p-3.5 sm:p-4.5 flex flex-col gap-2.5">
              
              {errorMessage && (
                <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                    Staff Username or Clinical Identifier
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    placeholder="e.g. admin or dr.adeyemi"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047AB] bg-white text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-[#0047AB] hover:text-[#00398A] font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047AB] bg-white text-slate-900"
                  />
                </div>

                {/* Optional Collapsible MFA field */}
                {showMfa ? (
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                      MFA / Authenticator Passcode
                    </label>
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      placeholder="6-digit authenticator code"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0047AB] bg-slate-50 font-mono tracking-widest text-slate-900"
                    />
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowMfa(true)}
                      className="text-[10px] text-slate-500 hover:text-[#0047AB] flex items-center gap-1 cursor-pointer"
                    >
                      <Key className="w-2.5 h-2.5" />
                      <span>Use Authenticator / MFA</span>
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2 px-3 bg-[#0047AB] hover:bg-[#00398A] active:bg-[#002f73] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating credentials...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Sign In to Clinical System</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Staff Account Switcher Matrix */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-[#0047AB]" />
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Demo Staff Roles (Click to Fill)
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono bg-slate-100 px-1 py-0.2 rounded">
                    Pass: ClinicPass@2026
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {demoPresets.map((p) => {
                    const isSelected = identifier === p.user;
                    return (
                      <button
                        key={p.user}
                        type="button"
                        onClick={() => handleSelectPreset(p.user)}
                        className={`text-left p-1.5 rounded-lg border text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0047AB] bg-blue-50/90 shadow-xs ring-1 ring-[#0047AB]'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 truncate text-[11px]">
                            {p.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3 text-[#0047AB] shrink-0" />
                          )}
                        </div>
                        <div className="text-[9px] text-[#0047AB] font-medium truncate">
                          {p.role}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Audit & Compliance Notice */}
              <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200 text-center text-[9px] text-slate-500 leading-tight flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
                <span>
                  Protected under NDPR &amp; Hospital Security Guidelines. Immutable audit trail active.
                </span>
              </div>

            </div>
          </div>

          {/* Bottom card footer */}
          <div className="mt-2 text-center text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700">Copyright @ MIT Capstone Project</span>
            <span className="mx-1 text-slate-400">·</span>
            <span>AL-EMAN CLINIC AND MATERNITY HOME</span>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. FIXED BOTTOM FOOTER BAR                                     */}
      {/* ============================================================== */}
      <footer className="h-7 shrink-0 px-3 sm:px-6 bg-[#010814] border-t border-blue-900/60 flex items-center justify-between text-[10px] text-slate-400 z-20">
        <div>
          © {new Date().getFullYear()} AL-EMAN CLINIC AND MATERNITY HOME · No. 19 Gulma Road, Argungu, Kebbi State
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[#FFC72C] font-semibold">Hospital EMR &amp; Maternity System</span>
          <span className="text-slate-600">|</span>
          <span>Argungu Municipal Facility</span>
        </div>
      </footer>

      {/* Chapter One Academic Modal Viewer & Word (.docx) Downloader */}
      <ChapterOneModal
        isOpen={showChapterOne}
        onClose={() => setShowChapterOne(false)}
      />

      {/* Facility Services & Directory Modal */}
      <FacilityServicesModal
        isOpen={showFacilityServices}
        onClose={() => setShowFacilityServices(false)}
      />

    </div>
  );
};

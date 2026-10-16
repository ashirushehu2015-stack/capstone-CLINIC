import React, { useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { apiRequest } from '../lib/api';
import { ClinicLogo } from '../components/ClinicLogo';
import { ChapterOneModal } from '../components/ChapterOneModal';
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
  Mail,
  UserCheck,
  Server,
  ChevronDown,
  ArrowUp,
  Stethoscope,
  Baby,
  Pill,
  Microscope,
  MapPin,
  Calendar,
  Heart,
  FileCheck,
  FileText,
  Download,
  GraduationCap
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: StaffUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [showChapterOne, setShowChapterOne] = useState(false);
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('ClinicPass@2026');
  const [mfaCode, setMfaCode] = useState('');
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col selection:bg-[#FFC72C] selection:text-slate-950 overflow-x-hidden overflow-y-auto scroll-smooth">
      
      {/* ============================================================== */}
      {/* 1. TOP SPLIT HERO: WHOLE LOGO HALF-PAGE & STAFF LOGIN PORTAL   */}
      {/* ============================================================== */}
      <div id="top-portal" className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 border-b border-blue-900/40">
        
        {/* ------------------------------------------------------------ */}
        {/* LEFT HALF: THE WHOLE LOGO & INSTITUTIONAL BRAND SHOWCASE     */}
        {/* ------------------------------------------------------------ */}
        <div className="lg:col-span-7 relative w-full bg-gradient-to-br from-slate-950 via-[#031d45] to-[#002868] text-white flex flex-col justify-between p-6 sm:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-blue-900/40">
          
          {/* Subtle Ambient Background Texture */}
          <div className="absolute inset-0 bg-[radial-gradient(#0047AB_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0047AB]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FFC72C]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Header of Left Half */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 text-xs text-blue-200/80">
            <div className="flex items-center gap-2 font-mono tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFC72C] animate-ping" />
              <span className="text-[#FFC72C] font-semibold uppercase">Operational 24/7</span>
              <span className="text-blue-400/60">|</span>
              <span className="text-white">AL-EMAN EMR V3.4</span>
            </div>

            {/* Quick Emergency Phone Badges */}
            <div className="flex items-center gap-2 text-[11px]">
              <a
                href="tel:08069452164"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-[#FFC72C] hover:bg-blue-900 transition-colors font-mono"
              >
                <Phone className="w-3 h-3 text-[#FFC72C]" />
                <span>08069452164</span>
              </a>
              <a
                href="tel:07066694834"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-[#FFC72C] hover:bg-blue-900 transition-colors font-mono"
              >
                <Phone className="w-3 h-3 text-[#FFC72C]" />
                <span>07066694834</span>
              </a>
            </div>
          </div>

          {/* Center: The Whole Logo Placed as Half-Page Showcase */}
          <div className="relative z-10 my-auto py-8 sm:py-10 flex flex-col items-center justify-center">
            {/* Main Whole Logo Component */}
            <ClinicLogo variant="half-page" showTagline={true} />

            {/* Quick Institutional Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg w-full text-center">
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-700/40 backdrop-blur-xs">
                <div className="text-base sm:text-lg font-bold text-[#FFC72C]">24 / 7</div>
                <div className="text-[10px] sm:text-[11px] text-blue-200 uppercase tracking-wider mt-0.5">
                  Maternity & Care
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-700/40 backdrop-blur-xs">
                <div className="text-base sm:text-lg font-bold text-[#FFC72C]">Argungu</div>
                <div className="text-[10px] sm:text-[11px] text-blue-200 uppercase tracking-wider mt-0.5">
                  Kebbi State
                </div>
              </div>
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-700/40 backdrop-blur-xs">
                <div className="text-base sm:text-lg font-bold text-[#FFC72C]">100%</div>
                <div className="text-[10px] sm:text-[11px] text-blue-200 uppercase tracking-wider mt-0.5">
                  Audit Protected
                </div>
              </div>
            </div>

            {/* Scroll Indicator Button */}
            <button
              onClick={() => scrollToSection('facility-details')}
              className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-900/60 hover:bg-blue-800 border border-blue-600/50 text-blue-200 text-xs transition-all cursor-pointer shadow-sm hover:text-white"
            >
              <span>Scroll down to view facility services &amp; hotlines</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#FFC72C] animate-bounce" />
            </button>
          </div>

          {/* Bottom Footer of Left Half */}
          <div className="relative z-10 pt-4 border-t border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-blue-200/90">
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
              <span className="font-semibold text-white tracking-wide">
                NO. 19 GULMA ROAD, ARGUNGU, KEBBI STATE
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-blue-200 text-[11px]">
              <button
                onClick={() => setShowChapterOne(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFC72C] hover:bg-amber-400 text-slate-950 font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                title="View and download complete MIT Capstone Thesis (Chapters 1–5, Diagrams & Appendices) as Microsoft Word docx"
              >
                <FileText className="w-3.5 h-3.5 text-slate-950" />
                <span>Capstone Thesis (Chapters 1–5 Docx)</span>
              </button>
              <span className="text-[#FFC72C] font-semibold tracking-wide">
                Copyright @ MIT Capstone Project
              </span>
              <span className="text-blue-400/60 hidden sm:inline">|</span>
              <div className="flex items-center gap-1.5 font-mono text-white">
                <Phone className="w-3 h-3 text-[#FFC72C]" />
                <a href="tel:08069452164" className="hover:text-[#FFC72C] transition-colors">08069452164</a>
                <span>,</span>
                <a href="tel:07066694834" className="hover:text-[#FFC72C] transition-colors">07066694834</a>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT HALF: SECURE CLINICAL STAFF LOGIN & ACCESS PORTAL     */}
        {/* ------------------------------------------------------------ */}
        <div id="staff-login" className="lg:col-span-5 w-full bg-slate-50 text-slate-900 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-10">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-slate-200 overflow-hidden my-auto">
            
            {/* Form Header */}
            <div className="bg-[#002868] px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FFC72C] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[#FFC72C]" />
                  <span>Authorized Staff Terminal</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-blue-200">
                  <Clock className="w-3 h-3 text-blue-300" />
                  <span>{currentTime || '08:00 AM'}</span>
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-white tracking-tight mt-2">
                Sign In to Clinical Portal
              </h2>
              <p className="text-xs text-blue-100/80 mt-0.5">
                Enter your institutional credentials or select an account below.
              </p>
            </div>

            {/* Form Body */}
            <div className="p-6">
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 font-medium">{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Staff Username or Clinical Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                      placeholder="e.g. admin or dr.adeyemi"
                      className="w-full pl-3 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-[#0047AB] bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-[#0047AB] hover:text-[#00398A] font-medium flex items-center gap-1 cursor-pointer"
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
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-[#0047AB] bg-white text-slate-900"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-600">
                      MFA Passcode
                    </label>
                    <span className="text-[10px] text-slate-400">(Optional / Privileged)</span>
                  </div>
                  <input
                    type="text"
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="6-digit authenticator code if active"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0047AB] bg-slate-50 font-mono tracking-widest text-slate-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-[#0047AB] hover:bg-[#00398A] active:bg-[#002f73] disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#0047AB]" />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Quick Role Selector
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                    Pass: ClinicPass@2026
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {demoPresets.map((p) => {
                    const isSelected = identifier === p.user;
                    return (
                      <button
                        key={p.user}
                        type="button"
                        onClick={() => handleSelectPreset(p.user)}
                        className={`text-left p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0047AB] bg-blue-50 shadow-xs ring-1 ring-[#0047AB]'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/90 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 truncate">
                            {p.label}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0047AB] shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] text-[#0047AB] font-medium mt-0.5 truncate">
                          {p.role}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 truncate">
                          {p.dept}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Security Audit & Compliance Notice */}
              <div className="mt-4 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center text-[10px] text-slate-500 leading-relaxed flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                <span>
                  Protected under NDPR &amp; Hospital Information Security Guidelines. All actions logged in audit trail.
                </span>
              </div>

            </div>
          </div>

          {/* Bottom copyright */}
          <div className="mt-4 text-center text-[11px] text-slate-500 space-y-0.5">
            <div className="font-medium text-slate-700">
              Copyright @ MIT Capstone Project
            </div>
            <div className="text-[10px] text-slate-400">
              © {new Date().getFullYear()} AL-EMAN CLINIC AND MATERNITY HOME · No. 19 Gulma Road, Argungu, Kebbi State
            </div>
            <div className="text-[10px] font-mono text-slate-500 pt-0.5">
              Tel: 08069452164 · 07066694834
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 2. SCROLLABLE SECTION: 24/7 HELPLINES & CLINIC DISPATCH BANNER  */}
      {/* ============================================================== */}
      <section id="facility-details" className="w-full bg-[#001f4d] border-b border-blue-800/60 py-8 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0047AB] border border-[#FFC72C]/40 flex items-center justify-center text-[#FFC72C] shadow-lg shrink-0">
              <Phone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FFC72C]">
                  24/7 Emergency &amp; Maternal Admission Hotlines
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Need Immediate Clinical Assistance or Maternity Admission?
              </h3>
              <p className="text-xs text-blue-200 mt-1">
                Direct lines to our on-duty nurses, midwives, and clinical officers in Argungu.
              </p>
            </div>
          </div>

          {/* Action Call Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:08069452164"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FFC72C] hover:bg-[#e5b327] text-slate-950 font-bold text-sm shadow-md transition-all font-mono hover:scale-105"
            >
              <Phone className="w-4 h-4 text-slate-950" />
              <span>08069452164</span>
            </a>
            <a
              href="tel:07066694834"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 border border-blue-600 text-white font-bold text-sm shadow-md transition-all font-mono hover:scale-105"
            >
              <Phone className="w-4 h-4 text-[#FFC72C]" />
              <span>07066694834</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SCROLLABLE SECTION: CORE CLINICAL & MATERNITY SERVICES       */}
      {/* ============================================================== */}
      <section className="w-full py-12 sm:py-16 px-4 sm:px-8 lg:px-12 bg-slate-900/90 relative">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-700/50 text-[#FFC72C] text-xs font-semibold uppercase tracking-wider mb-3">
              <Activity className="w-3.5 h-3.5" />
              <span>Comprehensive Health Services</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Clinical Excellence &amp; Dedicated Maternal Care
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Serving Argungu and the wider Kebbi State community with qualified medical personnel,
              modern diagnostic ultrasound, automated pathology, and 24-hour maternity facilities.
            </p>
          </div>

          {/* 6 Key Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Maternity & Labor */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900 border border-blue-800/40 hover:border-[#FFC72C]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB] flex items-center justify-center text-[#FFC72C] mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Baby className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFC72C] transition-colors">
                24/7 Maternity &amp; Labor Ward
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Antenatal clinics (ANC), skilled midwife deliveries, neonatal resuscitation, postpartum observation, and dedicated maternal monitoring suites.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center gap-2 text-[11px] text-[#FFC72C] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Round-the-clock admissions</span>
              </div>
            </div>

            {/* 2. Diagnostic Ultrasound */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900 border border-blue-800/40 hover:border-[#FFC72C]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB] flex items-center justify-center text-[#FFC72C] mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFC72C] transition-colors">
                Ultrasound &amp; Diagnostic Sonography
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                High-resolution obstetric ultrasonography, fetal anatomy scans, gestational dating, placenta localization, and abdominal/pelvic examinations.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center gap-2 text-[11px] text-[#FFC72C] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Immediate printout &amp; clinical report</span>
              </div>
            </div>

            {/* 3. Pathology & Laboratory */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900 border border-blue-800/40 hover:border-[#FFC72C]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB] flex items-center justify-center text-[#FFC72C] mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Microscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFC72C] transition-colors">
                Medical Pathology &amp; Laboratory
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Full blood count (FBC), blood grouping and crossmatch, malaria microscopy, prenatal serology, urinalysis, and rapid infectious disease screening.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center gap-2 text-[11px] text-[#FFC72C] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Quality-controlled diagnostic testing</span>
              </div>
            </div>

            {/* 4. Outpatient & Inpatient Consultations */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900 border border-blue-800/40 hover:border-[#FFC72C]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB] flex items-center justify-center text-[#FFC72C] mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFC72C] transition-colors">
                Outpatient &amp; Inpatient Care
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                General clinical consultations, pediatric healthcare, emergency stabilization, intravenous fluid therapy, and continuous patient ward supervision.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center gap-2 text-[11px] text-[#FFC72C] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Qualified doctors &amp; nursing team</span>
              </div>
            </div>

            {/* 5. Pharmacy & Dispensary */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900 border border-blue-800/40 hover:border-[#FFC72C]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB] flex items-center justify-center text-[#FFC72C] mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Pill className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFC72C] transition-colors">
                Full-Service Pharmacy &amp; Dispensary
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Stocked essential maternal medications, intravenous antibiotics, neonatal therapeutics, nutritional supplements, and strict temperature-controlled storage.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center gap-2 text-[11px] text-[#FFC72C] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Regulated dispensing &amp; batch tracking</span>
              </div>
            </div>

            {/* 6. Digital EMR & Audit Trail */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-blue-950/70 to-slate-900 border border-blue-800/40 hover:border-[#FFC72C]/50 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#0047AB] flex items-center justify-center text-[#FFC72C] mb-4 shadow-md group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-[#FFC72C] transition-colors">
                Secured EMR &amp; Digital Health Records
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Complete longitudinal electronic medical records, automated patient numbering, barcode identification, verified receipts, and tamper-evident audit logs.
              </p>
              <div className="mt-4 pt-3 border-t border-blue-900/50 flex items-center gap-2 text-[11px] text-[#FFC72C] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% paperless clinical workflows</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SCROLLABLE SECTION: FACILITY INFORMATION & HOURS            */}
      {/* ============================================================== */}
      <section className="w-full py-12 px-4 sm:px-8 lg:px-12 bg-slate-950 border-t border-blue-900/40">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1: Facility Location */}
          <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-800/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Physical Facility Location</h4>
                <p className="text-[11px] text-blue-200">Argungu Municipal</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold text-white">
              NO. 19 GULMA ROAD, ARGUNGU, KEBBI STATE
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Easily accessible along Gulma Road with dedicated emergency ambulance drive-in and maternity reception.
            </p>
          </div>

          {/* Card 2: Contact Numbers */}
          <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-800/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Direct Phone Numbers</h4>
                <p className="text-[11px] text-blue-200">24/7 Switchboard</p>
              </div>
            </div>
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-blue-900/40 border border-blue-700/30">
                <span className="text-slate-300 font-sans text-[11px]">Primary Line:</span>
                <a href="tel:08069452164" className="font-bold text-[#FFC72C] hover:underline">
                  08069452164
                </a>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-blue-900/40 border border-blue-700/30">
                <span className="text-slate-300 font-sans text-[11px]">Secondary Line:</span>
                <a href="tel:07066694834" className="font-bold text-[#FFC72C] hover:underline">
                  07066694834
                </a>
              </div>
            </div>
          </div>

          {/* Card 3: Operating Schedule */}
          <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-800/40">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-[#0047AB] text-[#FFC72C]">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Operating Schedule</h4>
                <p className="text-[11px] text-blue-200">Daily Admissions</p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between border-b border-blue-900/50 pb-1">
                <span>Maternity &amp; Emergency:</span>
                <span className="font-bold text-[#FFC72C]">24 Hours / 7 Days</span>
              </div>
              <div className="flex justify-between border-b border-blue-900/50 py-1">
                <span>General Outpatient:</span>
                <span className="font-medium text-white">Mon – Sun (8am - 10pm)</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Antenatal &amp; Immunization:</span>
                <span className="font-medium text-white">Dedicated Clinics</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. COMPREHENSIVE BOTTOM FOOTER & MIT CAPSTONE PROJECT NOTICE   */}
      {/* ============================================================== */}
      <footer className="w-full bg-[#020b18] border-t border-blue-900/50 py-8 px-4 sm:px-8 lg:px-12 text-slate-400 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3.5">
            <ClinicLogo variant="icon-only" className="w-10 h-10" />
            <div>
              <div className="font-black text-white text-sm tracking-tight">
                AL-EMAN <span className="text-[#FFC72C]">CLINIC AND MATERNITY HOME</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                No. 19 Gulma Road, Argungu, Kebbi State · Tel: 08069452164 · 07066694834
              </div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div className="text-sm font-bold text-[#FFC72C] tracking-wide">
              Copyright @ MIT Capstone Project
            </div>
            <div className="text-[11px] text-slate-400">
              © {new Date().getFullYear()} AL-EMAN CLINIC AND MATERNITY HOME. All rights reserved.
            </div>
          </div>

          {/* Quick Actions: Chapter 1 & Back to Top */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowChapterOne(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0047AB] hover:bg-blue-800 text-amber-300 border border-blue-600 text-xs font-semibold shadow transition-all cursor-pointer"
              title="View and download complete MIT Capstone Thesis (Chapters 1–5, Diagrams & Appendices) as Microsoft Word docx"
            >
              <FileText className="w-3.5 h-3.5 text-amber-300" />
              <span>Capstone Thesis (Chapters 1–5 Docx)</span>
            </button>

            <button
              onClick={() => scrollToSection('top-portal')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold shadow transition-all cursor-pointer hover:scale-105"
            >
              <span>Back to Staff Sign-In</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </footer>

      {/* Chapter One Academic Modal Viewer & Word (.docx) Downloader */}
      <ChapterOneModal
        isOpen={showChapterOne}
        onClose={() => setShowChapterOne(false)}
      />

    </div>
  );
};

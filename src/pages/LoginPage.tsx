import React, { useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { apiRequest } from '../lib/api';
import { ClinicLogo } from '../components/ClinicLogo';
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
  Server
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: StaffUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
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

  return (
    <div className="min-h-screen w-full bg-slate-900 flex flex-col lg:grid lg:grid-cols-2 selection:bg-teal-500 selection:text-white">
      
      {/* ============================================================== */}
      {/* LEFT HALF: THE WHOLE LOGO & INSTITUTIONAL BRAND SHOWCASE       */}
      {/* ============================================================== */}
      <div className="relative w-full min-h-[500px] lg:min-h-screen bg-gradient-to-br from-slate-950 via-[#031d45] to-[#002868] text-white flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-blue-900/40">
        
        {/* Subtle Ambient Background Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#0047AB_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#0047AB]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#FFC72C]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Left Half */}
        <div className="relative z-10 flex items-center justify-between text-xs text-blue-200/80">
          <div className="flex items-center gap-2 font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#FFC72C] animate-ping" />
            <span className="text-[#FFC72C] font-semibold uppercase">Operational</span>
            <span className="text-blue-400/60">|</span>
            <span className="text-white">AL-EMAN EMR V3.4</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/50 text-blue-100 text-[11px]">
            <Server className="w-3.5 h-3.5 text-[#FFC72C]" />
            <span>Encrypted EMR Node</span>
          </div>
        </div>

        {/* Center: The Whole Logo Placed as Half-Page Showcase */}
        <div className="relative z-10 my-auto py-8 sm:py-12 flex flex-col items-center justify-center">
          {/* Main Whole Logo Component */}
          <ClinicLogo variant="half-page" showTagline={true} />

          {/* Quick Institutional Highlights */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg w-full text-center">
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-950/50 border border-blue-700/40 backdrop-blur-xs">
              <div className="text-base sm:text-lg font-bold text-[#FFC72C]">24 / 7</div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 uppercase tracking-wider mt-0.5">
                Maternity & Care
              </div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-950/50 border border-blue-700/40 backdrop-blur-xs">
              <div className="text-base sm:text-lg font-bold text-[#FFC72C]">Argungu</div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 uppercase tracking-wider mt-0.5">
                Kebbi State
              </div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-950/50 border border-blue-700/40 backdrop-blur-xs">
              <div className="text-base sm:text-lg font-bold text-[#FFC72C]">100%</div>
              <div className="text-[10px] sm:text-[11px] text-blue-200 uppercase tracking-wider mt-0.5">
                Audit Trail
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer of Left Half */}
        <div className="relative z-10 pt-4 border-t border-blue-800/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-blue-200/90">
          <div className="flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-[#FFC72C] shrink-0" />
            <span className="font-semibold text-white">NO. 19 GULMA ROAD, ARGUNGU, KEBBI STATE</span>
          </div>
          <div className="flex items-center gap-4 text-blue-200">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-[#FFC72C]" />
              +234 803 123 4567
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3 h-3 text-[#FFC72C]" />
              info@alemanclinic.ng
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT HALF: SECURE CLINICAL STAFF LOGIN & ACCESS PORTAL       */}
      {/* ============================================================== */}
      <div className="w-full min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 overflow-y-auto">
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
                    className="w-full pl-3 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-[#0047AB] bg-white"
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
                    className="text-[11px] text-[#0047AB] hover:text-[#00398A] font-medium flex items-center gap-1"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0047AB] focus:border-[#0047AB] bg-white"
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0047AB] bg-slate-50 font-mono tracking-widest"
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
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
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
              
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {demoPresets.map((p) => {
                  const isSelected = identifier === p.user;
                  return (
                    <button
                      key={p.user}
                      type="button"
                      onClick={() => handleSelectPreset(p.user)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-all cursor-pointer ${
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
            <div className="mt-5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-center text-[10px] text-slate-500 leading-relaxed flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                Protected under NDPR & Hospital Information Security Guidelines. All logins, data queries, and actions are logged in the immutable audit trail.
              </span>
            </div>

          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-4 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} AL-EMAN CLINIC AND MATERNITY HOME · All rights reserved.
        </div>
      </div>

    </div>
  );
};

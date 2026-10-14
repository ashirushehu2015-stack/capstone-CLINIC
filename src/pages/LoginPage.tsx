import React, { useState } from 'react';
import { StaffUser } from '../types';
import { apiRequest } from '../lib/api';
import { ShieldCheck, Lock, AlertCircle, KeyRound, Building2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: StaffUser, token: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('ClinicPass@2026');
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoPresets = [
    { label: 'Admin (Kelechi)', user: 'admin', role: 'System Admin' },
    { label: 'Dr. Adeyemi', user: 'dr.adeyemi', role: 'Clinician / EMR' },
    { label: 'Nurse Funke', user: 'nurse.funke', role: 'Triage / Vitals' },
    { label: 'Pharm. Ibrahim', user: 'pharm.ibrahim', role: 'Dispensing' },
    { label: 'MLS Chinedu', user: 'lab.chinedu', role: 'Diagnostic Lab' },
    { label: 'Reception (Ngozi)', user: 'rec.ngozi', role: 'Front Desk' },
    { label: 'Cashier Fatima', user: 'cashier.fatima', role: 'Revenue' },
    { label: 'Manager Olumide', user: 'mgr.olumide', role: 'Operations' }
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
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Header Ribbon */}
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-3 shadow-md">
            ✚
          </div>
          <h1 className="text-xl font-bold tracking-tight">CAPSTONE CLINIC SYSTEM</h1>
          <p className="text-xs text-slate-400 mt-1">Staff-Only Clinical Information System</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-[11px] text-teal-300 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Role-Based Authorization</span>
          </div>
        </div>

        {/* Login Form Body */}
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
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                placeholder="e.g. dr.adeyemi or admin@medipulse.ng"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                MFA Passcode <span className="text-[10px] text-slate-400">(Optional / Privileged)</span>
              </label>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="6-digit authenticator code if configured"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Authenticating staff credentials...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Sign In to Clinical Portal</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Staff Role Selection (For evaluation of all roles) */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                Select Staff Account
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Password: ClinicPass@2026</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto pr-1">
              {demoPresets.map((p) => (
                <button
                  key={p.user}
                  type="button"
                  onClick={() => handleSelectPreset(p.user)}
                  className={`text-left p-2 rounded border text-xs transition-colors ${
                    identifier === p.user
                      ? 'border-teal-500 bg-teal-50/50 font-medium text-teal-900 ring-1 ring-teal-400'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-semibold truncate">{p.label}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.role}</div>
                </button>
              ))}
            </div>
          </div>

          {/* System Security Notice */}
          <div className="mt-5 text-center text-[11px] text-slate-400 leading-tight">
            Restricted to authorized hospital employees. All access attempts, IP addresses, and sessions are logged in the immutable audit trail.
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { StaffUser, PatientVisit, Patient } from './types';
import { apiRequest } from './lib/api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PatientsPage } from './pages/PatientsPage';
import { QueuePage } from './pages/QueuePage';
import { NursingPage } from './pages/NursingPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { PharmacyPage } from './pages/PharmacyPage';
import { LaboratoryPage } from './pages/LaboratoryPage';
import { BillingPage } from './pages/BillingPage';
import { ReportsPage } from './pages/ReportsPage';
import { StaffPage } from './pages/StaffPage';
import { SettingsPage } from './pages/SettingsPage';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeVisit, setActiveVisit] = useState<PatientVisit | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Forced first-time password change modal state
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    async function checkAuth() {
      const storedToken = localStorage.getItem('clinic_auth_token');
      if (!storedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        const res = await apiRequest('/api/auth/me');
        setCurrentUser(res.user);
        if (res.user.must_change_password === 1) {
          setShowPwdModal(true);
        }
      } catch {
        localStorage.removeItem('clinic_auth_token');
        localStorage.removeItem('clinic_staff_user');
        setCurrentUser(null);
      } finally {
        setIsInitializing(false);
      }
    }

    checkAuth();

    const handleAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('auth_state_change', handleAuthChange);
    return () => window.removeEventListener('auth_state_change', handleAuthChange);
  }, []);

  const handleLoginSuccess = (user: StaffUser, token: string) => {
    setCurrentUser(user);
    setCurrentTab('dashboard');
    if (user.must_change_password === 1) {
      setShowPwdModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    }
    localStorage.removeItem('clinic_auth_token');
    localStorage.removeItem('clinic_staff_user');
    setCurrentUser(null);
    setCurrentTab('dashboard');
    setActiveVisit(null);
  };

  // Role switcher handler for instant testing
  const handleSwitchUser = async (username: string) => {
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier: username, password: 'ClinicPass@2026' })
      });
      localStorage.setItem('clinic_auth_token', res.token);
      localStorage.setItem('clinic_staff_user', JSON.stringify(res.user));
      setCurrentUser(res.user);
      setCurrentTab('dashboard');
      setActiveVisit(null);
    } catch (err: any) {
      alert(`Could not switch user: ${err.message}`);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    try {
      await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
      setPwdSuccess('Password changed successfully.');
      if (currentUser) {
        setCurrentUser({ ...currentUser, must_change_password: 0 });
      }
      setTimeout(() => setShowPwdModal(false), 1200);
    } catch (err: any) {
      setPwdError(err.message || 'Failed to update password.');
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="font-semibold tracking-wider text-slate-400">INITIALIZING SECURE CLINIC SYSTEM...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          role={currentUser.role}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <DashboardPage
              user={currentUser}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'patients' && (
            <PatientsPage
              user={currentUser}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                setCurrentTab('queue');
              }}
              onOpenVisitForPatient={(p) => {
                setSelectedPatient(p);
                setCurrentTab('queue');
              }}
            />
          )}

          {currentTab === 'queue' && (
            <QueuePage
              user={currentUser}
              onSelectVisit={(v, targetTab) => {
                setActiveVisit(v);
                if (targetTab) {
                  setCurrentTab(targetTab);
                }
              }}
            />
          )}

          {currentTab === 'nursing' && (
            <NursingPage
              user={currentUser}
              activeVisit={activeVisit}
              onSelectVisit={(v) => setActiveVisit(v)}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'consultation' && (
            <ConsultationPage
              user={currentUser}
              activeVisit={activeVisit}
              onSelectVisit={(v) => setActiveVisit(v)}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'pharmacy' && (
            <PharmacyPage user={currentUser} />
          )}

          {currentTab === 'laboratory' && (
            <LaboratoryPage user={currentUser} />
          )}

          {currentTab === 'billing' && (
            <BillingPage user={currentUser} />
          )}

          {currentTab === 'reports' && (
            <ReportsPage user={currentUser} />
          )}

          {currentTab === 'staff' && (
            <StaffPage currentUser={currentUser} />
          )}

          {currentTab === 'settings' && (
            <SettingsPage currentUser={currentUser} />
          )}
        </main>
      </div>

      {/* Forced First-Time Password Change Modal */}
      {showPwdModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs animate-in zoom-in-95">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-teal-800 font-bold">
              <Lock className="w-5 h-5 text-teal-600" />
              <span>Mandatory Password Update</span>
            </div>

            <p className="text-slate-600 mt-2">
              For security compliance, this account requires an initial password change before proceeding.
            </p>

            {pwdSuccess && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            {pwdError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Secure Password *</label>
                <input
                  type="password"
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

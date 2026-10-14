import React, { useState } from 'react';
import { StaffUser } from '../types';
import { LogOut, Bell, Shield, User, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface HeaderProps {
  user: StaffUser;
  onLogout: () => void;
  onSwitchUser: (username: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onSwitchUser }) => {
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const demoAccounts = [
    { username: 'admin', role: 'System Admin', name: 'Dr. Kelechi Nwosu', dept: 'Administration' },
    { username: 'dr.adeyemi', role: 'Doctor/Clinician', name: 'Dr. Adeyemi Alabi', dept: 'Outpatient & Internal Med' },
    { username: 'nurse.funke', role: 'Staff Nurse', name: 'RN Funke Adeleke', dept: 'Nursing & Triage' },
    { username: 'pharm.ibrahim', role: 'Pharmacist', name: 'Pharm. Ibrahim Bello', dept: 'Pharmacy & Formulary' },
    { username: 'lab.chinedu', role: 'Lab Scientist', name: 'MLS Chinedu Okafor', dept: 'Diagnostic Laboratory' },
    { username: 'rec.ngozi', role: 'Receptionist', name: 'Ngozi Eze', dept: 'Front Desk & Admissions' },
    { username: 'cashier.fatima', role: 'Cashier / Accountant', name: 'Fatima Danjuma', dept: 'Revenue & Accounts' },
    { username: 'mgr.olumide', role: 'Clinic Manager', name: 'Olumide Bakare', dept: 'Clinical Operations' },
    { username: 'rec.amaka', role: 'Records Officer', name: 'Amaka Obi', dept: 'Health Records & Archive' }
  ];

  const roleColors: Record<string, string> = {
    admin: 'text-purple-700 bg-purple-50 border-purple-200',
    doctor: 'text-blue-700 bg-blue-50 border-blue-200',
    nurse: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    pharmacist: 'text-amber-700 bg-amber-50 border-amber-200',
    lab_tech: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    receptionist: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    accountant: 'text-teal-700 bg-teal-50 border-teal-200',
    manager: 'text-rose-700 bg-rose-50 border-rose-200',
    records_officer: 'text-slate-700 bg-slate-100 border-slate-200'
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Shift Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm">
            <span className="text-xl">✚</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">CAPSTONE CLINIC SYSTEM</span>
              <span className="text-xs px-2 py-0.5 rounded border font-medium text-slate-600 bg-slate-50 border-slate-200">
                Staff Only
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Shift Active · Secure Relational HMS
            </p>
          </div>
        </div>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          
          {/* Quick Role Switcher (Crucial for testing all distinct roles in real clinic workflow) */}
          <button
            onClick={() => setShowSwitchModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            title="Switch staff account to test different clinical roles"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch Role</span>
          </button>

          {/* User Profile Card */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-slate-900 leading-tight">
                {user.full_name}
              </div>
              <div className="text-[11px] text-slate-500">
                {user.role.toUpperCase()} · {user.department}
              </div>
            </div>
          </div>

          {/* Secure Logout */}
          <button
            onClick={onLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Secure Staff Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role Switcher Modal */}
      {showSwitchModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Switch Operational Account</h3>
                <p className="text-xs text-slate-500 mt-0.5">Test role-governed authorization, screens, and strict permissions</p>
              </div>
              <button
                onClick={() => setShowSwitchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {demoAccounts.map((acc) => {
                const isCurrent = acc.username === user.username;
                return (
                  <button
                    key={acc.username}
                    onClick={() => {
                      setShowSwitchModal(false);
                      onSwitchUser(acc.username);
                    }}
                    disabled={isCurrent}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-teal-50/50 border-teal-300 ring-1 ring-teal-200 cursor-default'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{acc.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-medium text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">Current</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {acc.role} · <span className="text-slate-400">{acc.dept}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-400">@{acc.username}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowSwitchModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

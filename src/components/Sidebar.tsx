import React from 'react';
import { StaffRole } from '../types';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  HeartPulse,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  BarChart3,
  UserCog,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  role: StaffRole;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: StaffRole[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, role }) => {
  const allRoles: StaffRole[] = [
    'admin', 'manager', 'receptionist', 'doctor', 'nurse',
    'lab_tech', 'pharmacist', 'accountant', 'records_officer'
  ];

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Operational Dashboard',
      icon: LayoutDashboard,
      roles: allRoles
    },
    {
      id: 'patients',
      label: 'Patient Registry',
      icon: Users,
      roles: ['receptionist', 'nurse', 'doctor', 'admin', 'manager', 'records_officer', 'accountant']
    },
    {
      id: 'queue',
      label: 'Live Visits & Queue',
      icon: CalendarClock,
      roles: allRoles
    },
    {
      id: 'nursing',
      label: 'Nursing & Triage',
      icon: HeartPulse,
      roles: ['nurse', 'doctor', 'admin', 'manager']
    },
    {
      id: 'consultation',
      label: 'Doctor Consultation EMR',
      icon: Stethoscope,
      roles: ['doctor', 'admin', 'manager']
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy & Stock',
      icon: Pill,
      roles: ['pharmacist', 'doctor', 'admin', 'manager']
    },
    {
      id: 'laboratory',
      label: 'Diagnostic Laboratory',
      icon: FlaskConical,
      roles: ['lab_tech', 'doctor', 'admin', 'manager']
    },
    {
      id: 'billing',
      label: 'Cashier & Invoices',
      icon: Receipt,
      roles: ['accountant', 'receptionist', 'admin', 'manager']
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roles: ['manager', 'accountant', 'admin']
    },
    {
      id: 'staff',
      label: 'Staff Management',
      icon: UserCog,
      roles: ['admin', 'manager']
    },
    {
      id: 'settings',
      label: 'Settings & Backups',
      icon: Database,
      roles: ['admin']
    }
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex-shrink-0 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Clinic Modules
        </div>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Security Status Box */}
      <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 px-3">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Security & Audit</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
            Active
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Strict server-side RBAC, tamper-evident audit logs, and encrypted session security.
        </p>
      </div>
    </aside>
  );
};

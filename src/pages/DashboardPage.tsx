import React, { useEffect, useState } from 'react';
import { StaffUser } from '../types';
import { apiRequest, formatNGN } from '../lib/api';
import {
  Users,
  CalendarCheck,
  Stethoscope,
  Pill,
  FlaskConical,
  Receipt,
  AlertTriangle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface DashboardPageProps {
  user: StaffUser;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const data = await apiRequest('/api/reports/dashboard');
        setMetrics(data.metrics);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [user.id]);

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Loading real-time clinic indicators...
      </div>
    );
  }

  const isFinancialPrivileged = ['accountant', 'manager', 'admin'].includes(user.role);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            {user.department}
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
            Welcome back, {user.full_name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Active role: <strong className="text-slate-700 uppercase">{user.role}</strong> · Operational system connected
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('queue')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors"
          >
            <span>View Live Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Authorized real metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Patients */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Registered Patients</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {metrics.totalPatients}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            +{metrics.patientsToday} registered today
          </div>
        </div>

        {/* Today's Visits */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Clinic Visits</span>
            <CalendarCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {metrics.visitsToday}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active admissions & consults
          </div>
        </div>

        {/* Waiting for Consultation */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Awaiting Consultation</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {metrics.waitingForConsultation}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            In clinical waiting lounge
          </div>
        </div>

        {/* Role-Specific or Financial KPI */}
        {isFinancialPrivileged && metrics.financial ? (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Today's Collections</span>
              <Receipt className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono text-emerald-700">
              {formatNGN(metrics.financial.todayRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Outstanding: {formatNGN(metrics.financial.outstandingBalance)}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Lab Tests</span>
              <FlaskConical className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
              {metrics.pendingLabRequests}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Investigations in progress
            </div>
          </div>
        )}

      </div>

      {/* Operational Queues & Departmental Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Stage Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Active Workflow Queue Stages</h3>
            <span className="text-xs text-slate-500">Real-time Patient Flow</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { stage: 'triage', label: 'Nursing Triage', icon: HeartPulseIcon, color: 'text-rose-700 bg-rose-50 border-rose-200', tab: 'nursing' },
              { stage: 'consultation', label: 'Doctor Review', icon: Stethoscope, color: 'text-blue-700 bg-blue-50 border-blue-200', tab: 'consultation' },
              { stage: 'laboratory', label: 'Diagnostic Lab', icon: FlaskConical, color: 'text-cyan-700 bg-cyan-50 border-cyan-200', tab: 'laboratory' },
              { stage: 'pharmacy', label: 'Prescription Fill', icon: Pill, color: 'text-amber-700 bg-amber-50 border-amber-200', tab: 'pharmacy' },
              { stage: 'billing', label: 'Cashier / Payment', icon: Receipt, color: 'text-emerald-700 bg-emerald-50 border-emerald-200', tab: 'billing' }
            ].map((item) => {
              const count = metrics.queueCounts?.find((q: any) => q.stage === item.stage)?.count || 0;
              const Icon = item.icon;
              return (
                <button
                  key={item.stage}
                  onClick={() => onNavigate(item.tab)}
                  className={`p-3 rounded-xl border text-left transition-all hover:shadow-xs flex flex-col justify-between ${item.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{item.label}</span>
                    <Icon className="w-4 h-4 opacity-75" />
                  </div>
                  <div className="text-xl font-bold font-mono mt-3">
                    {count} <span className="text-[11px] font-normal opacity-80">waiting</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alerts & Action Items */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Clinical & Stock Alerts</h3>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs">
              <div className="font-semibold text-amber-900">Pharmacy Formulary</div>
              <div className="text-amber-700 mt-0.5">
                {metrics.lowStockCount} medicines have reached or dropped below reorder threshold.
              </div>
              <button
                onClick={() => onNavigate('pharmacy')}
                className="mt-2 text-[11px] font-semibold text-amber-800 hover:underline flex items-center gap-1"
              >
                Review stock levels →
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <div className="font-semibold text-slate-800">Prescription Dispensing</div>
              <div className="text-slate-600 mt-0.5">
                {metrics.pendingPrescriptions} prescriptions awaiting pharmacy review and dispensing.
              </div>
              <button
                onClick={() => onNavigate('pharmacy')}
                className="mt-2 text-[11px] font-semibold text-slate-700 hover:underline flex items-center gap-1"
              >
                Go to dispensary →
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

function HeartPulseIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
    </svg>
  );
}

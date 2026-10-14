import React, { useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { apiRequest, formatNGN, formatDate } from '../lib/api';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  PieChart,
  DollarSign,
  Activity
} from 'lucide-react';

interface ReportsPageProps {
  user: StaffUser;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ user }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await apiRequest('/api/reports/analytics');
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !analytics) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs">
        Compiling clinic reports & metrics from database records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Clinical Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Epidemiological morbidity surveillance, stock valuation, and revenue distribution
          </p>
        </div>

        <button
          onClick={() => {
            const rows = analytics.topDiagnoses?.map((d: any) => [d.primary_diagnosis, d.count]) || [];
            handleExportCSV('clinic_diagnoses_report', ['Diagnosis', 'CaseCount'], rows);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg shadow-2xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Top Diagnoses / Morbidity Surveillance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              <span>Top Clinical Diagnoses (Morbidity Surveillance)</span>
            </h3>
            <span className="text-[11px] text-slate-400">ICD / Clinical Records</span>
          </div>

          <div className="space-y-3">
            {analytics.topDiagnoses?.map((diag: any, idx: number) => {
              const maxCount = analytics.topDiagnoses[0]?.count || 1;
              const pct = Math.round((diag.count / maxCount) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{diag.primary_diagnosis}</span>
                    <span className="font-mono text-teal-800">{diag.count} cases</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Channel Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Revenue Channels Breakdown (NGN)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Cashier Settlements</span>
          </div>

          <div className="space-y-3">
            {analytics.revenueByMethod?.map((rev: any, idx: number) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900 uppercase">{rev.payment_method}</div>
                  <div className="text-[11px] text-slate-500">{rev.count} transactions completed</div>
                </div>
                <div className="text-right font-mono font-bold text-sm text-emerald-800">
                  {formatNGN(rev.total)}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Pharmacy Stock Valuation Card */}
      {analytics.inventoryValuation && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Pharmacy Stock Asset Valuation</span>
            </h3>
            <span className="text-[11px] text-slate-400">Formulary Ledger Audit</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">Total Purchase Cost Value:</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {formatNGN(analytics.inventoryValuation.total_cost_value || 0)}
              </div>
              <span className="text-[10px] text-slate-400">Wholesale acquisition baseline</span>
            </div>

            <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <span className="text-teal-700">Projected Retail Selling Value:</span>
              <div className="text-xl font-bold font-mono text-teal-950 mt-1">
                {formatNGN(analytics.inventoryValuation.total_retail_value || 0)}
              </div>
              <span className="text-[10px] text-teal-600">Dispensary tariff valuation</span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-slate-500">Active Formulary Medicines:</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                {analytics.inventoryValuation.active_medicines || 0} items
              </div>
              <span className="text-[10px] text-slate-400">Catalogued & managed</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

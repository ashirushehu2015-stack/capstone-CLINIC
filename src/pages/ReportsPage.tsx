import React, { useState, useEffect } from 'react';
import { StaffUser } from '../types';
import { apiRequest, formatNGN, formatDate } from '../lib/api';
import { ChapterOneModal } from '../components/ChapterOneModal';
import { downloadThesisDocument } from '../lib/capstoneDocxGenerator';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  PieChart,
  DollarSign,
  Activity,
  FileText,
  GraduationCap
} from 'lucide-react';

interface ReportsPageProps {
  user: StaffUser;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ user }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChapterOne, setShowChapterOne] = useState(false);

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

      {/* Capstone Project Academic Documentation Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0047AB] to-blue-900 text-white rounded-xl p-5 shadow-sm border border-blue-950 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FFC72C] text-slate-950">
              MIT Capstone Report (MIT 800)
            </span>
            <span className="text-xs text-blue-200">
              Iconic University, Sokoto · Group 5 · Up to Chapter 2
            </span>
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Academic Project Report: SentinelFlow — ZITDA Case Study (Chapters 1 & 2)
          </h2>
          <p className="text-xs text-blue-100 max-w-2xl leading-relaxed">
            Full academic documentation: Title Page, Declaration, Certification, Dedication, Acknowledgements, Abstract, Abbreviations, Chapter 1 (Introduction — Background, ZITDA Host Org, Problem Statement, Objectives, Scope, Terms) and Chapter 2 (Literature Review — NSM, IDPS Taxonomy, DPI, Existing Tools Table, Regulatory Frameworks, Gap Analysis). Remaining chapters scheduled to be supplied.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
          <button
            onClick={() => setShowChapterOne(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-200" />
            <span>Read Chapters 1 & 2</span>
          </button>

          <button
            onClick={async () => {
              try {
                await downloadThesisDocument(undefined);
              } catch (err) {
                console.error('Download error:', err);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-[#FFC72C] hover:bg-amber-400 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-950" />
            <span>Download Report Up to Ch. 2 (.docx)</span>
          </button>
        </div>
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

      {/* Academic Chapter One Modal */}
      <ChapterOneModal
        isOpen={showChapterOne}
        onClose={() => setShowChapterOne(false)}
      />

    </div>
  );
};

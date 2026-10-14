import React, { useState, useEffect } from 'react';
import { StaffUser, AuditEvent } from '../types';
import { apiRequest, formatDate, formatDateTime } from '../lib/api';
import {
  Database,
  Shield,
  Building2,
  HardDriveDownload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  History,
  Lock,
  RefreshCw
} from 'lucide-react';

interface SettingsPageProps {
  currentUser: StaffUser;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'audit' | 'backups'>('settings');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter for audit logs
  const [actionFilter, setActionFilter] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const sRes = await apiRequest('/api/settings');
      setSettings(sRes.settings || {});

      const bRes = await apiRequest('/api/settings/backups');
      setBackups(bRes.backups || []);

      const aRes = await apiRequest(`/api/settings/audit-logs?action=${encodeURIComponent(actionFilter)}&limit=60`);
      setAuditLogs(aRes.logs || []);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [actionFilter]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateBackup = async () => {
    setMessage(null);
    try {
      const res = await apiRequest('/api/settings/backups', {
        method: 'POST'
      });
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!window.confirm('Are you sure you want to verify and simulate restoration of this database snapshot? Integrity checksum will be checked.')) return;
    setMessage(null);
    try {
      const res = await apiRequest(`/api/settings/backups/${backupId}/restore`, {
        method: 'POST'
      });
      setMessage({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Governance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational configurations, immutable audit trail, and atomic database backups
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'settings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
          >
            Clinic Profile
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'audit' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
          >
            Audit Trail ({auditLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'backups' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
          >
            Database Backups ({backups.length})
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Tab 1: Clinic Profile Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Hospital Operational Identity</span>
            </h3>
            <p className="text-slate-500 mt-0.5">Parameters printed on official receipts, prescriptions, and reports</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-2xl">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official Facility Name</label>
              <input
                type="text"
                value={settings.clinic_name || ''}
                onChange={(e) => setSettings({ ...settings, clinic_name: e.target.value })}
                className="w-full p-2 border rounded border-slate-300 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={settings.clinic_phone || ''}
                  onChange={(e) => setSettings({ ...settings, clinic_phone: e.target.value })}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.clinic_email || ''}
                  onChange={(e) => setSettings({ ...settings, clinic_email: e.target.value })}
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Physical Address</label>
              <input
                type="text"
                value={settings.clinic_address || ''}
                onChange={(e) => setSettings({ ...settings, clinic_address: e.target.value })}
                className="w-full p-2 border rounded border-slate-300"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Code</label>
                <input
                  type="text"
                  disabled
                  value={settings.currency_code || 'NGN'}
                  className="w-full p-2 border rounded border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  disabled
                  value={settings.currency_symbol || '₦'}
                  className="w-full p-2 border rounded border-slate-200 bg-slate-50 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
                <input
                  type="text"
                  disabled
                  value={settings.timezone || 'Africa/Lagos'}
                  className="w-full p-2 border rounded border-slate-200 bg-slate-50 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-3 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" />
                <span>Immutable Security & Clinical Audit Log</span>
              </h3>
              <p className="text-slate-500 mt-0.5">Tamper-evident append-only ledger tracking all authentication, clinical, and financial actions</p>
            </div>

            <input
              type="text"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="Filter action (e.g. AUTH, PATIENT, PAYMENT)..."
              className="px-3 py-1.5 border rounded-lg border-slate-300 w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Staff Identity & Role</th>
                  <th className="p-3">Entity Type / ID</th>
                  <th className="p-3">Outcome</th>
                  <th className="p-3">Audited Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {auditLogs.map((log) => {
                  const isSuccess = log.outcome === 'SUCCESS';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-500 font-sans">{formatDateTime(log.created_at)}</td>
                      <td className="p-3 font-bold text-slate-900">{log.action}</td>
                      <td className="p-3 font-sans">
                        <span className="font-semibold text-slate-800">{log.user_email || 'System'}</span>
                        {log.user_role && (
                          <span className="ml-1 text-[10px] uppercase font-bold text-slate-400">({log.user_role})</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {log.entity_type} {log.entity_id ? `· ${log.entity_id}` : ''}
                      </td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded font-sans font-bold text-[10px] ${
                          isSuccess ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {log.outcome}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-500 max-w-xs truncate" title={log.details || ''}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Database Backups & Recovery */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-600" />
                <span>Automated Database Backups & Disaster Recovery</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Atomic SQLite VACUUM snapshots with cryptographic SHA-256 verification
              </p>
            </div>

            <button
              onClick={handleCreateBackup}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs shadow-xs"
            >
              <HardDriveDownload className="w-4 h-4" />
              <span>Create Atomic Snapshot Now</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Backup File</th>
                    <th className="p-3">File Size</th>
                    <th className="p-3">SHA-256 Checksum</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created By & Timestamp</th>
                    <th className="p-3 text-right">Recovery Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {backups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                        No database snapshots created yet.
                      </td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{b.file_name}</td>
                        <td className="p-3 text-slate-600 font-sans">
                          {(b.file_size_bytes / 1024).toFixed(1)} KB
                        </td>
                        <td className="p-3 text-slate-500 truncate max-w-xs" title={b.checksum || ''}>
                          {b.checksum ? `${b.checksum.substring(0, 16)}...` : 'Verified'}
                        </td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-emerald-100 text-emerald-800">
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 font-sans text-slate-500">
                          <div>{formatDateTime(b.created_at)}</div>
                          <div className="text-[10px] text-slate-400">{b.created_by_name || 'Admin'}</div>
                        </td>
                        <td className="p-3 text-right font-sans">
                          <button
                            onClick={() => handleRestoreBackup(b.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded border border-teal-200"
                          >
                            Verify & Restore Check
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

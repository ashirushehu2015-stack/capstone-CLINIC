import React, { useState, useEffect, useMemo } from 'react';
import { StaffUser, StaffRole, AuditEvent } from '../types';
import { apiRequest, formatDate, formatDateTime } from '../lib/api';
import {
  UserCog,
  UserPlus,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lock,
  UserX,
  UserCheck,
  Search,
  X,
  Shield,
  Download,
  RefreshCw,
  Eye,
  History,
  Clock,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Activity,
  FileCheck2,
  SlidersHorizontal
} from 'lucide-react';

interface StaffPageProps {
  currentUser: StaffUser;
}

export const StaffPage: React.FC<StaffPageProps> = ({ currentUser }) => {
  // Page Tab: 'directory' (Staff Directory) | 'audit' (Security Audit & Admin Review)
  const [activeTab, setActiveTab] = useState<'directory' | 'audit'>('directory');

  // Staff Directory State
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffSearchQuery, setStaffSearchQuery] = useState('');

  // Modals for Staff Directory
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Forms for Staff Directory
  const [createForm, setCreateForm] = useState({
    email: '',
    username: '',
    full_name: '',
    role: 'doctor' as StaffRole,
    department: 'General Outpatient & Internal Medicine',
    phone: '',
    temp_password: 'ClinicPass@2026'
  });

  const [newPassword, setNewPassword] = useState('ClinicPass@2026');
  const [resetReason, setResetReason] = useState('Administrative credential rotation');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Security Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditCategory, setAuditCategory] = useState<string>('all');
  const [auditOutcome, setAuditOutcome] = useState<string>('all');
  const [auditUserId, setAuditUserId] = useState<string>('all');
  const [auditSearch, setAuditSearch] = useState<string>('');
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditLimit, setAuditLimit] = useState<number>(50);
  const [auditPagination, setAuditPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1
  });
  const [auditSummary, setAuditSummary] = useState({
    total: 0,
    loginEvents: 0,
    failedLogins: 0,
    deniedAttempts: 0,
    passwordEvents: 0,
    dataModifications: 0
  });

  // Forensic Inspection Modal for Audit Log
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditEvent | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch Staff List
  const fetchStaff = async () => {
    setStaffLoading(true);
    try {
      const res = await apiRequest('/api/staff');
      setStaffList(res.staff || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setStaffLoading(false);
    }
  };

  // Fetch Security Audit Logs
  const fetchAuditLogs = async () => {
    setAuditLoading(true);
    try {
      const params = new URLSearchParams({
        category: auditCategory,
        outcome: auditOutcome,
        userId: auditUserId,
        search: auditSearch,
        page: auditPage.toString(),
        limit: auditLimit.toString()
      });

      const res = await apiRequest(`/api/staff/audit-logs?${params.toString()}`);
      setAuditLogs(res.logs || []);
      if (res.pagination) {
        setAuditPagination(res.pagination);
      }
      if (res.summary) {
        setAuditSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    }
  }, [activeTab, auditCategory, auditOutcome, auditUserId, auditPage, auditLimit]);

  const handleToggleStatus = async (staff: StaffUser) => {
    const nextStatus = staff.is_active === 1 ? 0 : 1;
    setMessage(null);
    try {
      const res = await apiRequest(`/api/staff/${staff.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          is_active: nextStatus,
          reason: nextStatus === 0 ? 'Account suspended by administrator' : 'Account reactivated'
        })
      });
      setMessage({ type: 'success', text: res.message });
      fetchStaff();
      // If on audit tab or after refresh, update audit logs
      if (activeTab === 'audit') {
        fetchAuditLogs();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await apiRequest('/api/staff', {
        method: 'POST',
        body: JSON.stringify(createForm)
      });
      setShowCreateModal(false);
      setMessage({ type: 'success', text: res.message });
      setCreateForm({
        email: '',
        username: '',
        full_name: '',
        role: 'doctor',
        department: 'General Outpatient & Internal Medicine',
        phone: '',
        temp_password: 'ClinicPass@2026'
      });
      fetchStaff();
      if (activeTab === 'audit') {
        fetchAuditLogs();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setMessage(null);
    try {
      const res = await apiRequest(`/api/staff/${selectedStaff.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({
          new_password: newPassword,
          reason: resetReason
        })
      });
      setShowResetModal(false);
      setMessage({ type: 'success', text: res.message });
      fetchStaff();
      if (activeTab === 'audit') {
        fetchAuditLogs();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Switch to audit tab pre-filtered for a specific staff member
  const handleInspectStaffAudit = (staff: StaffUser) => {
    setAuditUserId(staff.id);
    setAuditCategory('all');
    setAuditOutcome('all');
    setAuditSearch('');
    setAuditPage(1);
    setActiveTab('audit');
  };

  // Export audit logs as CSV
  const handleExportCSV = () => {
    if (auditLogs.length === 0) return;
    const headers = ['Timestamp', 'Action', 'Outcome', 'Actor_Name', 'Actor_Email', 'Actor_Role', 'IP_Address', 'Entity_Type', 'Entity_ID', 'Details'];
    const rows = auditLogs.map(log => [
      `"${log.created_at}"`,
      `"${log.action}"`,
      `"${log.outcome}"`,
      `"${(log.user_full_name || '').replace(/"/g, '""')}"`,
      `"${(log.user_email || '').replace(/"/g, '""')}"`,
      `"${log.user_role || ''}"`,
      `"${log.ip_address || ''}"`,
      `"${log.entity_type || ''}"`,
      `"${log.entity_id || ''}"`,
      `"${(log.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `security_audit_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export audit logs as JSON
  const handleExportJSON = () => {
    if (auditLogs.length === 0) return;
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `security_audit_log_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(
      (s) =>
        s.full_name.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.username.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(staffSearchQuery.toLowerCase()) ||
        s.department.toLowerCase().includes(staffSearchQuery.toLowerCase())
    );
  }, [staffList, staffSearchQuery]);

  // Action badge styling and classification
  const getActionBadge = (action: string, outcome: string) => {
    const isLogin = action.includes('AUTH_LOGIN') || action.includes('AUTH_LOGOUT');
    const isPassword = action.includes('PASSWORD') || action.includes('CREDENTIAL');
    const isModification = action.includes('UPDATED') || action.includes('MODIFIED') || action.includes('AMENDED') || action.includes('MERGED') || action.includes('ADJUSTMENT') || action.includes('REFUND');
    const isStaff = action.includes('STAFF_');

    if (outcome === 'DENIED' || outcome === 'FAILED') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
          <span>{action}</span>
        </span>
      );
    }

    if (isPassword) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
          <KeyRound className="w-3 h-3 text-amber-700 shrink-0" />
          <span>{action}</span>
        </span>
      );
    }

    if (isLogin) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
          <Lock className="w-3 h-3 text-sky-600 shrink-0" />
          <span>{action}</span>
        </span>
      );
    }

    if (isModification) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
          <Activity className="w-3 h-3 text-purple-600 shrink-0" />
          <span>{action}</span>
        </span>
      );
    }

    if (isStaff) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
          <UserCog className="w-3 h-3 text-teal-600 shrink-0" />
          <span>{action}</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
        <FileCheck2 className="w-3 h-3 text-slate-600 shrink-0" />
        <span>{action}</span>
      </span>
    );
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Success</span>
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            <span>Failed</span>
          </span>
        );
      case 'DENIED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Denied</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {outcome}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff Administration & Security</h1>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0047AB] border border-blue-200 text-[10px] font-bold uppercase tracking-wide">
                AL-EMAN CLINIC & MATERNITY HOME
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Role governance, cryptographic sessions, instant deactivation, and real-time security audit review
            </p>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && activeTab === 'directory' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Staff Account</span>
              </button>
            )}

            {activeTab === 'audit' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  disabled={auditLogs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  title="Export filtered audit logs as CSV"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleExportJSON}
                  disabled={auditLogs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors disabled:opacity-50 cursor-pointer"
                  title="Export filtered audit logs as JSON"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>JSON</span>
                </button>
                <button
                  onClick={fetchAuditLogs}
                  disabled={auditLoading}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                  title="Refresh Audit Logs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mt-5 -mb-5 pt-1 gap-2">
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'directory'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCog className="w-4 h-4" />
            <span>Staff Directory & Access Control</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
              {staffList.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('audit');
              setAuditPage(1);
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security Audit & Admin Review</span>
            <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[10px] font-mono">
              {auditSummary.total > 0 ? auditSummary.total : 'Live'}
            </span>
            {auditSummary.failedLogins > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold animate-pulse">
                {auditSummary.failedLogins} Failed
              </span>
            )}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between gap-2 shadow-2xs ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={staffSearchQuery}
                onChange={(e) => setStaffSearchQuery(e.target.value)}
                placeholder="Search staff by name, role, department, or email..."
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Active: {staffList.filter(s => s.is_active === 1).length}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Suspended: {staffList.filter(s => s.is_active === 0).length}</span>
              </span>
            </div>
          </div>

          {/* Staff Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Staff Identity</th>
                    <th className="p-3">Role & Privileges</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Active</th>
                    <th className="p-3 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                        Loading staff directory...
                      </td>
                    </tr>
                  ) : filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No staff members found matching "{staffSearchQuery}".
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => {
                      const isActive = staff.is_active === 1;
                      const isSelf = staff.id === currentUser.id;
                      return (
                        <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{staff.full_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">@{staff.username} · {staff.email}</div>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {staff.role}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{staff.department}</td>
                          <td className="p-3 text-slate-600 font-mono text-[11px]">{staff.phone || '—'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">
                            {formatDateTime(staff.last_login_at)}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Audit Trail inspect button */}
                              <button
                                onClick={() => handleInspectStaffAudit(staff)}
                                className="px-2 py-1 text-slate-700 hover:text-teal-700 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title={`View Security Audit Trail for ${staff.full_name}`}
                              >
                                <Shield className="w-3 h-3 text-teal-600" />
                                <span>Audit Trail</span>
                              </button>

                              {currentUser.role === 'admin' && !isSelf && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedStaff(staff);
                                      setNewPassword('ClinicPass@2026');
                                      setShowResetModal(true);
                                    }}
                                    className="px-2 py-1 text-slate-700 hover:text-teal-700 hover:bg-slate-100 border border-slate-200 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Reset Password"
                                  >
                                    <KeyRound className="w-3 h-3 text-amber-600" />
                                    <span>Reset</span>
                                  </button>

                                  <button
                                    onClick={() => handleToggleStatus(staff)}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                      isActive
                                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    }`}
                                  >
                                    {isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                    <span>{isActive ? 'Suspend' : 'Activate'}</span>
                                  </button>
                                </>
                              )}

                              {isSelf && (
                                <span className="text-[11px] text-slate-400 italic px-2">You</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SECURITY AUDIT & ADMINISTRATIVE REVIEW */}
      {activeTab === 'audit' && (
        <div className="space-y-5">
          
          {/* Executive Security KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Total Logged</span>
                <History className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono">{auditSummary.total}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Immutable audit trail</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Logins & Sessions</span>
                <Lock className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-xl font-bold text-sky-700 font-mono">{auditSummary.loginEvents}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Authenticated sessions</div>
            </div>

            <div className={`rounded-xl p-3.5 shadow-2xs border ${
              auditSummary.failedLogins > 0 ? 'bg-rose-50/50 border-rose-200' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold text-rose-700">Failed / Blocked</span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <div className="text-xl font-bold text-rose-700 font-mono">{auditSummary.failedLogins}</div>
              <div className="text-[10px] text-rose-600 mt-0.5">Bad passwords / lockouts</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Password Changes</span>
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl font-bold text-amber-700 font-mono">{auditSummary.passwordEvents}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rotations & resets</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-semibold">Data Modifications</span>
                <Activity className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-xl font-bold text-purple-700 font-mono">{auditSummary.dataModifications}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Records, consults, stock</div>
            </div>
          </div>

          {/* Quick Preset Filter Badges */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 mr-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Audited Categories:</span>
              </span>

              {[
                { id: 'all', label: 'All Operations' },
                { id: 'auth', label: 'Logins & Authentication' },
                { id: 'passwords', label: 'Password & Credentials' },
                { id: 'modifications', label: 'Sensitive Data Modifications' },
                { id: 'staff', label: 'Staff & Roles' },
                { id: 'patients', label: 'Patient Records' },
                { id: 'clinical', label: 'Clinical Consultations' },
                { id: 'pharmacy', label: 'Pharmacy & Stock' },
                { id: 'billing', label: 'Billing & Cashier' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setAuditCategory(cat.id);
                    setAuditPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors cursor-pointer ${
                    auditCategory === cat.id
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Granular Filters & Real-time Search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {/* Search query */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => {
                    setAuditSearch(e.target.value);
                    setAuditPage(1);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchAuditLogs();
                  }}
                  placeholder="Search action, email, IP, details..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Staff Member Filter */}
              <div>
                <select
                  value={auditUserId}
                  onChange={(e) => {
                    setAuditUserId(e.target.value);
                    setAuditPage(1);
                  }}
                  className="w-full p-1.5 text-xs border rounded-lg border-slate-300 bg-white"
                >
                  <option value="all">All Staff Members</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Outcome Filter */}
              <div>
                <select
                  value={auditOutcome}
                  onChange={(e) => {
                    setAuditOutcome(e.target.value);
                    setAuditPage(1);
                  }}
                  className="w-full p-1.5 text-xs border rounded-lg border-slate-300 bg-white"
                >
                  <option value="all">All Security Outcomes</option>
                  <option value="SUCCESS">SUCCESS only</option>
                  <option value="FAILED">FAILED only</option>
                  <option value="DENIED">DENIED only</option>
                </select>
              </div>

              {/* Quick Preset: Suspicious Only */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (auditOutcome === 'FAILED') {
                      setAuditOutcome('all');
                    } else {
                      setAuditOutcome('FAILED');
                    }
                    setAuditPage(1);
                  }}
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    auditOutcome === 'FAILED'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>{auditOutcome === 'FAILED' ? 'Viewing Failed Events' : 'Filter Failed / Lockouts'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Audit Logs Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Timestamp (UTC / Local)</th>
                    <th className="p-3">Staff Actor</th>
                    <th className="p-3">Sensitive Action</th>
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Client IP</th>
                    <th className="p-3 text-right">Forensic Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLoading ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-500">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                        Querying immutable security audit logs...
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-500">
                        <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <div className="font-semibold text-slate-700">No audit events match your filters</div>
                        <div className="text-[11px] text-slate-400 mt-1">Try resetting the category or search keyword.</div>
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{formatDateTime(log.created_at)}</div>
                          <div className="text-[10px] text-slate-400">{log.created_at}</div>
                        </td>
                        <td className="p-3">
                          {log.user_full_name ? (
                            <div>
                              <div className="font-bold text-slate-900">{log.user_full_name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">
                                {log.user_email} · <span className="uppercase text-[10px] font-semibold text-teal-700">{log.user_role}</span>
                              </div>
                            </div>
                          ) : log.user_email ? (
                            <div>
                              <div className="font-semibold text-slate-800 font-mono">{log.user_email}</div>
                              <div className="text-[10px] text-slate-400 uppercase">{log.user_role || 'Unauthenticated'}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">System Internal</span>
                          )}
                        </td>
                        <td className="p-3">
                          {getActionBadge(log.action, log.outcome)}
                        </td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase tracking-wider">
                            {log.entity_type}
                          </span>
                          {log.entity_id && (
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]" title={log.entity_id}>
                              {log.entity_id}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {getOutcomeBadge(log.outcome)}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedAuditLog(log)}
                            className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1 transition-colors shadow-2xs cursor-pointer"
                            title="Inspect complete audit payload and change records"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span>
                  Showing {auditLogs.length > 0 ? (auditPagination.page - 1) * auditPagination.limit + 1 : 0} to{' '}
                  {Math.min(auditPagination.page * auditPagination.limit, auditPagination.total)} of{' '}
                  <strong>{auditPagination.total}</strong> events
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1">
                  <span>Show</span>
                  <select
                    value={auditLimit}
                    onChange={(e) => {
                      setAuditLimit(parseInt(e.target.value, 10));
                      setAuditPage(1);
                    }}
                    className="p-1 border rounded bg-white text-xs border-slate-300"
                  >
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAuditPage(prev => Math.max(1, prev - 1))}
                  disabled={auditPagination.page <= 1 || auditLoading}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <span className="px-3 py-1 font-mono text-slate-700">
                  Page {auditPagination.page} of {Math.max(1, auditPagination.totalPages)}
                </span>
                <button
                  onClick={() => setAuditPage(prev => Math.min(auditPagination.totalPages, prev + 1))}
                  disabled={auditPagination.page >= auditPagination.totalPages || auditLoading}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORENSIC AUDIT EVENT INSPECTION MODAL */}
      {selectedAuditLog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-xs max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Security Audit Record Inspection</h3>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 space-y-4 grow">
              {/* Event Header Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400 font-mono">Event UUID</div>
                  <div className="font-mono font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <span>{selectedAuditLog.id}</span>
                    <button
                      onClick={() => copyToClipboard(selectedAuditLog.id, 'uuid')}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      title="Copy Event ID"
                    >
                      {copiedId === 'uuid' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-slate-400">Security Outcome</div>
                  <div className="mt-0.5">{getOutcomeBadge(selectedAuditLog.outcome)}</div>
                </div>
              </div>

              {/* Grid of Key Metadata */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">Action Performed</span>
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    {selectedAuditLog.action}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Category: {selectedAuditLog.action.split('_')[0]}
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">Timestamp</span>
                  <div className="font-mono text-xs text-slate-900">
                    {formatDateTime(selectedAuditLog.created_at)}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    {selectedAuditLog.created_at}
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">Actor Identity</span>
                  <div className="font-bold text-slate-900">
                    {selectedAuditLog.user_full_name || 'System / Unauthenticated'}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {selectedAuditLog.user_email || '—'}
                  </div>
                  <div className="text-[10px] text-teal-700 font-semibold uppercase">
                    Role: {selectedAuditLog.user_role || 'None'}
                  </div>
                </div>

                <div className="p-3 border border-slate-200 rounded-lg space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 block">Network & Target</span>
                  <div className="text-[11px] text-slate-700">
                    Client IP: <span className="font-mono font-semibold">{selectedAuditLog.ip_address || '127.0.0.1'}</span>
                  </div>
                  <div className="text-[11px] text-slate-700">
                    Entity: <span className="font-mono font-semibold uppercase text-slate-800">{selectedAuditLog.entity_type}</span>
                  </div>
                  {selectedAuditLog.entity_id && (
                    <div className="text-[10px] text-slate-500 font-mono truncate" title={selectedAuditLog.entity_id}>
                      Target ID: {selectedAuditLog.entity_id}
                    </div>
                  )}
                </div>
              </div>

              {/* Structured Payload / Forensic Details */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-700">Audit Payload & Recorded Modification Details</label>
                  {selectedAuditLog.details && (
                    <button
                      onClick={() => copyToClipboard(selectedAuditLog.details || '', 'details')}
                      className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {copiedId === 'details' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Payload</span>
                    </button>
                  )}
                </div>

                {selectedAuditLog.details ? (
                  <pre className="p-3.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedAuditLog.details);
                        return JSON.stringify(parsed, null, 2);
                      } catch {
                        return selectedAuditLog.details;
                      }
                    })()}
                  </pre>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic text-center">
                    No additional parameter payload was attached to this security log.
                  </div>
                )}
              </div>

              {/* Integrity & Compliance Footer Notice */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Append-Only Integrity:</strong> This event is sealed in the clinic's SQLite WAL audit ledger. Passwords, secrets, and auth tokens are automatically stripped and redacted prior to record creation.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-xs cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE STAFF ACCOUNT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Provision Staff Account</h3>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                  placeholder="e.g. Dr. Ngozi Chiamaka"
                  className="w-full p-2 border rounded-lg border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="e.g. dr.chiamaka"
                    className="w-full p-2 border rounded-lg border-slate-300 font-mono focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="chiamaka@capstone.ng"
                    className="w-full p-2 border rounded-lg border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full p-2 border rounded-lg border-slate-300 bg-white"
                  >
                    <option value="doctor">Doctor/Clinician</option>
                    <option value="nurse">Nurse</option>
                    <option value="lab_tech">Lab Scientist</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="accountant">Accountant / Cashier</option>
                    <option value="records_officer">Records Officer</option>
                    <option value="manager">Clinic Manager</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="+234 802 000 0000"
                    className="w-full p-2 border rounded-lg border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Department *</label>
                <input
                  type="text"
                  required
                  value={createForm.department}
                  onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={createForm.temp_password}
                  onChange={(e) => setCreateForm({ ...createForm, temp_password: e.target.value })}
                  className="w-full p-2 border rounded-lg border-slate-300 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Employee will be forced to change password upon initial login.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN RESET PASSWORD MODAL */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Admin Password Reset</h3>
              </div>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                Target Staff: <strong>{selectedStaff.full_name}</strong> (@{selectedStaff.username} · {selectedStaff.email})
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audited Reset Reason *</label>
                <input
                  type="text"
                  required
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="w-full p-2 border rounded-lg border-slate-300"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  All active sessions across all devices for this employee will be immediately revoked. This administrative password change is permanently recorded in the security audit trail.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 border rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-2xs cursor-pointer"
                >
                  Apply Password Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { StaffUser, StaffRole } from '../types';
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
  X
} from 'lucide-react';

interface StaffPageProps {
  currentUser: StaffUser;
}

export const StaffPage: React.FC<StaffPageProps> = ({ currentUser }) => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);

  // Forms
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

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/api/staff');
      setStaffList(res.staff || []);
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

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
      fetchStaff();
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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const filteredStaff = staffList.filter(
    (s) =>
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff Account Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role assignments, cryptographic sessions, instant deactivation, and password security
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Staff Account</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, role, or department..."
            className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg border-slate-300"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Staff Identity</th>
                <th className="p-3">Role & Permissions</th>
                <th className="p-3">Department</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Active</th>
                <th className="p-3 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading staff directory...
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const isActive = staff.is_active === 1;
                  const isSelf = staff.id === currentUser.id;
                  return (
                    <tr key={staff.id} className="hover:bg-slate-50">
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
                      <td className="p-3 text-slate-600">{staff.phone || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">
                        {formatDateTime(staff.last_login_at)}
                      </td>
                      <td className="p-3 text-right">
                        {currentUser.role === 'admin' && !isSelf && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedStaff(staff);
                                setNewPassword('ClinicPass@2026');
                                setShowResetModal(true);
                              }}
                              className="px-2 py-1 text-slate-700 hover:text-teal-700 hover:bg-slate-100 rounded text-xs font-semibold flex items-center gap-1"
                              title="Reset Password"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                              <span>Reset</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(staff)}
                              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                                isActive
                                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              <span>{isActive ? 'Suspend' : 'Activate'}</span>
                            </button>
                          </div>
                        )}
                        {isSelf && (
                          <span className="text-[11px] text-slate-400 italic">Current Session</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Provision Staff Account</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
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
                  className="w-full p-2 border rounded border-slate-300"
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
                    className="w-full p-2 border rounded border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Staff Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="chiamaka@medipulse.ng"
                    className="w-full p-2 border rounded border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                    className="w-full p-2 border rounded border-slate-300 bg-white"
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
                    className="w-full p-2 border rounded border-slate-300"
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
                  className="w-full p-2 border rounded border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={createForm.temp_password}
                  onChange={(e) => setCreateForm({ ...createForm, temp_password: e.target.value })}
                  className="w-full p-2 border rounded border-slate-300 font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Staff will be forced to change this on first sign-in.</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">Admin Password Reset</h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="mt-4 space-y-4">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                Target Staff: <strong>{selectedStaff.full_name}</strong> (@{selectedStaff.username})
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 border rounded font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audited Reset Reason *</label>
                <input
                  type="text"
                  required
                  value={resetReason}
                  onChange={(e) => setResetReason(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-900">
                All existing sessions on all devices for this employee will be immediately revoked.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3 py-1.5 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded"
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

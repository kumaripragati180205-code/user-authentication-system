import React, { useState, useEffect } from 'react';
import { adminApi, userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import {
  ShieldAlert,
  ShieldCheck,
  Users,
  UserCheck,
  Trash2,
  Activity,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Key,
  Lock,
  Save,
  Settings,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user: currentUser, refreshUser } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'logs', 'settings'
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Admin personal profile & password inside Admin Panel
  const [adminName, setAdminName] = useState(currentUser?.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [adminCurrentPass, setAdminCurrentPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [isSavingPass, setIsSavingPass] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getActivityLogs(),
      ]);

      setStats(usersRes.data.stats);
      setUsers(usersRes.data.users);
      setLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setActionError(err.response?.data?.message || 'Failed to load administration data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionError(null);
    setActionMessage(null);

    try {
      const res = await adminApi.updateUserRole(userId, newRole);
      setActionMessage(res.data.message);
      await fetchData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update user role.');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to delete user "${email}"? All active sessions will be revoked.`)) {
      return;
    }

    setActionError(null);
    setActionMessage(null);

    try {
      const res = await adminApi.deleteUser(userId);
      setActionMessage(res.data.message);
      await fetchData();
      setTimeout(() => setActionMessage(null), 3500);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete user.');
      setTimeout(() => setActionError(null), 3500);
    }
  };

  const handleUpdateAdminName = async (e) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);
    setIsSavingName(true);

    try {
      await userApi.updateProfile({ name: adminName });
      await refreshUser();
      setSettingsSuccess('Administrator profile name updated successfully!');
      setTimeout(() => setSettingsSuccess(null), 3500);
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangeAdminPassword = async (e) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);
    setIsSavingPass(true);

    try {
      await userApi.changePassword({ currentPassword: adminCurrentPass, newPassword: adminNewPass });
      setSettingsSuccess('Admin password changed and re-hashed successfully!');
      setAdminCurrentPass('');
      setAdminNewPass('');
      setTimeout(() => setSettingsSuccess(null), 3500);
    } catch (err) {
      setSettingsError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsSavingPass(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Top Banner: Colorful Admin Panel Hero */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-purple-500/40 bg-gradient-to-r from-purple-950/50 via-slate-900/90 to-pink-950/40 backdrop-blur-xl shadow-2xl glow-purple flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-500 p-0.5 shadow-xl shadow-purple-500/30">
            <div className="w-full h-full bg-[#0d091e] rounded-2xl flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-9 h-9" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Admin Executive Center</h1>
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 font-mono font-bold uppercase border border-purple-500/50 shadow-sm shadow-purple-500/20">
                RBAC Level 1
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Signed in as <span className="text-purple-300 font-semibold">{currentUser?.email}</span> • Full System Governance
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="self-start md:self-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-purple-600/30"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Live Data
        </button>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-md">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn shadow-md">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{actionError}</span>
        </div>
      )}

      {/* 4 Colorful Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Users */}
          <div className="relative overflow-hidden p-5 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 to-slate-900/80 backdrop-blur-xl shadow-lg glow-indigo">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Total Accounts</p>
                <p className="text-3xl font-extrabold text-white mt-1 font-mono">{stats.totalUsers}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-indigo-200/70">Verified in SQL Database</div>
          </div>

          {/* Total Admins */}
          <div className="relative overflow-hidden p-5 rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/60 to-slate-900/80 backdrop-blur-xl shadow-lg glow-purple">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Administrators</p>
                <p className="text-3xl font-extrabold text-purple-200 mt-1 font-mono">{stats.totalAdmins}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-purple-200/70">Full RBAC Permissions</div>
          </div>

          {/* Standard Users */}
          <div className="relative overflow-hidden p-5 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/60 to-slate-900/80 backdrop-blur-xl shadow-lg glow-emerald">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">Standard Members</p>
                <p className="text-3xl font-extrabold text-emerald-200 mt-1 font-mono">{stats.standardUsers}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-emerald-200/70">Role: 'user'</div>
          </div>

          {/* Active Refresh Sessions */}
          <div className="relative overflow-hidden p-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/60 to-slate-900/80 backdrop-blur-xl shadow-lg glow-cyan">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">Active Sessions</p>
                <p className="text-3xl font-extrabold text-cyan-200 mt-1 font-mono">{stats.activeSessions}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-cyan-200/70">Live Hashed Tokens in DB</div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-white/10 gap-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'users'
              ? 'text-purple-400 border-purple-500 shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'logs'
              ? 'text-purple-400 border-purple-500 shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          Security Audit Logs ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'settings'
              ? 'text-purple-400 border-purple-500 shadow-sm'
              : 'text-slate-400 border-transparent hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          Admin Security Settings
        </button>
      </div>

      {/* Tab: Users Management */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts by name, email, or role..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/60 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-purple-500 transition shadow-inner"
              />
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Displaying <span className="text-purple-400 font-bold">{filteredUsers.length}</span> of {users.length} accounts
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b1021] text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Joined Date</th>
                    <th className="py-3.5 px-5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-purple-950/20 transition">
                        <td className="py-4 px-5">
                          <div className="font-bold text-slate-100 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-mono text-xs font-bold">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-mono font-bold">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono text-slate-300">{u.email}</td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-3 py-1 rounded-full font-mono font-bold uppercase text-[10px] shadow-sm ${
                              u.role === 'admin'
                                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-purple-500/10'
                                : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-emerald-500/10'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-400 font-mono">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => handleToggleRole(u.id, u.role)}
                              disabled={isSelf}
                              title={
                                isSelf
                                  ? 'Safety rule: Cannot modify your own role'
                                  : `Toggle role to ${u.role === 'admin' ? 'user' : 'admin'}`
                              }
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed bg-slate-800 text-slate-500'
                                  : u.role === 'admin'
                                  ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40'
                                  : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40'
                              }`}
                            >
                              {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              disabled={isSelf}
                              title={isSelf ? 'Cannot delete yourself' : 'Delete user'}
                              className={`p-2 rounded-xl transition ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'text-rose-400 hover:bg-rose-500/20 border border-transparent hover:border-rose-500/30'
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl glass-card border border-purple-500/20 text-xs text-slate-300 flex items-center gap-3">
            <Activity className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <strong className="text-white">Production Audit Telemetry:</strong> Every security event (login attempt, registration, token refresh, password reset, role alteration) is recorded with IP and client signature.
            </div>
          </div>

          <div className="glass-card rounded-3xl border border-white/10 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b1021] text-slate-400 uppercase tracking-wider font-mono text-[11px] border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-5">Event Action</th>
                    <th className="py-3.5 px-5">Target User</th>
                    <th className="py-3.5 px-5">Client IP Address</th>
                    <th className="py-3.5 px-5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-purple-950/20 transition">
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-full font-bold shadow-sm ${
                            log.action.includes('FAILED')
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                              : log.action.includes('REGISTER') || log.action.includes('LOGIN')
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-purple-500/25 text-purple-300 border border-purple-500/40'
                          }`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-200">
                        {log.user_email || `User #${log.user_id || 'System'}`}
                      </td>
                      <td className="py-3.5 px-5 text-slate-400">{log.ip_address}</td>
                      <td className="py-3.5 px-5 text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Admin Security & Personal Account Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          {/* Profile Details */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Administrator Credentials
            </h3>

            {settingsSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}
            {settingsError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminName} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Admin Display Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-purple-500 text-sm text-slate-100 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Admin Email (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-sm text-slate-500 cursor-not-allowed outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingName}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingName ? 'Saving...' : 'Update Name'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 space-y-5">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Update Admin Master Password
            </h3>

            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={adminCurrentPass}
                  onChange={(e) => setAdminCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-purple-500 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Admin Password</label>
                <input
                  type="password"
                  required
                  value={adminNewPass}
                  onChange={(e) => setAdminNewPass(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/60 focus:border-purple-500 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
                <PasswordStrengthMeter password={adminNewPass} />
              </div>

              <button
                type="submit"
                disabled={isSavingPass}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Key className="w-3.5 h-3.5" />
                {isSavingPass ? 'Re-hashing...' : 'Update Admin Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

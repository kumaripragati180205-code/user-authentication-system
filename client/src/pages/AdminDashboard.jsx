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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn transition-colors duration-200">
      {/* Top Banner: Minimalist Monochrome Admin Hero */}
      <div className="p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Admin Executive Center</h1>
              <span className="text-xs px-3 py-1 rounded-full font-mono font-bold uppercase border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white">
                Admin
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Signed in as <span className="font-mono font-semibold text-neutral-900 dark:text-white">{currentUser?.email}</span> • Full Access Control
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="self-start md:self-auto px-5 py-2.5 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="p-4 rounded-2xl border border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 animate-fadeIn shadow-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-2xl border border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 animate-fadeIn shadow-sm font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 4 Clean Monochrome Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Users */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">Total Accounts</p>
                <p className="text-3xl font-black text-neutral-900 dark:text-white mt-1 font-mono">{stats.totalUsers}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 font-mono">Verified in Database</div>
          </div>

          {/* Total Admins */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">Administrators</p>
                <p className="text-3xl font-black text-neutral-900 dark:text-white mt-1 font-mono">{stats.totalAdmins}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 font-mono">Full RBAC Permissions</div>
          </div>

          {/* Standard Users */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">Standard Members</p>
                <p className="text-3xl font-black text-neutral-900 dark:text-white mt-1 font-mono">{stats.standardUsers}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 font-mono">Standard Role: 'user'</div>
          </div>

          {/* Active Sessions */}
          <div className="p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">Active Sessions</p>
                <p className="text-3xl font-black text-neutral-900 dark:text-white mt-1 font-mono">{stats.activeSessions}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 text-[11px] text-neutral-400 font-mono">Live Refresh Tokens</div>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'users'
              ? 'text-black dark:text-white border-black dark:border-white'
              : 'text-neutral-500 border-transparent hover:text-black dark:hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          User Management ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'logs'
              ? 'text-black dark:text-white border-black dark:border-white'
              : 'text-neutral-500 border-transparent hover:text-black dark:hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4" />
          Security Audit Logs ({logs.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 text-sm font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'settings'
              ? 'text-black dark:text-white border-black dark:border-white'
              : 'text-neutral-500 border-transparent hover:text-black dark:hover:text-white'
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
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search accounts by name, email, or role..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-black dark:focus:border-white transition"
              />
            </div>
            <div className="text-xs text-neutral-500 font-mono">
              Displaying <span className="font-bold text-neutral-900 dark:text-white">{filteredUsers.length}</span> of {users.length} accounts
            </div>
          </div>

          <div className="p-1 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 uppercase tracking-wider font-mono text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-5">Email</th>
                    <th className="py-3.5 px-5">Role</th>
                    <th className="py-3.5 px-5">Joined Date</th>
                    <th className="py-3.5 px-5 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    return (
                      <tr key={u.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition">
                        <td className="py-4 px-5">
                          <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-mono text-xs font-bold">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full border border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 font-mono font-bold">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono text-neutral-600 dark:text-neutral-300">{u.email}</td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-3 py-1 rounded-full font-mono font-bold uppercase text-[10px] border ${
                              u.role === 'admin'
                                ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                                : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-neutral-500 font-mono">
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
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                                isSelf
                                  ? 'opacity-30 cursor-not-allowed bg-neutral-100 dark:bg-neutral-900 text-neutral-400 border-neutral-300 dark:border-neutral-700'
                                  : 'bg-neutral-100 dark:bg-neutral-900 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white'
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
                                  ? 'opacity-30 cursor-not-allowed text-neutral-400'
                                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white'
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
          <div className="p-4 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-3">
            <Activity className="w-5 h-5 text-neutral-900 dark:text-white shrink-0" />
            <div>
              <strong className="text-neutral-900 dark:text-white">Audit Telemetry:</strong> Every security event (login, registration, token refresh, password reset, role update) is logged with client IP and timestamp.
            </div>
          </div>

          <div className="p-1 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-500 uppercase tracking-wider font-mono text-[11px] border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="py-3.5 px-5">Event Action</th>
                    <th className="py-3.5 px-5">Target User</th>
                    <th className="py-3.5 px-5">Client IP Address</th>
                    <th className="py-3.5 px-5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-[11px]">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/60 transition">
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-full font-bold border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-neutral-800 dark:text-neutral-200">
                        {log.user_email || `User #${log.user_id || 'System'}`}
                      </td>
                      <td className="py-3.5 px-5 text-neutral-500">{log.ip_address}</td>
                      <td className="py-3.5 px-5 text-neutral-500">
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
          <div className="p-6 sm:p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-5">
            <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Administrator Credentials
            </h3>

            {settingsSuccess && (
              <div className="p-3.5 rounded-2xl border border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}
            {settingsError && (
              <div className="p-3.5 rounded-2xl border border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateAdminName} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Admin Display Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Admin Email (Read-only)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 cursor-not-allowed outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingName}
                className="w-full py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                {isSavingName ? 'Saving...' : 'Update Name'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="p-6 sm:p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-5">
            <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Update Admin Master Password
            </h3>

            <form onSubmit={handleChangeAdminPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={adminCurrentPass}
                  onChange={(e) => setAdminCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-black dark:focus:border-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">New Admin Password</label>
                <input
                  type="password"
                  required
                  value={adminNewPass}
                  onChange={(e) => setAdminNewPass(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-black dark:focus:border-white transition"
                />
                <PasswordStrengthMeter password={adminNewPass} />
              </div>

              <button
                type="submit"
                disabled={isSavingPass}
                className="w-full py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition shadow-sm flex items-center justify-center gap-2"
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

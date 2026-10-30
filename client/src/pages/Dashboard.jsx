import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import TokenInspectorModal from '../components/TokenInspectorModal';
import {
  User,
  Shield,
  Key,
  Clock,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function Dashboard() {
  const { user, refreshUser, tokenTimeLeft } = useAuth();

  // If user is Admin, they belong in Admin Panel only!
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const [profileData, setProfileData] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passError, setPassError] = useState(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Token modal
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const loadProfile = async () => {
    try {
      const res = await userApi.getProfile();
      setProfileData(res.data);
      setName(res.data.user.name);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameError(null);
    setNameSuccess(false);
    setIsUpdatingName(true);

    try {
      await userApi.updateProfile({ name });
      await refreshUser();
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch (err) {
      setNameError(err.response?.data?.message || 'Failed to update name.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);
    setIsChangingPass(true);

    try {
      await userApi.changePassword({ currentPassword, newPassword });
      setPassSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (err) {
      setPassError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      {/* Top Banner: Colorful User Dashboard Hero */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-indigo-950/40 backdrop-blur-xl shadow-2xl glow-emerald flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center gap-5 relative z-10">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 shadow-xl shadow-emerald-500/30">
              <div className="w-full h-full bg-[#090f1d] rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-extrabold font-mono">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#080d1a] flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{user?.name}</h1>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase border border-emerald-500/40 shadow-sm shadow-emerald-500/20">
                User Account
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-emerald-400 font-mono">{user?.email}</span>
              <span>•</span>
              <span className="text-slate-500">Member ID #{user?.id}</span>
            </p>
          </div>
        </div>

        {/* Live Token Status Pill */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-emerald-500/30 text-xs space-y-1 shadow-md">
            <div className="text-slate-300 flex items-center justify-between gap-4 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Zap className="w-3.5 h-3.5" />
                Session Token:
              </span>
              <span className="font-mono text-emerald-300 font-bold">
                {tokenTimeLeft !== null ? `${Math.floor(tokenTimeLeft / 60)}m ${tokenTimeLeft % 60}s` : 'Active'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">Auto-refreshed via Axios interceptor</div>
          </div>

          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
          >
            <Key className="w-4 h-4" />
            Inspect JWT
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Settings & Change Password */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Details Card */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <User className="w-4 h-4" />
                </div>
                Personal Profile Information
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                Standard Member
              </span>
            </div>

            {nameSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Profile name updated successfully!
              </div>
            )}
            {nameError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {nameError}
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address (Locked)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-sm text-slate-500 cursor-not-allowed outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/30 flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isUpdatingName ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="glass-card p-6 sm:p-7 rounded-3xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Lock className="w-4 h-4" />
                </div>
                Change Password
              </h3>
              <span className="text-xs font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                12-Round Bcrypt
              </span>
            </div>

            {passSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Password has been updated and securely re-hashed!
              </div>
            )}
            {passError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-100 placeholder-slate-600 outline-none transition"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Key className="w-3.5 h-3.5" />
                  {isChangingPass ? 'Re-hashing...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Security Overview & Audit Log */}
        <div className="space-y-6">
          {/* Security Stats */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Security Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-emerald-500/20 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Active Refresh Sessions</span>
                <span className="font-mono text-emerald-300 font-bold px-2 py-0.5 rounded-full bg-emerald-500/20">
                  {profileData?.activeSessionsCount ?? 1} device
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-indigo-500/20 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Account Created</span>
                <span className="font-mono text-indigo-300">
                  {profileData?.user?.created_at
                    ? new Date(profileData.user.created_at).toLocaleDateString()
                    : 'Today'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/20 flex items-center justify-between">
                <span className="text-slate-300 font-medium">Token Rotation</span>
                <span className="font-mono text-cyan-300 font-semibold">Enabled (7 Days)</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              My Security Activity
            </h3>

            <div className="space-y-3">
              {profileData?.recentActivity?.length > 0 ? (
                profileData.recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-cyan-300 font-bold">{log.action}</span>
                      <span className="text-slate-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      IP: <span className="font-mono">{log.ip_address}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  No recent activity logged yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TokenInspectorModal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)} />
    </div>
  );
}

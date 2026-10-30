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
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Eye,
  EyeOff,
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
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn transition-colors duration-200">
      {/* Top Banner: Minimalist Monochrome Hero */}
      <div className="p-6 sm:p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-2xl sm:text-3xl font-black font-mono shadow-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tracking-tight">{user?.name}</h1>
              <span className="text-xs px-3 py-1 rounded-full font-mono font-bold uppercase border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white">
                User
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-2">
              <span className="font-mono">{user?.email}</span>
              <span>•</span>
              <span>ID #{user?.id}</span>
            </p>
          </div>
        </div>

        {/* Live Token Status Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-1">
            <div className="text-neutral-700 dark:text-neutral-300 flex items-center justify-between gap-4 font-semibold">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Session Token:
              </span>
              <span className="font-mono font-bold">
                {tokenTimeLeft !== null ? `${Math.floor(tokenTimeLeft / 60)}m ${tokenTimeLeft % 60}s` : 'Active'}
              </span>
            </div>
            <div className="text-[11px] text-neutral-400">Silent refresh enabled</div>
          </div>

          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition shadow-sm flex items-center gap-2"
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
          <div className="p-6 sm:p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800">
                  <User className="w-4 h-4" />
                </div>
                Profile Information
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-mono">
                Standard Member
              </span>
            </div>

            {nameSuccess && (
              <div className="p-3.5 rounded-2xl border border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 animate-fadeIn font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Profile name updated successfully!
              </div>
            )}
            {nameError && (
              <div className="p-3.5 rounded-2xl border border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 animate-fadeIn font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {nameError}
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white outline-none focus:border-black dark:focus:border-white transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Email Address (Read-only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-500 cursor-not-allowed outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition shadow-sm flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isUpdatingName ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="p-6 sm:p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
              <h3 className="font-bold text-neutral-900 dark:text-white text-base flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800">
                  <Lock className="w-4 h-4" />
                </div>
                Change Password
              </h3>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 rounded-full">
                Bcrypt (12 Rounds)
              </span>
            </div>

            {passSuccess && (
              <div className="p-3.5 rounded-2xl border border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 animate-fadeIn font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Password has been updated and securely re-hashed!
              </div>
            )}
            {passError && (
              <div className="p-3.5 rounded-2xl border border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 animate-fadeIn font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Current Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-black dark:focus:border-white transition"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">New Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs text-neutral-500 hover:text-black dark:hover:text-white font-medium underline"
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
                  className="w-full px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-black dark:focus:border-white transition"
                />
                <PasswordStrengthMeter password={newPassword} />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition flex items-center gap-2 shadow-sm"
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
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security Overview
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Active Refresh Sessions</span>
                <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                  {profileData?.activeSessionsCount ?? 1} session
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Account Created</span>
                <span className="font-mono text-neutral-800 dark:text-neutral-200">
                  {profileData?.user?.created_at
                    ? new Date(profileData.user.created_at).toLocaleDateString()
                    : 'Today'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400 font-medium">Token Rotation</span>
                <span className="font-mono font-semibold text-neutral-900 dark:text-white">Enabled (7d)</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-4">
            <h3 className="font-bold text-neutral-900 dark:text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Security Log
            </h3>

            <div className="space-y-3">
              {profileData?.recentActivity?.length > 0 ? (
                profileData.recentActivity.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-neutral-900 dark:text-white">{log.action}</span>
                      <span className="text-neutral-400">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      IP: <span className="font-mono">{log.ip_address}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-neutral-400">
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

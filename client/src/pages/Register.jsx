import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { UserPlus, User, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(name, email, password, role);
      // Admin lands in Admin Panel, User lands in User Dashboard
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fadeIn">
      <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 glow-indigo relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -ml-10 -mt-10" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 mx-auto shadow-lg shadow-indigo-500/30">
            <div className="w-full h-full bg-[#0d091e] rounded-2xl flex items-center justify-center text-indigo-300">
              <UserPlus className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create an Account</h2>
          <p className="text-xs text-slate-300">
            Choose your role and test the authentication workflow
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 upper, 1 num, 1 sym"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Real-time Strength Meter */}
            <PasswordStrengthMeter password={password} />
          </div>

          {/* Role Picker (Interactive RBAC Testing Feature) */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Select Account Role</span>
              <span className="text-[10px] text-indigo-400 font-mono">Separate Dashboards</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  role === 'user'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <span>👤 Standard User</span>
                </div>
                <div className="text-[10px] text-emerald-300/80 mt-1">User Dashboard only</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  role === 'admin'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-200 shadow-md shadow-purple-500/20'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </div>
                <div className="text-[10px] text-purple-300/80 mt-1">Admin Panel only</div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-extrabold text-sm transition shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Hashing password & creating user...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10 relative z-10">
          Already have an account?{' '}
          <Link to="/login" className="text-pink-400 hover:text-pink-300 font-bold">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}

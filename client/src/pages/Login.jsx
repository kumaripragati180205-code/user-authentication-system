import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login(email, password);
      // Strictly separate landing routes: Admin -> /admin, User -> /dashboard
      if (data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fadeIn">
      {/* Container Card */}
      <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 glow-purple relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 mx-auto shadow-lg shadow-purple-500/30">
            <div className="w-full h-full bg-[#0d091e] rounded-2xl flex items-center justify-center text-purple-300">
              <Lock className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign In</h2>
          <p className="text-xs text-slate-300">
            Enter credentials to access your role-specific dashboard
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-purple-500/30 space-y-2 relative z-10 shadow-md">
          <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            Instant 1-Click Demo Fill:
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemo('admin@authshield.io', 'Admin@123')}
              className="px-3 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-200 text-xs font-bold transition text-left shadow-sm flex items-center justify-between"
            >
              <span>👑 Admin</span>
              <span className="text-[10px] text-purple-300 font-mono">Panel</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user@authshield.io', 'User@123')}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition text-left shadow-sm flex items-center justify-between"
            >
              <span>👤 User</span>
              <span className="text-[10px] text-emerald-300 font-mono">Member</span>
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs text-pink-400 hover:text-pink-300 transition font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 disabled:opacity-50 text-white font-extrabold text-sm transition shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Bcrypt...</span>
              </>
            ) : (
              <>
                <span>Sign In to Your Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/10 relative z-10">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-pink-400 hover:text-pink-300 font-bold">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Key, Loader2, Sparkles } from 'lucide-react';
import { authApi } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      setSuccessData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dispatch password reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 animate-fadeIn">
      <div className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 glow-amber relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        {/* Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 p-0.5 mx-auto shadow-lg shadow-amber-500/30">
            <div className="w-full h-full bg-[#160d03] rounded-2xl flex items-center justify-center text-amber-300">
              <Key className="w-6 h-6" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-slate-300">
            Enter your email to receive a secure, cryptographic 15-minute reset link
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="space-y-4 animate-fadeIn relative z-10">
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 space-y-2 shadow-md">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Reset Link Dispatched!</span>
              </div>
              <p className="text-xs text-emerald-300/80 leading-relaxed">
                {successData.message}
              </p>
            </div>

            {/* In-app Simulator Preview for Seamless Learning & Testing */}
            {successData.preview && (
              <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Simulated Email Dispatch Caught
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/30">
                    Valid 15m
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div>Cryptographic Raw Token:</div>
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-200 break-all select-all">
                    {successData.preview.rawToken}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const parsedUrl = new URL(successData.preview.resetUrl);
                    navigate(parsedUrl.pathname + parsedUrl.search);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs transition shadow-md shadow-amber-500/30 flex items-center justify-center gap-2"
                >
                  <span>Click to Test Password Reset Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 text-white font-extrabold text-sm transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Secure Token...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

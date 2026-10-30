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
    <div className="max-w-md mx-auto py-12 px-4 animate-fadeIn transition-colors duration-200">
      <div className="p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center mx-auto shadow-sm">
            <Key className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Reset Password</h2>
          <p className="text-xs text-neutral-500">
            Enter your email to receive a secure, 15-minute reset token
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl border border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs flex items-center gap-2 animate-fadeIn font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successData ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 rounded-2xl border border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white space-y-2 shadow-sm font-semibold">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Reset Token Dispatched!</span>
              </div>
              <p className="text-xs font-normal text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {successData.message}
              </p>
            </div>

            {/* In-app Simulator Preview for Seamless Learning & Testing */}
            {successData.preview && (
              <div className="p-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 space-y-3 shadow-sm">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Simulated Email Dispatch Caught
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                    Valid 15m
                  </span>
                </div>

                <div className="text-xs text-neutral-500 space-y-1">
                  <div>Cryptographic Raw Token:</div>
                  <div className="p-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono text-[11px] text-neutral-900 dark:text-white break-all select-all">
                    {successData.preview.rawToken}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const parsedUrl = new URL(successData.preview.resetUrl);
                    navigate(parsedUrl.pathname + parsedUrl.search);
                  }}
                  className="w-full py-3 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-xs transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Click to Test Password Reset Now</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Registered Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white text-sm text-neutral-900 dark:text-white placeholder-neutral-400 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50 font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Token...</span>
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
                className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-black dark:hover:text-white transition font-medium"
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

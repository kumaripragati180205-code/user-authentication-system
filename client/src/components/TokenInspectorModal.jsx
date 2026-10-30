import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, RefreshCw, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TokenInspectorModal({ isOpen, onClose }) {
  const { accessToken, decodedToken, tokenTimeLeft, forceRefreshToken } = useAuth();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  if (!isOpen) return null;

  const parts = accessToken ? accessToken.split('.') : ['', '', ''];
  const headerRaw = parts[0];
  const payloadRaw = parts[1];
  const signatureRaw = parts[2];

  let headerDecoded = null;
  try {
    headerDecoded = JSON.parse(atob(headerRaw.replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) {
    headerDecoded = { alg: 'HS256', typ: 'JWT' };
  }

  const handleCopy = () => {
    if (accessToken) {
      navigator.clipboard.writeText(accessToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await forceRefreshToken();
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (err) {
      console.error('Manual refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                Live JWT Token Inspector
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  HS256 Signed
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Inspect and decode the real JSON Web Token currently stored in your browser session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Expiration Bar */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Token Status & Expiry Timer:</div>
              <div className="text-lg font-bold text-slate-100 flex items-center gap-2 mt-0.5 font-mono">
                {tokenTimeLeft !== null ? (
                  tokenTimeLeft > 0 ? (
                    <span className="text-emerald-400">
                      Active: {Math.floor(tokenTimeLeft / 60)}m {tokenTimeLeft % 60}s remaining
                    </span>
                  ) : (
                    <span className="text-rose-400">Expired — Refresh needed</span>
                  )
                ) : (
                  <span className="text-slate-500">No active token</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium transition shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Rotating...' : 'Rotate / Refresh Token'}
              </button>
            </div>
          </div>

          {refreshSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              Token rotated successfully! A fresh JWT access token has been generated.
            </div>
          )}

          {/* Raw Encoded JWT Representation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Raw Encoded JWT (Header . Payload . Signature)
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Token'}
              </button>
            </div>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs break-all select-all leading-relaxed">
              <span className="text-rose-400 font-semibold">{headerRaw}</span>
              <span className="text-slate-500">.</span>
              <span className="text-purple-400 font-semibold">{payloadRaw}</span>
              <span className="text-slate-500">.</span>
              <span className="text-cyan-400 font-semibold">{signatureRaw}</span>
            </div>
          </div>

          {/* Decoded Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header Decoded */}
            <div className="p-4 rounded-xl bg-slate-950 border border-rose-500/20">
              <div className="text-xs font-semibold text-rose-400 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                HEADER: Algorithm & Token Type
              </div>
              <pre className="text-xs font-mono text-slate-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto">
                {JSON.stringify(headerDecoded, null, 2)}
              </pre>
            </div>

            {/* Signature Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20">
              <div className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                VERIFY SIGNATURE: HMAC-SHA256
              </div>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg">
                HMACSHA256(
                <br />
                &nbsp;&nbsp;base64UrlEncode(header) + "." +
                <br />
                &nbsp;&nbsp;base64UrlEncode(payload),
                <br />
                &nbsp;&nbsp;<strong>JWT_ACCESS_SECRET</strong>
                <br />)
              </p>
            </div>
          </div>

          {/* Payload Decoded */}
          <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/20">
            <div className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              PAYLOAD: Data Claims (User Identity & Role)
            </div>
            <pre className="text-xs font-mono text-slate-300 bg-slate-900/60 p-3 rounded-lg overflow-x-auto mb-3">
              {JSON.stringify(decodedToken, null, 2)}
            </pre>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <div>
                <strong className="text-slate-300">role:</strong> Used by RBAC middleware to allow/deny access
              </div>
              <div>
                <strong className="text-slate-300">iat (Issued At):</strong>{' '}
                {decodedToken?.iat ? new Date(decodedToken.iat * 1000).toLocaleTimeString() : 'N/A'}
              </div>
              <div>
                <strong className="text-slate-300">id:</strong> Unique database primary key
              </div>
              <div>
                <strong className="text-slate-300">exp (Expires):</strong>{' '}
                {decodedToken?.exp ? new Date(decodedToken.exp * 1000).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>💡 Production Security: Never store sensitive credentials (like passwords) in JWT claims.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}


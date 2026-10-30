import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, RefreshCw, X } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-neutral-900 dark:text-white transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
              <ShieldCheck className="w-5 h-5 text-neutral-900 dark:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Live JWT Token Inspector
                <span className="text-xs px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 font-mono">
                  HS256 Signed
                </span>
              </h3>
              <p className="text-xs text-neutral-500">
                Dissect real JSON Web Tokens stored in current session
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Expiration Bar */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-neutral-500 font-medium">Token Status & Timer:</div>
              <div className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2 mt-0.5 font-mono">
                {tokenTimeLeft !== null ? (
                  tokenTimeLeft > 0 ? (
                    <span>
                      Active: {Math.floor(tokenTimeLeft / 60)}m {tokenTimeLeft % 60}s remaining
                    </span>
                  ) : (
                    <span className="underline">Expired — Refresh needed</span>
                  )
                ) : (
                  <span className="text-neutral-400">No active token</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 disabled:opacity-50 text-xs font-bold transition shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Rotating...' : 'Rotate Token'}
              </button>
            </div>
          </div>

          {refreshSuccess && (
            <div className="p-3.5 rounded-2xl border border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-900 text-xs flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 shrink-0" />
              Token rotated successfully! A fresh JWT access token has been generated.
            </div>
          )}

          {/* Raw Encoded JWT Representation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Raw Encoded JWT (Header . Payload . Signature)
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white font-bold underline"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Token'}
              </button>
            </div>
            <div className="p-3.5 bg-neutral-100 dark:bg-neutral-900 rounded-2xl border border-neutral-300 dark:border-neutral-800 font-mono text-xs break-all select-all leading-relaxed">
              <span className="font-bold">{headerRaw}</span>
              <span className="text-neutral-400">.</span>
              <span className="font-bold">{payloadRaw}</span>
              <span className="text-neutral-400">.</span>
              <span className="font-bold">{signatureRaw}</span>
            </div>
          </div>

          {/* Decoded Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Header Decoded */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="text-xs font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
                HEADER: Algorithm & Type
              </div>
              <pre className="text-xs font-mono text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto">
                {JSON.stringify(headerDecoded, null, 2)}
              </pre>
            </div>

            {/* Signature Info */}
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
              <div className="text-xs font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
                VERIFY SIGNATURE: HMAC-SHA256
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono">
                HMACSHA256(
                <br />
                &nbsp;&nbsp;base64(header) + "." +
                <br />
                &nbsp;&nbsp;base64(payload),
                <br />
                &nbsp;&nbsp;<strong>JWT_ACCESS_SECRET</strong>
                <br />)
              </p>
            </div>
          </div>

          {/* Payload Decoded */}
          <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
            <div className="text-xs font-bold text-neutral-900 dark:text-white mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>
              PAYLOAD: Authenticated Claims
            </div>
            <pre className="text-xs font-mono text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-x-auto mb-3">
              {JSON.stringify(decodedToken, null, 2)}
            </pre>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <div>
                <strong className="text-neutral-900 dark:text-white font-mono">role:</strong> {decodedToken?.role || 'user'}
              </div>
              <div>
                <strong className="text-neutral-900 dark:text-white font-mono">iat:</strong>{' '}
                {decodedToken?.iat ? new Date(decodedToken.iat * 1000).toLocaleTimeString() : 'N/A'}
              </div>
              <div>
                <strong className="text-neutral-900 dark:text-white font-mono">id:</strong> {decodedToken?.id}
              </div>
              <div>
                <strong className="text-neutral-900 dark:text-white font-mono">exp:</strong>{' '}
                {decodedToken?.exp ? new Date(decodedToken.exp * 1000).toLocaleTimeString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Security Architecture Reference</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white text-xs font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

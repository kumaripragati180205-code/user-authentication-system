import React, { useState } from 'react';
import { useAuth, decodeJwt } from '../context/AuthContext';
import {
  FlaskConical,
  KeyRound,
  Lock,
  RefreshCw,
  Shield,
  Layers,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function AuthLab() {
  const { accessToken, decodedToken, tokenTimeLeft, forceRefreshToken, isAuthenticated } = useAuth();

  // Playground state for interactive Bcrypt demonstration
  const [testPassword, setTestPassword] = useState('SecretP@ssword2026!');
  const [saltRounds, setSaltRounds] = useState(12);
  const [copiedToken, setCopiedToken] = useState(false);

  // Custom JWT input tester
  const [customJwt, setCustomJwt] = useState(accessToken || '');
  const parsedCustom = decodeJwt(customJwt);

  const copyCustom = () => {
    if (customJwt) {
      navigator.clipboard.writeText(customJwt);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-medium">
          <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
          Interactive Production Auth Lab
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
          Deconstruct Production Auth
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Explore interactive visualizations of JWT tokens, bcrypt cryptography, refresh token rotation, and role guards used by industry leaders.
        </p>
      </div>

      {/* Lab Module 1: Live JWT Decoder & Dissector */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">1. JWT Structure Dissector</h2>
              <p className="text-xs text-slate-400">
                JSON Web Tokens consist of three Base64URL-encoded parts: Header, Payload, and Signature
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => setCustomJwt(accessToken || '')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono transition"
            >
              Load Current Session Token
            </button>
          )}
        </div>

        {/* Input box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Encoded JWT Token String:</span>
            <button
              onClick={copyCustom}
              className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
            >
              {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedToken ? 'Copied' : 'Copy'}
            </button>
          </div>
          <textarea
            rows={3}
            value={customJwt}
            onChange={(e) => setCustomJwt(e.target.value)}
            placeholder="Paste any JWT token here..."
            className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 outline-none focus:border-indigo-500 transition break-all"
          />
        </div>

        {/* 3 Color Coded Segments */}
        {customJwt && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Header */}
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-400">
                <span>HEADER (alg & typ)</span>
                <span className="font-mono text-[10px]">Part 1</span>
              </div>
              <p className="text-xs text-slate-400">
                Specifies the signing algorithm (e.g. HS256, RS256) and token type.
              </p>
              <pre className="p-3 bg-slate-950 rounded-lg text-rose-300 font-mono text-xs overflow-x-auto border border-rose-500/20">
                {JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-purple-400">
                <span>PAYLOAD (Data Claims)</span>
                <span className="font-mono text-[10px]">Part 2</span>
              </div>
              <p className="text-xs text-slate-400">
                Contains authenticated identity, RBAC role, and expiration timestamp.
              </p>
              <pre className="p-3 bg-slate-950 rounded-lg text-purple-300 font-mono text-xs overflow-x-auto border border-purple-500/20 max-h-48">
                {parsedCustom
                  ? JSON.stringify(parsedCustom, null, 2)
                  : '// Invalid or unencoded payload'}
              </pre>
            </div>

            {/* Signature */}
            <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span>VERIFY SIGNATURE</span>
                <span className="font-mono text-[10px]">Part 3</span>
              </div>
              <p className="text-xs text-slate-400">
                Prevents tampering. Only the backend with the secret key can verify it.
              </p>
              <div className="p-3 bg-slate-950 rounded-lg text-cyan-300 font-mono text-xs border border-cyan-500/20 space-y-1">
                <div>HMACSHA256(</div>
                <div className="pl-3 text-slate-400">header + "." + payload,</div>
                <div className="pl-3 text-emerald-400 font-bold">JWT_ACCESS_SECRET</div>
                <div>)</div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Lab Module 2: Bcrypt & Salt Cryptography */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">2. Bcrypt Password Hashing & Salts</h2>
            <p className="text-xs text-slate-400">
              Why hashing is a one-way mathematical function and why salt prevents rainbow table attacks
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Plaintext Input Password</label>
              <input
                type="text"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm font-mono text-slate-100 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Bcrypt Salt Work Factor:</span>
                <span className="font-mono text-indigo-400 font-bold">{saltRounds} rounds</span>
              </div>
              <input
                type="range"
                min="10"
                max="14"
                value={saltRounds}
                onChange={(e) => setSaltRounds(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10 (Fast)</span>
                <span>12 (Production Recommended)</span>
                <span>14 (Very Slow/High CPU)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 text-xs text-slate-400 space-y-2">
              <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                Adaptive Cost Factor
              </div>
              <p>
                Each increase in salt round doubles the computational difficulty (\(2^{12} = 4,096\) iterations). This deliberately slows down brute-force and GPU hashing attacks from billions of tries per second to mere hundreds.
              </p>
            </div>
          </div>

          {/* Anatomy of a Bcrypt Hash */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Anatomy of Stored Bcrypt Hash String
            </span>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs space-y-2 select-all break-all">
              <span className="text-rose-400 font-bold">$2a$</span>
              <span className="text-indigo-400 font-bold">{saltRounds}$</span>
              <span className="text-emerald-400 font-bold">N9qo8uLOickgx2ZMRZoMye</span>
              <span className="text-cyan-400 font-bold">IjZAgcfl7p92ldGxad68LJZBL92j6Wy</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 shrink-0"></span>
                <span className="text-slate-300 font-mono">$2a$:</span>
                <span className="text-slate-400">Bcrypt algorithm identifier</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-400 shrink-0"></span>
                <span className="text-slate-300 font-mono">{saltRounds}$:</span>
                <span className="text-slate-400">Cost parameter (rounds = 2^{saltRounds})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-slate-300 font-mono">22 chars:</span>
                <span className="text-slate-400">Cryptographic random salt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-cyan-400 shrink-0"></span>
                <span className="text-slate-300 font-mono">31 chars:</span>
                <span className="text-slate-400">Calculated password ciphertext hash</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lab Module 3: Refresh Token Rotation Architecture */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">3. Refresh Token Rotation (Silent Handshake)</h2>
            <p className="text-xs text-slate-400">
              Why production apps pair short-lived access tokens with long-lived refresh tokens
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                The Problem with Long-Lived Access Tokens
              </h4>
              <p className="text-slate-400">
                If an access token lasts for 30 days and an attacker intercepts it via XSS or network sniffing, they have unrestricted access for 30 days without any way for the server to revoke it statelessly.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <h4 className="font-semibold text-slate-100 text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                The Production Solution: 15m + 7d Rotation
              </h4>
              <p className="text-slate-400">
                1. <strong>Access Token (15 min):</strong> Sent in Authorization header. If stolen, window of exposure is tiny.
                <br />
                2. <strong>Refresh Token (7 days):</strong> Stored hashed in SQL database and placed in an HTTP-only cookie.
                <br />
                3. When the 15-min token expires, Axios interceptor calls <code>/api/auth/refresh</code> silently in the background, rotating the token without interrupting the user.
              </p>
            </div>
          </div>

          {/* Interactive Trigger */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
              <RefreshCw className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 text-base">Test Silent Token Rotation</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Execute a real token refresh against the backend Express server right now
              </p>
            </div>

            <button
              onClick={() => forceRefreshToken()}
              disabled={!isAuthenticated}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition shadow flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAuthenticated ? 'Rotate Session Token Now' : 'Log in to test rotation'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Production Security Checklist */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Production Authentication Security Checklist
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-emerald-400">1. Salt Rounds (Bcrypt)</span>
            <p className="text-slate-400">Minimum 10 to 12 rounds to resist modern GPU clusters.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-emerald-400">2. Hash Reset Tokens</span>
            <p className="text-slate-400">Never store raw password reset or refresh tokens in the DB; hash with SHA-256.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-emerald-400">3. HttpOnly Cookies</span>
            <p className="text-slate-400">Protect refresh tokens against Cross-Site Scripting (XSS) extraction.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-emerald-400">4. Prevent Enumeration</span>
            <p className="text-slate-400">Return identical success messages for forgot-password requests whether email exists or not.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-emerald-400">5. Session Revocation</span>
            <p className="text-slate-400">Invalidate all existing refresh tokens when a user updates their password.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-emerald-400">6. Strict Rate Limiting</span>
            <p className="text-slate-400">Limit login, registration, and reset attempts to stop automated credential stuffing.</p>
          </div>
        </div>
      </section>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import {
  Shield,
  KeyRound,
  Lock,
  UserCheck,
  RefreshCw,
  Mail,
  Database,
  ArrowRight,
  CheckCircle2,
  Server,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user, role, login } = useAuth();
  const navigate = useNavigate();
  const [dbInfo, setDbInfo] = useState('Detecting...');
  const [demoLoading, setDemoLoading] = useState(null);

  useEffect(() => {
    authApi
      .getHealth()
      .then((res) => setDbInfo(res.data.database))
      .catch(() => setDbInfo('SQLite / PostgreSQL'));
  }, []);

  const handleQuickLogin = async (email, password) => {
    setDemoLoading(email);
    try {
      await login(email, password);
      navigate(email.includes('admin') ? '/admin' : '/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setDemoLoading(null);
    }
  };

  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6 text-indigo-400" />,
      bgIcon: 'bg-indigo-500/10 border-indigo-500/30 group-hover:bg-indigo-500/20 group-hover:shadow-indigo-500/30',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      glow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
      title: 'Bcrypt Password Hashing',
      tag: '12 Salt Rounds',
      desc: 'Plaintext passwords never touch the database. Bcrypt generates adaptive salts to neutralize rainbow-table and GPU brute-force attacks.',
    },
    {
      icon: <KeyRound className="w-6 h-6 text-cyan-400" />,
      bgIcon: 'bg-cyan-500/10 border-cyan-500/30 group-hover:bg-cyan-500/20 group-hover:shadow-cyan-500/30',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      glow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/10',
      title: 'Short-Lived JWT Tokens',
      tag: '15-min Access Token',
      desc: 'Stateless JSON Web Tokens signed with HMAC-SHA256 for rapid, verified API authentication without constant DB overhead.',
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-emerald-400" />,
      bgIcon: 'bg-emerald-500/10 border-emerald-500/30 group-hover:bg-emerald-500/20 group-hover:shadow-emerald-500/30',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      glow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
      title: 'Refresh Token Rotation',
      tag: '7-Day Rotation',
      desc: 'Cryptographic refresh tokens stored safely in database and delivered via httpOnly secure cookies to prevent XSS theft.',
    },
    {
      icon: <UserCheck className="w-6 h-6 text-purple-400" />,
      bgIcon: 'bg-purple-500/10 border-purple-500/30 group-hover:bg-purple-500/20 group-hover:shadow-purple-500/30',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      glow: 'hover:border-purple-500/50 hover:shadow-purple-500/10',
      title: 'Role-Based Access Control',
      tag: 'RBAC (User vs Admin)',
      desc: 'Strict permission boundary: Standard users enjoy their dedicated dashboard, while Administrators get an exclusive executive center.',
    },
    {
      icon: <Mail className="w-6 h-6 text-amber-400" />,
      bgIcon: 'bg-amber-500/10 border-amber-500/30 group-hover:bg-amber-500/20 group-hover:shadow-amber-500/30',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      glow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
      title: 'Secure Password Reset Flow',
      tag: 'Hashed Crypto Tokens',
      desc: '15-minute expiring cryptographic tokens hashed before database storage to eliminate data breach vulnerability.',
    },
    {
      icon: <Database className="w-6 h-6 text-pink-400" />,
      bgIcon: 'bg-pink-500/10 border-pink-500/30 group-hover:bg-pink-500/20 group-hover:shadow-pink-500/30',
      badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      glow: 'hover:border-pink-500/50 hover:shadow-pink-500/10',
      title: 'Dual Engine Architecture',
      tag: 'PostgreSQL + SQLite',
      desc: 'Zero-config local SQLite file database for instant local run, with native PostgreSQL pool support configured in .env.',
    },
  ];

  return (
    <div className="space-y-24 py-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-8">
        {/* Colorful backdrop ambient blur circles */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-500/20 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-1/4 translate-x-1/2 w-[350px] h-[350px] bg-fuchsia-500/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 text-xs font-mono font-bold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin-slow" />
          <span>Production-Grade Authentication & Authorization</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.12]">
          Secure Full-Stack <br />
          <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
            User Authentication System
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Built with React, Express, Bcrypt password encryption, JWT access tokens, silent token rotation, and separate Role-Based dashboards for Users and Admins.
        </p>

        {/* Dynamic Role-Separated Action Buttons */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            role === 'admin' ? (
              <Link
                to="/admin"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm transition shadow-xl shadow-purple-600/35 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                Go to Admin Panel
                <ShieldCheck className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-sm transition shadow-xl shadow-emerald-600/35 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                Go to User Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            )
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-extrabold text-sm transition shadow-xl shadow-purple-600/30 flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 border border-slate-700/80 font-bold text-sm transition shadow-md"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* 1-Click Interactive Demo Sandbox Bar */}
        {!isAuthenticated && (
          <div className="mt-12 p-5 rounded-3xl glass-card max-w-xl mx-auto border border-white/10 shadow-2xl">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3.5 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Instant 1-Click Demo Testing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                onClick={() => handleQuickLogin('admin@authshield.io', 'Admin@123')}
                disabled={demoLoading !== null}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-pink-950/40 hover:from-purple-900/70 hover:to-pink-900/50 border border-purple-500/40 text-purple-200 transition text-left flex items-center justify-between group shadow-sm hover:shadow-purple-500/20"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    👑 Demo Admin
                  </div>
                  <div className="text-[11px] text-purple-300 font-mono mt-0.5">admin@authshield.io</div>
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-purple-500/30 text-purple-200 uppercase border border-purple-500/50">
                  {demoLoading === 'admin@authshield.io' ? 'Loading...' : 'Admin'}
                </span>
              </button>

              <button
                onClick={() => handleQuickLogin('user@authshield.io', 'User@123')}
                disabled={demoLoading !== null}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-teal-950/40 hover:from-emerald-900/70 hover:to-teal-900/50 border border-emerald-500/40 text-emerald-200 transition text-left flex items-center justify-between group shadow-sm hover:shadow-emerald-500/20"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    👤 Demo User
                  </div>
                  <div className="text-[11px] text-emerald-300 font-mono mt-0.5">user@authshield.io</div>
                </div>
                <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-200 uppercase border border-emerald-500/50">
                  {demoLoading === 'user@authshield.io' ? 'Loading...' : 'User'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Database indicator */}
        <div className="mt-8 flex items-center justify-center gap-2.5 text-xs text-slate-400 font-mono">
          <Server className="w-4 h-4 text-emerald-400" />
          <span>Active Database:</span>
          <span className="text-emerald-300 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            {dbInfo}
          </span>
        </div>
      </section>

      {/* Production Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-white">
            Engineered with Production Security Standards
          </h2>
          <p className="text-sm text-slate-400 mt-2.5">
            Every layer follows industry security best practices to protect sensitive credentials and manage distinct role permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feat, i) => (
            <div
              key={i}
              className={`p-7 rounded-3xl glass-card transition duration-300 flex flex-col justify-between group border border-white/10 ${feat.glow} shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className={`p-3.5 rounded-2xl border transition-all duration-300 ${feat.bgIcon} shadow-md`}>
                    {feat.icon}
                  </div>
                  <span className={`text-[11px] font-mono px-3 py-1 rounded-full font-bold border ${feat.badge}`}>
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Active & Verified</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Architectural Sequence Flow Overview */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 space-y-7 shadow-2xl">
          <div>
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              Full-Stack Architecture
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              How Modern Web Authentication Works
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/60 border border-indigo-500/20 space-y-2">
              <span className="text-xs font-mono text-indigo-400 font-extrabold px-2 py-0.5 rounded bg-indigo-500/20">STEP 01</span>
              <h4 className="font-bold text-white text-sm mt-1">Credentials & Bcrypt</h4>
              <p className="text-xs text-slate-400">
                User registers. Express validates complexity, hashes password with Bcrypt (12 rounds), and saves to SQL.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900/60 border border-cyan-500/20 space-y-2">
              <span className="text-xs font-mono text-cyan-400 font-extrabold px-2 py-0.5 rounded bg-cyan-500/20">STEP 02</span>
              <h4 className="font-bold text-white text-sm mt-1">JWT Handshake</h4>
              <p className="text-xs text-slate-400">
                On login, backend verifies hash, creates 15-min JWT access token and 7-day refresh token in DB.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/60 border border-purple-500/20 space-y-2">
              <span className="text-xs font-mono text-purple-400 font-extrabold px-2 py-0.5 rounded bg-purple-500/20">STEP 03</span>
              <h4 className="font-bold text-white text-sm mt-1">RBAC Route Guards</h4>
              <p className="text-xs text-slate-400">
                Admin Panel is strictly for Administrators. Standard users are restricted to their User Dashboard.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-900/60 border border-emerald-500/20 space-y-2">
              <span className="text-xs font-mono text-emerald-400 font-extrabold px-2 py-0.5 rounded bg-emerald-500/20">STEP 04</span>
              <h4 className="font-bold text-white text-sm mt-1">Silent Token Rotation</h4>
              <p className="text-xs text-slate-400">
                When JWT expires (401), Axios interceptor seamlessly exchanges refresh token for fresh access token.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

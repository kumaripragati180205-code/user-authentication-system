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
      icon: <Lock className="w-5 h-5 text-neutral-900 dark:text-white" />,
      tag: '12 Salt Rounds',
      title: 'Bcrypt Password Hashing',
      desc: 'Plaintext passwords never touch the database. Bcrypt generates adaptive salts to neutralize rainbow-table and GPU brute-force attacks.',
    },
    {
      icon: <KeyRound className="w-5 h-5 text-neutral-900 dark:text-white" />,
      tag: '15-min Access Token',
      title: 'Short-Lived JWT Tokens',
      desc: 'Stateless JSON Web Tokens signed with HMAC-SHA256 for rapid, verified API authentication without constant DB overhead.',
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-neutral-900 dark:text-white" />,
      tag: '7-Day Rotation',
      title: 'Refresh Token Rotation',
      desc: 'Cryptographic refresh tokens stored safely in database and delivered via httpOnly secure cookies to prevent XSS theft.',
    },
    {
      icon: <UserCheck className="w-5 h-5 text-neutral-900 dark:text-white" />,
      tag: 'Strict Separation',
      title: 'Role-Based Access Control',
      desc: 'Strict permission boundary: Standard users enjoy their dedicated dashboard, while Administrators get an exclusive executive center.',
    },
    {
      icon: <Mail className="w-5 h-5 text-neutral-900 dark:text-white" />,
      tag: 'Hashed Crypto Tokens',
      title: 'Secure Password Reset Flow',
      desc: '15-minute expiring cryptographic tokens hashed before database storage to eliminate data breach vulnerability.',
    },
    {
      icon: <Database className="w-5 h-5 text-neutral-900 dark:text-white" />,
      tag: 'PostgreSQL + SQLite',
      title: 'Dual Engine Architecture',
      desc: 'Zero-config local SQLite file database for instant local run, with native PostgreSQL pool support configured in .env.',
    },
  ];

  return (
    <div className="space-y-20 py-8 animate-fadeIn transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 pt-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-mono font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Production-Grade Authentication System</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-950 dark:text-white leading-[1.12]">
          Production-Ready <br />
          <span className="text-neutral-500 dark:text-neutral-400">
            Authentication & RBAC
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Built with React, Express, Bcrypt password encryption, JWT access tokens, silent token rotation, and completely separated black & white dashboards for Users and Admins.
        </p>

        {/* Dynamic Role-Separated Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          {isAuthenticated ? (
            role === 'admin' ? (
              <Link
                to="/admin"
                className="px-7 py-3 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-sm transition shadow-sm flex items-center gap-2"
              >
                Go to Admin Panel
                <ShieldCheck className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="px-7 py-3 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-sm transition shadow-sm flex items-center gap-2"
              >
                Go to User Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            )
          ) : (
            <>
              <Link
                to="/register"
                className="px-7 py-3 rounded-2xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold text-sm transition shadow-sm flex items-center gap-2"
              >
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="px-7 py-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-800 font-bold text-sm transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* 1-Click Interactive Demo Sandbox Bar */}
        {!isAuthenticated && (
          <div className="mt-12 p-5 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 max-w-xl mx-auto shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3.5 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
              Instant 1-Click Demo Testing
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleQuickLogin('admin@authshield.io', 'Admin@123')}
                disabled={demoLoading !== null}
                className="p-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50 dark:bg-neutral-900/60 transition text-left flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    👑 Demo Admin
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">admin@authshield.io</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-400 dark:border-neutral-600 uppercase font-mono">
                  {demoLoading === 'admin@authshield.io' ? '...' : 'Admin'}
                </span>
              </button>

              <button
                onClick={() => handleQuickLogin('user@authshield.io', 'User@123')}
                disabled={demoLoading !== null}
                className="p-3.5 rounded-2xl border border-neutral-300 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-neutral-50 dark:bg-neutral-900/60 transition text-left flex items-center justify-between group shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    👤 Demo User
                  </div>
                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">user@authshield.io</div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-400 dark:border-neutral-600 uppercase font-mono">
                  {demoLoading === 'user@authshield.io' ? '...' : 'User'}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Database indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-500 font-mono">
          <Server className="w-3.5 h-3.5" />
          <span>Active Database:</span>
          <span className="font-bold text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-900">
            {dbInfo}
          </span>
        </div>
      </section>

      {/* Production Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white">
            Engineered with Production Security Standards
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            Every layer follows industry security best practices to protect sensitive credentials and manage distinct role permissions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feat, i) => (
            <div
              key={i}
              className="p-7 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-black dark:hover:border-white transition duration-200 flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
                    {feat.icon}
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300">
                    {feat.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-950 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{feat.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900 flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Verified</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step Breakdown */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 space-y-6 shadow-sm">
          <div>
            <span className="text-xs font-mono font-bold text-neutral-500 uppercase tracking-wider">
              Architecture Overview
            </span>
            <h3 className="text-2xl font-black text-neutral-950 dark:text-white mt-1">
              How Modern Web Authentication Operates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                STEP 01
              </span>
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm mt-1">Credentials & Bcrypt</h4>
              <p className="text-xs text-neutral-500">
                User registers. Express validates complexity, hashes password with Bcrypt (12 rounds), and saves to SQL.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                STEP 02
              </span>
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm mt-1">JWT Handshake</h4>
              <p className="text-xs text-neutral-500">
                On login, backend verifies hash, creates 15-min JWT access token and 7-day refresh token in DB.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                STEP 03
              </span>
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm mt-1">RBAC Route Guards</h4>
              <p className="text-xs text-neutral-500">
                Admin Panel is strictly for Administrators. Standard users are restricted to their User Dashboard.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 space-y-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                STEP 04
              </span>
              <h4 className="font-bold text-neutral-900 dark:text-white text-sm mt-1">Silent Rotation</h4>
              <p className="text-xs text-neutral-500">
                When JWT expires (401), Axios interceptor seamlessly exchanges refresh token for fresh access token.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

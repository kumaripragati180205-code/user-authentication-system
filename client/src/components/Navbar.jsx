import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  ShieldCheck,
  User,
  LogOut,
  Mail,
  Key,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { authApi } from '../services/api';
import TokenInspectorModal from './TokenInspectorModal';
import EmailSimulatorModal from './EmailSimulatorModal';

export default function Navbar() {
  const { user, isAuthenticated, role, logout, tokenTimeLeft } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailCount, setEmailCount] = useState(0);

  // Poll mailbox count
  useEffect(() => {
    const fetchMailCount = async () => {
      try {
        const res = await authApi.getInbox();
        setEmailCount(res.data.emails?.length || 0);
      } catch (e) {
        // ignore
      }
    };
    fetchMailCount();
    const interval = setInterval(fetchMailCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080d1a]/85 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-105 group-hover:rotate-3 transition duration-300">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    Auth<span className="text-white">Shield</span>
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono -mt-1 tracking-wider uppercase font-semibold">
                    Production Auth
                  </span>
                </div>
              </Link>

              {/* Strict Separated Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-2">
                {/* 1. Only show Admin Panel if user is strictly Admin */}
                {isAuthenticated && role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 border ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 border-purple-500/50 shadow-md shadow-purple-500/20'
                        : 'text-purple-300 hover:text-white hover:bg-purple-950/40 border-purple-500/20'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>Admin Panel</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-mono font-bold uppercase tracking-wide">
                      Admin
                    </span>
                  </Link>
                )}

                {/* 2. Only show User Dashboard if user is strictly Standard User */}
                {isAuthenticated && role !== 'admin' && (
                  <Link
                    to="/dashboard"
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 border ${
                      isActive('/dashboard')
                        ? 'bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-200 border-emerald-500/50 shadow-md shadow-emerald-500/20'
                        : 'text-emerald-300 hover:text-white hover:bg-emerald-950/40 border-emerald-500/20'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span>User Dashboard</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-mono font-bold uppercase tracking-wide">
                      Member
                    </span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side buttons & widgets */}
            <div className="hidden md:flex items-center gap-3">
              {/* Simulated Mailbox button */}
              <button
                onClick={() => setEmailModalOpen(true)}
                title="Open simulated email inbox"
                className="relative px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950/60 hover:from-slate-800 hover:to-indigo-900/60 border border-indigo-500/30 text-indigo-300 hover:text-white transition flex items-center gap-2 text-xs font-medium shadow-sm"
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Mailbox</span>
                {emailCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-[10px] font-bold animate-pulse">
                    {emailCount}
                  </span>
                )}
              </button>

              {/* Token Inspector Widget (when authenticated) */}
              {isAuthenticated && (
                <button
                  onClick={() => setTokenModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/30 text-amber-300 transition flex items-center gap-2 text-xs font-mono shadow-sm"
                  title="Inspect Live JWT Token"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    JWT:{' '}
                    {tokenTimeLeft !== null ? (
                      <span className={tokenTimeLeft < 60 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {Math.floor(tokenTimeLeft / 60)}:{String(tokenTimeLeft % 60).padStart(2, '0')}
                      </span>
                    ) : (
                      'Inspect'
                    )}
                  </span>
                </button>
              )}

              {/* User Account / Auth CTA */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-slate-100">{user?.name}</span>
                    <span className="text-[10px] font-mono flex items-center justify-end gap-1.5 font-bold">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          role === 'admin'
                            ? 'bg-purple-400 shadow-sm shadow-purple-400'
                            : 'bg-emerald-400 shadow-sm shadow-emerald-400'
                        }`}
                      />
                      <span className={role === 'admin' ? 'text-purple-300 uppercase' : 'text-emerald-300 uppercase'}>
                        {role}
                      </span>
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 hover:text-rose-300 border border-slate-700/60 text-slate-400 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/30 transition transform hover:-translate-y-0.5 font-bold"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setEmailModalOpen(true)}
                className="p-2 rounded-lg bg-slate-900 text-indigo-400 border border-slate-800 relative"
              >
                <Mail className="w-4 h-4" />
                {emailCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[10px] flex items-center justify-center font-bold text-white">
                    {emailCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-white/10 bg-[#080d1a] px-4 pt-2 pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                {/* Strict role-based navigation on mobile */}
                {role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold bg-purple-500/10 border border-purple-500/30 text-purple-200"
                  >
                    🛡️ Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-200"
                  >
                    👤 User Dashboard
                  </Link>
                )}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-400">{user?.email}</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-3 py-1 text-xs rounded-lg bg-rose-500/20 text-rose-300 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-semibold bg-slate-900 border border-slate-800 text-slate-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Modals */}
      <TokenInspectorModal isOpen={tokenModalOpen} onClose={() => setTokenModalOpen(false)} />
      <EmailSimulatorModal isOpen={emailModalOpen} onClose={() => setEmailModalOpen(false)} />
    </>
  );
}

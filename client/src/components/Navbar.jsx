import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  Sun,
  Moon,
} from 'lucide-react';
import { authApi } from '../services/api';
import TokenInspectorModal from './TokenInspectorModal';
import EmailSimulatorModal from './EmailSimulatorModal';

export default function Navbar() {
  const { user, isAuthenticated, role, logout, tokenTimeLeft } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-black/90 backdrop-blur-xl transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold shadow-sm group-hover:scale-105 transition transform">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-neutral-900 dark:text-white">
                    Auth<span className="text-neutral-500 dark:text-neutral-400">Shield</span>
                  </span>
                  <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-mono -mt-1 tracking-widest uppercase font-semibold">
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
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      isActive('/admin')
                        ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full border border-current font-mono uppercase">
                      Admin
                    </span>
                  </Link>
                )}

                {/* 2. Only show User Dashboard if user is strictly Standard User */}
                {isAuthenticated && role !== 'admin' && (
                  <Link
                    to="/dashboard"
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      isActive('/dashboard')
                        ? 'bg-black text-white dark:bg-white dark:text-black border-transparent shadow-sm'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>User Dashboard</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full border border-current font-mono uppercase">
                      User
                    </span>
                  </Link>
                )}
              </nav>
            </div>

            {/* Right side buttons & controls */}
            <div className="hidden md:flex items-center gap-3">
              {/* Day / Night Mode Toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 transition"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-neutral-700" />
                )}
              </button>

              {/* Simulated Mailbox button */}
              <button
                onClick={() => setEmailModalOpen(true)}
                title="Open simulated email inbox"
                className="relative px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 transition flex items-center gap-2 text-xs font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Mailbox</span>
                {emailCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold font-mono">
                    {emailCount}
                  </span>
                )}
              </button>

              {/* Token Inspector Widget (when authenticated) */}
              {isAuthenticated && (
                <button
                  onClick={() => setTokenModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 transition flex items-center gap-2 text-xs font-mono"
                  title="Inspect Live JWT Token"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>
                    JWT:{' '}
                    {tokenTimeLeft !== null ? (
                      <span className="font-bold underline">
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
                <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-800">
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">{user?.name}</span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-semibold">
                      {role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm transition"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu hamburger & theme button */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
              </button>
              <button
                onClick={() => setEmailModalOpen(true)}
                className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative text-neutral-800 dark:text-neutral-200"
              >
                <Mail className="w-4 h-4" />
                {emailCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] flex items-center justify-center font-bold">
                    {emailCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black px-4 pt-2 pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                {role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-xl text-sm font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                  >
                    User Dashboard
                  </Link>
                )}
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
                  <span className="text-xs text-neutral-500">{user?.email}</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="px-3 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-semibold bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-xl text-sm font-semibold bg-black text-white dark:bg-white dark:text-black"
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

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RoleRoute({ allowedRoles = ['admin'], children }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 animate-fadeIn">
        <div className="glass-panel p-8 rounded-2xl border border-rose-500/20 text-center space-y-6 glow-rose">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HTTP 403 FORBIDDEN
            </span>
            <h2 className="text-2xl font-bold text-slate-100">Access Denied: Insufficient Role</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              This route is protected by <strong>Role-Based Access Control (RBAC)</strong>. Your authenticated user account does not possess the permissions required to view this panel.
            </p>
          </div>

          {/* Diagnostic Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs font-mono space-y-2 max-w-md mx-auto">
            <div className="flex justify-between items-center text-slate-400">
              <span>Authenticated User:</span>
              <span className="text-slate-200">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Current User Role:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold uppercase">
                {role || 'None'}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Required Role:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold uppercase">
                {allowedRoles.join(', ')}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to User Dashboard
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition shadow-lg shadow-indigo-600/30"
            >
              <UserCheck className="w-4 h-4" />
              Log In as Administrator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}


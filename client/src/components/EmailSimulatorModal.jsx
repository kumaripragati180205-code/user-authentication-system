import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, ExternalLink, X, Clock, Key } from 'lucide-react';
import { authApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function EmailSimulatorModal({ isOpen, onClose }) {
  const [emails, setEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const loadEmails = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.getInbox();
      setEmails(res.data.emails || []);
    } catch (err) {
      console.error('Failed to load inbox:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmails();
      const interval = setInterval(loadEmails, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 flex items-center gap-2">
                Simulated Mailbox
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
                  {emails.length} message{emails.length === 1 ? '' : 's'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Production-grade email trap for password resets and verification testing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadEmails}
              disabled={isLoading}
              title="Refresh inbox"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mail list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {emails.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
              <Mail className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-medium">Inbox is empty</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Go to the <span className="text-indigo-400">Forgot Password</span> page and submit an email address to see the dispatched cryptographic reset link appear here.
              </p>
            </div>
          ) : (
            emails.map((mail) => (
              <div
                key={mail.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/30 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{mail.subject}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      To: <span className="text-slate-200 font-mono">{mail.to}</span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 shrink-0 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(mail.sentAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                    <Key className="w-3.5 h-3.5" />
                    <span>Cryptographic Reset Token (Hashed in DB):</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2 rounded border border-slate-800 break-all select-all">
                    {mail.token}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      onClose();
                      const path = new URL(mail.resetUrl).pathname + new URL(mail.resetUrl).search;
                      navigate(path);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Reset Password Form
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>🔒 Tokens expire automatically after 15 minutes.</span>
          <span>In production: sent via Nodemailer / SendGrid</span>
        </div>
      </div>
    </div>
  );
}


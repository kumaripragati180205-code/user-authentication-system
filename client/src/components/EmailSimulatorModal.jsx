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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-neutral-900 dark:text-white transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
              <Mail className="w-5 h-5 text-neutral-900 dark:text-white" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Simulated Mailbox
                <span className="text-xs px-2 py-0.5 rounded-full border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 font-mono">
                  {emails.length} message{emails.length === 1 ? '' : 's'}
                </span>
              </h3>
              <p className="text-xs text-neutral-500">
                Password resets and security email dispatches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadEmails}
              disabled={isLoading}
              title="Refresh inbox"
              className="p-2 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-500 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mail list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {emails.length === 0 ? (
            <div className="text-center py-12 px-4 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
              <Mail className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <p className="text-neutral-700 dark:text-neutral-300 font-bold">Inbox is empty</p>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                Trigger a password reset to see cryptographic tokens dispatched here.
              </p>
            </div>
          ) : (
            emails.map((mail) => (
              <div
                key={mail.id}
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white">{mail.subject}</h4>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      To: <span className="font-mono text-neutral-800 dark:text-neutral-200">{mail.to}</span>
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] text-neutral-500 shrink-0 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(mail.sentAt).toLocaleTimeString()}
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                    <Key className="w-3.5 h-3.5" />
                    <span>Cryptographic Reset Token:</span>
                  </div>
                  <p className="font-mono text-[11px] text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-900 p-2 rounded-lg break-all select-all">
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Reset Form
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-neutral-50 dark:bg-neutral-900/80 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Tokens expire in 15 minutes.</span>
          <span>Security Sandbox</span>
        </div>
      </div>
    </div>
  );
}

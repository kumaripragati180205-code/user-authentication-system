import React from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordStrengthMeter({ password = '' }) {
  const criteria = [
    { label: 'At least 8 characters', valid: password.length >= 8 },
    { label: 'One uppercase letter (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'One lowercase letter (a-z)', valid: /[a-z]/.test(password) },
    { label: 'One number (0-9)', valid: /[0-9]/.test(password) },
    { label: 'One special character (!@#$...)', valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  const score = criteria.filter((c) => c.valid).length;

  const getStrengthMeta = () => {
    switch (score) {
      case 0:
      case 1:
        return { text: 'Very Weak', color: 'bg-rose-500', width: '20%', badge: 'text-rose-400 bg-rose-500/10' };
      case 2:
        return { text: 'Weak', color: 'bg-amber-500', width: '40%', badge: 'text-amber-400 bg-amber-500/10' };
      case 3:
        return { text: 'Fair', color: 'bg-yellow-500', width: '60%', badge: 'text-yellow-400 bg-yellow-500/10' };
      case 4:
        return { text: 'Good', color: 'bg-blue-500', width: '80%', badge: 'text-blue-400 bg-blue-500/10' };
      case 5:
        return { text: 'Strong', color: 'bg-emerald-500', width: '100%', badge: 'text-emerald-400 bg-emerald-500/10' };
      default:
        return { text: 'Too Weak', color: 'bg-slate-600', width: '5%', badge: 'text-slate-400 bg-slate-800' };
    }
  };

  const meta = getStrengthMeta();

  if (!password) return null;

  return (
    <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-slate-400">Password Strength:</span>
        <span className={`px-2 py-0.5 rounded font-medium text-xs ${meta.badge}`}>
          {meta.text}
        </span>
      </div>

      {/* Strength Bar */}
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${meta.color}`}
          style={{ width: meta.width }}
        />
      </div>

      {/* Criteria checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-[11px]">
        {criteria.map((c, i) => (
          <div
            key={i}
            className={`flex items-center gap-1.5 transition-colors ${
              c.valid ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {c.valid ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            <span>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


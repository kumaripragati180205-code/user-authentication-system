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
        return { text: 'Very Weak', color: 'bg-neutral-400', width: '20%' };
      case 2:
        return { text: 'Weak', color: 'bg-neutral-500', width: '40%' };
      case 3:
        return { text: 'Fair', color: 'bg-neutral-600', width: '60%' };
      case 4:
        return { text: 'Good', color: 'bg-neutral-800 dark:bg-neutral-300', width: '80%' };
      case 5:
        return { text: 'Strong', color: 'bg-black dark:bg-white', width: '100%' };
      default:
        return { text: 'Too Weak', color: 'bg-neutral-300', width: '5%' };
    }
  };

  const meta = getStrengthMeta();

  if (!password) return null;

  return (
    <div className="mt-3 p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-neutral-500 font-medium">Password Strength:</span>
        <span className="px-2 py-0.5 rounded-full font-bold text-xs border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white">
          {meta.text}
        </span>
      </div>

      {/* Strength Bar */}
      <div className="h-1.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
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
              c.valid ? 'text-black dark:text-white font-semibold' : 'text-neutral-400'
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

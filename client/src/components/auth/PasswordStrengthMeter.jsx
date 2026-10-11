import React from 'react';
import { Check, X, ShieldAlert, ShieldCheck } from 'lucide-react';

export const getPasswordCriteria = (password = '') => {
  const hasLength = password.length >= 8 && password.length <= 24;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const criteriaList = [
    { label: '8 to 24 characters', met: hasLength },
    { label: 'At least one uppercase letter (A-Z)', met: hasUpper },
    { label: 'At least one lowercase letter (a-z)', met: hasLower },
    { label: 'At least one number (0-9)', met: hasNumber },
    { label: 'At least one special symbol (!@#$%^&*)', met: hasSpecial },
  ];

  // Score from 0 to 4
  let score = 0;
  if (hasLength) score += 1;
  if (hasLower && hasUpper) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;

  // If length is out of range, cap score at 1
  if (!hasLength && password.length > 0) {
    score = Math.min(score, 1);
  }

  let label = 'Enter password';
  let color = 'bg-slate-700';
  let textColor = 'text-slate-400';

  if (password.length > 0) {
    if (score <= 1) {
      label = 'Weak';
      color = 'bg-rose-500';
      textColor = 'text-rose-400';
    } else if (score === 2) {
      label = 'Fair';
      color = 'bg-amber-500';
      textColor = 'text-amber-400';
    } else if (score === 3) {
      label = 'Good';
      color = 'bg-brand-500';
      textColor = 'text-brand-400';
    } else if (score === 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
      textColor = 'text-emerald-400';
    }
  }

  const isValid = hasLength && hasLower && hasUpper && hasNumber && hasSpecial;

  return {
    score,
    label,
    color,
    textColor,
    criteriaList,
    isValid,
  };
};

const PasswordStrengthMeter = ({ password = '', showCriteria = true }) => {
  if (!password) return null;

  const { score, label, color, textColor, criteriaList } = getPasswordCriteria(password);

  return (
    <div className="mt-2 space-y-2 rounded-xl border border-[#1E2E21] bg-[#101912] p-3 text-xs transition">
      {/* Header meter status */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold text-limestone-300">Password Strength:</span>
        <span className={`font-bold ${textColor} flex items-center space-x-1`}>
          {score >= 3 ? <ShieldCheck className="h-3.5 w-3.5 inline" /> : <ShieldAlert className="h-3.5 w-3.5 inline" />}
          <span>{label}</span>
        </span>
      </div>

      {/* 4-segment visual bar */}
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              score >= step ? color : 'bg-[#1A281E]'
            }`}
          />
        ))}
      </div>

      {/* Criteria Checklist */}
      {showCriteria && (
        <div className="mt-2.5 pt-2 border-t border-[#252E20] space-y-1">
          {criteriaList.map((crit, idx) => (
            <div key={idx} className="flex items-center space-x-2 text-[10px]">
              {crit.met ? (
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </div>
              ) : (
                <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500/10 text-rose-400">
                  <X className="h-2.5 w-2.5 stroke-[2.5]" />
                </div>
              )}
              <span className={crit.met ? 'text-limestone-200 font-medium' : 'text-limestone-400'}>
                {crit.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;

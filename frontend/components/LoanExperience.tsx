
import React from 'react';

interface Props { onSelect: (val: string) => void; }

const LoanExperience: React.FC<Props> = ({ onSelect }) => {
  const options = [
    { label: 'No, never', id: 'never' },
    { label: 'Yes, currently repaying', id: 'current' },
    { label: 'Yes, repaid fully', id: 'repaid' },
    { label: 'Yes, but had difficulties', id: 'difficulties' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <h3 className="text-2xl font-bold text-slate-900">Have you ever taken a loan before?</h3>
      <p className="text-slate-500 text-sm">Optional, non-penalizing background information.</p>
      <div className="grid gap-3">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="w-full p-4 text-left border border-slate-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-400 transition-all font-medium text-slate-700"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LoanExperience;

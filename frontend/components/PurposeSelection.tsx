
import React from 'react';
import { CreditPurpose } from '../types';

interface Props { onSelect: (p: CreditPurpose) => void; }

const PurposeSelection: React.FC<Props> = ({ onSelect }) => {
  const options: { id: CreditPurpose; label: string; desc: string; icon: string }[] = [
    { id: 'small', label: 'Daily Expenses', desc: 'Small loans for immediate needs', icon: '🛒' },
    { id: 'medium', label: 'Medium Purchase', desc: 'Equipment, appliances, or emergency repairs', icon: '📦' },
    { id: 'large', label: 'Large Loan', desc: 'Housing, business expansion, or education', icon: '🏗️' },
    { id: 'upgrade', label: 'Credit Upgrade', desc: 'Improve interest rates or credit limits', icon: '📈' },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <h3 className="text-2xl font-bold text-slate-900">What is the purpose of this credit?</h3>
      <div className="grid gap-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className="flex items-center gap-4 p-5 text-left border-2 border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50/50 transition-all group"
          >
            <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{opt.icon}</span>
            <div>
              <p className="font-bold text-slate-900">{opt.label}</p>
              <p className="text-sm text-slate-500">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PurposeSelection;

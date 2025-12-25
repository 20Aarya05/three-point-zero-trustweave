
import React, { useState } from 'react';
import { FinancialData } from '../types';

interface Props {
  onUpdate: (data: FinancialData) => void;
  onNext: () => void;
}

const FinancialCapacity: React.FC<Props> = ({ onUpdate, onNext }) => {
  const [local, setLocal] = useState<FinancialData>({
    employmentType: '',
    incomeRange: '',
    incomeStability: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = { ...local, [e.target.name]: e.target.value };
    setLocal(next);
    onUpdate(next);
  };

  const isComplete = local.employmentType && local.incomeRange && local.incomeStability;

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <h3 className="text-2xl font-bold text-slate-900">Financial Capacity</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Employment Type</label>
          <select name="employmentType" onChange={handleChange} className="w-full p-3 rounded-xl border-slate-200">
            <option value="">Select...</option>
            <option value="salaried">Salaried / Formal</option>
            <option value="self">Self-Employed / Gig Work</option>
            <option value="seasonal">Seasonal / Project-based</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Income Range (Monthly)</label>
          <select name="incomeRange" onChange={handleChange} className="w-full p-3 rounded-xl border-slate-200">
            <option value="">Select...</option>
            <option value="<20k">Under $250 / ₹20,000</option>
            <option value="20k-50k">$250 - $600 / ₹20k-50k</option>
            <option value="50k+">$600+ / ₹50k+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Income Stability</label>
          <select name="incomeStability" onChange={handleChange} className="w-full p-3 rounded-xl border-slate-200">
            <option value="">Select...</option>
            <option value="very">Very Stable</option>
            <option value="moderate">Moderate</option>
            <option value="variable">Variable</option>
          </select>
        </div>
      </div>
      <button 
        disabled={!isComplete}
        onClick={onNext}
        className={`w-full py-4 rounded-2xl font-bold transition-all ${
          isComplete ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
        }`}
      >
        Continue
      </button>
    </div>
  );
};

export default FinancialCapacity;


import React, { useState } from 'react';
import { AssetData } from '../types';

interface Props {
  onUpdate: (data: AssetData) => void;
  onNext: () => void;
}

const AssetSupport: React.FC<Props> = ({ onUpdate, onNext }) => {
  const [local, setLocal] = useState<AssetData>({
    property: false,
    fixedDeposits: false,
    collateralWillingness: false
  });

  const handleToggle = (key: keyof AssetData) => {
    const next = { ...local, [key]: !local[key] };
    setLocal(next);
    onUpdate(next);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <h3 className="text-2xl font-bold text-slate-900">Asset Support</h3>
      <p className="text-slate-500 text-sm">Identifying secondary signals for larger credit requests.</p>
      <div className="space-y-3">
        {(['property', 'fixedDeposits', 'collateralWillingness'] as const).map(key => (
          <label key={key} className="flex items-center gap-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
            <input 
              type="checkbox" 
              checked={local[key]} 
              onChange={() => handleToggle(key)}
              className="w-5 h-5 text-indigo-600 rounded"
            />
            <span className="text-sm font-medium text-slate-700 capitalize">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
          </label>
        ))}
      </div>
      <button 
        onClick={onNext}
        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg"
      >
        Finalize Assessment
      </button>
    </div>
  );
};

export default AssetSupport;

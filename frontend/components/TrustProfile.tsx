
import React from 'react';
import { AssessmentResult, TrustAssessmentState, TrustBand } from '../types';

interface Props {
  result: AssessmentResult;
  state: TrustAssessmentState;
}

const TrustProfile: React.FC<Props> = ({ result, state }) => {
  const getBandColor = (band: string) => {
    if (band.startsWith('T5')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (band.startsWith('T4')) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (band.startsWith('T3')) return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    if (band.startsWith('T2')) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-8 animate-in zoom-in duration-700">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-slate-900">Trust Assessment Report</h3>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
          Generated using behavioral, financial, and evidence-based analysis
        </p>
      </div>

      {/* Main Result */}
      <div className={`p-8 rounded-[2rem] border-2 text-center space-y-4 ${getBandColor(result.trustBand)}`}>
        <div className="text-5xl md:text-6xl font-black tracking-tighter">
          {result.trustBand.split(' ')[0]}
        </div>
        <div className="text-xl font-bold">
          {result.trustBand.split(' - ')[1]}
        </div>
        <div className="h-px bg-current opacity-20 w-16 mx-auto"></div>
        <p className="text-sm font-medium leading-relaxed max-w-sm mx-auto">
          {result.interpretation}
        </p>
      </div>

      {/* Credit Alignment */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center space-y-1">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Indicative Credit Alignment</p>
        <p className="text-xl font-bold text-slate-800">
          Typically associated with the <span className="text-indigo-600">{result.traditionalAlignment}</span> range
        </p>
        <p className="text-[10px] text-slate-400">This is not an official credit score and does not replace bureau scores.</p>
      </div>

      {/* Reasoning Bullets */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Analysis Reasoning</h4>
        <div className="grid gap-3">
          {result.reasoning.map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-slate-100 shadow-sm">
              <span className="mt-1 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </span>
              <p className="text-sm text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
        >
          Close Report
        </button>
      </div>
    </div>
  );
};

export default TrustProfile;

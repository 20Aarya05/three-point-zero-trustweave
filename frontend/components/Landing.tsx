
import React from 'react';

interface Props { onStart: () => void; }

const Landing: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in duration-700">
      <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
      </div>
      <div className="space-y-4">
        <h2 className="text-4xl font-extrabold text-slate-900 leading-tight">
          TrustWeave
        </h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
          Credit assessment based on behavior, not just bank history. Empowering the underserved through transparent AI-driven trust scores.
        </p>
      </div>
      <button 
        onClick={onStart}
        className="w-full md:w-auto px-8 py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
      >
        Start Credit Assessment
      </button>
    </div>
  );
};

export default Landing;

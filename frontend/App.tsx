
import React, { useState } from 'react';
import { 
  TrustAssessmentState, 
  CreditPurpose, 
  TrustBand, 
  AssessmentResult 
} from './types';
import Landing from './components/Landing';
import PurposeSelection from './components/PurposeSelection';
import CoreTrustForm from './components/CoreTrustForm';
import LoanExperience from './components/LoanExperience';
import FinancialCapacity from './components/FinancialCapacity';
import AssetSupport from './components/AssetSupport';
import Processing from './components/Processing';
import TrustProfile from './components/TrustProfile';
import TestUpload from './components/TestUpload';

const initialState: TrustAssessmentState = {
  step: 0,
  purpose: null,
  mobile: { simDuration: '', rechargeRegularity: '', usageConsistency: '' },
  utility: { onTimePayment: '', delayFrequency: '', billPredictability: '' },
  community: { groupParticipation: '', sharedResponsibility: '', disputeHistory: '' },
  evidence: [],
  loanExperience: '',
  financial: { employmentType: '', incomeRange: '', incomeStability: '' },
  assets: { property: false, fixedDeposits: false, collateralWillingness: false }
};

const App: React.FC = () => {
  const [state, setState] = useState<TrustAssessmentState>(initialState);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [testMode, setTestMode] = useState(false);

  // Show test component if in test mode
  if (testMode) {
    return (
      <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              TW
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TrustWeave Test</h1>
          </div>
          <button 
            onClick={() => setTestMode(false)}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← Back to App
          </button>
        </header>
        
        <main className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 min-h-[500px] border border-slate-100">
          <TestUpload />
        </main>
      </div>
    );
  }

  const nextStep = () => {
    // Determine routing logic
    let next = state.step + 1;
    
    // Skip financial capacity if purpose is small
    if (next === 4 && state.purpose === 'small') {
      next = 7; // Skip to processing
    }
    
    // Skip assets if purpose is not large/upgrade
    if (next === 5 && !['large', 'upgrade'].includes(state.purpose || '')) {
      next = 7; // Skip to processing
    }
    
    // After assets (step 5), go to processing (step 7)
    if (next === 6) {
      next = 7;
    }

    setState(prev => ({ ...prev, step: next }));
  };

  const updateState = (update: Partial<TrustAssessmentState>) => {
    setState(prev => ({ ...prev, ...update }));
  };

  const handleFinish = (res: AssessmentResult) => {
    setResult(res);
    setState(prev => ({ ...prev, step: 8 }));
  };

  const renderStep = () => {
    switch (state.step) {
      case 0: return <Landing onStart={nextStep} />;
      case 1: return <PurposeSelection 
        onSelect={(p) => { updateState({ purpose: p }); nextStep(); }} 
      />;
      case 2: return <CoreTrustForm 
        data={state} 
        onUpdate={updateState} 
        onNext={nextStep} 
      />;
      case 3: return <LoanExperience 
        onSelect={(val) => { updateState({ loanExperience: val }); nextStep(); }} 
      />;
      case 4: return <FinancialCapacity 
        onUpdate={(fin) => updateState({ financial: fin })} 
        onNext={nextStep} 
      />;
      case 5: return <AssetSupport 
        onUpdate={(ass) => updateState({ assets: ass })} 
        onNext={nextStep} 
      />;
      case 6: // Fallback - should redirect to processing
        nextStep();
        return <div>Redirecting to processing...</div>;
      case 7: return <Processing state={state} onComplete={handleFinish} />;
      case 8: return <TrustProfile result={result!} state={state} />;
      default: return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="min-h-screen max-w-2xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            TW
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TrustWeave</h1>
        </div>
        <div className="flex items-center gap-4">
          {state.step > 0 && state.step < 7 && (
            <div className="text-sm font-medium text-slate-400">
              Step {state.step} of 5
            </div>
          )}
          <button 
            onClick={() => setTestMode(true)}
            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
            title="Test file upload"
          >
            🧪 Test Upload
          </button>
        </div>
      </header>
      
      <main className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 min-h-[500px] border border-slate-100 transition-all duration-300">
        {renderStep()}
      </main>

      <footer className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} TrustWeave Financial Inclusion Initiative. Powered by Gemini.
      </footer>
    </div>
  );
};

export default App;

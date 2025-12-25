
import React, { useEffect, useState } from 'react';
import { analyzeTrust, checkBackendHealth } from '../services/trustWeaveService';
import { storeAssessmentData } from '../services/supabaseService';
import { TrustAssessmentState, AssessmentResult } from '../types';

interface Props {
  state: TrustAssessmentState;
  onComplete: (res: AssessmentResult) => void;
}

const Processing: React.FC<Props> = ({ state, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  
  const steps = [
    "Checking backend availability...",
    "Interpreting behavior patterns...",
    "Analyzing payment evidence...",
    "Applying purpose-based rules...",
    "Bias & fairness checks...",
    "Finalizing Trust Band..."
  ];

  useEffect(() => {
    let timer: any;
    const process = async () => {
      // Check backend health first
      const isBackendHealthy = await checkBackendHealth();
      setBackendAvailable(isBackendHealthy);
      
      // Start stepper
      const interval = setInterval(() => {
        setCurrentStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1500);

      try {
        const result = await analyzeTrust(state);
        
        // Store assessment data in Supabase
        const sessionId = `session-${Date.now()}`;
        await storeAssessmentData(sessionId, { state, result });
        
        setTimeout(() => {
          clearInterval(interval);
          onComplete(result);
        }, 8000); // Ensure user sees the reasoning steps
      } catch (err) {
        console.error(err);
        // Even if there's an error, the analyzeTrust function provides a fallback
        setTimeout(() => {
          clearInterval(interval);
          onComplete({
            trustBand: 'T3 - Developing Trust' as any,
            interpretation: "Analysis completed with baseline metrics.",
            traditionalAlignment: "650-699",
            reasoning: ["Service temporarily unavailable", "Using fallback assessment", "Please try again later"]
          });
        }, 8000);
      }
    };
    
    process();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-indigo-600">AI</div>
      </div>
      
      <div className="space-y-4 w-full max-w-xs">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3 transition-opacity duration-300" style={{ opacity: idx <= currentStep ? 1 : 0.2 }}>
            <div className={`w-2 h-2 rounded-full ${idx < currentStep ? 'bg-green-500' : idx === currentStep ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`}></div>
            <span className={`text-sm ${idx === currentStep ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{step}</span>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-xl border text-xs ${
        backendAvailable === null ? 'bg-blue-50 border-blue-100 text-blue-800' :
        backendAvailable ? 'bg-green-50 border-green-100 text-green-800' :
        'bg-amber-50 border-amber-100 text-amber-800'
      }`}>
        {backendAvailable === null && "Connecting to TrustWeave backend..."}
        {backendAvailable === true && "TrustWeave's AI agents are processing your behavioral patterns and evidence."}
        {backendAvailable === false && "Backend unavailable - using Gemini AI fallback for assessment."}
      </div>
    </div>
  );
};

export default Processing;

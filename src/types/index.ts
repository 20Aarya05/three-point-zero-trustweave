// Frontend-compatible types
export type CreditPurpose = 'small' | 'medium' | 'large' | 'upgrade';

export interface MobileStability {
  simDuration: string;
  rechargeRegularity: string;
  usageConsistency: string;
}

export interface UtilityDiscipline {
  onTimePayment: string;
  delayFrequency: string;
  billPredictability: string;
}

export interface CommunityReliability {
  groupParticipation: string;
  sharedResponsibility: string;
  disputeHistory: string;
}

export interface EvidenceFile {
  name: string;
  type: string;
  months: number;
  url?: string; // Supabase storage URL
  uploadedAt?: string;
}

export interface FinancialData {
  employmentType: string;
  incomeRange: string;
  incomeStability: string;
}

export interface AssetData {
  property: boolean;
  fixedDeposits: boolean;
  collateralWillingness: boolean;
}

// Updated request type to match frontend
export interface TrustAssessmentRequest {
  purpose: CreditPurpose;
  mobile: MobileStability;
  utility: UtilityDiscipline;
  community: CommunityReliability;
  evidence: EvidenceFile[];
  loanExperience: string;
  financial: FinancialData;
  assets: AssetData;
}

// Legacy evaluation request (keep for backward compatibility)
export interface EvaluationRequest {
  credit_purpose: string;
  behavioral_inputs: Record<string, any>;
  evidence_metadata: Array<Record<string, any>>;
  loan_history: string;
  capacity_inputs: Record<string, any>;
  asset_inputs: Record<string, any>;
}

// Agent Output Types
export interface PurposeRoutingOutput {
  assessment_type: string;
  routing_decision: string;
  context_factors: string[];
}

export interface DataInterpretationOutput {
  interpreted_data: Record<string, any>;
  data_quality_score: number;
  missing_data_flags: string[];
}

export interface TrustReasoningOutput {
  trust_band: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  confidence_level: string;
  trust_stability: string;
  exposure_readiness_level: string;
  reasoning_factors: string[];
}

export interface BiasFairnessOutput {
  adjustments_applied: string[];
  audit_notes: string[];
  fairness_score: number;
}

export interface ImprovementGuidanceOutput {
  improvement_actions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
  guidance_summary: string;
}

// Response Types (updated to match frontend expectations)
export interface TrustProfile {
  trust_band: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  confidence_level: string;
  trust_stability: string;
  exposure_readiness_level: string;
}

export interface Explanation {
  summary_message: string;
  key_reasons: string[];
}

// Frontend-compatible response
export interface TrustAssessmentResponse {
  trustBand: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  interpretation: string;
  traditionalAlignment: string;
  reasoning: string[];
  metadata?: {
    assessment_type: string;
    generated_at: string;
    version: string;
  };
}

// Legacy evaluation response (keep for backward compatibility)
export interface EvaluationResponse {
  trust_profile: TrustProfile;
  explanation: Explanation;
  improvement_actions: Array<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    impact: string;
  }>;
  fairness_audit: {
    adjustments_applied: string[];
    audit_notes: string[];
  };
  metadata: {
    assessment_type: string;
    generated_at: string;
    version: string;
  };
}

export interface DebugResponse extends EvaluationResponse {
  debug_info: {
    purpose_routing: PurposeRoutingOutput;
    data_interpretation: DataInterpretationOutput;
    trust_reasoning: TrustReasoningOutput;
    bias_fairness: BiasFairnessOutput;
    improvement_guidance: ImprovementGuidanceOutput;
  };
}

// Error Types
export interface ApiError {
  error: string;
  message: string;
  timestamp: string;
  request_id?: string;
}
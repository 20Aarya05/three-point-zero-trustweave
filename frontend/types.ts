
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

export interface TrustAssessmentState {
  step: number;
  purpose: CreditPurpose | null;
  mobile: MobileStability;
  utility: UtilityDiscipline;
  community: CommunityReliability;
  evidence: EvidenceFile[];
  loanExperience: string;
  financial: FinancialData;
  assets: AssetData;
}

export enum TrustBand {
  T1 = 'T1 - Limited Trust',
  T2 = 'T2 - Emerging Trust',
  T3 = 'T3 - Developing Trust',
  T4 = 'T4 - Strong Trust',
  T5 = 'T5 - Exceptional Trust'
}

export interface AssessmentResult {
  trustBand: TrustBand;
  interpretation: string;
  traditionalAlignment: string;
  reasoning: string[];
}

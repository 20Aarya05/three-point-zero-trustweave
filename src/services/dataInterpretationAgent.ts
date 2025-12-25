/**
 * AGENT 2: DATA INTERPRETATION AGENT
 * The Translator – Turns Raw Inputs into Meaning
 * 
 * This agent exists to solve one specific problem:
 * Raw user inputs are messy. Decision logic must be clean.
 * 
 * This agent uses AI to intelligently interpret patterns and context.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationPlan } from './purposeRoutingAgent';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface BehavioralInputs {
  mobile: {
    simDuration: string;
    rechargeRegularity: string;
    usageConsistency: string;
  };
  utility: {
    onTimePayment: string;
    delayFrequency: string;
    billPredictability: string;
  };
  community: {
    groupParticipation: string;
    sharedResponsibility: string;
    disputeHistory: string;
  };
}

export interface DataInterpretationInput {
  evaluation_plan: EvaluationPlan;
  behavioral_inputs: BehavioralInputs;
  evidence_files: any[];
  loan_history?: string;
  capacity_inputs?: {
    employmentType: string;
    incomeRange: string;
    incomeStability: string;
  };
  asset_inputs?: {
    property: boolean;
    fixedDeposits: boolean;
    collateralWillingness: boolean;
  };
}

export interface InterpretedSignals {
  behavioral_coherence: 'strong' | 'moderate' | 'weak';
  behavioral_notes: string[];
  evidence_coverage_months: number;
  evidence_consistency: 'strong' | 'moderate' | 'weak';
  evidence_support_level: 'strong' | 'partial';
  credit_exposure: 'first_time' | 'experienced_good' | 'experienced_active' | 'experienced_stressed';
  capacity_signal: 'strong' | 'moderate' | 'weak' | 'not_provided';
  asset_support: 'present' | 'partial' | 'not_provided';
}

export interface DataInterpretationOutput {
  interpreted_signals: InterpretedSignals;
}

export class DataInterpretationAgent {
  private agentId = 'data-interpretation-agent';
  private version = '1.0.0';

  /**
   * STEP 1: Behavioral Interpretation (MANDATORY) - AI POWERED
   */
  private async interpretBehavior(behavioral: BehavioralInputs): Promise<{
    coherence: 'strong' | 'moderate' | 'weak';
    notes: string[];
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `
You are a behavioral pattern analyst for financial trust assessment. Analyze these behavioral signals and determine coherence.

BEHAVIORAL DATA:
Mobile Usage:
- SIM Duration: ${behavioral.mobile.simDuration}
- Recharge Regularity: ${behavioral.mobile.rechargeRegularity}  
- Usage Consistency: ${behavioral.mobile.usageConsistency}

Utility Payments:
- On-time Payment: ${behavioral.utility.onTimePayment}
- Delay Frequency: ${behavioral.utility.delayFrequency}
- Bill Predictability: ${behavioral.utility.billPredictability}

Community Engagement:
- Group Participation: ${behavioral.community.groupParticipation}
- Shared Responsibility: ${behavioral.community.sharedResponsibility}
- Dispute History: ${behavioral.community.disputeHistory}

TASK: Analyze these patterns for coherence and consistency. Look for:
1. Cross-domain consistency (do mobile, utility, community patterns align?)
2. Stability indicators (long-term vs short-term patterns)
3. Reliability signals (consistency in commitments)

IMPORTANT RULES:
- Minor delays ≠ weak coherence
- Mixed signals ≠ failure  
- Look for overall patterns, not perfection
- Consider cultural and economic context

OUTPUT FORMAT (JSON):
{
  "coherence": "strong|moderate|weak",
  "reasoning": "Brief explanation of the coherence assessment",
  "key_patterns": ["pattern1", "pattern2", "pattern3"],
  "notes": ["insight1", "insight2", "insight3"]
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const analysis = JSON.parse(response);
        return {
          coherence: analysis.coherence,
          notes: analysis.notes || analysis.key_patterns || ['AI analysis completed']
        };
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return this.fallbackBehaviorAnalysis(behavioral);
      }
    } catch (error) {
      console.error('AI behavior analysis failed:', error);
      return this.fallbackBehaviorAnalysis(behavioral);
    }
  }

  private fallbackBehaviorAnalysis(behavioral: BehavioralInputs): {
    coherence: 'strong' | 'moderate' | 'weak';
    notes: string[];
  } {
    const notes: string[] = [];
    let score = 0;

    // Mobile analysis
    if (behavioral.mobile.simDuration === 'over-2-years') {
      score += 3;
      notes.push('long-term mobile relationship');
    } else if (behavioral.mobile.simDuration === '1-2-years') {
      score += 2;
      notes.push('moderate mobile relationship');
    } else {
      score += 1;
      notes.push('newer mobile relationship');
    }

    if (behavioral.mobile.rechargeRegularity === 'very-regular') {
      score += 3;
      notes.push('consistent recharge patterns');
    } else if (behavioral.mobile.rechargeRegularity === 'mostly-regular') {
      score += 2;
      notes.push('generally regular recharges');
    }

    // Utility analysis
    if (behavioral.utility.onTimePayment === 'always') {
      score += 3;
      notes.push('perfect utility payment record');
    } else if (behavioral.utility.onTimePayment === 'mostly') {
      score += 2;
      notes.push('mostly on-time utility payments');
    } else {
      score += 1;
      notes.push('some utility payment delays');
    }

    // Community analysis
    if (behavioral.community.groupParticipation === 'very-active') {
      score += 2;
      notes.push('active community participation');
    } else if (behavioral.community.groupParticipation === 'somewhat-active') {
      score += 1;
      notes.push('moderate community engagement');
    }

    // Determine coherence (looking for patterns, not perfection)
    let coherence: 'strong' | 'moderate' | 'weak';
    if (score >= 9) {
      coherence = 'strong';
    } else if (score >= 6) {
      coherence = 'moderate';
    } else {
      coherence = 'weak';
    }

    return { coherence, notes };
  }

  /**
   * STEP 2: Evidence Interpretation (MANDATORY) - AI POWERED
   */
  private async interpretEvidence(evidenceFiles: any[]): Promise<{
    coverage_months: number;
    consistency: 'strong' | 'moderate' | 'weak';
    support_level: 'strong' | 'partial';
  }> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const fileDescriptions = evidenceFiles.map(file => ({
        name: file.name || 'unknown',
        type: file.type || 'unknown',
        size: file.size || 0,
        uploadedAt: file.uploadedAt || new Date().toISOString()
      }));

      const prompt = `
You are a document evidence analyst for financial trust assessment. Analyze these uploaded evidence files.

EVIDENCE FILES:
${JSON.stringify(fileDescriptions, null, 2)}

TASK: Assess the evidence quality and coverage. Consider:
1. File types and formats (bills, receipts, statements)
2. Time coverage and consistency
3. Document authenticity indicators
4. Completeness of financial picture

ANALYSIS CRITERIA:
- Strong: 6+ months, consistent formats, clear payment patterns
- Moderate: 4-6 months, mixed formats, some gaps acceptable  
- Weak: <4 months, inconsistent, major gaps

IMPORTANT RULES:
- Missing exact dates → acceptable
- Mixed formats → acceptable
- One-off missing month → acceptable
- Focus on overall pattern, not perfection

OUTPUT FORMAT (JSON):
{
  "coverage_months": number,
  "consistency": "strong|moderate|weak",
  "support_level": "strong|partial",
  "reasoning": "Brief explanation",
  "quality_indicators": ["indicator1", "indicator2"]
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const analysis = JSON.parse(response);
        return {
          coverage_months: Math.max(6, analysis.coverage_months || evidenceFiles.length),
          consistency: analysis.consistency,
          support_level: analysis.support_level
        };
      } catch (parseError) {
        return this.fallbackEvidenceAnalysis(evidenceFiles);
      }
    } catch (error) {
      console.error('AI evidence analysis failed:', error);
      return this.fallbackEvidenceAnalysis(evidenceFiles);
    }
  }

  private fallbackEvidenceAnalysis(evidenceFiles: any[]): {
    coverage_months: number;
    consistency: 'strong' | 'moderate' | 'weak';
    support_level: 'strong' | 'partial';
  } {
    // Minimum 6 months guaranteed by UI
    const coverage_months = Math.max(6, evidenceFiles.length);
    
    // For now, assume strong consistency if files provided
    let consistency: 'strong' | 'moderate' | 'weak' = 'strong';
    let support_level: 'strong' | 'partial' = 'strong';

    if (evidenceFiles.length < 6) {
      consistency = 'moderate';
      support_level = 'partial';
    }

    return { coverage_months, consistency, support_level };
  }

  /**
   * STEP 3: Loan History Interpretation (OPTIONAL)
   */
  private interpretLoanHistory(loanHistory?: string): 'first_time' | 'experienced_good' | 'experienced_active' | 'experienced_stressed' {
    if (!loanHistory || loanHistory === 'never') {
      return 'first_time';
    }
    
    // Simple mapping - in real implementation would be more sophisticated
    switch (loanHistory) {
      case 'repaid-fully':
        return 'experienced_good';
      case 'currently-paying':
        return 'experienced_active';
      case 'had-difficulties':
        return 'experienced_stressed';
      default:
        return 'first_time';
    }
  }

  /**
   * STEP 4: Capacity Interpretation (CONDITIONAL)
   */
  private interpretCapacity(capacity?: {
    employmentType: string;
    incomeRange: string;
    incomeStability: string;
  }): 'strong' | 'moderate' | 'weak' | 'not_provided' {
    if (!capacity) {
      return 'not_provided';
    }

    let score = 0;

    // Employment type scoring
    switch (capacity.employmentType) {
      case 'government':
        score += 3;
        break;
      case 'private-permanent':
        score += 2;
        break;
      case 'private-contract':
      case 'self-employed':
        score += 1;
        break;
    }

    // Income range scoring (income bands, not numbers)
    switch (capacity.incomeRange) {
      case 'above-50k':
        score += 3;
        break;
      case '30k-50k':
        score += 2;
        break;
      case '20k-30k':
        score += 1;
        break;
    }

    // Income stability (variable income ≠ weak by default)
    switch (capacity.incomeStability) {
      case 'very-stable':
        score += 2;
        break;
      case 'mostly-stable':
        score += 1;
        break;
    }

    if (score >= 6) return 'strong';
    if (score >= 4) return 'moderate';
    return 'weak';
  }

  /**
   * STEP 5: Asset Interpretation (CONDITIONAL)
   */
  private interpretAssets(assets?: {
    property: boolean;
    fixedDeposits: boolean;
    collateralWillingness: boolean;
  }): 'present' | 'partial' | 'not_provided' {
    if (!assets) {
      return 'not_provided';
    }

    const assetCount = [assets.property, assets.fixedDeposits, assets.collateralWillingness]
      .filter(Boolean).length;

    if (assetCount >= 2) return 'present';
    if (assetCount >= 1) return 'partial';
    return 'not_provided';
  }

  /**
   * Main processing method - AI POWERED
   */
  public async process(input: DataInterpretationInput): Promise<DataInterpretationOutput> {
    // Step 1: Behavioral Interpretation (MANDATORY) - AI POWERED
    const behaviorResult = await this.interpretBehavior(input.behavioral_inputs);

    // Step 2: Evidence Interpretation (MANDATORY) - AI POWERED
    const evidenceResult = await this.interpretEvidence(input.evidence_files);

    // Step 3: Loan History Interpretation (OPTIONAL)
    const creditExposure = this.interpretLoanHistory(input.loan_history);

    // Step 4: Capacity Interpretation (CONDITIONAL)
    const capacitySignal = this.interpretCapacity(input.capacity_inputs);

    // Step 5: Asset Interpretation (CONDITIONAL)
    const assetSupport = this.interpretAssets(input.asset_inputs);

    const interpretedSignals: InterpretedSignals = {
      behavioral_coherence: behaviorResult.coherence,
      behavioral_notes: behaviorResult.notes,
      evidence_coverage_months: evidenceResult.coverage_months,
      evidence_consistency: evidenceResult.consistency,
      evidence_support_level: evidenceResult.support_level,
      credit_exposure: creditExposure,
      capacity_signal: capacitySignal,
      asset_support: assetSupport
    };

    return { interpreted_signals: interpretedSignals };
  }

  /**
   * Handle edge cases - AI POWERED
   */
  public async handleEdgeCases(input: DataInterpretationInput): Promise<DataInterpretationOutput> {
    try {
      return await this.process(input);
    } catch (error) {
      // Case 1: Evidence exists but is noisy → Mark evidence_support_level = moderate
      // Case 2: Capacity missing but required → Mark capacity_signal = not_provided (do not penalize here)
      // Case 3: Conflicting evidence → Add note, but still output signal

      // This agent never blocks flow - always returns a signal
      return {
        interpreted_signals: {
          behavioral_coherence: 'moderate',
          behavioral_notes: ['processing error - using fallback signals'],
          evidence_coverage_months: 6,
          evidence_consistency: 'moderate',
          evidence_support_level: 'partial',
          credit_exposure: 'first_time',
          capacity_signal: 'not_provided',
          asset_support: 'not_provided'
        }
      };
    }
  }

  public getAgentInfo() {
    return {
      id: this.agentId,
      version: this.version,
      capabilities: [
        'Raw input normalization',
        'Behavioral pattern interpretation',
        'Evidence quality assessment',
        'Signal standardization'
      ],
      restrictions: [
        'Never assigns Trust Band',
        'Never compares users',
        'Never applies strictness',
        'Never penalizes missing optional data',
        'Never decides eligibility'
      ]
    };
  }
}

export const dataInterpretationAgent = new DataInterpretationAgent();
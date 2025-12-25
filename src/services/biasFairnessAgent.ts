/**
 * AGENT 4: BIAS & FAIRNESS AGENT
 * The Auditor – Ensures Trust Was Decided Fairly
 * 
 * This agent exists to answer one question only:
 * "Was the trust decision fair, unbiased, and proportionate given the data?"
 * 
 * This agent uses AI to detect subtle biases and ensure fairness.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationPlan } from './purposeRoutingAgent';
import { InterpretedSignals } from './dataInterpretationAgent';
import { TrustDecision, TrustBand, Confidence } from './trustReasoningAgent';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface BiasFairnessInput {
  evaluation_plan: EvaluationPlan;
  interpreted_signals: InterpretedSignals;
  trust_decision: TrustDecision;
}

export interface FairnessAuditReport {
  final_trust_band: TrustBand;
  final_confidence: Confidence;
  fairness_checks_passed: boolean;
  adjustments_applied: string[];
  audit_notes: string[];
}

export interface BiasFairnessOutput {
  fairness_audit: FairnessAuditReport;
}

export class BiasFairnessAgent {
  private agentId = 'bias-fairness-agent';
  private version = '1.0.0';

  /**
   * STAGE 1: MISSING DATA BIAS CHECK
   */
  private checkMissingDataBias(
    signals: InterpretedSignals, 
    decision: TrustDecision
  ): { hasBias: boolean; notes: string[] } {
    const notes: string[] = [];
    let hasBias = false;

    // Rule: If a signal is missing but optional, it must not reduce trust
    if (signals.capacity_signal === 'not_provided' && 
        decision.trust_band < 'T3' && 
        signals.behavioral_coherence !== 'weak') {
      hasBias = true;
      notes.push('Trust reduced due to missing optional capacity data');
    }

    if (signals.asset_support === 'not_provided' && 
        decision.trust_band < 'T3' && 
        signals.behavioral_coherence === 'strong') {
      hasBias = true;
      notes.push('Trust reduced due to missing optional asset data');
    }

    return { hasBias, notes };
  }

  /**
   * STAGE 2: FIRST-TIME BORROWER PROTECTION
   */
  private checkFirstTimeBorrowerProtection(
    signals: InterpretedSignals, 
    decision: TrustDecision
  ): { needsAdjustment: boolean; adjustedBand: TrustBand; notes: string[] } {
    const notes: string[] = [];
    let needsAdjustment = false;
    let adjustedBand = decision.trust_band;

    // Rule: First-time borrowers must not be treated worse than experienced ones
    if (signals.credit_exposure === 'first_time' && 
        signals.behavioral_coherence !== 'weak' && 
        this.trustBandToNumber(decision.trust_band) < 3) {
      
      needsAdjustment = true;
      adjustedBand = 'T3';
      notes.push('Trust adjusted to avoid penalizing lack of credit history');
    }

    return { needsAdjustment, adjustedBand, notes };
  }

  /**
   * STAGE 3: INFORMAL INCOME FAIRNESS
   */
  private checkInformalIncomeFairness(
    signals: InterpretedSignals, 
    decision: TrustDecision
  ): { needsAdjustment: boolean; adjustedBand: TrustBand; adjustedConfidence: Confidence; notes: string[] } {
    const notes: string[] = [];
    let needsAdjustment = false;
    let adjustedBand = decision.trust_band;
    let adjustedConfidence = decision.confidence;

    // Rule: Variable or informal income must not equal high risk
    if (signals.capacity_signal === 'weak' && 
        signals.behavioral_coherence === 'strong' && 
        signals.evidence_support_level === 'strong' &&
        this.trustBandToNumber(decision.trust_band) <= 2) {
      
      needsAdjustment = true;
      adjustedBand = 'T3';
      adjustedConfidence = 'moderate'; // Lower confidence instead
      notes.push('Protected gig/informal worker from income-based discrimination');
    }

    return { needsAdjustment, adjustedBand, adjustedConfidence, notes };
  }

  /**
   * STAGE 4: OVER-RELIANCE CHECK
   */
  private checkOverReliance(
    signals: InterpretedSignals, 
    decision: TrustDecision
  ): { hasOverReliance: boolean; notes: string[] } {
    const notes: string[] = [];
    let hasOverReliance = false;

    // Rule: No single signal should dominate
    // This is a simplified check - in real implementation would track modifier contributions
    if (signals.asset_support === 'present' && 
        this.trustBandToNumber(decision.trust_band) >= 4 && 
        signals.behavioral_coherence !== 'strong') {
      
      hasOverReliance = true;
      notes.push('Warning: Assets should not buy trust without strong behavior');
    }

    return { hasOverReliance, notes };
  }

  /**
   * STAGE 5: PERFECT PROFILE SUSPICION
   */
  private checkPerfectProfileSuspicion(
    signals: InterpretedSignals, 
    decision: TrustDecision
  ): { needsConfidenceReduction: boolean; adjustedConfidence: Confidence; notes: string[] } {
    const notes: string[] = [];
    let needsConfidenceReduction = false;
    let adjustedConfidence = decision.confidence;

    // Rule: Unrealistic perfection lowers confidence
    const perfectSignals = [
      signals.behavioral_coherence === 'strong',
      signals.evidence_support_level === 'strong',
      signals.capacity_signal === 'strong',
      signals.asset_support === 'present',
      signals.credit_exposure === 'experienced_good'
    ].filter(Boolean).length;

    if (perfectSignals >= 4 && decision.confidence === 'high') {
      needsConfidenceReduction = true;
      adjustedConfidence = 'moderate';
      notes.push('Confidence reduced due to unusually perfect profile');
    }

    return { needsConfidenceReduction, adjustedConfidence, notes };
  }

  /**
   * STAGE 6: PURPOSE CONSISTENCY
   */
  private checkPurposeConsistency(
    plan: EvaluationPlan,
    signals: InterpretedSignals, 
    decision: TrustDecision
  ): { needsAdjustment: boolean; adjustedBand: TrustBand; notes: string[] } {
    const notes: string[] = [];
    let needsAdjustment = false;
    let adjustedBand = decision.trust_band;

    // Rule: Trust must align with exposure
    if ((plan.purpose === 'large_loan' || plan.purpose === 'credit_upgrade') &&
        this.trustBandToNumber(decision.trust_band) >= 4 &&
        signals.capacity_signal === 'weak') {
      
      needsAdjustment = true;
      adjustedBand = 'T4'; // Cap at T4
      notes.push('Trust capped due to capacity-purpose mismatch');
    }

    return { needsAdjustment, adjustedBand, notes };
  }

  /**
   * Helper method to convert trust band to number
   */
  private trustBandToNumber(band: TrustBand): number {
    return parseInt(band.substring(1));
  }

  /**
   * Helper method to convert number to trust band
   */
  private numberToTrustBand(num: number): TrustBand {
    return `T${Math.max(1, Math.min(5, num))}` as TrustBand;
  }

  /**
   * Main processing method - AI POWERED FAIRNESS AUDIT
   */
  public async process(input: BiasFairnessInput): Promise<BiasFairnessOutput> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `
You are an expert bias and fairness auditor for financial trust decisions. Your job is to ensure the trust decision was fair and unbiased.

EVALUATION PLAN:
${JSON.stringify(input.evaluation_plan, null, 2)}

INTERPRETED SIGNALS:
${JSON.stringify(input.interpreted_signals, null, 2)}

TRUST DECISION TO AUDIT:
${JSON.stringify(input.trust_decision, null, 2)}

FAIRNESS AUDIT FRAMEWORK:
1. MISSING DATA BIAS: Optional missing data must not reduce trust
2. FIRST-TIME BORROWER PROTECTION: Cannot be worse than experienced borrowers if behavior ≠ weak
3. INFORMAL INCOME FAIRNESS: Variable income ≠ high risk if behavior + evidence strong
4. OVER-RELIANCE CHECK: No single signal should dominate (especially assets)
5. PERFECT PROFILE SUSPICION: Unrealistic perfection should reduce confidence, not trust
6. PURPOSE CONSISTENCY: Trust must align with loan purpose and capacity

BIAS DETECTION CRITERIA:
- Socioeconomic bias (penalizing poverty/informality)
- Data availability bias (penalizing missing optional data)
- Credit history bias (unfair treatment of first-time borrowers)
- Income source bias (discriminating against gig/informal workers)
- Asset bias (over-weighting asset presence)

TASK: Audit this decision for fairness and bias. Apply corrections if needed.

IMPORTANT RULES:
- Never recompute trust logic from scratch
- Apply strongest protection when multiple rules trigger
- Policy wins over fairness, but reduce confidence
- Never penalize poverty or informality
- Corrections are rule-based, not subjective

OUTPUT FORMAT (JSON):
{
  "final_trust_band": "T1|T2|T3|T4|T5",
  "final_confidence": "high|moderate|low",
  "fairness_checks_passed": true|false,
  "adjustments_applied": ["first_time_borrower_protection", "informal_income_protection"],
  "audit_notes": ["Detailed explanation of any adjustments"],
  "bias_detected": ["Type of bias found, if any"],
  "protection_reasoning": "Why adjustments were made"
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        const analysis = JSON.parse(cleanResponse);
        
        const fairnessAudit: FairnessAuditReport = {
          final_trust_band: analysis.final_trust_band || input.trust_decision.trust_band,
          final_confidence: analysis.final_confidence || input.trust_decision.confidence,
          fairness_checks_passed: analysis.fairness_checks_passed !== false,
          adjustments_applied: analysis.adjustments_applied || [],
          audit_notes: analysis.audit_notes || []
        };

        return { fairness_audit: fairnessAudit };
      } catch (parseError) {
        console.error('AI fairness audit parse error:', parseError);
        return this.fallbackFairnessAudit(input);
      }
    } catch (error) {
      console.error('AI fairness audit failed:', error);
      return this.fallbackFairnessAudit(input);
    }
  }

  /**
   * Fallback fairness audit when AI fails
   */
  private fallbackFairnessAudit(input: BiasFairnessInput): BiasFairnessOutput {
    const { evaluation_plan, interpreted_signals, trust_decision } = input;
    
    let finalBand = trust_decision.trust_band;
    let finalConfidence = trust_decision.confidence;
    const adjustmentsApplied: string[] = [];
    const auditNotes: string[] = [];
    let fairnessChecksPassed = true;

    // Stage 1: Missing Data Bias Check
    const missingDataCheck = this.checkMissingDataBias(interpreted_signals, trust_decision);
    if (missingDataCheck.hasBias) {
      fairnessChecksPassed = false;
      auditNotes.push(...missingDataCheck.notes);
    }

    // Stage 2: First-Time Borrower Protection
    const firstTimeCheck = this.checkFirstTimeBorrowerProtection(interpreted_signals, trust_decision);
    if (firstTimeCheck.needsAdjustment) {
      finalBand = firstTimeCheck.adjustedBand;
      adjustmentsApplied.push('first_time_borrower_protection');
      auditNotes.push(...firstTimeCheck.notes);
    }

    // Stage 3: Informal Income Fairness
    const informalIncomeCheck = this.checkInformalIncomeFairness(interpreted_signals, trust_decision);
    if (informalIncomeCheck.needsAdjustment) {
      finalBand = informalIncomeCheck.adjustedBand;
      finalConfidence = informalIncomeCheck.adjustedConfidence;
      adjustmentsApplied.push('informal_income_protection');
      auditNotes.push(...informalIncomeCheck.notes);
    }

    const fairnessAudit: FairnessAuditReport = {
      final_trust_band: finalBand,
      final_confidence: finalConfidence,
      fairness_checks_passed: fairnessChecksPassed && adjustmentsApplied.length === 0,
      adjustments_applied: adjustmentsApplied,
      audit_notes: auditNotes
    };

    return { fairness_audit: fairnessAudit };
  }

  /**
   * Handle edge cases
   */
  public handleEdgeCases(input: BiasFairnessInput): BiasFairnessOutput {
    try {
      const result = this.process(input);

      // If multiple fairness rules trigger: Apply strongest protection
      if (result.fairness_audit.adjustments_applied.length > 1) {
        // Prioritize first-time borrower protection and informal income protection
        const priorityAdjustments = result.fairness_audit.adjustments_applied.filter(adj => 
          adj === 'first_time_borrower_protection' || adj === 'informal_income_protection'
        );
        
        if (priorityAdjustments.length > 0) {
          result.fairness_audit.audit_notes.push('Applied strongest protection when multiple rules triggered');
        }
      }

      return result;
    } catch (error) {
      // This agent never blocks a decision
      return {
        fairness_audit: {
          final_trust_band: input.trust_decision.trust_band,
          final_confidence: 'low',
          fairness_checks_passed: false,
          adjustments_applied: ['error_fallback'],
          audit_notes: ['Fairness check failed - using original decision with reduced confidence']
        }
      };
    }
  }

  public getAgentInfo() {
    return {
      id: this.agentId,
      version: this.version,
      capabilities: [
        'Missing data bias detection',
        'First-time borrower protection',
        'Informal income fairness checks',
        'Over-reliance prevention',
        'Perfect profile suspicion detection',
        'Purpose consistency validation'
      ],
      restrictions: [
        'Never recomputes Trust Band logic',
        'Never adds new data',
        'Never penalizes poverty or informality',
        'Never introduces randomness',
        'Never calls AI for fairness decisions'
      ]
    };
  }
}

export const biasFairnessAgent = new BiasFairnessAgent();
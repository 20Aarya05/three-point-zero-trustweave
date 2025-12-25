/**
 * AGENT 3: TRUST REASONING AGENT
 * The Decision-Maker – Converts Meaning into Trust
 * 
 * This agent exists to answer one and only one question:
 * "Given interpreted signals and fixed policy, how trustworthy is this user?"
 * 
 * This agent uses AI to reason about trust patterns and make intelligent decisions.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationPlan } from './purposeRoutingAgent';
import { InterpretedSignals } from './dataInterpretationAgent';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export type TrustBand = 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
export type Confidence = 'high' | 'moderate' | 'low';

export interface TrustReasoningInput {
  evaluation_plan: EvaluationPlan;
  interpreted_signals: InterpretedSignals;
}

export interface TrustDecision {
  trust_band: TrustBand;
  confidence: Confidence;
  primary_basis: string[];
  secondary_modifiers: string[];
  guardrails_applied: string[];
}

export interface TrustReasoningOutput {
  trust_decision: TrustDecision;
}

export class TrustReasoningAgent {
  private agentId = 'trust-reasoning-agent';
  private version = '1.0.0';

  /**
   * STAGE 1: BASELINE TRUST (BEHAVIOR + EVIDENCE)
   */
  private calculateBaselineTrust(signals: InterpretedSignals): { baseline: number; basis: string[] } {
    let baseline = 3; // Start at T3
    const basis: string[] = ['behavior'];

    // Rule 1: Behavioral Baseline
    switch (signals.behavioral_coherence) {
      case 'strong':
        baseline = 4; // T4
        break;
      case 'moderate':
        baseline = 3; // T3
        break;
      case 'weak':
        baseline = 2; // T2
        break;
    }

    // Rule 2: Evidence Validation (MANDATORY)
    basis.push('evidence');
    
    if (signals.evidence_support_level === 'partial') {
      baseline -= 0.5;
    }
    
    if (signals.evidence_coverage_months < 6) {
      baseline = Math.min(baseline, 3); // Cap at T3
    }

    return { baseline, basis };
  }

  /**
   * STAGE 2: MODIFIERS (REFINEMENT ONLY)
   */
  private applyModifiers(baseline: number, signals: InterpretedSignals): { 
    adjustedScore: number; 
    modifiers: string[] 
  } {
    let score = baseline;
    const modifiers: string[] = [];

    // Modifier A: Loan History
    switch (signals.credit_exposure) {
      case 'first_time':
        // No adjustment
        break;
      case 'experienced_good':
        score += 0.5;
        modifiers.push('loan_history');
        break;
      case 'experienced_active':
        score += 0.25;
        modifiers.push('loan_history');
        break;
      case 'experienced_stressed':
        score -= 0.5;
        modifiers.push('loan_history');
        break;
    }

    // Modifier B: Capacity (IF REQUIRED)
    if (signals.capacity_signal !== 'not_provided') {
      switch (signals.capacity_signal) {
        case 'strong':
          score += 0.5;
          modifiers.push('capacity');
          break;
        case 'moderate':
          score += 0.25;
          modifiers.push('capacity');
          break;
        case 'weak':
          score -= 0.25;
          modifiers.push('capacity');
          break;
      }
    }

    // Modifier C: Assets (OPTIONAL)
    if (signals.asset_support !== 'not_provided') {
      switch (signals.asset_support) {
        case 'present':
          score += 0.25;
          modifiers.push('assets');
          break;
        case 'partial':
          score += 0.1;
          modifiers.push('assets');
          break;
      }
      // Assets cannot push above T4 by themselves
      if (baseline < 4 && score > 4) {
        score = 4;
      }
    }

    return { adjustedScore: score, modifiers };
  }

  /**
   * STAGE 3: GUARDRAILS (NON-NEGOTIABLE)
   */
  private applyGuardrails(
    score: number, 
    plan: EvaluationPlan, 
    signals: InterpretedSignals
  ): { 
    finalScore: number; 
    confidence: Confidence; 
    guardrails: string[] 
  } {
    let finalScore = score;
    let confidence: Confidence = 'high';
    const guardrails: string[] = [];

    // Guardrail 1: Purpose Strictness
    const requiredLayers = plan.required_layers;
    const missingRequired: string[] = [];

    if (requiredLayers.includes('capacity') && signals.capacity_signal === 'not_provided') {
      missingRequired.push('capacity');
    }

    if (missingRequired.length > 0) {
      finalScore = Math.min(finalScore, 3); // Cap at T3
      confidence = 'low';
      guardrails.push('missing_required_data');
    }

    // Guardrail 2: No Trust Inflation
    // User can reach T5 only if: Behavioral baseline = T4, Evidence = strong, No negative modifiers
    if (finalScore > 4.5) {
      if (signals.behavioral_coherence !== 'strong' || 
          signals.evidence_support_level !== 'strong' ||
          signals.credit_exposure === 'experienced_stressed') {
        finalScore = 4;
        guardrails.push('trust_inflation_prevention');
      }
    }

    // Guardrail 3: Incoherence Protection
    if (signals.behavioral_coherence === 'weak' && signals.evidence_support_level === 'partial') {
      finalScore = Math.min(finalScore, 2); // Cap at T2
      guardrails.push('incoherence_protection');
    }

    // Guardrail 4: First-Time Borrower Protection
    if (signals.credit_exposure === 'first_time' && signals.behavioral_coherence !== 'weak') {
      finalScore = Math.max(finalScore, 3); // Cannot drop below T3
      guardrails.push('first_time_protection');
    }

    return { finalScore, confidence, guardrails };
  }

  /**
   * FINAL SNAP LOGIC
   */
  private snapToTrustBand(score: number): TrustBand {
    // Snap downward to nearest integer, clamp between T1 and T5
    const snapped = Math.floor(score);
    const clamped = Math.max(1, Math.min(5, snapped));
    
    return `T${clamped}` as TrustBand;
  }

  /**
   * Main processing method - AI POWERED REASONING
   */
  public async process(input: TrustReasoningInput): Promise<TrustReasoningOutput> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `
You are an expert trust reasoning agent for financial assessment. Your job is to convert interpreted signals into a trust band decision.

EVALUATION PLAN:
${JSON.stringify(input.evaluation_plan, null, 2)}

INTERPRETED SIGNALS:
${JSON.stringify(input.interpreted_signals, null, 2)}

REASONING FRAMEWORK:
1. BASELINE TRUST (Behavior + Evidence):
   - Strong behavioral coherence → T4 baseline
   - Moderate behavioral coherence → T3 baseline  
   - Weak behavioral coherence → T2 baseline
   - Evidence validation: partial support reduces by 0.5 band

2. MODIFIERS (Refinement):
   - Loan History: first_time=0, experienced_good=+0.5, experienced_active=+0.25, experienced_stressed=-0.5
   - Capacity: strong=+0.5, moderate=+0.25, weak=-0.25, not_provided=-0.5 (if required)
   - Assets: present=+0.25, partial=+0.1, not_provided=0

3. GUARDRAILS (Non-negotiable):
   - Missing required layers → cap at T3, low confidence
   - T5 only if: behavioral=strong, evidence=strong, no negative modifiers
   - Incoherence → cap at T2
   - First-time borrower protection → cannot drop below T3 if behavior ≠ weak

4. FINAL LOGIC:
   - Snap downward to nearest integer
   - Clamp between T1-T5

TASK: Reason through this framework and make a trust decision. Consider:
- Purpose-specific requirements and risk tolerance
- Signal coherence and consistency
- Cultural and economic context
- Bias prevention and fairness

OUTPUT FORMAT (JSON):
{
  "trust_band": "T1|T2|T3|T4|T5",
  "confidence": "high|moderate|low",
  "primary_basis": ["behavior", "evidence"],
  "secondary_modifiers": ["capacity", "loan_history", "assets"],
  "guardrails_applied": ["first_time_protection", "missing_required_data"],
  "reasoning_steps": [
    "Step 1: Baseline calculation",
    "Step 2: Modifier application", 
    "Step 3: Guardrail enforcement"
  ],
  "risk_assessment": "Brief risk summary",
  "confidence_factors": ["Factor affecting confidence"]
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        // Clean up response
        const cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        const analysis = JSON.parse(cleanResponse);
        
        const trustDecision: TrustDecision = {
          trust_band: analysis.trust_band,
          confidence: analysis.confidence,
          primary_basis: analysis.primary_basis || ['behavior', 'evidence'],
          secondary_modifiers: analysis.secondary_modifiers || [],
          guardrails_applied: analysis.guardrails_applied || []
        };

        return { trust_decision: trustDecision };
      } catch (parseError) {
        console.error('AI trust reasoning parse error:', parseError);
        return this.fallbackReasoning(input);
      }
    } catch (error) {
      console.error('AI trust reasoning failed:', error);
      return this.fallbackReasoning(input);
    }
  }

  /**
   * Fallback reasoning when AI fails
   */
  private fallbackReasoning(input: TrustReasoningInput): TrustReasoningOutput {
    const { evaluation_plan, interpreted_signals } = input;

    // Stage 1: Baseline Trust
    const { baseline, basis } = this.calculateBaselineTrust(interpreted_signals);

    // Stage 2: Modifiers
    const { adjustedScore, modifiers } = this.applyModifiers(baseline, interpreted_signals);

    // Stage 3: Guardrails
    const { finalScore, confidence, guardrails } = this.applyGuardrails(
      adjustedScore, 
      evaluation_plan, 
      interpreted_signals
    );

    // Final Snap Logic
    const trustBand = this.snapToTrustBand(finalScore);

    const trustDecision: TrustDecision = {
      trust_band: trustBand,
      confidence,
      primary_basis: basis,
      secondary_modifiers: modifiers,
      guardrails_applied: guardrails
    };

    return { trust_decision: trustDecision };
  }

  /**
   * Handle edge cases
   */
  public async handleEdgeCases(input: TrustReasoningInput): Promise<TrustReasoningOutput> {
    try {
      return await this.process(input);
    } catch (error) {
      // This agent never crashes; it degrades gracefully
      return {
        trust_decision: {
          trust_band: 'T2',
          confidence: 'low',
          primary_basis: ['behavior'],
          secondary_modifiers: [],
          guardrails_applied: ['error_fallback']
        }
      };
    }
  }

  /**
   * Detailed reasoning breakdown for debugging
   */
  public getReasoningBreakdown(input: TrustReasoningInput): {
    baseline: number;
    modifiers: { [key: string]: number };
    guardrails: string[];
    finalScore: number;
    trustBand: TrustBand;
  } {
    const { evaluation_plan, interpreted_signals } = input;

    const { baseline } = this.calculateBaselineTrust(interpreted_signals);
    const { adjustedScore, modifiers } = this.applyModifiers(baseline, interpreted_signals);
    const { finalScore, guardrails } = this.applyGuardrails(
      adjustedScore, 
      evaluation_plan, 
      interpreted_signals
    );

    const modifierBreakdown: { [key: string]: number } = {};
    // This would track individual modifier contributions in a real implementation

    return {
      baseline,
      modifiers: modifierBreakdown,
      guardrails,
      finalScore,
      trustBand: this.snapToTrustBand(finalScore)
    };
  }

  public getAgentInfo() {
    return {
      id: this.agentId,
      version: this.version,
      capabilities: [
        'Trust band assignment (T1-T5)',
        'Purpose-based strictness application',
        'Signal combination and weighting',
        'Guardrail enforcement'
      ],
      restrictions: [
        'Never reads raw user inputs',
        'Never looks at documents directly',
        'Never adjusts for bias (that\'s Agent 4)',
        'Never makes policy decisions',
        'Never predicts bureau scores'
      ]
    };
  }
}

export const trustReasoningAgent = new TrustReasoningAgent();
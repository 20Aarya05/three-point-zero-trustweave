/**
 * AGENT 5: IMPROVEMENT & GUIDANCE AGENT
 * The Coach – Turns a Decision into Action
 * 
 * This agent exists to answer one user-facing question:
 * "What can I do next, and how do I improve?"
 * 
 * This agent uses AI to provide personalized, contextual guidance.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { EvaluationPlan } from './purposeRoutingAgent';
import { InterpretedSignals } from './dataInterpretationAgent';
import { FairnessAuditReport, TrustBand } from './biasFairnessAgent';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ImprovementAction {
  category: 'Behavior' | 'Evidence' | 'Capacity' | 'Purpose';
  suggestion: string;
  impact: string;
}

export interface ImprovementGuidanceInput {
  evaluation_plan: EvaluationPlan;
  interpreted_signals: InterpretedSignals;
  final_decision: FairnessAuditReport;
}

export interface ImprovementGuidanceOutput {
  summary_message: string;
  key_reasons: string[];
  improvement_actions: ImprovementAction[];
  re_evaluation_hint: string;
}

export class ImprovementGuidanceAgent {
  private agentId = 'improvement-guidance-agent';
  private version = '1.0.0';

  /**
   * STAGE 1: FRAME THE RESULT (EMOTIONAL SAFETY)
   */
  private frameResult(trustBand: TrustBand): string {
    const framingMap: Record<TrustBand, string> = {
      'T5': 'Exceptional financial reliability with strong trust indicators',
      'T4': 'Strong financial reliability with consistent patterns',
      'T3': 'Emerging trust with solid foundation for growth',
      'T2': 'Developing financial patterns with improvement opportunities',
      'T1': 'Early-stage financial profile with potential to build'
    };

    return framingMap[trustBand] || 'Financial profile assessment completed';
  }

  /**
   * STAGE 2: EXPLAIN THE DECISION (TRANSPARENTLY)
   */
  private explainDecision(
    signals: InterpretedSignals, 
    decision: FairnessAuditReport
  ): string[] {
    const reasons: string[] = [];

    // Primary basis explanation
    if (signals.behavioral_coherence === 'strong') {
      reasons.push('Consistent behavioral patterns across multiple areas');
    } else if (signals.behavioral_coherence === 'moderate') {
      reasons.push('Generally reliable behavioral patterns');
    } else {
      reasons.push('Mixed behavioral signals requiring strengthening');
    }

    if (signals.evidence_support_level === 'strong') {
      reasons.push('Strong documentary evidence over required period');
    } else if (signals.evidence_support_level === 'partial') {
      reasons.push('Partial documentary evidence provided');
    }

    // Capacity explanation
    if (signals.capacity_signal === 'not_provided') {
      reasons.push('Limited capacity information available');
    } else if (signals.capacity_signal === 'weak') {
      reasons.push('Variable income patterns noted');
    }

    // Adjustments explanation
    if (decision.adjustments_applied.includes('first_time_borrower_protection')) {
      reasons.push('First-time borrower status considered favorably');
    }

    return reasons.slice(0, 3); // Limit to top 3 reasons
  }

  /**
   * STAGE 3: GENERATE IMPROVEMENT ACTIONS (CORE VALUE)
   */
  private generateImprovementActions(
    plan: EvaluationPlan,
    signals: InterpretedSignals,
    trustBand: TrustBand
  ): ImprovementAction[] {
    const actions: ImprovementAction[] = [];

    // Behavioral improvements
    if (signals.behavioral_coherence !== 'strong') {
      actions.push({
        category: 'Behavior',
        suggestion: 'Continue consistent payment patterns for utility bills and mobile recharges',
        impact: 'Strengthens behavioral reliability indicators'
      });
    }

    // Evidence improvements
    if (signals.evidence_support_level !== 'strong' || signals.evidence_coverage_months < 8) {
      actions.push({
        category: 'Evidence',
        suggestion: 'Upload additional months of payment receipts and bills',
        impact: 'Improves evidence strength and coverage'
      });
    }

    // Capacity improvements
    if (signals.capacity_signal === 'not_provided' && plan.required_layers.includes('capacity')) {
      actions.push({
        category: 'Capacity',
        suggestion: 'Provide employment and income stability information',
        impact: 'May unlock higher credit limits and better terms'
      });
    } else if (signals.capacity_signal === 'weak') {
      actions.push({
        category: 'Capacity',
        suggestion: 'Build more stable income patterns or provide additional income sources',
        impact: 'Strengthens financial capacity assessment'
      });
    }

    // Purpose-aware guidance
    if (plan.purpose === 'large_loan' && this.trustBandToNumber(trustBand) < 4) {
      actions.push({
        category: 'Purpose',
        suggestion: 'Consider starting with smaller loan amounts to build credit history',
        impact: 'Establishes positive repayment track record'
      });
    }

    // Asset guidance for large loans
    if ((plan.purpose === 'large_loan' || plan.purpose === 'credit_upgrade') && 
        signals.asset_support === 'not_provided') {
      actions.push({
        category: 'Capacity',
        suggestion: 'Consider providing asset information for better loan terms',
        impact: 'May improve pricing and approval odds for larger amounts'
      });
    }

    return actions.slice(0, 3); // Limit to top 3 actions
  }

  /**
   * STAGE 4: PURPOSE-AWARE GUIDANCE
   */
  private generatePurposeGuidance(plan: EvaluationPlan, trustBand: TrustBand): string {
    const bandNumber = this.trustBandToNumber(trustBand);

    switch (plan.purpose) {
      case 'small_loan':
        if (bandNumber >= 3) {
          return 'Your profile supports small loan requirements. Maintain consistent patterns.';
        } else {
          return 'Focus on building consistent payment behavior for small loan eligibility.';
        }

      case 'medium_loan':
        if (bandNumber >= 4) {
          return 'Strong profile for medium loan amounts. Consider gradual increases.';
        } else if (bandNumber >= 3) {
          return 'Good foundation for medium loans. Strengthen capacity indicators.';
        } else {
          return 'Build stronger behavioral patterns before medium loan applications.';
        }

      case 'large_loan':
        if (bandNumber >= 4) {
          return 'Profile supports large loan consideration with proper documentation.';
        } else {
          return 'Large loans require stronger trust indicators. Consider building history first.';
        }

      case 'credit_upgrade':
        if (bandNumber >= 4) {
          return 'Strong profile for credit upgrades. Maintain current patterns.';
        } else {
          return 'Continue building consistent patterns for future upgrade opportunities.';
        }

      default:
        return 'Continue building financial reliability through consistent behavior.';
    }
  }

  /**
   * STAGE 5: SET EXPECTATIONS (VERY IMPORTANT)
   */
  private setExpectations(trustBand: TrustBand): string {
    const expectations = [
      'Trust profiles evolve with consistent behavior over time.',
      'No immediate action is required - focus on sustainable patterns.',
      'Re-evaluation after 2–3 months may show improvement.',
      'Building trust is a gradual process that rewards consistency.',
      'Your financial journey is unique - progress at your own pace.'
    ];

    // Return a calming expectation based on trust band
    if (this.trustBandToNumber(trustBand) >= 4) {
      return expectations[0]; // Focus on maintenance
    } else if (this.trustBandToNumber(trustBand) >= 3) {
      return expectations[2]; // Focus on improvement timeline
    } else {
      return expectations[3]; // Focus on gradual building
    }
  }

  /**
   * Helper method to convert trust band to number
   */
  private trustBandToNumber(band: TrustBand): number {
    return parseInt(band.substring(1));
  }

  /**
   * Main processing method - AI POWERED GUIDANCE
   */
  public async process(input: ImprovementGuidanceInput): Promise<ImprovementGuidanceOutput> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      
      const prompt = `
You are an expert financial coach and guidance counselor. Your job is to turn a trust decision into actionable, encouraging guidance.

EVALUATION PLAN:
${JSON.stringify(input.evaluation_plan, null, 2)}

INTERPRETED SIGNALS:
${JSON.stringify(input.interpreted_signals, null, 2)}

FINAL DECISION:
${JSON.stringify(input.final_decision, null, 2)}

GUIDANCE FRAMEWORK:
1. EMOTIONAL SAFETY: Never use judgmental language. Frame results positively.
   - T5/T4 → "Strong/Excellent financial reliability"
   - T3 → "Emerging trust with solid foundation"
   - T2 → "Developing patterns with opportunities"
   - T1 → "Early-stage profile with potential"

2. TRANSPARENT EXPLANATION: Explain WHY the decision was made
   - Focus on primary basis (behavior, evidence)
   - Mention key factors that influenced the outcome
   - Acknowledge any protective adjustments made

3. ACTIONABLE IMPROVEMENTS: Generate specific, achievable actions
   - Behavioral: Continue consistent patterns
   - Evidence: Upload additional documentation
   - Capacity: Provide income/employment details
   - Purpose: Consider appropriate loan sizes

4. PURPOSE-AWARE GUIDANCE: Tailor advice to credit purpose
   - Small loan → Focus on consistency
   - Medium loan → Strengthen capacity signals
   - Large loan → Build comprehensive profile
   - Upgrade → Maintain sustained patterns

5. EXPECTATION SETTING: Always end with hope and timeline
   - "Trust profiles evolve with consistent behavior"
   - "Re-evaluation after 2-3 months may show improvement"
   - "No immediate action required"

COACHING PRINCIPLES:
- Never say "failed" or "bad" or "low"
- Focus on building, not fixing
- Provide specific timelines (2-3 months)
- Emphasize gradual progress
- Consider cultural and economic context
- Make advice achievable for the user's situation

OUTPUT FORMAT (JSON):
{
  "summary_message": "Positive framing of the result",
  "key_reasons": ["Primary factor 1", "Primary factor 2", "Primary factor 3"],
  "improvement_actions": [
    {
      "category": "Behavior|Evidence|Capacity|Purpose",
      "suggestion": "Specific actionable advice",
      "impact": "What this will achieve"
    }
  ],
  "re_evaluation_hint": "Encouraging message about future improvement",
  "personalized_insights": ["Insight based on user's specific situation"],
  "timeline_guidance": "When to expect changes"
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      try {
        const cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        const analysis = JSON.parse(cleanResponse);
        
        return {
          summary_message: analysis.summary_message || this.frameResult(input.final_decision.final_trust_band),
          key_reasons: analysis.key_reasons || this.explainDecision(input.interpreted_signals, input.final_decision),
          improvement_actions: analysis.improvement_actions || this.generateImprovementActions(
            input.evaluation_plan, 
            input.interpreted_signals, 
            input.final_decision.final_trust_band
          ),
          re_evaluation_hint: analysis.re_evaluation_hint || this.setExpectations(input.final_decision.final_trust_band)
        };
      } catch (parseError) {
        console.error('AI guidance parse error:', parseError);
        return this.fallbackGuidance(input);
      }
    } catch (error) {
      console.error('AI guidance failed:', error);
      return this.fallbackGuidance(input);
    }
  }

  /**
   * Fallback guidance when AI fails
   */
  private fallbackGuidance(input: ImprovementGuidanceInput): ImprovementGuidanceOutput {
    const { evaluation_plan, interpreted_signals, final_decision } = input;

    // Stage 1: Frame the result
    const summaryMessage = this.frameResult(final_decision.final_trust_band);

    // Stage 2: Explain the decision
    const keyReasons = this.explainDecision(interpreted_signals, final_decision);

    // Stage 3: Generate improvement actions
    const improvementActions = this.generateImprovementActions(
      evaluation_plan, 
      interpreted_signals, 
      final_decision.final_trust_band
    );

    // Stage 4 & 5: Purpose guidance and expectations
    const purposeGuidance = this.generatePurposeGuidance(evaluation_plan, final_decision.final_trust_band);
    const expectations = this.setExpectations(final_decision.final_trust_band);
    
    const reEvaluationHint = `${purposeGuidance} ${expectations}`;

    return {
      summary_message: summaryMessage,
      key_reasons: keyReasons,
      improvement_actions: improvementActions,
      re_evaluation_hint: reEvaluationHint
    };
  }

  /**
   * Handle edge cases
   */
  public handleEdgeCases(input: ImprovementGuidanceInput): ImprovementGuidanceOutput {
    try {
      const result = this.process(input);

      // Special handling for different scenarios
      const { final_decision, interpreted_signals } = input;

      // If Trust Band = T1: Focus on what to build, not what went wrong
      if (final_decision.final_trust_band === 'T1') {
        result.summary_message = 'Early-stage financial profile with strong potential to build';
        result.improvement_actions = result.improvement_actions.map(action => ({
          ...action,
          suggestion: action.suggestion.replace(/improve|fix|strengthen/gi, 'build')
        }));
      }

      // If Trust Band = T5: Focus on maintaining, not upgrading
      if (final_decision.final_trust_band === 'T5') {
        result.improvement_actions = [{
          category: 'Behavior',
          suggestion: 'Continue your excellent financial management practices',
          impact: 'Maintains exceptional trust status'
        }];
      }

      // If confidence is low: Emphasize evidence and clarity
      if (final_decision.final_confidence === 'low') {
        result.improvement_actions.unshift({
          category: 'Evidence',
          suggestion: 'Provide clearer documentation to improve assessment confidence',
          impact: 'Increases confidence in trust evaluation'
        });
      }

      return result;
    } catch (error) {
      // This agent never says "no" - always provides guidance
      return {
        summary_message: 'Financial profile assessment completed with guidance available',
        key_reasons: ['Assessment completed with available information'],
        improvement_actions: [{
          category: 'Behavior',
          suggestion: 'Continue building consistent financial patterns',
          impact: 'Strengthens overall financial profile'
        }],
        re_evaluation_hint: 'Trust profiles improve with consistent behavior over time.'
      };
    }
  }

  public getAgentInfo() {
    return {
      id: this.agentId,
      version: this.version,
      capabilities: [
        'User-friendly result interpretation',
        'Actionable improvement recommendations',
        'Purpose-aware guidance generation',
        'Expectation setting and encouragement'
      ],
      restrictions: [
        'Never changes Trust Band',
        'Never gives guarantees or promises',
        'Never uses shaming language',
        'Never suggests risky financial behavior',
        'Never compares user to others'
      ]
    };
  }
}

export const improvementGuidanceAgent = new ImprovementGuidanceAgent();
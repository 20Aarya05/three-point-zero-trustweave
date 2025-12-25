/**
 * TRUST REASONING AGENT - Built with Agent Development Kit (ADK)
 * A proper intelligent agent that reasons about trust using AI
 */

import { BaseAgent, agentRegistry } from '../agentFramework';
import { EvaluationPlan } from '../purposeRoutingAgent';
import { InterpretedSignals } from '../dataInterpretationAgent';

export interface TrustReasoningInput {
  evaluation_plan: EvaluationPlan;
  interpreted_signals: InterpretedSignals;
  user_context?: any;
}

export interface TrustReasoningOutput {
  trust_band: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
  confidence: 'high' | 'moderate' | 'low';
  reasoning_chain: string[];
  risk_factors: string[];
  trust_drivers: string[];
  agent_confidence: number;
}

export class TrustReasoningAgentADK extends BaseAgent {
  constructor() {
    super(
      'trust-reasoning-agent-v2',
      'Trust Reasoning Specialist',
      'Financial Trust Assessment Expert',
      [
        'Trust band assignment (T1-T5)',
        'Risk pattern recognition',
        'Multi-signal reasoning',
        'Bias-aware decision making',
        'Context-sensitive evaluation',
        'Explainable AI reasoning'
      ]
    );
  }

  public async process(input: TrustReasoningInput): Promise<TrustReasoningOutput> {
    try {
      console.log(`🧠 ${this.name} starting trust reasoning...`);
      
      // Send message to other agents about starting reasoning
      await this.sendMessage('system', 'broadcast', {
        action: 'trust_reasoning_started',
        input_summary: {
          purpose: input.evaluation_plan.purpose,
          behavioral_coherence: input.interpreted_signals.behavioral_coherence,
          evidence_level: input.interpreted_signals.evidence_support_level
        }
      });

      // Use AI reasoning with agent context
      const reasoningPrompt = `
As a Trust Reasoning Specialist, analyze this financial profile and determine the appropriate trust band.

EVALUATION CONTEXT:
${JSON.stringify(input.evaluation_plan, null, 2)}

INTERPRETED SIGNALS:
${JSON.stringify(input.interpreted_signals, null, 2)}

REASONING FRAMEWORK:
You must follow this structured approach:

1. BASELINE ASSESSMENT:
   - Analyze behavioral coherence patterns
   - Evaluate evidence quality and coverage
   - Consider cultural and economic context

2. RISK FACTOR ANALYSIS:
   - Identify potential red flags
   - Assess signal inconsistencies
   - Evaluate missing data impact

3. TRUST DRIVER IDENTIFICATION:
   - Highlight positive indicators
   - Recognize stability patterns
   - Note reliability signals

4. CONTEXTUAL REASONING:
   - Consider loan purpose alignment
   - Factor in first-time borrower status
   - Account for informal economy participation

5. CONFIDENCE CALIBRATION:
   - Assess data quality impact on confidence
   - Consider signal strength and consistency
   - Factor in potential biases

TRUST BAND GUIDELINES:
- T5: Exceptional trust (rare, requires perfect alignment)
- T4: Strong trust (solid patterns, minimal risk)
- T3: Developing trust (good foundation, some gaps)
- T2: Emerging trust (mixed signals, needs building)
- T1: Limited trust (insufficient or concerning patterns)

OUTPUT REQUIREMENTS:
Provide a detailed JSON response with your reasoning chain, identified risk factors, trust drivers, and final assessment.

{
  "trust_band": "T1|T2|T3|T4|T5",
  "confidence": "high|moderate|low",
  "reasoning_chain": [
    "Step 1: Baseline assessment shows...",
    "Step 2: Risk analysis reveals...",
    "Step 3: Trust drivers include...",
    "Step 4: Contextual factors suggest...",
    "Step 5: Final calibration results in..."
  ],
  "risk_factors": ["Specific risk factor 1", "Risk factor 2"],
  "trust_drivers": ["Positive indicator 1", "Strength 2"],
  "agent_confidence": 0.85,
  "reasoning_summary": "Brief explanation of the decision"
}
`;

      const aiResponse = await this.reason(reasoningPrompt, {
        agent_role: 'trust_specialist',
        task_type: 'trust_assessment',
        input_signals: input.interpreted_signals
      });

      // Parse AI response
      let analysis;
      try {
        const cleanResponse = aiResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        analysis = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.warn(`⚠️ ${this.name} AI response parsing failed, using fallback`);
        analysis = await this.fallbackReasoning(input);
      }

      const result: TrustReasoningOutput = {
        trust_band: analysis.trust_band || 'T3',
        confidence: analysis.confidence || 'moderate',
        reasoning_chain: analysis.reasoning_chain || ['Fallback reasoning applied'],
        risk_factors: analysis.risk_factors || [],
        trust_drivers: analysis.trust_drivers || [],
        agent_confidence: analysis.agent_confidence || 0.7
      };

      // Send completion message
      await this.sendMessage('system', 'broadcast', {
        action: 'trust_reasoning_completed',
        result: {
          trust_band: result.trust_band,
          confidence: result.confidence,
          agent_confidence: result.agent_confidence
        }
      });

      console.log(`✅ ${this.name} completed: ${result.trust_band} (${result.confidence} confidence)`);
      return result;

    } catch (error) {
      console.error(`❌ ${this.name} processing failed:`, error);
      
      // Send error message
      await this.sendMessage('system', 'error', {
        action: 'trust_reasoning_failed',
        error: error.message
      });

      // Return safe fallback
      return this.emergencyFallback(input);
    }
  }

  private async fallbackReasoning(input: TrustReasoningInput): Promise<any> {
    // Rule-based fallback when AI fails
    const signals = input.interpreted_signals;
    let trustBand: 'T1' | 'T2' | 'T3' | 'T4' | 'T5' = 'T3';
    let confidence: 'high' | 'moderate' | 'low' = 'moderate';

    // Simple rule-based logic
    if (signals.behavioral_coherence === 'strong' && signals.evidence_support_level === 'strong') {
      trustBand = 'T4';
      confidence = 'high';
    } else if (signals.behavioral_coherence === 'weak' || signals.evidence_support_level === 'partial') {
      trustBand = 'T2';
      confidence = 'low';
    }

    return {
      trust_band: trustBand,
      confidence: confidence,
      reasoning_chain: ['Fallback rule-based assessment applied'],
      risk_factors: ['AI reasoning unavailable'],
      trust_drivers: ['Basic behavioral patterns evaluated'],
      agent_confidence: 0.6,
      reasoning_summary: 'Fallback assessment due to AI processing error'
    };
  }

  private emergencyFallback(input: TrustReasoningInput): TrustReasoningOutput {
    return {
      trust_band: 'T3',
      confidence: 'low',
      reasoning_chain: ['Emergency fallback applied'],
      risk_factors: ['System processing error'],
      trust_drivers: ['Minimal assessment completed'],
      agent_confidence: 0.3
    };
  }
}

// Register the agent
agentRegistry.register(new TrustReasoningAgentADK());
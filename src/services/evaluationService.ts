import {
  EvaluationRequest,
  EvaluationResponse,
  DebugResponse,
  PurposeRoutingOutput,
  DataInterpretationOutput,
  TrustReasoningOutput,
  BiasFairnessOutput,
  ImprovementGuidanceOutput
} from '../types';
import { AgentFactory } from '../agents';
import { DatabaseService } from './database';

export class EvaluationService {
  private databaseService: DatabaseService;

  constructor() {
    this.databaseService = new DatabaseService();
  }

  /**
   * Execute the full agent pipeline
   */
  async evaluateFull(
    request: EvaluationRequest,
    requestId: string
  ): Promise<EvaluationResponse> {
    try {
      // Step 1: Purpose & Routing Agent
      const purposeAgent = AgentFactory.createPurposeRoutingAgent();
      const purposeOutput = await purposeAgent.evaluate(request);

      // Step 2: Data Interpretation Agent
      const dataAgent = AgentFactory.createDataInterpretationAgent();
      const dataOutput = await dataAgent.interpret(request, purposeOutput);

      // Step 3: Trust Reasoning Agent
      const trustAgent = AgentFactory.createTrustReasoningAgent();
      const trustOutput = await trustAgent.reason(request, dataOutput);

      // Step 4: Bias & Fairness Agent
      const biasAgent = AgentFactory.createBiasFairnessAgent();
      const biasOutput = await biasAgent.audit(request, trustOutput);

      // Step 5: Improvement & Guidance Agent
      const guidanceAgent = AgentFactory.createImprovementGuidanceAgent();
      const guidanceOutput = await guidanceAgent.guide(request, trustOutput, biasOutput);

      // Construct final response
      const response: EvaluationResponse = {
        trust_profile: {
          trust_band: trustOutput.trust_band,
          confidence_level: trustOutput.confidence_level,
          trust_stability: trustOutput.trust_stability,
          exposure_readiness_level: trustOutput.exposure_readiness_level
        },
        explanation: {
          summary_message: guidanceOutput.guidance_summary,
          key_reasons: trustOutput.reasoning_factors
        },
        improvement_actions: guidanceOutput.improvement_actions,
        fairness_audit: {
          adjustments_applied: biasOutput.adjustments_applied,
          audit_notes: biasOutput.audit_notes
        },
        metadata: {
          assessment_type: purposeOutput.assessment_type,
          generated_at: new Date().toISOString(),
          version: 'v1'
        }
      };

      // Store evaluation for audit trail (non-blocking)
      this.databaseService.storeEvaluation(request, response, requestId)
        .catch(error => console.error('Failed to store evaluation:', error));

      return response;

    } catch (error) {
      console.error('Evaluation pipeline failed:', error);
      throw new Error(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Execute the full pipeline with debug information
   */
  async evaluateDebug(
    request: EvaluationRequest,
    requestId: string
  ): Promise<DebugResponse> {
    try {
      // Step 1: Purpose & Routing Agent
      const purposeAgent = AgentFactory.createPurposeRoutingAgent();
      const purposeOutput = await purposeAgent.evaluate(request);

      // Step 2: Data Interpretation Agent
      const dataAgent = AgentFactory.createDataInterpretationAgent();
      const dataOutput = await dataAgent.interpret(request, purposeOutput);

      // Step 3: Trust Reasoning Agent
      const trustAgent = AgentFactory.createTrustReasoningAgent();
      const trustOutput = await trustAgent.reason(request, dataOutput);

      // Step 4: Bias & Fairness Agent
      const biasAgent = AgentFactory.createBiasFairnessAgent();
      const biasOutput = await biasAgent.audit(request, trustOutput);

      // Step 5: Improvement & Guidance Agent
      const guidanceAgent = AgentFactory.createImprovementGuidanceAgent();
      const guidanceOutput = await guidanceAgent.guide(request, trustOutput, biasOutput);

      // Construct response with debug info
      const response: DebugResponse = {
        trust_profile: {
          trust_band: trustOutput.trust_band,
          confidence_level: trustOutput.confidence_level,
          trust_stability: trustOutput.trust_stability,
          exposure_readiness_level: trustOutput.exposure_readiness_level
        },
        explanation: {
          summary_message: guidanceOutput.guidance_summary,
          key_reasons: trustOutput.reasoning_factors
        },
        improvement_actions: guidanceOutput.improvement_actions,
        fairness_audit: {
          adjustments_applied: biasOutput.adjustments_applied,
          audit_notes: biasOutput.audit_notes
        },
        metadata: {
          assessment_type: purposeOutput.assessment_type,
          generated_at: new Date().toISOString(),
          version: 'v1'
        },
        debug_info: {
          purpose_routing: purposeOutput,
          data_interpretation: dataOutput,
          trust_reasoning: trustOutput,
          bias_fairness: biasOutput,
          improvement_guidance: guidanceOutput
        }
      };

      return response;

    } catch (error) {
      console.error('Debug evaluation pipeline failed:', error);
      throw new Error(`Debug evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
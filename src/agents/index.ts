// Agent Interfaces - These should match your existing agent implementations
import {
  EvaluationRequest,
  PurposeRoutingOutput,
  DataInterpretationOutput,
  TrustReasoningOutput,
  BiasFairnessOutput,
  ImprovementGuidanceOutput
} from '../types';

// Purpose & Routing Agent
export interface PurposeRoutingAgent {
  evaluate(request: EvaluationRequest): Promise<PurposeRoutingOutput>;
}

// Data Interpretation Agent
export interface DataInterpretationAgent {
  interpret(
    request: EvaluationRequest,
    routingOutput: PurposeRoutingOutput
  ): Promise<DataInterpretationOutput>;
}

// Trust Reasoning Agent
export interface TrustReasoningAgent {
  reason(
    request: EvaluationRequest,
    interpretedData: DataInterpretationOutput
  ): Promise<TrustReasoningOutput>;
}

// Bias & Fairness Agent
export interface BiasFairnessAgent {
  audit(
    request: EvaluationRequest,
    trustOutput: TrustReasoningOutput
  ): Promise<BiasFairnessOutput>;
}

// Improvement & Guidance Agent
export interface ImprovementGuidanceAgent {
  guide(
    request: EvaluationRequest,
    trustOutput: TrustReasoningOutput,
    biasOutput: BiasFairnessOutput
  ): Promise<ImprovementGuidanceOutput>;
}

// Agent Factory - Import your actual agent implementations here
export class AgentFactory {
  static createPurposeRoutingAgent(): PurposeRoutingAgent {
    // TODO: Replace with your actual agent import
    // return new YourPurposeRoutingAgent();
    throw new Error('Purpose routing agent not implemented');
  }

  static createDataInterpretationAgent(): DataInterpretationAgent {
    // TODO: Replace with your actual agent import
    // return new YourDataInterpretationAgent();
    throw new Error('Data interpretation agent not implemented');
  }

  static createTrustReasoningAgent(): TrustReasoningAgent {
    // TODO: Replace with your actual agent import
    // return new YourTrustReasoningAgent();
    throw new Error('Trust reasoning agent not implemented');
  }

  static createBiasFairnessAgent(): BiasFairnessAgent {
    // TODO: Replace with your actual agent import
    // return new YourBiasFairnessAgent();
    throw new Error('Bias fairness agent not implemented');
  }

  static createImprovementGuidanceAgent(): ImprovementGuidanceAgent {
    // TODO: Replace with your actual agent import
    // return new YourImprovementGuidanceAgent();
    throw new Error('Improvement guidance agent not implemented');
  }
}
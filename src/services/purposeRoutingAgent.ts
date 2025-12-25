/**
 * AGENT 1: PURPOSE & ROUTING AGENT
 * The Planning Agent – The Brain Before the Brain
 * 
 * This agent exists to separate policy from intelligence.
 * Its job is NOT to assess trust. Its job is to decide how trust should be assessed.
 */

export interface EvaluationPlan {
  purpose: string;
  loan_range: string;
  required_layers: string[];
  optional_layers: string[];
  risk_tolerance: string;
  strictness: string;
}

export interface PurposeRoutingInput {
  credit_purpose: 'small_loan' | 'medium_loan' | 'large_loan' | 'credit_upgrade';
}

export interface PurposeRoutingOutput {
  evaluation_plan: EvaluationPlan;
}

export class PurposeRoutingAgent {
  private agentId = 'purpose-routing-agent';
  private version = '1.0.0';

  // HARDCODED POLICY - NOT AI DRIVEN
  private readonly POLICY_MAP: Record<string, EvaluationPlan> = {
    'small_loan': {
      purpose: 'small_loan',
      loan_range: '₹5k–₹50k',
      required_layers: ['behavior', 'evidence'],
      optional_layers: ['loan_history'],
      risk_tolerance: 'high',
      strictness: 'relaxed'
    },
    'medium_loan': {
      purpose: 'medium_loan', 
      loan_range: '₹50k–₹3L',
      required_layers: ['behavior', 'evidence', 'capacity'],
      optional_layers: ['loan_history'],
      risk_tolerance: 'medium',
      strictness: 'moderate'
    },
    'large_loan': {
      purpose: 'large_loan',
      loan_range: '> ₹3L',
      required_layers: ['behavior', 'evidence', 'capacity'],
      optional_layers: ['assets', 'loan_history'],
      risk_tolerance: 'low',
      strictness: 'strict'
    },
    'credit_upgrade': {
      purpose: 'credit_upgrade',
      loan_range: 'existing',
      required_layers: ['behavior', 'evidence', 'capacity'],
      optional_layers: ['assets', 'loan_history'],
      risk_tolerance: 'very_low',
      strictness: 'very_strict'
    }
  };

  /**
   * STEP 1: Validate purpose
   */
  private validatePurpose(purpose: string): boolean {
    const allowedValues = ['small_loan', 'medium_loan', 'large_loan', 'credit_upgrade'];
    return allowedValues.includes(purpose);
  }

  /**
   * STEP 2: Load policy (deterministic, no AI)
   */
  private loadPolicy(purpose: string): EvaluationPlan {
    return this.POLICY_MAP[purpose];
  }

  /**
   * STEP 3: Build Evaluation Plan
   */
  private buildEvaluationPlan(purpose: string): EvaluationPlan {
    const policy = this.loadPolicy(purpose);
    
    // Return immutable plan - single source of truth
    return {
      ...policy
    };
  }

  /**
   * Main processing method - DETERMINISTIC ONLY
   */
  public process(input: PurposeRoutingInput): PurposeRoutingOutput {
    // Step 1: Validate purpose
    if (!this.validatePurpose(input.credit_purpose)) {
      throw new Error(`Invalid credit purpose: ${input.credit_purpose}. Must be one of: small_loan, medium_loan, large_loan, credit_upgrade`);
    }

    // Step 2 & 3: Load policy and build plan
    const evaluationPlan = this.buildEvaluationPlan(input.credit_purpose);

    // Step 4: Lock the plan (immutable)
    return {
      evaluation_plan: Object.freeze(evaluationPlan)
    };
  }

  /**
   * Handle edge cases
   */
  public handleEdgeCases(input: PurposeRoutingInput, userProvidedOptionalData: string[]): PurposeRoutingOutput {
    const result = this.process(input);
    
    // Case 1: User chooses small loan but provides capacity/assets
    if (input.credit_purpose === 'small_loan' && 
        (userProvidedOptionalData.includes('capacity') || userProvidedOptionalData.includes('assets'))) {
      // Allow it - mark as optional signals, don't require them
      result.evaluation_plan.optional_layers = [
        ...result.evaluation_plan.optional_layers,
        ...userProvidedOptionalData.filter(layer => 
          !result.evaluation_plan.required_layers.includes(layer)
        )
      ];
    }

    // Case 2: User chooses large loan but skips capacity
    // Agent flags capacity as required - Trust Reasoning Agent handles guardrails later
    // This agent does NOT reject users

    return result;
  }

  public getAgentInfo() {
    return {
      id: this.agentId,
      version: this.version,
      capabilities: [
        'Credit purpose interpretation',
        'Policy-based routing decisions', 
        'Evaluation plan generation',
        'Risk tolerance mapping'
      ],
      restrictions: [
        'Never reads documents',
        'Never inspects behavior',
        'Never infers trust',
        'Never overrides policy',
        'Never calls AI/Gemini'
      ]
    };
  }
}

export const purposeRoutingAgent = new PurposeRoutingAgent();
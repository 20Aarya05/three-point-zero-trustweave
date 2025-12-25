import { TrustAssessmentRequest, PurposeRoutingOutput } from '../types';

export class PurposeRoutingAgent {
  /**
   * Agent 1: Purpose & Routing Agent
   * Analyzes the credit purpose and routes to appropriate assessment path
   */
  async evaluate(request: TrustAssessmentRequest): Promise<PurposeRoutingOutput> {
    console.log('🎯 Purpose & Routing Agent: Analyzing credit purpose...');

    const { purpose, financial, assets } = request;

    // Determine assessment complexity based on purpose
    let assessmentType = 'basic';
    let routingDecision = 'standard-flow';
    const contextFactors: string[] = [];

    // Purpose-based routing logic
    switch (purpose) {
      case 'small':
        assessmentType = 'micro-credit';
        routingDecision = 'simplified-flow';
        contextFactors.push('Low-risk micro-credit assessment');
        contextFactors.push('Focus on behavioral patterns');
        break;

      case 'medium':
        assessmentType = 'standard-credit';
        routingDecision = 'standard-flow';
        contextFactors.push('Standard credit evaluation');
        contextFactors.push('Balanced risk assessment');
        break;

      case 'large':
        assessmentType = 'major-credit';
        routingDecision = 'comprehensive-flow';
        contextFactors.push('High-value credit assessment');
        contextFactors.push('Comprehensive verification required');
        break;

      case 'upgrade':
        assessmentType = 'credit-enhancement';
        routingDecision = 'upgrade-flow';
        contextFactors.push('Existing customer upgrade');
        contextFactors.push('Historical performance analysis');
        break;

      default:
        assessmentType = 'standard-credit';
        routingDecision = 'standard-flow';
    }

    // Additional routing factors
    if (financial.employmentType === 'self_employed') {
      contextFactors.push('Self-employed income verification needed');
      routingDecision = 'enhanced-verification';
    }

    if (assets.property || assets.fixedDeposits) {
      contextFactors.push('Asset-backed assessment available');
    }

    if (financial.incomeStability === 'unstable') {
      contextFactors.push('Income stability concerns identified');
      routingDecision = 'risk-focused-flow';
    }

    const result: PurposeRoutingOutput = {
      assessment_type: assessmentType,
      routing_decision: routingDecision,
      context_factors: contextFactors
    };

    console.log(`✅ Purpose & Routing Agent: Routed to ${assessmentType} (${routingDecision})`);
    return result;
  }

  /**
   * Determine required evidence types based on purpose
   */
  getRequiredEvidenceTypes(purpose: string): string[] {
    const baseEvidence = ['mobile', 'utility'];
    
    switch (purpose) {
      case 'small':
        return [...baseEvidence];
      case 'medium':
        return [...baseEvidence, 'community'];
      case 'large':
      case 'upgrade':
        return [...baseEvidence, 'community', 'financial', 'asset'];
      default:
        return baseEvidence;
    }
  }

  /**
   * Calculate assessment priority score
   */
  calculatePriorityScore(request: TrustAssessmentRequest): number {
    let score = 50; // Base score

    // Purpose-based scoring
    const purposeScores = {
      'small': 10,
      'medium': 20,
      'large': 40,
      'upgrade': 30
    };
    score += purposeScores[request.purpose] || 20;

    // Evidence quality bonus
    if (request.evidence.length >= 6) {
      score += 15;
    }

    // Financial stability bonus
    if (request.financial.incomeStability === 'stable') {
      score += 10;
    }

    return Math.min(score, 100);
  }
}
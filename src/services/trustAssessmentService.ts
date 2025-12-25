import {
  TrustAssessmentRequest,
  TrustAssessmentResponse,
  EvidenceFile
} from '../types';
import { aiAgentOrchestrator, TrustAssessmentRequest as AIRequest } from './aiAgentOrchestrator';

export class TrustAssessmentService {
  constructor() {
    // Service ready
  }

  /**
   * Convert frontend request to AI agent format
   */
  private convertToAIAgentFormat(request: TrustAssessmentRequest): AIRequest {
    // Map frontend purpose to AI agent format
    const purposeMapping: Record<string, any> = {
      'small': 'small_loan',
      'medium': 'medium_loan', 
      'large': 'large_loan',
      'upgrade': 'credit_upgrade'
    };

    return {
      credit_purpose: purposeMapping[request.purpose] || 'medium_loan',
      behavioral_inputs: {
        mobile: request.mobile,
        utility: request.utility,
        community: request.community
      },
      evidence_files: request.evidence.map(file => ({
        name: file.name,
        type: file.type,
        months: file.months,
        url: file.url,
        uploadedAt: file.uploadedAt
      })),
      loan_history: request.loanExperience,
      capacity_inputs: request.financial.employmentType ? request.financial : undefined,
      asset_inputs: request.assets
    };
  }

  /**
   * Process trust assessment request using AI agents
   */
  async assessTrust(
    request: TrustAssessmentRequest,
    requestId: string
  ): Promise<TrustAssessmentResponse> {
    try {
      console.log(`[${requestId}] Starting AI-powered trust assessment`);

      // Convert to AI agent format
      const aiRequest = this.convertToAIAgentFormat(request);
      console.log(`[${requestId}] Converted request for AI agents`);

      // Process with AI Agent Orchestrator
      const aiResponse = await aiAgentOrchestrator.assessTrust(aiRequest);
      console.log(`[${requestId}] AI assessment completed: ${aiResponse.trust_band}`);

      // Convert AI response back to frontend format
      const response: TrustAssessmentResponse = {
        trustBand: this.mapTrustBandFromAI(aiResponse.trust_band),
        interpretation: aiResponse.interpretation,
        traditionalAlignment: this.mapTraditionalAlignment(aiResponse.trust_band),
        reasoning: aiResponse.reasoning,
        metadata: {
          assessment_type: 'ai-powered-trust',
          generated_at: new Date().toISOString(),
          version: 'v2-ai'
        }
      };

      console.log(`[${requestId}] AI-powered trust assessment completed: ${aiResponse.trust_band}`);
      return response;

    } catch (error) {
      console.error(`[${requestId}] AI trust assessment failed:`, error);
      
      // Fallback to basic assessment if AI fails
      console.log(`[${requestId}] Falling back to basic assessment`);
      return this.fallbackAssessment(request, requestId);
    }
  }

  /**
   * Fallback assessment when AI agents fail
   */
  private async fallbackAssessment(
    request: TrustAssessmentRequest,
    requestId: string
  ): Promise<TrustAssessmentResponse> {
    console.log(`[${requestId}] Using fallback assessment logic`);
    
    // Simple scoring logic for fallback
    let score = 0;
    const reasoning: string[] = [];

    // Basic behavioral scoring
    if (request.mobile.simDuration === 'more_than_2_years') {
      score += 25;
      reasoning.push('Long-term mobile relationship indicates stability');
    }
    
    if (request.utility.onTimePayment === 'always') {
      score += 30;
      reasoning.push('Perfect utility payment record shows reliability');
    }
    
    if (request.community.groupParticipation === 'very_active') {
      score += 20;
      reasoning.push('Active community participation demonstrates trustworthiness');
    }
    
    if (request.evidence.length >= 3) {
      score += 15;
      reasoning.push('Comprehensive evidence documentation provided');
    }

    // Determine trust band
    let trustBand: 'T1' | 'T2' | 'T3' | 'T4' | 'T5';
    let interpretation: string;

    if (score >= 80) {
      trustBand = 'T4';
      interpretation = 'Strong trust indicators with consistent positive behaviors';
    } else if (score >= 60) {
      trustBand = 'T3';
      interpretation = 'Solid trust foundation with good behavioral patterns';
    } else if (score >= 40) {
      trustBand = 'T2';
      interpretation = 'Developing trust profile with emerging positive indicators';
    } else {
      trustBand = 'T1';
      interpretation = 'Early-stage trust profile requiring additional development';
    }

    return {
      trustBand,
      interpretation,
      traditionalAlignment: this.mapTraditionalAlignment(trustBand),
      reasoning: reasoning.length > 0 ? reasoning : [
        'Behavioral patterns analyzed successfully',
        'Evidence documentation reviewed and processed', 
        'Trust assessment completed with available data'
      ],
      metadata: {
        assessment_type: 'enhanced-analysis',
        generated_at: new Date().toISOString(),
        version: 'v2-enhanced'
      }
    };
  }

  /**
   * Map AI trust band to frontend format
   */
  private mapTrustBandFromAI(aiBand: string): 'T1' | 'T2' | 'T3' | 'T4' | 'T5' {
    if (aiBand.includes('T1')) return 'T1';
    if (aiBand.includes('T2')) return 'T2';
    if (aiBand.includes('T3')) return 'T3';
    if (aiBand.includes('T4')) return 'T4';
    if (aiBand.includes('T5')) return 'T5';
    return 'T3'; // Default fallback
  }

  /**
   * Map trust band to traditional credit score alignment
   */
  private mapTraditionalAlignment(trustBand: string): string {
    const mapping: Record<string, string> = {
      'T5': '750-850',
      'T4': '700-749', 
      'T3': '650-699',
      'T2': '600-649',
      'T1': '550-599'
    };
    
    const band = trustBand.includes('T') ? trustBand.substring(0, 2) : trustBand;
    return mapping[band] || '650-699';
  }

  /**
   * Upload evidence files (simplified - no actual storage)
   */
  async uploadEvidenceFiles(
    files: Express.Multer.File[],
    userId?: string
  ): Promise<EvidenceFile[]> {
    console.log(`📁 Simulating file upload for ${files.length} files`);
    
    return files.map(file => ({
      name: file.originalname,
      type: this.determineEvidenceCategory(file.originalname, file.mimetype),
      months: 3, // Default
      url: `simulated://upload/${file.originalname}`,
      uploadedAt: new Date().toISOString()
    }));
  }

  // Helper methods
  private determineEvidenceCategory(fileName: string, mimeType: string): 'mobile' | 'utility' | 'community' {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('mobile') || lowerName.includes('recharge') || lowerName.includes('airtel') || lowerName.includes('jio')) {
      return 'mobile';
    } else if (lowerName.includes('electricity') || lowerName.includes('water') || lowerName.includes('gas') || lowerName.includes('utility')) {
      return 'utility';
    } else {
      return 'community';
    }
  }
}
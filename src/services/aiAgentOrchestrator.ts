/**
 * SIMPLIFIED AI AGENT ORCHESTRATOR - WORKING VERSION
 * Direct Gemini integration for immediate results
 */

export interface TrustAssessmentRequest {
  credit_purpose: 'small_loan' | 'medium_loan' | 'large_loan' | 'credit_upgrade';
  behavioral_inputs: {
    mobile: any;
    utility: any;
    community: any;
  };
  evidence_files: any[];
  loan_history?: string;
  capacity_inputs?: any;
  asset_inputs?: any;
}

export interface TrustAssessmentResponse {
  trust_band: string;
  confidence: string;
  interpretation: string;
  reasoning: string[];
  improvement_actions: Array<{
    category: string;
    suggestion: string;
    impact: string;
  }>;
  re_evaluation_hint: string;
  agent_insights: any;
}

export class AIAgentOrchestrator {
  private orchestratorId = 'ai-agent-orchestrator';
  private version = '1.0.0';

  public async assessTrust(request: TrustAssessmentRequest): Promise<TrustAssessmentResponse> {
    console.log('🤖 Starting AI Trust Assessment...');
    
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
You are TrustWeave's expert AI financial analyst. Analyze this user's profile and provide detailed recommendations to improve their trust band.

USER PROFILE:
Credit Purpose: ${request.credit_purpose}
Mobile Behavior: ${JSON.stringify(request.behavioral_inputs.mobile, null, 2)}
Utility Payments: ${JSON.stringify(request.behavioral_inputs.utility, null, 2)}
Community Engagement: ${JSON.stringify(request.behavioral_inputs.community, null, 2)}
Evidence Files: ${request.evidence_files.length} documents provided
Loan History: ${request.loan_history || 'First-time borrower'}
Financial Info: ${JSON.stringify(request.capacity_inputs, null, 2)}
Assets: ${JSON.stringify(request.asset_inputs, null, 2)}

ANALYSIS REQUIREMENTS:
1. Assign a trust band (T3, T4, or T5) - be generous but realistic
2. Provide detailed analysis of their strengths
3. Give specific, actionable recommendations to reach the next trust level
4. Include timeline expectations for improvement
5. Be encouraging and supportive

TRUST BAND GUIDELINES:
- T5 (Exceptional): Perfect patterns across all areas, 6+ months evidence, stable income
- T4 (Strong): Consistent patterns, good evidence, reliable income
- T3 (Developing): Good foundation, some gaps, emerging reliability

OUTPUT JSON FORMAT:
{
  "trust_band": "T4",
  "confidence": "high",
  "interpretation": "You demonstrate strong financial reliability with excellent payment discipline and active community engagement. Your consistent mobile and utility payment patterns over 2+ years show exceptional stability.",
  "reasoning": [
    "Outstanding 2+ year mobile relationship with very regular recharge patterns",
    "Perfect utility payment record with no delays demonstrates financial discipline",
    "Very active community participation shows strong social responsibility",
    "Government employment provides excellent income stability"
  ],
  "improvement_actions": [
    {
      "category": "Evidence Strengthening",
      "suggestion": "Upload 3 additional months of utility bills and mobile statements",
      "impact": "Will boost evidence coverage to 9+ months and potentially elevate you to T5 Exceptional Trust",
      "timeline": "Complete within 2 weeks for immediate impact"
    },
    {
      "category": "Financial Documentation", 
      "suggestion": "Provide salary certificate or employment letter from government office",
      "impact": "Will strengthen income verification and increase confidence score",
      "timeline": "1-2 weeks to obtain and upload"
    },
    {
      "category": "Asset Enhancement",
      "suggestion": "Add fixed deposit certificates or property documents if available",
      "impact": "Could push you to T5 level with additional security backing",
      "timeline": "Optional - add when convenient"
    }
  ],
  "re_evaluation_hint": "Excellent profile! You're very close to T5 Exceptional Trust. With just 2-3 more months of evidence and income documentation, you could achieve the highest trust level. Your consistent behavior patterns are exemplary.",
  "next_level_roadmap": {
    "current_level": "T4 - Strong Trust",
    "next_level": "T5 - Exceptional Trust", 
    "requirements_for_next": [
      "6+ months of comprehensive evidence",
      "Income verification documents",
      "Maintain current excellent payment patterns"
    ],
    "estimated_timeline": "2-3 months with consistent behavior"
  }
}

Be specific, encouraging, and focus on what they're doing RIGHT while giving clear steps to improve.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      
      const cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const aiAnalysis = JSON.parse(cleanResponse);
      
      console.log('✅ AI Analysis Complete!');
      
      return {
        trust_band: this.mapTrustBand(aiAnalysis.trust_band),
        confidence: aiAnalysis.confidence,
        interpretation: aiAnalysis.interpretation,
        reasoning: aiAnalysis.reasoning,
        improvement_actions: aiAnalysis.improvement_actions || [],
        re_evaluation_hint: aiAnalysis.re_evaluation_hint,
        agent_insights: { 
          ai_powered: 'active',
          next_level: aiAnalysis.next_level_roadmap || {}
        }
      };
      
    } catch (error) {
      console.error('AI Assessment Error:', error.message);
      return this.getFallbackResponse(request);
    }
  }

  private mapTrustBand(band: string): string {
    const mapping: Record<string, string> = {
      'T1': 'T1 - Limited Trust',
      'T2': 'T2 - Emerging Trust', 
      'T3': 'T3 - Developing Trust',
      'T4': 'T4 - Strong Trust',
      'T5': 'T5 - Exceptional Trust'
    };
    return mapping[band] || 'T3 - Developing Trust';
  }

  private getFallbackResponse(request: TrustAssessmentRequest): TrustAssessmentResponse {
    // Enhanced fallback with specific recommendations
    let score = 0;
    const reasoning: string[] = [];
    const improvements: any[] = [];

    // Analyze behavioral patterns
    if (request.behavioral_inputs.mobile?.simDuration === 'more_than_2_years') {
      score += 30;
      reasoning.push('Excellent long-term mobile relationship (2+ years) shows stability');
    }
    
    if (request.behavioral_inputs.utility?.onTimePayment === 'always') {
      score += 35;
      reasoning.push('Perfect utility payment record demonstrates financial discipline');
    }
    
    if (request.behavioral_inputs.community?.groupParticipation === 'very_active') {
      score += 25;
      reasoning.push('Very active community engagement indicates trustworthiness');
    }

    // Generate specific improvements
    if (request.evidence_files.length < 6) {
      improvements.push({
        category: 'Evidence Boost',
        suggestion: `Upload ${6 - request.evidence_files.length} more months of payment receipts`,
        impact: 'Could increase your trust band by 1 level with stronger evidence coverage'
      });
    }

    if (!request.capacity_inputs?.employmentType) {
      improvements.push({
        category: 'Income Verification',
        suggestion: 'Provide employment details and salary information',
        impact: 'Will significantly boost confidence and potentially elevate trust band'
      });
    }

    improvements.push({
      category: 'Consistency Maintenance',
      suggestion: 'Continue your excellent payment patterns for next 2-3 months',
      impact: 'Sustained good behavior will strengthen your trust profile over time'
    });

    // Determine trust band
    let trustBand: string;
    let interpretation: string;

    if (score >= 80) {
      trustBand = 'T4 - Strong Trust';
      interpretation = 'Outstanding financial reliability! You demonstrate exceptional consistency across all behavioral areas. You\'re very close to achieving the highest trust level.';
    } else if (score >= 60) {
      trustBand = 'T3 - Developing Trust';
      interpretation = 'Strong financial foundation with excellent behavioral patterns. With a few improvements, you could easily reach T4 Strong Trust level.';
    } else {
      trustBand = 'T3 - Developing Trust';
      interpretation = 'Good financial foundation with positive indicators. Focus on building consistent patterns to reach higher trust levels.';
    }

    return {
      trust_band: trustBand,
      confidence: 'moderate',
      interpretation,
      reasoning,
      improvement_actions: improvements,
      re_evaluation_hint: 'Your profile shows excellent potential! Follow the recommendations above and re-assess in 2-3 months for likely improvement to the next trust level.',
      agent_insights: { 
        fallback_enhanced: 'active',
        upgrade_potential: 'high'
      }
    };
  }

  public async healthCheck() {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    const hasApiKey = geminiApiKey && geminiApiKey !== 'your_actual_gemini_api_key_here';
    
    return {
      status: hasApiKey ? 'healthy' : 'degraded',
      agents: { ai_direct: 'ready' }
    };
  }
}

export const aiAgentOrchestrator = new AIAgentOrchestrator();
import { GoogleGenerativeAI } from '@google/generative-ai';
import { TrustAssessmentRequest, DataInterpretationOutput, PurposeRoutingOutput } from '../types';
import { OCRService } from '../services/ocrService';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export class DataInterpretationAgent {
  private ocrService: OCRService;

  constructor() {
    try {
      this.ocrService = new OCRService();
    } catch (error) {
      // OCR service not available - using fallback
      this.ocrService = null as any;
    }
  }

  /**
   * Agent 2: Data Interpretation Agent
   * Processes and validates all input data, including OCR from uploaded files
   */
  async interpret(
    request: TrustAssessmentRequest,
    routingOutput: PurposeRoutingOutput
  ): Promise<DataInterpretationOutput> {
    console.log('📊 Data Interpretation Agent: Processing input data...');

    // Process uploaded evidence files with OCR
    const processedEvidence = await this.processEvidenceFiles(request.evidence);

    // Interpret behavioral data using AI
    const behavioralInsights = await this.interpretBehavioralData(request);

    // Validate data quality
    const dataQuality = this.assessDataQuality(request, processedEvidence);

    // Extract key financial indicators using AI
    const financialIndicators = await this.extractFinancialIndicators(request, processedEvidence);

    // Identify missing data
    const missingDataFlags = this.identifyMissingData(request, routingOutput);

    const interpretedData = {
      behavioral_insights: behavioralInsights,
      evidence_analysis: processedEvidence,
      financial_indicators: financialIndicators,
      data_completeness: dataQuality.completeness,
      verification_status: dataQuality.verification,
      extracted_entities: this.extractEntities(processedEvidence)
    };

    const result: DataInterpretationOutput = {
      interpreted_data: interpretedData,
      data_quality_score: dataQuality.score,
      missing_data_flags: missingDataFlags
    };

    console.log(`✅ Data Interpretation Agent: Processed data with quality score ${dataQuality.score}`);
    return result;
  }

  /**
   * Process evidence files using OCR
   */
  private async processEvidenceFiles(evidence: any[]): Promise<any[]> {
    const processedEvidence = [];

    for (const file of evidence) {
      try {
        let extractedText = '';
        let ocrConfidence = 0;

        // If OCR service is available and file has URL, process it
        if (this.ocrService && file.url) {
          try {
            // Extract file path from URL for OCR processing
            const filePath = this.extractFilePathFromUrl(file.url);
            const ocrResult = await this.ocrService.extractTextFromFile(
              filePath,
              file.name,
              file.type || 'application/octet-stream'
            );
            extractedText = ocrResult.extractedText;
            ocrConfidence = ocrResult.confidence;
          } catch (ocrError) {
            // OCR processing failed - continue without OCR
          }
        }

        // Analyze extracted content using AI
        const contentAnalysis = await this.analyzeFileContent(extractedText, file.name);

        processedEvidence.push({
          ...file,
          extracted_text: extractedText,
          ocr_confidence: ocrConfidence,
          content_analysis: contentAnalysis,
          verification_score: this.calculateVerificationScore(contentAnalysis, ocrConfidence)
        });

      } catch (error) {
        console.error(`Failed to process evidence file ${file.name}:`, error);
        processedEvidence.push({
          ...file,
          extracted_text: '',
          ocr_confidence: 0,
          content_analysis: { type: 'unknown', confidence: 0 },
          verification_score: 0
        });
      }
    }

    return processedEvidence;
  }

  /**
   * Interpret behavioral data patterns using AI
   */
  private async interpretBehavioralData(request: TrustAssessmentRequest): Promise<any> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
You are a behavioral pattern analyst for financial trust assessment. Analyze these behavioral signals:

MOBILE DATA:
- SIM Duration: ${request.mobile.simDuration}
- Recharge Regularity: ${request.mobile.rechargeRegularity}
- Usage Consistency: ${request.mobile.usageConsistency}

UTILITY DATA:
- On-time Payment: ${request.utility.onTimePayment}
- Delay Frequency: ${request.utility.delayFrequency}
- Bill Predictability: ${request.utility.billPredictability}

COMMUNITY DATA:
- Group Participation: ${request.community.groupParticipation}
- Shared Responsibility: ${request.community.sharedResponsibility}
- Dispute History: ${request.community.disputeHistory}

TASK: Analyze these patterns for coherence and reliability. Consider:
1. Cross-domain consistency (do patterns align across mobile, utility, community?)
2. Stability indicators (long-term vs short-term patterns)
3. Reliability signals (consistency in commitments)
4. Cultural and economic context

OUTPUT FORMAT (JSON):
{
  "mobile_stability": {
    "duration_score": 0-100,
    "regularity_score": 0-100,
    "consistency_score": 0-100,
    "overall_mobile_score": 0-100,
    "insights": ["insight1", "insight2"]
  },
  "utility_discipline": {
    "punctuality_score": 0-100,
    "frequency_score": 0-100,
    "predictability_score": 0-100,
    "overall_utility_score": 0-100,
    "insights": ["insight1", "insight2"]
  },
  "community_reliability": {
    "participation_score": 0-100,
    "responsibility_score": 0-100,
    "dispute_score": 0-100,
    "overall_community_score": 0-100,
    "insights": ["insight1", "insight2"]
  },
  "cross_domain_coherence": "strong|moderate|weak",
  "behavioral_summary": "Brief summary of overall behavioral patterns"
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      try {
        const cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        return JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('AI behavioral analysis parse error:', parseError);
        return this.fallbackBehavioralAnalysis(request);
      }
    } catch (error) {
      console.error('AI behavioral analysis failed:', error);
      return this.fallbackBehavioralAnalysis(request);
    }
  }

  /**
   * Fallback behavioral analysis when AI fails
   */
  private fallbackBehavioralAnalysis(request: TrustAssessmentRequest): any {
    const { mobile, utility, community } = request;

    return {
      mobile_stability: {
        duration_score: this.scoreMobileDuration(mobile.simDuration),
        regularity_score: this.scoreRechargeRegularity(mobile.rechargeRegularity),
        consistency_score: this.scoreUsageConsistency(mobile.usageConsistency),
        overall_mobile_score: this.calculateMobileScore(mobile),
        insights: ['Fallback analysis - basic scoring applied']
      },
      utility_discipline: {
        punctuality_score: this.scorePaymentPunctuality(utility.onTimePayment),
        frequency_score: this.scoreDelayFrequency(utility.delayFrequency),
        predictability_score: this.scoreBillPredictability(utility.billPredictability),
        overall_utility_score: this.calculateUtilityScore(utility),
        insights: ['Fallback analysis - basic scoring applied']
      },
      community_reliability: {
        participation_score: this.scoreGroupParticipation(community.groupParticipation),
        responsibility_score: this.scoreSharedResponsibility(community.sharedResponsibility),
        dispute_score: this.scoreDisputeHistory(community.disputeHistory),
        overall_community_score: this.calculateCommunityScore(community),
        insights: ['Fallback analysis - basic scoring applied']
      },
      cross_domain_coherence: 'moderate',
      behavioral_summary: 'Basic behavioral pattern analysis completed'
    };
  }

  /**
   * Assess overall data quality
   */
  private assessDataQuality(request: TrustAssessmentRequest, processedEvidence: any[]): any {
    let completenessScore = 0;
    let verificationScore = 0;

    // Check behavioral data completeness
    const behavioralFields = [
      request.mobile.simDuration,
      request.mobile.rechargeRegularity,
      request.mobile.usageConsistency,
      request.utility.onTimePayment,
      request.utility.delayFrequency,
      request.utility.billPredictability,
      request.community.groupParticipation,
      request.community.sharedResponsibility,
      request.community.disputeHistory
    ];

    completenessScore = (behavioralFields.filter(field => field && field.trim()).length / behavioralFields.length) * 100;

    // Check evidence verification
    if (processedEvidence.length > 0) {
      const avgVerificationScore = processedEvidence.reduce((sum, evidence) =>
        sum + (evidence.verification_score || 0), 0) / processedEvidence.length;
      verificationScore = avgVerificationScore;
    }

    const overallScore = (completenessScore * 0.6) + (verificationScore * 0.4);

    return {
      score: Math.round(overallScore),
      completeness: completenessScore,
      verification: verificationScore
    };
  }

  /**
   * Extract financial indicators from data and OCR using AI
   */
  private async extractFinancialIndicators(request: TrustAssessmentRequest, processedEvidence: any[]): Promise<any> {
    const indicators = {
      income_indicators: [] as any[],
      expense_patterns: [] as any[],
      payment_behavior: [] as any[],
      asset_indicators: [] as any[]
    };

    // Extract from OCR text and AI analysis
    for (const evidence of processedEvidence) {
      if (evidence.extracted_text && evidence.content_analysis) {
        const amounts = evidence.content_analysis.financial_indicators?.amounts || [];
        const dates = evidence.content_analysis.financial_indicators?.payment_dates || [];

        if (evidence.content_analysis.type === 'utility_bill') {
          indicators.expense_patterns.push({
            type: 'utility_payment',
            amounts: amounts,
            dates: dates,
            regularity: this.analyzePaymentRegularity(dates),
            reliability_score: evidence.content_analysis.reliability_score || 0
          });
        } else if (evidence.content_analysis.type === 'mobile_bill') {
          indicators.expense_patterns.push({
            type: 'mobile_recharge',
            amounts: amounts,
            dates: dates,
            frequency: this.analyzeRechargeFrequency(dates),
            reliability_score: evidence.content_analysis.reliability_score || 0
          });
        }
      }
    }

    return indicators;
  }

  /**
   * Identify missing data based on routing requirements
   */
  private identifyMissingData(request: TrustAssessmentRequest, routingOutput: PurposeRoutingOutput): string[] {
    const missingFlags = [];

    // Check required evidence based on assessment type
    const requiredCategories = ['mobile', 'utility', 'community'];
    const providedCategories = [...new Set(request.evidence.map(e => e.type))];

    requiredCategories.forEach(category => {
      if (!providedCategories.includes(category)) {
        missingFlags.push(`Missing ${category} evidence`);
      }
    });

    // Check financial data completeness for higher-value assessments
    if (routingOutput.assessment_type === 'major-credit' || routingOutput.assessment_type === 'credit-enhancement') {
      if (!request.financial.employmentType) {
        missingFlags.push('Employment type not specified');
      }
      if (!request.financial.incomeRange) {
        missingFlags.push('Income range not provided');
      }
    }

    return missingFlags;
  }

  // Helper methods for scoring
  private scoreMobileDuration(duration: string): number {
    const scores = {
      'more_than_2_years': 100,
      '1_to_2_years': 80,
      '6_months_to_1_year': 60,
      'less_than_6_months': 30
    };
    return scores[duration as keyof typeof scores] || 50;
  }

  private scoreRechargeRegularity(regularity: string): number {
    const scores = {
      'very_regular': 100,
      'mostly_regular': 80,
      'irregular': 40
    };
    return scores[regularity as keyof typeof scores] || 50;
  }

  private scoreUsageConsistency(consistency: string): number {
    const scores = {
      'very_stable': 100,
      'stable': 80,
      'fluctuating': 50
    };
    return scores[consistency as keyof typeof scores] || 50;
  }

  private calculateMobileScore(mobile: any): number {
    return Math.round((
      this.scoreMobileDuration(mobile.simDuration) +
      this.scoreRechargeRegularity(mobile.rechargeRegularity) +
      this.scoreUsageConsistency(mobile.usageConsistency)
    ) / 3);
  }

  private scorePaymentPunctuality(punctuality: string): number {
    const scores = {
      'always': 100,
      'mostly': 80,
      'sometimes': 50,
      'often_late': 20
    };
    return scores[punctuality as keyof typeof scores] || 50;
  }

  private scoreDelayFrequency(frequency: string): number {
    const scores = {
      'never': 100,
      'rarely': 80,
      'occasionally': 60,
      'frequently': 20
    };
    return scores[frequency as keyof typeof scores] || 50;
  }

  private scoreBillPredictability(predictability: string): number {
    const scores = {
      'very_consistent': 100,
      'consistent': 80,
      'variable': 60,
      'highly_variable': 40
    };
    return scores[predictability as keyof typeof scores] || 50;
  }

  private calculateUtilityScore(utility: any): number {
    return Math.round((
      this.scorePaymentPunctuality(utility.onTimePayment) +
      this.scoreDelayFrequency(utility.delayFrequency) +
      this.scoreBillPredictability(utility.billPredictability)
    ) / 3);
  }

  private scoreGroupParticipation(participation: string): number {
    const scores = {
      'very_active': 100,
      'active': 80,
      'passive': 50,
      'none': 10
    };
    return scores[participation as keyof typeof scores] || 50;
  }

  private scoreSharedResponsibility(responsibility: string): number {
    const scores = {
      'high': 100,
      'medium': 70,
      'low': 40,
      'none': 10
    };
    return scores[responsibility as keyof typeof scores] || 50;
  }

  private scoreDisputeHistory(history: string): number {
    const scores = {
      'clear': 100,
      'minor': 80,
      'some': 50,
      'major': 20
    };
    return scores[history as keyof typeof scores] || 50;
  }

  private calculateCommunityScore(community: any): number {
    return Math.round((
      this.scoreGroupParticipation(community.groupParticipation) +
      this.scoreSharedResponsibility(community.sharedResponsibility) +
      this.scoreDisputeHistory(community.disputeHistory)
    ) / 3);
  }

  // OCR and content analysis helpers
  private extractFilePathFromUrl(url: string): string {
    // Extract file path from Supabase storage URL
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === 'Files');
    if (bucketIndex !== -1) {
      return urlParts.slice(bucketIndex + 1).join('/');
    }
    return '';
  }

  /**
   * Analyze extracted content using AI
   */
  private async analyzeFileContent(text: string, fileName: string): Promise<any> {
    if (!text) {
      return { type: 'unknown', confidence: 0, insights: [] };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
You are a document analysis expert for financial trust assessment. Analyze this extracted text from a document.

DOCUMENT NAME: ${fileName}
EXTRACTED TEXT:
${text.substring(0, 2000)} // Limit text length

TASK: Analyze this document and determine:
1. Document type (utility_bill, mobile_bill, bank_statement, community_document, etc.)
2. Key financial information present
3. Payment patterns or behaviors indicated
4. Reliability indicators
5. Any red flags or concerns

OUTPUT FORMAT (JSON):
{
  "type": "document_type",
  "confidence": 0.0-1.0,
  "insights": ["insight1", "insight2", "insight3"],
  "financial_indicators": {
    "amounts": [100, 200, 300],
    "payment_dates": ["2024-01-01", "2024-02-01"],
    "account_info": "account details if present"
  },
  "reliability_score": 0-100,
  "concerns": ["concern1 if any"]
}
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      try {
        const cleanResponse = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        return JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('AI content analysis parse error:', parseError);
        return this.fallbackContentAnalysis(text);
      }
    } catch (error) {
      console.error('AI content analysis failed:', error);
      return this.fallbackContentAnalysis(text);
    }
  }

  /**
   * Fallback content analysis when AI fails
   */
  private fallbackContentAnalysis(text: string): any {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('utility') || lowerText.includes('electricity') || lowerText.includes('water')) {
      return {
        type: 'utility_bill',
        confidence: 0.8,
        insights: ['Utility bill detected'],
        financial_indicators: { amounts: [], payment_dates: [], account_info: '' },
        reliability_score: 70,
        concerns: []
      };
    } else if (lowerText.includes('mobile') || lowerText.includes('recharge') || lowerText.includes('airtel')) {
      return {
        type: 'mobile_bill',
        confidence: 0.8,
        insights: ['Mobile bill detected'],
        financial_indicators: { amounts: [], payment_dates: [], account_info: '' },
        reliability_score: 70,
        concerns: []
      };
    } else if (lowerText.includes('community') || lowerText.includes('group') || lowerText.includes('savings')) {
      return {
        type: 'community_document',
        confidence: 0.7,
        insights: ['Community document detected'],
        financial_indicators: { amounts: [], payment_dates: [], account_info: '' },
        reliability_score: 60,
        concerns: []
      };
    }

    return {
      type: 'general_document',
      confidence: 0.5,
      insights: ['General document'],
      financial_indicators: { amounts: [], payment_dates: [], account_info: '' },
      reliability_score: 50,
      concerns: []
    };
  }

  private calculateVerificationScore(contentAnalysis: any, ocrConfidence: number): number {
    const aiConfidence = (contentAnalysis.confidence || 0) * 100;
    const reliabilityScore = contentAnalysis.reliability_score || 50;
    const ocrScore = ocrConfidence * 100;

    return Math.round((aiConfidence * 0.4 + reliabilityScore * 0.4 + ocrScore * 0.2));
  }

  private extractAmountsFromText(text: string): number[] {
    const amounts = [];
    const amountRegex = /[₹$]\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/g;
    let match;

    while ((match = amountRegex.exec(text)) !== null) {
      amounts.push(parseFloat(match[1].replace(/,/g, '')));
    }

    return amounts;
  }

  private extractDatesFromText(text: string): string[] {
    const dates = [];
    const dateRegex = /\d{1,2}[-/]\d{1,2}[-/]\d{2,4}/g;
    let match;

    while ((match = dateRegex.exec(text)) !== null) {
      dates.push(match[0]);
    }

    return dates;
  }

  private analyzePaymentRegularity(dates: string[]): string {
    if (dates.length < 2) return 'insufficient_data';
    // Simple analysis - could be more sophisticated
    return dates.length >= 3 ? 'regular' : 'irregular';
  }

  private analyzeRechargeFrequency(dates: string[]): string {
    if (dates.length === 0) return 'no_data';
    if (dates.length >= 4) return 'frequent';
    if (dates.length >= 2) return 'moderate';
    return 'infrequent';
  }

  private extractEntities(processedEvidence: any[]): any {
    const entities = {
      amounts: [] as number[],
      dates: [] as string[],
      account_numbers: [] as string[],
      phone_numbers: [] as string[]
    };

    processedEvidence.forEach(evidence => {
      if (evidence.content_analysis?.financial_indicators) {
        const indicators = evidence.content_analysis.financial_indicators;
        if (indicators.amounts) {
          entities.amounts.push(...indicators.amounts);
        }
        if (indicators.payment_dates) {
          entities.dates.push(...indicators.payment_dates);
        }
      }
    });

    return entities;
  }
}
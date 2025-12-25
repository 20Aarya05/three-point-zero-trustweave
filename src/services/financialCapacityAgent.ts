import { TrustAssessmentState } from '../types/trustTypes';

/**
 * Financial Capacity Agent
 * Evaluates financial capacity, employment stability, and income patterns
 */
export class FinancialCapacityAgent {
  private agentId = 'financial-capacity-agent';
  private version = '1.0.0';

  /**
   * Analyze employment type and stability
   */
  public analyzeEmployment(employmentType: string): {
    score: number;
    stabilityRating: string;
    insights: string[];
    riskFactors: string[];
  } {
    const insights: string[] = [];
    const riskFactors: string[] = [];
    let score = 0;
    let stabilityRating = '';

    switch (employmentType) {
      case 'government':
        score = 90;
        stabilityRating = 'Very High';
        insights.push('Government employment provides excellent job security');
        insights.push('Predictable income stream with regular increments');
        break;
      case 'private-permanent':
        score = 75;
        stabilityRating = 'High';
        insights.push('Permanent private employment shows good stability');
        insights.push('Regular income with growth potential');
        break;
      case 'private-contract':
        score = 60;
        stabilityRating = 'Moderate';
        insights.push('Contract employment provides moderate stability');
        riskFactors.push('Contract renewal dependency');
        break;
      case 'self-employed':
        score = 50;
        stabilityRating = 'Variable';
        insights.push('Self-employment shows entrepreneurial capability');
        riskFactors.push('Income variability and business risks');
        break;
      case 'freelance':
        score = 40;
        stabilityRating = 'Low';
        insights.push('Freelance work demonstrates skill flexibility');
        riskFactors.push('Irregular income and project dependency');
        break;
      default:
        score = 30;
        stabilityRating = 'Unknown';
        riskFactors.push('Employment status unclear');
    }

    return { score, stabilityRating, insights, riskFactors };
  }

  /**
   * Analyze income range and capacity
   */
  public analyzeIncomeRange(incomeRange: string): {
    score: number;
    capacityLevel: string;
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    let score = 0;
    let capacityLevel = '';

    switch (incomeRange) {
      case 'above-50k':
        score = 90;
        capacityLevel = 'High';
        insights.push('High income provides strong repayment capacity');
        insights.push('Suitable for larger credit amounts');
        break;
      case '30k-50k':
        score = 75;
        capacityLevel = 'Good';
        insights.push('Good income level supports moderate credit needs');
        recommendations.push('Consider debt-to-income ratio for larger amounts');
        break;
      case '20k-30k':
        score = 60;
        capacityLevel = 'Moderate';
        insights.push('Moderate income suitable for smaller credit amounts');
        recommendations.push('Focus on building emergency fund alongside credit');
        break;
      case '10k-20k':
        score = 45;
        capacityLevel = 'Limited';
        insights.push('Limited income requires careful credit planning');
        recommendations.push('Start with small credit amounts to build history');
        break;
      case 'below-10k':
        score = 30;
        capacityLevel = 'Very Limited';
        insights.push('Very limited income may restrict credit options');
        recommendations.push('Focus on income enhancement before major credit');
        break;
      default:
        score = 20;
        capacityLevel = 'Unknown';
        recommendations.push('Income verification required');
    }

    return { score, capacityLevel, insights, recommendations };
  }

  /**
   * Analyze income stability patterns
   */
  public analyzeIncomeStability(incomeStability: string): {
    score: number;
    stabilityLevel: string;
    insights: string[];
    riskFactors: string[];
  } {
    const insights: string[] = [];
    const riskFactors: string[] = [];
    let score = 0;
    let stabilityLevel = '';

    switch (incomeStability) {
      case 'very-stable':
        score = 85;
        stabilityLevel = 'Excellent';
        insights.push('Very stable income reduces repayment risk');
        insights.push('Predictable cash flow supports credit planning');
        break;
      case 'mostly-stable':
        score = 70;
        stabilityLevel = 'Good';
        insights.push('Generally stable income with minor fluctuations');
        insights.push('Good foundation for credit relationships');
        break;
      case 'somewhat-variable':
        score = 50;
        stabilityLevel = 'Moderate';
        insights.push('Some income variability requires careful monitoring');
        riskFactors.push('Seasonal or cyclical income patterns');
        break;
      case 'highly-variable':
        score = 30;
        stabilityLevel = 'Poor';
        riskFactors.push('High income variability increases repayment risk');
        riskFactors.push('May require additional security or guarantees');
        break;
      default:
        score = 20;
        stabilityLevel = 'Unknown';
        riskFactors.push('Income stability pattern unclear');
    }

    return { score, stabilityLevel, insights, riskFactors };
  }

  /**
   * Calculate debt-to-income capacity
   */
  public calculateDebtCapacity(incomeRange: string, existingObligations: number = 0): {
    maxRecommendedCredit: number;
    safeUtilization: number;
    recommendations: string[];
  } {
    const incomeEstimates: Record<string, number> = {
      'above-50k': 60000,
      '30k-50k': 40000,
      '20k-30k': 25000,
      '10k-20k': 15000,
      'below-10k': 8000
    };

    const estimatedIncome = incomeEstimates[incomeRange] || 15000;
    const maxDebtRatio = 0.4; // 40% debt-to-income ratio
    const maxRecommendedCredit = Math.round((estimatedIncome * maxDebtRatio) - existingObligations);
    const safeUtilization = Math.round(maxRecommendedCredit * 0.3); // 30% utilization

    const recommendations: string[] = [];
    
    if (maxRecommendedCredit > 20000) {
      recommendations.push('High capacity supports various credit products');
    } else if (maxRecommendedCredit > 10000) {
      recommendations.push('Moderate capacity suitable for personal loans');
    } else {
      recommendations.push('Limited capacity - consider secured credit options');
    }

    return { maxRecommendedCredit, safeUtilization, recommendations };
  }

  /**
   * Generate comprehensive financial capacity analysis
   */
  public generateCapacityAnalysis(state: TrustAssessmentState): {
    overallScore: number;
    employmentAnalysis: any;
    incomeAnalysis: any;
    stabilityAnalysis: any;
    capacityAnalysis: any;
    summary: string;
    recommendations: string[];
  } {
    const financial = state.financial || {};
    
    const employmentAnalysis = this.analyzeEmployment(financial.employmentType || '');
    const incomeAnalysis = this.analyzeIncomeRange(financial.incomeRange || '');
    const stabilityAnalysis = this.analyzeIncomeStability(financial.incomeStability || '');
    const capacityAnalysis = this.calculateDebtCapacity(financial.incomeRange || '');

    const overallScore = Math.round(
      (employmentAnalysis.score * 0.3 + incomeAnalysis.score * 0.4 + stabilityAnalysis.score * 0.3)
    );

    const recommendations: string[] = [
      ...employmentAnalysis.insights,
      ...incomeAnalysis.recommendations,
      ...stabilityAnalysis.insights,
      ...capacityAnalysis.recommendations
    ];

    const summary = `Financial capacity analysis indicates ${
      overallScore >= 80 ? 'strong' : 
      overallScore >= 60 ? 'good' : 
      overallScore >= 40 ? 'moderate' : 'limited'
    } repayment capacity based on employment stability, income level, and consistency patterns.`;

    return {
      overallScore,
      employmentAnalysis,
      incomeAnalysis,
      stabilityAnalysis,
      capacityAnalysis,
      summary,
      recommendations: recommendations.slice(0, 5) // Limit to top 5 recommendations
    };
  }

  public getAgentInfo() {
    return {
      id: this.agentId,
      version: this.version,
      capabilities: [
        'Employment stability assessment',
        'Income capacity evaluation',
        'Debt-to-income ratio calculation',
        'Financial risk scoring'
      ]
    };
  }
}

export const financialCapacityAgent = new FinancialCapacityAgent();
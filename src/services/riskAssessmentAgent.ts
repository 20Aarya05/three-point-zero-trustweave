import { TrustAssessmentState } from '../types/trustTypes';

/**
 * Risk Assessment Agent
 * Evaluates overall risk profile and provides risk-based recommendations
 */
export class RiskAssessmentAgent {
  private agentId = 'risk-assessment-agent';
  private version = '1.0.0';

  /**
   * Assess loan experience risk
   */
  public assessLoanExperienceRisk(loanExperience: string): {
    riskLevel: string;
    score: number;
    insights: string[];
    riskFactors: string[];
  } {
    const insights: string[] = [];
    const riskFactors: string[] = [];
    let score = 0;
    let riskLevel = '';

    switch (loanExperience) {
      case 'excellent-history':
        score = 90;
        riskLevel = 'Very Low';
        insights.push('Excellent loan history indicates strong credit discipline');
        insights.push('Proven track record of timely repayments');
        break;
      case 'good-history':
        score = 75;
        riskLevel = 'Low';
        insights.push('Good loan history with minor issues');
        insights.push('Generally reliable repayment behavior');
        break;
      case 'mixed-history':
        score = 50;
        riskLevel = 'Moderate';
        insights.push('Mixed loan history requires careful evaluation');
        riskFactors.push('Some past payment delays or defaults');
        break;
      case 'poor-history':
        score = 25;
        riskLevel = 'High';
        riskFactors.push('Poor loan history indicates high repayment risk');
        riskFactors.push('Multiple defaults or significant delays');
        break;
      case 'no-history':
        score = 60;
        riskLevel = 'Moderate';
        insights.push('No loan history - new to credit market');
        riskFactors.push('Lack of credit history makes assessment challenging');
        break;
      default:
        score = 40;
        riskLevel = 'Unknown';
        riskFactors.push('Loan experience unclear');
    }

    return { riskLevel, score, insights, riskFactors };
  }

  /**
   * Assess purpose-based risk
   */
  public assessPurposeRisk(purpose: string): {
    riskLevel: string;
    score: number;
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    let score = 0;
    let riskLevel = '';

    switch (purpose) {
      case 'emergency':
        score = 85;
        riskLevel = 'Low';
        insights.push('Emergency purpose indicates immediate need');
        insights.push('Typically smaller amounts with urgent repayment motivation');
        recommendations.push('Fast approval process recommended');
        break;
      case 'small':
        score = 80;
        riskLevel = 'Low';
        insights.push('Small credit needs are lower risk');
        insights.push('Manageable amounts reduce default probability');
        recommendations.push('Good entry point for building credit history');
        break;
      case 'business':
        score = 60;
        riskLevel = 'Moderate';
        insights.push('Business purpose has income generation potential');
        riskFactors.push('Business risks and market volatility');
        recommendations.push('Require business plan and cash flow projections');
        break;
      case 'large':
        score = 45;
        riskLevel = 'High';
        insights.push('Large credit amounts require thorough assessment');
        riskFactors.push('Higher exposure increases lender risk');
        recommendations.push('Comprehensive documentation and collateral required');
        break;
      case 'upgrade':
        score = 70;
        riskLevel = 'Moderate';
        insights.push('Upgrade purpose shows growth mindset');
        insights.push('Existing relationship provides performance history');
        recommendations.push('Review past performance before approval');
        break;
      default:
        score = 50;
        riskLevel = 'Unknown';
        recommendations.push('Purpose clarification required');
    }

    return { riskLevel, score, insights, recommendations };
  }

  /**
   * Assess asset-based risk mitigation
   */
  public assessAssetRisk(assets: any): {
    riskMitigation: number;
    collateralValue: string;
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];
    let riskMitigation = 0;
    let collateralValue = 'None';

    if (assets?.property) {
      riskMitigation += 40;
      collateralValue = 'High';
      insights.push('Property ownership provides strong collateral');
      insights.push('Real estate assets reduce lender risk significantly');
    }

    if (assets?.fixedDeposits) {
      riskMitigation += 25;
      if (collateralValue === 'None') collateralValue = 'Moderate';
      insights.push('Fixed deposits provide liquid security');
      insights.push('Demonstrates savings discipline');
    }

    if (assets?.collateralWillingness) {
      riskMitigation += 15;
      if (collateralValue === 'None') collateralValue = 'Low';
      insights.push('Willingness to provide collateral shows commitment');
      recommendations.push('Evaluate proposed collateral value');
    }

    if (riskMitigation === 0) {
      collateralValue = 'None';
      recommendations.push('Consider secured credit options');
      recommendations.push('Build asset base for better credit terms');
    }

    return { riskMitigation, collateralValue, insights, recommendations };
  }

  /**
   * Calculate composite risk score
   */
  public calculateCompositeRisk(
    behaviorScore: number,
    financialScore: number,
    loanExperienceScore: number,
    purposeScore: number,
    assetMitigation: number
  ): {
    overallRiskScore: number;
    riskCategory: string;
    riskLevel: string;
    recommendations: string[];
  } {
    // Weighted risk calculation
    const baseRisk = (
      behaviorScore * 0.25 +
      financialScore * 0.30 +
      loanExperienceScore * 0.25 +
      purposeScore * 0.20
    );

    // Apply asset mitigation
    const overallRiskScore = Math.min(100, baseRisk + (assetMitigation * 0.3));

    let riskCategory = '';
    let riskLevel = '';
    const recommendations: string[] = [];

    if (overallRiskScore >= 80) {
      riskCategory = 'Low Risk';
      riskLevel = 'Preferred';
      recommendations.push('Eligible for premium rates and higher limits');
      recommendations.push('Fast-track approval recommended');
    } else if (overallRiskScore >= 65) {
      riskCategory = 'Moderate Risk';
      riskLevel = 'Standard';
      recommendations.push('Standard approval process with documentation');
      recommendations.push('Regular monitoring recommended');
    } else if (overallRiskScore >= 45) {
      riskCategory = 'High Risk';
      riskLevel = 'Cautious';
      recommendations.push('Enhanced due diligence required');
      recommendations.push('Consider secured credit or guarantor');
      recommendations.push('Lower initial limits with gradual increases');
    } else {
      riskCategory = 'Very High Risk';
      riskLevel = 'Restricted';
      recommendations.push('Decline or require significant risk mitigation');
      recommendations.push('Alternative credit building products recommended');
    }

    return { overallRiskScore, riskCategory, riskLevel, recommendations };
  }

  /**
   * Generate comprehensive risk assessment
   */
  public generateRiskAssessment(
    state: TrustAssessmentState,
    behaviorScore: number,
    financialScore: number
  ): {
    loanExperienceRisk: any;
    purposeRisk: any;
    assetRisk: any;
    compositeRisk: any;
    summary: string;
    criticalRiskFactors: string[];
    mitigationStrategies: string[];
  } {
    const loanExperienceRisk = this.assessLoanExperienceRisk(state.loanExperience || '');
    const purposeRisk = this.assessPurposeRisk(state.purpose || '');
    const assetRisk = this.assessAssetRisk(state.assets);
    
    const compositeRisk = this.calculateCompositeRisk(
      behaviorScore,
      financialScore,
      loanExperienceRisk.score,
      purposeRisk.score,
      assetRisk.riskMitigation
    );

    const criticalRiskFactors: string[] = [
      ...loanExperienceRisk.riskFactors,
      ...purposeRisk.riskFactors || []
    ].slice(0, 3);

    const mitigationStrategies: string[] = [
      ...assetRisk.recommendations,
      ...compositeRisk.recommendations
    ].slice(0, 4);

    const summary = `Risk assessment indicates ${compositeRisk.riskCategory.toLowerCase()} profile with ${compositeRisk.riskLevel.toLowerCase()} approval recommendation. Overall risk score: ${Math.round(compositeRisk.overallRiskScore)}/100.`;

    return {
      loanExperienceRisk,
      purposeRisk,
      assetRisk,
      compositeRisk,
      summary,
      criticalRiskFactors,
      mitigationStrategies
    };
  }

  public getAgentInfo() {
    return {
      id: this.agentId,
      version: this.version,
      capabilities: [
        'Loan experience risk assessment',
        'Purpose-based risk evaluation',
        'Asset collateral analysis',
        'Composite risk scoring'
      ]
    };
  }
}

export const riskAssessmentAgent = new RiskAssessmentAgent();
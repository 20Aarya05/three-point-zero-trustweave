import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { TrustAssessmentRequest, TrustAssessmentResponse } from '../types';

export interface AssessmentSession {
  id: string;
  session_id: string;
  user_identifier?: string;
  started_at: string;
  completed_at?: string;
  current_step: number;
  total_steps: number;
  status: 'in_progress' | 'completed' | 'abandoned' | 'expired';
  user_agent?: string;
  ip_address?: string;
  device_type?: string;
  browser?: string;
}

export class AssessmentSessionService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration for assessment sessions');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new assessment session
   */
  async createSession(
    userIdentifier?: string,
    deviceInfo?: {
      userAgent?: string;
      ipAddress?: string;
      deviceType?: string;
      browser?: string;
    }
  ): Promise<AssessmentSession> {
    try {
      const sessionId = `session-${uuidv4()}`;
      
      const sessionData = {
        session_id: sessionId,
        user_identifier: userIdentifier,
        current_step: 0,
        total_steps: 8,
        status: 'in_progress' as const,
        user_agent: deviceInfo?.userAgent,
        ip_address: deviceInfo?.ipAddress,
        device_type: deviceInfo?.deviceType,
        browser: deviceInfo?.browser
      };

      const { data, error } = await this.supabase
        .from('assessment_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }

      console.log(`✅ Created assessment session: ${sessionId}`);
      return data;

    } catch (error) {
      console.error('Error creating assessment session:', error);
      throw error;
    }
  }

  /**
   * Update session step and status
   */
  async updateSession(
    sessionId: string,
    updates: {
      current_step?: number;
      status?: 'in_progress' | 'completed' | 'abandoned' | 'expired';
      completed_at?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('assessment_sessions')
        .update(updates)
        .eq('session_id', sessionId);

      if (error) {
        throw new Error(`Failed to update session: ${error.message}`);
      }

      console.log(`✅ Updated session ${sessionId}`);

    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * Get session by session ID
   */
  async getSession(sessionId: string): Promise<AssessmentSession | null> {
    try {
      const { data, error } = await this.supabase
        .from('assessment_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Session not found
        }
        throw new Error(`Failed to get session: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Store credit purpose data
   */
  async storeCreditPurpose(
    sessionId: string,
    purpose: string,
    purposeDescription?: string,
    loanAmountRange?: string,
    intendedUse?: string
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const { error } = await this.supabase
        .from('credit_purposes')
        .insert({
          session_id: session.id,
          purpose,
          purpose_description: purposeDescription,
          loan_amount_range: loanAmountRange,
          intended_use: intendedUse,
          assessment_path: this.determineAssessmentPath(purpose),
          complexity_level: this.determineComplexityLevel(purpose)
        });

      if (error) {
        throw new Error(`Failed to store credit purpose: ${error.message}`);
      }

      console.log(`✅ Stored credit purpose for session ${sessionId}`);

    } catch (error) {
      console.error('Error storing credit purpose:', error);
      throw error;
    }
  }

  /**
   * Store mobile stability data
   */
  async storeMobileStability(
    sessionId: string,
    mobileData: {
      sim_duration: string;
      recharge_regularity: string;
      usage_consistency: string;
      primary_operator?: string;
      monthly_spend_range?: string;
    }
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const stabilityScore = this.calculateMobileStabilityScore(mobileData);

      const { error } = await this.supabase
        .from('mobile_stability')
        .insert({
          session_id: session.id,
          ...mobileData,
          stability_score: stabilityScore.stability,
          consistency_score: stabilityScore.consistency,
          reliability_score: stabilityScore.reliability
        });

      if (error) {
        throw new Error(`Failed to store mobile stability: ${error.message}`);
      }

      console.log(`✅ Stored mobile stability for session ${sessionId}`);

    } catch (error) {
      console.error('Error storing mobile stability:', error);
      throw error;
    }
  }

  /**
   * Store utility discipline data
   */
  async storeUtilityDiscipline(
    sessionId: string,
    utilityData: {
      on_time_payment: string;
      delay_frequency: string;
      bill_predictability: string;
      utility_types?: string[];
      average_monthly_amount?: number;
    }
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const disciplineScore = this.calculateUtilityDisciplineScore(utilityData);

      const { error } = await this.supabase
        .from('utility_discipline')
        .insert({
          session_id: session.id,
          ...utilityData,
          punctuality_score: disciplineScore.punctuality,
          consistency_score: disciplineScore.consistency,
          discipline_score: disciplineScore.discipline
        });

      if (error) {
        throw new Error(`Failed to store utility discipline: ${error.message}`);
      }

      console.log(`✅ Stored utility discipline for session ${sessionId}`);

    } catch (error) {
      console.error('Error storing utility discipline:', error);
      throw error;
    }
  }

  /**
   * Store community reliability data
   */
  async storeCommunityReliability(
    sessionId: string,
    communityData: {
      group_participation: string;
      shared_responsibility: string;
      dispute_history: string;
      community_types?: string[];
      years_of_participation?: number;
    }
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const reliabilityScore = this.calculateCommunityReliabilityScore(communityData);

      const { error } = await this.supabase
        .from('community_reliability')
        .insert({
          session_id: session.id,
          ...communityData,
          participation_score: reliabilityScore.participation,
          responsibility_score: reliabilityScore.responsibility,
          trustworthiness_score: reliabilityScore.trustworthiness
        });

      if (error) {
        throw new Error(`Failed to store community reliability: ${error.message}`);
      }

      console.log(`✅ Stored community reliability for session ${sessionId}`);

    } catch (error) {
      console.error('Error storing community reliability:', error);
      throw error;
    }
  }

  /**
   * Store evidence file metadata
   */
  async storeEvidenceFile(
    sessionId: string,
    fileData: {
      file_id: string;
      original_name: string;
      file_name: string;
      file_type: string;
      file_size: number;
      evidence_category: 'mobile' | 'utility' | 'community';
      evidence_type?: string;
      months_coverage?: number;
      storage_path: string;
      storage_url?: string;
      signed_url?: string;
      url_expires_at?: string;
    }
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const { error } = await this.supabase
        .from('evidence_files')
        .insert({
          session_id: session.id,
          ...fileData,
          upload_status: 'uploaded',
          verification_status: 'pending'
        });

      if (error) {
        throw new Error(`Failed to store evidence file: ${error.message}`);
      }

      console.log(`✅ Stored evidence file for session ${sessionId}`);

    } catch (error) {
      console.error('Error storing evidence file:', error);
      throw error;
    }
  }

  /**
   * Store complete assessment data from frontend
   */
  async storeCompleteAssessment(
    sessionId: string,
    assessmentData: TrustAssessmentRequest
  ): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Store all components
      await Promise.all([
        this.storeCreditPurpose(sessionId, assessmentData.purpose),
        this.storeMobileStability(sessionId, assessmentData.mobile),
        this.storeUtilityDiscipline(sessionId, assessmentData.utility),
        this.storeCommunityReliability(sessionId, assessmentData.community),
        this.storeLoanExperience(sessionId, assessmentData.loanExperience),
        this.storeFinancialCapacity(sessionId, assessmentData.financial),
        this.storeAssetSupport(sessionId, assessmentData.assets)
      ]);

      console.log(`✅ Stored complete assessment for session ${sessionId}`);

    } catch (error) {
      console.error('Error storing complete assessment:', error);
      throw error;
    }
  }

  /**
   * Store loan experience
   */
  private async storeLoanExperience(sessionId: string, loanExperience: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const { error } = await this.supabase
      .from('loan_experience')
      .insert({
        session_id: session.id,
        experience_level: this.categorizeLoanExperience(loanExperience),
        experience_description: loanExperience
      });

    if (error) {
      throw new Error(`Failed to store loan experience: ${error.message}`);
    }
  }

  /**
   * Store financial capacity
   */
  private async storeFinancialCapacity(sessionId: string, financial: any): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const { error } = await this.supabase
      .from('financial_capacity')
      .insert({
        session_id: session.id,
        employment_type: financial.employmentType,
        income_range: financial.incomeRange,
        income_stability: financial.incomeStability
      });

    if (error) {
      throw new Error(`Failed to store financial capacity: ${error.message}`);
    }
  }

  /**
   * Store asset support
   */
  private async storeAssetSupport(sessionId: string, assets: any): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;

    const { error } = await this.supabase
      .from('asset_support')
      .insert({
        session_id: session.id,
        property: assets.property,
        fixed_deposits: assets.fixedDeposits,
        collateral_willingness: assets.collateralWillingness
      });

    if (error) {
      throw new Error(`Failed to store asset support: ${error.message}`);
    }
  }

  // Helper methods for scoring and categorization
  private determineAssessmentPath(purpose: string): string {
    const pathMap: Record<string, string> = {
      'small': 'simplified',
      'medium': 'standard',
      'large': 'comprehensive',
      'upgrade': 'enhanced'
    };
    return pathMap[purpose] || 'standard';
  }

  private determineComplexityLevel(purpose: string): string {
    const complexityMap: Record<string, string> = {
      'small': 'low',
      'medium': 'medium',
      'large': 'high',
      'upgrade': 'medium'
    };
    return complexityMap[purpose] || 'medium';
  }

  private calculateMobileStabilityScore(data: any): { stability: number; consistency: number; reliability: number } {
    let stability = 0;
    let consistency = 0;
    let reliability = 0;

    // SIM Duration scoring
    const durationScores: Record<string, number> = {
      'more_than_2_years': 25,
      '1_to_2_years': 20,
      '6_months_to_1_year': 15,
      'less_than_6_months': 5
    };
    stability += durationScores[data.sim_duration] || 0;

    // Recharge regularity scoring
    const regularityScores: Record<string, number> = {
      'very_regular': 25,
      'mostly_regular': 20,
      'irregular': 5
    };
    consistency += regularityScores[data.recharge_regularity] || 0;

    // Usage consistency scoring
    const usageScores: Record<string, number> = {
      'very_stable': 25,
      'stable': 20,
      'fluctuating': 10
    };
    reliability += usageScores[data.usage_consistency] || 0;

    return { stability, consistency, reliability };
  }

  private calculateUtilityDisciplineScore(data: any): { punctuality: number; consistency: number; discipline: number } {
    let punctuality = 0;
    let consistency = 0;
    let discipline = 0;

    // On-time payment scoring
    const paymentScores: Record<string, number> = {
      'always': 30,
      'mostly': 25,
      'sometimes': 15,
      'often_late': 5
    };
    punctuality += paymentScores[data.on_time_payment] || 0;

    // Delay frequency scoring
    const delayScores: Record<string, number> = {
      'never': 25,
      'rarely': 20,
      'occasionally': 15,
      'frequently': 5
    };
    consistency += delayScores[data.delay_frequency] || 0;

    // Bill predictability scoring
    const predictabilityScores: Record<string, number> = {
      'very_consistent': 25,
      'consistent': 20,
      'variable': 15,
      'highly_variable': 5
    };
    discipline += predictabilityScores[data.bill_predictability] || 0;

    return { punctuality, consistency, discipline };
  }

  private calculateCommunityReliabilityScore(data: any): { participation: number; responsibility: number; trustworthiness: number } {
    let participation = 0;
    let responsibility = 0;
    let trustworthiness = 0;

    // Group participation scoring
    const participationScores: Record<string, number> = {
      'very_active': 25,
      'active': 20,
      'passive': 10,
      'none': 0
    };
    participation += participationScores[data.group_participation] || 0;

    // Shared responsibility scoring
    const responsibilityScores: Record<string, number> = {
      'high': 25,
      'medium': 20,
      'low': 10,
      'none': 0
    };
    responsibility += responsibilityScores[data.shared_responsibility] || 0;

    // Dispute history scoring
    const disputeScores: Record<string, number> = {
      'clear': 25,
      'minor': 20,
      'some': 10,
      'major': 0
    };
    trustworthiness += disputeScores[data.dispute_history] || 0;

    return { participation, responsibility, trustworthiness };
  }

  private categorizeLoanExperience(experience: string): string {
    const lowerExp = experience.toLowerCase();
    if (lowerExp.includes('no') || lowerExp.includes('first time')) {
      return 'no_experience';
    } else if (lowerExp.includes('multiple') || lowerExp.includes('several')) {
      return 'extensive_experience';
    } else {
      return 'some_experience';
    }
  }
}
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EvaluationRequest, EvaluationResponse } from '../types';

export class DatabaseService {
  private supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Running without database - create mock client
      this.supabase = null as any;
      return;
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Store evaluation request and response for audit trail
   */
  async storeEvaluation(
    request: EvaluationRequest,
    response: EvaluationResponse,
    requestId: string
  ): Promise<void> {
    if (!this.supabase) {
      console.log(`[${requestId}] Skipping database storage - no Supabase connection`);
      return;
    }

    try {
      const { error } = await this.supabase
        .from('evaluations')
        .insert({
          request_id: requestId,
          request_data: request,
          response_data: response,
          trust_band: response.trust_profile.trust_band,
          assessment_type: response.metadata.assessment_type,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to store evaluation:', error);
        // Don't throw - this shouldn't break the main flow
      }
    } catch (error) {
      console.error('Database storage error:', error);
      // Don't throw - this shouldn't break the main flow
    }
  }

  /**
   * Get evaluation history for analytics
   */
  async getEvaluationHistory(limit: number = 100): Promise<any[]> {
    if (!this.supabase) {
      console.log('No Supabase connection - returning empty history');
      return [];
    }

    try {
      const { data, error } = await this.supabase
        .from('evaluations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch evaluation history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch evaluation history:', error);
      return [];
    }
  }

  /**
   * Get trust band distribution for analytics
   */
  async getTrustBandDistribution(): Promise<Record<string, number>> {
    if (!this.supabase) {
      console.log('No Supabase connection - returning empty distribution');
      return {};
    }

    try {
      const { data, error } = await this.supabase
        .from('evaluations')
        .select('trust_band')
        .not('trust_band', 'is', null);

      if (error) {
        throw new Error(`Failed to fetch trust band distribution: ${error.message}`);
      }

      const distribution: Record<string, number> = {};
      data?.forEach(item => {
        const band = item.trust_band;
        distribution[band] = (distribution[band] || 0) + 1;
      });

      return distribution;
    } catch (error) {
      console.error('Failed to fetch trust band distribution:', error);
      return {};
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.supabase) {
      return false;
    }

    try {
      const { error } = await this.supabase
        .from('evaluations')
        .select('count')
        .limit(1);

      return !error;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}
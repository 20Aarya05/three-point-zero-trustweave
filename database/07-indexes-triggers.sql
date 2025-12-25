-- =====================================================
-- TrustWeave Indexes and Triggers - Part 7
-- =====================================================

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Core session indexes
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_created_at ON assessment_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_session_id ON assessment_sessions(session_id);

-- Trust assessment indexes
CREATE INDEX IF NOT EXISTS idx_trust_assessments_session_id ON trust_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_trust_assessments_trust_band ON trust_assessments(trust_band);
CREATE INDEX IF NOT EXISTS idx_trust_assessments_created_at ON trust_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_trust_assessments_request_id ON trust_assessments(request_id);

-- Evidence file indexes
CREATE INDEX IF NOT EXISTS idx_evidence_files_session_id ON evidence_files(session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_files_category ON evidence_files(evidence_category);
CREATE INDEX IF NOT EXISTS idx_evidence_files_status ON evidence_files(upload_status);
CREATE INDEX IF NOT EXISTS idx_evidence_files_verification ON evidence_files(verification_status);
CREATE INDEX IF NOT EXISTS idx_evidence_files_created_at ON evidence_files(created_at);

-- Component data indexes
CREATE INDEX IF NOT EXISTS idx_mobile_stability_session_id ON mobile_stability(session_id);
CREATE INDEX IF NOT EXISTS idx_utility_discipline_session_id ON utility_discipline(session_id);
CREATE INDEX IF NOT EXISTS idx_community_reliability_session_id ON community_reliability(session_id);
CREATE INDEX IF NOT EXISTS idx_loan_experience_session_id ON loan_experience(session_id);
CREATE INDEX IF NOT EXISTS idx_financial_capacity_session_id ON financial_capacity(session_id);
CREATE INDEX IF NOT EXISTS idx_asset_support_session_id ON asset_support(session_id);
CREATE INDEX IF NOT EXISTS idx_credit_purposes_session_id ON credit_purposes(session_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_assessment_stats(date);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session_id ON user_behavior_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_assessment_id ON agent_processing_logs(assessment_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_session_id ON improvement_recommendations(session_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_assessments_band_date ON trust_assessments(trust_band, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status_date ON assessment_sessions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_evidence_category_status ON evidence_files(evidence_category, upload_status);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_sessions_updated_at 
    BEFORE UPDATE ON assessment_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_evidence_files_updated_at 
    BEFORE UPDATE ON evidence_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_assessments_updated_at 
    BEFORE UPDATE ON trust_assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update daily stats when sessions are created or completed
    INSERT INTO daily_assessment_stats (
        date, 
        total_assessments, 
        completed_assessments,
        abandoned_assessments
    )
    VALUES (
        CURRENT_DATE, 
        1, 
        CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        CASE WHEN NEW.status = 'abandoned' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date) DO UPDATE SET
        total_assessments = daily_assessment_stats.total_assessments + 1,
        completed_assessments = daily_assessment_stats.completed_assessments + 
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END,
        abandoned_assessments = daily_assessment_stats.abandoned_assessments + 
            CASE WHEN NEW.status = 'abandoned' THEN 1 ELSE 0 END;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update daily stats
CREATE TRIGGER update_daily_stats_trigger 
    AFTER INSERT OR UPDATE ON assessment_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_daily_stats();

-- Function to update trust band distribution in daily stats
CREATE OR REPLACE FUNCTION update_trust_band_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update trust band counts in daily stats
    UPDATE daily_assessment_stats 
    SET 
        t1_count = t1_count + CASE WHEN NEW.trust_band = 'T1' THEN 1 ELSE 0 END,
        t2_count = t2_count + CASE WHEN NEW.trust_band = 'T2' THEN 1 ELSE 0 END,
        t3_count = t3_count + CASE WHEN NEW.trust_band = 'T3' THEN 1 ELSE 0 END,
        t4_count = t4_count + CASE WHEN NEW.trust_band = 'T4' THEN 1 ELSE 0 END,
        t5_count = t5_count + CASE WHEN NEW.trust_band = 'T5' THEN 1 ELSE 0 END
    WHERE date = CURRENT_DATE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update trust band distribution
CREATE TRIGGER update_trust_band_stats_trigger 
    AFTER INSERT ON trust_assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_trust_band_stats();

-- Function to update file upload stats
CREATE OR REPLACE FUNCTION update_file_upload_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update file upload counts in daily stats
    UPDATE daily_assessment_stats 
    SET 
        total_files_uploaded = total_files_uploaded + 1,
        mobile_files = mobile_files + CASE WHEN NEW.evidence_category = 'mobile' THEN 1 ELSE 0 END,
        utility_files = utility_files + CASE WHEN NEW.evidence_category = 'utility' THEN 1 ELSE 0 END,
        community_files = community_files + CASE WHEN NEW.evidence_category = 'community' THEN 1 ELSE 0 END
    WHERE date = CURRENT_DATE;
    
    -- Create daily stats record if it doesn't exist
    INSERT INTO daily_assessment_stats (
        date, 
        total_files_uploaded,
        mobile_files,
        utility_files,
        community_files
    )
    VALUES (
        CURRENT_DATE,
        1,
        CASE WHEN NEW.evidence_category = 'mobile' THEN 1 ELSE 0 END,
        CASE WHEN NEW.evidence_category = 'utility' THEN 1 ELSE 0 END,
        CASE WHEN NEW.evidence_category = 'community' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date) DO NOTHING;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update file upload stats
CREATE TRIGGER update_file_upload_stats_trigger 
    AFTER INSERT ON evidence_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_file_upload_stats();
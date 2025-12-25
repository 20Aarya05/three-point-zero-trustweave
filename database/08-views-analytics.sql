-- =====================================================
-- TrustWeave Views and Analytics - Part 8
-- =====================================================

-- =====================================================
-- ANALYTICAL VIEWS
-- =====================================================

-- Complete assessment view (joins all related data)
CREATE OR REPLACE VIEW complete_assessments AS
SELECT 
    s.id as session_id,
    s.session_id as session_identifier,
    s.user_identifier,
    s.status as session_status,
    s.started_at,
    s.completed_at,
    s.current_step,
    
    -- Purpose
    cp.purpose,
    cp.purpose_description,
    cp.loan_amount_range,
    
    -- Core trust data
    ms.sim_duration,
    ms.recharge_regularity,
    ms.usage_consistency,
    ms.stability_score,
    
    ud.on_time_payment,
    ud.delay_frequency,
    ud.bill_predictability,
    ud.punctuality_score,
    
    cr.group_participation,
    cr.shared_responsibility,
    cr.dispute_history,
    cr.participation_score,
    
    -- Evidence summary
    COUNT(ef.id) as total_evidence_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'mobile') as mobile_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'utility') as utility_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'community') as community_files,
    COUNT(ef.id) FILTER (WHERE ef.verification_status = 'verified') as verified_files,
    
    -- Loan experience
    le.experience_level,
    le.previous_loans_count,
    le.defaults_count,
    
    -- Financial capacity
    fc.employment_type,
    fc.income_range,
    fc.income_stability,
    fc.debt_to_income_ratio,
    
    -- Assets
    ast.property,
    ast.fixed_deposits,
    ast.collateral_willingness,
    ast.total_asset_value,
    
    -- Assessment results
    ta.trust_band,
    ta.trust_score,
    ta.confidence_level,
    ta.interpretation,
    ta.traditional_alignment,
    ta.risk_level,
    ta.processing_time_ms,
    
    s.created_at
FROM assessment_sessions s
LEFT JOIN credit_purposes cp ON s.id = cp.session_id
LEFT JOIN mobile_stability ms ON s.id = ms.session_id
LEFT JOIN utility_discipline ud ON s.id = ud.session_id
LEFT JOIN community_reliability cr ON s.id = cr.session_id
LEFT JOIN evidence_files ef ON s.id = ef.session_id
LEFT JOIN loan_experience le ON s.id = le.session_id
LEFT JOIN financial_capacity fc ON s.id = fc.session_id
LEFT JOIN asset_support ast ON s.id = ast.session_id
LEFT JOIN trust_assessments ta ON s.id = ta.session_id
GROUP BY s.id, cp.id, ms.id, ud.id, cr.id, le.id, fc.id, ast.id, ta.id;

-- Trust band analytics view
CREATE OR REPLACE VIEW trust_band_analytics AS
SELECT 
    trust_band,
    COUNT(*) as total_count,
    AVG(trust_score) as avg_trust_score,
    MIN(trust_score) as min_trust_score,
    MAX(trust_score) as max_trust_score,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage,
    AVG(processing_time_ms) as avg_processing_time,
    DATE_TRUNC('month', created_at) as month
FROM trust_assessments
GROUP BY trust_band, DATE_TRUNC('month', created_at)
ORDER BY month DESC, trust_band;

-- Evidence upload analytics
CREATE OR REPLACE VIEW evidence_analytics AS
SELECT 
    evidence_category,
    COUNT(*) as total_files,
    AVG(file_size) as avg_file_size,
    SUM(file_size) as total_file_size,
    COUNT(*) FILTER (WHERE verification_status = 'verified') as verified_files,
    COUNT(*) FILTER (WHERE upload_status = 'failed') as failed_uploads,
    COUNT(*) FILTER (WHERE upload_status = 'uploaded') as successful_uploads,
    AVG(months_coverage) as avg_months_coverage,
    DATE_TRUNC('day', created_at) as upload_date
FROM evidence_files
GROUP BY evidence_category, DATE_TRUNC('day', created_at)
ORDER BY upload_date DESC, evidence_category;

-- User journey analytics
CREATE OR REPLACE VIEW user_journey_analytics AS
SELECT 
    current_step,
    status,
    COUNT(*) as user_count,
    AVG(EXTRACT(EPOCH FROM (COALESCE(completed_at, NOW()) - started_at))/60) as avg_duration_minutes,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) as completed_count,
    COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_count
FROM assessment_sessions
GROUP BY current_step, status
ORDER BY current_step, status;

-- Assessment performance view
CREATE OR REPLACE VIEW assessment_performance AS
SELECT 
    DATE_TRUNC('day', ta.created_at) as assessment_date,
    COUNT(*) as total_assessments,
    AVG(ta.processing_time_ms) as avg_processing_time,
    AVG(ta.trust_score) as avg_trust_score,
    COUNT(*) FILTER (WHERE ta.trust_band = 'T1') as t1_count,
    COUNT(*) FILTER (WHERE ta.trust_band = 'T2') as t2_count,
    COUNT(*) FILTER (WHERE ta.trust_band = 'T3') as t3_count,
    COUNT(*) FILTER (WHERE ta.trust_band = 'T4') as t4_count,
    COUNT(*) FILTER (WHERE ta.trust_band = 'T5') as t5_count,
    AVG(apm.data_completeness_score) as avg_data_completeness,
    AVG(apm.evidence_quality_score) as avg_evidence_quality
FROM trust_assessments ta
LEFT JOIN assessment_performance_metrics apm ON ta.id = apm.assessment_id
GROUP BY DATE_TRUNC('day', ta.created_at)
ORDER BY assessment_date DESC;

-- Financial profile analytics
CREATE OR REPLACE VIEW financial_profile_analytics AS
SELECT 
    fc.employment_type,
    fc.income_range,
    fc.income_stability,
    COUNT(*) as profile_count,
    AVG(ta.trust_score) as avg_trust_score,
    MODE() WITHIN GROUP (ORDER BY ta.trust_band) as most_common_trust_band,
    AVG(fc.debt_to_income_ratio) as avg_debt_to_income,
    COUNT(*) FILTER (WHERE ast.property = true) as property_owners,
    COUNT(*) FILTER (WHERE ast.fixed_deposits = true) as fd_holders
FROM financial_capacity fc
LEFT JOIN trust_assessments ta ON fc.session_id = ta.session_id
LEFT JOIN asset_support ast ON fc.session_id = ast.session_id
GROUP BY fc.employment_type, fc.income_range, fc.income_stability
ORDER BY profile_count DESC;

-- Evidence quality metrics
CREATE OR REPLACE VIEW evidence_quality_metrics AS
SELECT 
    ef.evidence_category,
    ef.evidence_type,
    COUNT(*) as file_count,
    AVG(ef.confidence_score) as avg_confidence,
    COUNT(*) FILTER (WHERE ef.verification_status = 'verified') as verified_count,
    COUNT(*) FILTER (WHERE ef.verification_status = 'rejected') as rejected_count,
    AVG(ef.months_coverage) as avg_coverage,
    COUNT(*) FILTER (WHERE array_length(ef.anomaly_flags, 1) > 0) as files_with_anomalies
FROM evidence_files ef
GROUP BY ef.evidence_category, ef.evidence_type
ORDER BY file_count DESC;

-- Agent performance analytics
CREATE OR REPLACE VIEW agent_performance_analytics AS
SELECT 
    apl.agent_name,
    apl.agent_version,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE apl.status = 'success') as successful_executions,
    COUNT(*) FILTER (WHERE apl.status = 'error') as failed_executions,
    AVG(apl.processing_time_ms) as avg_processing_time,
    MAX(apl.processing_time_ms) as max_processing_time,
    MIN(apl.processing_time_ms) as min_processing_time,
    COUNT(*) FILTER (WHERE apl.status = 'success') * 100.0 / COUNT(*) as success_rate
FROM agent_processing_logs apl
GROUP BY apl.agent_name, apl.agent_version
ORDER BY total_executions DESC;

-- Monthly trends view
CREATE OR REPLACE VIEW monthly_trends AS
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_assessments,
    COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned_assessments,
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))/60) FILTER (WHERE completed_at IS NOT NULL) as avg_completion_time_minutes,
    COUNT(DISTINCT user_identifier) as unique_users
FROM assessment_sessions
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
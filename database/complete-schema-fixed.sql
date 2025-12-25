-- =====================================================
-- TrustWeave Complete Database Schema for Supabase
-- Matches the frontend website structure exactly
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    full_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Assessment sessions (tracks complete user journeys)
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_identifier VARCHAR(255), -- For anonymous users (phone, email, etc.)
    
    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 8,
    
    -- Device and location info
    user_agent TEXT,
    ip_address INET,
    device_type VARCHAR(50),
    browser VARCHAR(100),
    
    -- Session status
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'expired')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit purposes (Step 1: Purpose Selection)
CREATE TABLE IF NOT EXISTS credit_purposes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Purpose selection
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('small', 'medium', 'large', 'upgrade')),
    purpose_description TEXT,
    loan_amount_range VARCHAR(50),
    intended_use TEXT,
    
    -- Routing decisions
    assessment_path VARCHAR(50), -- Which steps to include/skip
    complexity_level VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mobile stability data (Step 2: Core Trust - Mobile)
CREATE TABLE IF NOT EXISTS mobile_stability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Mobile behavior patterns
    sim_duration VARCHAR(50) NOT NULL,
    recharge_regularity VARCHAR(50) NOT NULL,
    usage_consistency VARCHAR(50) NOT NULL,
    
    -- Additional mobile insights
    primary_operator VARCHAR(100),
    monthly_spend_range VARCHAR(50),
    data_usage_pattern VARCHAR(50),
    
    -- Calculated scores
    stability_score INTEGER,
    consistency_score INTEGER,
    reliability_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utility payment discipline (Step 2: Core Trust - Utility)
CREATE TABLE IF NOT EXISTS utility_discipline (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Utility payment patterns
    on_time_payment VARCHAR(50) NOT NULL,
    delay_frequency VARCHAR(50) NOT NULL,
    bill_predictability VARCHAR(50) NOT NULL,
    
    -- Utility types and details
    utility_types TEXT[], -- ['electricity', 'water', 'gas', 'internet']
    average_monthly_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    
    -- Calculated scores
    punctuality_score INTEGER,
    consistency_score INTEGER,
    discipline_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community reliability (Step 2: Core Trust - Community)
CREATE TABLE IF NOT EXISTS community_reliability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Community involvement patterns
    group_participation VARCHAR(50) NOT NULL,
    shared_responsibility VARCHAR(50) NOT NULL,
    dispute_history VARCHAR(50) NOT NULL,
    
    -- Community details
    community_types TEXT[], -- ['savings_group', 'cooperative', 'religious', 'professional']
    leadership_roles TEXT[],
    years_of_participation INTEGER,
    
    -- Calculated scores
    participation_score INTEGER,
    responsibility_score INTEGER,
    trustworthiness_score INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence files (Step 2: Core Trust - Evidence Upload)
CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- File metadata
    file_id VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- Evidence categorization
    evidence_category VARCHAR(20) NOT NULL CHECK (evidence_category IN ('mobile', 'utility', 'community')),
    evidence_type VARCHAR(100), -- 'bill', 'receipt', 'statement', 'certificate'
    months_coverage INTEGER DEFAULT 1,
    
    -- Storage information
    storage_path TEXT NOT NULL,
    storage_url TEXT,
    signed_url TEXT,
    url_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Processing status
    upload_status VARCHAR(50) DEFAULT 'uploaded' CHECK (upload_status IN ('uploading', 'uploaded', 'processing', 'verified', 'failed')),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs_review')),
    
    -- AI analysis results
    ai_extracted_data JSONB,
    confidence_score DECIMAL(3,2),
    anomaly_flags TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Loan experience (Step 3: Loan Experience)
CREATE TABLE IF NOT EXISTS loan_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Loan history
    experience_level VARCHAR(50) NOT NULL,
    previous_loans_count INTEGER DEFAULT 0,
    total_borrowed_amount DECIMAL(12,2),
    
    -- Loan details
    loan_types TEXT[], -- ['personal', 'business', 'education', 'vehicle', 'home']
    repayment_history VARCHAR(100),
    defaults_count INTEGER DEFAULT 0,
    current_outstanding DECIMAL(12,2),
    
    -- Lender relationships
    formal_lenders TEXT[], -- Banks, NBFCs
    informal_lenders TEXT[], -- Friends, family, money lenders
    
    -- Experience narrative
    experience_description TEXT,
    lessons_learned TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial capacity (Step 4: Financial Capacity)
CREATE TABLE IF NOT EXISTS financial_capacity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Employment information
    employment_type VARCHAR(50) NOT NULL,
    income_range VARCHAR(50) NOT NULL,
    income_stability VARCHAR(50) NOT NULL,
    
    -- Detailed financial info
    employer_name VARCHAR(255),
    job_title VARCHAR(255),
    years_employed DECIMAL(3,1),
    industry VARCHAR(100),
    
    -- Income breakdown
    primary_income DECIMAL(10,2),
    secondary_income DECIMAL(10,2),
    irregular_income DECIMAL(10,2),
    
    -- Expenses
    monthly_expenses DECIMAL(10,2),
    fixed_expenses DECIMAL(10,2),
    variable_expenses DECIMAL(10,2),
    
    -- Financial ratios
    debt_to_income_ratio DECIMAL(5,4),
    savings_rate DECIMAL(5,4),
    expense_ratio DECIMAL(5,4),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Asset support (Step 5: Asset Support)
CREATE TABLE IF NOT EXISTS asset_support (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Asset ownership
    property BOOLEAN DEFAULT false,
    fixed_deposits BOOLEAN DEFAULT false,
    collateral_willingness BOOLEAN DEFAULT false,
    
    -- Detailed asset information
    property_details JSONB, -- {type, value, location, ownership_type}
    fd_details JSONB, -- {bank, amount, maturity_date, interest_rate}
    other_assets JSONB, -- {vehicles, jewelry, investments, etc.}
    
    -- Asset values
    total_asset_value DECIMAL(12,2),
    liquid_assets DECIMAL(12,2),
    illiquid_assets DECIMAL(12,2),
    
    -- Collateral information
    collateral_types TEXT[],
    collateral_value DECIMAL(12,2),
    collateral_documentation BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ASSESSMENT RESULTS AND AI PROCESSING
-- =====================================================

-- Trust assessments (Step 6: AI Processing Results)
CREATE TABLE IF NOT EXISTS trust_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Assessment input data (complete request)
    request_data JSONB NOT NULL,
    
    -- AI processing results
    response_data JSONB NOT NULL,
    
    -- Trust band results
    trust_band VARCHAR(10) NOT NULL CHECK (trust_band IN ('T1', 'T2', 'T3', 'T4', 'T5')),
    trust_score INTEGER, -- 0-100 internal score
    confidence_level VARCHAR(50),
    trust_stability VARCHAR(50),
    exposure_readiness_level VARCHAR(50),
    
    -- Traditional credit alignment
    traditional_alignment VARCHAR(20), -- e.g., "650-699"
    equivalent_credit_score INTEGER,
    
    -- Assessment reasoning
    interpretation TEXT,
    key_reasons TEXT[],
    reasoning_factors TEXT[],
    
    -- Risk assessment
    risk_level VARCHAR(20),
    risk_factors TEXT[],
    mitigation_factors TEXT[],
    
    -- Assessment metadata
    assessment_type VARCHAR(100) DEFAULT 'behavioral-trust',
    ai_model_version VARCHAR(50),
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agent processing logs (for debugging and monitoring)
CREATE TABLE IF NOT EXISTS agent_processing_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES trust_assessments(id) ON DELETE CASCADE,
    
    -- Agent information
    agent_name VARCHAR(100) NOT NULL,
    agent_version VARCHAR(50),
    processing_order INTEGER,
    
    -- Processing details
    input_data JSONB,
    output_data JSONB,
    processing_time_ms INTEGER,
    
    -- Status and errors
    status VARCHAR(50) DEFAULT 'success' CHECK (status IN ('success', 'error', 'timeout', 'skipped')),
    error_message TEXT,
    error_details JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Improvement recommendations (Step 7: Guidance)
CREATE TABLE IF NOT EXISTS improvement_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES trust_assessments(id) ON DELETE CASCADE,
    
    -- Recommendation details
    category VARCHAR(50), -- 'mobile', 'utility', 'community', 'financial', 'documentation'
    action TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    impact TEXT,
    
    -- Implementation guidance
    steps TEXT[],
    timeline VARCHAR(50),
    difficulty_level VARCHAR(20),
    
    -- Tracking
    is_implemented BOOLEAN DEFAULT false,
    implementation_date TIMESTAMP WITH TIME ZONE,
    impact_measured BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bias and fairness audit logs
CREATE TABLE IF NOT EXISTS bias_fairness_audits (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES trust_assessments(id) ON DELETE CASCADE,
    
    -- Audit results
    adjustments_applied TEXT[],
    audit_notes TEXT[],
    fairness_score DECIMAL(3,2),
    
    -- Bias detection
    potential_biases TEXT[],
    protected_attributes_checked TEXT[],
    bias_mitigation_applied TEXT[],
    
    -- Fairness metrics
    demographic_parity DECIMAL(3,2),
    equalized_odds DECIMAL(3,2),
    calibration_score DECIMAL(3,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS AND REPORTING TABLES
-- =====================================================

-- Daily assessment statistics
CREATE TABLE IF NOT EXISTS daily_assessment_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    
    -- Volume metrics
    total_assessments INTEGER DEFAULT 0,
    completed_assessments INTEGER DEFAULT 0,
    abandoned_assessments INTEGER DEFAULT 0,
    
    -- Trust band distribution
    t1_count INTEGER DEFAULT 0,
    t2_count INTEGER DEFAULT 0,
    t3_count INTEGER DEFAULT 0,
    t4_count INTEGER DEFAULT 0,
    t5_count INTEGER DEFAULT 0,
    
    -- Performance metrics
    avg_processing_time_ms INTEGER,
    success_rate DECIMAL(5,4),
    error_rate DECIMAL(5,4),
    
    -- File upload stats
    total_files_uploaded INTEGER DEFAULT 0,
    mobile_files INTEGER DEFAULT 0,
    utility_files INTEGER DEFAULT 0,
    community_files INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User behavior analytics
CREATE TABLE IF NOT EXISTS user_behavior_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Journey analytics
    steps_completed INTEGER,
    time_per_step JSONB, -- {step_number: time_in_seconds}
    drop_off_point INTEGER,
    
    -- Interaction patterns
    form_interactions JSONB,
    file_upload_attempts INTEGER,
    help_requests INTEGER,
    
    -- Device and performance
    page_load_times JSONB,
    error_encounters TEXT[],
    browser_compatibility_issues TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Session and assessment indexes
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_id ON assessment_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_status ON assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_created_at ON assessment_sessions(created_at);

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

-- Component data indexes
CREATE INDEX IF NOT EXISTS idx_mobile_stability_session_id ON mobile_stability(session_id);
CREATE INDEX IF NOT EXISTS idx_utility_discipline_session_id ON utility_discipline(session_id);
CREATE INDEX IF NOT EXISTS idx_community_reliability_session_id ON community_reliability(session_id);
CREATE INDEX IF NOT EXISTS idx_loan_experience_session_id ON loan_experience(session_id);
CREATE INDEX IF NOT EXISTS idx_financial_capacity_session_id ON financial_capacity(session_id);
CREATE INDEX IF NOT EXISTS idx_asset_support_session_id ON asset_support(session_id);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_assessment_stats(date);
CREATE INDEX IF NOT EXISTS idx_user_behavior_session_id ON user_behavior_analytics(session_id);

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessment_sessions_updated_at BEFORE UPDATE ON assessment_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evidence_files_updated_at BEFORE UPDATE ON evidence_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trust_assessments_updated_at BEFORE UPDATE ON trust_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update daily statistics
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_assessment_stats (date, total_assessments, completed_assessments)
    VALUES (CURRENT_DATE, 1, CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END)
    ON CONFLICT (date) DO UPDATE SET
        total_assessments = daily_assessment_stats.total_assessments + 1,
        completed_assessments = daily_assessment_stats.completed_assessments + 
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update daily stats when assessment sessions are created/updated
CREATE TRIGGER update_daily_stats_trigger 
    AFTER INSERT OR UPDATE ON assessment_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_daily_stats();

-- =====================================================
-- VIEWS FOR EASY QUERYING
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
    
    -- Purpose
    cp.purpose,
    cp.purpose_description,
    
    -- Core trust data
    ms.sim_duration,
    ms.recharge_regularity,
    ms.usage_consistency,
    ud.on_time_payment,
    ud.delay_frequency,
    ud.bill_predictability,
    cr.group_participation,
    cr.shared_responsibility,
    cr.dispute_history,
    
    -- Evidence summary
    COUNT(ef.id) as total_evidence_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'mobile') as mobile_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'utility') as utility_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'community') as community_files,
    
    -- Loan experience
    le.experience_level,
    le.previous_loans_count,
    
    -- Financial capacity
    fc.employment_type,
    fc.income_range,
    fc.income_stability,
    
    -- Assets
    ast.property,
    ast.fixed_deposits,
    ast.collateral_willingness,
    
    -- Assessment results
    ta.trust_band,
    ta.trust_score,
    ta.confidence_level,
    ta.interpretation,
    ta.traditional_alignment,
    
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
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage,
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
    COUNT(*) FILTER (WHERE verification_status = 'verified') as verified_files,
    COUNT(*) FILTER (WHERE upload_status = 'failed') as failed_uploads,
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
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as percentage
FROM assessment_sessions
GROUP BY current_step, status
ORDER BY current_step, status;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purposes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mobile_stability ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_discipline ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reliability ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_capacity ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bias_fairness_audits ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access)
CREATE POLICY "Service role full access users" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access sessions" ON assessment_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access purposes" ON credit_purposes FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access mobile" ON mobile_stability FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access utility" ON utility_discipline FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access community" ON community_reliability FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access evidence" ON evidence_files FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access loan" ON loan_experience FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access financial" ON financial_capacity FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access assets" ON asset_support FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access assessments" ON trust_assessments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access recommendations" ON improvement_recommendations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access audits" ON bias_fairness_audits FOR ALL USING (auth.role() = 'service_role');

-- Anonymous/authenticated user policies (read-only for analytics)
CREATE POLICY "Public read access sessions" ON assessment_sessions FOR SELECT USING (true);
CREATE POLICY "Public read access assessments" ON trust_assessments FOR SELECT USING (true);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant all permissions to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Grant read permissions for analytics
GRANT SELECT ON complete_assessments TO anon, authenticated;
GRANT SELECT ON trust_band_analytics TO anon, authenticated;
GRANT SELECT ON evidence_analytics TO anon, authenticated;
GRANT SELECT ON user_journey_analytics TO anon, authenticated;

-- =====================================================
-- SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert sample assessment session
INSERT INTO assessment_sessions (session_id, user_identifier, current_step, status) VALUES
('demo-session-001', 'demo@trustweave.com', 8, 'completed');

-- Insert sample data for all steps using the session ID
DO $$
DECLARE
    demo_session_id UUID;
BEGIN
    SELECT id INTO demo_session_id FROM assessment_sessions WHERE session_id = 'demo-session-001';
    
    -- Insert sample data for all steps
    INSERT INTO credit_purposes (session_id, purpose, purpose_description) VALUES
    (demo_session_id, 'medium', 'Small business expansion loan');
    
    INSERT INTO mobile_stability (session_id, sim_duration, recharge_regularity, usage_consistency, stability_score) VALUES
    (demo_session_id, 'more_than_2_years', 'very_regular', 'stable', 85);
    
    INSERT INTO utility_discipline (session_id, on_time_payment, delay_frequency, bill_predictability, punctuality_score) VALUES
    (demo_session_id, 'always', 'never', 'consistent', 90);
    
    INSERT INTO community_reliability (session_id, group_participation, shared_responsibility, dispute_history, participation_score) VALUES
    (demo_session_id, 'active', 'high', 'clear', 88);
    
    INSERT INTO loan_experience (session_id, experience_level, previous_loans_count, experience_description) VALUES
    (demo_session_id, 'some_experience', 2, 'Successfully repaid two small personal loans');
    
    INSERT INTO financial_capacity (session_id, employment_type, income_range, income_stability, debt_to_income_ratio) VALUES
    (demo_session_id, 'full_time', '25000-50000', 'stable', 0.28);
    
    INSERT INTO asset_support (session_id, property, fixed_deposits, collateral_willingness, total_asset_value) VALUES
    (demo_session_id, false, true, true, 75000);
    
    INSERT INTO trust_assessments (session_id, request_id, request_data, response_data, trust_band, trust_score, confidence_level, interpretation, traditional_alignment) VALUES
    (demo_session_id, 'demo-assessment-001', '{}', '{}', 'T3', 75, 'high', 'Developing trust with consistent behavioral patterns', '650-699');
END $$;
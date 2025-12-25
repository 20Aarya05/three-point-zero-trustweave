-- =====================================================
-- TrustWeave Complete Database Schema - Final Version
-- Matches your website structure exactly
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CORE TABLES (Website Flow)
-- =====================================================

-- Assessment sessions (tracks complete user journeys)
CREATE TABLE IF NOT EXISTS assessment_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_identifier VARCHAR(255), -- phone, email, or anonymous ID
    
    -- Session flow
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    current_step INTEGER DEFAULT 0, -- 0=landing, 1=purpose, 2=core, 3=loan, 4=financial, 5=assets, 6=processing, 7=results
    
    -- Session status
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    
    -- Device info
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 1: Purpose Selection
CREATE TABLE IF NOT EXISTS credit_purposes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('small', 'medium', 'large', 'upgrade')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Core Trust - Mobile Stability
CREATE TABLE IF NOT EXISTS mobile_stability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    sim_duration VARCHAR(50) NOT NULL,
    recharge_regularity VARCHAR(50) NOT NULL,
    usage_consistency VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Core Trust - Utility Discipline
CREATE TABLE IF NOT EXISTS utility_discipline (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    on_time_payment VARCHAR(50) NOT NULL,
    delay_frequency VARCHAR(50) NOT NULL,
    bill_predictability VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Core Trust - Community Reliability
CREATE TABLE IF NOT EXISTS community_reliability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    group_participation VARCHAR(50) NOT NULL,
    shared_responsibility VARCHAR(50) NOT NULL,
    dispute_history VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Evidence Files (uploaded to "Files" bucket)
CREATE TABLE IF NOT EXISTS evidence_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- File info
    file_id VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    
    -- Evidence category (mobile, utility, community)
    evidence_category VARCHAR(20) NOT NULL CHECK (evidence_category IN ('mobile', 'utility', 'community')),
    months_coverage INTEGER DEFAULT 1,
    
    -- Storage (in "Files" bucket)
    storage_path TEXT NOT NULL,
    signed_url TEXT,
    url_expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    upload_status VARCHAR(50) DEFAULT 'uploaded',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Loan Experience
CREATE TABLE IF NOT EXISTS loan_experience (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    experience_description TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Financial Capacity
CREATE TABLE IF NOT EXISTS financial_capacity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    employment_type VARCHAR(50) NOT NULL,
    income_range VARCHAR(50) NOT NULL,
    income_stability VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Asset Support
CREATE TABLE IF NOT EXISTS asset_support (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    property BOOLEAN DEFAULT false,
    fixed_deposits BOOLEAN DEFAULT false,
    collateral_willingness BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Trust Assessment Results
CREATE TABLE IF NOT EXISTS trust_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Complete request/response data
    request_data JSONB NOT NULL,
    response_data JSONB NOT NULL,
    
    -- Results
    trust_band VARCHAR(10) NOT NULL CHECK (trust_band IN ('T1', 'T2', 'T3', 'T4', 'T5')),
    interpretation TEXT,
    traditional_alignment VARCHAR(20),
    reasoning TEXT[],
    
    -- Processing info
    processing_time_ms INTEGER,
    backend_used BOOLEAN DEFAULT true, -- true=backend, false=gemini fallback
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS & MONITORING
-- =====================================================

-- Daily statistics
CREATE TABLE IF NOT EXISTS daily_stats (
    date DATE PRIMARY KEY,
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    abandoned_sessions INTEGER DEFAULT 0,
    files_uploaded INTEGER DEFAULT 0,
    t1_assessments INTEGER DEFAULT 0,
    t2_assessments INTEGER DEFAULT 0,
    t3_assessments INTEGER DEFAULT 0,
    t4_assessments INTEGER DEFAULT 0,
    t5_assessments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sessions_status ON assessment_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON assessment_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_evidence_session ON evidence_files(session_id);
CREATE INDEX IF NOT EXISTS idx_evidence_category ON evidence_files(evidence_category);
CREATE INDEX IF NOT EXISTS idx_assessments_trust_band ON trust_assessments(trust_band);
CREATE INDEX IF NOT EXISTS idx_assessments_created ON trust_assessments(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sessions_updated_at 
    BEFORE UPDATE ON assessment_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update daily stats
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO daily_stats (date, total_sessions, completed_sessions)
    VALUES (CURRENT_DATE, 1, CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END)
    ON CONFLICT (date) DO UPDATE SET
        total_sessions = daily_stats.total_sessions + 1,
        completed_sessions = daily_stats.completed_sessions + 
            CASE WHEN NEW.status = 'completed' THEN 1 ELSE 0 END;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER daily_stats_trigger 
    AFTER INSERT OR UPDATE ON assessment_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_daily_stats();

-- =====================================================
-- VIEWS
-- =====================================================

-- Complete assessment view
CREATE OR REPLACE VIEW complete_assessments AS
SELECT 
    s.session_id,
    s.user_identifier,
    s.status,
    s.started_at,
    s.completed_at,
    
    cp.purpose,
    
    ms.sim_duration,
    ms.recharge_regularity,
    ms.usage_consistency,
    
    ud.on_time_payment,
    ud.delay_frequency,
    ud.bill_predictability,
    
    cr.group_participation,
    cr.shared_responsibility,
    cr.dispute_history,
    
    COUNT(ef.id) as total_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'mobile') as mobile_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'utility') as utility_files,
    COUNT(ef.id) FILTER (WHERE ef.evidence_category = 'community') as community_files,
    
    le.experience_description,
    
    fc.employment_type,
    fc.income_range,
    fc.income_stability,
    
    ast.property,
    ast.fixed_deposits,
    ast.collateral_willingness,
    
    ta.trust_band,
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

-- Trust band distribution
CREATE OR REPLACE VIEW trust_band_distribution AS
SELECT 
    trust_band,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM trust_assessments
GROUP BY trust_band
ORDER BY trust_band;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_files ENABLE ROW LEVEL SECURITY;

-- Service role policies
CREATE POLICY "Service role full access sessions" ON assessment_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access assessments" ON trust_assessments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access files" ON evidence_files FOR ALL USING (auth.role() = 'service_role');

-- Public read access for analytics
CREATE POLICY "Public read sessions" ON assessment_sessions FOR SELECT USING (true);
CREATE POLICY "Public read assessments" ON trust_assessments FOR SELECT USING (true);

-- =====================================================
-- PERMISSIONS
-- =====================================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT SELECT ON complete_assessments TO anon, authenticated;
GRANT SELECT ON trust_band_distribution TO anon, authenticated;
-- =====================================================
-- TrustWeave Assessment Results - Part 5
-- =====================================================

-- Trust assessments (Step 6: AI Processing Results)
CREATE TABLE IF NOT EXISTS trust_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    
    -- Assessment input data
    request_data JSONB NOT NULL,
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

-- Agent processing logs
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

-- Improvement recommendations
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
-- =====================================================
-- TrustWeave Analytics Tables - Part 6
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

-- Assessment performance metrics
CREATE TABLE IF NOT EXISTS assessment_performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id UUID REFERENCES trust_assessments(id) ON DELETE CASCADE,
    
    -- Processing performance
    total_processing_time_ms INTEGER,
    agent_processing_times JSONB, -- {agent_name: time_ms}
    
    -- Data quality metrics
    data_completeness_score DECIMAL(3,2),
    evidence_quality_score DECIMAL(3,2),
    consistency_score DECIMAL(3,2),
    
    -- Model performance
    model_confidence DECIMAL(3,2),
    prediction_stability DECIMAL(3,2),
    feature_importance JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
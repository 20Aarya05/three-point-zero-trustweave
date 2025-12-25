-- =====================================================
-- TrustWeave Trust Components - Part 2
-- =====================================================

-- Mobile stability data (Step 2: Core Trust - Mobile)
CREATE TABLE IF NOT EXISTS mobile_stability (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
    
    -- Mobile behavior patterns
    sim_duration VARCHAR(50) NOT NULL,
    recharge_regularity VARCHAR(50) NOT NULL,
    usage_consistency VARCHAR(50) NOT NULL,
    
    -- Additional insights
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
    
    -- Utility details
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
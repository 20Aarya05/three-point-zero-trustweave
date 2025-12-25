-- =====================================================
-- TrustWeave Core Tables - Part 1
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    user_identifier VARCHAR(255), -- For anonymous users
    
    -- Session metadata
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 8,
    
    -- Device info
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
    
    purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('small', 'medium', 'large', 'upgrade')),
    purpose_description TEXT,
    loan_amount_range VARCHAR(50),
    intended_use TEXT,
    assessment_path VARCHAR(50),
    complexity_level VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
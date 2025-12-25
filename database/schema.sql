-- TrustWeave Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Evaluations table to store all evaluation requests and responses (legacy)
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    request_data JSONB NOT NULL,
    response_data JSONB NOT NULL,
    trust_band VARCHAR(10) NOT NULL CHECK (trust_band IN ('T1', 'T2', 'T3', 'T4', 'T5')),
    assessment_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trust assessments table for frontend-compatible assessments
CREATE TABLE IF NOT EXISTS trust_assessments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    request_id VARCHAR(255) UNIQUE NOT NULL,
    request_data JSONB NOT NULL,
    response_data JSONB NOT NULL,
    trust_band VARCHAR(10) NOT NULL CHECK (trust_band IN ('T1', 'T2', 'T3', 'T4', 'T5')),
    assessment_type VARCHAR(100) NOT NULL DEFAULT 'behavioral-trust',
    user_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table to track uploaded evidence
CREATE TABLE IF NOT EXISTS file_uploads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id VARCHAR(255) UNIQUE NOT NULL,
    original_name VARCHAR(500) NOT NULL,
    file_name VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    user_id VARCHAR(255),
    assessment_id UUID REFERENCES trust_assessments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_evaluations_trust_band ON evaluations(trust_band);
CREATE INDEX IF NOT EXISTS idx_evaluations_assessment_type ON evaluations(assessment_type);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_request_id ON evaluations(request_id);

-- Indexes for trust assessments
CREATE INDEX IF NOT EXISTS idx_trust_assessments_trust_band ON trust_assessments(trust_band);
CREATE INDEX IF NOT EXISTS idx_trust_assessments_user_id ON trust_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_assessments_created_at ON trust_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_trust_assessments_request_id ON trust_assessments(request_id);

-- Indexes for file uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_assessment_id ON file_uploads(assessment_id);
CREATE INDEX IF NOT EXISTS idx_file_uploads_created_at ON file_uploads(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_evaluations_updated_at 
    BEFORE UPDATE ON evaluations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trust_assessments_updated_at 
    BEFORE UPDATE ON trust_assessments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for analytics
CREATE OR REPLACE VIEW evaluation_analytics AS
SELECT 
    trust_band,
    assessment_type,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as evaluation_date
FROM evaluations
GROUP BY trust_band, assessment_type, DATE_TRUNC('day', created_at)
ORDER BY evaluation_date DESC, trust_band;

-- Trust assessment analytics view
CREATE OR REPLACE VIEW trust_assessment_analytics AS
SELECT 
    trust_band,
    assessment_type,
    user_id,
    COUNT(*) as count,
    DATE_TRUNC('day', created_at) as assessment_date
FROM trust_assessments
GROUP BY trust_band, assessment_type, user_id, DATE_TRUNC('day', created_at)
ORDER BY assessment_date DESC, trust_band;

-- Row Level Security (RLS) policies
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to do everything
CREATE POLICY "Service role can manage evaluations" ON evaluations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage trust assessments" ON trust_assessments
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage file uploads" ON file_uploads
    FOR ALL USING (auth.role() = 'service_role');

-- Policy to allow authenticated users to read their own data
CREATE POLICY "Users can read evaluations" ON evaluations
    FOR SELECT USING (true);

CREATE POLICY "Users can read trust assessments" ON trust_assessments
    FOR SELECT USING (true);

CREATE POLICY "Users can read file uploads" ON file_uploads
    FOR SELECT USING (true);

-- Grant necessary permissions
GRANT ALL ON evaluations TO service_role;
GRANT ALL ON trust_assessments TO service_role;
GRANT ALL ON file_uploads TO service_role;
GRANT SELECT ON evaluation_analytics TO service_role;
GRANT SELECT ON trust_assessment_analytics TO service_role;

-- Insert some sample data for testing (optional)
-- INSERT INTO evaluations (request_id, request_data, response_data, trust_band, assessment_type) VALUES
-- (
--     'sample-request-1',
--     '{"credit_purpose": "home_loan", "behavioral_inputs": {}, "evidence_metadata": [], "loan_history": "", "capacity_inputs": {}, "asset_inputs": {}}',
--     '{"trust_profile": {"trust_band": "T3", "confidence_level": "medium", "trust_stability": "stable", "exposure_readiness_level": "moderate"}, "explanation": {"summary_message": "Sample evaluation", "key_reasons": ["Good credit history"]}, "improvement_actions": [], "fairness_audit": {"adjustments_applied": [], "audit_notes": []}, "metadata": {"assessment_type": "purpose-aligned", "generated_at": "2024-01-01T00:00:00Z", "version": "v1"}}',
--     'T3',
--     'purpose-aligned'
-- );
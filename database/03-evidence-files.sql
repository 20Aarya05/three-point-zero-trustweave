-- =====================================================
-- TrustWeave Evidence Files - Part 3
-- =====================================================

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

-- File processing logs
CREATE TABLE IF NOT EXISTS file_processing_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    file_id UUID REFERENCES evidence_files(id) ON DELETE CASCADE,
    
    -- Processing details
    processing_stage VARCHAR(50), -- 'upload', 'scan', 'extract', 'verify'
    processor_name VARCHAR(100),
    processing_time_ms INTEGER,
    
    -- Results
    status VARCHAR(50) CHECK (status IN ('success', 'error', 'warning')),
    result_data JSONB,
    error_message TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
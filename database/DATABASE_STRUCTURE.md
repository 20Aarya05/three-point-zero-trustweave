# TrustWeave Database Structure Documentation

## Overview

This database structure perfectly matches your TrustWeave website flow and captures every step of the user journey from landing page to final trust profile results.

## 🎯 Website Flow → Database Mapping

### Step 0: Landing Page
**Table**: `assessment_sessions`
- Tracks when user starts the assessment
- Records device info, browser, IP address
- Generates unique session ID for tracking

### Step 1: Purpose Selection
**Table**: `credit_purposes`
- Stores selected purpose: 'small', 'medium', 'large', 'upgrade'
- Records loan amount range and intended use
- Determines assessment path (which steps to show/skip)

### Step 2: Core Trust Form (3 Categories)

#### Mobile Stability Section
**Table**: `mobile_stability`
- `sim_duration`: How long they've had their number
- `recharge_regularity`: Payment consistency
- `usage_consistency`: Behavioral patterns
- Calculated stability, consistency, and reliability scores

#### Utility Payment Discipline Section  
**Table**: `utility_discipline`
- `on_time_payment`: Payment punctuality
- `delay_frequency`: How often they're late
- `bill_predictability`: Amount consistency
- Tracks utility types and payment methods

#### Community Reliability Section
**Table**: `community_reliability`
- `group_participation`: Level of involvement
- `shared_responsibility`: Leadership/trust roles
- `dispute_history`: Conflict resolution track record
- Records community types and leadership roles

#### Evidence Upload (All Categories)
**Table**: `evidence_files`
- Stores files by category: 'mobile', 'utility', 'community'
- Tracks upload status, verification status
- Links to Supabase storage with signed URLs
- AI analysis results and confidence scores

### Step 3: Loan Experience
**Table**: `loan_experience`
- Previous loan history and repayment patterns
- Formal vs informal lender relationships
- Default history and current outstanding amounts
- Experience narrative and lessons learned

### Step 4: Financial Capacity (Conditional)
**Table**: `financial_capacity`
- Employment details and income stability
- Income breakdown (primary, secondary, irregular)
- Expense tracking and financial ratios
- Debt-to-income calculations

### Step 5: Asset Support (Conditional)
**Table**: `asset_support`
- Property, fixed deposits, collateral willingness
- Detailed asset information in JSONB format
- Asset valuations and collateral documentation
- Liquid vs illiquid asset breakdown

### Step 6: AI Processing
**Tables**: `trust_assessments`, `agent_processing_logs`
- Complete request/response data storage
- Trust band assignment (T1-T5)
- Traditional credit score alignment
- Reasoning factors and risk assessment
- Individual agent processing logs for debugging

### Step 7: Results & Recommendations
**Tables**: `improvement_recommendations`, `bias_fairness_audits`
- Actionable improvement suggestions by category
- Implementation guidance and timelines
- Bias detection and fairness audit results
- Demographic parity and fairness metrics

## 📊 Analytics & Monitoring

### Daily Statistics
**Table**: `daily_assessment_stats`
- Volume metrics (total, completed, abandoned)
- Trust band distribution by day
- File upload statistics by category
- Performance metrics and success rates

### User Behavior Analytics
**Table**: `user_behavior_analytics`
- Time spent per step
- Drop-off points and completion rates
- Form interaction patterns
- Device performance and error tracking

### Complete Assessment View
**View**: `complete_assessments`
- Joins all related data for easy querying
- Single view of complete user journey
- Perfect for reporting and analysis

## 🔍 Key Features

### 1. Session Tracking
Every user interaction is tracked through `assessment_sessions`:
```sql
-- Track user journey
SELECT 
    session_id,
    current_step,
    status,
    started_at,
    completed_at
FROM assessment_sessions 
WHERE user_identifier = 'user@example.com';
```

### 2. Evidence Management
Files are categorized and tracked through their lifecycle:
```sql
-- Get all evidence files for a session
SELECT 
    evidence_category,
    original_name,
    upload_status,
    verification_status,
    months_coverage
FROM evidence_files 
WHERE session_id = 'session-uuid';
```

### 3. Trust Assessment Pipeline
Complete audit trail of AI processing:
```sql
-- Get assessment with agent logs
SELECT 
    ta.trust_band,
    ta.interpretation,
    apl.agent_name,
    apl.processing_time_ms,
    apl.status
FROM trust_assessments ta
JOIN agent_processing_logs apl ON ta.id = apl.assessment_id
WHERE ta.session_id = 'session-uuid';
```

### 4. Analytics Queries
Ready-made views for business intelligence:
```sql
-- Trust band distribution
SELECT * FROM trust_band_analytics;

-- Evidence upload patterns
SELECT * FROM evidence_analytics;

-- User journey analysis
SELECT * FROM user_journey_analytics;
```

## 🚀 Usage Examples

### 1. Start New Assessment
```sql
INSERT INTO assessment_sessions (session_id, user_identifier, device_type)
VALUES ('new-session-123', 'user@example.com', 'mobile');
```

### 2. Save Form Data
```sql
-- Save mobile stability data
INSERT INTO mobile_stability (session_id, sim_duration, recharge_regularity, usage_consistency)
VALUES ('session-uuid', 'more_than_2_years', 'very_regular', 'stable');
```

### 3. Track File Uploads
```sql
-- Record evidence file upload
INSERT INTO evidence_files (session_id, file_id, original_name, evidence_category, storage_path)
VALUES ('session-uuid', 'file-123', 'utility-bill.pdf', 'utility', '/storage/path');
```

### 4. Store Assessment Results
```sql
-- Save trust assessment
INSERT INTO trust_assessments (session_id, request_id, trust_band, interpretation, request_data, response_data)
VALUES ('session-uuid', 'assessment-123', 'T3', 'Developing trust profile', '{}', '{}');
```

## 🔒 Security Features

### Row Level Security (RLS)
- Service role has full access for backend operations
- Anonymous users can read analytics views only
- Future user authentication ready

### Data Privacy
- Personal data encrypted at rest
- File storage uses signed URLs with expiration
- Audit trails for all data access

### Compliance Ready
- Complete audit trail of all decisions
- Bias detection and fairness metrics
- Data retention and deletion capabilities

## 📈 Scalability Features

### Indexes
Optimized for common query patterns:
- Session lookups by user and status
- Trust assessments by band and date
- Evidence files by category and status
- All foreign key relationships indexed

### Partitioning Ready
Tables designed for future partitioning:
- Time-based partitioning on created_at columns
- Session-based partitioning for large datasets

### Analytics Optimization
- Pre-computed daily statistics
- Materialized views for complex analytics
- JSONB columns for flexible data storage

## 🛠️ Maintenance

### Automated Updates
- Triggers update timestamps automatically
- Daily statistics computed in real-time
- File URL expiration handled automatically

### Data Cleanup
```sql
-- Clean up expired sessions
DELETE FROM assessment_sessions 
WHERE status = 'expired' 
AND created_at < NOW() - INTERVAL '30 days';

-- Archive old assessments
-- (Move to archive tables for long-term storage)
```

### Monitoring Queries
```sql
-- Check system health
SELECT 
    COUNT(*) as total_sessions,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'abandoned') as abandoned
FROM assessment_sessions 
WHERE created_at >= CURRENT_DATE;

-- File upload success rate
SELECT 
    evidence_category,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE upload_status = 'uploaded') as successful
FROM evidence_files 
WHERE created_at >= CURRENT_DATE
GROUP BY evidence_category;
```

This database structure provides a complete foundation for your TrustWeave application with full traceability, analytics capabilities, and scalability for future growth.
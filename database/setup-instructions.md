# TrustWeave Database Setup Instructions

## 🚀 Quick Setup

### 1. Supabase Project Setup
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose your organization and region
3. Set a strong database password
4. Wait for project initialization (2-3 minutes)

### 2. Run Database Schema
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy and paste the entire contents of `complete-schema-fixed.sql`
5. Click **"Run"** to execute the schema

### 3. Verify Installation
Check that all tables were created successfully:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see these tables:
- `agent_processing_logs`
- `assessment_sessions`
- `asset_support`
- `bias_fairness_audits`
- `community_reliability`
- `credit_purposes`
- `daily_assessment_stats`
- `evidence_files`
- `financial_capacity`
- `improvement_recommendations`
- `loan_experience`
- `mobile_stability`
- `trust_assessments`
- `user_behavior_analytics`
- `users`
- `utility_discipline`

### 4. Test Sample Data
The schema includes sample data. Verify it was inserted:

```sql
-- Check sample session
SELECT * FROM assessment_sessions WHERE session_id = 'demo-session-001';

-- Check complete assessment view
SELECT * FROM complete_assessments LIMIT 1;
```

### 5. Configure Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `trustweave-documents`
3. Set it to **Private** (not public)
4. Configure allowed file types:
   - `application/pdf`
   - `image/jpeg`
   - `image/png`
   - `application/msword`
   - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 6. Update Backend Configuration
Update your `.env` file with Supabase credentials:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## 🧪 Testing the Database

### Test Basic Queries
```sql
-- Test analytics views
SELECT * FROM trust_band_analytics;
SELECT * FROM evidence_analytics;
SELECT * FROM user_journey_analytics;

-- Test session tracking
SELECT 
    session_id,
    status,
    current_step,
    created_at
FROM assessment_sessions
ORDER BY created_at DESC;
```

### Test File Storage
```sql
-- Check evidence files
SELECT 
    evidence_category,
    COUNT(*) as file_count,
    AVG(file_size) as avg_size
FROM evidence_files
GROUP BY evidence_category;
```

### Test Assessment Pipeline
```sql
-- Check trust assessments
SELECT 
    trust_band,
    COUNT(*) as count,
    AVG(trust_score) as avg_score
FROM trust_assessments
GROUP BY trust_band
ORDER BY trust_band;
```

## 📊 Useful Queries for Development

### Monitor Active Sessions
```sql
SELECT 
    session_id,
    user_identifier,
    current_step,
    status,
    started_at,
    EXTRACT(EPOCH FROM (NOW() - started_at))/60 as duration_minutes
FROM assessment_sessions
WHERE status = 'in_progress'
ORDER BY started_at DESC;
```

### File Upload Statistics
```sql
SELECT 
    DATE(created_at) as upload_date,
    evidence_category,
    COUNT(*) as files_uploaded,
    SUM(file_size) as total_size_bytes
FROM evidence_files
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at), evidence_category
ORDER BY upload_date DESC, evidence_category;
```

### Trust Band Distribution
```sql
SELECT 
    trust_band,
    COUNT(*) as assessments,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM trust_assessments
GROUP BY trust_band
ORDER BY trust_band;
```

### Performance Monitoring
```sql
SELECT 
    agent_name,
    COUNT(*) as executions,
    AVG(processing_time_ms) as avg_time_ms,
    COUNT(*) FILTER (WHERE status = 'error') as errors
FROM agent_processing_logs
WHERE created_at >= CURRENT_DATE
GROUP BY agent_name
ORDER BY avg_time_ms DESC;
```

## 🔧 Maintenance Tasks

### Daily Cleanup
```sql
-- Clean up expired file URLs (run daily)
UPDATE evidence_files 
SET signed_url = NULL, url_expires_at = NULL
WHERE url_expires_at < NOW();

-- Update session status for abandoned sessions
UPDATE assessment_sessions 
SET status = 'expired'
WHERE status = 'in_progress' 
AND started_at < NOW() - INTERVAL '24 hours';
```

### Weekly Analytics Update
```sql
-- Refresh analytics views if needed
REFRESH MATERIALIZED VIEW IF EXISTS trust_band_analytics_materialized;

-- Archive old sessions (optional)
-- Move sessions older than 90 days to archive table
```

### Monthly Reporting
```sql
-- Monthly assessment summary
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_assessments,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    AVG(trust_score) as avg_trust_score
FROM trust_assessments
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

## 🚨 Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Make sure you ran the complete schema
   - Check that you're connected to the right database

2. **Permission denied errors**
   - Verify RLS policies are set correctly
   - Check that service role key is being used

3. **File upload failures**
   - Ensure storage bucket exists and is configured
   - Check file size limits (10MB default)

4. **Slow queries**
   - Check that indexes are created
   - Use EXPLAIN ANALYZE to identify bottlenecks

### Reset Database (Development Only)
```sql
-- WARNING: This will delete all data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then re-run the complete schema
```

## 📞 Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify all environment variables are set
3. Test with the sample queries above
4. Check the database structure documentation

The database is now ready to support your complete TrustWeave application!
# TrustWeave Frontend-Backend Integration Guide

## 🎯 Overview

This guide shows you how to run the complete TrustWeave system with:
- **Frontend**: React/TypeScript UI from GitHub repository
- **Backend**: Express/TypeScript API with agent integration
- **File Upload**: Multer + Supabase storage
- **Database**: Supabase for audit trails

## 🚀 Quick Start

### 1. Backend Setup

```bash
# Install backend dependencies
npm install

# Create environment file
cp .env.example .env
```

Update `.env` with your Supabase credentials:
```env
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# API Configuration
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000
```

### 2. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the schema from `database/schema.sql`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local
```

Update `frontend/.env.local`:
```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:3001

# Gemini API Key (fallback)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Environment
VITE_NODE_ENV=development
```

### 4. Start Both Services

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 📋 API Endpoints

### Backend Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trust/assess` | Main trust assessment |
| POST | `/api/trust/upload-evidence` | Upload evidence files |
| POST | `/api/trust/assess-with-upload` | Combined upload + assess |
| GET | `/api/trust/health` | Service health check |
| POST | `/api/evaluate/full` | Legacy evaluation endpoint |
| GET | `/health` | Overall system health |

### Frontend Flow

1. **Landing Page** → Start assessment
2. **Purpose Selection** → Choose credit purpose
3. **Core Trust Form** → Behavioral data + file upload
4. **Loan Experience** → Previous loan history
5. **Financial Capacity** → Income and employment
6. **Asset Support** → Property and collateral
7. **Processing** → AI analysis with backend
8. **Trust Profile** → Final results

## 🔧 File Upload System

### Supported File Types
- PDF documents
- Images (JPG, PNG)
- Word documents (DOC, DOCX)
- Text files (TXT)

### Upload Process
1. User selects files in frontend
2. Files uploaded to Supabase storage via backend API
3. Signed URLs generated for secure access
4. File metadata stored in database
5. Files included in trust assessment

### Storage Structure
```
supabase-storage/
└── trustweave-documents/
    ├── uploads/
    │   └── [uuid].pdf
    └── [user-id]/
        └── [uuid].pdf
```

## 🧪 Testing the Integration

### 1. Test Backend Health
```bash
curl http://localhost:3001/health
```

### 2. Test File Upload
```bash
curl -X POST http://localhost:3001/api/trust/upload-evidence \
  -F "documents=@test-file.pdf" \
  -F "userId=test-user"
```

### 3. Test Trust Assessment
```bash
curl -X POST http://localhost:3001/api/trust/assess \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "small",
    "mobile": {"simDuration": "more_than_2_years", "rechargeRegularity": "very_regular", "usageConsistency": "stable"},
    "utility": {"onTimePayment": "always", "delayFrequency": "never", "billPredictability": "consistent"},
    "community": {"groupParticipation": "active", "sharedResponsibility": "high", "disputeHistory": "clear"},
    "evidence": [],
    "loanExperience": "No previous loans",
    "financial": {"employmentType": "full_time", "incomeRange": "25000-50000", "incomeStability": "stable"},
    "assets": {"property": false, "fixedDeposits": true, "collateralWillingness": true}
  }'
```

## 🔄 Data Flow

### Frontend → Backend
```typescript
// Frontend sends this format
{
  purpose: 'small' | 'medium' | 'large' | 'upgrade',
  mobile: { simDuration, rechargeRegularity, usageConsistency },
  utility: { onTimePayment, delayFrequency, billPredictability },
  community: { groupParticipation, sharedResponsibility, disputeHistory },
  evidence: [{ name, type, months, url?, uploadedAt? }],
  loanExperience: string,
  financial: { employmentType, incomeRange, incomeStability },
  assets: { property, fixedDeposits, collateralWillingness }
}
```

### Backend → Frontend
```typescript
// Backend returns this format
{
  trustBand: 'T1' | 'T2' | 'T3' | 'T4' | 'T5',
  interpretation: string,
  traditionalAlignment: string,
  reasoning: string[],
  metadata?: {
    assessment_type: string,
    generated_at: string,
    version: string
  }
}
```

## 🤖 Agent Integration

### Current Implementation
The backend includes placeholder agent implementations that simulate the TrustWeave agent pipeline:

1. **Purpose & Routing Agent** → Determines assessment type
2. **Data Interpretation Agent** → Processes behavioral data
3. **Trust Reasoning Agent** → Calculates trust band
4. **Bias & Fairness Agent** → Applies fairness adjustments
5. **Improvement & Guidance Agent** → Generates recommendations

### Integrating Your Agents

Replace the placeholders in `src/agents/index.ts`:

```typescript
import { YourPurposeRoutingAgent } from './your-agents/purposeRoutingAgent';
// ... import other agents

export class AgentFactory {
  static createPurposeRoutingAgent(): PurposeRoutingAgent {
    return new YourPurposeRoutingAgent();
  }
  // ... implement other agent factories
}
```

## 🛡️ Security Features

### Backend Security
- **Helmet**: Security headers
- **CORS**: Configurable origins
- **Rate Limiting**: 100 requests/15min per IP
- **File Validation**: Type and size limits
- **Input Validation**: Zod schema validation

### File Security
- **Private Storage**: Files stored in private Supabase bucket
- **Signed URLs**: Temporary access URLs (7-day expiry)
- **File Type Validation**: Only allowed types accepted
- **Size Limits**: 10MB per file, 10 files max

### Database Security
- **Row Level Security**: Enabled on all tables
- **Service Role**: Backend uses service role for full access
- **Audit Trail**: All assessments logged with timestamps

## 📊 Database Schema

### Tables Created
- `evaluations` - Legacy evaluation storage
- `trust_assessments` - Frontend-compatible assessments
- `file_uploads` - File upload tracking

### Storage Buckets
- `trustweave-documents` - Evidence file storage

## 🐛 Troubleshooting

### Common Issues

1. **"Supabase configuration missing"**
   - Check `.env` file exists and has correct values
   - Verify Supabase URL and service role key

2. **"File upload failed"**
   - Check Supabase storage permissions
   - Verify file size and type limits
   - Ensure storage bucket exists

3. **"CORS error"**
   - Update `CORS_ORIGIN` in backend `.env`
   - Check frontend is running on correct port

4. **"Backend unavailable"**
   - Ensure backend is running on port 3001
   - Check `VITE_API_BASE_URL` in frontend `.env.local`

### Debug Mode

Enable debug logging:
```bash
# Backend
NODE_ENV=development npm run dev

# Frontend
VITE_NODE_ENV=development npm run dev
```

## 🚀 Production Deployment

### Backend Deployment
- Deploy to Vercel, Railway, or Heroku
- Set environment variables in platform
- Update CORS_ORIGIN for production domain

### Frontend Deployment
- Deploy to Vercel, Netlify, or similar
- Update VITE_API_BASE_URL to production backend URL
- Set production Gemini API key if using fallback

### Database
- Supabase handles scaling automatically
- Monitor usage in Supabase dashboard
- Consider upgrading plan for production traffic

## 📈 Monitoring

### Health Checks
- `GET /health` - Overall system health
- `GET /api/trust/health` - Trust service health

### Logging
- All requests logged with timestamps
- File uploads tracked in database
- Assessment results stored for audit

### Analytics
- Trust band distribution available in database
- Assessment history queryable
- File upload statistics tracked

## 🎯 Next Steps

1. **Integrate Your Agents**: Replace placeholder implementations
2. **Customize UI**: Modify frontend components as needed
3. **Add Authentication**: Implement user accounts if required
4. **Scale Infrastructure**: Upgrade Supabase plan for production
5. **Monitor Performance**: Set up logging and analytics

## 📞 Support

- **Backend Issues**: Check server logs and health endpoints
- **Frontend Issues**: Check browser console and network tab
- **Database Issues**: Check Supabase dashboard and logs
- **File Upload Issues**: Verify storage permissions and limits
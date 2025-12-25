# TrustWeave Backend API

A TypeScript Express backend that integrates the TrustWeave agent system for credit evaluation and trust assessment.

## Features

- **Clean API Surface**: RESTful endpoints for evaluation requests
- **Agent Isolation**: Agents remain pure modules, isolated from HTTP concerns
- **UI-Safe Responses**: Structured responses ready for frontend consumption
- **Error Handling**: Graceful error handling with detailed error messages
- **Database Integration**: Supabase integration for audit trails and analytics
- **TypeScript**: Full type safety throughout the application
- **Validation**: Request validation using Zod schemas
- **Security**: Helmet, CORS, and rate limiting built-in

## Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Update the following variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 3. Database Setup

Run the SQL schema in your Supabase SQL editor:

```sql
-- Copy and paste the contents of database/schema.sql
```

### 4. Agent Integration

Update `src/agents/index.ts` to import your actual agent implementations:

```typescript
// Replace the placeholder implementations with your actual agents
export class AgentFactory {
  static createPurposeRoutingAgent(): PurposeRoutingAgent {
    return new YourPurposeRoutingAgent(); // Your implementation
  }
  // ... other agents
}
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### POST /api/evaluate/full

Runs the complete agent pipeline and returns the final trust assessment.

**Request:**
```json
{
  "credit_purpose": "home_purchase",
  "behavioral_inputs": {
    "payment_history_score": 85,
    "credit_utilization": 0.25
  },
  "evidence_metadata": [
    {
      "document_type": "bank_statement",
      "verification_status": "verified"
    }
  ],
  "loan_history": "Previous auto loan paid successfully",
  "capacity_inputs": {
    "monthly_income": 8500,
    "debt_to_income_ratio": 0.28
  },
  "asset_inputs": {
    "savings_balance": 45000,
    "checking_balance": 8500
  }
}
```

**Response:**
```json
{
  "trust_profile": {
    "trust_band": "T3",
    "confidence_level": "high",
    "trust_stability": "stable",
    "exposure_readiness_level": "moderate"
  },
  "explanation": {
    "summary_message": "Applicant demonstrates solid financial responsibility...",
    "key_reasons": ["Strong payment history", "Healthy debt-to-income ratio"]
  },
  "improvement_actions": [
    {
      "action": "Reduce credit utilization below 20%",
      "priority": "medium",
      "impact": "Could improve trust band to T2"
    }
  ],
  "fairness_audit": {
    "adjustments_applied": ["Income normalization"],
    "audit_notes": ["No bias indicators detected"]
  },
  "metadata": {
    "assessment_type": "purpose-aligned",
    "generated_at": "2024-12-25T10:30:00.000Z",
    "version": "v1"
  }
}
```

### POST /api/evaluate/debug

Returns the same response as `/full` but includes intermediate agent outputs for debugging.

**Additional Response Fields:**
```json
{
  // ... same as /full response
  "debug_info": {
    "purpose_routing": { /* Purpose agent output */ },
    "data_interpretation": { /* Data agent output */ },
    "trust_reasoning": { /* Trust agent output */ },
    "bias_fairness": { /* Bias agent output */ },
    "improvement_guidance": { /* Guidance agent output */ }
  }
}
```

### GET /api/evaluate/health

Health check for the evaluation service.

### GET /health

Overall system health check including database connectivity.

## Agent Pipeline

The evaluation follows this sequence:

1. **Purpose & Routing Agent**: Determines assessment type and routing
2. **Data Interpretation Agent**: Processes and validates input data
3. **Trust Reasoning Agent**: Calculates trust band and confidence levels
4. **Bias & Fairness Agent**: Applies fairness adjustments and auditing
5. **Improvement & Guidance Agent**: Generates actionable recommendations

## Error Handling

All endpoints return structured error responses:

```json
{
  "error": "Validation Error",
  "message": "Invalid request format",
  "timestamp": "2024-12-25T10:30:00.000Z",
  "request_id": "uuid-here"
}
```

## Frontend Integration

### React/TypeScript Example

```typescript
interface EvaluationRequest {
  credit_purpose: string;
  behavioral_inputs: Record<string, any>;
  evidence_metadata: Array<Record<string, any>>;
  loan_history: string;
  capacity_inputs: Record<string, any>;
  asset_inputs: Record<string, any>;
}

const evaluateCredit = async (data: EvaluationRequest) => {
  try {
    const response = await fetch('http://localhost:3001/api/evaluate/full', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Evaluation failed:', error);
    throw error;
  }
};
```

## Development

### Build for Production

```bash
npm run build
npm start
```

### Testing

```bash
npm test
```

## Project Structure

```
src/
├── agents/           # Agent interfaces and factory
├── middleware/       # Express middleware (validation, etc.)
├── routes/          # API route handlers
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── server.ts        # Main Express application

database/
└── schema.sql       # Supabase database schema

examples/
├── request-payload.json   # Example request
└── response-success.json  # Example response
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Zod schema validation
- **Request Size Limits**: 10MB limit on request bodies

## Database

The application uses Supabase (PostgreSQL) for:
- **Audit Trail**: All evaluations are stored for compliance
- **Analytics**: Trust band distribution and trends
- **Health Monitoring**: Database connectivity checks

## Contributing

1. Ensure all agents are implemented in `src/agents/index.ts`
2. Add proper TypeScript types for any new features
3. Update API documentation for new endpoints
4. Test all endpoints before submitting changes

## License

[Your License Here]
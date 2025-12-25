# TrustWeave API - cURL Test Commands

Use these commands to test your TrustWeave backend API from the command line.

## Prerequisites

1. **Backend running**: `npm run dev` (should be on http://localhost:3001)
2. **Environment variables**: Update the URLs and keys in commands below

## 1. Health Checks

### Overall System Health
```bash
curl -X GET http://localhost:3001/health
```

### Trust Service Health
```bash
curl -X GET http://localhost:3001/api/trust/health
```

### API Information
```bash
curl -X GET http://localhost:3001/
```

## 2. File Upload Tests

### Upload Single File
```bash
curl -X POST http://localhost:3001/api/trust/upload-evidence \
  -F "documents=@sample-document.pdf" \
  -F "userId=test-user-123"
```

### Upload Multiple Files
```bash
curl -X POST http://localhost:3001/api/trust/upload-evidence \
  -F "documents=@utility-bill.pdf" \
  -F "documents=@mobile-bill.jpg" \
  -F "documents=@community-receipt.png" \
  -F "userId=test-user-multi"
```

### Test File Type Validation (Should Fail)
```bash
curl -X POST http://localhost:3001/api/trust/upload-evidence \
  -F "documents=@invalid-file.exe" \
  -F "userId=test-user-invalid"
```

## 3. Trust Assessment Tests

### Basic Trust Assessment (Good Profile)
```bash
curl -X POST http://localhost:3001/api/trust/assess \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "small",
    "mobile": {
      "simDuration": "more_than_2_years",
      "rechargeRegularity": "very_regular",
      "usageConsistency": "stable"
    },
    "utility": {
      "onTimePayment": "always",
      "delayFrequency": "never",
      "billPredictability": "consistent"
    },
    "community": {
      "groupParticipation": "active",
      "sharedResponsibility": "high",
      "disputeHistory": "clear"
    },
    "evidence": [
      {
        "name": "mobile-bill.pdf",
        "type": "mobile",
        "months": 2
      },
      {
        "name": "utility-bill.pdf",
        "type": "utility",
        "months": 2
      },
      {
        "name": "community-receipt.jpg",
        "type": "community",
        "months": 2
      }
    ],
    "loanExperience": "No previous loans, first time applicant",
    "financial": {
      "employmentType": "full_time",
      "incomeRange": "25000-50000",
      "incomeStability": "stable"
    },
    "assets": {
      "property": false,
      "fixedDeposits": true,
      "collateralWillingness": true
    }
  }'
```

### High Risk Assessment (Poor Profile)
```bash
curl -X POST http://localhost:3001/api/trust/assess \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "large",
    "mobile": {
      "simDuration": "less_than_6_months",
      "rechargeRegularity": "irregular",
      "usageConsistency": "fluctuating"
    },
    "utility": {
      "onTimePayment": "often_late",
      "delayFrequency": "frequently",
      "billPredictability": "highly_variable"
    },
    "community": {
      "groupParticipation": "none",
      "sharedResponsibility": "none",
      "disputeHistory": "major"
    },
    "evidence": [],
    "loanExperience": "Multiple defaults in past",
    "financial": {
      "employmentType": "unemployed",
      "incomeRange": "0-10000",
      "incomeStability": "unstable"
    },
    "assets": {
      "property": false,
      "fixedDeposits": false,
      "collateralWillingness": false
    }
  }'
```

### Test Validation Error
```bash
curl -X POST http://localhost:3001/api/trust/assess \
  -H "Content-Type: application/json" \
  -d '{
    "purpose": "invalid_purpose",
    "mobile": {},
    "utility": {},
    "community": {},
    "evidence": [],
    "loanExperience": "",
    "financial": {},
    "assets": {}
  }'
```

## 4. Combined Upload & Assessment

### Upload Files and Assess Together
```bash
curl -X POST http://localhost:3001/api/trust/assess-with-upload \
  -F "documents=@mobile-bill.pdf" \
  -F "documents=@utility-bill.pdf" \
  -F "assessmentData={
    \"purpose\": \"medium\",
    \"mobile\": {
      \"simDuration\": \"more_than_2_years\",
      \"rechargeRegularity\": \"very_regular\",
      \"usageConsistency\": \"stable\"
    },
    \"utility\": {
      \"onTimePayment\": \"always\",
      \"delayFrequency\": \"rarely\",
      \"billPredictability\": \"consistent\"
    },
    \"community\": {
      \"groupParticipation\": \"active\",
      \"sharedResponsibility\": \"high\",
      \"disputeHistory\": \"clear\"
    },
    \"evidence\": [],
    \"loanExperience\": \"No previous loans\",
    \"financial\": {
      \"employmentType\": \"full_time\",
      \"incomeRange\": \"30000-50000\",
      \"incomeStability\": \"stable\"
    },
    \"assets\": {
      \"property\": false,
      \"fixedDeposits\": true,
      \"collateralWillingness\": true
    }
  }" \
  -F "userId=test-user-combined"
```

## 5. Supabase Direct API Tests

**Note**: Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_KEY` with your actual values.

### Query Trust Assessments
```bash
curl -X GET "YOUR_SUPABASE_URL/rest/v1/trust_assessments?select=*&limit=10" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Query File Uploads
```bash
curl -X GET "YOUR_SUPABASE_URL/rest/v1/file_uploads?select=*&limit=10" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Trust Band Analytics
```bash
curl -X GET "YOUR_SUPABASE_URL/rest/v1/trust_assessment_analytics?select=*" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Filter by Trust Band
```bash
curl -X GET "YOUR_SUPABASE_URL/rest/v1/trust_assessments?trust_band=eq.T3&select=request_id,trust_band,created_at" \
  -H "apikey: YOUR_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json"
```

## 6. Legacy Evaluation API Tests

### Legacy Full Evaluation
```bash
curl -X POST http://localhost:3001/api/evaluate/full \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

## Expected Response Formats

### Successful Trust Assessment Response
```json
{
  "trustBand": "T3",
  "interpretation": "Developing trust with consistent behavioral patterns",
  "traditionalAlignment": "650-699",
  "reasoning": [
    "Long-term mobile stability demonstrated",
    "Consistent mobile recharge pattern",
    "Excellent utility payment history"
  ],
  "metadata": {
    "assessment_type": "behavioral-trust",
    "generated_at": "2024-12-25T10:30:00.000Z",
    "version": "v1"
  }
}
```

### Successful File Upload Response
```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "files": [
    {
      "name": "utility-bill.pdf",
      "type": "application/pdf",
      "months": 3,
      "url": "https://your-project.supabase.co/storage/v1/object/sign/...",
      "uploadedAt": "2024-12-25T10:30:00.000Z"
    }
  ],
  "timestamp": "2024-12-25T10:30:00.000Z",
  "request_id": "uuid-here"
}
```

### Error Response Format
```json
{
  "error": "Validation Error",
  "message": "Invalid request format",
  "details": [
    {
      "field": "purpose",
      "message": "Invalid enum value. Expected 'small' | 'medium' | 'large' | 'upgrade'"
    }
  ],
  "timestamp": "2024-12-25T10:30:00.000Z",
  "request_id": "uuid-here"
}
```

## Testing Tips

1. **Start with health checks** to ensure the backend is running
2. **Test file uploads** before combined requests
3. **Use different user IDs** to separate test data
4. **Check Supabase dashboard** to verify data is being stored
5. **Monitor backend logs** for detailed error information
6. **Test validation errors** to ensure proper error handling

## Troubleshooting

- **Connection refused**: Backend not running or wrong port
- **404 errors**: Check endpoint URLs and paths
- **File upload fails**: Check file types and sizes (max 10MB)
- **Validation errors**: Check request format against schema
- **Supabase errors**: Verify credentials and database schema
# Test TrustWeave API
Write-Host "Testing TrustWeave API..." -ForegroundColor Green

# Test data
$testData = @{
    purpose = "medium"
    mobile = @{
        simDuration = "more_than_2_years"
        rechargeRegularity = "very_regular"
        usageConsistency = "very_stable"
    }
    utility = @{
        onTimePayment = "always"
        delayFrequency = "never"
        billPredictability = "very_consistent"
    }
    community = @{
        groupParticipation = "very_active"
        sharedResponsibility = "high"
        disputeHistory = "clear"
    }
    evidence = @()
    loanExperience = "never"
    financial = @{
        employmentType = "government"
        incomeRange = "30k-50k"
        incomeStability = "very_stable"
    }
    assets = @{
        property = $false
        fixedDeposits = $true
        collateralWillingness = $true
    }
} | ConvertTo-Json -Depth 10

try {
    Write-Host "Sending request to API..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/trust/assess" -Method POST -Body $testData -ContentType "application/json"
    
    Write-Host "✅ API Response:" -ForegroundColor Green
    Write-Host "Trust Band: $($response.trustBand)" -ForegroundColor Cyan
    Write-Host "Interpretation: $($response.interpretation)" -ForegroundColor Cyan
    Write-Host "Traditional Alignment: $($response.traditionalAlignment)" -ForegroundColor Cyan
    Write-Host "Reasoning: $($response.reasoning -join ', ')" -ForegroundColor Cyan
    
    if ($response.metadata) {
        Write-Host "`n📊 Metadata:" -ForegroundColor Blue
        Write-Host "Assessment Type: $($response.metadata.assessment_type)" -ForegroundColor Cyan
        Write-Host "Version: $($response.metadata.version)" -ForegroundColor Cyan
        
        if ($response.metadata.assessment_type -eq "ai-powered-trust") {
            Write-Host "`n🎉 AI Agents are working correctly!" -ForegroundColor Green
        } elseif ($response.metadata.assessment_type -eq "fallback-basic") {
            Write-Host "`n⚠️ Using fallback assessment - AI agents may not be working" -ForegroundColor Yellow
            Write-Host "Check your Gemini API key and server logs" -ForegroundColor Yellow
        }
    }
    
} catch {
    Write-Host "`n❌ API Test Failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Message -like "*connection*") {
        Write-Host "`n💡 Solution: Make sure the backend server is running" -ForegroundColor Yellow
        Write-Host "Run: npm run dev" -ForegroundColor Yellow
    }
}
@echo off
echo Testing TrustWeave API...
curl -X POST http://localhost:3001/api/trust/health
echo.
echo.
echo Testing trust assessment...
curl -X POST http://localhost:3001/api/trust/assess ^
  -H "Content-Type: application/json" ^
  -d "{\"purpose\":\"medium\",\"mobile\":{\"simDuration\":\"more_than_2_years\",\"rechargeRegularity\":\"very_regular\",\"usageConsistency\":\"very_stable\"},\"utility\":{\"onTimePayment\":\"always\",\"delayFrequency\":\"never\",\"billPredictability\":\"very_consistent\"},\"community\":{\"groupParticipation\":\"very_active\",\"sharedResponsibility\":\"high\",\"disputeHistory\":\"clear\"},\"evidence\":[],\"loanExperience\":\"never\",\"financial\":{\"employmentType\":\"government\",\"incomeRange\":\"30k-50k\",\"incomeStability\":\"very_stable\"},\"assets\":{\"property\":false,\"fixedDeposits\":true,\"collateralWillingness\":true}}"
pause
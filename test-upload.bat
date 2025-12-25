@echo off
echo 🧪 Testing TrustWeave File Upload

REM Create a test file
echo This is a test file for TrustWeave upload > test-file.txt

echo.
echo 📤 Testing backend health...
curl -s http://localhost:3001/health

echo.
echo.
echo 📤 Testing file upload...
curl -X POST http://localhost:3001/api/trust/upload-evidence ^
  -F "documents=@test-file.txt" ^
  -F "userId=test-user-batch" ^
  -v

echo.
echo.
echo 🧹 Cleaning up...
del test-file.txt

echo.
echo ✅ Test completed! Check the output above for results.
pause
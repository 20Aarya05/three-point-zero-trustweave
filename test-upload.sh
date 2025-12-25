#!/bin/bash

# Create a test file
echo "This is a test document for TrustWeave" > test-file.txt

echo "🧪 Testing file upload to TrustWeave backend..."

# Test file upload
curl -X POST http://localhost:3001/api/trust/upload-evidence \
  -F "documents=@test-file.txt" \
  -F "userId=test-user-curl" \
  -v

echo -e "\n\n🧹 Cleaning up..."
rm test-file.txt

echo "✅ Test completed!"
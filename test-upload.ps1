# PowerShell script to test file upload
Write-Host "🧪 Testing TrustWeave File Upload" -ForegroundColor Green

# Create a test file
$testContent = "Test file for TrustWeave upload - $(Get-Date)"
$testFile = "test-upload.txt"
Set-Content -Path $testFile -Value $testContent

Write-Host "📤 Testing file upload..." -ForegroundColor Yellow

try {
    # Create multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"documents`"; filename=`"$testFile`"",
        "Content-Type: text/plain$LF",
        $testContent,
        "--$boundary",
        "Content-Disposition: form-data; name=`"userId`"$LF",
        "test-user-powershell",
        "--$boundary--$LF"
    ) -join $LF

    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/trust/upload-evidence" `
        -Method Post `
        -ContentType "multipart/form-data; boundary=$boundary" `
        -Body $bodyLines

    Write-Host "✅ Upload successful!" -ForegroundColor Green
    Write-Host "📋 Response:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 3

    if ($response.files -and $response.files.Count -gt 0) {
        Write-Host "🎉 File uploaded successfully to Supabase!" -ForegroundColor Green
        Write-Host "📁 Check your Supabase 'Files' bucket > uploads folder" -ForegroundColor Yellow
    }

} catch {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# Clean up
Remove-Item $testFile -ErrorAction SilentlyContinue
Write-Host "🧹 Cleaned up test file" -ForegroundColor Gray
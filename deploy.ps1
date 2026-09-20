# Development deployment. Complete public-launch requirements in handoff/05_SECURE_AI_SETUP.md.
param([string]$StackName='pagebhasha')
$ErrorActionPreference='Stop'
Set-Location -LiteralPath $PSScriptRoot
sam validate --lint
if ($LASTEXITCODE -ne 0) { throw 'SAM validation failed.' }
sam build
if ($LASTEXITCODE -ne 0) { throw 'SAM build failed.' }
sam deploy --guided --stack-name $StackName
if ($LASTEXITCODE -ne 0) { throw 'Deployment failed.' }
$stackJson=aws cloudformation describe-stacks --stack-name $StackName --output json
if ($LASTEXITCODE -ne 0) { throw 'Cannot read stack outputs.' }
$outputs=($stackJson | ConvertFrom-Json).Stacks[0].Outputs
$bucketName=($outputs | Where-Object OutputKey -eq 'FrontendBucketName').OutputValue
$apiUrl=($outputs | Where-Object OutputKey -eq 'ApiUrl').OutputValue
$siteUrl=($outputs | Where-Object OutputKey -eq 'WebsiteURL').OutputValue
if (-not $bucketName -or -not $apiUrl -or -not $siteUrl) { throw 'Missing deployment outputs.' }

Write-Host "Preparing frontend files for S3 deployment..."
Remove-Item -Path "dist" -Recurse -ErrorAction SilentlyContinue
Copy-Item -Path "web" -Destination "dist" -Recurse
(Get-Content "dist\main.js" -Raw) -replace "'/api/", "'$apiUrl" | Set-Content "dist\main.js"
(Get-Content "dist\study-tools.js" -Raw) -replace "'/api/", "'$apiUrl" | Set-Content "dist\study-tools.js"

Write-Host "Uploading frontend to S3..."
aws s3 sync dist/ "s3://$bucketName/" --cache-control "public,max-age=300" --exclude ".*"
if ($LASTEXITCODE -ne 0) { throw 'Frontend upload failed.' }

Write-Host "------------------------------------------------"
Write-Host "Deployment completed successfully!"
Write-Host "Your website is live at: $siteUrl"
Write-Host "------------------------------------------------"

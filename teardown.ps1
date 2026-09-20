# PageBhasha — Teardown AWS resources
# Empties S3 bucket and deletes the CloudFormation stack.
# Usage: .\teardown.ps1

$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

$stackName = 'pagebhasha'

Write-Host "`n=== PageBhasha AWS Teardown ===" -ForegroundColor Yellow

# Step 1: Empty the S3 bucket (CloudFormation cannot delete non-empty buckets)
Write-Host "`n[1/2] Emptying S3 bucket..." -ForegroundColor Cyan
$bucketName = (aws cloudformation describe-stacks `
    --stack-name $stackName `
    --query "Stacks[0].Outputs[?OutputKey=='FrontendBucketName'].OutputValue" `
    --output text 2>$null).Trim()

if ($bucketName) {
    aws s3 rm "s3://$bucketName" --recursive
    Write-Host "Bucket $bucketName emptied." -ForegroundColor Green
} else {
    Write-Host "No bucket found or stack already deleted." -ForegroundColor Yellow
}

# Step 2: Delete the CloudFormation stack
Write-Host "`n[2/2] Deleting CloudFormation stack '$stackName'..." -ForegroundColor Cyan
aws cloudformation delete-stack --stack-name $stackName
aws cloudformation wait stack-delete-complete --stack-name $stackName

Write-Host "`n=== Teardown complete. All PageBhasha AWS resources removed. ===`n" -ForegroundColor Green

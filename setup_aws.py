import boto3
import uuid
import time
import os
from botocore.exceptions import ClientError
from pathlib import Path

def load_env():
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        for line in env_path.read_text(encoding='utf-8').splitlines():
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip()

def setup_aws():
    load_env()
    print("Setting up AWS resources for PageBhasha...")
    
    # 1. Create S3 Bucket
    s3 = boto3.client('s3')
    region = boto3.session.Session().region_name or 'us-east-1'
    bucket_name = f"pagebhasha-lessons-{uuid.uuid4().hex[:8]}"
    
    try:
        print(f"\nCreating S3 Bucket: {bucket_name}")
        if region == 'us-east-1':
            s3.create_bucket(Bucket=bucket_name)
        else:
            s3.create_bucket(
                Bucket=bucket_name,
                CreateBucketConfiguration={'LocationConstraint': region}
            )
        print("✅ S3 Bucket created successfully!")
    except ClientError as e:
        print(f"❌ Failed to create S3 bucket: {e}")
        return

    # 2. Create DynamoDB Table
    dynamodb = boto3.client('dynamodb')
    table_name = "PageBhashaQnA"
    
    try:
        print(f"\nCreating DynamoDB Table: {table_name}")
        dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'SessionId', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'Timestamp', 'KeyType': 'RANGE'}  # Sort key
            ],
            AttributeDefinitions=[
                {'AttributeName': 'SessionId', 'AttributeType': 'S'},
                {'AttributeName': 'Timestamp', 'AttributeType': 'S'}
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        print("⏳ Waiting for table to become active (this takes about 10-20 seconds)...")
        waiter = dynamodb.get_waiter('table_exists')
        waiter.wait(TableName=table_name)
        print("✅ DynamoDB Table created successfully!")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"✅ DynamoDB Table '{table_name}' already exists.")
        else:
            print(f"❌ Failed to create DynamoDB table: {e}")

    print("\n" + "="*50)
    print("🎉 AWS Setup Complete!")
    print("Please add the following to your .env file:")
    print(f"AWS_S3_BUCKET_NAME={bucket_name}")
    print(f"AWS_DYNAMODB_TABLE_NAME={table_name}")
    print("="*50 + "\n")

if __name__ == "__main__":
    setup_aws()

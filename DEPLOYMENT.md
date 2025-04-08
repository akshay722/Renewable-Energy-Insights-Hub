# Renewable Energy Insights Hub - AWS Deployment Guide

This guide explains how to deploy the application to AWS using GitHub Actions and Terraform, designed to stay within the AWS Free Tier limits.

## Architecture Overview

- **Frontend**: S3 + CloudFront (Static website hosting with HTTPS)
- **Backend**: Elastic Beanstalk with Python (FastAPI application)
- **Database**: RDS MySQL (Free tier db.t3.micro)

## Prerequisites

1. AWS Account with Free Tier eligibility
2. GitHub account for CI/CD

## Step 1: AWS Setup

1. **Create IAM User**:
   - Sign in to the AWS Management Console
   - Go to IAM service
   - Create a new user with programmatic access
   - Attach these permissions:
     - `AmazonS3FullAccess`
     - `AmazonRDSFullAccess`
     - `AWSElasticBeanstalkFullAccess`
     - `CloudFrontFullAccess`
   - Save the Access Key ID and Secret Access Key

2. **Create S3 Buckets**:
   - Create a bucket for the frontend (`renewable-energy-frontend-*`)
   - Create a bucket for Elastic Beanstalk (`renewable-energy-app-versions-*`)

## Step 2: GitHub Setup

Add these secrets to your GitHub repository:

- `AWS_ACCESS_KEY_ID`: Your IAM user's access key
- `AWS_SECRET_ACCESS_KEY`: Your IAM user's secret key
- `S3_BUCKET`: Your frontend S3 bucket name
- `EB_BUCKET`: Your Elastic Beanstalk deployment bucket
- `DB_PASSWORD`: Database password

## Step 3: Terraform Deployment

1. **Initialize Terraform**:
   ```bash
   cd terraform
   terraform init
   ```

2. **Create terraform.tfvars**:
   ```
   aws_region = "us-east-1"
   frontend_bucket_name = "your-s3-bucket-name"
   db_password = "your-secure-password"
   ```

3. **Deploy Infrastructure**:
   ```bash
   terraform apply -var-file=terraform.tfvars
   ```

## Step 4: Database Initialization

The database is set up for direct import of your data:

1. **Get RDS Endpoint from Terraform Output**:
   ```bash
   DB_ENDPOINT=$(terraform output -raw database_endpoint)
   DB_USER=$(terraform output -raw rds_username)
   DB_NAME=$(terraform output -raw database_name)
   ```

2. **Import Data to RDS**:
   ```bash
   # Use the init-db.sql file to populate the database
   mysql -h $DB_ENDPOINT -u $DB_USER -p $DB_NAME < init-db.sql
   ```

3. **Security Update After Import** (Optional):
   After you've imported your data, you may want to secure the database by removing the public access:
   
   Edit the main.tf file:
   - Change `publicly_accessible = true` to `publicly_accessible = false`
   - Remove the temporary ingress rule that allows access from anywhere (`cidr_blocks = ["0.0.0.0/0"]`)
   - Keep the rule that allows access from Elastic Beanstalk
   
   Then apply changes:
   ```bash
   terraform apply -var-file=terraform.tfvars
   ```
   
   The Elastic Beanstalk application will still be able to connect to the database through the security group rule that allows traffic from the Elastic Beanstalk security group.

## Step 5: CI/CD Deployment

The GitHub Actions workflow will automatically:
1. Build and deploy the frontend to S3
2. Package and deploy the backend to Elastic Beanstalk

This happens automatically when you push to the main branch.

## Security Features

This deployment includes HTTPS security:

1. **Frontend HTTPS** via CloudFront:
   - CloudFront provides HTTPS with its default domain
   - All HTTP requests redirect to HTTPS

2. **Backend Security**:
   - Database temporarily accessible for import
   - Security groups allow initial import and deployment

## Important Security Notes

1. **Sensitive Files**:
   - Never commit `terraform.tfvars` to Git - it contains sensitive database credentials
   - Use the provided `terraform.tfvars.example` as a template 
   - Store AWS credentials as GitHub Secrets, not in code

2. **Database Security**:
   - After initial setup, make the database private by setting `publicly_accessible = false`
   - Remove the CIDR block rule allowing access from anywhere (0.0.0.0/0)
   - Consider changing the default database password after deployment

3. **Security Best Practices**:
   - Review the `.gitignore` file to ensure sensitive files are excluded
   - Consider using AWS Secrets Manager for database credentials in a production environment
   - Rotate AWS access keys periodically

## Cleaning Up Resources

When you're done with the assignment, clean up to avoid charges:

```bash
cd terraform
terraform destroy -var-file=terraform.tfvars
```

## Troubleshooting

1. **Frontend Not Loading**:
   - Check CloudFront distribution status
   - Verify S3 bucket has the correct files

2. **Backend Connection Issues**:
   - Check Elastic Beanstalk health
   - Verify security group settings

3. **Database Connection Errors**:
   - Confirm RDS instance is running
   - Check database credentials in environment variables

4. **Database Import Issues**:
   - Ensure MySQL client is installed on your computer
   - Check that the init-db.sql file is correctly formatted
   - Confirm network connectivity to the RDS instance
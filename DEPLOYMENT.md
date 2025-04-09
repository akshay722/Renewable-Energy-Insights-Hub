# Renewable Energy Insights Hub - AWS Deployment Guide

This guide provides comprehensive instructions for deploying the Renewable Energy Insights Hub to AWS Free Tier services using Terraform.

## Architecture Overview

- **Frontend**: S3 bucket with CloudFront distribution (HTTPS-enabled static website)
- **Backend**: Elastic Beanstalk running Python FastAPI application
- **Database**: RDS MySQL instance (db.t3.micro)
- **Security**: IAM roles, security groups, and HTTPS configuration
- **HTTPS for Backend**: Manually configured through CloudFront distribution after initial deployment

## Prerequisites

1. AWS Account with Free Tier eligibility
2. AWS CLI installed and configured
3. Terraform CLI (v1.0.0+)

## Terraform Deployment

The recommended deployment method is using Terraform to provision all AWS resources consistently.

1. **Initialize Terraform**:

   ```bash
   cd terraform
   terraform init
   ```

2. **Configure Deployment Variables**:
   Create a `terraform.tfvars` file with your configuration:

   ```
   aws_region = "us-east-1"
   app_name = "renewable-energy-application"
   env_name = "production-environment"
   frontend_bucket_name = "renewable-energy-frontend"
   db_name = "renewable_energy_db_sql"
   db_user = "admin"
   db_password = "YourSecurePassword"
   ```

3. **Deploy Infrastructure**:

   ```bash
   terraform plan -var-file=terraform.tfvars
   terraform apply -var-file=terraform.tfvars
   ```

4. **Store Outputs for Reference**:

   ```bash
   # Get key infrastructure details
   terraform output

   # Save specific outputs to variables
   FRONTEND_URL=$(terraform output -raw frontend_url)
   BACKEND_URL=$(terraform output -raw backend_url)
   DB_ENDPOINT=$(terraform output -raw database_endpoint)
   ```

## Database Initialization

After Terraform creates the RDS instance, you'll need to import the initial schema and data:

1. **Import Database Schema and Seed Data**:

   ```bash
   # Using outputs from Terraform
   DB_ENDPOINT=$(terraform output -raw database_endpoint)
   DB_USER=$(terraform output -raw rds_username)
   DB_NAME=$(terraform output -raw database_name)

   # Import the initial database schema and data
   mysql -h $DB_ENDPOINT -u $DB_USER -p $DB_NAME < init-db.sql
   ```

2. **Secure Database Access** (After import):

   For production use, you should secure the database by updating the Terraform configuration:

   ```
   # In main.tf, change these settings
   publicly_accessible = false  # Was temporarily true for data import

   # Remove the public access security group rule
   # Only keep the rule that allows access from Elastic Beanstalk
   ```

   Then apply the changes:

   ```bash
   terraform apply -var-file=terraform.tfvars
   ```

## Manual Deployment Alternative

While Terraform is recommended, you can also deploy manually:

### Backend Deployment

1. **Configure Environment**:
   Create a `.env.production` file in the backend directory:

   ```
   DATABASE_URL=mysql+pymysql://admin:YourPassword@your-db-endpoint.rds.amazonaws.com:3306/renewable_energy_db_sql
   SECRET_KEY=your_production_secret_key
   ALLOW_ORIGINS=https://your-cloudfront-domain.cloudfront.net
   ```

2. **Deploy with Elastic Beanstalk CLI**:

   ```bash
   cd backend
   pip install awsebcli
   eb init renewable-energy-backend --platform python-3.9
   eb create production-environment
   ```

### Frontend Deployment

1. **Build the Frontend**:

   ```bash
   cd frontend
   npm install
   # Update API endpoint in src/services/api.ts to point to your Elastic Beanstalk URL
   npm run build
   ```

2. **Deploy to S3 and Configure CloudFront**:

   ```bash
   # Create S3 bucket
   aws s3 mb s3://renewable-energy-frontend

   # Upload build files
   aws s3 sync dist/ s3://renewable-energy-frontend --acl public-read

   # Create CloudFront distribution (simplified command)
   aws cloudfront create-distribution --origin-domain-name renewable-energy-frontend.s3.amazonaws.com
   ```

## Production Security Considerations

1. **Database Security**:

   - Set RDS `publicly_accessible = false` after initial data import
   - Configure security groups to only allow traffic from Elastic Beanstalk

2. **HTTPS and Security Headers**:

   - CloudFront provides HTTPS for the frontend automatically
   - For the backend API, create a separate CloudFront distribution manually after deployment:
     - Add the Elastic Beanstalk endpoint as a custom origin
     - Configure proper cache behaviors for API endpoints
     - Set up a custom domain with SSL certificate (optional)
   - Configure Content Security Policy (CSP) headers
   - Set CORS headers on the backend

3. **Secrets Management**:
   - Store secrets in environment variables, not in code
   - Consider AWS Secrets Manager for production credentials

## Cleaning Up Resources

To avoid AWS charges when finished:

```bash
# Using Terraform (recommended)
cd terraform
terraform destroy -var-file=terraform.tfvars

# Or manually using AWS CLI
aws cloudfront delete-distribution --id <distribution-id> --if-match <etag>
aws s3 rm s3://renewable-energy-frontend --recursive
aws s3 rb s3://renewable-energy-frontend
eb terminate production-environment
aws rds delete-db-instance --db-instance-identifier renewable-energy-db --skip-final-snapshot
```

## Troubleshooting Common Issues

1. **Database Connection Errors**:

   - Verify security group rules allow traffic from Elastic Beanstalk
   - Check that DATABASE_URL environment variable is correct

2. **Frontend Access Issues**:

   - Ensure CloudFront distribution is enabled
   - Check S3 bucket policy allows public read access
   - Verify CloudFront error pages redirect to index.html for SPA routing

3. **API Connection Problems**:
   - Check CORS configuration in the backend
   - Ensure API endpoint URL is correctly set in the frontend
   - Verify that HTTPS is properly configured

# Renewable Energy Insights Hub - AWS Deployment Guide

This document outlines the steps to deploy the Renewable Energy Insights Hub application to AWS.

## Architecture Overview

The application is deployed using the following AWS services:

- **Frontend**: S3 + CloudFront (Static website hosting with CDN)
- **Backend**: Elastic Beanstalk (FastAPI application)
- **Database**: Amazon RDS for MySQL
- **Infrastructure**: CloudFormation for infrastructure as code

## Prerequisites

Before deploying, ensure you have:

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. GitHub or GitLab account for CI/CD
4. Domain name (optional but recommended for production)

## AWS Resources Setup

### Option 1: Using CloudFormation Template

1. Login to your AWS account
2. Navigate to CloudFormation
3. Click "Create stack" > "With new resources"
4. Upload the `cloudformation-template.yml` file
5. Fill in the parameters:
   - Environment: Production, Staging, or Development
   - DBUsername: Admin username for RDS
   - DBPassword: Secure password for RDS
   - DomainName: Your domain name (if applicable)
6. Create the stack and wait for completion

### Option 2: Manual Setup

Follow these steps if you prefer to set up resources manually:

#### 1. Database Setup (RDS)

1. Create an RDS MySQL 8.0 instance
2. Note the endpoint, username, password, and database name
3. Configure security groups to allow connections from Elastic Beanstalk

#### 2. Backend Setup (Elastic Beanstalk)

1. Create a new Elastic Beanstalk application
2. Create an environment using Python 3.10 platform
3. Configure environment properties:
   - `DB_HOST`: RDS endpoint
   - `DB_PORT`: RDS port (usually 3306)
   - `DB_USER`: Database username
   - `DB_PASSWORD`: Database password
   - `DB_NAME`: Database name
   - `ENVIRONMENT`: "production"
   - `SECRET_KEY`: A secure random string
   - `FRONTEND_URL`: CloudFront distribution URL

#### 3. Frontend Setup (S3 + CloudFront)

1. Create an S3 bucket for static hosting
2. Create a CloudFront distribution pointing to the S3 bucket
3. Configure the distribution:
   - Origin: S3 bucket
   - Behaviors: Redirect HTTP to HTTPS
   - Error pages: 404 -> /index.html (200)
   - SSL: Use ACM certificate if you have a custom domain

## CI/CD Setup

### GitHub Actions

The repository includes GitHub Actions workflows for CI/CD:

1. Add the following secrets to your GitHub repository:

   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `EB_ENVIRONMENT_URL`: Elastic Beanstalk environment URL
   - `S3_BUCKET`: Frontend S3 bucket name
   - `CLOUDFRONT_DISTRIBUTION_ID`: CloudFront distribution ID

2. The CI/CD pipeline automatically:
   - Runs tests on pull requests
   - Deploys backend to Elastic Beanstalk on merges to main
   - Builds and deploys frontend to S3 on merges to main
   - Invalidates CloudFront cache

## Database Migration

Initial database setup:

1. The database schema will be created automatically on first deployment
2. For seeding data, connect to the Elastic Beanstalk instance and run:
   ```
   cd /var/app/current
   python -m seed_database
   ```

## SSL/HTTPS Configuration

HTTPS is enabled automatically:

- CloudFront provides HTTPS for the frontend
- Elastic Beanstalk is configured with HTTPS using an ACM certificate

## Monitoring and Logging

- Access EC2 instance logs in Elastic Beanstalk console
- Configure CloudWatch for advanced monitoring
- Set up CloudWatch Alarms for important metrics

## Troubleshooting

Common issues:

1. **Connection errors**: Check security groups and network ACLs
2. **Deployment failures**: Check Elastic Beanstalk logs
3. **Frontend not updating**: Verify CloudFront cache invalidation

## Estimated Costs

Monthly estimated costs (US East region):

- RDS MySQL t3.micro: ~$15-30/month
- Elastic Beanstalk (t3.micro): ~$15-30/month
- S3 + CloudFront: ~$1-5/month (depends on traffic)
- Total: ~$31-65/month for a basic setup

## Next Steps

- Set up proper DNS with Route 53
- Configure backups for RDS
- Set up monitoring and alerting
- Implement auto-scaling for Elastic Beanstalk

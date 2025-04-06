# Renewable Energy Insights Hub - AWS Free Tier Deployment Guide

This document outlines the steps to deploy the Renewable Energy Insights Hub application to AWS using resources eligible for the AWS Free Tier.

## Free Tier Benefits

This deployment is designed to stay within AWS Free Tier limits:

- **EC2**: Uses t2.micro instances (750 hours/month free)
- **RDS**: Uses db.t2.micro single-AZ (750 hours/month free)
- **S3**: Minimal storage with lifecycle policies (5GB free)
- **CloudFront**: Optimized caching (50GB transfer + 2M requests free)

## Architecture Overview

The application is deployed using the following AWS services:

- **Frontend**: S3 + CloudFront (Static website hosting with CDN)
- **Backend**: Elastic Beanstalk with Single Instance (FastAPI application)
- **Database**: Amazon RDS for MySQL (Single AZ)
- **Infrastructure**: CloudFormation for infrastructure as code

## Prerequisites

Before deploying, ensure you have:

1. AWS Account with Free Tier eligibility
2. AWS CLI installed and configured
3. GitHub or GitLab account for CI/CD
4. Domain name (optional but recommended for production)

## AWS Resources Setup

### Option 1: Using CloudFormation Template (Recommended)

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

1. Create an RDS MySQL 8.0 db.t2.micro instance (Free Tier eligible)
2. **Important**: Disable Multi-AZ deployment to stay within Free Tier
3. Set storage to 20GB general purpose SSD
4. Configure security groups to allow connections from Elastic Beanstalk

#### 2. Backend Setup (Elastic Beanstalk)

1. Create a new Elastic Beanstalk application
2. Create a SingleInstance environment (not Load Balanced) using t2.micro
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
2. Set up lifecycle rules to delete old versions quickly
3. Create a CloudFront distribution with PriceClass_100
4. Configure proper caching (TTL) to minimize requests

## Cost Control Measures

To ensure you stay within the Free Tier limits:

1. **Set up AWS Budgets and Billing Alarms**

   - Create a budget with $1 threshold
   - Set up alerts at 80% of Free Tier usage

2. **Monitor Usage**

   - Regularly check the AWS Free Tier usage dashboard
   - Watch for services approaching limits

3. **Clean up Unused Resources**
   - Delete the CloudFormation stack when not in use
   - Or stop the RDS instance when not actively developing

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
- Configure CloudWatch basic monitoring (free tier eligible)
- Avoid detailed monitoring which incurs costs

## Troubleshooting

Common issues:

1. **Connection errors**: Check security groups and network ACLs
2. **Deployment failures**: Check Elastic Beanstalk logs
3. **Frontend not updating**: Verify CloudFront cache invalidation

## Estimated Costs

Monthly estimated costs with Free Tier eligibility:

- RDS MySQL db.t2.micro (Single AZ): $0 for first 12 months (Free Tier)
- Elastic Beanstalk (t2.micro): $0 for first 12 months (Free Tier)
- S3 + CloudFront: $0-1/month with modest traffic (Free Tier)
- Total: **$0-1/month** for first 12 months with proper configuration

## Cleaning Up

If you want to avoid any potential charges:

1. Delete the CloudFormation stack when done with the assignment
2. Verify all resources are terminated in the AWS Console
3. Check AWS Billing dashboard for any unexpected charges

## Next Steps After Free Tier Period

After the 12-month Free Tier period:

- Consider Reserved Instances for continued cost savings
- Evaluate if you need to scale up any resources
- Implement auto-scaling for variable workloads

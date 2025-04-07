# GitHub Actions Workflows

This directory contains the automated deployment workflows for the Renewable Energy Insights Hub.

## Workflows

### 1. Deploy Infrastructure (`terraform-deploy.yml`)

Creates and maintains AWS infrastructure using Terraform:

- S3 bucket for frontend
- Elastic Beanstalk for backend
- RDS MySQL database
- Security groups and IAM roles

**Triggers:** Changes to `terraform/` directory or manual workflow dispatch

### 2. Deploy Application (`deploy-application.yml`)

Deploys application code to existing infrastructure:

- Verifies database connection
- Deploys backend code to Elastic Beanstalk
- Builds and deploys frontend to S3

**Triggers:** Changes to application code or manual workflow dispatch

### 3. Budget Alert (`budget-alert.yml`)

Monitors AWS costs to ensure Free Tier compliance:

- Runs daily check of current AWS spending
- Warns if approaching 80% of budget

**Triggers:** Daily schedule or manual workflow dispatch

## Required Secrets

- `AWS_ROLE_TO_ASSUME`: ARN of AWS IAM role with deployment permissions
- `DB_PASSWORD`: MySQL database password

## AWS IAM Role Requirements

Ensure the AWS role has permissions for:

- S3
- Elastic Beanstalk
- RDS
- IAM
- CloudFormation
- Cost Explorer

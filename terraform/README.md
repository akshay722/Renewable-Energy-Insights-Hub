# Terraform Infrastructure for Renewable Energy Insights Hub

This directory contains the Terraform configuration for deploying the Renewable Energy Insights Hub on AWS.

## Infrastructure Overview

The Terraform configuration creates the following AWS resources:

- S3 bucket for hosting the frontend
- Elastic Beanstalk environment for the backend API
- IAM roles and policies for Elastic Beanstalk
- CORS configuration for the API

## Prerequisites

- AWS account with appropriate permissions
- Terraform 1.2.0 or later
- AWS CLI configured with credentials

## Local Setup and Deployment

1. Update the variables in `variables.tf` to match your desired configuration.

2. Initialize Terraform:

   ```bash
   terraform init
   ```

3. Plan the deployment:

   ```bash
   terraform plan
   ```

4. Apply the changes:

   ```bash
   terraform apply
   ```

5. To destroy the infrastructure when no longer needed:
   ```bash
   terraform destroy
   ```

## GitHub Actions Integration

This repository includes GitHub Actions workflows for automating the deployment:

- `terraform-deploy.yml`: Manages the infrastructure using these Terraform files
- `deploy-application.yml`: Deploys the application code to the infrastructure
- `budget-alert.yml`: Monitors AWS spending to stay within the Free Tier limits

## Required GitHub Secrets

Set the following secrets in your GitHub repository:

- `AWS_ROLE_TO_ASSUME`: ARN of an IAM role with permissions to deploy resources
- `DB_PASSWORD`: Password for the database

## Free Tier Compatibility

This configuration is designed to stay within AWS Free Tier limits by:

- Using t2.micro instances for Elastic Beanstalk
- Configuring single-instance environments (no load balancer)
- Setting up budget alerts

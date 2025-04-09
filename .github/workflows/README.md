# GitHub Actions Workflows

This directory contains the automated deployment workflow for the Renewable Energy Insights Hub.

## Main Deployment Workflow

### `deploy.yml`

This is the primary workflow that handles the complete deployment process for both frontend and backend components.

#### Workflow Triggers

- **Automatic**: Runs on push to the `main` branch
- **Manual**: Can be triggered via workflow_dispatch in GitHub Actions UI

#### Deployment Steps

1. **Setup and Authentication**

   - Checks out the repository code
   - Configures AWS credentials using GitHub Secrets

2. **Frontend Deployment**

   - Sets up Node.js environment (v18)
   - Installs frontend dependencies
   - Builds the React application
   - Deploys built assets to S3
   - Intelligently identifies and invalidates the associated CloudFront distribution

3. **Backend Deployment**
   - Sets up Python environment (v3.10)
   - Installs backend dependencies
   - Creates a deployment ZIP package
   - Uploads the package to the deployment S3 bucket
   - Creates a new Elastic Beanstalk application version
   - Updates the Elastic Beanstalk environment with environment variables

#### Environment Configuration

The workflow dynamically configures environment variables for the backend service:

- Database connection details
- Environment-specific settings
- CORS configurations
- Frontend URL for cross-service communication

## Required GitHub Secrets

For the workflow to function properly, these secrets must be configured:

- `AWS_ACCESS_KEY_ID`: AWS access key with deployment permissions
- `AWS_SECRET_ACCESS_KEY`: AWS secret key
- `S3_BUCKET`: S3 bucket name for frontend assets
- `EB_BUCKET`: S3 bucket for Elastic Beanstalk deployments
- `APP_NAME`: Elastic Beanstalk application name
- `ENV_NAME`: Elastic Beanstalk environment name
- `DB_PASSWORD`: Database password

## Integration with Infrastructure

This workflow assumes AWS infrastructure has been provisioned using Terraform as described in the `/terraform` directory. The workflow does not create infrastructure, but deploys application code to existing resources.

## Monitoring Deployments

Deployment status and logs can be monitored in the GitHub repository's "Actions" tab. Each workflow run provides detailed information about the deployment process and any errors encountered.

# Terraform Deployment for Renewable Energy Insights Hub

This configuration uses AWS Free Tier resources to deploy the full Renewable Energy Insights Hub.

## Quick Start

To avoid security group circular dependency issues, this configuration allows Elastic Beanstalk to create its own security groups.

1. Initialize Terraform:
   ```bash
   terraform init
   ```

2. Add your database password in a `terraform.tfvars` file:
   ```
   db_password = "your-secure-password"
   ```

3. Deploy:
   ```bash
   terraform plan -var-file=terraform.tfvars
   terraform apply -var-file=terraform.tfvars
   ```

4. Import database data (init-db.sql):
   ```bash
   # Get database endpoint
   DB_ENDPOINT=$(terraform output -raw database_endpoint)
   DB_USER=$(terraform output -raw rds_username)
   DB_NAME=$(terraform output -raw database_name)
   
   # Import data
   mysql -h $DB_ENDPOINT -u $DB_USER -p $DB_NAME < ../init-db.sql
   ```

5. After deployment succeeds:
   - Note the security group ID that Elastic Beanstalk created (find it in the AWS Console)
   - Consider adding a specific security group rule for that ID to restrict database access
   - This can be done by modifying the Terraform configuration or directly in the AWS Console

6. Clean up when done:
   ```bash
   terraform destroy -var-file=terraform.tfvars
   ```

## AWS Resources Created

- S3 bucket with CloudFront for frontend (HTTPS enabled)
- Elastic Beanstalk for backend API
- RDS MySQL database with public access for data import
- IAM roles and security groups

## GitHub Actions Integration

The workflow in `.github/workflows/deploy.yml` handles:

1. Building and deploying the frontend to S3
2. Packaging and deploying the backend to Elastic Beanstalk

Add these GitHub Secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `EB_BUCKET`
- `DB_PASSWORD`

## Important Security Notes

### Database Security

The RDS database is initially configured with public access to allow importing data. For production, change:

1. Set `publicly_accessible = false` in the RDS configuration
2. Remove the temporary security group ingress rule that allows access from anywhere
3. Add a specific rule allowing only the Elastic Beanstalk security group to access the database

### Security Group Configuration

This deployment allows Elastic Beanstalk to create its own security groups to avoid circular dependency issues. For better security in production:

1. Identify the security group that Elastic Beanstalk created (in the AWS Console)
2. Add a specific rule to the RDS security group to only allow traffic from that security group
3. Remove the public access rule from the RDS security group

The current configuration uses a public RDS endpoint for simplicity, but your application will still work after restricting access as long as you properly configure the security group rules.

These steps are documented in the DEPLOYMENT.md file.
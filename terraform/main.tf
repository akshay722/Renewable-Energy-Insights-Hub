terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

# Random ID for unique resource naming
resource "random_id" "suffix" {
  byte_length = 4
}

# Default VPC 
data "aws_vpc" "default" {
  default = true
}

# Default subnets
data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# Default security group
data "aws_security_group" "default" {
  name   = "default"
  vpc_id = data.aws_vpc.default.id
}

# S3 bucket for frontend
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name
  
  tags = {
    Name = "Frontend Bucket"
  }
}

# Enable website hosting
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# Allow public access
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

# S3 bucket policy for public read access
resource "aws_s3_bucket_policy" "frontend_policy" {
  bucket = aws_s3_bucket.frontend.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
  
  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

# CloudFront distribution for HTTPS frontend
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket_website_configuration.frontend.website_endpoint
    origin_id   = "S3-${aws_s3_bucket.frontend.bucket}"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.bucket}"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }
  
  # For SPA routing
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }
  
  price_class = "PriceClass_100"
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}

# Security group for RDS without inline rules
resource "aws_security_group" "db_sg" {
  name        = "renewable-db-sg-${random_id.suffix.hex}"
  description = "Allow MySQL traffic"
  vpc_id      = data.aws_vpc.default.id
}

# Allow MySQL from anywhere - temporarily for database import
resource "aws_vpc_security_group_ingress_rule" "db_public" {
  security_group_id = aws_security_group.db_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 3306
  to_port           = 3306
  ip_protocol       = "tcp"
  description       = "Temporary access for database import"
}

# Allow MySQL from Elastic Beanstalk security group
resource "aws_vpc_security_group_ingress_rule" "db_from_eb" {
  security_group_id               = aws_security_group.db_sg.id
  referenced_security_group_id    = aws_security_group.eb_sg.id
  from_port                       = 3306
  to_port                         = 3306
  ip_protocol                     = "tcp"
  description                     = "Allow access from Elastic Beanstalk instances"
}

# Outbound access from RDS
resource "aws_vpc_security_group_egress_rule" "db_outbound" {
  security_group_id = aws_security_group.db_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # All protocols
  description       = "Allow all outbound traffic"
}

# RDS MySQL Database
resource "aws_db_instance" "database" {
  identifier           = "renewable-db-${random_id.suffix.hex}"
  engine               = "mysql"
  engine_version       = "8.0.35"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  db_name              = var.db_name
  username             = var.db_user
  password             = var.db_password
  skip_final_snapshot  = true
  publicly_accessible  = true # Temporarily public for data import
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  
  tags = {
    Name = "RenewableEnergyDB"
  }
}

# We no longer need S3 buckets for DB scripts since we're using direct MySQL import

# Security group for Elastic Beanstalk without inline rules
resource "aws_security_group" "eb_sg" {
  name        = "eb-instance-sg-${random_id.suffix.hex}"
  description = "Security group for Elastic Beanstalk instances"
  vpc_id      = data.aws_vpc.default.id
}

# HTTP ingress rule
resource "aws_vpc_security_group_ingress_rule" "eb_http" {
  security_group_id = aws_security_group.eb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  to_port           = 80
  ip_protocol       = "tcp"
  description       = "Allow HTTP traffic"
}

# HTTPS ingress rule
resource "aws_vpc_security_group_ingress_rule" "eb_https" {
  security_group_id = aws_security_group.eb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  to_port           = 443
  ip_protocol       = "tcp"
  description       = "Allow HTTPS traffic"
}

# Outbound access
resource "aws_vpc_security_group_egress_rule" "eb_outbound" {
  security_group_id = aws_security_group.eb_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1" # All protocols
  description       = "Allow all outbound traffic"
}

# IAM roles for Elastic Beanstalk
resource "aws_iam_role" "eb_service_role" {
  name = "eb-service-role-${random_id.suffix.hex}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "elasticbeanstalk.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "eb_service" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

resource "aws_iam_role_policy_attachment" "eb_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role" "eb_ec2_role" {
  name = "eb-ec2-role-${random_id.suffix.hex}"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# No additional policies needed for the simplified approach

resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_ec2_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
}

resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "eb-instance-profile-${random_id.suffix.hex}"
  role = aws_iam_role.eb_ec2_role.name
}

# Elastic Beanstalk application
resource "aws_elastic_beanstalk_application" "app" {
  name        = var.app_name
  description = "Wattwize"
}

# S3 bucket for EB deployment files
resource "aws_s3_bucket" "app_versions" {
  bucket = "${var.app_name}-versions-${random_id.suffix.hex}"
}

# Source bundle for the initial application version - use local dummy app zip
resource "aws_s3_object" "dummy_app_version" {
  bucket = aws_s3_bucket.app_versions.id
  key    = "initial-app-version.zip"
  source = "${path.module}/dummy-app.zip"
  etag   = filemd5("${path.module}/dummy-app.zip")
}

# Initial placeholder application version
resource "aws_elastic_beanstalk_application_version" "init_version" {
  name        = "init-version-${random_id.suffix.hex}"
  application = aws_elastic_beanstalk_application.app.name
  description = "Initial placeholder version"
  bucket      = aws_s3_bucket.app_versions.id
  key         = aws_s3_object.dummy_app_version.key
}

# Elastic Beanstalk environment
resource "aws_elastic_beanstalk_environment" "env" {
  name                = var.env_name
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = var.solution_stack
  version_label       = aws_elastic_beanstalk_application_version.init_version.name
  
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = var.instance_type
  }
  
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }
  
  # Use the security group NAME instead of ID
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = aws_security_group.eb_sg.name
  }
  
  # Single instance environment 
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }
  
  # Python specific settings
  setting {
    namespace = "aws:elasticbeanstalk:container:python"
    name      = "WSGIPath"
    value     = "application:app"
  }
  
  # Environment variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "FRONTEND_URL"
    value     = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DATABASE_URL"
    value     = "mysql+pymysql://${var.db_user}:${var.db_password}@${aws_db_instance.database.endpoint}/${var.db_name}"
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ALLOW_ORIGINS"
    value     = "https://${aws_cloudfront_distribution.frontend.domain_name}"
  }
  
  # No DB init script environment variables required with direct import approach
  
  # Simple deployment policy
  setting {
    namespace = "aws:elasticbeanstalk:command"
    name      = "DeploymentPolicy"
    value     = "AllAtOnce"
  }
  
  # Configure logs to be retained
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "StreamLogs"
    value     = "true"
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:cloudwatch:logs"
    name      = "RetentionInDays"
    value     = "7"
  }
}

# No .ebextensions config needed for DB initialization since we're using direct import

# Outputs
output "frontend_url" {
  description = "URL of the frontend website"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "backend_url" {
  description = "URL of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.env.endpoint_url
}

output "database_endpoint" {
  description = "Endpoint of the database"
  value       = aws_db_instance.database.endpoint
}

output "rds_username" {
  description = "RDS database username"
  value       = var.db_user
}

output "database_name" {
  description = "RDS database name"
  value       = var.db_name
}
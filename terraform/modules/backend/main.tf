resource "aws_elastic_beanstalk_application" "app" {
  name        = var.app_name
  description = "Renewable Energy Insights Hub Application"
  
  lifecycle {
    # This prevents errors when the application already exists
    create_before_destroy = true
    # This makes Terraform import any existing app with the same name
    prevent_destroy = true
  }
}

# S3 bucket for storing the application version
resource "aws_s3_bucket" "app_versions" {
  bucket = "${var.app_name}-app-versions"
  
  lifecycle {
    # This prevents errors when the bucket already exists
    ignore_changes = [bucket]
    # This prevents destruction of the bucket when Terraform runs
    prevent_destroy = true
  }
}

resource "aws_elastic_beanstalk_environment" "env" {
  depends_on = [module.database.aws_security_group.db_security_group]
  name                = var.env_name
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = var.solution_stack
  
  # Free tier eligible instance
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
  
  # Use the provided security group
  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "SecurityGroups"
    value     = var.security_group_id
  }
  
  # Environment variables
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "FRONTEND_URL"
    value     = var.frontend_url
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_HOST"
    value     = var.db_host
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_NAME"
    value     = var.db_name
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_USER"
    value     = var.db_user
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "DB_PASSWORD"
    value     = var.db_password
  }
  
  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "ALLOW_ORIGINS"
    value     = var.frontend_url
  }
  
  # Single instance environment (no load balancer)
  setting {
    namespace = "aws:elasticbeanstalk:environment"
    name      = "EnvironmentType"
    value     = "SingleInstance"
  }
  
  # Lifecycle configuration for existing environment
  lifecycle {
    # Prevent recreation of the environment
    prevent_destroy = true
    # Ignore changes to avoid unnecessary updates
    ignore_changes = [
      setting,
      solution_stack_name
    ]
  }
}

# IAM Role for Elastic Beanstalk
resource "aws_iam_role" "eb_service_role" {
  name = "${var.app_name}-eb-service-role"
  
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
  
  lifecycle {
    # This prevents errors when the role already exists
    create_before_destroy = true
    # Ignore changes to the policy to prevent conflicts
    ignore_changes = [assume_role_policy]
  }
}

resource "aws_iam_role" "eb_instance_role" {
  name = "${var.app_name}-eb-instance-role"
  
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
  
  lifecycle {
    # This prevents errors when the role already exists
    create_before_destroy = true
    # Ignore changes to the policy to prevent conflicts
    ignore_changes = [assume_role_policy]
  }
}

resource "aws_iam_instance_profile" "eb_instance_profile" {
  name = "${var.app_name}-eb-instance-profile"
  role = aws_iam_role.eb_instance_role.name
}

# Attach managed policies for Elastic Beanstalk
resource "aws_iam_role_policy_attachment" "eb_web_tier" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkService"
}

resource "aws_iam_role_policy_attachment" "eb_enhanced_health" {
  role       = aws_iam_role.eb_service_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSElasticBeanstalkEnhancedHealth"
}

resource "aws_iam_role_policy_attachment" "eb_web_tier_instance" {
  role       = aws_iam_role.eb_instance_role.name
  policy_arn = "arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier"
} 
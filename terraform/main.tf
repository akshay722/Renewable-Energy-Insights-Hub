terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  required_version = ">= 1.2.0"
  
  # Uncomment this block to use Terraform Cloud/Enterprise for state management
  # backend "s3" {
  #   bucket = "your-terraform-state-bucket"
  #   key    = "terraform.tfstate"
  #   region = "us-west-2"
  # }
}

provider "aws" {
  region = var.aws_region
  # If you're using AWS profiles, uncomment the next line
  # profile = var.aws_profile
}

# Create security groups first
resource "aws_security_group" "eb_security_group" {
  name        = "${var.app_name}-eb-sg-${random_id.suffix.hex}"
  description = "Security group for Elastic Beanstalk environment"
  vpc_id      = data.aws_vpc.default.id
  
  # Allow HTTP traffic
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP"
  }
  
  # Allow HTTPS traffic
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS"
  }
  
  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "${var.app_name}-eb-sg-${random_id.suffix.hex}"
  }
}

# Add random suffix to ensure unique names
resource "random_id" "suffix" {
  byte_length = 4
}

# S3 Frontend Module
module "frontend" {
  source = "./modules/frontend"
  
  bucket_name = var.frontend_bucket_name
  region      = var.aws_region
}

# Database Module
module "database" {
  source = "./modules/database"
  
  db_name                  = var.db_name
  db_user                  = var.db_user
  db_password              = var.db_password
  region                   = var.aws_region
  allowed_security_group_ids = [aws_security_group.eb_security_group.id]
}

# Elastic Beanstalk Backend Module
module "backend" {
  source = "./modules/backend"
  
  app_name          = var.app_name
  env_name          = var.env_name
  solution_stack    = var.solution_stack
  instance_type     = var.instance_type
  frontend_url      = module.frontend.website_url
  db_host           = module.database.db_instance_address
  db_name           = var.db_name
  db_user           = var.db_user
  db_password       = var.db_password
  security_group_id = aws_security_group.eb_security_group.id
  
  depends_on = [module.database]
}

# Optional: MySQL RDS Module (only if you want to manage the database with Terraform)
# module "database" {
#   source = "./modules/database"
#   
#   db_name     = var.db_name
#   db_user     = var.db_user
#   db_password = var.db_password
#   region      = var.aws_region
# } 
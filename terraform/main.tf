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

# Database Module
module "database" {
  source = "./modules/database"
  
  db_name     = var.db_name
  db_user     = var.db_user
  db_password = var.db_password
  region      = var.aws_region
}

# S3 Frontend Module
module "frontend" {
  source = "./modules/frontend"
  
  bucket_name = var.frontend_bucket_name
  region      = var.aws_region
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
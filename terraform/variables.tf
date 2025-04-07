variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-west-2"
}

variable "aws_profile" {
  description = "AWS CLI profile to use"
  type        = string
  default     = "default"
}

variable "app_name" {
  description = "Name of the Elastic Beanstalk application"
  type        = string
  default     = "renewable-energy-app"
}

variable "env_name" {
  description = "Name of the Elastic Beanstalk environment"
  type        = string
  default     = "production-env"
}

variable "solution_stack" {
  description = "Elastic Beanstalk solution stack"
  type        = string
  default     = "64bit Amazon Linux 2023 v4.5.0 running Python 3.9"
}

variable "instance_type" {
  description = "EC2 instance type for Elastic Beanstalk"
  type        = string
  default     = "t2.micro"
}

variable "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend"
  type        = string
  default     = "renewable-energy-frontend-west-2"
}

variable "db_host" {
  description = "Database host"
  type        = string
  default     = "renewable-energy-db"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "renewable_energy_db"
}

variable "db_user" {
  description = "Database username"
  type        = string
  default     = "root"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
} 
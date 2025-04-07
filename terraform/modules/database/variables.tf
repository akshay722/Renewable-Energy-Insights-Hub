variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "renewable_energy_db"
}

variable "db_user" {
  description = "Username for the database"
  type        = string
  default     = "root"
}

variable "db_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "AWS region for the database"
  type        = string
}

variable "allowed_security_group_ids" {
  description = "List of security group IDs allowed to access the database"
  type        = list(string)
  default     = []
} 
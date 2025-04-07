output "frontend_url" {
  description = "URL of the frontend website"
  value       = module.frontend.website_url
}

output "backend_url" {
  description = "URL of the Elastic Beanstalk environment"
  value       = module.backend.endpoint_url
}

output "eb_environment_name" {
  description = "Name of the Elastic Beanstalk environment"
  value       = module.backend.environment_name
}

output "database_endpoint" {
  description = "Endpoint of the database"
  value       = module.database.db_instance_endpoint
} 
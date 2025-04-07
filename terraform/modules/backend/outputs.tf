output "endpoint_url" {
  description = "Endpoint URL of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.env.endpoint_url
}

output "environment_name" {
  description = "Name of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.env.name
}

output "environment_id" {
  description = "ID of the Elastic Beanstalk environment"
  value       = aws_elastic_beanstalk_environment.env.id
} 
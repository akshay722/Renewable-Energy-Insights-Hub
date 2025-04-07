resource "aws_db_instance" "database" {
  identifier           = "renewable-energy-db"
  engine               = "mysql"
  engine_version       = "8.0.37"
  instance_class       = "db.t3.micro" # Free tier eligible
  db_name              = var.db_name
  username             = var.db_user
  password             = var.db_password
  allocated_storage    = 20 # Free tier eligible (up to 20GB)
  
  # Free tier optimizations
  skip_final_snapshot  = true
  publicly_accessible  = false
  storage_type         = "gp2"
  max_allocated_storage = 0 # Disable autoscaling
  
  # Backup settings
  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  
  # Performance settings
  parameter_group_name = aws_db_parameter_group.renewable_energy.name
  
  # Protection settings
  deletion_protection = false # Set to true in production
  
  # Network settings
  vpc_security_group_ids = [aws_security_group.db_security_group.id]
  
  # Tags
  tags = {
    Name        = "RenewableEnergyDB"
    Environment = "Production"
    Terraform   = "true"
  }
  
  # Lifecycle settings to handle existing database
  lifecycle {
    # This prevents recreation if only the password changes
    ignore_changes = [
      password,
      engine_version,
      parameter_group_name,
      username,
      vpc_security_group_ids,
      allocated_storage
    ]
    prevent_destroy = true
  }
}

# Parameter group for MySQL configuration
resource "aws_db_parameter_group" "renewable_energy" {
  name   = "renewable-energy-pg"
  family = "mysql8.0"
  
  parameter {
    name  = "character_set_server"
    value = "utf8"
  }
  
  parameter {
    name  = "character_set_client"
    value = "utf8"
  }
  
  lifecycle {
    # This prevents errors when the parameter group already exists
    create_before_destroy = true
    ignore_changes = [parameter]
  }
}

# Security group for database access
resource "aws_security_group" "db_security_group" {
  name        = "renewable-energy-db-sg"
  description = "Allow access to MySQL"
  
  # Allow incoming MySQL traffic from Elastic Beanstalk security group or IP range
  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # In production, restrict this to specific IPs or security groups
    description = "MySQL access"
  }
  
  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name = "renewable-energy-db-sg"
  }
  
  lifecycle {
    # This prevents errors when the security group already exists
    create_before_destroy = true
  }
}

# Database initialization script
resource "null_resource" "db_setup" {
  depends_on = [aws_db_instance.database]
  
  # Run the init script only when the database is created
  triggers = {
    db_instance_id = aws_db_instance.database.id
  }
  
  provisioner "local-exec" {
    command = <<-EOT
      echo "Waiting for database to be ready..."
      sleep 60
      mysql -h ${aws_db_instance.database.address} -P ${aws_db_instance.database.port} -u ${var.db_user} -p${var.db_password} ${var.db_name} < ${path.module}/../../../init-db.sql || echo "Failed to import database schema"
    EOT
  }
} 
# =============================================================================
# RDS Module - PostgreSQL Database
# Creates RDS instance with proper networking and security
# =============================================================================

# -----------------------------------------------------------------------------
# DB Subnet Group
# -----------------------------------------------------------------------------

resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-db-subnet-${var.environment}"
  description = "Database subnet group for ${var.project_name}"
  subnet_ids  = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-${var.environment}"
  }
}

# -----------------------------------------------------------------------------
# DB Parameter Group
# -----------------------------------------------------------------------------

resource "aws_db_parameter_group" "main" {
  name        = "${var.project_name}-pg-params-${var.environment}"
  family      = "postgres${var.engine_version}"
  description = "PostgreSQL parameter group for ${var.project_name}"

  # Performance tuning parameters
  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_disconnections"
    value = "1"
  }

  parameter {
    name  = "log_statement"
    value = "ddl"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Log queries taking more than 1 second
  }

  tags = {
    Name = "${var.project_name}-pg-params-${var.environment}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# Random Password Generation (if not provided)
# -----------------------------------------------------------------------------

resource "random_password" "db_password" {
  count   = var.password == "" ? 1 : 0
  length  = 32
  special = false # RDS has restrictions on special characters
}

locals {
  db_password = var.password != "" ? var.password : random_password.db_password[0].result
}

# -----------------------------------------------------------------------------
# Secrets Manager Secret (for storing credentials)
# -----------------------------------------------------------------------------

resource "aws_secretsmanager_secret" "db_credentials" {
  count = var.store_credentials_in_secrets_manager ? 1 : 0

  name        = "${var.project_name}/db-credentials/${var.environment}"
  description = "Database credentials for ${var.project_name}"

  tags = {
    Name = "${var.project_name}-db-secret-${var.environment}"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  count = var.store_credentials_in_secrets_manager ? 1 : 0

  secret_id = aws_secretsmanager_secret.db_credentials[0].id
  secret_string = jsonencode({
    username = var.username
    password = local.db_password
    host     = aws_db_instance.main.address
    port     = aws_db_instance.main.port
    database = var.database_name
    url      = "postgresql://${var.username}:${local.db_password}@${aws_db_instance.main.address}:${aws_db_instance.main.port}/${var.database_name}"
  })
}

# -----------------------------------------------------------------------------
# RDS Instance
# -----------------------------------------------------------------------------

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db-${var.environment}"

  # Engine configuration
  engine                = "postgres"
  engine_version        = var.engine_version
  instance_class        = var.instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = true

  # Database configuration
  db_name  = var.database_name
  username = var.username
  password = local.db_password
  port     = 5432

  # Network configuration
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]
  publicly_accessible    = false
  multi_az               = var.multi_az

  # Parameter group
  parameter_group_name = aws_db_parameter_group.main.name

  # Backup configuration
  backup_retention_period = var.backup_retention_period
  backup_window           = var.backup_window
  maintenance_window      = var.maintenance_window

  # Performance Insights
  performance_insights_enabled          = var.enable_performance_insights
  performance_insights_retention_period = var.enable_performance_insights ? 7 : null

  # Deletion protection
  deletion_protection       = var.environment == "prod" ? true : false
  skip_final_snapshot       = var.environment == "prod" ? false : true
  final_snapshot_identifier = var.environment == "prod" ? "${var.project_name}-db-final-${var.environment}" : null

  # Enable IAM authentication
  iam_database_authentication_enabled = var.enable_iam_auth

  # Enhanced monitoring
  monitoring_interval = var.enable_enhanced_monitoring ? 60 : 0
  monitoring_role_arn = var.enable_enhanced_monitoring ? aws_iam_role.rds_monitoring[0].arn : null

  # Auto minor version upgrades
  auto_minor_version_upgrade = true

  tags = {
    Name = "${var.project_name}-db-${var.environment}"
  }

  lifecycle {
    prevent_destroy = false # Set to true in production
  }
}

# -----------------------------------------------------------------------------
# Enhanced Monitoring IAM Role
# -----------------------------------------------------------------------------

resource "aws_iam_role" "rds_monitoring" {
  count = var.enable_enhanced_monitoring ? 1 : 0

  name = "${var.project_name}-rds-monitoring-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "monitoring.rds.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = {
    Name = "${var.project_name}-rds-monitoring-${var.environment}"
  }
}

resource "aws_iam_role_policy_attachment" "rds_monitoring" {
  count = var.enable_enhanced_monitoring ? 1 : 0

  role       = aws_iam_role.rds_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

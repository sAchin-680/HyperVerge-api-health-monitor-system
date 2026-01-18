# =============================================================================
# Root Main Configuration
# Wires all modules together for the complete infrastructure
# =============================================================================

# -----------------------------------------------------------------------------
# VPC Module
# Creates the networking foundation
# -----------------------------------------------------------------------------

module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  az_count           = var.availability_zones_count
  enable_nat_gateway = true
  single_nat_gateway = var.environment != "prod" # Use single NAT for non-prod (cost saving)
}

# -----------------------------------------------------------------------------
# Security Module
# Creates all security groups with least-privilege access
# -----------------------------------------------------------------------------

module "security" {
  source = "./modules/security"

  project_name   = var.project_name
  environment    = var.environment
  vpc_id         = module.vpc.vpc_id
  container_port = var.container_port
  enable_https   = var.enable_https
}

# -----------------------------------------------------------------------------
# ALB Module
# Creates Application Load Balancer for public access
# -----------------------------------------------------------------------------

module "alb" {
  source = "./modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  public_subnet_ids = module.vpc.public_subnet_ids
  security_group_id = module.security.alb_security_group_id
  container_port    = var.container_port
  health_check_path = var.health_check_path
  enable_https      = var.enable_https
  certificate_arn   = var.certificate_arn
}

# -----------------------------------------------------------------------------
# ECS Module
# Creates Fargate cluster and service
# -----------------------------------------------------------------------------

module "ecs" {
  source = "./modules/ecs"

  project_name       = var.project_name
  environment        = var.environment
  aws_region         = var.aws_region
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.security.ecs_security_group_id
  target_group_arn   = module.alb.target_group_arn

  # Task configuration
  task_cpu        = var.ecs_task_cpu
  task_memory     = var.ecs_task_memory
  container_image = var.container_image
  container_port  = var.container_port
  desired_count   = var.ecs_desired_count

  # Health check
  health_check_path = var.health_check_path

  # Environment variables for the application
  container_environment = [
    {
      name  = "NODE_ENV"
      value = var.environment
    },
    {
      name  = "PORT"
      value = tostring(var.container_port)
    },
    {
      name  = "DB_HOST"
      value = module.rds.db_address
    },
    {
      name  = "DB_PORT"
      value = tostring(module.rds.db_port)
    },
    {
      name  = "DB_NAME"
      value = var.db_name
    }
  ]

  # Secrets from Secrets Manager
  container_secrets = [
    {
      name      = "DATABASE_URL"
      valueFrom = module.rds.db_credentials_secret_arn
    }
  ]

  # Auto scaling
  enable_autoscaling = var.environment == "prod"
  min_capacity       = var.environment == "prod" ? 2 : 1
  max_capacity       = var.environment == "prod" ? 10 : 4

  # Use spot for non-prod
  use_spot = var.environment != "prod"

  depends_on = [module.alb, module.rds]
}

# -----------------------------------------------------------------------------
# RDS Module
# Creates PostgreSQL database
# -----------------------------------------------------------------------------

module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.security.rds_security_group_id

  # Instance configuration
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.environment == "prod" ? 100 : 50
  engine_version        = var.db_engine_version

  # Database configuration
  database_name = var.db_name
  username      = var.db_username
  password      = var.db_password

  # High availability for prod
  multi_az = var.environment == "prod"

  # Backup configuration
  backup_retention_period = var.environment == "prod" ? 30 : 7

  # Monitoring
  enable_performance_insights = true
  enable_enhanced_monitoring  = var.environment == "prod"

  # Store credentials in Secrets Manager
  store_credentials_in_secrets_manager = true
}

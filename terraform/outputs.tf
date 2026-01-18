# =============================================================================
# Root Outputs
# Exposes key infrastructure values for reference and integration
# =============================================================================

# -----------------------------------------------------------------------------
# Application Access
# -----------------------------------------------------------------------------

output "application_url" {
  description = "URL to access the application"
  value       = module.alb.alb_url
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = module.alb.alb_dns_name
}

# -----------------------------------------------------------------------------
# VPC Outputs
# -----------------------------------------------------------------------------

output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "vpc_cidr" {
  description = "CIDR block of the VPC"
  value       = module.vpc.vpc_cidr
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "List of private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "availability_zones" {
  description = "Availability zones used"
  value       = module.vpc.availability_zones
}

# -----------------------------------------------------------------------------
# ECS Outputs
# -----------------------------------------------------------------------------

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = module.ecs.cluster_name
}

output "ecs_cluster_arn" {
  description = "ARN of the ECS cluster"
  value       = module.ecs.cluster_arn
}

output "ecs_service_name" {
  description = "Name of the ECS service"
  value       = module.ecs.service_name
}

output "ecs_task_definition_arn" {
  description = "ARN of the task definition"
  value       = module.ecs.task_definition_arn
}

output "ecs_log_group" {
  description = "CloudWatch log group for ECS"
  value       = module.ecs.log_group_name
}

# -----------------------------------------------------------------------------
# Database Outputs
# -----------------------------------------------------------------------------

output "db_endpoint" {
  description = "RDS endpoint (host:port)"
  value       = module.rds.db_endpoint
}

output "db_address" {
  description = "RDS hostname"
  value       = module.rds.db_address
}

output "db_port" {
  description = "RDS port"
  value       = module.rds.db_port
}

output "db_name" {
  description = "Database name"
  value       = module.rds.db_name
}

output "db_credentials_secret_arn" {
  description = "ARN of Secrets Manager secret with DB credentials"
  value       = module.rds.db_credentials_secret_arn
}

# -----------------------------------------------------------------------------
# Security Group IDs
# -----------------------------------------------------------------------------

output "alb_security_group_id" {
  description = "Security group ID for ALB"
  value       = module.security.alb_security_group_id
}

output "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  value       = module.security.ecs_security_group_id
}

output "rds_security_group_id" {
  description = "Security group ID for RDS"
  value       = module.security.rds_security_group_id
}

# -----------------------------------------------------------------------------
# Useful Commands
# -----------------------------------------------------------------------------

output "useful_commands" {
  description = "Helpful AWS CLI commands"
  value = {
    view_logs      = "aws logs tail ${module.ecs.log_group_name} --follow"
    update_service = "aws ecs update-service --cluster ${module.ecs.cluster_name} --service ${module.ecs.service_name} --force-new-deployment"
    get_db_secret  = "aws secretsmanager get-secret-value --secret-id ${module.rds.db_credentials_secret_arn} --query SecretString --output text | jq"
    describe_tasks = "aws ecs describe-tasks --cluster ${module.ecs.cluster_name} --tasks $(aws ecs list-tasks --cluster ${module.ecs.cluster_name} --service-name ${module.ecs.service_name} --query 'taskArns[0]' --output text)"
  }
}

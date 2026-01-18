# AWS Provider Configuration
# Region is configurable via variables for multi-environment support

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
      Repository  = "HyperVerge-api-health-monitor-system"
    }
  }
}

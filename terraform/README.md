# Terraform AWS Infrastructure

Production-grade AWS infrastructure for the HyperVerge API Health Monitor System.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Internet                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Load Balancer                     │
│                      (Public Subnets)                            │
│                    HTTP/HTTPS → Target Group                     │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ECS Fargate Service                        │
│                      (Private Subnets)                           │
│                                                                  │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│   │   Task 1    │   │   Task 2    │   │   Task N    │          │
│   │  (API)      │   │  (API)      │   │  (API)      │          │
│   └─────────────┘   └─────────────┘   └─────────────┘          │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RDS PostgreSQL                               │
│                    (Private Subnets)                             │
│                   Multi-AZ (Production)                          │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
terraform/
├── main.tf                 # Root module - wires everything together
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── provider.tf             # AWS provider configuration
├── versions.tf             # Terraform and provider versions
├── terraform.tfvars.example # Example variables file
├── .gitignore              # Git ignore patterns
│
├── modules/
│   ├── vpc/                # VPC, subnets, NAT, routing
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── security/           # Security groups (ALB, ECS, RDS)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── alb/                # Application Load Balancer
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── ecs/                # ECS Cluster, Service, Task Definition
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── rds/                # RDS PostgreSQL
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
└── envs/
    ├── dev/
    │   └── terraform.tfvars
    └── prod/
        └── terraform.tfvars
```

## 🚀 Quick Start

### Prerequisites

- [Terraform](https://www.terraform.io/downloads) >= 1.6.0
- [AWS CLI](https://aws.amazon.com/cli/) configured with credentials
- AWS account with appropriate permissions

### 1. Configure AWS Credentials

```bash
aws configure
# Or use environment variables:
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"
```

### 2. Initialize Terraform

```bash
cd terraform
terraform init
```

### 3. Create Variables File

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 4. Plan Infrastructure

```bash
# For development
terraform plan -var-file=envs/dev/terraform.tfvars

# For production
terraform plan -var-file=envs/prod/terraform.tfvars
```

### 5. Apply Infrastructure

```bash
# Apply changes
terraform apply -var-file=envs/dev/terraform.tfvars

# Auto-approve (use with caution)
terraform apply -var-file=envs/dev/terraform.tfvars -auto-approve
```

### 6. Get Outputs

```bash
terraform output
terraform output application_url
terraform output db_endpoint
```

## 📦 Modules

### VPC Module

Creates a production-ready VPC with:

- Public subnets (for ALB)
- Private subnets (for ECS and RDS)
- Internet Gateway
- NAT Gateway (single for dev, per-AZ for prod)
- Route tables

### Security Module

Implements least-privilege security groups:

- **ALB SG**: HTTP/HTTPS from internet
- **ECS SG**: Traffic only from ALB
- **RDS SG**: PostgreSQL only from ECS
- **Redis SG**: Redis only from ECS (for future use)

### ALB Module

Application Load Balancer with:

- HTTP listener (with HTTPS redirect option)
- HTTPS listener (optional)
- Target group with health checks
- Slow start and deregistration delay

### ECS Module

ECS Fargate setup including:

- ECS Cluster with Container Insights
- Task Definition with health checks
- ECS Service with deployment circuit breaker
- IAM roles (execution + task roles)
- Auto scaling (CPU and memory based)
- CloudWatch log group
- Support for Fargate Spot

### RDS Module

PostgreSQL database with:

- DB subnet group
- Parameter group with optimized settings
- Optional Multi-AZ deployment
- Automated backups
- Performance Insights
- Credentials stored in Secrets Manager
- Storage auto-scaling

## 🔧 Configuration

### Required Variables

| Variable      | Description         | Example             |
| ------------- | ------------------- | ------------------- |
| `db_password` | RDS master password | `"SecureP@ssw0rd!"` |

### Environment-Specific Settings

| Setting             | Dev      | Prod    |
| ------------------- | -------- | ------- |
| NAT Gateway         | Single   | Per-AZ  |
| Multi-AZ RDS        | No       | Yes     |
| ECS Auto Scaling    | Disabled | Enabled |
| Fargate Spot        | Yes      | No      |
| Deletion Protection | No       | Yes     |
| Backup Retention    | 7 days   | 30 days |

### Sensitive Variables

Set sensitive values via environment variables:

```bash
export TF_VAR_db_password="your-secure-password"
terraform apply
```

## 🔐 Security Best Practices

1. **Least Privilege**: Security groups only allow necessary traffic
2. **Private Subnets**: ECS and RDS are not publicly accessible
3. **Encrypted Storage**: RDS storage encryption enabled
4. **Secrets Management**: DB credentials stored in Secrets Manager
5. **IAM Roles**: Separate execution and task roles
6. **TLS**: HTTPS option with modern TLS policy

## 📊 Monitoring

### CloudWatch Logs

```bash
# View ECS logs
aws logs tail /ecs/hyperverge-monitor-dev --follow
```

### Container Insights

Enabled by default - view in CloudWatch Console under Container Insights.

### RDS Performance Insights

Enabled by default - view in RDS Console.

## 🔄 Common Operations

### Force New Deployment

```bash
aws ecs update-service \
  --cluster hyperverge-monitor-cluster-dev \
  --service hyperverge-monitor-service-dev \
  --force-new-deployment
```

### View Database Credentials

```bash
aws secretsmanager get-secret-value \
  --secret-id hyperverge-monitor/db-credentials/dev \
  --query SecretString \
  --output text | jq
```

### Scale ECS Service

```bash
aws ecs update-service \
  --cluster hyperverge-monitor-cluster-dev \
  --service hyperverge-monitor-service-dev \
  --desired-count 3
```

## 🧹 Cleanup

```bash
# Destroy all resources
terraform destroy -var-file=envs/dev/terraform.tfvars

# Destroy with auto-approve
terraform destroy -var-file=envs/dev/terraform.tfvars -auto-approve
```

⚠️ **Warning**: This will destroy all infrastructure including the database!

## 📈 Cost Optimization

### Development

- Single NAT Gateway (~$32/month saved)
- Fargate Spot (up to 70% savings)
- db.t3.micro RDS
- No Multi-AZ

### Production

- Consider Reserved Capacity for Fargate
- RDS Reserved Instances
- Use S3 lifecycle policies for logs

## 🛠️ Extending

### Adding Redis/ElastiCache

Security group already created. Add ElastiCache module:

```hcl
module "elasticache" {
  source = "./modules/elasticache"
  # ...
}
```

### Adding Custom Domain

1. Create Route 53 hosted zone
2. Request ACM certificate
3. Set `enable_https = true` and `certificate_arn`
4. Create Route 53 alias record

### CI/CD Integration

Example GitHub Actions workflow:

```yaml
- name: Terraform Apply
  run: |
    cd terraform
    terraform init
    terraform apply -auto-approve
  env:
    TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}
```

## 📚 References

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)

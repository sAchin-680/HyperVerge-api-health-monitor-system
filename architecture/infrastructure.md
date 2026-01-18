# AWS Infrastructure Architecture

## Production Environment

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    AWS Cloud                                     │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                              VPC (10.0.0.0/16)                             │  │
│  │                                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        Public Subnets                                │  │  │
│  │  │  ┌─────────────────┐                    ┌─────────────────┐         │  │  │
│  │  │  │ us-east-1a      │                    │ us-east-1b      │         │  │  │
│  │  │  │ 10.0.1.0/24     │                    │ 10.0.2.0/24     │         │  │  │
│  │  │  │                 │                    │                 │         │  │  │
│  │  │  │ ┌─────────────┐ │                    │ ┌─────────────┐ │         │  │  │
│  │  │  │ │ NAT Gateway │ │                    │ │ NAT Gateway │ │         │  │  │
│  │  │  │ └─────────────┘ │                    │ └─────────────┘ │         │  │  │
│  │  │  └─────────────────┘                    └─────────────────┘         │  │  │
│  │  │                                                                      │  │  │
│  │  │                    ┌───────────────────────┐                        │  │  │
│  │  │                    │  Application Load     │                        │  │  │
│  │  │                    │  Balancer (ALB)       │                        │  │  │
│  │  │                    └───────────┬───────────┘                        │  │  │
│  │  └────────────────────────────────┼────────────────────────────────────┘  │  │
│  │                                   │                                        │  │
│  │  ┌────────────────────────────────┼────────────────────────────────────┐  │  │
│  │  │                        Private Subnets                               │  │  │
│  │  │  ┌─────────────────┐           │        ┌─────────────────┐         │  │  │
│  │  │  │ us-east-1a      │           │        │ us-east-1b      │         │  │  │
│  │  │  │ 10.0.10.0/24    │           │        │ 10.0.20.0/24    │         │  │  │
│  │  │  │                 │           │        │                 │         │  │  │
│  │  │  │ ┌─────────────┐ │           │        │ ┌─────────────┐ │         │  │  │
│  │  │  │ │ ECS Fargate │◄├───────────┴────────►│ ECS Fargate │ │         │  │  │
│  │  │  │ │ (API, Worker│ │                    │ │ (API, Worker│ │         │  │  │
│  │  │  │ │  Scheduler) │ │                    │ │  Notifier)  │ │         │  │  │
│  │  │  │ └─────────────┘ │                    │ └─────────────┘ │         │  │  │
│  │  │  └─────────────────┘                    └─────────────────┘         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                            │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                        Database Subnets                              │  │  │
│  │  │  ┌─────────────────┐                    ┌─────────────────┐         │  │  │
│  │  │  │ us-east-1a      │                    │ us-east-1b      │         │  │  │
│  │  │  │ 10.0.100.0/24   │                    │ 10.0.110.0/24   │         │  │  │
│  │  │  │                 │                    │                 │         │  │  │
│  │  │  │ ┌─────────────┐ │   Replication     │ ┌─────────────┐ │         │  │  │
│  │  │  │ │   RDS       │◄├──────────────────►│ │   RDS       │ │         │  │  │
│  │  │  │ │  Primary    │ │                    │ │  Standby    │ │         │  │  │
│  │  │  │ └─────────────┘ │                    │ └─────────────┘ │         │  │  │
│  │  │  │                 │                    │                 │         │  │  │
│  │  │  │ ┌─────────────┐ │                    │ ┌─────────────┐ │         │  │  │
│  │  │  │ │ElastiCache  │◄├──────────────────►│ │ElastiCache  │ │         │  │  │
│  │  │  │ │   Redis     │ │   (future)        │ │   Redis     │ │         │  │  │
│  │  │  │ └─────────────┘ │                    │ └─────────────┘ │         │  │  │
│  │  │  └─────────────────┘                    └─────────────────┘         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │   CloudWatch     │  │  Secrets Manager │  │       ECR        │              │
│  │   Logs/Metrics   │  │                  │  │  (Container Reg) │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Network Security

### Security Groups

```
┌─────────────────────────────────────────────────────────────────┐
│                       Security Groups                            │
│                                                                  │
│  Internet ──► ALB SG (443/80) ──► ECS SG (4000-4003)            │
│                                         │                        │
│                                         ▼                        │
│                               ┌─────────────────┐               │
│                               │                 │               │
│                               ▼                 ▼               │
│                          RDS SG (5432)    Redis SG (6379)       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Traffic Flow

| Source | Destination | Port | Protocol |
|--------|-------------|------|----------|
| Internet | ALB | 443 | HTTPS |
| Internet | ALB | 80 | HTTP (redirect) |
| ALB | ECS | 4000-4003 | HTTP |
| ECS | RDS | 5432 | PostgreSQL |
| ECS | ElastiCache | 6379 | Redis |

## ECS Service Configuration

```yaml
Services:
  API:
    desired_count: 2
    cpu: 512
    memory: 1024
    port: 4000
    health_check: /health

  Worker:
    desired_count: 5
    cpu: 256
    memory: 512
    port: 4001
    health_check: /health

  Scheduler:
    desired_count: 1
    cpu: 256
    memory: 512
    port: 4002
    health_check: /health

  Notifier:
    desired_count: 2
    cpu: 256
    memory: 512
    port: 4003
    health_check: /health
```

## Cost Estimation (Production)

| Resource | Configuration | Monthly Cost |
|----------|---------------|--------------|
| ECS Fargate | ~10 tasks | ~$150 |
| RDS PostgreSQL | db.t3.medium, Multi-AZ | ~$130 |
| ElastiCache | cache.t3.micro | ~$25 |
| ALB | 1 ALB | ~$25 |
| NAT Gateway | 2 (per AZ) | ~$65 |
| Data Transfer | ~100GB | ~$10 |
| CloudWatch | Logs + Metrics | ~$20 |
| **Total** | | **~$425/month** |

## Disaster Recovery

### RTO/RPO Targets

| Metric | Target |
|--------|--------|
| RTO (Recovery Time) | < 1 hour |
| RPO (Recovery Point) | < 5 minutes |

### Backup Strategy

- RDS: Automated daily backups, 30-day retention
- Point-in-time recovery enabled
- Cross-region replication (future)

### Failover

- Multi-AZ RDS with automatic failover
- ECS tasks distributed across AZs
- ALB health checks for automatic routing

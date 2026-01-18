# Scaling Runbook

## Current Architecture

| Service   | Default Instances | Max Instances |
| --------- | ----------------- | ------------- |
| API       | 2                 | 10            |
| Worker    | 2                 | 20            |
| Scheduler | 1                 | 1             |
| Notifier  | 2                 | 5             |

## Horizontal Scaling

### Docker Compose (Development)

```bash
# Scale workers
docker compose up -d --scale worker=5

# Scale API
docker compose up -d --scale api=3
```

### ECS (Production)

```bash
# Update desired count
aws ecs update-service \
  --cluster hyperverge-prod \
  --service worker \
  --desired-count 5

# Check scaling status
aws ecs describe-services \
  --cluster hyperverge-prod \
  --services worker \
  --query 'services[0].{desired:desiredCount,running:runningCount}'
```

### Kubernetes

```bash
# Scale deployment
kubectl scale deployment worker --replicas=5 -n production

# Check status
kubectl get pods -l app=worker -n production
```

## Auto-Scaling Configuration

### ECS Auto-Scaling

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/hyperverge-prod/worker \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 20

# Create scaling policy (CPU-based)
aws application-autoscaling put-scaling-policy \
  --service-namespace ecs \
  --resource-id service/hyperverge-prod/worker \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-name worker-cpu-scaling \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    },
    "ScaleOutCooldown": 60,
    "ScaleInCooldown": 120
  }'
```

## Vertical Scaling

### Database (RDS)

```bash
# Modify instance class (causes downtime)
aws rds modify-db-instance \
  --db-instance-identifier hyperverge-prod \
  --db-instance-class db.r5.xlarge \
  --apply-immediately
```

### ECS Task Resources

Update task definition with new resource limits:

```json
{
  "cpu": "512",
  "memory": "1024"
}
```

## Scaling Triggers

### Scale Up When

| Metric             | Threshold | Action              |
| ------------------ | --------- | ------------------- |
| CPU Utilization    | > 70%     | Add 2 instances     |
| Memory Utilization | > 80%     | Add 2 instances     |
| Queue Depth        | > 1000    | Add 5 workers       |
| Response Time      | > 500ms   | Add 2 API instances |

### Scale Down When

| Metric          | Threshold | Action            |
| --------------- | --------- | ----------------- |
| CPU Utilization | < 30%     | Remove 1 instance |
| Queue Depth     | < 100     | Remove 2 workers  |

## Queue Depth Monitoring

```bash
# Check Redis queue depth
docker compose exec redis redis-cli LLEN monitor-queue

# Check BullMQ queue stats
# Access via API endpoint
curl http://localhost:4001/metrics | grep bull
```

## Capacity Planning

### Current Limits

| Resource        | Limit | Current Usage |
| --------------- | ----- | ------------- |
| RDS Connections | 100   | ~30           |
| Redis Memory    | 1GB   | ~200MB        |
| ECS vCPU        | 20    | ~8            |

### Scaling Estimation

| Monitors | Workers Needed | API Instances |
| -------- | -------------- | ------------- |
| 100      | 2              | 2             |
| 1,000    | 5              | 3             |
| 10,000   | 15             | 5             |
| 100,000  | 50             | 10            |

## Emergency Scaling

For sudden traffic spikes:

```bash
# Immediately scale to maximum
aws ecs update-service \
  --cluster hyperverge-prod \
  --service api \
  --desired-count 10

aws ecs update-service \
  --cluster hyperverge-prod \
  --service worker \
  --desired-count 20

# Enable CloudFront caching if not already
# Enable rate limiting at ALB level
```

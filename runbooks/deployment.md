# Deployment Runbook

## Pre-Deployment Checklist

- [ ] All tests passing in CI
- [ ] Code review approved
- [ ] Database migrations reviewed
- [ ] Environment variables updated
- [ ] Rollback plan documented

## Deployment Procedure

### 1. Staging Deployment

```bash
# Trigger staging deployment
git push origin main

# Verify staging health
curl https://staging.hyperverge-monitor.example.com/health
```

### 2. Production Deployment

```bash
# Tag release
git tag -a v1.x.x -m "Release v1.x.x"
git push origin v1.x.x

# Monitor deployment
aws ecs describe-services --cluster hyperverge-prod --services api worker scheduler notifier
```

### 3. Post-Deployment Verification

```bash
# Check all health endpoints
for service in api worker scheduler notifier; do
  echo "Checking $service..."
  curl -s https://hyperverge-monitor.example.com/$service/health | jq .
done

# Verify metrics
curl -s https://hyperverge-monitor.example.com/metrics | head -20
```

## Rollback Procedure

### Immediate Rollback

```bash
# ECS rollback to previous task definition
aws ecs update-service \
  --cluster hyperverge-prod \
  --service api \
  --task-definition hyperverge-api:PREVIOUS_VERSION \
  --force-new-deployment

# Or using kubectl
kubectl rollout undo deployment/api -n production
```

### Database Rollback

```bash
# Only if migration caused issues
cd packages/db
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

## Deployment Windows

| Environment | Window                    | Approval Required |
| ----------- | ------------------------- | ----------------- |
| Development | Anytime                   | No                |
| Staging     | Business hours            | No                |
| Production  | Tuesday/Thursday 10am-4pm | Yes               |

## Emergency Deployment

For critical security patches:

1. Create hotfix branch from main
2. Apply minimal fix
3. Get expedited review
4. Deploy directly to production
5. Backport to main

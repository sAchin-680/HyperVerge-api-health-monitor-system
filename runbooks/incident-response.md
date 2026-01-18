# Incident Response Runbook

## Severity Levels

| Level | Description         | Response Time     | Example                |
| ----- | ------------------- | ----------------- | ---------------------- |
| SEV1  | Complete outage     | 5 minutes         | All services down      |
| SEV2  | Major degradation   | 15 minutes        | API errors > 50%       |
| SEV3  | Minor issue         | 1 hour            | Single monitor failing |
| SEV4  | Cosmetic/low impact | Next business day | UI glitch              |

## Incident Response Flow

### 1. Detection

Incidents are detected via:

- Automated monitoring alerts
- Customer reports
- Internal testing

### 2. Acknowledgment

```bash
# Acknowledge in PagerDuty/Slack
# Update status page
```

### 3. Triage

Determine affected components:

```bash
# Check service health
curl -s http://localhost:4000/health | jq .
curl -s http://localhost:4001/health | jq .
curl -s http://localhost:4002/health | jq .
curl -s http://localhost:4003/health | jq .

# Check container status
docker compose ps

# Check logs
docker compose logs --tail=100 api
```

### 4. Mitigation

#### Service Not Responding

```bash
# Restart specific service
docker compose restart api

# Or scale up
docker compose up -d --scale api=3
```

#### Database Connection Issues

```bash
# Check database connectivity
docker compose exec postgres pg_isready

# Check connection pool
docker compose logs api | grep -i "connection"
```

#### Redis Issues

```bash
# Check Redis
docker compose exec redis redis-cli ping

# Check queue depth
docker compose exec redis redis-cli LLEN monitor-queue
```

### 5. Resolution

1. Verify all services healthy
2. Confirm metrics returning to normal
3. Update status page
4. Notify stakeholders

### 6. Post-Incident

Within 48 hours:

- Write post-mortem
- Identify root cause
- Create action items
- Schedule review meeting

## Common Issues

### API 5xx Errors

1. Check API logs for stack traces
2. Verify database connectivity
3. Check memory/CPU usage
4. Review recent deployments

### Worker Not Processing Jobs

1. Check Redis queue depth
2. Verify worker is consuming
3. Check for dead-letter queue buildup
4. Review worker logs

### Scheduler Not Producing Jobs

1. Verify scheduler is running
2. Check database for monitors
3. Review scheduler logs
4. Verify cron expressions

### Notifications Not Sending

1. Check notifier health
2. Verify SMTP/webhook configs
3. Check delivery logs
4. Review retry queue

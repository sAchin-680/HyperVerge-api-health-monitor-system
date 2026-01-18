# Troubleshooting Guide

## Quick Diagnostics

```bash
# Check all services
docker compose ps

# View recent logs
docker compose logs --tail=50

# Check resource usage
docker stats --no-stream
```

## Common Issues

### 1. Service Won't Start

**Symptoms**: Container exits immediately or keeps restarting

**Diagnosis**:

```bash
# Check exit code
docker compose ps

# View startup logs
docker compose logs SERVICE_NAME | head -50
```

**Common Causes**:

- Missing environment variables
- Database connection failure
- Port already in use

**Solutions**:

```bash
# Check environment
docker compose config

# Verify ports are free
lsof -i :4000

# Restart with fresh state
docker compose down && docker compose up -d
```

### 2. Database Connection Errors

**Symptoms**: `ECONNREFUSED` or `Connection timed out`

**Diagnosis**:

```bash
# Test connectivity
docker compose exec api node -e "require('./node_modules/@prisma/client').PrismaClient"

# Check database is running
docker compose exec postgres pg_isready
```

**Solutions**:

```bash
# Restart database
docker compose restart postgres

# Check credentials
echo $DATABASE_URL

# Verify network
docker network ls
docker network inspect hyperverge_default
```

### 3. Redis Queue Buildup

**Symptoms**: Jobs not being processed, high queue depth

**Diagnosis**:

```bash
# Check queue depth
docker compose exec redis redis-cli LLEN monitor-queue

# Check worker is running
docker compose logs worker | tail -20
```

**Solutions**:

```bash
# Restart workers
docker compose restart worker

# Scale workers
docker compose up -d --scale worker=5

# Clear stuck queue (CAUTION: loses jobs)
docker compose exec redis redis-cli DEL monitor-queue
```

### 4. High Memory Usage

**Symptoms**: OOM kills, slow performance

**Diagnosis**:

```bash
# Check container memory
docker stats

# Check Node.js heap
docker compose exec api node -e "console.log(process.memoryUsage())"
```

**Solutions**:

```bash
# Increase memory limit in docker-compose.yml
# Add memory limit:
#   deploy:
#     resources:
#       limits:
#         memory: 1G

# Restart with new limits
docker compose up -d
```

### 5. Slow API Responses

**Symptoms**: Response time > 500ms

**Diagnosis**:

```bash
# Check API latency metrics
curl -s http://localhost:4000/metrics | grep http_request_duration

# Check database query performance
docker compose logs api | grep "query"
```

**Solutions**:

- Check for N+1 queries in logs
- Add database indexes
- Scale API instances
- Enable response caching

### 6. Notifications Not Sending

**Symptoms**: Alerts not received, no delivery logs

**Diagnosis**:

```bash
# Check notifier health
curl http://localhost:4003/health

# Check notifier logs
docker compose logs notifier | grep -i "error\|fail"

# Check retry queue
docker compose exec redis redis-cli LLEN alerts-retry
```

**Solutions**:

```bash
# Verify SMTP credentials
docker compose exec notifier printenv | grep SMTP

# Test email manually
docker compose exec notifier node -e "require('./src/providers/email').sendEmail('test@example.com', 'Test')"

# Check webhook URL accessibility
curl -X POST $WEBHOOK_URL -d '{"test": true}'
```

### 7. Scheduler Not Creating Jobs

**Symptoms**: No health checks running, empty queue

**Diagnosis**:

```bash
# Check scheduler is running
docker compose logs scheduler | tail -20

# Check monitors exist
docker compose exec postgres psql -U postgres -d hyperverge -c "SELECT COUNT(*) FROM monitors WHERE deleted_at IS NULL"
```

**Solutions**:

```bash
# Restart scheduler
docker compose restart scheduler

# Manually trigger job creation
curl -X POST http://localhost:4002/trigger
```

### 8. Container Network Issues

**Symptoms**: Services can't communicate

**Diagnosis**:

```bash
# Check network exists
docker network ls

# Test inter-container connectivity
docker compose exec api ping -c 3 postgres
docker compose exec worker ping -c 3 redis
```

**Solutions**:

```bash
# Recreate network
docker compose down
docker network prune
docker compose up -d
```

## Log Analysis

### Find Errors

```bash
# All errors across services
docker compose logs | grep -i "error\|exception\|fail"

# Specific time range
docker compose logs --since="2026-01-19T10:00:00" --until="2026-01-19T11:00:00"
```

### Structured Log Queries

```bash
# Parse JSON logs
docker compose logs api | jq -r 'select(.level == "error") | .msg'

# Count errors by type
docker compose logs api | jq -r '.err.name' | sort | uniq -c | sort -rn
```

## Performance Profiling

### CPU Profiling

```bash
# Generate CPU profile
docker compose exec api node --cpu-prof apps/api/src/index.js
```

### Memory Profiling

```bash
# Generate heap snapshot
docker compose exec api node --heapsnapshot-signal=SIGUSR2 apps/api/src/index.js
kill -USR2 $(docker compose exec api pidof node)
```

## Recovery Procedures

### Full System Recovery

```bash
# Stop everything
docker compose down

# Remove volumes (CAUTION: loses data)
docker compose down -v

# Rebuild images
docker compose build --no-cache

# Start fresh
docker compose up -d

# Run migrations
docker compose exec api npx prisma migrate deploy
```

### Partial Recovery

```bash
# Restart only affected service
docker compose restart api

# Rebuild single service
docker compose build api
docker compose up -d api
```

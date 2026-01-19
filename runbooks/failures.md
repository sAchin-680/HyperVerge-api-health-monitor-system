# Failure Modes Runbook

This document describes common failure scenarios, their symptoms, and resolution steps.

## Failure Matrix

| Service    | Failure Mode       | Impact             | Detection          | Recovery Time |
| ---------- | ------------------ | ------------------ | ------------------ | ------------- |
| PostgreSQL | Connection refused | All services fail  | Health checks fail | 2-5 min       |
| PostgreSQL | Slow queries       | Delayed checks     | Metrics spike      | 1-2 min       |
| Redis      | Memory full        | Job queue fails    | Memory alerts      | 5-10 min      |
| Redis      | Connection lost    | No new checks      | Health checks fail | 2-5 min       |
| API        | Crash loop         | Users can't access | Restart count      | 1-2 min       |
| Worker     | Stalled jobs       | Checks delayed     | Queue depth        | 2-5 min       |
| Scheduler  | Duplicate jobs     | Wasted resources   | Job count spike    | 1-2 min       |
| Notifier   | Delivery failure   | No alerts sent     | DLQ depth          | 5-10 min      |

---

## PostgreSQL Failures

### Symptom: Connection Refused

**Indicators:**

- API returns 500 errors
- Workers fail to store results
- Health checks fail on all services

**Diagnosis:**

```bash
# Check PostgreSQL container
docker-compose ps postgres

# Check logs
docker-compose logs postgres --tail=100

# Verify connection
docker-compose exec postgres pg_isready
```

**Resolution:**

1. If container is down, restart it:

   ```bash
   docker-compose up -d postgres
   ```

2. If connection limit exceeded:

   ```bash
   docker-compose exec postgres psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"
   ```

3. Kill idle connections if needed:
   ```bash
   docker-compose exec postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND query_start < NOW() - INTERVAL '10 minutes';"
   ```

### Symptom: Slow Queries

**Indicators:**

- API response times > 1s
- Worker throughput drops
- Database CPU high

**Diagnosis:**

```bash
# Check active queries
docker-compose exec postgres psql -U postgres -c "SELECT pid, query, state, query_start FROM pg_stat_activity WHERE state = 'active';"

# Check for locks
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_locks WHERE granted = false;"
```

**Resolution:**

1. Kill long-running queries:

   ```bash
   docker-compose exec postgres psql -U postgres -c "SELECT pg_cancel_backend(PID);"
   ```

2. Check for missing indexes:

   ```bash
   docker-compose exec postgres psql -U postgres -c "EXPLAIN ANALYZE SELECT * FROM check_results WHERE monitor_id = 'xxx' ORDER BY checked_at DESC LIMIT 1;"
   ```

3. Run VACUUM if needed:
   ```bash
   docker-compose exec postgres psql -U postgres -c "VACUUM ANALYZE;"
   ```

---

## Redis Failures

### Symptom: Memory Full

**Indicators:**

- OOM errors in Redis logs
- Job queue operations fail
- Notification delivery stops

**Diagnosis:**

```bash
# Check memory usage
docker-compose exec redis redis-cli INFO memory

# Check key count
docker-compose exec redis redis-cli DBSIZE

# Find large keys
docker-compose exec redis redis-cli --bigkeys
```

**Resolution:**

1. Clear completed jobs:

   ```bash
   docker-compose exec redis redis-cli KEYS "bull:health-checks:completed*" | xargs docker-compose exec redis redis-cli DEL
   ```

2. Reduce job retention in code:

   ```typescript
   // In queue configuration
   removeOnComplete: {
     count: 100;
   } // Keep only last 100
   removeOnFail: {
     count: 50;
   } // Keep only last 50
   ```

3. Increase Redis memory limit:
   ```yaml
   # docker-compose.yml
   redis:
     command: redis-server --maxmemory 512mb --maxmemory-policy allkeys-lru
   ```

### Symptom: Connection Lost

**Indicators:**

- Scheduler can't enqueue jobs
- Workers can't dequeue jobs
- Notifier can't process deliveries

**Diagnosis:**

```bash
# Check Redis container
docker-compose ps redis

# Test connectivity
docker-compose exec redis redis-cli PING

# Check for network issues
docker-compose exec api nc -zv redis 6379
```

**Resolution:**

1. Restart Redis if crashed:

   ```bash
   docker-compose restart redis
   ```

2. Check persistence (RDB/AOF):

   ```bash
   docker-compose exec redis redis-cli CONFIG GET save
   docker-compose exec redis redis-cli LASTSAVE
   ```

3. Restore from backup if data lost:
   ```bash
   docker-compose stop redis
   cp backup/dump.rdb ./redis-data/dump.rdb
   docker-compose start redis
   ```

---

## API Service Failures

### Symptom: Crash Loop

**Indicators:**

- Container restart count increasing
- Health endpoint unreachable
- User requests fail

**Diagnosis:**

```bash
# Check container status
docker-compose ps api

# Check recent logs
docker-compose logs api --tail=200

# Check for OOM
docker stats api
```

**Resolution:**

1. Check for uncaught exceptions in logs

2. Increase memory limit if OOM:

   ```yaml
   # docker-compose.yml
   api:
     deploy:
       resources:
         limits:
           memory: 512M
   ```

3. Roll back to previous version if recent deploy:
   ```bash
   docker-compose pull api
   docker-compose up -d api
   ```

### Symptom: High Latency

**Indicators:**

- Response times > 1s
- Timeout errors
- User complaints

**Diagnosis:**

```bash
# Check CPU/memory
docker stats api

# Check database latency
docker-compose exec api curl -s localhost:4000/health | jq

# Check event loop
docker-compose logs api | grep "event loop"
```

**Resolution:**

1. Scale API horizontally:

   ```bash
   docker-compose up -d --scale api=3
   ```

2. Check for N+1 queries in logs

3. Add database connection pooling

---

## Worker Service Failures

### Symptom: Stalled Jobs

**Indicators:**

- Queue depth increasing
- Check results not updating
- Jobs marked as "stalled"

**Diagnosis:**

```bash
# Check queue depth
docker-compose exec redis redis-cli LLEN bull:health-checks:wait

# Check active jobs
docker-compose exec redis redis-cli LLEN bull:health-checks:active

# Check worker logs
docker-compose logs worker --tail=100
```

**Resolution:**

1. Restart stalled workers:

   ```bash
   docker-compose restart worker
   ```

2. Scale workers:

   ```bash
   docker-compose up -d --scale worker=3
   ```

3. Clear stuck jobs (last resort):
   ```bash
   # Clear stalled jobs
   docker-compose exec redis redis-cli DEL bull:health-checks:stalled-check
   ```

### Symptom: Check Timeouts

**Indicators:**

- Jobs failing with timeout errors
- External APIs slow
- High retry count

**Diagnosis:**

```bash
# Check failed jobs
docker-compose exec redis redis-cli LRANGE bull:health-checks:failed 0 10

# Check worker logs for timeouts
docker-compose logs worker | grep -i timeout
```

**Resolution:**

1. Increase check timeout in configuration

2. Add circuit breaker for flaky endpoints

3. Skip checks for known-slow endpoints temporarily

---

## Scheduler Service Failures

### Symptom: Duplicate Jobs

**Indicators:**

- Same monitor checked multiple times
- Job count higher than expected
- Wasted resources

**Diagnosis:**

```bash
# Count monitors
docker-compose exec postgres psql -U postgres -d monitoring -c "SELECT COUNT(*) FROM monitors;"

# Count jobs in queue
docker-compose exec redis redis-cli LLEN bull:health-checks:wait

# Check for multiple scheduler instances
docker-compose ps | grep scheduler
```

**Resolution:**

1. Ensure only ONE scheduler instance:

   ```bash
   docker-compose up -d --scale scheduler=1
   ```

2. Add job deduplication:

   ```typescript
   // Use monitor ID as job ID
   await queue.add('check', { monitorId }, { jobId: `check-${monitorId}` });
   ```

3. Clean up duplicate jobs:
   ```bash
   docker-compose exec redis redis-cli FLUSHDB  # Only in dev!
   ```

---

## Notifier Service Failures

### Symptom: Delivery Failures

**Indicators:**

- Dead letter queue growing
- No email/webhook received
- Retry count high

**Diagnosis:**

```bash
# Check DLQ
docker-compose exec redis redis-cli LLEN bull:notifications:failed

# Check logs
docker-compose logs notifier --tail=100

# Test email connectivity
docker-compose exec notifier curl -v smtp://mailserver:587
```

**Resolution:**

1. Check email provider credentials

2. Verify webhook endpoints are reachable:

   ```bash
   docker-compose exec notifier curl -v https://webhook.example.com/test
   ```

3. Retry failed notifications:
   ```bash
   # Move failed jobs back to waiting
   docker-compose exec redis redis-cli RPOPLPUSH bull:notifications:failed bull:notifications:wait
   ```

---

## Network Failures

### Symptom: Service-to-Service Communication Failed

**Indicators:**

- ECONNREFUSED errors
- DNS resolution failures
- Timeout errors between services

**Diagnosis:**

```bash
# Check Docker network
docker network inspect monitoring_default

# Test DNS resolution
docker-compose exec api nslookup postgres

# Test connectivity
docker-compose exec api ping redis
```

**Resolution:**

1. Restart Docker networking:

   ```bash
   docker-compose down
   docker-compose up -d
   ```

2. Recreate network:
   ```bash
   docker network rm monitoring_default
   docker-compose up -d
   ```

---

## Escalation Path

| Severity      | Response Time     | Who to Contact               |
| ------------- | ----------------- | ---------------------------- |
| P1 - Critical | 15 min            | On-call engineer + Team lead |
| P2 - High     | 1 hour            | On-call engineer             |
| P3 - Medium   | 4 hours           | Engineering team             |
| P4 - Low      | Next business day | Engineering team             |

### P1 Criteria

- All health checks failing
- Complete service outage
- Data loss risk

### P2 Criteria

- Partial service degradation
- Single component failure with impact
- Notification delivery failed

### P3 Criteria

- Performance degradation
- Non-critical feature failure
- Elevated error rates

### P4 Criteria

- Minor issues
- Cosmetic bugs
- Enhancement requests

---

## Post-Incident Checklist

After resolving any incident:

1. [ ] Document timeline in incident log
2. [ ] Identify root cause
3. [ ] Create follow-up tasks for prevention
4. [ ] Update runbooks if new failure mode
5. [ ] Schedule post-mortem if P1/P2
6. [ ] Verify all services healthy
7. [ ] Monitor for recurrence

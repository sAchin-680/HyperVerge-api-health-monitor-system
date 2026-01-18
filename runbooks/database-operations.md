# Database Operations Runbook

## Connection Information

| Environment | Host                             | Port | Database           |
| ----------- | -------------------------------- | ---- | ------------------ |
| Development | localhost                        | 5432 | hyperverge_dev     |
| Staging     | staging-db.xxx.rds.amazonaws.com | 5432 | hyperverge_staging |
| Production  | prod-db.xxx.rds.amazonaws.com    | 5432 | hyperverge_prod    |

## Daily Operations

### Check Database Health

```bash
# Connection test
psql $DATABASE_URL -c "SELECT 1"

# Check active connections
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity"

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()))"
```

### View Slow Queries

```sql
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## Migration Procedures

### Apply Migrations

```bash
# Development
cd packages/db
npx prisma migrate dev

# Production (use with caution)
npx prisma migrate deploy
```

### Rollback Migration

```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back MIGRATION_NAME

# Apply previous schema manually if needed
```

### Create Migration

```bash
# After schema changes
npx prisma migrate dev --name descriptive_name
```

## Backup and Recovery

### Manual Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to S3
aws s3 cp backup_*.sql s3://hyperverge-backups/database/
```

### Restore from Backup

```bash
# Download backup
aws s3 cp s3://hyperverge-backups/database/backup_YYYYMMDD.sql .

# Restore (WARNING: This overwrites data)
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

### Point-in-Time Recovery (RDS)

```bash
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier hyperverge-prod \
  --target-db-instance-identifier hyperverge-prod-recovery \
  --restore-time "2026-01-19T10:00:00Z"
```

## Performance Tuning

### Analyze Tables

```sql
ANALYZE monitors;
ANALYZE check_results;
ANALYZE incidents;
```

### Vacuum Tables

```sql
-- Regular vacuum
VACUUM ANALYZE monitors;

-- Full vacuum (locks table)
VACUUM FULL check_results;
```

### Index Maintenance

```sql
-- Check index usage
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Rebuild index
REINDEX INDEX idx_check_results_monitor_id;
```

## Data Cleanup

### Archive Old Check Results

```sql
-- Move old results to archive table
INSERT INTO check_results_archive
SELECT * FROM check_results
WHERE checked_at < NOW() - INTERVAL '90 days';

-- Delete archived records
DELETE FROM check_results
WHERE checked_at < NOW() - INTERVAL '90 days';
```

### Purge Resolved Incidents

```sql
-- Archive and delete old resolved incidents
DELETE FROM incidents
WHERE resolved_at < NOW() - INTERVAL '365 days';
```

## Emergency Procedures

### Kill Long-Running Queries

```sql
-- Find long queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 minutes';

-- Kill specific query
SELECT pg_terminate_backend(PID);
```

### Connection Pool Exhaustion

```bash
# Check connections by application
SELECT application_name, count(*)
FROM pg_stat_activity
GROUP BY application_name;

# Force disconnect idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND query_start < now() - interval '10 minutes';
```

# Database Schema

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Database Schema                                    │
│                                                                             │
│  ┌──────────────────────┐                                                   │
│  │        User          │                                                   │
│  ├──────────────────────┤                                                   │
│  │ id          UUID  PK │                                                   │
│  │ email       VARCHAR  │◄──── UNIQUE                                       │
│  │ password    VARCHAR  │                                                   │
│  │ created_at  TIMESTAMP│                                                   │
│  │ updated_at  TIMESTAMP│                                                   │
│  │ deleted_at  TIMESTAMP│◄──── Soft delete                                  │
│  └──────────┬───────────┘                                                   │
│             │                                                                │
│             │ 1:N                                                            │
│             │                                                                │
│             ▼                                                                │
│  ┌──────────────────────┐                                                   │
│  │       Monitor        │                                                   │
│  ├──────────────────────┤                                                   │
│  │ id          UUID  PK │                                                   │
│  │ user_id     UUID  FK │──────────────────────────────┐                    │
│  │ name        VARCHAR  │                               │                    │
│  │ url         VARCHAR  │◄──── Max 2048 chars          │                    │
│  │ interval    INTEGER  │◄──── Check interval (sec)    │                    │
│  │ created_at  TIMESTAMP│                               │                    │
│  │ updated_at  TIMESTAMP│                               │                    │
│  │ deleted_at  TIMESTAMP│                               │                    │
│  └──────────┬───────────┘                               │                    │
│             │                                            │                    │
│     ┌───────┴───────┐                                   │                    │
│     │               │                                    │                    │
│     │ 1:N           │ 1:N                               │                    │
│     ▼               ▼                                    │                    │
│  ┌──────────────────────┐    ┌──────────────────────┐   │                    │
│  │    CheckResult       │    │      Incident        │   │                    │
│  ├──────────────────────┤    ├──────────────────────┤   │                    │
│  │ id         UUID   PK │    │ id         UUID   PK │   │                    │
│  │ monitor_id UUID   FK │    │ monitor_id UUID   FK │   │                    │
│  │ status     ENUM      │    │ started_at TIMESTAMP │   │                    │
│  │ response_ms INTEGER  │    │ resolved_at TIMESTAMP│   │                    │
│  │ checked_at TIMESTAMP │    │ created_at TIMESTAMP │   │                    │
│  │ created_at TIMESTAMP │    │ updated_at TIMESTAMP │   │                    │
│  │ updated_at TIMESTAMP │    └──────────────────────┘   │                    │
│  └──────────────────────┘                               │                    │
│                                                          │                    │
│  ┌──────────────────────┐                               │                    │
│  │      Delivery        │                               │                    │
│  ├──────────────────────┤                               │                    │
│  │ id         UUID   PK │                               │                    │
│  │ alert_id   VARCHAR   │                               │                    │
│  │ user_id    UUID   FK │───────────────────────────────┘                    │
│  │ type       VARCHAR   │◄──── 'email' | 'webhook'                          │
│  │ target     VARCHAR   │                                                    │
│  │ status     VARCHAR   │◄──── 'pending'|'sent'|'failed'                    │
│  │ attempts   INTEGER   │                                                    │
│  │ sent_at    TIMESTAMP │                                                    │
│  │ created_at TIMESTAMP │                                                    │
│  │ updated_at TIMESTAMP │                                                    │
│  └──────────────────────┘                                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Enums

### MonitorStatus

```sql
CREATE TYPE monitor_status AS ENUM ('up', 'down');
```

## Indexes

```sql
-- User lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);

-- Monitor queries
CREATE INDEX idx_monitors_user_id ON monitors(user_id);
CREATE INDEX idx_monitors_url ON monitors(url);

-- Check result queries (time-series)
CREATE INDEX idx_check_results_monitor_id ON check_results(monitor_id);
CREATE INDEX idx_check_results_status ON check_results(status);
CREATE INDEX idx_check_results_checked_at ON check_results(checked_at DESC);

-- Incident queries
CREATE INDEX idx_incidents_monitor_id ON incidents(monitor_id);
CREATE INDEX idx_incidents_started_at ON incidents(started_at DESC);

-- Delivery queries
CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
```

## Data Retention

| Table | Retention | Archive Strategy |
|-------|-----------|------------------|
| users | Indefinite | Soft delete |
| monitors | Indefinite | Soft delete |
| check_results | 90 days | Archive to S3 |
| incidents | 1 year | Archive to S3 |
| deliveries | 30 days | Delete |

## Sample Queries

### Get Monitor Status

```sql
SELECT m.id, m.name, m.url,
       cr.status, cr.response_ms, cr.checked_at
FROM monitors m
LEFT JOIN LATERAL (
    SELECT status, response_ms, checked_at
    FROM check_results
    WHERE monitor_id = m.id
    ORDER BY checked_at DESC
    LIMIT 1
) cr ON true
WHERE m.user_id = $1
  AND m.deleted_at IS NULL;
```

### Get Active Incidents

```sql
SELECT i.*, m.name as monitor_name, m.url as monitor_url
FROM incidents i
JOIN monitors m ON i.monitor_id = m.id
WHERE i.resolved_at IS NULL
ORDER BY i.started_at DESC;
```

### Uptime Calculation

```sql
SELECT 
    monitor_id,
    COUNT(*) FILTER (WHERE status = 'up') * 100.0 / COUNT(*) as uptime_percentage
FROM check_results
WHERE checked_at > NOW() - INTERVAL '24 hours'
GROUP BY monitor_id;
```

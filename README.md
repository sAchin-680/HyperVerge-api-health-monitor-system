# HyperVerge API Health Monitor System

Production-grade distributed API health monitoring system with real-time alerting and observability.

## Features

- **Multi-service architecture** - API, Worker, Scheduler, Notifier microservices
- **Real-time monitoring** - Continuous API health checks
- **Incident management** - Automatic incident detection and tracking
- **Multi-channel notifications** - Email and webhook alerts
- **Retry mechanisms** - Exponential backoff with dead-letter queues
- **Production observability** - Health checks, Prometheus metrics, structured logging
- **Queue-based architecture** - BullMQ for reliable job processing
- **Kubernetes-ready** - Health probes and container-friendly

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    System Architecture                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐    ┌──────────┐    ┌────────┐    ┌──────────┐   │
│  │ API  │───▶│Scheduler │───▶│ Worker │───▶│ Notifier │   │
│  └──────┘    └──────────┘    └────────┘    └──────────┘   │
│     │             │               │              │          │
│     ▼             ▼               ▼              ▼          │
│  ┌────────────────────────────────────────────────────┐    │
│  │           PostgreSQL + Redis + BullMQ             │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/sAchin-680/HyperVerge-api-health-monitor-system.git
cd HyperVerge-api-health-monitor-system

# Install dependencies
npm install

# Setup database
cd packages/db
npx prisma migrate deploy
npx prisma generate

# Start services
cd ../../apps/api && npm run dev        # Port 4000
cd ../../apps/scheduler && npm run dev  # Port 4002
cd ../../apps/worker && npm run dev     # Port 4001
cd ../../apps/notifier && npm run dev   # Port 4003
```

### Configuration

Create `.env` files in each service:

```bash
# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/healthmonitor"
JWT_SECRET="your-secret-key"
PORT=4000

# apps/worker/.env
DATABASE_URL="postgresql://user:password@localhost:5432/healthmonitor"
REDIS_URL="redis://localhost:6379"
WORKER_PORT=4001

# apps/scheduler/.env
DATABASE_URL="postgresql://user:password@localhost:5432/healthmonitor"
REDIS_URL="redis://localhost:6379"
SCHEDULER_PORT=4002

# apps/notifier/.env
DATABASE_URL="postgresql://user:password@localhost:5432/healthmonitor"
REDIS_HOST="localhost"
REDIS_PORT=6379
NOTIFIER_PORT=4003
```

## Observability

All services expose production-grade observability endpoints:

### Health Checks

```bash
# Check service health
curl http://localhost:4000/health  # API
curl http://localhost:4001/health  # Worker
curl http://localhost:4002/health  # Scheduler
curl http://localhost:4003/health  # Notifier
```

### Metrics (Prometheus)

```bash
# Scrape metrics
curl http://localhost:4000/metrics
curl http://localhost:4001/metrics
curl http://localhost:4002/metrics
curl http://localhost:4003/metrics
```

### Structured Logs

All services use Pino for structured JSON logging:

```bash
# Set log level
LOG_LEVEL=debug npm run dev
```

## Services

### API Service (Port 4000)

- User authentication
- Monitor CRUD operations
- REST API endpoints
- Health checks and metrics

### Scheduler Service (Port 4002)

- Periodic job scheduling
- Job queue management
- Dead-letter queue handling
- Metrics on scheduled jobs

### Worker Service (Port 4001)

- Execute health checks
- HTTP/HTTPS endpoint monitoring
- Incident detection
- Performance metrics collection

### Notifier Service (Port 4003)

- Multi-channel delivery (email, webhook)
- Retry mechanism with exponential backoff
- Delivery tracking
- Notification metrics

## API Endpoints

### Authentication

```bash
POST /auth/register  # Register new user
POST /auth/login     # Login user
```

### Monitors

```bash
GET    /monitors           # List all monitors
POST   /monitors           # Create monitor
GET    /monitors/:id       # Get monitor details
PATCH  /monitors/:id       # Update monitor
DELETE /monitors/:id       # Delete monitor
```

### Observability

```bash
GET /health   # Health check
GET /ready    # Readiness probe
GET /live     # Liveness probe
GET /metrics  # Prometheus metrics
```

## Monitoring Metrics

### Key Metrics

- **http_request_duration_seconds** - API latency
- **monitor_checks_executed_total** - Total checks performed
- **notifier_notifications_sent_total** - Notifications delivered
- **scheduler_jobs_scheduled_total** - Jobs scheduled
- **incidents_created_total** - Incidents detected

### Grafana Queries

```promql
# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m])

# Worker throughput
rate(monitor_checks_executed_total[5m])
```

## Testing

```bash
# Test API
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Check metrics
curl http://localhost:4000/metrics | grep http_requests_total
```

## Docker Support

```bash
# Build images
docker build -t api-health-monitor-api ./apps/api
docker build -t api-health-monitor-worker ./apps/worker
docker build -t api-health-monitor-scheduler ./apps/scheduler
docker build -t api-health-monitor-notifier ./apps/notifier

# Run with Docker Compose (coming soon)
docker-compose up
```

## Project Structure

```
.
├── apps/
│   ├── api/              # REST API service
│   ├── scheduler/        # Job scheduler
│   ├── worker/           # Health check executor
│   └── notifier/         # Notification service
├── packages/
│   ├── db/               # Prisma schema & migrations
│   └── shared/           # Shared types
└── docs/
    ├── OBSERVABILITY.md  # Full observability guide
    └── OBSERVABILITY_QUICK_REF.md  # Quick reference
```

## Technology Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL + Prisma ORM
- **Queue:** Redis + BullMQ
- **Logging:** Pino (structured JSON)
- **Metrics:** prom-client (Prometheus)
- **Auth:** JWT

## Alerting

Configure alerts in Prometheus:

```yaml
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: 'High error rate detected'

- alert: ServiceDown
  expr: up{job="api-health-monitor"} == 0
  for: 1m
  annotations:
    summary: 'Service is down'
```

## Performance

- **Throughput:** 1000+ checks/min per worker
- **Latency:** P95 <100ms for API endpoints
- **Availability:** 99.9% uptime with proper infrastructure
- **Scalability:** Horizontal scaling via worker instances

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see LICENSE file for details

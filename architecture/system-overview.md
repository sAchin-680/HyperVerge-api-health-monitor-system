# System Overview

## High-Level Architecture

```
                                    Internet
                                       │
                                       ▼
                            ┌──────────────────┐
                            │   Load Balancer  │
                            │      (ALB)       │
                            └────────┬─────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 │                   │                   │
                 ▼                   ▼                   ▼
         ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
         │   Web App    │   │   API (x2)   │   │   Metrics    │
         │  (Next.js)   │   │  (Express)   │   │  (Prometheus)│
         └──────────────┘   └──────┬───────┘   └──────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
            ┌──────────────┐             ┌──────────────┐
            │  PostgreSQL  │             │    Redis     │
            │   (RDS)      │             │ (ElastiCache)│
            └──────────────┘             └──────┬───────┘
                                                │
                           ┌────────────────────┼────────────────────┐
                           │                    │                    │
                           ▼                    ▼                    ▼
                   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
                   │  Scheduler   │    │  Worker (x5) │    │   Notifier   │
                   │              │    │              │    │    (x2)      │
                   └──────────────┘    └──────────────┘    └──────────────┘
                           │                    │                    │
                           │                    │                    │
                           └────────────────────┼────────────────────┘
                                                │
                                                ▼
                                    ┌──────────────────┐
                                    │ External APIs &  │
                                    │ Notification     │
                                    │ Channels         │
                                    └──────────────────┘
```

## Service Descriptions

### Web Application (Next.js)

- User interface for managing monitors
- Dashboard for viewing status and incidents
- Authentication and user management
- Server-side rendering for performance

### API Service (Express)

- RESTful API for CRUD operations
- JWT-based authentication
- Request validation and rate limiting
- Serves health checks and metrics

### Scheduler Service

- Runs on a fixed interval (every 30 seconds)
- Queries database for active monitors
- Produces jobs to Redis queue
- Single instance to prevent duplicate jobs

### Worker Service

- Consumes jobs from Redis queue
- Executes HTTP health checks
- Stores results in database
- Detects state changes (UP/DOWN)
- Creates/resolves incidents
- Horizontally scalable

### Notifier Service

- Consumes alert events from queue
- Sends email notifications (SMTP)
- Sends webhook notifications (HTTP)
- Implements retry with exponential backoff
- Logs delivery status

## Communication Patterns

### Synchronous (HTTP)

- Web ↔ API: REST API calls
- API → Database: Prisma ORM

### Asynchronous (Redis/BullMQ)

- Scheduler → Worker: Job queue
- Worker → Notifier: Alert events
- Notifier → Retry Queue: Failed deliveries

## Scalability

| Service | Scaling Strategy | Bottleneck |
|---------|------------------|------------|
| API | Horizontal (stateless) | Database connections |
| Worker | Horizontal (stateless) | Redis throughput |
| Scheduler | Single instance | N/A (leader election) |
| Notifier | Horizontal (stateless) | External service limits |

## Fault Tolerance

### Database Failures

- Connection pooling with retries
- Read replicas for queries (future)
- Multi-AZ deployment in production

### Redis Failures

- Persistent storage enabled
- Cluster mode for HA (future)
- Graceful degradation

### Service Failures

- Health checks for container orchestration
- Automatic restarts
- Circuit breakers (future)

# Docker Configuration

This directory contains centralized Docker configurations for the HyperVerge API Health Monitor System.

## Directory Structure

```
docker/
├── README.md
├── api.Dockerfile
├── worker.Dockerfile
├── scheduler.Dockerfile
├── notifier.Dockerfile
└── base.Dockerfile
```

## Base Image

All services use Node.js 20 Alpine as the base image for minimal footprint and security.

## Building Images

### Build All Services

```bash
# From project root
docker compose build
```

### Build Individual Service

```bash
docker build -f docker/api.Dockerfile -t hyperverge-api .
docker build -f docker/worker.Dockerfile -t hyperverge-worker .
docker build -f docker/scheduler.Dockerfile -t hyperverge-scheduler .
docker build -f docker/notifier.Dockerfile -t hyperverge-notifier .
```

## Image Tags

| Environment | Tag Format      |
| ----------- | --------------- |
| Development | `latest`        |
| Staging     | `staging-{sha}` |
| Production  | `v{version}`    |

## Security

- All images run as non-root user
- Multi-stage builds to minimize attack surface
- Only production dependencies included
- Health checks configured for container orchestration

## Environment Variables

Each service requires specific environment variables. See individual Dockerfile comments and `.env.example` for details.

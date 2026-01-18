# System Architecture

This directory contains architecture documentation and diagrams for the HyperVerge API Health Monitor System.

## Contents

| Document | Description |
|----------|-------------|
| [System Overview](system-overview.md) | High-level architecture |
| [Data Flow](data-flow.md) | Request and data flow diagrams |
| [Infrastructure](infrastructure.md) | AWS infrastructure architecture |
| [Database Schema](database-schema.md) | Entity relationship diagram |

## Architecture Principles

1. **Microservices** - Loosely coupled, independently deployable services
2. **Event-Driven** - Asynchronous communication via message queues
3. **Fault Tolerance** - Graceful degradation and retry mechanisms
4. **Observability** - Comprehensive logging, metrics, and tracing
5. **Security** - Defense in depth, least privilege access

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, React, TypeScript |
| API | Express.js, TypeScript |
| Database | PostgreSQL |
| Cache/Queue | Redis, BullMQ |
| Infrastructure | AWS ECS, RDS, ElastiCache |
| Monitoring | Prometheus, Grafana |
| CI/CD | GitHub Actions |

## Quick Reference

### Service Ports

| Service | Port | Protocol |
|---------|------|----------|
| API | 4000 | HTTP |
| Worker | 4001 | HTTP (health only) |
| Scheduler | 4002 | HTTP (health only) |
| Notifier | 4003 | HTTP (health only) |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |

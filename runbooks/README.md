# Operational Runbooks

This directory contains operational runbooks for the HyperVerge API Health Monitor System.

## Runbook Index

| Runbook                                       | Description                                |
| --------------------------------------------- | ------------------------------------------ |
| [Deployment](deployment.md)                   | Production deployment procedures           |
| [Incident Response](incident-response.md)     | Handling production incidents              |
| [Database Operations](database-operations.md) | Database maintenance and recovery          |
| [Scaling](scaling.md)                         | Horizontal and vertical scaling procedures |
| [Troubleshooting](troubleshooting.md)         | Common issues and solutions                |

## On-Call Responsibilities

1. Monitor alerting channels (Slack, PagerDuty)
2. Acknowledge incidents within 5 minutes
3. Follow appropriate runbook for resolution
4. Document incident in post-mortem

## Escalation Path

| Level | Contact             | Response Time |
| ----- | ------------------- | ------------- |
| L1    | On-call Engineer    | 5 minutes     |
| L2    | Team Lead           | 15 minutes    |
| L3    | Engineering Manager | 30 minutes    |

## Quick Reference

### Health Check URLs

| Service   | Health Endpoint                |
| --------- | ------------------------------ |
| API       | `http://api:4000/health`       |
| Worker    | `http://worker:4001/health`    |
| Scheduler | `http://scheduler:4002/health` |
| Notifier  | `http://notifier:4003/health`  |

### Key Metrics

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request latency
- `checks_executed_total` - Health checks performed
- `incidents_created_total` - Incidents detected

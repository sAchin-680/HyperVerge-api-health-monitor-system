# Data Flow

## Monitor Check Flow

```
┌─────────────┐
│  Scheduler  │
│  (30s loop) │
└──────┬──────┘
       │
       │ 1. Query active monitors
       ▼
┌─────────────┐
│ PostgreSQL  │
│  monitors   │
└──────┬──────┘
       │
       │ 2. Get monitor list
       ▼
┌─────────────┐
│  Scheduler  │
└──────┬──────┘
       │
       │ 3. Add jobs to queue
       ▼
┌─────────────┐
│    Redis    │
│ monitor-    │
│   queue     │
└──────┬──────┘
       │
       │ 4. Consume job
       ▼
┌─────────────┐
│   Worker    │
└──────┬──────┘
       │
       │ 5. Execute HTTP check
       ▼
┌─────────────┐
│  Target URL │
│  (monitored │
│   service)  │
└──────┬──────┘
       │
       │ 6. Response (success/fail)
       ▼
┌─────────────┐
│   Worker    │
└──────┬──────┘
       │
       │ 7. Store result
       ▼
┌─────────────┐
│ PostgreSQL  │
│check_results│
└─────────────┘
```

## Incident Detection Flow

```
┌─────────────┐
│   Worker    │
│ (after check)│
└──────┬──────┘
       │
       │ 1. Evaluate state change
       ▼
┌─────────────────────────────┐
│ State Evaluator             │
│                             │
│ Compare current vs previous │
│ status from check_results   │
└──────┬──────────────────────┘
       │
       │ 2. If state changed
       ▼
┌─────────────────────────────┐
│ Incident Manager            │
│                             │
│ DOWN → Create incident      │
│ UP   → Resolve incident     │
└──────┬──────────────────────┘
       │
       │ 3. Update database
       ▼
┌─────────────┐
│ PostgreSQL  │
│  incidents  │
└──────┬──────┘
       │
       │ 4. Queue notification
       ▼
┌─────────────┐
│    Redis    │
│   alerts    │
│   queue     │
└─────────────┘
```

## Notification Delivery Flow

```
┌─────────────┐
│    Redis    │
│   alerts    │
│   queue     │
└──────┬──────┘
       │
       │ 1. Consume alert
       ▼
┌─────────────┐
│  Notifier   │
└──────┬──────┘
       │
       │ 2. Determine channel
       ▼
┌────────────────────────────────┐
│         Alert Router           │
│                                │
│ type: 'email'  → Email Provider│
│ type: 'webhook'→ Webhook       │
└──────┬─────────────┬───────────┘
       │             │
       ▼             ▼
┌──────────┐  ┌──────────────┐
│   SMTP   │  │   Webhook    │
│  Server  │  │   Endpoint   │
└──────────┘  └──────────────┘
       │             │
       └──────┬──────┘
              │
              │ 3. Log delivery
              ▼
       ┌─────────────┐
       │ PostgreSQL  │
       │ deliveries  │
       └─────────────┘
```

## API Request Flow

```
┌─────────────┐
│   Client    │
│ (Browser/   │
│  Mobile)    │
└──────┬──────┘
       │
       │ 1. HTTP Request
       ▼
┌─────────────┐
│ Load        │
│ Balancer    │
└──────┬──────┘
       │
       │ 2. Route to API
       ▼
┌─────────────────────────────────────────────┐
│                 API Service                  │
│                                             │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │ Logger  │→ │   Auth   │→ │ Validator │  │
│  │Middleware│  │Middleware│  │ Middleware│  │
│  └─────────┘  └──────────┘  └───────────┘  │
│                     │                       │
│                     ▼                       │
│              ┌──────────┐                   │
│              │Controller│                   │
│              └────┬─────┘                   │
│                   │                         │
│                   ▼                         │
│              ┌──────────┐                   │
│              │ Service  │                   │
│              └────┬─────┘                   │
│                   │                         │
└───────────────────┼─────────────────────────┘
                    │
                    │ 3. Database query
                    ▼
             ┌─────────────┐
             │ PostgreSQL  │
             └──────┬──────┘
                    │
                    │ 4. Response
                    ▼
             ┌─────────────┐
             │   Client    │
             └─────────────┘
```

## Data Models

### Core Entities

```
User (1) ────────< (N) Monitor
                         │
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
    CheckResult (N)          Incident (N)
```

### Event Flow

```
Monitor Created
       │
       ▼
Scheduler Picks Up
       │
       ▼
Job Added to Queue
       │
       ▼
Worker Processes
       │
       ├── Success → Status: UP
       │
       └── Failure → Status: DOWN
                          │
                          ▼
                   Incident Created
                          │
                          ▼
                   Alert Queued
                          │
                          ▼
                   Notification Sent
```

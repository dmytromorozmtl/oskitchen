# Reliability & Observability Layer

## Goals

- Normalize **failure signals** across webhooks, channel sync, notifications, imports/exports, automations, and audit exports.  
- Provide **workspace** and **platform** views without exposing secrets, raw payloads, or tokens.

## Implementation (this pass)

| Path | Purpose |
|------|---------|
| `lib/observability/status-types.ts` | Rollup counts + HEALTHY/DEGRADED/CRITICAL heuristic |
| `lib/observability/severity.ts` | Severity ordering helpers |
| `lib/observability/redaction.ts` | Truncation + basic secret-pattern stripping |
| `services/observability/error-event-service.ts` | Prisma-backed `ObservabilityErrorEvent` list + rollups |
| `services/observability/observability-service.ts` | `loadWorkspaceObservabilityPanel` / `loadPlatformObservabilityPanel` |
| `services/observability/health-check-service.ts` | DB ping + boolean provider hints |
| `services/observability/job-monitor-service.ts` | `ChannelSyncJob`, `ExportJob`, `ImportJob`, automation failure counts |
| `services/observability/incident-service.ts` | Re-export of `developer/incident-service` |

## UI surfaces

- `/dashboard/system-health` — observability card (7d window + latest events).  
- `/platform/health` — environment + rollup tiles + honest limitations.  
- `/platform/errors` — cross-tenant recent failures (redacted).  
- `/platform/jobs` — queue counters (not distributed tracing).  
- `/platform/incidents` — audit-derived incident metadata.  
- `/platform/automations` — added **redacted error** column.

## Non-goals (explicit)

- Not a replacement for Datadog / Grafana / OpenTelemetry — export hooks remain future work.  
- Does **not** auto-retry payments, inventory writes, or destructive imports.

## Next steps

1. Pagination + workspace filters on `/platform/errors`.  
2. Correlation IDs surfaced from `AuditLog.requestId` where present.  
3. Webhook replay server action with approval + idempotency keys.

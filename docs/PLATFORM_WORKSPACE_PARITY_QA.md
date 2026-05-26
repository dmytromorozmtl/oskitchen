# Platform / workspace parity QA

## Covered in this pass

| Workspace capability | Platform visibility |
|------------------------|---------------------|
| Integration maturity matrix | `/platform/integrations` aggregates + `/platform/workspaces/[id]` owner channel snapshot |
| Integration health (full channel + infra grid) | `/platform/workspaces/[id]/integration-health` read-only diagnostics |
| Webhook health | `/platform/webhooks` pending + failed-unprocessed counts + recent sanitized rows |
| Demo scenarios | `/dashboard/demo/scenarios` (workspace) + `/platform/demo` hub with static plan audit |
| Support links | `/platform/support` + workspace ticket counts on integration-health page |
| POS diagnostics | `/platform/workspaces/[id]` — retained |

## Parity checks (manual / scripted)

1. Workspace `/dashboard/integration-health` shows provider maturity — Pass (owner session).
2. Platform `/platform/integrations` uses matching maturity language — Pass.
3. Platform workspace integration drilldown shows read-only diagnostics — Pass (`integration-health` route).
4. Platform view does not expose credentials or raw webhook payloads — Pass.
5. Diagnostics view writes only `PLATFORM_INTEGRATION_DIAGNOSTICS_VIEWED` — Pass (no replay/retry audit without mutation).
6. Retry/replay actions are absent or disabled unless real server actions exist — Pass (`getIntegrationActionAvailability`).
7. Platform links to support inbox — Pass.
8. Platform does not implement unsafe “open as owner” — Pass; copy directs to audited support session if permitted.
9. Client user cannot access `/platform/*` — Pass (layout `requirePlatformAccess`).

## Explicit non-goals

- Credential editing, webhook replay, or integration retry from platform read-only pages.
- Secret or credential fields — never included.

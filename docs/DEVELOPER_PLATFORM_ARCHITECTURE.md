# Developer Platform Architecture

## Layers

1. **Access** — `lib/developer/developer-permissions.ts` (`requireDeveloperCenterAccess`) — workspace **OWNER** or **platform superadmin** (`workspace.moroz@gmail.com` / `platform_user_roles.SUPER_ADMIN`).
2. **Presentation** — `app/dashboard/developer/*` + `components/developer/developer-sidebar.tsx` (client nav).
3. **Orchestration** — `services/developer/developer-service.ts` aggregates KPIs for the hub.
4. **Domains**
   - `environment-service` — presence diagnostics (no values).
   - `platform-health-service` — DB probe + env/Stripe/Resend synthesis.
   - `webhook-monitor-service` — `WebhookEvent` aggregates.
   - `queue-monitor-service` / `job-monitor-service` — channel sync, imports, export jobs.
   - `integration-health-service` — `IntegrationConnection` cards (no tokens).
   - `incident-service` — reads `AuditLog` rows with `platform.incident*` actions.
   - `logging-service` — developer-scoped audit tail.
   - `release-service`, `deployment-service`, `platform-analytics-service` — release stats, deploy hints, APM placeholders.

## Data flows

- **Incidents** → `auditLog` (`category: DEVELOPER`, metadata JSON) — no new Prisma models required.
- **Tools** → server actions in `actions/developer-platform.ts` → `auditLog` + `revalidatePath`.

## Non-goals (this iteration)

- Persisted log search index, distributed traces, multi-region failover UI (documented gaps only).

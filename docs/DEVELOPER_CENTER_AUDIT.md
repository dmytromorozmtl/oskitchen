# Developer Center — Phase 1 Audit

**Scope:** `/dashboard/developer` hub, releases, API keys, webhooks, environment checks, email previews, integrations, audit logs, notifications, observability gaps.  
**Principles:** No secret values in UI; tenant isolation; `workspace.moroz@gmail.com` / platform superadmin retains break-glass access.

---

## 1. `/dashboard/developer` (hub)

| Dimension | Current (pre-upgrade) | Limitation | Dev risk | Prod risk | Scale | Recommended architecture | Priority |
|-----------|----------------------|------------|----------|-----------|-------|---------------------------|----------|
| UX | Static cards + env table | No operational KPIs | Hard to triage | Miss outages | N/A | Snapshot service + KPI cards | P0 |
| Navigation | Single page | Deep tools buried | Slow path | Delayed response | N/A | Sidebar + section routes | P0 |
| Health | Env rows only | No DB/Stripe/Resend synthesis | False confidence | Launch gaps | N/A | `platform-health-service` probes | P0 |

**Implemented:** Hub redesign with KPIs, badges (environment, version, health, incidents), deep links to new routes, `getDeveloperCenterSnapshot`.

---

## 2. Release notes

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Workflow | Draft/publish forms | No semver gates, migration warnings | Drift vs runtime `APP_VERSION` | `release-service` + `lib/version.ts` linkage | P1 |
| Categories | Free text | No structured changelog taxonomy | Inconsistent comms | Add categories + internal flag in DB (future) | P2 |

**Implemented:** Release stats (total/published/drafts), version label surfaced from `lib/version.ts`.

---

## 3. API keys

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Storage | Hashed keys, prefix visible | No per-key scopes in DB | Over-privileged keys | Add `scopes_json`, `expires_at` (migration) | P1 |
| Analytics | None | No request metering | Abuse blind spot | Edge access logs + aggregate table | P2 |

**Implemented:** Governance scope catalog in UI; superadmin can manage keys (aligned with billing bypass).

---

## 4. Webhook signals

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Data | Counts on hub | No timeline | Debug latency | `webhook-monitor-service` + `/webhooks` | P0 |
| Replay | External webhooks page | Not unified under Developer | Fragmented ops | Centralize + audit (dangerous ops) | P1 |

**Implemented:** `/dashboard/developer/webhooks` with 24h stats + recent rows (pipeline status derived).

---

## 5. Environment checks

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Grouping | Flat `getEnvHealth()` groups | Not aligned to platform taxonomy | Onboarding friction | `environment-service` + `environment-groups` | P1 |
| Status | ok / unset / blocked | No `deprecated` / `invalid` | Tech debt invisible | Extend rules without exposing values | P2 |

**Implemented:** Diagnostics rows with `ok | missing | insecure | deprecated` mapping; grouped view on `/health#env`.

---

## 6. Email preview

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Access | Dev-only 404 prod | OK | Low | Keep | P3 |

**Preserved:** Production `notFound()`; access uses `requireDeveloperCenterAccess`.

---

## 7. Integrations

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Visibility | Hub badges only | No per-provider card | Support load | `integration-health-service` + `/integrations` | P1 |

**Implemented:** Connection list with status, last sync, webhook secret presence (boolean only).

---

## 8. Audit logs integration

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Developer actions | Not emitted | Weak accountability | Compliance | `auditLog` category `DEVELOPER` | P0 |
| Incidents | No model | N/A | Ops memory loss | Store incidents as auditable events | P0 |

**Implemented:** `actions/developer-platform.ts` — incidents, env validation, tool ping; `/logs` lists developer-scoped audit rows.

---

## 9. Notifications integration

| Dimension | Current | Limitation | Risk | Architecture | Priority |
|-----------|---------|------------|------|----------------|----------|
| Alerts | None from Developer | Reactive only | Miss SLA | Hook notification service on failed webhooks / queue depth | P2 |

**Gap:** Wire `notification-center` triggers when webhook failure rate exceeds threshold (future).

---

## 10. Observability gaps

- **Logs / tracing:** No unified log sink in-app — **mitigation:** audit + lifecycle placeholders; `/logs` for developer audit slice.
- **Metrics:** No APM — **mitigation:** `platform-analytics-service` stub + `/performance`.
- **Queues:** Partial — **implemented:** Prisma-backed queue/job snapshot.
- **Cron:** No heartbeat table — **gap:** expose cron route health when `CRON_SECRET` probes exist.
- **Error monitoring:** No Sentry/Datadog — **gap:** document in architecture.

---

## 11. Deployment tooling

| Dimension | Current | Gap | Priority |
|-----------|---------|-----|----------|
| Deploy metadata | Vercel env vars only | No pipeline UI | P2 |

**Implemented:** `deployment-service` hints (SHA, deployment id, `VERCEL_ENV`).

---

## 12. SDK / documentation

| Dimension | Current | Gap | Priority |
|-----------|---------|-----|----------|
| Public portal | Separate `/developers` | Not linked from hub | P1 |

**Implemented:** `/dashboard/developer/docs` hub page (internal).

---

## 13. Security / governance

- Secrets: never returned from new services.
- Dangerous tools: minimal audited actions only; broader tools behind future rate limits + role matrix.
- Tenant isolation: webhook/integration/job queries scoped by `userId`; incidents/logs respect `platformSuper` for global visibility.

---

## Summary priority backlog

1. **P0** — Hub, health synthesis, webhook monitor, audit for developer actions, navigation (done).  
2. **P1** — API key scopes in schema, webhook replay with strict audit, notification hooks.  
3. **P2** — APM wiring, cron heartbeats, public developer portal cross-links, advanced release workflow.

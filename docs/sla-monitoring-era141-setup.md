# SLA Monitoring smoke setup (Era 141)

Era 141 certifies SLA Monitoring wiring: enterprise uptime, response time, and alerting across platform and integration fleet.

## Wiring surfaces

| Path | Role |
|------|------|
| `services/enterprise/sla-service.ts` | Dashboard loader — DB health, integration fleet, cron, webhooks |
| `lib/enterprise/sla-monitoring-builders.ts` | Signals, alerts, uptime score, dashboard assembly |
| `lib/enterprise/sla-monitoring-policy.ts` | Policy id, route, targets, four monitoring signals |
| `app/dashboard/enterprise/sla/page.tsx` | Enterprise SLA monitoring page |
| `components/enterprise/sla-monitoring-panel.tsx` | KPIs, SLA signals, active alerts |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:sla-monitoring-era141` | Full era141 cert + wiring audit |
| `npm run test:ci:sla-monitoring-era141` | Era141 + ENT-68 unit tests |
| `npm run test:ci:sla-monitoring-era141:cert` | Wiring cert only (CI gate) |

## Human activation

1. Open **Dashboard → Enterprise → SLA Monitoring**.
2. Review uptime, DB latency, fleet score, and alert count KPIs.
3. Inspect **SLA signals** — platform health, integration fleet, cron, webhooks.
4. Check **Active alerts** for latency and reliability breaches.
5. Run `npm run smoke:sla-monitoring-era141` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `uptime` | Composite uptime from DB, integrations, cron |
| `response_time` | DB probe + integration check latency/P95 |
| `alerts` | Latency, critical integrations, webhooks, cron failures |

## Artifact

Summary written to `artifacts/sla-monitoring-smoke-summary.json` (gitignored).

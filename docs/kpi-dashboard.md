# KPI dashboard — OS Kitchen platform

**Policy:** `kpi-dashboard-absolute-final-v1`  
**Route:** `/platform/kpi`  
**Audience:** Platform operators (founder / internal ops)  
**Status:** **Live UI** — metrics populate from Postgres + observability; MRR awaits full Stripe rollup

Unified view of the six KPIs called out in the Absolute Final audit (Task 68). Complements the owner-facing [`/dashboard/growth`](./GROWTH_MODULE_AUDIT.md) command center and the manual [`mvp-marketing-dashboard.md`](./mvp-marketing-dashboard.md) spreadsheet.

---

## Six core KPIs

| KPI | Definition | Primary source | Status when empty |
|-----|------------|----------------|-----------------|
| **MRR** | Monthly recurring revenue (USD) | `partner_client.mrr_cents` rollup, else 30d paid invoices proxy | `awaiting_data` — show `—` |
| **NPS** | Portfolio Net Promoter Score (0–100) | `app_feedback` where `feature_area = nps_day30` | `awaiting_data` until ≥1 survey |
| **TTF** | Median time-to-first-order (hours) | Signup (`user_profiles.created_at`) → first `orders.created_at` | `awaiting_data` until pairs exist |
| **Uptime** | Platform availability composite (%) | DB health + cron execution + integration error rate | `partial` — uptime not contractual SLA |
| **Error rate** | Operational errors per order volume (7d, %) | Observability rollup ÷ `orders` (7d) | `partial` when order volume is zero |
| **DAU** | Daily active operators | Distinct `usage_events.user_id` (24h) | `partial` when zero events |

---

## Data sources

```mermaid
flowchart LR
  PG[(Postgres)] --> SVC[kpi-dashboard-service]
  OBS[Observability rollup] --> SVC
  HLTH[/api/health] --> SVC
  SVC --> UI[/platform/kpi]
```

| Module | Path |
|--------|------|
| Policy | `lib/platform/kpi-dashboard-absolute-final-policy.ts` |
| Pure metrics | `lib/platform/kpi-dashboard-metrics.ts` |
| Snapshot builder | `services/platform/kpi-dashboard-service.ts` |
| UI panel | `components/platform/kpi-dashboard-panel.tsx` |
| Page | `app/platform/kpi/page.tsx` |
| CI cert | `npm run test:ci:kpi-dashboard:cert` |

Related upstream docs:

- [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) — per-pilot six KPIs (different scope)
- [`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) — review cadence
- [`referral-program.md`](./referral-program.md) — portfolio NPS gate (≥40 from 3 pilots)

---

## Honesty rules

1. **Never guess paid state** — MRR shows `—` until Stripe or partner MRR rollups are wired; 30d invoice totals are labeled as proxy, not contracted MRR.
2. **NPS requires real surveys** — scores parsed from `NPS X/10` titles only; no fabricated promoter counts.
3. **TTF is median, not SLA** — time-to-first-order is an onboarding velocity signal, not a rush-hour certification.
4. **Uptime is composite, not contractual** — uptime % derived from DB + cron + integration fleet; enterprise SLA views stay on tenant dashboards.
5. **Error rate is ops signals** — webhook/sync/automation failures, not client-side JS error rate (wire Sentry for that).
6. **DAU from usage events** — distinct operators with telemetry; not GA4 sessions.
7. **Stripe revenue pipeline** — full MRR/ARR rollups require Stripe reporting integration; until then show `—` or labeled invoice proxy.

Metric tile badges:

- `live` — sufficient sample for the metric id
- `partial` — computed but incomplete or proxy source
- `awaiting_data` — no honest value yet

---

## CI certification

```bash
npm run test:ci:kpi-dashboard:cert
```

Verifies policy wiring, doc headings, metric definitions, and pure metric helpers.

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| `kpi-dashboard-absolute-final-v1` | 2026-06-06 | Task 68 — six KPI platform dashboard |

# OS Kitchen — Performance & Query Optimization Audit

**Date:** 2026-05-15

---

## 1. Methodology

- Static review of hot-path services (Today, Order Hub, POS, analytics, platform health, webhooks, support, audit).
- Build + typecheck success indicates Prisma query shapes are valid; **runtime N+1** requires DB tracing (recommend Prisma metrics / `EXPLAIN ANALYZE` in staging).

---

## 2. Prisma / data access patterns

| Pattern | Where observed | Risk | Mitigation |
|---------|----------------|------|------------|
| `findMany` without `take` | Various list endpoints | Unbounded memory | Add default `take` + cursor pagination (**P1** per module). |
| Deep `include` trees | Order detail, CRM profile | Large payloads | Replace with `select` + second queries for tabs (**P2**). |
| Repeated aggregates | Executive / analytics dashboards | DB CPU | KPI snapshot service exists (`services/analytics/kpi-snapshot-service.ts` aliases `loadExecutiveOverview`) — ensure pages use snapshot not recomputing same rollups (**P2**). |
| Audit / webhook tables growth | `AuditLog`, webhook job tables | Slow list pages | Time-range filters + pagination + indexes (verify migration coverage) (**P1** ops). |

---

## 3. Module-specific notes

### Today command center

- Services: `services/today/*` (`today-query-service`, `today-command-center-service`, etc.).
- **Watch:** combining signals from orders + production + routes in one RSC can multiply queries — prefer batched service method with explicit `select`.

### Order Hub

- Heavy filtering; ensure hub queries use indexed columns (`workspaceId`, `status`, `createdAt`).

### POS reports

- `services/pos/pos-analytics-service.ts` — watch date-range defaults; cap max window.

### Platform rollup

- `services/developer/platform-analytics-service.ts`, `platform-health-service.ts` — restrict time windows for expensive joins.

### Storefront public rendering

- **Images:** Lazy-loading added on menu, nav logo, product detail (`loading="lazy"`, `decoding="async"`).
- **Theme JSON:** Keep payload size bounded; avoid huge inline assets in JSON (**builder discipline**).

### Demo seed / reset

- Batch inserts — OK; avoid sequential per-row awaits where possible (**P3** micro).

---

## 4. Client-side concerns

| Issue | Recommendation |
|-------|----------------|
| Large tables in dashboard | Virtualize when > ~200 visible rows (**P2**). |
| Charts on first paint | Defer with `dynamic()` + skeleton (**P2**). |
| Client filtering of big lists | Move filters to server query (**P1** if already slow in prod). |

---

## 5. Caching (KPI snapshots)

- **Existing:** `loadKpiSnapshot` → `loadExecutiveOverview` with default filters.
- **Gap:** Not all dashboard landing widgets may use the same snapshot boundary — **P2** align “single source of truth” for KPI time window.

---

## 6. Index recommendations (generic)

Without production `EXPLAIN` outputs, recommend validating indexes on:

- `workspaceId + createdAt` for orders, webhook jobs, audit logs, support tickets.
- Foreign keys used in `where` + `orderBy` together.

**Do not** ship blind composite indexes; validate with staging traffic.

---

## 7. Related documents

- `docs/PERFORMANCE_SAFE_FALLBACKS_FINAL.md` (if present in tree).
- This pass: `docs/PERFORMANCE_FIXES_APPLIED.md`.

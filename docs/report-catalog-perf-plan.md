# Report Catalog Performance Plan

**Status:** Draft — catalog shipped (100+ entries); runner query perf not yet certified  
**Policy:** `report-catalog-perf-v1`  
**Audience:** Analytics engineering, DevOps, Product, VP Operations  
**Related:** [`services/analytics/report-catalog-service.ts`](../services/analytics/report-catalog-service.ts) · [`kds-slo-proof-plan.md`](./kds-slo-proof-plan.md)

---

## Purpose

Define how KitchenOS **proves** report catalog and wired report runner performance before sales claims "100+ operational reports" at enterprise scale. The catalog UI is in-memory; **p95 &lt; 2s** applies to **wired report execution** (SQL/Prisma), not template-only catalog rows.

**Honesty rule:** Do not claim perf proof complete until `artifacts/report-catalog-perf-summary.json` shows p95 &lt; 2s on **Tier A wired reports** with ≥ 50 samples per report on staging data.

---

## SLO targets

| Surface | Metric | p50 | **p95** | p99 | Scope |
|---------|--------|-----|---------|-----|-------|
| **Catalog page SSR** | Time to first byte + HTML | &lt; 800ms | **&lt; 1.5s** | &lt; 3s | `/dashboard/reports/catalog` |
| **Client search/filter** | `searchReportCatalog()` in browser | &lt; 16ms | **&lt; 50ms** | &lt; 100ms | 100+ entries, in-memory |
| **Wired report run** | Generator route → export ready | &lt; 800ms | **&lt; 2s** | &lt; 5s | Tier A reports (see below) |
| **Custom builder preview** | `buildCustomReportPreview` + route handoff | &lt; 200ms | **&lt; 500ms** | &lt; 1s | No SQL — honest preview only |

**Primary sales-safe claim after proof:** *"Wired operational reports return in under 2 seconds at p95 on pilot-scale data."*

**Not claimed:** All 100+ catalog templates execute SQL today — most are `catalog_template` status until runners ship.

---

## Service definition

### In scope

| Layer | Path | Perf concern |
|-------|------|--------------|
| Catalog service | `services/analytics/report-catalog-service.ts` | In-memory list/search — low risk |
| Catalog UI | `app/dashboard/reports/catalog/page.tsx` | SSR calls `listReportCatalog()` + profile fetch |
| Client filter | `components/dashboard/report-catalog-client.tsx` | Renders full entry array |
| Wired runners | `app/dashboard/reports/[reportKey]/` via `REPORT_REGISTRY` | **Primary p95 target** |
| Registry | `lib/reports/report-registry.ts` | 19+ available generators |

### Out of scope (this plan)

- Scheduled email delivery (not shipped)
- Google Sheets export (placeholder)
- Report builder SQL generation (preview-only)
- Multi-location PDF batch export (separate audit)
- Briefing tile aggregation (separate telemetry)

---

## Tier A — wired reports (p95 proof set)

Prove these first — highest pilot usage per [`report-registry.ts`](../lib/reports/report-registry.ts):

| Report key | Route | Category |
|------------|-------|----------|
| `revenue_report` | `/dashboard/reports/revenue_report` | Sales |
| `orders_report` | `/dashboard/reports/orders_report` | Sales |
| `sales_by_channel` | `/dashboard/reports/sales_by_channel` | Sales |
| `inventory_shortage_report` | `/dashboard/reports/inventory_shortage_report` | Inventory |
| `margin_report` | `/dashboard/reports/margin_report` | Finance |
| `executive_weekly_summary` | `/dashboard/reports/executive_weekly_summary` | Operations |

**Pass:** Each Tier A report p95 &lt; 2s over 50 runs on staging workspace with ≥ 1,000 orders seeded.

---

## SLIs

### SLI-1: `reports.catalog_page_load_ms`

| Field | Definition |
|-------|------------|
| **T0** | Navigation start to `/dashboard/reports/catalog` |
| **T1** | `ReportCatalogClient` interactive (search input focusable) |
| **Segment** | Staging + production |
| **Target** | p95 &lt; 1.5s |

### SLI-2: `reports.wired_run_duration_ms` (primary)

| Field | Definition |
|-------|------------|
| **T0** | User clicks "Run report" / navigates to generator route |
| **T1** | Report table/chart rendered OR CSV download starts |
| **Segment** | Tier A wired reports only |
| **Target** | **p95 &lt; 2s** |

Instrumentation: server `report.run` audit events or Playwright timing on `data-testid="report-output-ready"`.

### SLI-3: `reports.catalog_search_ms`

| Field | Definition |
|-------|------------|
| **T0** | Keystroke in catalog search |
| **T1** | Filtered list re-render complete |
| **Target** | p95 &lt; 50ms (client-only) |

---

## Known risks (June audit)

| Risk | Evidence | Mitigation |
|------|----------|------------|
| N+1 queries in report runners | `fullreport1june.md` § DB queries | Batch `include` in report services; Prisma query log review |
| Full catalog SSR on every page load | `listReportCatalog()` × profile fetch | Memoize catalog server-side; consider static catalog JSON |
| 100+ client rows in DOM | `ReportCatalogClient` | Virtualize list when &gt; 50 visible rows |
| Template rows sold as live | `status: catalog_template` | Honest badges in UI; perf proof on wired only |
| Large date ranges | 90d default on some reports | Cap default range; warn on &gt; 90d |

---

## Proof methodology

### Phase 1 — Unit baseline (available now)

```bash
npm test -- tests/unit/report-catalog-service.test.ts
```

Validates 100+ catalog entries, search, role recommendations — **not** SQL perf.

### Phase 2 — Staging query profiling (vault gated)

**Prerequisites:** `DATABASE_URL`, `E2E_STAGING_BASE_URL`, seeded workspace (≥ 1,000 orders, 50 products).

```bash
# Enable Prisma query logging on staging (ops shell)
export DEBUG="prisma:query"
export REPORT_PERF_SAMPLE_SIZE=50

# Per Tier A report — manual or scripted timing loop
for key in revenue_report orders_report sales_by_channel; do
  echo "=== $key ==="
  # Navigate to /dashboard/reports/$key with authed session; record T1-T0
done
```

**Capture:** slow query log, row counts, missing indexes.

### Phase 3 — Artifact (7-day window)

Write `artifacts/report-catalog-perf-summary.json`:

```json
{
  "version": "report-catalog-perf-v1",
  "overall": "PASSED",
  "catalogPageP95Ms": 1200,
  "tierAReports": [
    { "key": "revenue_report", "p50Ms": 420, "p95Ms": 1800, "samples": 50 }
  ],
  "n1IssuesFound": 0,
  "honestyNote": "Template catalog rows excluded from SQL perf claims."
}
```

**SKIPPED when:** vault empty or staging seed below minimum row counts.

---

## Remediation backlog (engineering)

| Priority | Item | Owner | Exit |
|----------|------|-------|------|
| P1 | Prisma index audit on `orders`, `orderItems`, `products` for report joins | Eng | Explain plans &lt; 100ms |
| P1 | Batch includes in top 6 Tier A report services | Eng | No N+1 in query log |
| P2 | Virtualize catalog client list | UX | p95 search &lt; 50ms at 200+ DOM rows |
| P2 | Server-side catalog cache (immutable between deploys) | Eng | SSR p95 −30% |
| P3 | Lazy-load category tabs | Eng | TTI improvement |

---

## Acceptance checklist

- [ ] Tier A: 6 reports × 50 samples, each p95 &lt; 2s on staging
- [ ] Catalog page p95 &lt; 1.5s on staging authed load
- [ ] Zero N+1 patterns in Tier A query logs
- [ ] `artifacts/report-catalog-perf-summary.json` committed with `overall: PASSED`
- [ ] Sales deck updated — template vs wired distinction preserved

---

## Safe wording

**Allowed after Phase 3 PASS:**

- "Report catalog with 100+ templates; Tier A operational reports under 2s p95 on pilot data"
- "In-memory catalog search and filter"

**Not allowed until proof:**

- "All 100+ reports run in under 2 seconds"
- "Enterprise-scale analytics certified"
- "Real-time reporting" (reports are batch/refresh)

---

## References

- Catalog service: `services/analytics/report-catalog-service.ts`
- Registry: `lib/reports/report-registry.ts`
- Page: `app/dashboard/reports/catalog/page.tsx`
- Unit tests: `tests/unit/report-catalog-service.test.ts`
- Forensic audit: [`fullreport1june.md`](./fullreport1june.md) § Report catalog, N+1

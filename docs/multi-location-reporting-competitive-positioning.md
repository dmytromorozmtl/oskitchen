# Multi-Location Reporting — Competitive Positioning & Sales Guide

**Status:** Production-ready — custom date ranges, location comparison, PDF export, weekly email  
**Audience:** Sales, multi-unit operators, franchise owners  
**Technical:** [`multi-location-analytics.ts`](../services/analytics/multi-location-analytics.ts) · [`/dashboard/locations/dashboard`](../app/dashboard/locations/dashboard/page.tsx)

---

## One-line pitch

**All locations. One dashboard. Custom date ranges. No Excel.**

---

## Positioning headline

> **TouchBistro makes you merge Excel files. We give you one dashboard. Included.**

---

## Competitor comparison

| Platform | Multi-location | Custom dates | Export | Cost |
|----------|---------------|--------------|--------|------|
| TouchBistro | ❌ | ❌ | CSV only | — |
| Lightspeed | ✅ | ✅ | PDF | $89/mo addon |
| Toast | ✅ | ⚠️ Limited | CSV | Enterprise tier |
| **OS Kitchen** | **✅** | **✅** | **PDF + Email** | **Included** |

| Capability | TouchBistro | Lightspeed | **OS Kitchen** |
|------------|-------------|------------|----------------|
| Location vs location table | ❌ Export + Excel | ✅ Addon | **✅ Included** |
| vs network average highlighting | ❌ | Partial | **✅ Green/red per metric** |
| Labor % per location | ❌ | Addon | **✅ From staff shifts** |
| Food cost % per location | ❌ | Addon | **✅ From costing snapshots** |
| Weekly email digest | ❌ | ❌ | **✅ Monday cron** |
| PDF export all locations | ❌ | ✅ Addon | **✅ One click** |

---

## What ships today (evidence)

| Capability | Evidence |
|------------|----------|
| Multi-location dashboard | `/dashboard/locations/dashboard` |
| Custom date range picker | `MultiLocationCustomDateForm` |
| Quick ranges (7/30/90d) | `AnalyticsFilterBar` |
| Location comparison table | `MultiLocationComparisonTable` |
| vs average highlighting | `applyMultiLocationComparisonMetrics` |
| Labor % from staff shifts | `StaffShift` groupBy location |
| Food cost % from costing | `loadFoodCostPctByLocation` |
| PDF export | `MultiLocationPdfExportButton` |
| Weekly email | `/api/cron/multi-location-weekly-report` |
| Unit tests | `tests/unit/multi-location-analytics.test.ts` |
| E2E | `e2e/multi-location-dashboard.spec.ts` |

**Honesty:** Food cost % requires product cost snapshots on sold SKUs — locations without mapped costing show "—".

---

## Sales pitch (30 seconds)

> "TouchBistro can't compare your two locations — you export CSV from each and merge in Excel. Lightspeed charges $89 a month for multi-location reporting. OS Kitchen gives you one dashboard: pick any date range, see every location side-by-side with labor and food cost, green above average and red below, export PDF for your GM meeting, and get a weekly email every Monday. Included."

---

## Safe sales wording

**Allowed:**

- "Multi-location dashboard with custom date ranges"
- "Location vs location comparison with network averages"
- "PDF export for all locations"
- "Weekly multi-location email digest"
- "Labor % from scheduled staff shifts when location-scoped"

**Not allowed:**

- "TouchBistro parity on every metric"
- "Real-time franchise royalty dashboard"
- "Guaranteed food cost accuracy without costing setup"
- "SOC2-certified reporting"

---

## Proof path

```bash
npm test -- tests/unit/multi-location-analytics.test.ts tests/unit/multi-location-report-service.test.ts
npx playwright test e2e/multi-location-dashboard.spec.ts --project=chromium-authed
```

Open `/dashboard/locations/dashboard` — apply custom dates, export PDF, review comparison table.

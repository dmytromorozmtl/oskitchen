# Multi-location Enterprise Dashboard

Enterprise command center for operators with **2–25 locations** — all sites on one screen with comparison, alerts, and drill-down.

## Route

`/dashboard/enterprise/multi-location`

Requires **`multi_location`** plan feature (same gate as `/dashboard/locations/dashboard`).

## Capabilities

| Feature | Description |
|---------|-------------|
| **Network KPIs** | Active locations, orders, revenue, unassigned volume |
| **Revenue ranking** | Sorted list with vs-network hints |
| **Comparison table** | Orders, revenue, labor %, food cost % vs network average |
| **Drill-down** | `?locationId=` — sidebar detail + link to location reports |
| **Alerts** | Below-avg revenue, high labor/food cost, top performers |
| **Filters** | Brand, location, date presets (shared analytics filters) |
| **PDF export** | Reuses `MultiLocationPdfExportButton` |

## Services

```
services/enterprise/multi-location-service.ts  — loadEnterpriseMultiLocationDashboard
services/analytics/multi-location-analytics.ts — underlying snapshot (orders, labor, food cost)
lib/enterprise/multi-location-builders.ts      — ranks, alerts, drill-down selection
```

## Related

- Operations view: `/dashboard/locations/dashboard`
- Plan: [`multi-location-reporting-plan.md`](./multi-location-reporting-plan.md)

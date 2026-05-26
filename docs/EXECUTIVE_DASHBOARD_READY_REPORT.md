# Executive Dashboard — ready report

## What changed

- `/dashboard/executive` is now an Owner Command Center with subnav,
  filters, KPI cards, business-health score, risks, and module
  drilldowns instead of the previous 10-card placeholder grid.
- Six tab pages: Overview, Revenue & orders, Operations, Customers,
  Profitability, Brands & locations, Risks, Report.
- Deterministic service layer
  (`services/executive/executive-dashboard-service.ts`) computes every
  metric from existing tables — no synthetic data, no fake AI.
- `ExecutiveSnapshot` and `ExecutiveInsight` tables added (additive
  migration `20260515000000_executive_command_center`).
- Server actions for snapshot refresh, insight resolve, and insight
  dismiss; gated by `executive.insights.manage`.
- Business-mode terminology adaptation
  (`executiveTerminologyForMode`).
- Print-friendly `/dashboard/executive/report` route + CSV download
  reusing the Reports center `/api/export/report` endpoint.

## KPI architecture

`lib/executive/executive-kpis.ts` defines 17 KPIs across 15 groups
(Revenue, Orders, Customers, Channels, Production, Packing, Delivery,
Margin, Inventory, Purchasing, Tasks / Labor, Brands, Locations,
Catering, Meal Plans). Each KPI carries label, source, period,
comparison, required permission, drilldown route, warning rules, and
format. See `docs/EXECUTIVE_KPI_ARCHITECTURE.md`.

## Health score

`lib/executive/executive-health.ts` produces a 0–100 score with status
band (Healthy / Watch / At Risk / Critical), explanation, and top
contributions. Every deduction is labelled and bounded. Explicitly
labelled "operational estimate". See `docs/EXECUTIVE_HEALTH_SCORE.md`.

## Executive insights

`lib/executive/executive-insights.ts` defines 14 deterministic rules
that translate the overview snapshot into actionable cards. Insights
are upserted (not duplicated) on each render of `/risks` and on
`refreshExecutiveSnapshotAction`. See `docs/EXECUTIVE_INSIGHTS.md`.

## Revenue / order metrics

- Net revenue (excludes cancelled orders).
- Order count with cancellation subtext.
- AOV with previous-period comparison.
- Channel mix and top channel.
- Daily revenue area chart.
- Top products by quantity.
- Drilldowns to `/dashboard/analytics/revenue` and Order Hub.

## Operations metrics

- Production completion rate + overdue items count.
- Packing accuracy + packed / total items.
- Delivery completion + failed stops.
- Overdue tasks count + open task count.
- Drilldowns to Production, Kitchen Screen, Packing, Routes, Tasks.

## Customer metrics

- Repeat rate and new customers (window-scoped).
- VIPs (`lifetimeValueCents > $500`) and at-risk count
  (`atRiskScore > 60`) from the CRM.
- PII masking banner for roles without
  `executive.read.customer_pii`.

## Profitability metrics

- Median gross margin from the latest costing run.
- Items below margin target count.
- Catering pipeline (open quotes + accepted revenue).
- Meal plan weekly recurring estimate.
- Purchasing needs (open + stale POs).
- Copy explicitly labels margin as operational estimate.

## Brand / location comparison

`groupBy(brandId)` and `groupBy(locationId)` produce ranked tables.
Single-brand / single-location workspaces collapse into a compact
view. Permission-gated to `executive.read.brand_location`.

## Risk engine

14 rule types, severities mapped to UI colours, action button per
insight, manage actions (`resolve` / `dismiss`) for owners and
managers. Auto-resolves stale open insights when the trigger
condition no longer holds. See `docs/EXECUTIVE_INSIGHTS.md`.

## Permissions / security

`lib/executive/executive-permissions.ts` enforces seven permissions
across the page hierarchy:

- `executive.view`, `executive.read.operations`
- `executive.read.financial`, `executive.read.customer_pii`
- `executive.read.brand_location`
- `executive.export`, `executive.insights.manage`

Superadmin (`workspace.moroz@gmail.com`) always has full access. See
`docs/EXECUTIVE_PERMISSIONS.md`.

## Remaining limitations

- The `ExecutiveSnapshot` table is **upsert-on-demand**. There is no
  cron worker yet that fills it daily — owners can refresh manually
  via the "Refresh snapshot" button. A scheduled worker is a P3
  follow-up.
- Server-side PDF generation is intentionally not enabled. Printing /
  saving as PDF uses the browser dialog.
- AOV / margin estimate exclude tax and tips because the underlying
  `Order.total` column already does (matching the rest of analytics).
- Brand / location ranked tables use raw `total` because they call
  `prisma.groupBy`. The overview KPIs use the deterministic
  `orderContributesToRevenue` filter.

## Next recommendations

1. Add a Vercel cron job (or Supabase scheduled function) that calls
   `refreshExecutiveSnapshotAction` daily at 06:00 in the workspace
   timezone so the trend graphs populate without manual refresh.
2. Surface the snapshot history as a sparkline on each KPI card.
3. Wire `ExecutiveSnapshot.payloadJson` to the Reports center so
   "Executive weekly summary" can render historical periods without
   re-scanning orders.
4. Build a Slack / email digest from the same `loadExecutiveOverview`
   call (no new sources required).
5. Add a per-brand drilldown subroute (e.g. `/dashboard/executive?brandId=…`)
   that scopes every KPI — the filter contract already supports it.

## Build status

`npm run typecheck` → exit 0.
`npm run build` → exit 0. All eight `/dashboard/executive/*` routes
are listed in the build output.

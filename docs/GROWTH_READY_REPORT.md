# Growth — Ready Report

## Summary

The Growth module is upgraded from lightweight founder widgets into a **Founder Growth Command Center** with service-layer analytics, PLG funnel visualization, CRM Kanban, expanded demo workflow fields, outreach campaigns, and tightened **permissions** for owners + platform GTM/superadmin roles.

## Architecture

- New `services/growth/*` services and `lib/growth/{growth-permissions,growth-events,growth-funnel,growth-scoring,growth-analytics}.ts`.
- Layout gate now uses `canAccessGrowthModule` (owners + superadmin + selected `platform_user_roles`).

## CRM

- `BetaLead` gains **UTM** + `lifecycleStage` + `ownerUserId` (optional).
- Leads page: **Kanban** (core lanes) + detailed inbox table.

## Telemetry & analytics

- Command center surfaces **usage**, **activation funnel**, **signup trend**, **health mix**, **referral** counts, **paid revenue (30d)** proxy.

## Churn & expansion

- Heuristic watchlists (`churn-service`, `expansion-service`) feeding the overview tables.

## Demos

- `DemoRequestStatus` adds `QUALIFIED`, `NURTURE`.
- `DemoRequest` adds `qualificationScore`, `assignedToUserId`, `meetingUrl`, `followUpAt`.

## Outreach & content

- `OutreachCampaign` model + list UI + starter seed.
- Content stats from `ReleaseNote` counts.

## Permissions

- Documented in `docs/GROWTH_PERMISSIONS.md` — normal tenant staff cannot access internal GTM analytics.

## Performance

- Snapshot composes parallel Prisma queries; chart data bounded (top N / last weeks). Expansion/churn samples cap list sizes.

## Limitations & next steps

1. Apply DB migration `20260530120000_growth_os_foundation` in each environment.
2. Replace revenue proxy with true MRR/ARR when Stripe revenue recognition is modeled.
3. Add server actions to edit `lifecycleStage` / owner from Kanban cards (drag-and-drop optional).
4. Background jobs for KPI snapshots + cohort charts.
5. Wire **notifications** for demo reminders / churn alerts (`Phase 18` spec).

## Verification

`npm run typecheck` and `npm run build` succeed on the implementation revision.

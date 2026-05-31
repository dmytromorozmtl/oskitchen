# Executive dashboard audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/executive`, `app/dashboard/executive/page.tsx`,
adjacent modules (Analytics, Reports, Orders, Production, Packing,
Routes, Costing, Inventory, CRM, Catering, Meal Plans, Forecast,
Brands, Locations, Channels, Tasks).

## TL;DR

`/dashboard/executive` today is a 10-card static grid that mostly shows
`0`, a hand-written placeholder string ("Use costing reports",
"Placeholder until scan rollups", "See ingredient demand"), or simple
counts of `Brand`, `Location`, `DeliveryRoute`, and DONE `KitchenTask`
rows. There are:

- no date / brand / location filters,
- no previous-period comparison,
- no trend charts,
- no health score,
- no executive insights / risks,
- no drilldown links beyond the card title,
- no business-mode adaptation,
- no permission gating beyond `requireSessionUser`,
- no export.

Everything we need to power a real Owner Command Center already lives in
the workspace (Analytics service, Reports registry, Costing snapshots,
Packing batches, Forecast runs, Catering quotes, Meal plans, Customer
CRM). This project wires those data sources into a single executive
surface with deterministic metrics, explicit estimates, business-mode
terminology, and role-based gating.

## Findings

| #  | Area | Current state | Why it is limiting | Affected user | Recommended fix | Pri |
|----|------|---------------|--------------------|---------------|-----------------|-----|
| 1  | Page | Static 10-card grid | No filters, comparison, drilldowns | Owner / manager | Replace with a full Command Center reading `services/executive/executive-dashboard-service.ts` | P1 |
| 2  | Revenue | `prisma.order.aggregate.total` across *all time* | Includes cancelled orders; no window | Owner / accountant | Reuse `whereOrdersInWindow` + `orderContributesToRevenue` from analytics | P0 |
| 3  | Order volume | `prisma.order.count` all-time | No comparison, no channel split | Owner | Per-period count + previous-period delta, channel mix | P1 |
| 4  | Production volume | Counts `Product` rows | Wrong proxy — products are catalogue rows, not produced units | Owner | Use `ProductionBatch.completedItems` over the window | P0 |
| 5  | Margin | Hard-coded "Use costing reports" | No KPI value; not surfaced | Owner / accountant | Latest `ProfitabilityLine.grossMarginPercent` median + at-risk count; label as **operational estimate** | P1 |
| 6  | Packing accuracy | Literal "Placeholder until scan rollups" | Misleading | Operator | Compute `packedItems ÷ totalItems` across `PackingBatch` in the window | P0 |
| 7  | Delivery | Counts `DeliveryRoute` rows | Doesn't say if routes are on time | Operator | Compute `delivered ÷ total` across `DeliveryStop`s + count of `FAILED` | P1 |
| 8  | Brand / location | Counts brand / location rows | No revenue comparison | Owner | Top brand / top location by revenue with previous-period delta | P1 |
| 9  | Labor / task | Counts DONE `KitchenTask`s all-time | No overdue / open metric | Manager | Show overdue count + completion rate over window | P1 |
| 10 | Inventory alerts | "See ingredient demand" | No KPI value | Manager / purchasing | Count of `IngredientDemandRunLine` with shortage > 0 | P1 |
| 11 | Customers | Not surfaced | Owner doesn't see who is returning | Owner | Repeat rate, new customers, VIP count (already in Analytics) | P1 |
| 12 | Catering | Not surfaced | Owner can't see catering pipeline | Sales | Open quotes, accepted revenue in window | P2 |
| 13 | Meal plans | Not surfaced | Owner can't see recurring revenue | Owner | Active subscriptions + estimated weekly recurring | P2 |
| 14 | Health score | None | No single "Is the business healthy today?" answer | Owner | New score 0–100 with status + top 3 contributing issues | P1 |
| 15 | Risks / insights | None | Owners can't see what to do next | Owner | Rule-driven `ExecutiveInsight` records with severity / action route | P1 |
| 16 | Date filters | None | Can't compare last 7d / 30d / MTD | Owner | URL-driven filter contract (reuse analytics filters) | P1 |
| 17 | Brand / location filter | None | Can't focus on a single brand or location | Owner | Reuse analytics filters | P2 |
| 18 | Trend indicator | None | No previous-period comparison | Owner | KPI cards show ± delta vs. previous window | P1 |
| 19 | Drilldowns | Only card title | Owner can't navigate from KPI | Owner | Every KPI carries a `drilldownRoute` | P2 |
| 20 | Permissions | `requireSessionUser` only | Financial / PII exposed to any logged-in user | Compliance | `canViewExecutive(scope, group)` and PII masking | P0 |
| 21 | Export | None | Owner can't print/PDF a weekly digest | Owner | Print-friendly `/dashboard/executive/report` route + CSV via Reports center | P1 |
| 22 | Business mode | None | Same dashboard for restaurant / catering / meal prep / ghost kitchen | Owner | `executiveTerminologyForMode` for copy + recommended sections | P2 |
| 23 | Empty states | Cards show `0` | Confusing — looks broken even when data is wired up | Owner | "Executive dashboard needs operational data" CTA with module links | P2 |
| 24 | Performance | Counts run sequentially | OK at current volume | n/a | Use `Promise.all` parallel fetches + Prisma `aggregate` / `groupBy`; defer heavy charts | P2 |
| 25 | Scheduling | None | No daily / weekly snapshot persisted | Owner | Optional `ExecutiveSnapshot` table for trend graphs without re-scanning orders | P3 |

## Priority legend

- **P0** — Incorrect / sensitive metric (fix or remove).
- **P1** — Core executive value (revenue, orders, ops health, risks).
- **P2** — Operational value (catering, meal plans, drilldowns, modes).
- **P3** — Future (snapshots, scheduled digests, server PDF).

# Production Command Center

**Route:** `/dashboard/production`

## Purpose

Planning layer for prep and production: KPIs, date-scoped work items, batches, multi-tab views, and CTAs to generate work from menu products or orders.

## Header

- Title from `productionPageTitle(businessType)`.
- Subtitle from `productionPageSubtitle()`.
- Date input updates `?date=YYYY-MM-DD`.
- Links: reports, templates, kitchen screen.
- Forms: **Generate prep** (menu prepared dates) and **From orders** (server actions with redirect).

## KPI strip

Derived from `aggregateWorkItemKpis` + `overloadFromItems`: tasks, completed, in progress, late/risk, packing/label handoff, estimated prep minutes (placeholder until per-item estimates exist), station load badges.

## Views (`?view=`)

| View | Behavior |
|------|----------|
| `board` | Kanban columns by `ProductionWorkStatus`. |
| `prep` | Grouped prep list by station string. |
| `timeline` | Placeholder card (Gantt next). |
| `stations` | Placeholder + note on `production_stations`. |
| `batches` | Lists batches for the day. |
| `orders` | Placeholder for order traceability. |
| `ingredients` | Placeholder for demand. |
| `reports` | Link to `/dashboard/production/reports`. |

## Execution layer

Embedded `ProductionTable` with `embedded` prop — legacy product cook/pack/label rows unchanged.

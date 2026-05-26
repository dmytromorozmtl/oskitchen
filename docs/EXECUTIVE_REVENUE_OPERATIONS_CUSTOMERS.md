# Executive revenue, operations, and customer sections

## Revenue & orders (`/dashboard/executive/revenue`)

KPIs: `revenue`, `orders`, `average_order_value`, `top_channel`.

Visualisations:

- **Revenue trend** — daily net revenue across the selected window. Uses
  `AnalyticsDailyArea`. Excludes cancelled orders via
  `orderContributesToRevenue`.
- **Channel mix** — `AnalyticsBars` ranked by net revenue per channel.
  Channel labels come from `ANALYTICS_CHANNEL_LABEL`.
- **Top products** — units sold per product in the window.
- **Fulfillment mix** — link out to Order analytics.

Drilldowns: Analytics → Revenue, Order Hub, Reports center.

## Operations (`/dashboard/executive/operations`)

KPIs: `production_completion`, `packing_accuracy`, `delivery_performance`,
`inventory_alerts`, `overdue_tasks`, `purchasing_needs`.

Sections:

- **Production** — `completedItems / totalItems` across
  `ProductionBatch` rows in window.
- **Packing** — `packedItems / totalItems` across `PackingBatch` rows.
- **Delivery** — counts of `DeliveryStop` by status; failed stops shown.
- **Tasks & labour** — overdue and open counts.

Drilldowns: Production, Kitchen screen, Packing, Routes, Tasks.

## Customers (`/dashboard/executive/customers`)

KPIs: `repeat_customers`, `new_customers`, **VIP count**
(`lifetimeValueCents > $500`), **at-risk count**
(`atRiskScore > 60`).

When `executive.read.customer_pii` is missing, the page shows a banner
clarifying that PII is masked for the role and the CRM is the source of
truth.

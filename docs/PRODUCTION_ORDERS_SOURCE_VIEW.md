# Production orders source view

**Route:** `/dashboard/production?view=orders`

## Goal

Answer: which orders, channels, or events created each work item?

## Data model hooks

- `ProductionWorkItem.orderId`, `orderItemId`
- `ProductionWorkItem.sourceType` (`ORDER`, `MENU`, `MANUAL`, …)
- `ProductionBatch.orderId` when batch is scoped to a single order (future)

## Planned UI

| Column | Notes |
|--------|------|
| Order ref | Internal id + customer-facing label |
| Channel | Manual / storefront / Shopify / Woo / import |
| Lines | Count of work items |
| Status | Open vs production complete |
| Actions | Regenerate (idempotent), jump to order detail |

## Warnings

- Highlight orders with SKUs that have no matching work item when production is expected (policy-driven).

## Current

Placeholder card in command center until query + table component ships.

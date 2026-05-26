# Entity Detail Pages

## New / upgraded routes

| Entity | Path | Notes |
|--------|------|-------|
| Order | `/dashboard/orders/[orderId]` | Items, fulfillment, CRM link, production/packing counts, channel import, **ActivityTimeline** |
| Menu item | `/dashboard/products/[productId]` | Pricing, storefront flags, production task snapshot |
| Production batch | `/dashboard/production/batches/[batchId]` | Work items + linked order |
| Integration | `/dashboard/sales-channels/connections/[connectionId]` | Safe metadata only |
| CRM alias | `/dashboard/crm/customers/[customerId]` | Redirects to canonical `/dashboard/customers/[customerId]` |

## Existing detail pages (unchanged)

- `/dashboard/routes/[routeId]`
- `/dashboard/support/[ticketId]`
- `/dashboard/import-center/jobs/[jobId]`

## Activity

Order/product/batch/connection pages include `ActivityTimeline` fed by `listActivityForEntity` when audit rows exist.

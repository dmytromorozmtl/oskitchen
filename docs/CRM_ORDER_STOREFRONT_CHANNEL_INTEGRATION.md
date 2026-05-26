# CRM ↔ Order / Storefront / Sales-channel integration

## Goal

Every order — manual, storefront, channel, import, catering quote, event
inquiry — should create or update a `kitchen_customers` row, append a
`customer_timeline_events` row, and trigger a metrics recompute.

## Wired integrations (this milestone)

| Source | Code |
|---|---|
| Manual order | `actions/orders.ts::createOrder` |
| Storefront checkout | `actions/storefront-order.ts::submitPublicStorefrontOrder` |
| Enterprise API (`POST /api/public/v1/orders`) | `app/api/public/v1/orders/route.ts` |
| CSV import (CUSTOMERS) | `actions/implementation.ts::commitImportJob` writes `source: "IMPORT"` |

Each call uses the same `upsertCustomerFromOrder({ ... })` helper. It:

1. Normalises email and phone.
2. Creates a `kitchen_customers` row if missing.
3. **Never overwrites** a manually-set name, phone, company, preferred brand,
   preferred location, or external id.
4. Promotes `source` to a more specific value only if the existing row is
   still `MANUAL` (so a storefront customer who later places a phone order
   stays `STOREFRONT`).
5. Appends `ORDER_PLACED` to the timeline.

Then `recomputeMetricsForOrderEmail` updates LTV / AOV / totals / at-risk
score / status (without ever overwriting manual `VIP` / `BLOCKED` / `ARCHIVED`).

## Catering quotes

`CateringQuote.customerEmail` is a candidate for the same upsert pattern. The
hook is not wired in this milestone to avoid touching the catering flow, but
the helper is ready — call `upsertCustomerFromOrder({ source: "CATERING_QUOTE", ... })`
from your quote create / update entry point.

## Channel ingest (Woo / Shopify / Uber Eats)

`ChannelImportBatch` and `ChannelOrder` already exist. The recommended hook
shape:

```ts
await upsertCustomerFromOrder({
  userId,
  email: order.customerEmail,
  name: order.customerName,
  source: customerSourceFromChannelProvider(channel.provider),
  sourceChannelId: channel.id,
  orderId: order.id,
  orderTotal: Number(order.total),
});
```

The mapping helper lives in `lib/crm/customer-sources.ts`.

## Failure isolation

Every CRM hook is wrapped in `try/catch` — failures log to `console.warn` but
must not block order creation. Order Hub still operates as expected even if
the CRM hooks are temporarily broken.

## Backfill

For workspaces that pre-date the hook, `services/crm/customer-service.ts ::
backfillCustomersFromOrders(userId)` runs once on first visit to
`/dashboard/customers` when `KitchenCustomer.count() === 0 && Order.count() > 0`.

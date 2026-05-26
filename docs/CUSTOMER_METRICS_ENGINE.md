# Customer metrics engine

## Goal

For every `KitchenCustomer`, keep these fields fresh:

- `total_orders`, `lifetime_value_cents`, `average_order_value_cents`
- `first_order_at`, `last_order_at`
- `repeat_purchase_rate`
- `at_risk_score`
- `status` (derived; never overrides manual VIP / BLOCKED / ARCHIVED)

## Implementation

- `lib/crm/customer-metrics.ts` — pure aggregator over `{ total, createdAt }[]`
- `services/crm/customer-metrics-service.ts`
  - `recomputeCustomerMetrics(userId, customerId)` — recompute one
  - `recomputeAllCustomerMetrics(userId)` — admin "Recalculate metrics" button
  - `recomputeMetricsForOrderEmail(userId, email)` — fire-and-forget hook from order create / status changes
  - `loadCrmOverviewKpis(userId)` — workspace KPIs for the Command Center

## Triggers

| Trigger | Source |
|---|---|
| Manual order create | `actions/orders.ts::createOrder` |
| Storefront submit | `actions/storefront-order.ts::submitPublicStorefrontOrder` |
| Enterprise API order | `app/api/public/v1/orders/route.ts` |
| CSV customer import | `actions/implementation.ts::commitImportJob` (writes `source: "IMPORT"`) |
| Admin button | `recomputeCrmMetricsAction` on `/dashboard/customers` overview |

## Failure isolation

Every hook wraps the recompute in `try/catch` and only logs. Order creation
must never fail because the CRM aggregation hiccupped.

## At-risk score (heuristic)

```
≤14d   → 0
≤30d   → 10
≤45d   → 25
≤60d   → 45
≤90d   → 70
≤180d  → 90
>180d  → 95
```

Score is exposed on the customer detail page and powers the `AT_RISK` status
derivation (score ≥70).

## Order eligibility

Only non-`CANCELLED` orders count, and `isChannelTestOrder = false`.

# CRM architecture

## Layers

```
lib/crm/*          → pure helpers (no Prisma client)
services/crm/*     → business logic on top of Prisma
actions/customers.ts → server actions (form-driven mutations)
app/dashboard/customers/* → UI (RSC pages + a single client subnav component)
```

## lib/crm

| Module | Responsibility |
|---|---|
| `customer-types.ts` | Customer type / source enums and labels, plus `crmTerminologyForMode()` for restaurant / café / catering / etc. |
| `customer-status.ts` | Status enum values, badge variant, marketing eligibility helper |
| `customer-sources.ts` | Map `OrderOriginHint` and channel provider → `CustomerSource` |
| `customer-segments.ts` | Rule shape, pure evaluator, built-in segment starter pack |
| `customer-metrics.ts` | `aggregateFromOrders`, at-risk score, status derivation (never overrides VIP / BLOCKED / ARCHIVED) |
| `customer-dedupe.ts` | Normalisation + similarity (used by `/dedupe`) |
| `customer-permissions.ts` | `CrmPermission` + role/scope check (`isSuperAdmin`, `canDoCrm`) |
| `customer-privacy.ts` | PII masking, allergy/dietary parsing, public view |

## services/crm

| Module | Responsibility |
|---|---|
| `customer-service.ts` | `upsertCustomerByEmail`, `upsertCustomerFromOrder` (fire-and-forget hook), list / get, dedupe groups, backfill from existing orders, archive |
| `customer-metrics-service.ts` | Recompute per-customer metrics + workspace KPIs |

## Integration points

| Where | Hook | Source |
|---|---|---|
| `actions/orders.ts::createOrder` | `upsertCustomerFromOrder` → `recomputeMetricsForOrderEmail` | `MANUAL` |
| `actions/storefront-order.ts::submitPublicStorefrontOrder` | same | `STOREFRONT` |
| `app/api/public/v1/orders/route.ts` | same | `MANUAL` (enterprise API) |
| `actions/implementation.ts::commitImportJob` (CUSTOMERS) | direct upsert with `source: "IMPORT"` | `IMPORT` |
| Channel ingest hooks | invoke `upsertCustomerFromOrder` with `source: customerSourceFromChannelProvider(...)` when ingest lands | per-channel |

## Backfill

`backfillCustomersFromOrders(userId)` groups existing `Order` rows by email and
creates `KitchenCustomer` records for any missing emails. It runs lazily once
on first visit to `/dashboard/customers` for existing workspaces that pre-date
the upsert hook. Subsequent visits short-circuit.

## Cookies / global state

CRM has no cookie state of its own — it reuses the workspace `KitchenSettings`
business type to drive UI terminology (`crmTerminologyForMode`).

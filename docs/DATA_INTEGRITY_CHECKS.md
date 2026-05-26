# Data Integrity Checks

## Route

`/dashboard/system-health/data-integrity`

## Service

`services/integrity/integrity-service.ts`

- `countIntegrityIssues` — fast aggregate for Today KPI
- `listIntegrityIssues` — paginated issue cards with `href` to fixing surfaces

## Rules (`lib/integrity/integrity-rules.ts`)

| Kind | Detection |
|------|-----------|
| `ORDER_NO_ITEMS` | Orders with zero `OrderItem` rows |
| `DELIVERY_NO_ADDRESS` | Active delivery orders with `deliveryAddressJson = NULL` |
| `ORDER_LINE_NO_PRICE` | Items missing `unitPrice` or `lineTotal` |
| `UNMAPPED_EXTERNAL_PRODUCT` | External catalog rows without `mappedProductId` |

## Actions

This page is **read-only triage**. “Fix” = navigate to linked module. Future: create tasks / export CSV / mute false positives with audit.

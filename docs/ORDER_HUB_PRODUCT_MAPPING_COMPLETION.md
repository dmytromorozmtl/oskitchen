# Order hub + product mapping — completion notes

## Order hub

| Path | Responsibility |
|------|----------------|
| `services/order-hub/order-hub-service.ts` | Loads internal KitchenOS orders + external orders + mapping conflict count. |
| `services/order-hub/order-triage-service.ts` | Tab metadata + pure filters for internal/external rows. |
| `app/dashboard/order-hub/page.tsx` | Tab strip, mapping banner, dual tables, row links to `/dashboard/orders/[id]`. |

### Tabs

`all`, `needs_review`, `needs_mapping`, `ready_for_production`, `in_production`, `packing`, `fulfillment`, `completed`, `failed / errors`.

External rows only render for `all`, `failed`, `needs_review` to avoid empty noise on kitchen-specific tabs.

## Product mapping

| Path | Responsibility |
|------|----------------|
| `lib/product-mapping/product-mapping-rules.ts` | Policy helpers + re-export of `BULK_APPROVABLE` / `isBulkApprovable`. |
| `services/product-mapping/*` (existing) | Matching + persistence of mappings. |

### Policy highlights

- Never auto-map `LOW` / `MEDIUM` / `NONE` confidence labels.
- Bulk approve remains constrained to `EXACT_SKU`, `EXACT_TITLE`, and reviewed `HIGH` (see `matching-confidence.ts`).

## Integration points

- Mapping conflicts (`missing_product_mapping` on `ORDER` records) feed **order blockers** and Today KPIs.
- Hub links to **Imports**, **Product mapping workbench**, and **Order detail**.

# Order detail page — completion notes

## Files

| Path | Role |
|------|------|
| `services/orders/order-detail-service.ts` | `loadOrderDetailPageData` — single Prisma load + activity + mapping conflicts + lifecycle view. |
| `components/orders/order-detail-header.tsx` | Customer summary, DB + FoodOps badges, blocker chips, quick links. |
| `components/orders/order-detail-tab-nav.tsx` | Server tabs via `?tab=` query param. |
| `components/orders/order-detail-panels.tsx` | Tab bodies (Overview, Items, Production, Packing, Fulfillment, Customer, Notes, Activity). |
| `components/orders/order-detail-operations.tsx` | Status buttons + internal notes editor (existing). |

## Behavior

- **Overview** shows pipeline card with blocker list, truncated line items, CRM/production/packing/route snapshots, channel import card, and recent activity.
- **Items** adds SKU column + full table.
- Dedicated tabs avoid scrolling fatigue while keeping SSR performance.
- Lifecycle stage badge uses `services/orders/order-lifecycle-service.ts`.

## Audit tab

Not split separately yet — activity feed doubles as operator-facing history; platform-only audit remains under `/platform/audit` (P2: gated embed).

## Follow-ups (P2)

- Intent buttons wired to `validateIntentAgainstDb` with server actions per intent.
- Packing verification QR deep link once route stabilizes.

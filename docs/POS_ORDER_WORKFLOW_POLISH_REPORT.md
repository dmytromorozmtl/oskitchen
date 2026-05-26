# POS order workflow polish — report

## Audited

- POS checkout, order creation, lifecycle derivation, blockers, workflow branches, customer/CRM behavior, activity feed, sidebar nav, platform workspace surface.

## Logic improvements

- **Fulfillment:** `requiresScheduledServiceDate` centralizes when `pickupDate` is mandatory; POS counter pickup defaults to **pickup-now** via `fulfillmentIntent` metadata.
- **Lifecycle / blockers:** aligned on the same rule; `NEEDS_FULFILLMENT_SCHEDULING` operational branch when scheduling missing.
- **Transitions:** `PREPARING` blocked server-side if scheduled date still required — removes misleading CTA.
- **Next actions:** `resolveOrderNextActionBundle` prioritizes fulfillment and mapping before production.

## UX

- Order header titles, badges, guest customer display, conditional customer lookup, tab counts, items routing columns, fulfillment/routing copy, production explanation.

## Navigation

- Commerce group; removed duplicate menus link from commerce cluster.

## Activity & platform

- Extra sanitized POS audit events; activity label map.
- Platform workspace POS diagnostics (counts only).

## QA

- `npm run typecheck` ✅  
- `npm run build` ✅  

## Limitations & next roadmap

- POS UI to choose **scheduled pickup** vs **pickup now** (persist `scheduledPickup` / `SCHEDULED_PICKUP` intent).
- Richer per-product ops flags instead of recipe-only heuristic.
- Sticky action bar / mobile footer.
- Deeper integrity surfacing in Data Integrity center using `pos-integrity-rules` outputs.

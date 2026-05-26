# Storefront fulfillment rule engine

**Implemented:** `lib/storefront/fulfillment-rules.ts`, `services/storefront/storefront-fulfillment-rule-engine.ts`, `actions/storefront-order.ts`, admin helper `describeFulfillmentRuleForAdmin`.

**Supported JSON `type` values (aliases in parentheses):**

- `closure_dates` (`HOLIDAY_CLOSURE`) — blocks all fulfillment on listed ISO dates.
- `pickup_only_dates` / `delivery_blocked_dates` (`PICKUP_ONLY_DATE`, `DELIVERY_DISABLED_DATE`) — blocks delivery on dates.
- `product_blocked_dates` (`PRODUCT_UNAVAILABLE_BY_DATE`) — per product per date.
- `max_orders_date` (`MAX_ORDERS_FOR_DATE`) — cap orders for a calendar day (non-test orders).
- `max_orders_window` (`MAX_ORDERS_FOR_WINDOW`) — cap between ISO `start`/`end` (requires valid window).
- `zone_minimum` (`ZONE_SPECIFIC_MINIMUM`) — optional `zoneName`; uses matched delivery zone from address validation; warns if zone required but unmatched.
- `fulfillment_method_restriction` (`FULFILLMENT_METHOD_RESTRICTION`) — `blockedMethods` / `blocked` array + optional `dates`.
- `order_minimum_by_fulfillment` (`ORDER_MINIMUM_BY_FULFILLMENT`) — `pickupMin` / `deliveryMin`.
- `product_specific_cutoff` (`PRODUCT_SPECIFIC_CUTOFF`) — entries with `cutoffTime` HH:mm; enforced only when fulfillment day is “today” in storefront TZ.
- `delivery_zone_surcharge` (`DELIVERY_ZONE_SURCHARGE`) — **warning only** (no automatic fee line item).

**Checkout:** Server `submitPublicStorefrontOrder` is source of truth; client previews must not override.

**QA samples:** closure JSON on today; delivery blocked with DELIVERY; zone_minimum with `zoneName` matching JSON zone name.

**Roadmap:** Richer window semantics (per slot), surcharge when pricing model exists.

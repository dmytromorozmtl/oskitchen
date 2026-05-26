# Payment and status

## Payment modes

| Mode | What it means |
|------|---------------|
| `PAY_LATER` | Will pay before fulfillment (default for most). |
| `REQUEST_ONLY` | Pure request — no payment intent yet (storefront, custom). |
| `PAID_EXTERNALLY` | Already paid on another channel (sales channel imports). |
| `MANUAL_INVOICE` | An invoice will be sent (catering, bar event). |
| `STRIPE_PLACEHOLDER` | Reserved for future Stripe checkout — *not enabled here*. |
| `CASH` | Recorded as cash (café default). |
| `CARD_TERMINAL_PLACEHOLDER` | Reserved for future POS terminal integration. |

Two placeholder modes never trigger payment processing. The service
sets `paymentStatus = "UNPAID"` for all but `PAID_EXTERNALLY` (which
becomes `"PAID"`). Real Stripe / terminal flows are deliberately not
implemented in this iteration.

## Status on save

The Payment / status step constrains choices to the active mode's
`allowedStatuses`:

- `MANUAL_ORDER` / `RESTAURANT_ORDER` / `CAFE_ORDER` / `BAKERY_ORDER` /
  `PREORDER`: Draft, Requested, Confirmed.
- `BAR_EVENT_ORDER` / `CATERING_ORDER` / `MEAL_PLAN_ORDER` /
  `CUSTOM_ORDER`: Draft, Requested, Confirmed.
- `STOREFRONT_ORDER` / `SALES_CHANNEL_ORDER`: Requested or Confirmed
  only — never silently confirmed from the client.

The widened status string is stored in `Order.statusDetail`. The
narrow DB enum (`Order.status`) is filled with a sensible bucket via
`toDbOrderStatus`.

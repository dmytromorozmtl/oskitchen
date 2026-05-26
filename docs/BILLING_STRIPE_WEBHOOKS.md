# Stripe webhooks

Route: `POST /api/webhooks/stripe`

## Verification

1. Reject if `STRIPE_SECRET_KEY` is missing → 503.
2. Reject if `stripe-signature` header or `STRIPE_WEBHOOK_SECRET` is
   missing → 400.
3. `stripe.webhooks.constructEvent(body, signature, secret)` — invalid
   signatures return 400.

## Idempotency

Before processing, look up `billing_events` by `stripe_event_id`. If a
row exists, return `{ received: true, duplicate: true }` and do nothing.

Every handler that mutates state writes a new `BillingEvent` row with
the same `stripeEventId`. Duplicate deliveries are therefore no-ops.

## Handled events

| Event | Action |
|-------|--------|
| `checkout.session.completed` | `applyStripeCheckoutCompleted` + mark trial converted. |
| `customer.subscription.created` | `applyStripeSubscription`. |
| `customer.subscription.updated` | `applyStripeSubscription`. |
| `customer.subscription.deleted` | `applyStripeSubscription` (sets `CANCELLED`). |
| `invoice.created` | `applyStripeInvoice` → InvoiceRecord upsert (status DRAFT/OPEN). |
| `invoice.finalized` | Same. |
| `invoice.paid` | Same → status `PAID`, refresh subscription. |
| `invoice.payment_succeeded` | Same. |
| `invoice.payment_failed` | Same → `OPEN` and pull subscription, which will move to `PAST_DUE`. |
| `customer.updated` | `BillingEvent STRIPE_CUSTOMER_UPDATED`. |
| _other_ | Recorded with type `STRIPE_<EVENT_TYPE>` when a workspace can be resolved from `metadata.userId`. |

## State writes (subscription)

`applyStripeSubscription` writes:

- `plan` (from metadata when present, otherwise unchanged)
- `status` (mapped to legacy 4-value enum)
- `statusDetail` (widened key, source of truth)
- `stripeCustomerId`, `stripeSubscriptionId`, `stripePriceId`
- `currentPeriodStart`, `currentPeriodEnd`
- `trialStart`, `trialEnd`
- `cancelAtPeriodEnd`, `cancelledAt`

## State writes (invoice)

`applyStripeInvoice` upserts on `stripeInvoiceId` with number, amounts
in cents, currency, hosted URL, PDF URL, issued + paid timestamps.

## Failure mode

If processing throws, the route returns `{ received: true, error: true }`
with HTTP 500. Stripe will retry. Idempotency guard handles duplicates.

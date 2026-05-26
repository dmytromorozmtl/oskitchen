# Stripe setup

## Required env vars

| Variable | Required | Notes |
|----------|----------|-------|
| `STRIPE_SECRET_KEY` | yes (prod) | `sk_test_*` in dev/test, `sk_live_*` in prod. Server only. |
| `STRIPE_WEBHOOK_SECRET` | yes (prod) | `whsec_*`. Verified per request. |
| `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID` | yes | `price_*`. |
| `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` | yes | `price_*`. |
| `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID` | yes | `price_*`. |
| `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID` | optional | Only if Enterprise is self-serve. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | Reserved for Elements. |
| `NEXT_PUBLIC_APP_URL` | yes | Used for `success_url` / `return_url`. |

## Diagnostics

`/dashboard/billing/settings` renders `getStripeDiagnostics()`. The output
shows **presence only** (e.g. `price_…`, `whsec_…`, `sk_test`) and never
the actual value.

## Webhook endpoint

```
POST {NEXT_PUBLIC_APP_URL}/api/webhooks/stripe
```

Add to Stripe Dashboard → Webhooks. Required events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.created`
- `invoice.finalized`
- `invoice.paid` (or `invoice.payment_succeeded`)
- `invoice.payment_failed`
- `customer.updated`

## Local development

If Stripe keys are missing, checkout buttons render as **disabled** and
the page shows the *Stripe setup required* banner. The app stays usable.

For local dev that should bypass billing (no plan gates), set:

```
DEV_BYPASS_BILLING=true
```

This only takes effect when `NODE_ENV=development`.

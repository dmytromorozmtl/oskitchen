# Stripe live mode setup

## Products & prices

Create products aligned with KitchenOS tiers (**Starter**, **Pro**, **Team**, **Enterprise / contact sales**). Attach recurring prices:

- Monthly (required for current Checkout wiring)
- Annual (optional — add separate price IDs and UI when ready)

Copy live **Price IDs** into:

- `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID`
- Enterprise may remain sales-assisted (mailto) — optional price env.

## Keys

- **Test:** `sk_test_*`, `pk_test_*`, test webhook secret.
- **Live:** `sk_live_*`, `pk_live_*`, live webhook secret — never mix with test publishable key.

## Routes

- Checkout: `POST /api/checkout`
- Portal: `POST /api/billing-portal`
- Webhook: `POST /api/webhooks/stripe`

## Webhook events (implemented / compatible)

Subscribe to at least:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`
- `invoice.payment_succeeded`

Signature verification uses `STRIPE_WEBHOOK_SECRET` and raw request body.

## Test mode checklist

- [ ] Stripe CLI forwarding works locally
- [ ] Test card checkout updates `subscription` row
- [ ] Portal opens for customer with `stripeCustomerId`
- [ ] Webhook retries visible in Stripe dashboard

## Live mode checklist

- [ ] Live products/prices created
- [ ] Live keys + live price IDs in **Vercel Production**
- [ ] **New** webhook endpoint on production domain + live signing secret
- [ ] Tax / invoices settings reviewed
- [ ] Billing page shows **live** mode (no `sk_test` secret)

## Stripe CLI (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Vercel production

Webhook URL: `https://YOUR_DOMAIN/api/webhooks/stripe`

## App UX

- Billing page warns when Stripe env incomplete or test keys detected (`BillingPanel`).

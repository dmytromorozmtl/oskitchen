# Stripe integration (LIVE)

OS Kitchen ships a **LIVE** Stripe connector: PaymentIntent creation, signed webhooks, and payout reconciliation.

## Competitor comparison

| Capability | Stripe Dashboard | OS Kitchen Stripe LIVE |
|------------|------------------|------------------------|
| Payments | Manual API setup | One-click PaymentIntent from dashboard |
| Webhooks | Separate endpoints | Unified integration webhook |
| Payouts | Manual export | Auto-reconcile vs paid orders |

## Sales pitch

> "Accept card payments and reconcile Stripe payouts without leaving OS Kitchen."

## Endpoints

```text
POST /api/integrations/stripe/connect
POST /api/integrations/stripe/payment-intent
POST /api/integrations/stripe/webhook
POST /api/integrations/stripe/reconcile-payouts
```

## Required environment

```bash
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # optional client key
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/stripe-live-payment-intent.test.ts \
  tests/unit/stripe-live-webhook.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

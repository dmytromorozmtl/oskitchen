# Stripe LIVE integration setup (Era 163)

Era 163 certifies Stripe LIVE integration wiring: PaymentIntent, webhook handling, and payout reconciliation — with live proof via era86 smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-stripe-live.ts` | Live PaymentIntent → webhook → payout orchestrator |
| `services/integrations/stripe/payment-intent.service.ts` | PaymentIntent creation |
| `services/integrations/stripe/webhook-handler.service.ts` | Webhook event processing |
| `services/integrations/stripe/payout-reconciliation.service.ts` | Payout reconciliation |
| `services/integrations/stripe/stripe-live-service.ts` | Live connection service |
| `app/api/integrations/stripe/webhook/route.ts` | Webhook endpoint |
| `app/api/integrations/stripe/payment-intent/route.ts` | PaymentIntent API |
| `app/api/integrations/stripe/reconcile-payouts/route.ts` | Payout reconciliation API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:stripe-live-era163` | Full era163 cert + wiring audit |
| `npm run test:ci:stripe-live-smoke-era163` | Era163 + era86 + integration tests |
| `npm run test:ci:stripe-live-smoke-era163:cert` | Wiring cert only (CI gate) |
| `npm run smoke:stripe-live` | Live secret key proof |

## Human activation

1. Provision Stripe test/live secret key (real key, not placeholder).
2. Configure `STRIPE_WEBHOOK_SECRET` for integration webhook endpoint.
3. Set `STRIPE_SECRET_KEY` + `DATABASE_URL` + `CHANNEL_SMOKE_OWNER_EMAIL` in `.env.smoke.local`.
4. Run `npm run smoke:stripe-live` — live path PASSED.
5. Run `npm run smoke:stripe-live-era163` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `payment_intent` | `createStripeLivePaymentIntent` |
| `webhook` | Webhook handler + route |
| `payout_reconciliation` | `reconcileStripePayouts` |

## Artifact

Summary written to `artifacts/stripe-live-smoke-era163-smoke-summary.json` (gitignored).

See also: [stripe-live-smoke-setup.md](./stripe-live-smoke-setup.md)

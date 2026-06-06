# Square Payments LIVE integration setup (Era 164)

Era 164 certifies Square Payments LIVE integration wiring: OAuth, payment processing, and refund sync — with sandbox proof via era87 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-square-payments-live.ts` | Live OAuth → payment → refund orchestrator |
| `services/integrations/square-payments/payment-processing.service.ts` | Payment processing |
| `services/integrations/square-payments/refund-sync.service.ts` | Refund sync |
| `services/integrations/square-payments/square-payments-api.ts` | Square API client |
| `services/integrations/square-payments/square-payments-live-service.ts` | Live connection service |
| `app/api/integrations/square-payments/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/square-payments/process-payment/route.ts` | Payment processing API |
| `app/api/integrations/square-payments/sync-refunds/route.ts` | Refund sync API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:square-payments-live-era164` | Full era164 cert + wiring audit |
| `npm run test:ci:square-payments-live-smoke-era164` | Era164 + era87 + integration tests |
| `npm run test:ci:square-payments-live-smoke-era164:cert` | Wiring cert only (CI gate) |
| `npm run smoke:square-payments-live` | Live sandbox OAuth proof |

## Human activation

1. Provision Square sandbox merchant + location (real token, not placeholder).
2. Complete OAuth in Dashboard → Integrations → Square Payments.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:square-payments-live` — live path PASSED.
5. Run `npm run smoke:square-payments-live-era164` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Square OAuth token flow |
| `payment_processing` | Payment processing service + API |
| `refund_sync` | `syncSquareRefunds` |

## Artifact

Summary written to `artifacts/square-payments-live-smoke-era164-smoke-summary.json` (gitignored).

See also: [square-payments-live-smoke-setup.md](./square-payments-live-smoke-setup.md)

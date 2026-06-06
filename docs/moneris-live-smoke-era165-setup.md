# Moneris LIVE integration setup (Era 165)

Era 165 certifies Moneris LIVE integration wiring: OAuth and payment gateway — with sandbox proof via era88 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-moneris-live.ts` | Live OAuth → gateway verify → payment orchestrator |
| `services/integrations/moneris/payment-gateway.service.ts` | Payment gateway processing |
| `services/integrations/moneris/moneris-api.ts` | Moneris API client |
| `services/integrations/moneris/moneris-live-service.ts` | Live connection service |
| `app/api/integrations/moneris/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/moneris/process-payment/route.ts` | Payment processing API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:moneris-live-era165` | Full era165 cert + wiring audit |
| `npm run test:ci:moneris-live-smoke-era165` | Era165 + era88 + integration tests |
| `npm run test:ci:moneris-live-smoke-era165:cert` | Wiring cert only (CI gate) |
| `npm run smoke:moneris-live` | Live sandbox OAuth proof |

## Human activation

1. Provision Moneris sandbox store (real credentials, not placeholder).
2. Complete OAuth in Dashboard → Integrations → Moneris; set store ID.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:moneris-live` — live path PASSED.
5. Run `npm run smoke:moneris-live-era165` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Moneris OAuth token flow |
| `payment_gateway` | Gateway verify + `processMonerisPayment` |

## Artifact

Summary written to `artifacts/moneris-live-smoke-era165-smoke-summary.json` (gitignored).

See also: [moneris-live-smoke-setup.md](./moneris-live-smoke-setup.md)

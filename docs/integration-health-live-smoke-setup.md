# Integration Health LIVE smoke setup (Era 91)

Era 91 certifies the full LIVE integration fleet: 17 provider wiring certs (era71–era90) plus the Integration Health LIVE dashboard (18th surface).

## Fleet composition

| # | Integration | Era cert |
|---|-------------|----------|
| 1 | WooCommerce | era71 |
| 2 | Shopify | era72 |
| 3 | Uber Eats | era76 |
| 4 | DoorDash | era77 |
| 5 | Grubhub | era78 |
| 6 | Skip / Just Eat | era79 |
| 7 | QuickBooks | era80 |
| 8 | Xero | era81 |
| 9 | 7shifts | era82 |
| 10 | Homebase | era83 |
| 11 | Klaviyo | era84 |
| 12 | Mailchimp | era85 |
| 13 | Stripe | era86 |
| 14 | Square Payments | era87 |
| 15 | Moneris | era88 |
| 16 | OpenTable | era89 |
| 17 | Resy | era90 |
| 18 | Integration Health LIVE dashboard | era91 |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:integration-health-live-era91` | Full fleet cert — era91 unit + all 17 provider :cert scripts |
| `npm run smoke:integration-health-live-era91 -- --wiring-only` | Era91 cert + wiring audit only (fast) |
| `npm run test:ci:integration-health-live-smoke-era91` | Era91 + integration health live service tests |
| `npm run test:ci:integration-health-live-smoke-era91:cert` | Wiring cert only (CI gate) |

## Human activation

1. Confirm all provider policies exist under `lib/integrations/*-live-smoke-era*-policy.ts`.
2. Open **Dashboard → Integration Health → LIVE** — verify health scores for all 17 providers.
3. Configure vault credentials per provider when ready for live tenant proof.
4. Run `npm run smoke:integration-health-live-era91` — artifact `artifacts/integration-health-live-smoke-summary.json` should show **PASSED**.

## Honesty gate

Individual provider live smokes may **SKIPPED** with placeholder credentials — fleet PASS means wiring certs + dashboard wiring are complete, not that every tenant has live API proof.

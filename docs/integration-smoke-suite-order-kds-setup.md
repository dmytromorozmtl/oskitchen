# Integration smoke suite — 18 LIVE order→KDS round-trip

Fleet policy: `lib/integrations/integration-smoke-suite-order-kds-policy.ts`

## Prerequisites

Same staging vault as [live-integrations-staging-smoke-setup.md](./live-integrations-staging-smoke-setup.md):

- `E2E_STAGING_BASE_URL`
- `DATABASE_URL`, `ENCRYPTION_KEY`
- `CHANNEL_SMOKE_CONNECTION_ID` or `CHANNEL_SMOKE_OWNER_EMAIL`
- Per-provider merchant credentials in `.env.smoke.local`

## Run

```bash
npm run test:ci:integration-smoke-suite-order-kds:cert
npm run smoke:integration-suite-order-kds
npm run smoke:integration-suite-order-kds -- --provider woocommerce
npm run smoke:integration-suite-order-kds -- --checklist-only
```

## Fleet (18)

| Kind | Count | KDS ticket required |
|------|-------|---------------------|
| Channel order (Woo, Shopify, marketplaces) | 6 | Yes — ExternalOrder → KDS |
| Payment rails (Stripe, Square, Moneris) | 3 | Yes — internal order → KDS |
| Sync-only (accounting, labour, CRM, reservations) | 8 | No — honest skip |
| Integration Health + KDS board probe | 1 | Board reachability |

Native OS Kitchen order→KDS E2E specs: `e2e/kds-staging.spec.ts`, `e2e/storefront-checkout-kds.spec.ts`, `e2e/qr-guest-order-kitchen.spec.ts`, `e2e/pos-checkout-flow.spec.ts`.

Artifact: `artifacts/integration-smoke-suite-order-kds-summary.json`

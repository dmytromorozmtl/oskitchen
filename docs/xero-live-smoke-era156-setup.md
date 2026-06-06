# Xero LIVE integration setup (Era 156)

Era 156 certifies Xero LIVE integration wiring: OAuth, invoice sync, and bank reconciliation — with demo org proof via era81 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-xero-live.ts` | Live OAuth → invoice → bank reconcile orchestrator |
| `services/integrations/xero/invoice-sync.service.ts` | Supplier invoice sync |
| `services/integrations/xero/bank-reconciliation.service.ts` | Bank transaction reconciliation |
| `services/integrations/xero/xero-api.ts` | Xero API client |
| `app/api/integrations/xero/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/xero/sync-invoices/route.ts` | Invoice sync API |
| `app/api/integrations/xero/reconcile-bank/route.ts` | Bank reconciliation API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:xero-live-era156` | Full era156 cert + wiring audit |
| `npm run test:ci:xero-live-smoke-era156` | Era156 + era81 + integration tests |
| `npm run test:ci:xero-live-smoke-era156:cert` | Wiring cert only (CI gate) |
| `npm run smoke:xero-live` | Live demo org OAuth proof |

## Human activation

1. Provision Xero demo organisation (real tenant ID, not placeholder).
2. Complete OAuth in Dashboard → Integrations → Xero; configure expense account code.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:xero-live` — live path PASSED.
5. Run `npm run smoke:xero-live-era156` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Xero OAuth token flow |
| `invoice_sync` | `syncXeroSupplierInvoices` |
| `bank_reconciliation` | `reconcileXeroBankTransactions` |

## Artifact

Summary written to `artifacts/xero-live-smoke-era156-smoke-summary.json` (gitignored).

See also: [xero-live-smoke-setup.md](./xero-live-smoke-setup.md)

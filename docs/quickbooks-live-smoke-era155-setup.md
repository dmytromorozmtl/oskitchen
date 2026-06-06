# QuickBooks LIVE integration setup (Era 155)

Era 155 certifies QuickBooks LIVE integration wiring: OAuth, chart of accounts sync, and daily sales journal export — with sandbox proof via era80 live smoke.

## Wiring surfaces

| Path | Role |
|------|------|
| `scripts/smoke-quickbooks-live.ts` | Live OAuth → chart → journal orchestrator |
| `services/integrations/quickbooks/daily-sales-journal.service.ts` | Daily sales journal export |
| `services/integrations/quickbooks/chart-of-accounts.service.ts` | Chart of accounts sync |
| `services/integrations/quickbooks/quickbooks-api.ts` | Intuit API client |
| `app/api/integrations/quickbooks/oauth/callback/route.ts` | OAuth callback |
| `app/api/integrations/quickbooks/sync-journal/route.ts` | Journal sync API |
| `app/api/integrations/quickbooks/accounts/route.ts` | Accounts API |

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:quickbooks-live-era155` | Full era155 cert + wiring audit |
| `npm run test:ci:quickbooks-live-smoke-era155` | Era155 + era80 + integration tests |
| `npm run test:ci:quickbooks-live-smoke-era155:cert` | Wiring cert only (CI gate) |
| `npm run smoke:quickbooks-live` | Live sandbox OAuth proof |

## Human activation

1. Provision Intuit QuickBooks sandbox company (real realm ID, not placeholder).
2. Complete OAuth in Dashboard → Integrations → QuickBooks; map sales + deposit accounts.
3. Set `DATABASE_URL` + `ENCRYPTION_KEY` + `CHANNEL_SMOKE_OWNER_EMAIL`.
4. Run `npm run smoke:quickbooks-live` — live path PASSED.
5. Run `npm run smoke:quickbooks-live-era155` — artifact **PASSED**.

## Capabilities

| Capability | Source |
|------------|--------|
| `oauth` | Intuit OAuth token flow |
| `daily_sales_journal` | `postQuickBooksDailySalesJournal` |
| `chart_of_accounts` | `fetchQuickBooksChartOfAccounts` |

## Artifact

Summary written to `artifacts/quickbooks-live-smoke-era155-smoke-summary.json` (gitignored).

See also: [quickbooks-live-smoke-setup.md](./quickbooks-live-smoke-setup.md)

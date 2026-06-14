# QuickBooks integration (LIVE)

OS Kitchen ships a **LIVE** QuickBooks Online connector: Intuit OAuth, chart of accounts mapping, and automated daily sales journal posting.

**P3-84 partner application:** [`docs/quickbooks-certified-partner-p3-84.md`](./quickbooks-certified-partner-p3-84.md) — Intuit App Partner checklist (not yet certified).

## Competitor comparison

| Capability | Manual QB entry | OS Kitchen QuickBooks LIVE |
|------------|-----------------|----------------------------|
| Sales data | Spreadsheet export | OS Kitchen revenue aggregation |
| Journal entries | Bookkeeper | Daily sales journal API post |
| Chart of accounts | QB admin only | Load + map sales/deposit accounts |
| OAuth | Per-firm setup | One-click Intuit connect |

## Sales pitch

> "Close the books faster — yesterday's sales post to QuickBooks automatically."

## Endpoints

```text
GET  /api/integrations/quickbooks/oauth/callback
GET  /api/integrations/quickbooks/accounts
POST /api/integrations/quickbooks/sync-journal
GET  /api/export/quickbooks
```

## Required environment

```bash
QUICKBOOKS_CLIENT_ID=
QUICKBOOKS_CLIENT_SECRET=
QUICKBOOKS_ENVIRONMENT=sandbox
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/quickbooks-live-oauth.test.ts \
  tests/unit/quickbooks-daily-sales-journal.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

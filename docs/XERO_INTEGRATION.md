# Xero integration (LIVE)

OS Kitchen ships a **LIVE** Xero connector: OAuth, supplier invoice sync, and bank reconciliation against OS Kitchen sales deposits.

## Competitor comparison

| Capability | Manual Xero entry | OS Kitchen Xero LIVE |
|------------|-------------------|----------------------|
| Supplier bills | CSV import | API sync from OS Kitchen invoices |
| Bank deposits | Manual match | Auto-reconcile RECEIVE transactions |
| OAuth | Per-firm setup | One-click Xero connect |

## Sales pitch

> "Close the books faster — supplier invoices and bank deposits sync to Xero automatically."

## Endpoints

```text
GET  /api/integrations/xero/oauth/callback
POST /api/integrations/xero/sync-invoices
POST /api/integrations/xero/reconcile-bank
GET  /api/export/xero
```

## Required environment

```bash
XERO_CLIENT_ID=
XERO_CLIENT_SECRET=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/xero-live-oauth.test.ts \
  tests/unit/xero-invoice-sync.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

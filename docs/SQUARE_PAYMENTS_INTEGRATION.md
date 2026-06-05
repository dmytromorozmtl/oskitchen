# Square Payments integration (LIVE)

OS Kitchen ships a **LIVE** Square Payments connector — separate from Square POS order import (BETA).

## Competitor comparison

| Capability | Square Dashboard | OS Kitchen Square Payments LIVE |
|------------|------------------|----------------------------------|
| OAuth | Manual tokens | One-click partner connect |
| Payments | Separate APIs | PaymentIntent-style flow from dashboard |
| Refunds | Manual lookup | Auto-sync vs POS transactions |

## Sales pitch

> "Accept Square payments and reconcile refunds without juggling two Square products."

## Endpoints

```text
GET  /api/integrations/square-payments/oauth/callback
POST /api/integrations/square-payments/process-payment
POST /api/integrations/square-payments/sync-refunds
```

## Required environment

```bash
SQUARE_PAYMENTS_CLIENT_ID=
SQUARE_PAYMENTS_CLIENT_SECRET=
SQUARE_PAYMENTS_LOCATION_ID=
```

## How to test

```bash
node ./node_modules/.bin/vitest run tests/unit/square-payments-live-oauth.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

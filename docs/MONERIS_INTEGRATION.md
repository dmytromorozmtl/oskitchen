# Moneris integration (LIVE)

OS Kitchen ships a **LIVE** Moneris connector: OAuth partner connect and payment gateway processing.

## Competitor comparison

| Capability | Moneris portal | OS Kitchen Moneris LIVE |
|------------|----------------|-------------------------|
| OAuth | Manual tokens | One-click partner connect |
| Payments | Separate gateway setup | Dashboard purchase flow |
| Canada-first | Yes | CAD default, store-scoped |

## Sales pitch

> "Canadian restaurants get Moneris card processing inside OS Kitchen — OAuth in, payments out."

## Endpoints

```text
GET  /api/integrations/moneris/oauth/callback
POST /api/integrations/moneris/process-payment
```

## Required environment

```bash
MONERIS_CLIENT_ID=
MONERIS_CLIENT_SECRET=
MONERIS_STORE_ID=
MONERIS_API_TOKEN=  # optional fallback
```

## How to test

```bash
node ./node_modules/.bin/vitest run tests/unit/moneris-live-oauth.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

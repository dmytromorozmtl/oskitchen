# Klaviyo integration (LIVE)

OS Kitchen ships a **LIVE** Klaviyo connector: API key auth, profile sync, campaign triggers, and segment export.

## Competitor comparison

| Capability | Klaviyo app | OS Kitchen Klaviyo LIVE |
|------------|-------------|-------------------------|
| Profiles | Manual CSV | Consent-aware auto sync |
| Campaigns | Flow builder only | One-click segment triggers |
| Segments | Export in Klaviyo | CSV export + trigger from dashboard |

## Sales pitch

> "Turn OS Kitchen customer data into Klaviyo campaigns in one click — sync, segment, trigger."

## Endpoints

```text
POST /api/integrations/klaviyo/connect
POST /api/integrations/klaviyo/sync
GET  /api/integrations/klaviyo/export-segment
POST /api/integrations/klaviyo/export-segment
POST /api/integrations/klaviyo/trigger-campaign
```

## Required environment

```bash
KLAVIYO_API_KEY=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/klaviyo-live-campaign.test.ts \
  tests/unit/klaviyo-segment-export.test.ts \
  tests/unit/klaviyo-sync.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

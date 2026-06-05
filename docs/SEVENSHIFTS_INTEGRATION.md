# 7shifts integration (LIVE)

OS Kitchen ships a **LIVE** 7shifts connector: OAuth, schedule import/export, and labor cost sync.

## Competitor comparison

| Capability | 7shifts app | OS Kitchen 7shifts LIVE |
|------------|-------------|-------------------------|
| Schedules | Manual copy | Two-way API sync |
| Labor cost | Separate report | Auto-sync to staff shifts |
| OAuth | Per-company | One-click partner connect |

## Sales pitch

> "Stop double-entering shifts — 7shifts schedules and labor costs sync with OS Kitchen automatically."

## Endpoints

```text
GET  /api/integrations/7shifts/oauth/callback
POST /api/integrations/7shifts/sync-schedule
POST /api/integrations/7shifts/sync-labor
POST /api/integrations/7shifts/sync
```

## Required environment

```bash
SEVENSHIFTS_CLIENT_ID=
SEVENSHIFTS_CLIENT_SECRET=
SEVENSHIFTS_COMPANY_ID=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/seven-shifts-live-oauth.test.ts \
  tests/unit/seven-shifts-labor-cost.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

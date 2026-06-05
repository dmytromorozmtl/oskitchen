# Homebase integration (LIVE)

OS Kitchen ships a **LIVE** Homebase connector: OAuth, schedule import/export, and time clock sync.

## Competitor comparison

| Capability | Homebase app | OS Kitchen Homebase LIVE |
|------------|--------------|--------------------------|
| Schedules | Manual copy | Two-way API sync |
| Time clock | Separate punches | Auto-sync to time entries |
| OAuth | Per-location | One-click partner connect |

## Sales pitch

> "One labor source of truth — Homebase schedules and punches flow into OS Kitchen automatically."

## Endpoints

```text
GET  /api/integrations/homebase/oauth/callback
POST /api/integrations/homebase/sync-schedule
POST /api/integrations/homebase/sync-timeclock
POST /api/integrations/homebase/sync
```

## Required environment

```bash
HOMEBASE_CLIENT_ID=
HOMEBASE_CLIENT_SECRET=
HOMEBASE_LOCATION_ID=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/homebase-live-oauth.test.ts \
  tests/unit/homebase-time-clock.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

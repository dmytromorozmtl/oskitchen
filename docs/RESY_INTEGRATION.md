# Resy integration (LIVE)

OS Kitchen ships a **LIVE** Resy connector: OAuth, reservation sync, and waitlist management against the storefront calendar.

## Competitor comparison

| Capability | Resy OS | OS Kitchen Resy LIVE |
|------------|---------|----------------------|
| Reservations | Resy dashboard | Webhook + pull sync → calendar |
| Waitlist | Resy host app | Two-way waitlist sync |
| OAuth | Per-venue setup | One-click partner connect |

## Sales pitch

> "Fill every seat — Resy reservations and waitlist guests flow into OS Kitchen automatically."

## Endpoints

```text
GET  /api/integrations/resy/oauth/callback
POST /api/webhooks/resy/reservations?cid={connectionId}
POST /api/integrations/resy/sync-reservations
POST /api/integrations/resy/sync-waitlist
POST /api/integrations/resy/sync
```

## Required environment

```bash
RESY_CLIENT_ID=
RESY_CLIENT_SECRET=
RESY_VENUE_ID=
RESY_WEBHOOK_SECRET=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/resy-live-oauth.test.ts \
  tests/unit/resy-waitlist-sync.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

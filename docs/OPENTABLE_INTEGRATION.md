# OpenTable integration (LIVE)

OS Kitchen ships a **LIVE** OpenTable connector: OAuth, signed reservation webhooks, and table availability sync against the floor plan.

## Competitor comparison

| Capability | OpenTable admin | OS Kitchen OpenTable LIVE |
|------------|-----------------|---------------------------|
| Reservations | Partner portal | Webhook → storefront calendar |
| Availability | Manual blocks | Floor plan + reservation math |
| OAuth | Per-restaurant | One-click partner connect |

## Sales pitch

> "Never double-book — OpenTable reservations land in your OS Kitchen calendar in real time."

## Endpoints

```text
GET  /api/integrations/opentable/oauth/callback
POST /api/webhooks/opentable/reservations?cid={connectionId}
GET  /api/integrations/opentable/availability
POST /api/integrations/opentable/availability
POST /api/integrations/opentable/sync
```

## Required environment

```bash
OPENTABLE_CLIENT_ID=
OPENTABLE_CLIENT_SECRET=
OPENTABLE_RID=
OPENTABLE_WEBHOOK_SECRET=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/opentable-live-oauth.test.ts \
  tests/unit/opentable-reservation-webhook.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

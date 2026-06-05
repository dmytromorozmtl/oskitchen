# Mailchimp integration (LIVE)

OS Kitchen ships a **LIVE** Mailchimp connector: OAuth, audience list sync, and campaign automation triggers.

## Competitor comparison

| Capability | Mailchimp app | OS Kitchen Mailchimp LIVE |
|------------|---------------|---------------------------|
| Audiences | Manual CSV | Consent-aware OAuth sync |
| Automations | Separate setup | One-click queue from dashboard |
| OAuth | Per-account | One-click partner connect |

## Sales pitch

> "Sync restaurant customers to Mailchimp and fire automations without leaving OS Kitchen."

## Endpoints

```text
GET  /api/integrations/mailchimp/oauth/callback
GET  /api/integrations/mailchimp/lists
POST /api/integrations/mailchimp/sync-list
GET  /api/integrations/mailchimp/trigger-automation
POST /api/integrations/mailchimp/trigger-automation
POST /api/integrations/mailchimp/sync
```

## Required environment

```bash
MAILCHIMP_CLIENT_ID=
MAILCHIMP_CLIENT_SECRET=
MAILCHIMP_LIST_ID=
```

## How to test

```bash
node ./node_modules/.bin/vitest run \
  tests/unit/mailchimp-live-oauth.test.ts \
  tests/unit/mailchimp-sync.test.ts
```

## Honesty

Registry status is **LIVE**. G3/G4 production uptime proof is measured per-tenant — see Integration Health DoD panel.

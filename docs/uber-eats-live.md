# Uber Eats LIVE

Production pipeline for Uber Eats Marketplace: OAuth, signed webhooks, menu sync, and order mapping.

## Dashboard

`/dashboard/integrations/uber-eats/live`

## Flow

1. Save **client ID**, **secret**, and **store UUID** on the Uber Eats settings page.
2. Click **Connect with Uber** (OAuth authorization code).
3. Register the **webhook URL** in the Uber developer portal.
4. **Sync menu** pushes active OS Kitchen menus to Uber Menu API v2.
5. Orders arrive via webhook (`processUberEatsLiveWebhook`) or **Import orders** poll.

## Environment

| Variable | Purpose |
|----------|---------|
| `UBER_EATS_CLIENT_ID` | OAuth client |
| `UBER_EATS_CLIENT_SECRET` | OAuth secret |
| `UBER_EATS_STORE_ID` | Default store UUID |
| `UBER_EATS_WEBHOOK_SECRET` | HMAC verification fallback |
| `UBER_EATS_OAUTH_REDIRECT_URI` | Optional override for callback |

## Code map

| Area | Path |
|------|------|
| LIVE service | `services/integrations/uber-eats-live-service.ts` |
| OAuth callback | `app/api/integrations/uber-eats/oauth/callback/route.ts` |
| Webhook | `app/api/webhooks/uber-eats/orders/route.ts` |
| Order mapping | `services/integrations/uber-eats/uber-eats-marketplace.ts` |

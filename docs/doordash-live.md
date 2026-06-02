# DoorDash LIVE

Production pipeline for DoorDash Marketplace: OAuth, signed webhooks, menu sync, and order mapping.

## Dashboard

`/dashboard/integrations/doordash/live`

## Flow

1. Save **merchant ID**, **API key**, and **webhook secret** on the LIVE dashboard (or use env vars).
2. Click **Connect with DoorDash** when `DOORDASH_OAUTH_CLIENT_SECRET` is configured.
3. Register the **webhook URL** in the DoorDash developer portal.
4. **Sync menu** pushes active OS Kitchen menus to DoorDash Marketplace.
5. Orders arrive via webhook (`processDoorDashLiveWebhook`) or **Import orders** poll.

## Environment

| Variable | Purpose |
|----------|---------|
| `DOORDASH_API_KEY` | Bearer token fallback |
| `DOORDASH_MERCHANT_ID` | Merchant / store ID |
| `DOORDASH_WEBHOOK_SECRET` | HMAC verification fallback |
| `DOORDASH_OAUTH_CLIENT_ID` | OAuth client |
| `DOORDASH_OAUTH_CLIENT_SECRET` | OAuth secret |
| `DOORDASH_OAUTH_REDIRECT_URI` | Optional override for callback |

## Code map

| Area | Path |
|------|------|
| LIVE service | `services/integrations/doordash-live-service.ts` |
| Credentials | `services/integrations/doordash/doordash-credentials.ts` |
| OAuth callback | `app/api/integrations/doordash/oauth/callback/route.ts` |
| Webhook | `app/api/webhooks/doordash/orders/route.ts` |
| Order mapping | `services/integrations/doordash/doordash-marketplace.ts` |

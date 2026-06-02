# Grubhub LIVE

Production pipeline for Grubhub Marketplace: OAuth, signed webhooks, menu sync, and order mapping.

## Dashboard

`/dashboard/integrations/grubhub/live`

## Flow

1. Save **merchant ID**, **API key**, and **webhook secret** on the LIVE dashboard (or use env vars).
2. Click **Connect with Grubhub** when `GRUBHUB_OAUTH_CLIENT_SECRET` is configured.
3. Register the **webhook URL** in the Grubhub developer portal.
4. **Sync menu** pushes active OS Kitchen menus to Grubhub Marketplace.
5. Orders arrive via webhook (`processGrubhubLiveWebhook`) or **Import orders** poll.

## Environment

| Variable | Purpose |
|----------|---------|
| `GRUBHUB_API_KEY` | Bearer token fallback |
| `GRUBHUB_MERCHANT_ID` | Merchant / store ID |
| `GRUBHUB_WEBHOOK_SECRET` | HMAC verification fallback |
| `GRUBHUB_OAUTH_CLIENT_ID` | OAuth client |
| `GRUBHUB_OAUTH_CLIENT_SECRET` | OAuth secret |
| `GRUBHUB_OAUTH_REDIRECT_URI` | Optional override for callback |

## Code map

| Area | Path |
|------|------|
| LIVE service | `services/integrations/grubhub-live-service.ts` |
| Credentials | `services/integrations/grubhub/grubhub-credentials.ts` |
| OAuth callback | `app/api/integrations/grubhub/oauth/callback/route.ts` |
| Webhook | `app/api/webhooks/grubhub/orders/route.ts` |
| Order mapping | `services/integrations/grubhub/grubhub-marketplace.ts` |

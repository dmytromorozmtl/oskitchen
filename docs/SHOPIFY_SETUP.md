# Shopify setup

## Prerequisites

- Custom app **Admin API access token** with scopes for orders + products (adjust to least privilege).
- **Webhook signing secret** from Shopify admin for custom apps.
- `ENCRYPTION_KEY` configured.

## Dashboard steps

1. **Integrations → Shopify** — enter `your-store.myshopify.com`, token, webhook secret, API version.
2. **Test connection** — lightweight GraphQL `shop { name }`.
3. **Sync products / orders** — Admin GraphQL queries (first page sizes are MVP defaults).

## Webhooks

Register HTTPS endpoints (same host as `NEXT_PUBLIC_APP_URL`):

| Topic | Path |
| ----- | ---- |
| Order creation | `/api/webhooks/shopify/orders-create` |
| Order updated | `/api/webhooks/shopify/orders-updated` |
| Product update | `/api/webhooks/shopify/products-update` |
| App uninstalled | `/api/webhooks/shopify/app-uninstalled` |

KitchenOS verifies `X-Shopify-Hmac-Sha256` using your saved webhook secret and dedupes via `X-Shopify-Webhook-Id`.

## Notes

- Sync uses GraphQL shapes; webhooks use REST payloads — both normalize into `external_orders` / `external_products`.
- Programmatic webhook registration (`webhookSubscriptionCreate`) is stubbed — register via admin during MVP.

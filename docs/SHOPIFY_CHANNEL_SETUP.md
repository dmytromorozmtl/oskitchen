# Shopify channel setup

1. Open **Sales channels → Shopify** (`/dashboard/integrations/shopify`).
2. Enter shop domain (e.g. `your-store.myshopify.com`) and Admin API access token + webhook secret — encrypted at rest.
3. Register Shopify webhooks to the documented `/api/webhooks/shopify/*` endpoints with HMAC verification.
4. Monitor **Webhook activity** for `orders/create`, `orders/updated`, `products/update`, and `app/uninstalled`.

Shopify is a trademark of Shopify Inc. OS Kitchen does not imply official partnership beyond standard API usage.

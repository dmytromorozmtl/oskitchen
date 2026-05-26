# WooCommerce & Shopify — test shop setup

Use a **dedicated test shop** (never production customer data) before pilot sign-off.

## WooCommerce test shop

1. Create a WooCommerce store on staging hosting (HTTPS required).
2. **WooCommerce → Settings → Advanced → REST API** — create Read/Write keys.
3. **WooCommerce → Settings → Advanced → Webhooks**:
   - Delivery URL: copy from KitchenOS **Dashboard → Integrations → WooCommerce** (`/api/webhooks/woocommerce?cid=...`)
   - Secret: generate and paste into KitchenOS **Webhook secret**
   - Topics: `order.created`, `order.updated`, `product.updated` (or `order.*` / `product.*`)
4. KitchenOS dashboard: save URL, keys, webhook secret → **Test connection** → **Sync products** → place test order on Woo.
5. **Sales channels → Webhooks** — confirm event with `signatureValid: true`.
6. **Run certification checks** on the WooCommerce integration page.

## Shopify test shop

1. Shopify Partners → development store (`*.myshopify.com`).
2. **Settings → Apps → Develop apps** — custom app with Admin API scopes:
   - `read_orders`, `write_orders` (as needed)
   - `read_products`
3. Install app, copy **Admin API access token**.
4. **Settings → Notifications → Webhooks** (or app config):
   - `orders/create`, `orders/updated`, `products/update`
   - URL base: `{SITE_URL}/api/webhooks/shopify/orders-create` (see dashboard list)
   - Signing secret → KitchenOS **Webhook signing secret**
5. KitchenOS: save domain, token, secret → **Test connection** → test order.
6. **Run certification checks** on the Shopify integration page.

## CLI certification (staging DB)

```bash
cd /Users/dmytro/Desktop/2026/KitchenOS
npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email workspace.moroz@gmail.com
```

Optional:

```bash
npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email workspace.moroz@gmail.com --provider shopify
npx tsx scripts/smoke-woo-shopify-certification.ts --connection-id YOUR_UUID --skip-live
```

## Sign-off workflow

| Step | Where | Who |
|------|-------|-----|
| Automated checks | Integration page → **Run certification checks** | Tenant |
| Engineering | Sign-off button | Owner |
| Security | Sign-off button | Owner |
| Pilot 7d | Sign-off after 7 days clean | Owner |

Until all three sign-offs: marketing stays **BETA**. After pilot sign-off: may say **Pilot certified** — not Shopify App Store approved.

## High volume

Set `WEBHOOK_ASYNC_QUEUE=true` and ensure cron `webhook-jobs` runs with `CRON_SECRET`.

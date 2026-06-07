# Shopify integration setup

**KB:** `/kb/integrations/shopify`  
**Dashboard:** `/dashboard/integrations/shopify`  
**Maturity:** BETA — live smoke required before LIVE claim  
**Engineering reference:** [`../SHOPIFY_SETUP.md`](../SHOPIFY_SETUP.md)

---

## Prerequisites

- Shopify store (development or production)
- Custom app in Shopify Admin with Admin API access token
- Scopes: `read_orders`, `write_orders`, `read_products`, `write_products` (adjust to least privilege)
- Webhook signing secret from the custom app
- `ENCRYPTION_KEY` configured in OS Kitchen
- Pro plan or higher for Shopify channel sync

---

## Dashboard steps

1. Open **Dashboard → Integrations → Shopify**.
2. Enter:
   - **Shop domain** — `your-store.myshopify.com`
   - **Admin API access token**
   - **Webhook signing secret**
   - **API version** — use version shown in Integrations (e.g. `2024-10`)
3. Click **Save**.
4. Click **Test connection** — lightweight GraphQL `shop { name }` query.
5. Run **Sync products** and **Sync orders** — first page sizes are MVP defaults; paginate via manual re-sync if needed.
6. Map external products to menu items where SKUs differ.

OS Kitchen coordinates **kitchen and production** after Shopify captures the sale — it does not replace your Shopify storefront theme.

---

## Webhooks

Register HTTPS endpoints in Shopify Admin (same host as `NEXT_PUBLIC_APP_URL`):

| Topic | Path |
|-------|------|
| Order creation | `/api/webhooks/shopify/orders-create` |
| Order updated | `/api/webhooks/shopify/orders-updated` |
| Product update | `/api/webhooks/shopify/products-update` |
| App uninstalled | `/api/webhooks/shopify/app-uninstalled` |

OS Kitchen verifies `X-Shopify-Hmac-Sha256` using your saved webhook secret and dedupes via `X-Shopify-Webhook-Id`.

Programmatic registration via `webhookSubscriptionCreate` may be stubbed — register via Shopify Admin during pilot.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Test connection fails | Confirm token scopes; check API version |
| HMAC verification failed | Webhook secret must match custom app secret |
| Orders missing line items | Re-sync orders; check product mapping |
| Duplicate webhooks ignored | Expected — dedupe by webhook id |
| BETA label persists | Complete live smoke on staging before sales claims |

**Honesty:** Woo/Shopify unified inventory depletion is **not** claimed — orders drive production; inventory sync maturity per Integration Health.

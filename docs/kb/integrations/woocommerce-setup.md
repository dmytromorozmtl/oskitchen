# WooCommerce integration setup

**KB:** `/kb/integrations/woocommerce`  
**Dashboard:** `/dashboard/integrations/woocommerce`  
**Maturity:** BETA — test on staging before go-live  
**Engineering reference:** [`../WOOCOMMERCE_SETUP.md`](../WOOCOMMERCE_SETUP.md)

---

## Prerequisites

- WooCommerce store on **HTTPS** with REST API enabled
- REST API keys with **Read/Write** scope (orders + products as needed)
- Webhook secret configured in WooCommerce
- `ENCRYPTION_KEY` set in the OS Kitchen environment (secrets encrypted at rest)
- Pro plan or higher for WooCommerce channel sync

---

## Dashboard steps

1. Open **Dashboard → Integrations → WooCommerce**.
2. Enter:
   - **Store URL** — `https://yourstore.com` (no trailing slash)
   - **Consumer key** and **Consumer secret**
   - **Webhook secret** — matches WooCommerce webhook settings
3. Click **Save** — credentials stored encrypted.
4. Click **Test connection** — hits `/wp-json/wc/v3/system_status`.
5. Run **Sync products** then **Sync orders** — populates external product/order tables.
6. Review **Product mapping** for unmatched SKUs before orders route to production.

Unmatched SKUs hold in mapping queue until you link WooCommerce product IDs to OS Kitchen menu items.

---

## Webhooks

Register in WooCommerce → Settings → Advanced → Webhooks:

```text
https://YOUR_APP_URL/api/webhooks/woocommerce?cid=<connection-id>
```

Copy the connection id from the Integrations card after save.

| Setting | Value |
|---------|-------|
| Delivery URL | URL above |
| Secret | Same as saved webhook secret |
| Topics | `order.created`, `order.updated`, `product.updated` (minimum) |
| Signature header | `X-WC-Webhook-Signature` (HMAC-SHA256, base64) |

OS Kitchen verifies signature before persisting webhook payloads.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Test connection 401 | Regenerate REST keys; confirm Read/Write scope |
| Webhooks not arriving | Confirm HTTPS URL reachable; check firewall |
| Signature mismatch | Webhook secret must match Integrations save + WooCommerce webhook |
| Orders stuck unmapped | Complete Product mapping for each SKU |
| NEEDS_AUTH in Integration Health | Re-save credentials; run test connection |

**Honesty:** Do not claim LIVE WooCommerce sync until test connection PASS and at least one webhook processed on your store — check Integration Health.

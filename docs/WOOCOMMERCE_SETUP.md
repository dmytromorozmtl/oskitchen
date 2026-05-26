# WooCommerce setup

## Prerequisites

- WooCommerce REST API keys (**Read/Write** as needed).
- HTTPS storefront.
- `ENCRYPTION_KEY` set in the environment running KitchenOS.

## Dashboard steps

1. Open **Integrations → WooCommerce**.
2. Store URL + consumer key/secret + webhook secret → **Save**.
3. Use **Test connection** — hits `/wp-json/wc/v3/system_status`.
4. **Sync products / Sync orders** — pulls catalog and open orders into `external_*` tables.

## Webhooks

Target URL:

```text
https://YOUR_APP_URL/api/webhooks/woocommerce?cid=<connection-id>
```

The connection id is shown implicitly after save (copy from Integrations hub card webhook snippet).

Suggested topics: `order.*`, `product.*`.

Signature header: `X-WC-Webhook-Signature` (base64 HMAC-SHA256 of raw body with your webhook secret).

## Notes

- Auto-import toggles persist in `settings_json` — automation hooks land with Order hub import actions.
- Updating keys: leave fields blank to keep existing ciphertext.

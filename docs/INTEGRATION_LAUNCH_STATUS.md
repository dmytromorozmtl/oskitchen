# Integration launch status

OS Kitchen must never imply a channel is **live** when only **demo credentials** or **simulated** payloads exist.

## Status vocabulary

| Label | Meaning |
|-------|---------|
| **Live ready** | Real credentials stored, webhooks verified, successful test connection |
| **Credentials required** | Architecture ready; needs merchant keys/secrets |
| **Partner access required** | Uber programs / allowlisting not granted |
| **Simulated demo** | Synthetic data or stub processors for sales |
| **Disabled** | Feature flag or plan gate off |

## WooCommerce

- **What works now:** Webhook route, sync helpers, dashboard UX (verify per workspace).
- **Requires:** Store URL, keys, webhook secret (`WOOCOMMERCE_WEBHOOK_SECRET`), HTTPS callback URL.
- **Simulated:** Demo kitchens may show representative orders — label clearly.

## Shopify

- **What works now:** OAuth/app patterns + webhooks (verify app config).
- **Requires:** App credentials in Partner Dashboard, `SHOPIFY_APP_SECRET`, correct API version.
- **Partner access:** Standard public app review if distributing broadly.

## Uber Eats

- **What works now:** Adapter architecture + inbound webhook path (verify).
- **Requires:** Uber developer program approval, **live** client credentials.
- **Policy:** Do **not** market as production-live without partner-approved credentials.

## Uber Direct

- **What works now:** Quote/create/cancel API routes behind env keys.
- **Requires:** Uber Direct business approval + OAuth/client secrets.

## UI expectations

- Integration hub shows **launch strip** / labels tied to workspace demo flag + credential presence.
- Provide copy-paste **webhook URLs** and **test connection** actions.
- Log sync errors and offer **manual retry** / **replay** where implemented (`Webhook` logs).

## What to build next

- Stronger idempotency keys for all inbound webhooks
- Per-integration health scores in dashboard
- Automatic backoff + DLQ for failing deliveries

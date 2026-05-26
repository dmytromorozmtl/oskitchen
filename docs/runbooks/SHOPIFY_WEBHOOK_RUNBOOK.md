# Shopify webhook runbook

## Symptoms

- HMAC invalid rows; shop domain mismatch.

## Checks

1. `integration_connections.shop_domain` matches `X-Shopify-Shop-Domain`.
2. Webhook API version matches app configuration.

## Actions

- Re-register webhooks after rotating app secret.
- Async queue: verify cron + job rows like WooCommerce.

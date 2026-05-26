# Webhook security

## Principles

1. **Authenticate ingress** — Reject requests with missing/invalid signatures before business logic.
2. **Idempotency** — Use stable external IDs (`WebhookEvent.externalEventId`) to ignore duplicates (Shopify retries, Woo redeliveries).
3. **Fast ACK** — Return non-2xx only when the sender should retry; avoid flaky DB errors surfacing as permanent failures when possible.
4. **No secret leakage** — Never echo decrypted credentials or raw signing keys in logs/responses.

## Provider specifics

### WooCommerce

- Header `X-WC-Webhook-Signature` contains base64 HMAC-SHA256 of the **raw** body using the configured webhook secret.
- Delivery id headers help dedupe (`X-WC-Webhook-Delivery-Id`).

### Shopify

- Header `X-Shopify-Hmac-Sha256` is base64 HMAC-SHA256 of raw body using the app **webhook signing secret** (custom app).
- Always compare using constant-time helpers.

### Uber (future)

- Follow Uber’s documented signing scheme once provisioned; until then, endpoints should remain disabled publicly or protected via secret headers / allowlists in staging.

## Operational guidance

- Rotate webhook secrets alongside app reinstall flows (`app/uninstalled` handler sets connection to `NEEDS_AUTH` for Shopify).
- Monitor `WebhookEvent.signatureValid` and `processingError` columns from **Integrations → Webhook activity**.

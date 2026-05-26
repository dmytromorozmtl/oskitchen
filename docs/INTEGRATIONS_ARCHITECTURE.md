# Integrations architecture

KitchenOS treats each storefront or logistics endpoint as an **`IntegrationConnection`** row owned by a **`UserProfile`** (`users` table). Secrets are stored **encrypted** (AES-256-GCM) in typed columns (`*_encrypted`); nothing sensitive is returned to the browser after save.

## Flow

1. **Configure** — Dashboard forms POST server actions (`actions/integrations.ts`) → encrypt → Prisma upsert.
2. **Sync** — Authenticated API routes (`/api/integrations/*/sync-*`) fetch remote catalogs/orders, normalize, upsert `ExternalProduct` / `ExternalOrder`.
3. **Webhooks** — Unsigned/public endpoints validate signatures (Woo HMAC-SHA256 body digest, Shopify HMAC-SHA256). Events append **`WebhookEvent`** with optional **`externalEventId`** dedupe (Shopify webhook id, Woo delivery id).
4. **Normalize** — Provider payloads map to **`NormalizedKitchenOrder`** (`lib/order-normalization.ts`) before persistence via **`persistNormalizedExternalOrder`**.
5. **Operate** — **Order hub** surfaces internal `orders` plus `external_orders`.

## Connection routing

- **WooCommerce**: webhook URL includes `?cid=<uuid>` (connection id) because Woo cannot infer tenant from headers alone in our generic endpoint.
- **Shopify**: resolve tenant via `X-Shopify-Shop-Domain` matching `shopDomain` on the connection.
- **Uber Eats (stub)**: same `cid` pattern as Woo until Uber’s routing contract is finalized.

## Security notes

- Never log decrypted secrets.
- Webhooks must return fast; heavy work should eventually move to a queue — today processing is inline but idempotent.
- See **`docs/WEBHOOK_SECURITY.md`**.

# WooCommerce & Shopify — tenant certification checklist

**Product status in KitchenOS:** `BETA` (`lib/capabilities/capability-matrix.ts`).  
**In-app runner:** Dashboard → Integrations → WooCommerce/Shopify → **Test shop certification**.  
**CLI:** `npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email …`

**CI golden path (Era 4 Cycle 5):** policy `era4-channel-golden-path-v1` in `lib/integrations/channel-golden-path-policy.ts`; `npm run test:ci:channel-golden-path` + `test:ci:channel-golden-path:cert` (tier 0 governance bundles). Certifies webhook → `externalOrder` → channel import staging — **not** automatic kitchen `Order` creation or full marketplace live ops.

Do not market as production-certified until this checklist is signed per tenant.

## Automated checks (in-app)

| ID | Check |
|----|--------|
| encryption_configured | `ENCRYPTION_KEY` set |
| credentials_present | REST keys / Admin token saved |
| webhook_secret_present | Signing secret saved |
| rest_api_reachable | Live REST ping (skipped with `--skip-live`) |
| webhook_hmac_algorithm | Crypto self-test (Woo base64 / Shopify HMAC) |
| recent_valid_webhooks | ≥1 valid signature event in 7d |
| idempotency_index | Duplicate delivery ids logged, not double-processed |
| async_queue_recommended | `WEBHOOK_ASYNC_QUEUE` for high volume |
| invalid_signature_isolated | Invalid signatures rejected |
| shop_domain_routing | Shopify only — `*.myshopify.com` on connection |

Overall: **PASS** / **PARTIAL** (warnings) / **FAIL**.

## WooCommerce (manual)

| # | Check | Owner |
|---|--------|-------|
| 1 | Webhook signing secret configured and stored encrypted | Tenant |
| 2 | `WEBHOOK_ASYNC_QUEUE=true` for high-volume sites | Tenant |
| 3 | Cron `webhook-jobs` running with valid `CRON_SECRET` | Ops |
| 4 | Order import idempotency verified (duplicate webhook → single order) | QA |
| 5 | Catalog sync spot-check (SKU, price, stock) | QA |
| 6 | Refund/cancel path documented or explicitly out of scope | Product |
| 7 | Integration health UI shows **Configured (BETA)** — not green “verified” | Tenant |

## Shopify (manual)

| # | Check | Owner |
|---|--------|-------|
| 1 | App/webhook HMAC validated on all subscribed topics | Tenant |
| 2 | Shop domain → tenant routing verified (`shopDomain` on connection) | QA |
| 3 | GDPR/redact webhooks registered if app is public | Legal |
| 4 | Inventory/fulfillment topics aligned with KitchenOS order model | Product |
| 5 | Rate limits + retry behavior under burst (50+ webhooks/min) | QA |
| 6 | Public marketing copy matches **BETA** badge (`/integrations/woocommerce`, `/integrations/shopify`) | Marketing |

## Sign-off (dashboard — owner only)

- [ ] Engineering — code paths reviewed  
- [ ] Security — HMAC + tenant isolation on webhook handlers  
- [ ] Tenant pilot — one test shop per platform for 7 days without data bleed  

Stored in `integration_connections.settings_json.certification.signOff`.

**Until signed:** `CapabilityBadge` stays `BETA`; integration health never shows fake green OK.  
**After all three sign-offs:** `productStatus: PILOT_SIGNED` — marketing may use “Pilot certified”, capability matrix remains BETA until product promotes.

## Test shop guide

See **`docs/WOO_SHOPIFY_TEST_SHOP_SETUP.md`**.

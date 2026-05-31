# WooCommerce & Shopify — tenant certification checklist

**Product status in OS Kitchen:** `BETA` (`lib/capabilities/capability-matrix.ts`).  
**In-app runner:** Dashboard → Integrations → WooCommerce/Shopify → **Test shop certification**.  
**CLI:** `npx tsx scripts/smoke-woo-shopify-certification.ts --owner-email …`

**CI golden path (Era 4 Cycle 5 + Era 12 + Era 14 recert):** policy `era4-channel-golden-path-v1` + `era12-channel-golden-path-recert-v1` + `era14-channel-golden-path-recert-v1`; `npm run test:ci:channel-golden-path` + `test:ci:channel-golden-path:cert` (tier 0 governance bundles). Honesty checklist: `docs/channel-golden-path-honesty-checklist.md`; `npm run smoke:channel-golden-path`. Certifies webhook → `externalOrder` → channel import staging → **order_hub_visibility** via order hub external list (`loadOrderHubPageData` + `externalOrderListWhereForOwner`) — **not** auto-creating internal kitchen orders from every webhook row or full marketplace live ops.

**Staging smoke (Era 12 Cycle 3 — not in default CI):** policy `era12-channel-golden-path-smoke-v1`; `npm run smoke:woo-shopify` (`scripts/smoke-woo-shopify-certification.ts`) with `DATABASE_URL` + saved connection; use `--skip-live` for credentials-only checks. Cert wiring: `test:ci:channel-golden-path-smoke-era12:cert` (chained in `test:ci:channel-golden-path:cert`). Does **not** certify full live marketplace ops.

**Live smoke orchestrator (Era 16 Cycle 5 + Era 17 Woo/Shopify — not in default CI):** policies `era16-channel-live-smoke-v1`, **`era17-channel-live-smoke-woo-v1`**, **`era17-channel-live-smoke-shopify-v1`**; `npm run smoke:woo-shopify-live` runs synthetic cert + Woo live (`--provider woocommerce`) + Shopify live (`--provider shopify`); missing `DATABASE_URL` / `ENCRYPTION_KEY` / tenant selector → **SKIPPED WITH REASON** with explicit `missingEnvVars[]` (exit 0); real certification failure → **FAILED** (exit 1); summary artifact `artifacts/channel-live-smoke-summary.json`. Cert: `test:ci:channel-live-smoke-woo-era17:cert` + `test:ci:channel-live-smoke-shopify-era17:cert` (chained in `test:ci:channel-golden-path:cert`).

### Cycle execution record — Woo + Shopify live smoke (2026-05-28)

**Policies:** `era17-channel-live-smoke-woo-v1`, `era17-channel-live-smoke-shopify-v1` — engineering complete; **awaiting_live_credentials**.

| Check | Result |
|-------|--------|
| Synthetic golden-path cert | **PASSED** |
| Woo live (`woo_live_certification`) | **SKIPPED WITH REASON** — prerequisites missing |
| Shopify live (`shopify_live_certification`) | **SKIPPED WITH REASON** — prerequisites missing |
| Smoke overall | **SKIPPED** (synthetic cert passed; live proof not attested) |
| Artifact | `artifacts/channel-live-smoke-summary.json` → both `proof_skipped_missing_prerequisites`; `overall: SKIPPED` |

**Missing locally:** `DATABASE_URL`, `ENCRYPTION_KEY`, `CHANNEL_SMOKE_OWNER_EMAIL` (or `CHANNEL_SMOKE_CONNECTION_ID`).

**Ops unblock:** Configure staging Woo/Shopify connections in dashboard → set env vars → re-run `npm run smoke:woo-shopify-live`. Optional: `workflow_dispatch` on `woo-shopify-staging-smoke.yml` after local PASS.

**No false claim:** Channel integrations remain **beta**; not claiming live marketplace production certification without PASS evidence.

**GitHub workflow first green (Era 17 Cycle 9 — not in default CI):** policy **`era17-channel-github-workflow-first-green-v1`**; workflow `.github/workflows/woo-shopify-staging-smoke.yml` (`workflow_dispatch`); operator records `GITHUB_WOO_SHOPIFY_STAGING_RUN_URL` + `GITHUB_WOO_SHOPIFY_STAGING_RUN_OUTCOME`; `npm run smoke:channel-github-workflow-first-green` → `artifacts/channel-github-workflow-first-green-summary.json`; **awaiting_github_first_green** until GitHub PASSED recorded — not fake green. Cert: `test:ci:channel-github-workflow-first-green-era17:cert` (chained in `test:ci:channel-golden-path:cert`).

**Channel pilot playbook (Era 17 Cycle 10):** policy **`era17-channel-pilot-playbook-v1`**; one-page operator guide [`channel-pilot-playbook-era17.md`](./channel-pilot-playbook-era17.md) — test shop setup, validation commands, sign-off checklist, forbidden claims; linked from [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md). Cert: `test:ci:channel-pilot-playbook-era17:cert` (chained in `test:ci:commercial-pilot-runbook:cert`).

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
| 4 | Inventory/fulfillment topics aligned with OS Kitchen order model | Product |
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

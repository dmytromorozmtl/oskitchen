# Shopify live smoke — credentials guide

Use this guide to move `artifacts/shopify-live-smoke-summary.json` from **SKIPPED** → **PASSED**. PASS requires live Shopify Admin API, signed staging webhook ingest, and an `ExternalOrder` row — not wiring cert alone.

## Quick check

```bash
cp .env.smoke.example .env.smoke.local   # fill staging + Shopify vars (gitignored)
npm run smoke:shopify-live               # auto-loads .env.smoke.local, writes artifact
# Review artifacts/shopify-live-smoke-summary.json
# overall: PASSED | SKIPPED | FAILED

# Or run both channel smokes:
npm run smoke:channels-live
```

Missing env vars are listed in `missingEnvVars[]` on the artifact.

---

## Two credential paths

### Path A — Direct Shopify store (CI / ops shell)

Set all of these in ops vault or GitHub Actions secrets (never commit to git):

| Variable | Where to get it |
|----------|-----------------|
| `SHOPIFY_SHOP_DOMAIN` | Store admin URL host, e.g. `your-store.myshopify.com` |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Shopify Admin → **Settings → Apps and sales channels → Develop apps** → custom app → **Admin API access token** (orders + products scopes) |
| `SHOPIFY_APP_SECRET` | Webhook signing secret from the same custom app (alias: `SHOPIFY_WEBHOOK_SECRET`) |
| `SHOPIFY_API_VERSION` | Optional; defaults to `2024-10` in `.env.example` |
| `E2E_STAGING_BASE_URL` | Staging KitchenOS URL |
| `DATABASE_URL` | Staging Postgres (same DB the staging app uses) |
| `CHANNEL_SMOKE_CONNECTION_ID` | Optional — resolved by shop domain if omitted when connection exists in DB |

Verify Admin API access:

```bash
curl -s -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_ACCESS_TOKEN" \
  "https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-10/shop.json" | head -c 200
```

### Path B — Load from staging DB (recommended for repeat runs)

If the Shopify connection is already saved in the staging dashboard:

| Variable | Where to get it |
|----------|-----------------|
| `DATABASE_URL` | Staging Postgres |
| `ENCRYPTION_KEY` | Same key as staging app |
| `E2E_STAGING_BASE_URL` | Staging KitchenOS URL |
| `CHANNEL_SMOKE_OWNER_EMAIL` | Email of workspace owner with Shopify connection, **or** |
| `CHANNEL_SMOKE_CONNECTION_ID` | Direct connection UUID |

The smoke script decrypts credentials from `integrationConnection` and uses the stored webhook secret.

---

## Dashboard setup (before live smoke)

1. Open **Integrations → Shopify** (`/dashboard/integrations/shopify`).
2. Save shop domain, Admin API token, webhook secret, API version.
3. Register webhooks in Shopify Admin:

   | Topic | Path |
   |-------|------|
   | Order creation | `{E2E_STAGING_BASE_URL}/api/webhooks/shopify/orders-create` |
   | Order updated | `{E2E_STAGING_BASE_URL}/api/webhooks/shopify/orders-updated` |

4. Copy `connectionId` from integrations card if using `CHANNEL_SMOKE_CONNECTION_ID`.

See also: [`SHOPIFY_SETUP.md`](./SHOPIFY_SETUP.md), [`SHOPIFY_CHANNEL_SETUP.md`](./SHOPIFY_CHANNEL_SETUP.md), [`WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md`](./WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md).

---

## Run live smoke

```bash
export E2E_STAGING_BASE_URL='https://…'
export DATABASE_URL='postgres://…'
export ENCRYPTION_KEY='…'
export CHANNEL_SMOKE_OWNER_EMAIL='owner@example.com'
# OR direct Shopify path:
# export SHOPIFY_SHOP_DOMAIN=… SHOPIFY_ADMIN_ACCESS_TOKEN=… SHOPIFY_APP_SECRET=…

npm run smoke:shopify-live
```

Expected PASS steps in artifact:

1. `env_validation` — PASSED
2. `shopify_api_connection` — PASSED
3. `shopify_create_order` — PASSED (creates a test order via Admin API)
4. `staging_webhook_delivery` — PASSED
5. `db_canonical_order` — PASSED

Exit codes: **0** for PASSED or SKIPPED; **1** for FAILED.

---

## GitHub Actions

Add secrets from Path A or Path B (see [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md), [`ops-vault-matrix.md`](./ops-vault-matrix.md)):

- Phase 1: `E2E_STAGING_BASE_URL`
- Phase 2: `DATABASE_URL`, `ENCRYPTION_KEY`
- Phase 3: `CHANNEL_SMOKE_OWNER_EMAIL` or `CHANNEL_SMOKE_CONNECTION_ID`
- Shopify direct (optional): `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_ADMIN_ACCESS_TOKEN`, `SHOPIFY_APP_SECRET`

Combined orchestrator: `npm run smoke:woo-shopify-live` (step 3 in gap closure).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing: SHOPIFY_SHOP_DOMAIN` | Set direct vars or configure DB tenant path |
| `Connection missing decrypted Shopify credentials` | `ENCRYPTION_KEY` must match staging app |
| `Staging webhook 401` | Verify `X-Shopify-Hmac-Sha256` secret matches saved webhook secret |
| `Order not found within 15s` | Staging DB must match `DATABASE_URL` |

---

## Sales-safe claims

| Claim | Safe when |
|-------|-----------|
| "Shopify wiring certified" | Synthetic golden-path cert PASSED |
| "Live Shopify certified" | `shopify-live-smoke-summary.json` → `overall: PASSED` |
| "Production-ready Shopify ingest" | Live smoke PASS + pilot sign-off |

Do **not** claim live certification while artifact shows `overall: SKIPPED`.

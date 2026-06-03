# WooCommerce live smoke — credentials guide

Use this guide to move `artifacts/woocommerce-live-smoke-summary.json` from **SKIPPED** → **PASSED**. PASS requires live Woo REST, signed staging webhook ingest, and an `ExternalOrder` row — not wiring cert alone.

## Quick check

```bash
cp .env.smoke.example .env.smoke.local   # fill staging + Woo vars (gitignored)
npm run smoke:woo-live                   # auto-loads .env.smoke.local, writes artifact
# Review artifacts/woocommerce-live-smoke-summary.json
# overall: PASSED | SKIPPED | FAILED
```

Missing env vars are listed in `missingEnvVars[]` on the artifact.

---

## Two credential paths

### Path A — Direct Woo store (CI / ops shell)

Set all of these in ops vault or GitHub Actions secrets (never commit to git):

| Variable | Where to get it |
|----------|-----------------|
| `WOOCOMMERCE_BASE_URL` | HTTPS storefront root, e.g. `https://your-store.example` |
| `WOOCOMMERCE_CONSUMER_KEY` | WooCommerce → **Settings → Advanced → REST API** → Add key (**Read/Write**) |
| `WOOCOMMERCE_CONSUMER_SECRET` | Shown once when the REST key is created |
| `WOOCOMMERCE_WEBHOOK_SECRET` | WooCommerce → **Settings → Advanced → Webhooks** → create webhook → copy secret, or set your own when registering |
| `E2E_STAGING_BASE_URL` | Staging KitchenOS URL, e.g. `https://staging.kitchenos.example` |
| `CHANNEL_SMOKE_CONNECTION_ID` | UUID from **Integrations → WooCommerce** after saving credentials in staging dashboard |
| `DATABASE_URL` | Staging Postgres connection string (same DB the staging app uses) |

Verify REST access:

```bash
curl -u "$WOOCOMMERCE_CONSUMER_KEY:$WOOCOMMERCE_CONSUMER_SECRET" \
  "$WOOCOMMERCE_BASE_URL/wp-json/wc/v3/system_status" | head -c 200
```

### Path B — Load from staging DB (recommended for repeat runs)

If the Woo connection is already saved in the staging dashboard:

| Variable | Where to get it |
|----------|-----------------|
| `DATABASE_URL` | Staging Postgres |
| `ENCRYPTION_KEY` | Same key as staging app (`docs/CHANNEL_CREDENTIAL_SECURITY.md`) |
| `E2E_STAGING_BASE_URL` | Staging KitchenOS URL |
| `CHANNEL_SMOKE_OWNER_EMAIL` | Email of workspace owner with Woo connection, **or** |
| `CHANNEL_SMOKE_CONNECTION_ID` | Direct connection UUID (alternative to owner email) |

The smoke script decrypts credentials from `integrationConnection` and uses the stored webhook secret.

---

## Dashboard setup (before live smoke)

1. Open **Sales channels → WooCommerce** (`/dashboard/integrations/woocommerce`).
2. Save store URL + consumer key/secret + webhook secret.
3. Register Woo webhook target:

   ```text
   {E2E_STAGING_BASE_URL}/api/webhooks/woocommerce?cid={connectionId}
   ```

4. Topic: `order.updated` (minimum for smoke).
5. Copy `connectionId` from the integrations card → set `CHANNEL_SMOKE_CONNECTION_ID`.

See also: [`WOOCOMMERCE_SETUP.md`](./WOOCOMMERCE_SETUP.md), [`WOOCOMMERCE_CHANNEL_SETUP.md`](./WOOCOMMERCE_CHANNEL_SETUP.md).

---

## Run live smoke

```bash
export E2E_STAGING_BASE_URL='https://…'
export DATABASE_URL='postgres://…'
export ENCRYPTION_KEY='…'
export CHANNEL_SMOKE_OWNER_EMAIL='owner@example.com'
# OR direct Woo path:
# export WOOCOMMERCE_BASE_URL=… WOOCOMMERCE_CONSUMER_KEY=… etc.

npm run smoke:woo-live -- --write
```

Expected PASS steps in artifact:

1. `env_validation` — PASSED
2. `woo_api_connection` — PASSED
3. `woo_create_order` — PASSED (creates a $1 COD test order)
4. `staging_webhook_delivery` — PASSED
5. `db_canonical_order` — PASSED

Exit codes: **0** for PASSED or SKIPPED (missing prereqs); **1** for FAILED (live failure).

---

## GitHub Actions

Add secrets from Path A or Path B to the repo (see [`GITHUB_E2E_STAGING_SECRETS.md`](./GITHUB_E2E_STAGING_SECRETS.md), [`ops-vault-matrix.md`](./ops-vault-matrix.md)):

- Phase 1: `E2E_STAGING_BASE_URL`
- Phase 2: `DATABASE_URL`, `ENCRYPTION_KEY`
- Phase 3: `CHANNEL_SMOKE_OWNER_EMAIL` or `CHANNEL_SMOKE_CONNECTION_ID`
- Woo direct (optional): `WOOCOMMERCE_*` vars

Optional workflow: **Woo Shopify Staging Smoke** (`workflow_dispatch`).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Missing: DATABASE_URL` | Point at staging Postgres, not local dev |
| `Connection missing decrypted Woo credentials` | `ENCRYPTION_KEY` must match staging app |
| `No WooCommerce connection` | Save Woo in staging dashboard or set `WOOCOMMERCE_*` |
| `Staging webhook 401/403` | Check webhook secret and `cid` query param |
| `Order not found within 15s` | Staging app DB must match `DATABASE_URL`; check webhook worker logs |

---

## Sales-safe claims

| Claim | Safe when |
|-------|-----------|
| "WooCommerce wiring certified" | Synthetic golden-path cert PASSED (`npm run smoke:woo-shopify`) |
| "Live WooCommerce certified" | `woocommerce-live-smoke-summary.json` → `overall: PASSED` |
| "Production-ready Woo ingest" | Live smoke PASS + pilot operator sign-off |

Do **not** claim live certification while artifact shows `overall: SKIPPED`.

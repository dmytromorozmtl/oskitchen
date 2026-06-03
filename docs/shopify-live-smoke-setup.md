# Shopify live smoke setup — OS Kitchen

**Task:** DEV-09  
**Status:** Human gate — requires Shopify development store + staging vault secrets  
**Evidence:** `artifacts/shopify-live-smoke-summary.json` → `overall: SKIPPED`, `missingEnvVars: 7` (2026-06-03)

This guide moves Shopify live proof from **SKIPPED** → **PASSED**. PASS requires live Shopify Admin API, a signed webhook delivered to staging, and a canonical `ExternalOrder` row — not wiring certification alone.

---

## 1. What is already wired (no code changes needed)

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-shopify-live.ts` | Admin API connect → test order → signed webhook → DB verify |
| npm command | `npm run smoke:shopify-live` | Auto-loads `.env.smoke.local`, writes artifact |
| Combined channels | `npm run smoke:channels-live` | Runs Woo + Shopify live smokes sequentially |
| Artifact | `artifacts/shopify-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| P0 orchestrator | `.github/workflows/p0-orchestrator.yml` | Tier 2.2 runs `npm run smoke:woo-shopify-live` when vault 11/11 |
| Channel workflow | `.github/workflows/woo-shopify-staging-smoke.yml` | Manual `workflow_dispatch` for era17 channel smokes |
| Webhook routes | `/api/webhooks/shopify/orders-create`, `/orders-updated` | `X-Shopify-Hmac-Sha256` validation |
| Dashboard UI | `/dashboard/integrations/shopify` | Save domain, Admin token, webhook secret |

Related docs: [`shopify-credentials-guide.md`](./shopify-credentials-guide.md) (credential paths), [`WOO_SHOPIFY_TEST_SHOP_SETUP.md`](./WOO_SHOPIFY_TEST_SHOP_SETUP.md) (test shop checklist), [`SHOPIFY_SETUP.md`](./SHOPIFY_SETUP.md).

---

## 2. Create a Shopify development store (one-time)

Use a **dedicated development store** — never production customer data.

### Provision store

1. Sign in to [Shopify Partners](https://partners.shopify.com).
2. **Stores → Add store → Create development store**.
3. Choose **Create a store to test and build** (not a transfer store).
4. Note the admin URL host: `your-store.myshopify.com` → this is `SHOPIFY_SHOP_DOMAIN`.

### Create custom app + Admin API token

1. In the dev store admin: **Settings → Apps and sales channels → Develop apps**.
2. **Allow custom app development** (one-time partner approval).
3. **Create an app** → name: `KitchenOS live smoke`.
4. **Configure Admin API scopes** (minimum):

   | Scope | Purpose |
   |-------|---------|
   | `read_orders` | Verify connection |
   | `write_orders` | Create test order in smoke |
   | `read_products` | Optional — product sync parity |

5. **Install app** on the development store.
6. **API credentials** tab → reveal **Admin API access token** (`shpat_…`) — copy once.

### Webhook signing secret

1. In the same custom app → **API credentials** or **Webhooks** configuration.
2. Copy the **API secret key** / webhook signing secret → use as `SHOPIFY_APP_SECRET` (alias: `SHOPIFY_WEBHOOK_SECRET`).
3. This secret must match the value saved in KitchenOS dashboard.

Verify Admin API access:

```bash
curl -fsS -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_ACCESS_TOKEN" \
  "https://${SHOPIFY_SHOP_DOMAIN}/admin/api/2024-10/shop.json" | head -c 200
```

---

## 3. Register webhooks (Shopify → KitchenOS)

Do this **after** saving the connection in KitchenOS dashboard (step 4 below).

In Shopify Admin → **Settings → Notifications → Webhooks** (or via the custom app):

| Topic | Delivery URL |
|-------|--------------|
| Order creation | `{E2E_STAGING_BASE_URL}/api/webhooks/shopify/orders-create` |
| Order updated | `{E2E_STAGING_BASE_URL}/api/webhooks/shopify/orders-updated` |

Example:

```text
https://os-kitchen.com/api/webhooks/shopify/orders-create
https://os-kitchen.com/api/webhooks/shopify/orders-updated
```

Format: **JSON**. Signing secret: same as `SHOPIFY_APP_SECRET` saved in KitchenOS.

The live smoke script posts a signed payload to `orders-create` specifically.

---

## 4. Configure KitchenOS staging dashboard

1. Log in to staging: `{E2E_STAGING_BASE_URL}/login`.
2. Open **Integrations → Shopify** (`/dashboard/integrations/shopify`).
3. Save:
   - **Shop domain** — `your-store.myshopify.com` (no `https://` prefix).
   - **Admin API access token** — `shpat_…` from custom app.
   - **Webhook secret** — API secret / signing secret from custom app.
   - **API version** — optional; defaults to `2024-10`.
4. Click **Test connection** → must succeed.
5. Copy **Connection ID** from integrations card → `CHANNEL_SMOKE_CONNECTION_ID` (optional if using owner email path).

---

## 5. Local smoke run (ops shell)

```bash
cp .env.smoke.example .env.smoke.local   # gitignored
```

Fill `.env.smoke.local`:

```bash
# --- Required (DB path — recommended) ---
E2E_STAGING_BASE_URL=https://os-kitchen.com
DATABASE_URL=postgresql://…          # same DB as staging app
ENCRYPTION_KEY=…                       # must match staging Vercel env
CHANNEL_SMOKE_OWNER_EMAIL=owner@example.com
# OR: CHANNEL_SMOKE_CONNECTION_ID=uuid-from-dashboard

# --- Optional direct Shopify path (overrides DB-decrypted creds) ---
# SHOPIFY_SHOP_DOMAIN=your-store.myshopify.com
# SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_…
# SHOPIFY_APP_SECRET=…
# SHOPIFY_API_VERSION=2024-10
```

Run:

```bash
npm run smoke:shopify-live
cat artifacts/shopify-live-smoke-summary.json | python3 -m json.tool
```

Run both channel smokes:

```bash
npm run smoke:channels-live
```

### Pass criteria (all steps PASSED)

| Step ID | Label |
|---------|-------|
| `env_validation` | Prerequisite env vars |
| `shopify_api_connection` | Shopify Admin API connection |
| `shopify_create_order` | Test order created via Admin API |
| `staging_webhook_delivery` | Signed webhook accepted by staging |
| `db_canonical_order` | `ExternalOrder` row in staging DB |

Exit codes: **0** = PASSED or SKIPPED (missing prereqs); **1** = FAILED (live failure).

---

## 6. GitHub Actions secrets

Add to **GitHub → Settings → Secrets and variables → Actions**. Overlaps with P0 vault (11 secrets) — see [`ops-vault-matrix.md`](./ops-vault-matrix.md).

### Minimum for Shopify live smoke (DB path)

| Secret | Owner | Purpose |
|--------|-------|---------|
| `E2E_STAGING_BASE_URL` | DevOps | Staging app URL (`GET /api/health` → 200) |
| `DATABASE_URL` | DevOps | Staging Postgres (same as Vercel staging) |
| `ENCRYPTION_KEY` | Security | Must match staging app — decrypts saved Shopify creds |
| `CHANNEL_SMOKE_CONNECTION_ID` | Integration eng | UUID from dashboard **or** |
| `CHANNEL_SMOKE_OWNER_EMAIL` | DevOps | Workspace owner with Shopify connection saved |

### Optional direct Shopify path (CI without dashboard save)

| Secret | Purpose |
|--------|---------|
| `SHOPIFY_SHOP_DOMAIN` | `*.myshopify.com` host |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Custom app Admin API token |
| `SHOPIFY_APP_SECRET` | Webhook HMAC secret (alias: `SHOPIFY_WEBHOOK_SECRET`) |
| `SHOPIFY_API_VERSION` | Optional; default `2024-10` |

### Run in GitHub Actions

**P0 Orchestrator** (auto on `main` PR/push when vault 11/11):

```text
Actions → P0 Orchestrator → Run workflow
```

Tier 2.2 executes `npm run smoke:woo-shopify-live` and uploads `artifacts/channel-live-smoke-summary.json`.

**Woo Shopify Staging Smoke** (manual):

```text
Actions → Woo Shopify Staging Smoke → Run workflow
  skip_live: false          # required for live Admin API calls
  owner_email: (optional)   # overrides CHANNEL_SMOKE_OWNER_EMAIL
```

Job is **omitted** when `DATABASE_URL`, `ENCRYPTION_KEY`, or owner email/connection ID are missing.

Verify vault locally:

```bash
npm run ops:validate-p0-vault-env
npm run check-vault-readiness -- --write
# presentCount: 11, vaultReady: true
```

---

## 7. Verify after PASS

```bash
python3 -c "import json; d=json.load(open('artifacts/shopify-live-smoke-summary.json')); print(d['overall'], d.get('proofStatus'))"
```

**Sales-safe claims** (from [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)):

| Claim | Safe when |
|-------|-----------|
| "Shopify wiring certified" | Synthetic cert PASSED (`npm run smoke:woo-shopify`) |
| "Live Shopify certified" | `shopify-live-smoke-summary.json` → `overall: PASSED` |
| "Production-ready Shopify ingest" | Live smoke PASS + pilot operator sign-off |

Do **not** claim live certification while artifact shows `SKIPPED` or `FAILED`.

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `overall: SKIPPED`, long `missingEnvVars` | Fill vars in artifact; see `.env.smoke.example` |
| `401 Unauthorized` on Admin API | Regenerate token; confirm scopes include `write_orders` |
| `Connection missing decrypted Shopify credentials` | `ENCRYPTION_KEY` must match staging Vercel env |
| `Staging webhook 401` | `SHOPIFY_APP_SECRET` must match saved webhook secret and Shopify app secret |
| `Order not found within 15s` | `DATABASE_URL` must be staging DB; check webhook worker / `WEBHOOK_ASYNC_QUEUE` |
| Wrong shop domain format | Use `store.myshopify.com` — no protocol, no trailing slash |
| P0 orchestrator SKIPPED | Vault incomplete — run `npm run check-vault-readiness -- --write` |

---

## 9. Checklist (VP Ops sign-off)

- [ ] Shopify Partners development store created (`*.myshopify.com`)
- [ ] Custom app installed with `read_orders` + `write_orders` scopes
- [ ] Admin API access token + webhook secret copied
- [ ] Connection saved in staging dashboard
- [ ] Webhooks → `{staging}/api/webhooks/shopify/orders-create` (+ `orders-updated`) active
- [ ] GitHub secrets: `DATABASE_URL`, `ENCRYPTION_KEY`, `E2E_STAGING_BASE_URL`, `CHANNEL_SMOKE_*`
- [ ] `npm run smoke:shopify-live` → `overall: PASSED`
- [ ] P0 orchestrator Tier 2.2 green (or artifact uploaded with PASS)
- [ ] Sales claims updated per registry (no "live certified" until PASS)

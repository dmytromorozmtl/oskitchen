# WooCommerce live smoke setup — OS Kitchen

**Task:** DEV-08  
**Status:** Human gate — requires real Woo sandbox + staging vault secrets  
**Evidence:** `artifacts/woocommerce-live-smoke-summary.json` → `overall: FAILED` (placeholder store URL `smoke-test.os-kitchen.com`, 2026-06-03)

This guide moves WooCommerce live proof from **SKIPPED/FAILED** → **PASSED**. PASS requires live Woo REST, a signed webhook delivered to staging, and a canonical `ExternalOrder` row — not wiring certification alone.

---

## 1. What is already wired (no code changes needed)

| Layer | Location | Behavior |
|-------|----------|----------|
| Live smoke script | `scripts/smoke-woocommerce-live.ts` | REST connect → $1 COD test order → signed webhook → DB verify |
| npm command | `npm run smoke:woo-live` | Auto-loads `.env.smoke.local`, writes artifact |
| Diagnose helper | `npm run smoke:woo-diagnose` | Explains connection / URL / credential failures |
| Artifact | `artifacts/woocommerce-live-smoke-summary.json` | `overall: PASSED \| SKIPPED \| FAILED` |
| P0 orchestrator | `.github/workflows/p0-orchestrator.yml` | Tier 2.2 runs `npm run smoke:woo-shopify-live` when vault 11/11 |
| Channel workflow | `.github/workflows/woo-shopify-staging-smoke.yml` | Manual `workflow_dispatch` for era17 channel smokes |
| Webhook route | `/api/webhooks/woocommerce?cid={connectionId}` | HMAC signature validation |
| Dashboard UI | `/dashboard/integrations/woocommerce` | Save URL, REST keys, webhook secret |

Related docs: [`woocommerce-credentials-guide.md`](./woocommerce-credentials-guide.md) (credential paths), [`WOO_SHOPIFY_TEST_SHOP_SETUP.md`](./WOO_SHOPIFY_TEST_SHOP_SETUP.md) (test shop checklist).

---

## 2. Create a WooCommerce sandbox (one-time)

Use a **dedicated test store** — never production customer data.

### Option A — Managed Woo hosting (recommended)

1. Provision a WooCommerce store with **HTTPS** (e.g. WooCommerce hosting, WP Engine, Cloudways, or local tunnel via ngrok for dev-only).
2. Complete WooCommerce onboarding wizard (store address, currency USD).
3. Enable **Cash on delivery** payment method (smoke creates a $1 COD order).
4. Confirm REST API is reachable:

   ```bash
   curl -fsS "https://YOUR-STORE.example/wp-json/wc/v3/system_status" \
     -u "ck_PLACEHOLDER:cs_PLACEHOLDER" | head -c 200
   ```

### Option B — Local WordPress + tunnel (dev only)

1. Install WordPress + WooCommerce locally.
2. Expose via ngrok/Cloudflare Tunnel: `https://abc123.ngrok-free.app`.
3. Use the **public HTTPS URL** as `WOOCOMMERCE_BASE_URL` (KitchenOS rejects non-HTTPS and placeholder hosts).

### Generate REST API keys

1. WooCommerce → **Settings → Advanced → REST API** → **Add key**.
2. Description: `KitchenOS live smoke`.
3. User: store admin.
4. Permissions: **Read/Write**.
5. Copy **Consumer key** (`ck_…`) and **Consumer secret** (`cs_…`) — secret shown once.

### Register outbound webhook (Woo → KitchenOS)

Do this **after** saving the connection in KitchenOS dashboard (step 3 below) so you have the `connectionId`.

1. WooCommerce → **Settings → Advanced → Webhooks** → **Add webhook**.
2. **Delivery URL:**

   ```text
   {E2E_STAGING_BASE_URL}/api/webhooks/woocommerce?cid={connectionId}
   ```

   Example: `https://os-kitchen.com/api/webhooks/woocommerce?cid=7ff36f51-4c34-4ab7-b4ed-c6eb095bc4d3`

3. **Secret:** generate a random string → save same value in KitchenOS **Webhook secret**.
4. **Topic:** `order.updated` (minimum); add `order.created` for production parity.
5. Status: **Active**.

---

## 3. Configure KitchenOS staging dashboard

1. Log in to staging: `{E2E_STAGING_BASE_URL}/login`.
2. Open **Sales channels → WooCommerce** (`/dashboard/integrations/woocommerce`).
3. Save:
   - **Store URL** — real HTTPS host (not `smoke-test.*` placeholders).
   - **Consumer key / secret** — from step 2.
   - **Webhook secret** — matches Woo webhook secret.
4. Click **Test connection** → must succeed.
5. Copy **Connection ID** from the integrations card → use as `CHANNEL_SMOKE_CONNECTION_ID`.

**Current failure pattern:** artifact shows `ENOTFOUND smoke-test.os-kitchen.com` — replace placeholder URL with a resolvable HTTPS Woo store.

---

## 4. Local smoke run (ops shell)

```bash
cp .env.smoke.example .env.smoke.local   # gitignored
```

Fill `.env.smoke.local`:

```bash
# --- Required (DB path — recommended) ---
E2E_STAGING_BASE_URL=https://os-kitchen.com
DATABASE_URL=postgresql://…          # same DB as staging app
ENCRYPTION_KEY=…                       # must match staging Vercel env
CHANNEL_SMOKE_CONNECTION_ID=7ff36f51-…   # from dashboard
# OR: CHANNEL_SMOKE_OWNER_EMAIL=owner@example.com

# --- Optional direct Woo path (overrides DB-decrypted creds) ---
# WOOCOMMERCE_BASE_URL=https://your-store.example
# WOOCOMMERCE_CONSUMER_KEY=ck_…
# WOOCOMMERCE_CONSUMER_SECRET=cs_…
# WOOCOMMERCE_WEBHOOK_SECRET=…
```

Run:

```bash
npm run smoke:woo-live -- --write
cat artifacts/woocommerce-live-smoke-summary.json | python3 -m json.tool
```

### Pass criteria (all steps PASSED)

| Step ID | Label |
|---------|-------|
| `env_validation` | Prerequisite env vars |
| `woo_api_connection` | WooCommerce REST connection |
| `woo_create_order` | $1 COD test order created |
| `staging_webhook_delivery` | Signed webhook accepted by staging |
| `db_canonical_order` | `ExternalOrder` row in staging DB |

Exit codes: **0** = PASSED or SKIPPED (missing prereqs); **1** = FAILED (live failure).

Diagnose failures:

```bash
npm run smoke:woo-diagnose
```

---

## 5. GitHub Actions secrets

Add to **GitHub → Settings → Secrets and variables → Actions**. These overlap with the P0 vault (11 secrets) — see [`ops-vault-matrix.md`](./ops-vault-matrix.md).

### Minimum for Woo live smoke (DB path)

| Secret | Owner | Purpose |
|--------|-------|---------|
| `E2E_STAGING_BASE_URL` | DevOps | Staging app URL (`GET /api/health` → 200) |
| `DATABASE_URL` | DevOps | Staging Postgres (same as Vercel staging) |
| `ENCRYPTION_KEY` | Security | Must match staging app — decrypts saved Woo creds |
| `CHANNEL_SMOKE_CONNECTION_ID` | Integration eng | UUID from dashboard **or** |
| `CHANNEL_SMOKE_OWNER_EMAIL` | DevOps | Workspace owner with Woo connection saved |

### Optional direct Woo path (CI without dashboard save)

| Secret | Purpose |
|--------|---------|
| `WOOCOMMERCE_BASE_URL` | HTTPS store root |
| `WOOCOMMERCE_CONSUMER_KEY` | REST key |
| `WOOCOMMERCE_CONSUMER_SECRET` | REST secret |
| `WOOCOMMERCE_WEBHOOK_SECRET` | HMAC secret |

### Run in GitHub Actions

**P0 Orchestrator** (auto on `main` PR/push when vault 11/11):

```text
Actions → P0 Orchestrator → Run workflow
```

Tier 2.2 executes `npm run smoke:woo-shopify-live` and uploads `artifacts/channel-live-smoke-summary.json`.

**Woo Shopify Staging Smoke** (manual, Woo-specific):

```text
Actions → Woo Shopify Staging Smoke → Run workflow
  skip_live: false          # required for live REST
  owner_email: (optional)   # overrides CHANNEL_SMOKE_OWNER_EMAIL
```

Job is **omitted** (not green) when `DATABASE_URL`, `ENCRYPTION_KEY`, or owner email/connection ID are missing.

Verify vault locally before pushing:

```bash
npm run ops:validate-p0-vault-env
npm run check-vault-readiness -- --write
# presentCount: 11, vaultReady: true
```

---

## 6. Verify after PASS

```bash
# Artifact
python3 -c "import json; d=json.load(open('artifacts/woocommerce-live-smoke-summary.json')); print(d['overall'], d.get('proofStatus'))"

# Optional: confirm ExternalOrder in staging DB
# psql "$DATABASE_URL" -c "SELECT id, \"externalId\", provider FROM \"ExternalOrder\" ORDER BY \"createdAt\" DESC LIMIT 3;"
```

**Sales-safe claims** (from [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)):

| Claim | Safe when |
|-------|-----------|
| "WooCommerce wiring certified" | Synthetic cert PASSED (`npm run smoke:woo-shopify`) |
| "Live WooCommerce certified" | `woocommerce-live-smoke-summary.json` → `overall: PASSED` |
| "Production-ready Woo ingest" | Live smoke PASS + pilot operator sign-off |

Do **not** claim live certification while artifact shows `SKIPPED` or `FAILED`.

---

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `overall: SKIPPED`, `missingEnvVars` populated | Fill vars listed in artifact; see `.env.smoke.example` |
| `ENOTFOUND smoke-test.*` | Replace placeholder store URL in dashboard with real HTTPS Woo host |
| `fetch failed` / TLS errors | Store must be HTTPS; check firewall allows outbound from CI |
| `Connection missing decrypted Woo credentials` | `ENCRYPTION_KEY` must match staging Vercel env |
| `Staging webhook 401/403` | Webhook secret mismatch; verify `cid` query param matches connection |
| `Order not found within 15s` | `DATABASE_URL` must be staging DB; check webhook worker / `WEBHOOK_ASYNC_QUEUE` |
| P0 orchestrator SKIPPED | Vault incomplete — run `npm run check-vault-readiness -- --write` |

---

## 8. Checklist (VP Ops sign-off)

- [ ] Dedicated Woo sandbox store live on HTTPS
- [ ] REST API keys (Read/Write) created
- [ ] Connection saved in staging dashboard with real URL
- [ ] Woo webhook → `{staging}/api/webhooks/woocommerce?cid=…` active
- [ ] GitHub secrets: `DATABASE_URL`, `ENCRYPTION_KEY`, `E2E_STAGING_BASE_URL`, `CHANNEL_SMOKE_*`
- [ ] `npm run smoke:woo-live -- --write` → `overall: PASSED`
- [ ] P0 orchestrator Tier 2.2 green (or artifact uploaded with PASS)
- [ ] Sales claims updated per registry (no "live certified" until PASS)

# Market Domination — live smoke ops (steps 4–5)

Features **4** (WooCommerce) and **5** (Shopify) are **code-complete** in `artifacts/domination-tracker.json`. The decision tree still surfaces steps **4** or **5** until each artifact reports `overall: PASSED`.

## One-command check (local)

```bash
cp .env.smoke.example .env.smoke.local
# Edit .env.smoke.local — see guides below

npm run smoke:live-checklist    # which env vars are still missing?
npm run smoke:channels-live
./scripts/domination-next-step.sh
```

## GitHub Actions (staging secrets)

Workflow: **Domination Live Channel Smokes** (`.github/workflows/domination-live-smokes.yml`)

1. Add repository secrets: `DATABASE_URL`, `ENCRYPTION_KEY`, `E2E_STAGING_BASE_URL`, `CHANNEL_SMOKE_OWNER_EMAIL` (or `CHANNEL_SMOKE_CONNECTION_ID`), plus Woo and Shopify vars from the guides below.
2. **Actions → Domination Live Channel Smokes → Run workflow**.
3. Download artifact `domination-live-smoke-summaries` and commit updated JSON files if you want `PASSED` in the repo (optional; CI proof is enough for ops).

Required secrets mirror `.env.smoke.example`.

| Artifact | Pass criteria |
|----------|----------------|
| `artifacts/woocommerce-live-smoke-summary.json` | `overall: PASSED` |
| `artifacts/shopify-live-smoke-summary.json` | `overall: PASSED` |

## Guides

- WooCommerce: [`woocommerce-credentials-guide.md`](./woocommerce-credentials-guide.md)
- Shopify: [`shopify-credentials-guide.md`](./shopify-credentials-guide.md)

## Honesty

`SKIPPED` means missing env — not a product defect. Do not mark PASSED without live REST + staging webhook + `ExternalOrder` row.

## After both PASS

`./scripts/domination-next-step.sh` → `STEP=6` or `STEP=NONE` (if 40/40 + `docs/market-domination.md`).

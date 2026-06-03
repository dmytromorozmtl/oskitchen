# Market Domination — live smoke ops (steps 4–5)

Features **4** (WooCommerce) and **5** (Shopify) are **code-complete** in `artifacts/domination-tracker.json`. The decision tree still surfaces steps **4** or **5** until each artifact reports `overall: PASSED`.

## One-command check

```bash
cp .env.smoke.example .env.smoke.local
# Edit .env.smoke.local — see guides below

npm run smoke:channels-live
./scripts/domination-next-step.sh
```

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

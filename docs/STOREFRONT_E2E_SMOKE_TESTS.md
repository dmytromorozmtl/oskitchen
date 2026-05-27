# Storefront E2E smoke tests

## Location

- `e2e/storefront.spec.ts` (Playwright `testDir` is `./e2e` per `playwright.config.ts`).

## Commands

```bash
npm run playwright:install   # once per machine/CI image
npm run test:e2e:storefront
# or full suite
npm run test:e2e
```

## Environment

| Variable | Purpose |
| --- | --- |
| `PLAYWRIGHT_BASE_URL` | Defaults to `http://127.0.0.1:3000`. |
| `E2E_STOREFRONT_SLUG` | Pin a published storefront slug; otherwise the spec probes `demo`, `test-store`, `kitchenos`. |

## What is covered

- Public home, menu, cart, about, checkout **shell** loads when a slug resolves (`200`).

## What is intentionally skipped / deferred

- Pay-later order creation, Stripe, discounts, fulfillment blocks — require deterministic fixtures + DB (run manually or extend with seed).
- Consent/GTM assertions — depend on merchant analytics config; covered in unit tests + QA matrix manual rows.

## Local run (typical)

```bash
npm run build
npm run start &
npx playwright install chromium
npm run test:e2e:storefront
```

## CI

Default GitHub `quality` job runs platform/a11y smoke only (no DB).

**Storefront checkout money path** runs in the `storefront-money-path` CI job (Postgres + seed + pay-later E2E). See `docs/ci-e2e-tier-matrix.md`.

Optional staging workflow: `.github/workflows/playwright-storefront.yml` when `PLAYWRIGHT_BASE_URL` is configured.

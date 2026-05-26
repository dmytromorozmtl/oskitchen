# Storefront final reliability report

## Summary

Hardened first-party analytics with **optional HMAC-signed tokens** and **`STOREFRONT_ANALYTICS_STRICT_INGEST`**, expanded redirect resolution (sensitive path guard + optional short chain), strengthened migration verification (`--db-check` / `verify:storefront-db`), added **import regression guards**, **Playwright storefront smoke** (skip-safe), and **CI** steps for Prisma generate + storefront checks.

## Signed analytics beacon

- New libs/service for token issue/verify; API enforces strict mode; layout + ingest wired.
- Docs: `docs/STOREFRONT_SIGNED_ANALYTICS_BEACON.md`.

## E2E

- `e2e/storefront.spec.ts` + `npm run test:e2e:storefront`.
- Docs: `docs/STOREFRONT_E2E_SMOKE_TESTS.md`.

## Redirects

- Sensitive checkout/order paths blocked unless `STOREFRONT_REDIRECT_ALLOW_SENSITIVE_PATHS=true`.
- Optional `STOREFRONT_REDIRECT_FOLLOW_CHAIN=true` with max depth 3.
- Docs: `docs/STOREFRONT_REDIRECT_EDGE_CASES.md`.

## Migration guard

- `scripts/verify-storefront-migration.ts` now **requires** FP migration on disk, validates repair SQL + schema text, supports `--db-check` for column probe.
- `npm run verify:storefront-db`.

## Import regression

- `tests/unit/storefront-pillar-settings-import.test.ts`, `scripts/check-storefront-action-imports.ts`, `npm run verify:storefront-actions`.

## CI

- Updated `.github/workflows/ci.yml` per `docs/CI_STOREFRONT_HARDENING.md` (Playwright block left commented for preview URL setup).

## Commands run (release gate)

```bash
npx prisma generate
npm run typecheck
npm run lint
npm test
npm run verify:storefront-migration
npm run verify:storefront-actions
npm run build
# optional with DATABASE_URL:
# npm run verify:storefront-db
# optional Playwright (install browsers once: npx playwright install chromium):
# npm run test:e2e:storefront
```

## Remaining limitations

- No built-in rate limit on `/api/storefront/analytics`.
- Playwright does not submit real orders or hit Stripe without dedicated fixtures.
- Custom-domain + redirect unification remains a future architectural item.

## Next PR suggestion

Add hosted preview workflow inputs (`PLAYWRIGHT_BASE_URL`, `E2E_STOREFRONT_SLUG`) and uncomment CI Playwright block; add lightweight rate limiting (e.g. token bucket per slug) at the edge.

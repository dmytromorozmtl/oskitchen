# CI — Storefront hardening

## Required job (`quality`)

Order matches release safety:

1. `npm ci`
2. `npx prisma generate`
3. `npm run verify:install-chain`
4. `npm run verify:storefront-migration`
5. `npm run verify:storefront-actions`
6. `npm run typecheck`
7. `npm run lint`
8. `npm test`
9. `npm run check-demo-scenarios`
10. `npm run build`

## Optional checks (not in default workflow)

| Command | When |
| --- | --- |
| `npm run verify:storefront-db` | Staging/prod deploy prep with `DATABASE_URL` exported locally/CI secret (read-only column probe). |
| `VERIFY_STOREFRONT_MIGRATION_DB=1 npm run verify:storefront-migration` | When DB reachable from CI for `prisma migrate status`. |
| `npm run test:e2e:storefront` | Requires running Next + DB + published slug (see `docs/STOREFRONT_E2E_SMOKE_TESTS.md`). Uncomment block in `ci.yml` when preview env exists. |

## Explicit non-goals

- No `prisma migrate deploy` in CI by default.
- No production Stripe or customer PII.

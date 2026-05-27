# CI E2E tier matrix

Status: canonical money-path and smoke E2E tiers for Evolution Era 2 certification.

## Tier 0 — Default CI (`quality` job)

| Suite | Command / workflow | Secrets | Notes |
|-------|-------------------|---------|-------|
| Platform access denial | `tests/e2e/platform-access-denial.spec.ts` | None | Local `next start` on port 3000 |
| Marketing a11y | `tests/e2e/a11y-marketing.spec.ts` | None | Same server |
| Auth shell a11y | `tests/e2e/a11y-auth-shell.spec.ts` | Optional login secrets | Skips authed cases without credentials |

## Tier 1 — Security DB (`security-db` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Tenant isolation + RBAC | `npm run test:security` | Postgres service | Includes `tests/integration/storefront-order-pii.integration.test.ts` (pay-later PII + **online payment failure + retry** recovery) |

## Tier 2 — Storefront money path (`storefront-money-path` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Payment recovery unit | `npm run test:ci:storefront-money-path:unit` | No | Stripe retry/cancel guards |
| Pay-later checkout E2E | `npm run test:ci:storefront-money-path:e2e` | Postgres + seed | `storefront:seed-ci-checkout` then `e2e/storefront-checkout-pay-later.spec.ts` |

**CI workflow:** `.github/workflows/ci.yml` → job `storefront-money-path`.

**Local focused run:**

```bash
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kitchenos
export DIRECT_URL="$DATABASE_URL"
export ENCRYPTION_KEY="$(node -e 'console.log(Buffer.alloc(32,17).toString(\"base64\"))')"
npx prisma db push
npm run storefront:seed-ci-checkout
npm run test:ci:storefront-money-path:unit
npm run build && npm run start -- -p 3000 &
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
export E2E_STOREFRONT_SLUG=hello
unset TURNSTILE_SECRET_KEY
npm run test:ci:storefront-money-path:e2e
```

## Tier 2b — POS money path (`pos-money-path` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| POS checkout unit | `npm run test:ci:pos-money-path:unit` | No | Canonical checkout, terminal lifecycle, action RBAC |
| POS cash sale integration | `npm run test:ci:pos-money-path:integration` | Postgres | `checkoutPosSale` + encrypted PII + transaction row |
| POS checkout E2E | `npm run test:ci:pos-money-path:e2e` | Postgres + auth secrets | Requires `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD`; optional `E2E_CI_POS_USER_ID` for `seed-e2e-pos-fixture` |

**CI workflow:** `.github/workflows/ci.yml` → job `pos-money-path`.

**Local focused run (unit + integration):**

```bash
export DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/kitchenos
export DIRECT_URL="$DATABASE_URL"
export ENCRYPTION_KEY="$(node -e 'console.log(Buffer.alloc(32,17).toString(\"base64\"))')"
export RUN_DB_INTEGRATION=1
npx prisma db push
npm run pos:seed-ci-checkout
npm run test:ci:pos-money-path:unit
npm run test:ci:pos-money-path:integration
```

**Local E2E (requires Supabase test user):**

```bash
export E2E_LOGIN_EMAIL=...
export E2E_LOGIN_PASSWORD=...
export E2E_SEED_USER_ID=<supabase-auth-uuid>
npm run build && npm run start -- -p 3000 &
export PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
npx tsx scripts/seed-e2e-pos-fixture.ts
npm run test:ci:pos-money-path:e2e
```

**Not certified:** native card-terminal hardware, EMV, or pin-pad integrations — software POS cash/card-intent path only.

## Tier 3 — Staging / preview (manual or scheduled)

| Suite | Workflow | Secrets |
|-------|----------|---------|
| Storefront public + pay-later + optional Stripe | `.github/workflows/playwright-storefront.yml` | `PLAYWRIGHT_BASE_URL`, `E2E_STORE_SLUG`, optional `STRIPE_SECRET_KEY` + `STOREFRONT_E2E_STRIPE=1` |
| Pilot golden path | `.github/workflows/e2e-pilot.yml` | Pilot credentials |

## Not in default CI (by design)

| Suite | Reason |
|-------|--------|
| Full Stripe live checkout E2E | Requires Stripe secrets + Connect; run via `STOREFRONT_E2E_STRIPE=1` on staging |
| POS hardware terminal | No hardware certification claim; tier 2b covers software POS unit + DB integration; browser E2E when auth secrets configured |

## Money-path certification mapping

| Path | Tier 2 unit | Tier 2 E2E | Tier 1 integration |
|------|-------------|------------|-------------------|
| Storefront pay-later checkout | — | ✅ pay-later spec | ✅ PII + submit |
| Storefront online checkout failure + retry | ✅ `storefront-payment-recovery.test.ts` | — | ✅ `storefront-order-pii.integration.test.ts` |
| POS cash checkout | ✅ `pos-checkout-canonical` + terminal lifecycle | ✅ when auth secrets | ✅ `order-entrypoint-pii` POS test |
| Stripe webhook fail-closed | — | — | ✅ in `test:security` |

# CI E2E tier matrix

Status: canonical money-path and smoke E2E tiers for Evolution Era 2 certification.

## Tier 0 — Default CI (`quality` job)

| Suite | Command / workflow | Secrets | Notes |
|-------|-------------------|---------|-------|
| Platform access denial | `tests/e2e/platform-access-denial.spec.ts` | None | Local `next start` on port 3000 |
| Marketing a11y | `tests/e2e/a11y-marketing.spec.ts` | None | Same server |
| Auth shell a11y | `tests/e2e/a11y-auth-shell.spec.ts` | Optional login secrets | Skips authed cases without credentials |
| Doc canon + public API + nav/maturity + integration honesty + money-path + inventory + cron + KDS + scorecard CI wiring | `npm run test:ci:governance-bundles` | None | Chains `test:ci:doc-canon:cert` + `test:ci:doc-canon`, cert/unit pairs through KDS, `test:ci:order-creation-rbac:cert`, `test:ci:platform-email-bypass:cert`, `test:ci:scorecard:cert` last |
| Era 3 RBAC wave 3 (costing, purchasing, export platform gates, incident access) | `npm run test:ci:rbac-wave3` | None | Costing + PO approval/bulk-price + export audit/DSR + export dashboard UI parity + incident manager platform access |
| Public POST fail-closed (IoT, NPS, ROI guards + route wiring) | `npm run test:ci:public-post-fail-closed` | None | Guard unit tests + IoT/NPS/ROI route fail-closed contract tests |

## Tier 1 — Security DB (`security-db` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Tenant isolation + RBAC | `npm run test:security` | Postgres service | Includes `tests/integration/storefront-order-pii.integration.test.ts` (pay-later PII + **online payment failure + retry** recovery), `tests/unit/order-creation-rbac.test.ts` (`orders.manage`), and `tests/unit/platform-email-bypass-closure.test.ts` (static scan: no runtime founder-email bypass outside bootstrap allowlist) |

## Tier 2 — Storefront money path (`storefront-money-path` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Payment recovery unit | `npm run test:ci:storefront-money-path:unit` | No | Stripe retry/cancel guards |
| Pay-later checkout E2E | `npm run test:ci:storefront-money-path:e2e` | Postgres + seed | `storefront:seed-ci-checkout` then `e2e/storefront-checkout-pay-later.spec.ts` |

**CI workflow:** `.github/workflows/ci.yml` → job `storefront-money-path`.

**Wiring certification (tier 0):** `npm run test:ci:storefront-money-path:cert` → `tests/unit/storefront-money-path-ci-live.test.ts` (included in `test:ci:governance-bundles`).

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
| POS checkout integration (cash sale + PII) | `npm run test:ci:pos-money-path:integration` | Postgres | `checkoutPosSale` + encrypted PII + transaction row |
| POS inventory depletion | `npm run test:ci:pos-money-path:inventory` | Postgres | Recipe-linked stock decrement + pending when unconfigured |
| POS checkout E2E (browser) | `npm run test:ci:pos-money-path:e2e` | Postgres + auth secrets | **Optional tier** — runs only when repository secrets `E2E_LOGIN_EMAIL` and `E2E_LOGIN_PASSWORD` are set; optional `E2E_CI_POS_USER_ID` for `seed-e2e-pos-fixture` |
| POS browser E2E policy summary | `npm run test:ci:pos-browser-e2e:policy` | None | **Always runs** at end of `pos-money-path` job; writes `ci-artifacts/pos-browser-e2e-summary.json` with `PASSED` / `SKIPPED` / `FAILED` |

**CI workflow:** `.github/workflows/ci.yml` → job `pos-money-path`.

**Browser E2E policy (Era 4 Cycle 2):** policy id `era4-tier2b-optional-v1` in `lib/ci/pos-browser-e2e-policy.ts`. Unit + integration + inventory are **always-on** tier-2b certification. Browser E2E does **not** run without dashboard auth secrets; the always-on policy step prints and uploads explicit status so green jobs cannot silently imply Playwright POS E2E passed. Artifact: `pos-browser-e2e-summary` (GitHub Actions).

**Wiring certification (tier 0):** `npm run test:ci:pos-money-path:cert` → `tests/unit/pos-money-path-ci-live.test.ts` + `tests/unit/pos-browser-e2e-policy.test.ts` (included in `test:ci:governance-bundles`).

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

**Not certified:** native card-terminal hardware, EMV, or pin-pad integrations — software POS cash/card-intent path only. **Not certified without secrets:** full dashboard Playwright POS checkout — see policy summary artifact when browser tier was `SKIPPED`.

**Inventory depletion channel policy (Era 4 Cycle 1):** **POS-only** (`lib/inventory/inventory-depletion-policy.ts`, policy id `era4-pos-only-v1`). Storefront, public API, manual, and integration orders do not call `recordPendingInventoryImpactsForPosOrder` or recipe depletion. Do not claim unified cross-channel stock depletion in sales or matrix copy. Live gate: `npm run test:ci:inventory-depletion:cert` → `tests/unit/inventory-depletion-cert-live.test.ts` + `tests/unit/inventory-depletion-policy.test.ts`.

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
| POS recipe inventory depletion | ✅ `pos-recipe-depletion.test.ts` | — | ✅ `pos-inventory-depletion.integration.test.ts` |
| Storefront / API / manual inventory depletion | — | — | **Not certified** — POS-only policy (`era4-pos-only-v1`; Era 4 Cycle 1) |
| Stripe webhook fail-closed | — | — | ✅ in `test:security` |

## Tier 1b — Cron hygiene (`quality` job)

| Suite | Command | Notes |
|-------|---------|-------|
| Production manifest reconciliation | `npm run validate:production-crons` | Manifest ↔ disk ↔ `vercel.json` ↔ archive |
| Route inventory cap | `npm run validate:cron-inventory` | **0 active experimental** under `app/api/cron` (Era 4 archive) |
| Full hygiene bundle | `npm run test:ci:cron-hygiene` | Reconciliation + inventory + `runCronRoute` scan + production gate |
| Era 4 archive surface cert | `test:ci:cron-hygiene:cert` (chained) | `tests/unit/cron-archive-era4-cert-live.test.ts` |

**Production schedule:** 16 allowlisted slugs in `services/cron/production-manifest.ts` (includes `incident-remediation-reminders`). **Active App Router surface (Era 4 Cycle 4):** **16 production routes only** under `app/api/cron/`; **121+ experimental handlers** moved to `archive/cron-routes/` per policy `era4-active-production-only-v1` (`lib/cron/cron-surface-policy.ts`). Experimental paths remain blocked in production unless `ENABLE_EXPERIMENTAL_CRONS=true` (`runCronRoute`).

**Wiring certification (tier 0):** `npm run test:ci:cron-hygiene:cert` → `tests/unit/cron-hygiene-ci-live.test.ts` + `tests/unit/cron-archive-era4-cert-live.test.ts` (included in `test:ci:governance-bundles`). Full reconciliation runs in `quality` via `validate:production-crons` and `validate:cron-inventory`.

## Tier 1c — KDS v1 scope (`quality` job via governance bundles)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Scope + wiring cert | `npm run test:ci:kds-v1:cert` | No | `docs/kds-v1-scope.md` sections, canonical index, permissioned actions |
| RBAC + rollout gate + contract | `npm run test:ci:kds-v1:unit` | No | `kitchen-daily-kds-rbac`, `kds-v1-gate`, `kds-ticket.contract` |
| Queue → bump integration | `npm run test:ci:kds-v1:integration` | Postgres + `RUN_DB_INTEGRATION=1` | **`kds-v1-prototype` CI job** — queue visibility, bump status, allergen conflict |

**Canonical scope:** `docs/kds-v1-scope.md` — daily-service order tickets only; not rush-hour, multi-station, or hardware certified.

**Wiring certification (tier 0):** `test:ci:kds-v1:cert` + `test:ci:kds-v1:unit` + `test:ci:kds-v1:prototype:cert` chained in `test:ci:governance-bundles`.

## Tier 2c — KDS v1 prototype (`kds-v1-prototype` job)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Queue → bump + allergen conflict | `npm run test:ci:kds-v1:integration` | Postgres service | Proves `getTodayQueue` ticket visibility and allergen flag; no Realtime E2E |

**CI workflow:** `.github/workflows/ci.yml` → job `kds-v1-prototype`.

**Rollout gate:** `lib/kitchen/kds-v1-gate.ts` — non-production requires `ENABLE_KDS_V1_CERTIFIED=true`; production daily-service enabled by default.

## Tier 1d — Nav / maturity governance (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Nav wiring cert | `npm run test:ci:nav-governance:cert` | `NAV_MATURITY_RULES`, sidebar filter wiring, matrix doc alignment |
| Nav maturity unit | `npm run test:ci:nav-governance` | Placeholder hide, preview badges, release navigation |

**Canonical rules:** `lib/navigation/nav-maturity-governance.ts` aligned with `docs/feature-maturity-matrix.md`.

**Wiring certification (tier 0):** `test:ci:nav-governance:cert` + `test:ci:nav-governance` chained in `test:ci:governance-bundles`.

## Tier 1e — Integration honesty (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Integration wiring cert | `npm run test:ci:integration-honesty:cert` | Registry/channel/nav alignment, UI placeholder labeling |
| Integration honesty unit | `npm run test:ci:integration-honesty` | Marketplace PLACEHOLDER registry, partner service fail-closed |

**Canonical registry:** `lib/integrations/integration-honesty.ts` — DoorDash, Grubhub, Uber Eats, Uber Direct marked placeholder; no live connector claims.

**Wiring certification (tier 0):** `test:ci:integration-honesty:cert` + `test:ci:integration-honesty` chained in `test:ci:governance-bundles`.

## Tier 1f — Doc canon (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Doc canon wiring cert | `npm run test:ci:doc-canon:cert` | Canonical index, deprecated-family notice, gateway banners, governance bundle alignment |
| Doc canon unit | `npm run test:ci:doc-canon` | Required canonical paths exist, scorecard sections, gateway deprecation banners |

**Canonical index:** `docs/canonical-doc-index.md` — 12 core + 2 era docs; ~1,300+ historical audits superseded via `docs/_DEPRECATED_AUDIT_FAMILY.md`.

**Wiring certification (tier 0):** `test:ci:doc-canon:cert` + `test:ci:doc-canon` chained first in `test:ci:governance-bundles`.

## Tier 1h — Scorecard governance (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Scorecard wiring cert | `npm run test:ci:scorecard:cert` | Cross-doc Era 3 score consistency, governance cert chain, re-audit deferral |

**Canonical sources:** `docs/canonical-doc-index.md`, `docs/full-strategic-reaudit-2026-05-27.md` §Step 20, `docs/next-master-prompt-input-2026-05-27.md`.

**Wiring certification (tier 0):** `test:ci:scorecard:cert` chained last in `test:ci:governance-bundles`.

## Tier 1g — Public API v1 contracts (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Public API wiring cert | `npm run test:ci:public-api-v1:cert` | Eight v1 routes, `guardPublicApi` fail-closed, unit bundle script alignment |
| Public API v1 unit | `npm run test:ci:public-api-v1` | Auth, pagination, tenant scope, cross-tenant isolation, orders/recipes/webhooks contracts |

**Canonical guard:** `lib/api-public/guard.ts` — 401 without bearer auth, 429 rate limit, 503 when distributed rate limiting misconfigured.

**Wiring certification (tier 0):** `test:ci:public-api-v1:cert` + `test:ci:public-api-v1` chained in `test:ci:governance-bundles`.

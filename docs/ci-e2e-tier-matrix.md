# CI E2E tier matrix

Status: canonical money-path and smoke E2E tiers for Evolution Era 2 certification.

## Tier 0 — Default CI (`quality` job)

| Suite | Command / workflow | Secrets | Notes |
|-------|-------------------|---------|-------|
| Platform access denial | `tests/e2e/platform-access-denial.spec.ts` | None | Local `next start` on port 3000 |
| Marketing a11y | `tests/e2e/a11y-marketing.spec.ts` | None | Same server |
| Auth shell a11y | `tests/e2e/a11y-auth-shell.spec.ts` | Optional login secrets | Skips authed cases without credentials |
| Doc canon + public API + nav/maturity + integration honesty + channel golden path + typecheck slice + money-path + inventory + cron + KDS + marketing claims + scorecard CI wiring | `npm run test:ci:governance-bundles` | None | Full sequential composition (`era9-governance-bundles-partition-v1`); parallel job `governance-bundles-partitions` runs four partitions; `test:ci:scorecard:cert` last in `partition-product-kds` |
| Marketing vs matrix (`quality` job) | `npm run verify-claims` | None | `era7-marketing-claims-governance-v1`; forbidden phrases fail; roadmap terms warn (strict: `MARKETING_CLAIMS_STRICT=1`) |
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
| Stripe live-card E2E (browser) | `npm run test:ci:storefront-money-path:stripe-e2e` | Postgres + seed + Stripe secret | **Optional tier** — runs only when repository secret `STRIPE_SECRET_KEY` is set and step sets `STOREFRONT_E2E_STRIPE=1`; `TURNSTILE_SECRET_KEY` must be unset |
| Storefront Stripe E2E policy summary | `npm run test:ci:storefront-stripe-e2e:policy` | None | **Always runs** at end of `storefront-money-path` job; writes `ci-artifacts/storefront-stripe-e2e-summary.json` with `PASSED` / `SKIPPED` / `FAILED` |

**CI workflow:** `.github/workflows/ci.yml` → job `storefront-money-path`.

**Stripe E2E policy (Era 7 Cycle 2):** `era7-storefront-stripe-optional-v1` + `era7-storefront-stripe-secrets-accept-v1` in `lib/ci/storefront-stripe-e2e-policy.ts`. Unit + pay-later E2E are **always-on** tier-2 certification. Stripe iframe checkout E2E does **not** run without `STRIPE_SECRET_KEY`; forks without the secret stay green when always-on certs pass and the policy artifact reports **`SKIPPED`** (explicit skip — not a silent pass). Artifact: `storefront-stripe-e2e-summary` (GitHub Actions).

**Wiring certification (tier 0):** `npm run test:ci:storefront-money-path:cert` → `tests/unit/storefront-money-path-ci-live.test.ts` + `tests/unit/storefront-stripe-e2e-policy.test.ts` + `tests/unit/storefront-stripe-e2e-secrets-policy-cert-live.test.ts` (included in `test:ci:governance-bundles`).

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

**Browser E2E policy (Era 4 Cycle 2 + Era 5 Cycle 5):** `era4-tier2b-optional-v1` + `era5-pos-e2e-secrets-accept-v1` in `lib/ci/pos-browser-e2e-policy.ts`. Unit + integration + inventory are **always-on** tier-2b certification. Browser E2E does **not** run without repository secrets `E2E_LOGIN_EMAIL` + `E2E_LOGIN_PASSWORD`; forks without secrets stay green when always-on certs pass and the policy artifact reports **`SKIPPED`** (explicit skip accepted — not a silent pass). Artifact: `pos-browser-e2e-summary` (GitHub Actions).

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

**Inventory depletion channel policy (Era 4 Cycle 1 + Era 5 Cycle 3):** **POS-only** (`lib/inventory/inventory-depletion-policy.ts`, `era4-pos-only-v1`); permanent GTM lock `era5-pos-only-gtm-lock-v1` (`deferred_locked` storefront hook). Storefront, public API, manual, and integration entrypoints must not call POS inventory impact recording. Live gate: `npm run test:ci:inventory-depletion:cert` → wiring + policy + GTM lock certs.

## Tier 3 — Staging / preview (manual or scheduled)

| Suite | Workflow | Secrets |
|-------|----------|---------|
| Storefront public + pay-later + optional Stripe | `.github/workflows/playwright-storefront.yml` | `PLAYWRIGHT_BASE_URL`, `E2E_STORE_SLUG`, optional `STRIPE_SECRET_KEY` + `STOREFRONT_E2E_STRIPE=1` |
| Pilot golden path | `.github/workflows/e2e-pilot.yml` | Pilot credentials |
| KDS Realtime observation (manual Tier E) | Staging only — see `docs/kds-staging-smoke-checklist.md` | `PLAYWRIGHT_BASE_URL`, `E2E_LOGIN_*`, `ENABLE_KDS_V1_CERTIFIED`, Supabase public keys |

**Policy:** `era8-kds-realtime-e2e-staging-v1` — no Playwright KDS spec in repo yet; wiring cert `test:ci:kds-realtime-e2e-staging:cert` only.

## Not in default CI (by design)

| Suite | Reason |
|-------|--------|
| Full Stripe live checkout E2E without policy artifact | Superseded — optional tier in `storefront-money-path` when `STRIPE_SECRET_KEY` is set; check `storefront-stripe-e2e-summary` for `PASSED`/`SKIPPED`/`FAILED` |
| POS hardware terminal | No hardware certification claim; tier 2b covers software POS unit + DB integration; browser E2E when auth secrets configured |
| KDS Realtime Playwright E2E | `era8-kds-realtime-e2e-staging-v1` — staging manual Tier D/E only; poll fallback unit-certified via `era6-kds-realtime-smoke-v1` |

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
| Era 9 cron surface recert | `test:ci:cron-hygiene:cert` (chained) | `tests/unit/cron-surface-era9-cert-live.test.ts` |

**Production schedule:** 16 allowlisted slugs in `services/cron/production-manifest.ts` (includes `incident-remediation-reminders`). **Active App Router surface (Era 4 Cycle 4):** **16 production routes only** under `app/api/cron/`; **121+ experimental handlers** moved to `archive/cron-routes/` per policy `era4-active-production-only-v1` (`lib/cron/cron-surface-policy.ts`). **Era 9 Cycle 3 recert:** `era9-cron-surface-recert-v1` (`lib/cron/cron-surface-era9-policy.ts`) — 0 experimental on disk; pilot preflight forbids `ENABLE_EXPERIMENTAL_CRONS=true`. Experimental paths remain blocked in production unless `ENABLE_EXPERIMENTAL_CRONS=true` (`runCronRoute`).

**Wiring certification (tier 0):** `npm run test:ci:cron-hygiene:cert` → `tests/unit/cron-hygiene-ci-live.test.ts` + `tests/unit/cron-archive-era4-cert-live.test.ts` + `tests/unit/cron-surface-era9-cert-live.test.ts` (included in `test:ci:governance-bundles`). Full reconciliation runs in `quality` via `validate:production-crons` and `validate:cron-inventory`.

## Tier 1c — KDS v1 scope (`quality` job via governance bundles)

| Suite | Command | DB | Notes |
|-------|---------|-----|-------|
| Scope + wiring cert | `npm run test:ci:kds-v1:cert` | No | `docs/kds-v1-scope.md` sections, canonical index, permissioned actions |
| RBAC + rollout gate + contract | `npm run test:ci:kds-v1:unit` | No | `kitchen-daily-kds-rbac`, `kds-v1-gate`, `kds-ticket.contract` |
| Queue → bump integration | `npm run test:ci:kds-v1:integration` | Postgres + `RUN_DB_INTEGRATION=1` | **`kds-v1-prototype` CI job** — queue visibility, bump status, allergen conflict |

**Canonical scope:** `docs/kds-v1-scope.md` — daily-service order tickets only; not rush-hour, multi-station, or hardware certified.

**Wiring certification (tier 0):** `test:ci:kds-v1:cert` + `test:ci:kds-v1:unit` + `test:ci:kds-v1:prototype:cert` chained in `test:ci:governance-bundles`.

## Tier 1c4 — Page maturity sweep (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Page maturity honesty | `npm run test:ci:page-maturity-sweep` | Preview/placeholder in-page copy; inline banner exceptions |
| Page maturity wiring cert | `npm run test:ci:page-maturity-sweep:cert` | Layout wiring, policy id, matrix alignment |

**Policy (Era 4 Cycle 12):** `lib/navigation/page-maturity-sweep-policy.ts`. **UI:** `PageMaturityRouteNotice` + existing nav badges (`test:ci:nav-governance`).

**Wiring certification (tier 0):** `test:ci:page-maturity-sweep:cert` + `test:ci:page-maturity-sweep` chained in `test:ci:governance-bundles`.

## Tier 1c3 — Mutation access consolidation (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Domain mutation registry + denial logger | `npm run test:ci:mutation-access-consolidation` | Registry paths, wave-4 `requireMutationPermission` + `logDomainMutationDenied` wiring |
| Consolidation wiring cert | `npm run test:ci:mutation-access-consolidation:cert` | Policy id, governance bundle, RBAC architecture §2a |

**Policy (Era 4 Cycle 11):** `lib/permissions/mutation-access-policy.ts`. **Wave-4 action tests:** `test:ci:rbac-wave4` — chained at end of `test:security` (security-db job); wiring cert `test:ci:rbac-wave4:cert` + **Era 9 Cycle 4 recert** `era9-rbac-wave4-recert-v1` (`lib/security/rbac-wave4-era9-policy.ts`); not in governance bundles.

**Wiring certification (tier 0):** `test:ci:mutation-access-consolidation:cert` + `test:ci:mutation-access-consolidation` chained in `test:ci:governance-bundles`.

## Tier 1c2 — KDS staging operational smoke (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Staging smoke policy + wiring | `npm run test:ci:kds-staging-smoke` | Checklist tiers, `smoke:kds-daily` script, permissioned actions |
| Staging smoke wiring cert | `npm run test:ci:kds-staging-smoke:cert` | Policy id, governance bundle, maturity matrix honesty |

**Policy (Era 4 Cycle 10):** `lib/kitchen/kds-staging-smoke-policy.ts` (`era4-kds-staging-smoke-v1`). **Prerequisites:** `test:ci:kds-v1:integration` (queue→bump). **Staging/manual:** `docs/kds-staging-smoke-checklist.md`; optional `npm run smoke:kds-daily -- --ephemeral` with `DATABASE_URL`. **Not certified:** rush-hour, multi-station, Playwright realtime KDS.

**Wiring certification (tier 0):** `test:ci:kds-staging-smoke:cert` + `test:ci:kds-staging-smoke` chained in `test:ci:governance-bundles`.

| KDS realtime / poll smoke unit | `npm run test:ci:kds-realtime-smoke` | Poll 15s / 60s intervals, channel name, status label wiring |
| KDS realtime smoke cert | `npm run test:ci:kds-realtime-smoke:cert` | Policy `era6-kds-realtime-smoke-v1`, governance bundle, Tier D checklist |

**Policy (Era 6 Cycle 2):** `lib/kitchen/kds-realtime-smoke-policy.ts`. **Certified:** poll fallback interval and Supabase channel naming in unit tests. **Not certified:** rush-hour, Playwright Realtime E2E, production Realtime SLO.

**Wiring certification (tier 0):** `test:ci:kds-realtime-smoke:cert` + `test:ci:kds-realtime-smoke` chained in `test:ci:governance-bundles`.

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

## Tier 1e2 — Woo / Shopify golden path (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Channel golden-path wiring cert | `npm run test:ci:channel-golden-path:cert` | Policy id `era4-channel-golden-path-v1`, scripts, fixtures, honest scope in matrix + maturity |
| Channel golden-path unit | `npm run test:ci:channel-golden-path` | Normalize → webhook processor → `externalOrder` + channel import staging (mocked); channel certification + webhook signature helpers |

**Golden-path policy (Era 4 Cycle 5):** `lib/integrations/channel-golden-path-policy.ts`. Certifies webhook → normalized order → `externalOrder` → channel import batch/record → order hub visibility via `externalOrder` list. **Does not certify** automatic kitchen `Order` creation from Woo/Shopify webhooks (`kitchenOrderAutoCreateFromWebhook: false`). Staging/live store proof: `npx tsx scripts/smoke-woo-shopify-certification.ts` (optional `--skip-live`).

**Wiring certification (tier 0):** `test:ci:channel-golden-path:cert` + `test:ci:channel-golden-path` chained in `test:ci:governance-bundles` after integration honesty.

## Tier 1e3 — Typecheck slices (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Typecheck slice wiring cert | `npm run test:ci:typecheck-slice:cert` | Policy `era5-typecheck-slice-v2`, `tsconfig.base.json`, three slice tsconfigs, `typecheck:full` + slice scripts |
| Typecheck slice unit | `npm run test:ci:typecheck-slice` | Policy registry, strict base inheritance |

**Local fast path:** `npm run typecheck:slice:*` — 6GB heap per slice. **CI canonical gate:** `quality` job → `npm run typecheck` → `typecheck:full` (8GB, full repo).

**Parallel CI job (Era 6 Cycle 3):** `typecheck-slices` job → `npm run typecheck:ci:slices` (all three slices at 6GB); policy `era6-typecheck-slice-ci-v1`; does **not** replace full typecheck.

**Wiring certification (tier 0):** `test:ci:typecheck-slice:cert` + `test:ci:typecheck-slice` chained in `test:ci:governance-bundles`.

## Tier 1e4 — Enterprise procurement honesty (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Enterprise procurement wiring cert | `npm run test:ci:enterprise-procurement:cert` | Policy `era4-procurement-honesty-v1`, pack on disk, canon index + devops links |
| Enterprise procurement unit | `npm run test:ci:enterprise-procurement` | Required pack sections; no forbidden false certification claims |

**Canonical pack:** [`docs/enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) — SSO/SCIM/SOC2 roadmaps, audit, tenant isolation, retention, backup, incident, questionnaire, FAQ.

**Wiring certification (tier 0):** `test:ci:enterprise-procurement:cert` + `test:ci:enterprise-procurement` chained in `test:ci:governance-bundles`.

| Enterprise identity annual review cert | `npm run test:ci:enterprise-identity-roadmap:cert` | Policy `era6-enterprise-identity-roadmap-v1`, annual review section, delivery markers |
| Enterprise identity roadmap unit | `npm run test:ci:enterprise-identity-roadmap` | roadmap_only decision; forbidden delivery claims |

**Era 6 Cycle 5:** SSO/SCIM/SOC2 **delivery** remains roadmap_only — no implementation in this cycle.

**Wiring certification (tier 0):** `test:ci:enterprise-identity-roadmap:cert` + `test:ci:enterprise-identity-roadmap` chained in `test:ci:governance-bundles`.

## Tier 1e5 — Cross-channel rewards honesty (`quality` job via governance bundles)

| Suite | Command | Notes |
|-------|---------|-------|
| Cross-channel rewards wiring cert | `npm run test:ci:cross-channel-rewards:cert` | Policy `era4-cross-channel-rewards-v1` + GTM lock `era6-dual-ledger-gtm-lock-v1` + **Era 10 recert** `era10-cross-channel-rewards-recert-v1` |
| Cross-channel rewards unit | `npm run test:ci:cross-channel-rewards` | POS `checkoutPosSale` kitchen gift card + loyalty wiring; storefront `redeemGiftCardPartial` not imported outside service |

**Policy (Era 4/6/10):** `lib/rewards/cross-channel-rewards-policy.ts` (`era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`); **Era 10 Cycle 1 recert:** `era10-cross-channel-rewards-recert-v1` (`lib/rewards/cross-channel-rewards-era10-policy.ts`). **Certified:** POS applies `services/gift-cards` + `services/loyalty` at checkout. **Not certified:** unified gift card / loyalty balance across storefront and POS (dual ledger; unification `deferred_locked`; no cross-channel Playwright E2E).

**Wiring certification (tier 0):** `test:ci:cross-channel-rewards:cert` + `test:ci:cross-channel-rewards` in `test:ci:governance-bundles:partition-money-path`.

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

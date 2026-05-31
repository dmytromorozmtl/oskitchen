# QA Master Test Plan

Status: canonical QA plan for OS Kitchen release gating
Primary evidence: `tests/`, `e2e/`, `package.json`, `.github/workflows/ci.yml`, `.github/workflows/e2e-staging.yml`, `docs/QA_TEST_COVERAGE_AUDIT.md`, `docs/system-reality-model.md`

## Test Suites
### 1. Unit
- pure business rules
- pricing, tax, loyalty, gift card, permissions, status transitions
- schema parsing, helpers, audit sanitization, scope guards

### 2. Integration
- Prisma-backed tenant isolation
- order creation invariants
- storefront order read/write behavior
- error recovery and queue lifecycles

### 3. Contract
- public API response contracts
- webhook signature and payload expectations
- route registry and cron manifest contracts
- cron hygiene live gates: `tests/unit/cron-hygiene-live.test.ts`, `validate:production-crons`, `validate:cron-inventory`, bundle `test:ci:cron-hygiene`
- doc canon gate: wiring cert `test:ci:doc-canon:cert` + unit `test:ci:doc-canon` (`tests/unit/doc-canon-ci-live.test.ts`, `tests/unit/canonical-doc-index.test.ts`), index `docs/canonical-doc-index.md`
- scorecard gate: `test:ci:scorecard:cert` (`tests/unit/scorecard-ci-live.test.ts`) — Era 3 increment consistency across canonical docs
- **CI quality job bundle:** `npm run test:ci:governance-bundles` (doc-canon + public-api-v1 + nav-governance + integration-honesty); **Era 9 Cycle 2:** four parallel partitions (`test:ci:governance-bundles:partition-*`) in job `governance-bundles-partitions` — `quality` keeps full sequential bundle; **Era 3 RBAC wave 3:** `npm run test:ci:rbac-wave3`; **public POST fail-closed:** `npm run test:ci:public-post-fail-closed` (IoT/NPS/ROI guards + route wiring)

### 4. E2E
- user journeys through auth, storefront, POS, dashboard, packing, and critical support flows
- **Era 12 staging secrets:** `lib/ci/e2e-staging-secrets-era12-policy.ts` (`era12-e2e-staging-secrets-align-v1`) — `e2e-staging.yml` / `closed-beta-gate.yml` map GitHub password secret to `E2E_LOGIN_PASSWORD`; cert `test:ci:e2e-staging-secrets-era12:cert` (governance platform partition)
- **Era 12 staging auth:** `lib/ci/e2e-staging-auth-era12-policy.ts` (`era12-e2e-staging-auth-wiring-v1`) — `e2e-staging.yml` runs `e2e/auth.setup.ts` (`--project=setup`) + `e2e/dashboard-auth.spec.ts` (`chromium-authed`); cert `test:ci:e2e-staging-auth-era12:cert`

### 5. Visual Regression
- marketing pages
- role dashboards
- POS terminal states
- storefront themes and publish flows

### 6. Accessibility
- marketing and auth
- dashboard shell
- POS and handheld
- storefront checkout

### 7. Security
- permission negative
- cross-tenant denial
- webhook auth/signature
- upload/media validation
- impersonation and audit

### 8. Kitchen / KDS (v1 scope)
- canonical scope: `docs/kds-v1-scope.md` (locked; CI gate `test:ci:kds-v1:cert`)
- unit bundle: `npm run test:ci:kds-v1:unit` (RBAC + rollout gate + contract; in `test:ci:governance-bundles`)
- integration: `npm run test:ci:kds-v1:integration` in **`kds-v1-prototype` CI job** (Postgres + `RUN_DB_INTEGRATION=1`)
- prototype wiring cert: `test:ci:kds-v1:prototype:cert` (in `test:ci:governance-bundles`)
- manual/staging: Supabase Realtime subscription smoke on `/dashboard/kitchen`; non-prod needs `ENABLE_KDS_V1_CERTIFIED=true`
- not required for v1: multi-station E2E, offline replay, hardware cert

### 8b. Navigation / maturity governance
- rules: `lib/navigation/nav-maturity-governance.ts` (`NAV_MATURITY_RULES` aligned with `docs/feature-maturity-matrix.md`)
- wiring cert: `test:ci:nav-governance:cert` (in `test:ci:governance-bundles`)
- unit: `npm run test:ci:nav-governance` (in `test:ci:governance-bundles`)
- focused nav hides placeholder marketplace integrations; preview badges on immature surfaces; internal GTM links require platform access

### 8c. Integration honesty
- canonical ids: `lib/integrations/integration-honesty.ts`
- wiring cert: `test:ci:integration-honesty:cert` (in `test:ci:governance-bundles`)
- registry alignment: `lib/integrations/integration-registry.ts`, `lib/channels/channel-registry.ts`
- unit: `npm run test:ci:integration-honesty` (in `test:ci:governance-bundles`)
- UI: `components/channels/channel-card.tsx`, `app/dashboard/sales-channels/available/page.tsx`

### 8c2. Woo / Shopify golden path (Era 4 Cycle 5)
- policy: `lib/integrations/channel-golden-path-policy.ts` (`era4-channel-golden-path-v1`)
- era12 recert: `lib/integrations/channel-golden-path-era12-policy.ts` (`era12-channel-golden-path-recert-v1`) — `order_hub_visibility` via order hub service wiring
- era12 staging smoke: `lib/integrations/channel-golden-path-smoke-era12-policy.ts` (`era12-channel-golden-path-smoke-v1`) — `npm run smoke:woo-shopify`; **not in default CI**; `--skip-live` for credentials-only; cert `test:ci:channel-golden-path-smoke-era12:cert`
- era14 recert: `lib/integrations/channel-golden-path-era14-policy.ts` (`era14-channel-golden-path-recert-v1`) — `docs/channel-golden-path-honesty-checklist.md`; `npm run smoke:channel-golden-path`
- **Era 17 channel live smoke:** `era17-channel-live-smoke-woo-v1` + `era17-channel-live-smoke-shopify-v1` — `npm run smoke:woo-shopify-live`; artifact `artifacts/channel-live-smoke-summary.json`; cert `test:ci:channel-live-smoke-woo-era17:cert` + `test:ci:channel-live-smoke-shopify-era17:cert` (chained in `test:ci:channel-golden-path:cert`); **awaiting_live_credentials** until staging DB + connection configured
- wiring cert: `test:ci:channel-golden-path:cert` (chains era12 + era14 certs; in `test:ci:governance-bundles`)
- unit: `npm run test:ci:channel-golden-path` — normalize fixtures, webhook processors → `externalOrder` + channel import staging + order hub scope (mocked)
- era12 unit: `npm run test:ci:channel-golden-path-era12`
- honest scope: does **not** certify kitchen `Order` auto-create from Woo/Shopify webhooks; certifies external order + staging + order hub external list path
- staging smoke (optional live API): `npx tsx scripts/smoke-woo-shopify-certification.ts` (`--skip-live` for credentials-only checks)

### 8c9. Era 4 scorecard refresh (Era 4 Cycle 13)
- policy: `lib/governance/era4-scorecard-policy.ts` (`era4-scorecard-refresh-v1`)
- docs: `docs/era4-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-27-era4.md`
- wiring cert: `test:ci:scorecard:cert` (last in `test:ci:governance-bundles`)
- unit: includes `tests/unit/era4-scorecard-policy.test.ts`

### 8c8. Page maturity sweep (Era 4 Cycle 12)
- policy: `lib/navigation/page-maturity-sweep-policy.ts` (`era4-page-maturity-sweep-v1`)
- wiring cert: `test:ci:page-maturity-sweep:cert` (in `test:ci:governance-bundles`)
- unit: `npm run test:ci:page-maturity-sweep` — preview/placeholder honesty + nav rule alignment
- UI: `PageMaturityRouteNotice` in `app/dashboard/layout.tsx`
- complements: `test:ci:nav-governance` (sidebar badges)

### 8c7. Mutation access consolidation (Era 4 Cycle 11 + Era 11 Cycle 2 recert)
- policy: `lib/permissions/mutation-access-policy.ts` (`era4-mutation-access-consolidation-v1`)
- era11 recert: `lib/permissions/mutation-access-era11-policy.ts` (`era11-mutation-access-recert-v1`) — production calendar inline gate + `production_calendar.update_task_status` after Era 10 status workflow
- era14 recert: `lib/permissions/mutation-access-era14-policy.ts` (`era14-mutation-access-consolidation-recert-v1`) — registry + scoped-helper honesty; `docs/mutation-access-consolidation-checklist.md`; `npm run smoke:mutation-access`
- registry: `lib/permissions/domain-mutation-registry.ts` (includes `production_calendar` entry)
- wiring cert: `test:ci:mutation-access-consolidation:cert` (in `test:ci:governance-bundles`; chains `test:ci:mutation-access-era11:cert`)
- unit: `npm run test:ci:mutation-access-consolidation` — registry integrity + shared denial logger
- era11 unit: `npm run test:ci:mutation-access-era11` — inline wave-4 gate policy tests
- wave-4 action RBAC: `npm run test:ci:rbac-wave4` — chained at end of `npm run test:security` (security-db job); includes `production-calendar-actions-rbac.test.ts`; not in governance bundles

### 8c6. KDS staging operational smoke (Era 4 Cycle 10)
- policy: `lib/kitchen/kds-staging-smoke-policy.ts` (`era4-kds-staging-smoke-v1`)
- wiring cert: `test:ci:kds-staging-smoke:cert` (in `test:ci:governance-bundles`)
- unit: `npm run test:ci:kds-staging-smoke` — checklist + smoke script wiring; prerequisites `test:ci:kds-v1:*`
- staging: `docs/kds-staging-smoke-checklist.md`; optional `npm run smoke:kds-daily -- --ephemeral` with `DATABASE_URL`
- not in scope: rush-hour load, multi-station routing, Playwright realtime KDS E2E

### 8c7. KDS realtime / poll fallback smoke (Era 6 Cycle 2)
- policy: `lib/kitchen/kds-realtime-smoke-policy.ts` (`era6-kds-realtime-smoke-v1`)
- wiring cert: `test:ci:kds-realtime-smoke:cert` (in `test:ci:governance-bundles`)
- unit: `npm run test:ci:kds-realtime-smoke` — 15s/60s poll intervals, channel naming, status labels in `kds-daily-service.tsx`
- staging: Tier D in `docs/kds-staging-smoke-checklist.md` (manual Realtime vs poll observation)
- not in scope: rush-hour, production Realtime traffic, Playwright Realtime E2E

### 8c5. Cross-channel loyalty / gift cards (Era 4 Cycle 9)
- policy: `lib/rewards/cross-channel-rewards-policy.ts` (`era4-cross-channel-rewards-v1`, GTM lock `era6-dual-ledger-gtm-lock-v1`)
- wiring cert: `test:ci:cross-channel-rewards:cert` (includes GTM forbidden-phrase scan; in `test:ci:governance-bundles`)
- unit: `npm run test:ci:cross-channel-rewards` — POS kitchen-ledger redeem wiring + storefront dual-ledger honesty (no unified codes)
- not in scope: Playwright storefront↔POS E2E (separate ledgers; storefront checkout gift redeem unwired)

### 8c4f. KDS Realtime Playwright E2E staging scope (Era 8 Cycle 2)
- policy: `lib/kitchen/kds-realtime-e2e-staging-policy.ts` (`era8-kds-realtime-e2e-staging-v1`) + Era 11 `era11-kds-realtime-e2e-staging-v1` (`lib/ci/kds-realtime-e2e-staging-summary-policy.ts`)
- extends: `era6-kds-realtime-smoke-v1` (poll fallback unit-certified)
- playwright: `e2e/kds-realtime-staging.spec.ts` — `test:ci:kds-realtime-e2e-staging:playwright` (staging); **not in default CI**
- policy summary: `test:ci:kds-realtime-e2e-staging:policy` → `kds-realtime-e2e-staging-summary` (`PASSED`/`SKIPPED`/`FAILED`)
- staging: Tier E in `docs/kds-staging-smoke-checklist.md`
- optional workflow: `.github/workflows/playwright-kds-staging.yml` (`era11-kds-realtime-e2e-staging-workflow-v1`); not in `ci.yml`
- **Era 17 Playwright proof:** `era17-kds-staging-playwright-proof-v1` — `npm run smoke:kds-staging-playwright`; artifact `artifacts/kds-staging-playwright-proof-summary.json`; cert `test:ci:kds-staging-playwright-proof-era17:cert` (in `test:ci:kds-staging-smoke:cert`)
- **Era 17 operational sign-off staging proof:** `era17-operational-signoff-staging-proof-v1` — `npm run smoke:operational-signoff-staging`; artifact `artifacts/operational-signoff-staging-proof-summary.json`; cert `test:ci:operational-signoff-staging-proof-era17:cert` (in `test:ci:operational-signoff-era16:cert`)
- wiring cert: `test:ci:kds-realtime-e2e-staging:cert` (chains era11 + workflow era11; in `test:ci:governance-bundles`)

### 8c4e. Claims registry governance (Era 8 Cycle 1)
- policy: `lib/governance/claims-registry-policy.ts` (`era8-claims-registry-v1`)
- registry: `config/marketing/claims-registry.json` — statuses `verified` | `illustrative` | `deprecated` only
- audit: `npm run audit:marketing-claims` (fails on `needs-evidence`)
- wiring cert: `test:ci:claims-registry:cert` (in `test:ci:governance-bundles`)

### 8c4d. Marketing claims governance (Era 7 Cycle 4)
- policy: `lib/governance/marketing-claims-governance-policy.ts` (`era7-marketing-claims-governance-v1`)
- scan: `npm run verify-claims` (forbidden phrases exit 1; roadmap terms warn unless `MARKETING_CLAIMS_STRICT=1`)
- pilot preflight: `scripts/ops/pilot-preflight.sh` runs strict `verify-claims` (`era8-pilot-preflight-claims-strict-v1`); cert `test:ci:pilot-preflight-claims:cert`
- registry: `config/marketing/claims-registry.json`; audit `npm run audit:marketing-claims`
- wiring cert: `test:ci:marketing-claims-governance:cert` (in `test:ci:governance-bundles`)

### 8c4c. Repository hygiene — `tests/node_modules/` (Era 7 Cycle 3)
- policy: `lib/ci/repo-hygiene-policy.ts` (`era7-tests-node-modules-hygiene-v1`)
- wiring cert: `test:ci:repo-hygiene:cert` (in `test:ci:governance-bundles`)
- unit: `npm run test:ci:repo-hygiene` — gitignore lines + forbidden-path detection
- live: `git ls-files tests/node_modules` must be empty

### 8c4b. Storefront Stripe E2E CI policy (Era 7 Cycle 2)
- policy: `lib/ci/storefront-stripe-e2e-policy.ts` (`era7-storefront-stripe-optional-v1`, `era7-storefront-stripe-secrets-accept-v1`)
- optional Playwright: `test:ci:storefront-money-path:stripe-e2e` when `STRIPE_SECRET_KEY` + `STOREFRONT_E2E_STRIPE=1`
- wiring: extended `test:ci:storefront-money-path:cert`; policy script `test:ci:storefront-stripe-e2e:policy`; artifact `storefront-stripe-e2e-summary`

### 8c4a. Commercial pilot runbook (Era 7 Cycle 1)
- policy: `lib/commercial/commercial-pilot-runbook-policy.ts` (`era7-commercial-pilot-runbooks-v1`)
- canonical runbook: `docs/commercial-pilot-runbook.md` (Tier 0–3; matrix alignment; deprecated `docs/PILOT_*` family)
- wiring cert: `test:ci:commercial-pilot-runbook:cert` (in `test:ci:governance-bundles`)
- **Era 17 Tier 2:** `era17-pilot-operator-golden-path-v1` — `npm run smoke:pilot-operator-golden-path`; artifact `artifacts/pilot-operator-golden-path-summary.json`
- **Era 17 metrics:** `era17-pilot-metrics-baseline-v1` — `npm run smoke:pilot-metrics-baseline`; artifact `artifacts/pilot-metrics-baseline-summary.json`
- **Era 17 rollback drill:** `era17-pilot-rollback-drill-v1` — `npm run smoke:pilot-rollback-drill`; artifact `artifacts/pilot-rollback-drill-summary.json`
- **Era 17 GO/NO-GO:** `era17-pilot-gono-go-v1` — `npm run smoke:pilot-gono-go`; artifact `artifacts/pilot-gono-go-summary.json`; cert `test:ci:pilot-gono-go-era17:cert` (in `test:ci:commercial-pilot-runbook:cert`); **awaiting_customer_execution** — honest **NO-GO** until tiers + ICP + LOI
- **Era 17 forbidden claims:** `era17-pilot-forbidden-claims-enforcement-v1` — `npm run smoke:pilot-forbidden-claims-enforcement`; artifact `artifacts/pilot-forbidden-claims-enforcement-summary.json`; cert `test:ci:pilot-forbidden-claims-enforcement-era17:cert` (in `test:ci:commercial-pilot-runbook:cert`)
- unit: `npm run test:ci:commercial-pilot-runbook` — required sections + forbidden pilot headline claims

### 8c4f2. Enterprise SSO architecture spike R1 (Era 9 Cycle 1)
- Policy: `lib/enterprise/enterprise-sso-architecture-spike-policy.ts` (`era9-enterprise-sso-architecture-spike-v1`)
- Doc: `docs/enterprise-sso-architecture-spike-r1.md` — design only; delivery `not_implemented`
- Wiring cert: `test:ci:enterprise-sso-spike:cert` (in `test:ci:governance-bundles`)
- Extends: `era6-enterprise-identity-roadmap-v1` — no live SSO/SAML procurement claims
- Era 13 recert: `lib/enterprise/enterprise-identity-era13-policy.ts` (`era13-enterprise-identity-recert-v1`) — roadmap_only; R2 pilot not_started; cert `test:ci:enterprise-identity-era13:cert` (in `test:ci:enterprise-identity-roadmap:cert`)
- Era 13 staging ops: `lib/ci/staging-workflows-first-run-era13-policy.ts` (`era13-staging-workflows-first-run-ops-v1`) — optional `e2e-staging.yml` / `playwright-kds-staging.yml` / `closed-beta-gate.yml`; `JOB_OMITTED_SECRETS_MISSING` when secrets unset; cert `test:ci:staging-workflows-first-run-era13:cert` (in `test:ci:e2e-staging-secrets-era12:cert`)
- era15 recert: `lib/ci/staging-workflows-first-run-era15-policy.ts` (`era15-staging-workflows-first-run-recert-v1`); `npm run smoke:staging-workflows`
- Era 16 first green: `lib/ci/staging-workflows-first-green-era16-policy.ts` (`era16-staging-workflows-first-green-v1`); `npm run smoke:staging-workflows-first-green`; cert `test:ci:staging-workflows-first-green-era16:cert` (in `test:ci:e2e-staging-secrets-era12:cert`)
- **Era 17 staging first green:** `era17-staging-workflows-first-green-v1` — `npm run smoke:staging-workflows-first-green`; artifact `artifacts/staging-workflows-first-green-summary.json`; cert `test:ci:staging-workflows-first-green-era17:cert` (in `test:ci:e2e-staging-secrets-era12:cert`); **awaiting_github_first_green** until ≥2/3 GitHub workflows PASSED
- **Era 17 SSO IdP staging:** `era17-enterprise-sso-idp-staging-smoke-v1` + `era17-enterprise-sso-idp-login-proof-v1` — `npm run smoke:enterprise-sso-idp-staging`; artifact `artifacts/enterprise-sso-idp-staging-smoke-summary.json`; cert `test:ci:enterprise-sso-idp-staging-era17:cert` (in `test:ci:enterprise-identity-roadmap:cert`); delivery **pilot_foundation** until `loginProofStatus: proof_passed`

### 8c4. Enterprise procurement honesty (Era 4 Cycle 8)
- policy: `lib/enterprise/enterprise-procurement-policy.ts` (`era4-procurement-honesty-v1`)
- era15 recert: `lib/enterprise/enterprise-procurement-era15-policy.ts` (`era15-enterprise-procurement-recert-v1`); `npm run smoke:enterprise-procurement`
- canonical pack: `docs/enterprise-procurement-pack.md`
- wiring cert: `test:ci:enterprise-procurement:cert` (in `test:ci:governance-bundles`)
- unit: `npm run test:ci:enterprise-procurement` — required sections present; forbidden false SOC2/SSO/SCIM affirmative claims absent

### 8c3. Typecheck slices (Era 4 Cycle 7 + Era 11 Cycle 1)
- policy: `lib/ci/typecheck-slice-policy.ts` (`era11-typecheck-slice-v3`; extends `era5-typecheck-slice-v2` — services-core, dashboard-services-api, storefront-marketing, **platform-auth**)
- era11 cert: `test:ci:typecheck-slice-era11:cert` (chained in `test:ci:typecheck-slice:cert`)
- era15 recert: `lib/ci/typecheck-slice-era15-policy.ts` (`era15-typecheck-slice-recert-v1`); `npm run smoke:typecheck-slices`
- era16 reporting: `lib/ci/typecheck-slice-era16-policy.ts` / `lib/ci/typecheck-slice-report.ts` (`era16-typecheck-slice-report-v1`); `npm run typecheck:report:slices`; artifact `artifacts/typecheck-slice-summary.json`
- wiring cert: `test:ci:typecheck-slice:cert` (in `test:ci:governance-bundles`)
- local slice: `npm run typecheck:slice:platform-auth` (6GB; platform admin + login/onboarding)
- parallel CI: `typecheck-slices` job → `npm run typecheck:ci:slices` (all four slices); **canonical gate:** `quality` → `typecheck:full` (8GB)

### 8d. Public API v1 contracts
- routes: `app/api/public/v1/` (orders, products, customers, inventory, locations, recipes, staff, webhooks)
- guard: `lib/api-public/guard.ts` (401 without auth, 429 rate limit, 503 when rate limit misconfigured)
- wiring cert: `npm run test:ci:public-api-v1:cert` (in `test:ci:governance-bundles`, before unit bundle; chains `test:ci:public-api-partner-confidence-era16:cert`)
- era16 partner confidence: `lib/api-public/public-api-partner-confidence-era16-policy.ts` (`era16-public-api-partner-confidence-v1`); `npm run smoke:public-api-live`; artifact `artifacts/public-api-partner-confidence-summary.json`
- unit bundle: `npm run test:ci:public-api-v1`
- coverage: auth fail-closed per resource, tenant-scoped list queries, customers pagination envelope, recipes/webhooks POST validation, existing orders/auth/cross-tenant suites

### 9. Performance
- storefront render and checkout
- dashboard high-traffic pages
- hot-path queries

### 10. Load
- storefront checkout
- queue/drain paths
- high-volume order hub and reporting paths

### 10. Tenant Isolation
- workspace and user scope helpers
- API/public and internal route boundaries

### 11. Permission Negative
- role-based denials for POS, billing, integrations, storefront publishing, uploads, exports, staff, and reports

### 12. Payment Webhook
- Stripe success, failure, duplicate, late, and reconciliation cases

### 13. Offline POS
- degraded mode messaging
- replay restrictions and queue behavior once implemented

### 14. KDS Realtime
- see `docs/kds-v1-scope.md` for v1 boundaries
- bump/recall permission tests (unit); integration queue→bump in Cycle 19–20
- timer/urgency client behavior; packing handoff out of v1 scope

### 15. Integration Certification
- provider setup
- webhook/sync health
- retry and operator-facing recovery

## Critical Flow Matrix
| Flow | Minimum suite coverage |
| --- | --- |
| signup | E2E, a11y |
| login | E2E, security |
| onboarding | E2E, visual |
| create menu | unit + E2E |
| create product | unit + E2E |
| publish storefront | unit, integration, E2E |
| online order | unit, integration, E2E |
| payment success | integration, contract, E2E |
| payment failure | integration, unit (`storefront-payment-recovery`), E2E tier 2 optional Stripe on staging |
| storefront pay-later checkout | unit, integration, E2E tier 2 (`storefront-money-path` CI job) |
| POS checkout | unit, integration, inventory (tier 2b), E2E when auth secrets configured, CI wiring gate (`test:ci:pos-money-path:cert`) | Software path only — no hardware certification |
| refund | unit, integration, permission-negative |
| void | unit, integration, permission-negative |
| table order | E2E once table service ships |
| bar tab | E2E once bar mode matures |
| KDS bump | integration, realtime, permission-negative |
| inventory depletion | unit + integration (POS recipe path certified via `test:ci:inventory-depletion:cert`; storefront explicitly deferred) |
| loyalty earn/redeem | unit, integration |
| gift card redeem | unit, integration |
| staff clock in/out | unit, E2E |
| manager close shift | unit, E2E |
| delivery route | integration, E2E when provider path is active |
| customer reorder | unit, E2E |
| API order creation | contract, security, tenant isolation |
| webhook duplicate | contract, integration |
| cross-tenant denial | integration, security |
| malicious upload blocked | security |
| integration disabled state | visual, unit |
| preview integration state | visual, unit |

## Release Gates
- P0 cannot merge without tests.
- Permission tests are mandatory for sensitive mutations.
- Critical journeys must have E2E coverage or an explicitly approved temporary gap.
- Storefront money-path tiers: see `docs/ci-e2e-tier-matrix.md`.
- A QA report must be generated per release candidate.

## Current Highest-Priority Additions
1. ~~POS money-path CI wiring + browser E2E policy~~ — tier 2b unit + integration + inventory always in CI; optional Playwright when `E2E_LOGIN_*` secrets set; explicit `PASSED`/`SKIPPED`/`FAILED` via `test:ci:pos-browser-e2e:policy` + `pos-browser-e2e-summary` artifact (Era 4 Cycle 2)
2. ~~storefront payment failure and retry matrix~~ — tier 2 unit + tier 1 integration + tier 2 pay-later E2E in CI; live wiring gate `test:ci:storefront-money-path:cert`; **Era 7 Cycle 2:** optional Stripe live-card E2E with `storefront-stripe-e2e-summary` artifact (`era7-storefront-stripe-optional-v1`)
3. ~~inventory depletion POS proof + channel policy~~ — unit + integration in CI; live gate `test:ci:inventory-depletion:cert`; **Era 4 Cycle 1:** POS-only policy (`era4-pos-only-v1` in `lib/inventory/inventory-depletion-policy.ts`); storefront/API/manual do not deplete
4. ~~RBAC wave 4~~ — `test:ci:rbac-wave4` batch 1 + batch 2; **Era 5 Cycle 1:** bundle in `test:security`; **Era 5 Cycle 4:** copilot void-form deny (`era5-copilot-form-deny-v1`); **Era 6 Cycle 4:** production calendar void-form deny (`era6-production-calendar-form-deny-v1`)

### 8c4g. Production calendar move-task UI (Era 8 Cycle 4)
- Policy: `lib/production/production-calendar-move-ui-policy.ts` (`era8-production-calendar-move-ui-v1`)
- UI: week-column ←/→ on `/dashboard/production/calendar` via `movePlanTaskAction`
- Wiring cert: `test:ci:production-calendar-move-ui:cert` (in `test:ci:governance-bundles`)

### 8c4o. KDS staging smoke recert (Era 10 Cycle 4)
- Policy: `lib/kitchen/kds-staging-smoke-era10-policy.ts` (`era10-kds-staging-smoke-recert-v1`; extends `era4-kds-staging-smoke-v1`)
- era15 recert: `lib/kitchen/kds-staging-smoke-era15-policy.ts` (`era15-kds-staging-smoke-recert-v1`); `npm run smoke:kds-staging`
- Integration: `tests/integration/kds-daily-queue-bump.integration.test.ts` (bump + recall + allergen)
- Wiring cert: `test:ci:kds-staging-smoke-era10:cert` (chained in `test:ci:kds-staging-smoke:cert`)
- Honest gap: Playwright KDS spec is staging-only (not default CI); no rush-hour or production Realtime SLO claim

### 8c4n. Production calendar status workflow UI (Era 10 Cycle 3)
- Policy: `lib/production/production-calendar-status-workflow-ui-policy.ts` (`era10-production-calendar-status-workflow-ui-v1`; extends cross-week)
- Status allowlist: `lib/production/production-plan-task-status.ts`
- Action: `updatePlanTaskStatusAction` (`production.manage` + form deny)
- Wiring cert: `test:ci:production-calendar-status-workflow-ui:cert` (chained in `test:ci:production-calendar-move-ui:cert`)
- RBAC: `tests/unit/production-calendar-actions-rbac.test.ts` (status update deny/allow)

### 8c4r. Cross-channel rewards Era 14 recert (Era 14 Cycle 2)
- Policy: `lib/rewards/cross-channel-rewards-era14-policy.ts` (`era14-cross-channel-rewards-recert-v1`; extends era4/6/10)
- Honest scope: dual ledger; unification `deferred_locked`; no unified Playwright E2E in default CI
- Smoke: `npm run smoke:cross-channel-rewards` — runs `test:ci:cross-channel-rewards:cert` + era14 cert
- Wiring cert: `test:ci:cross-channel-rewards-era14:cert` (chained in `test:ci:cross-channel-rewards:cert`)

### 8c4q. Nav page maturity Era 14 recert (Era 14 Cycle 1)
- Policy: `lib/navigation/nav-page-maturity-era14-policy.ts` (`era14-nav-page-maturity-recert-v1`; extends `era4-page-maturity-sweep-v1`)
- Audit: `findNavPageMaturityHonestyGaps()` — every focused-nav preview/placeholder href must have `PageMaturityRouteNotice` copy or inline PlaceholderBanner exception
- Gap closure: `/dashboard/staff/payroll`, `/dashboard/marketing/email-campaigns`
- Wiring cert: `test:ci:nav-page-maturity-era14:cert` (chained in `test:ci:page-maturity-sweep:cert`)

### 8c4q2. Nav maturity sweep Era 17 (Era 17 Cycle 32)
- Policy: `lib/navigation/nav-maturity-sweep-era17-policy.ts` (`era17-nav-maturity-sweep-v1`; extends Era 4/14)
- Audit: `runNavMaturitySweepEra17Audit()` — focused nav zero-gap + 5 Era 17 preview route classifications
- New preview routes: SSO pilot settings, POS inventory impacts, costing theft, holiday packages, 7shifts sync
- Smoke: `npm run smoke:nav-maturity-sweep-era17` → `artifacts/nav-maturity-sweep-era17-summary.json`
- Wiring cert: `test:ci:nav-maturity-sweep-era17:cert` (chained in `test:ci:page-maturity-sweep:cert`)

### 8c4q3. Permission denied UX Era 17 (Era 17 Cycle 33)
- Policy: `lib/ux/permission-denied-era17-policy.ts` (`era17-permission-denied-ux-v1`)
- Surfaces: POS terminal/hub/layout + KDS — `PermissionDeniedSurfaceCard`, `data-testid="permission-denied-card"`
- Smoke: `npm run smoke:permission-denied-ux`
- Wiring cert: `test:ci:permission-denied-ux-era17:cert` (chained in `test:ci:pos-tablet-ux-era17:cert`)

### 8c4p. Production calendar operator depth (Era 13 Cycle 4)
- Policy: `lib/production/production-calendar-operator-depth-era13-policy.ts` (`era13-production-calendar-operator-depth-v1`; consolidates Era 6/8/10/11)
- era15 recert: `lib/production/production-calendar-operator-depth-era15-policy.ts` (`era15-production-calendar-operator-recert-v1`)
- Manual: `docs/production-calendar-operator-checklist.md` — pilot steps; not rush-hour certified
- Smoke: `npm run smoke:production-calendar` — runs `test:ci:production-calendar-move-ui:cert` + era13 cert (not browser E2E)
- Honest gaps: no drag-and-drop, KDS sync, or delete-task UI
- Wiring cert: `test:ci:production-calendar-operator-depth-era15:cert` (chained in `test:ci:production-calendar-move-ui:cert`)
- **Era 17 operator drill:** `era17-production-calendar-operator-drill-v1` — `npm run smoke:production-calendar-drill`; artifact `artifacts/production-calendar-operator-drill-summary.json`; cert `test:ci:production-calendar-operator-drill-era17:cert` (in `test:ci:production-calendar-move-ui:cert`)

### 8c4m. Production calendar cross-week UI (Era 10 Cycle 2)
- Policy: `lib/production/production-calendar-cross-week-ui-policy.ts` (`era10-production-calendar-cross-week-ui-v1`; extends `era8-production-calendar-move-ui-v1`)
- Helpers: `lib/production/production-calendar-week-navigation.ts`
- UI: `/dashboard/production/calendar?week=YYYY-MM-DD` with Previous/Next week; boundary ←/→ uses `movePlanTaskAction`
- Wiring cert: `test:ci:production-calendar-cross-week-ui:cert` (chained in `test:ci:production-calendar-move-ui:cert`)

### 8c4l. Cross-channel rewards recert (Era 10 Cycle 1)
- Policy: `lib/rewards/cross-channel-rewards-era10-policy.ts` (`era10-cross-channel-rewards-recert-v1`; extends `era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`; **dual ledger** honesty)
- Unit: `test:ci:cross-channel-rewards` — POS checkout wiring + storefront honesty
- Wiring cert: `test:ci:cross-channel-rewards:cert` (in `test:ci:governance-bundles:partition-money-path`)
- Honest scope: no unified cross-channel Playwright E2E; unification `deferred_locked`

### 8c4k. Era 9 scorecard refresh (Era 9 Cycle 5)
- Policy: `lib/governance/era9-scorecard-policy.ts` (`era9-scorecard-refresh-v1`)
- Docs: `docs/era9-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-27-era9.md`
- Wiring cert: `test:ci:scorecard:cert` (last in `test:ci:governance-bundles:partition-product-kds`)
- Unit: `tests/unit/era9-scorecard-policy.test.ts`, `tests/unit/era9-scorecard-ci-live.test.ts`

### 8c4j. RBAC wave 4 recert (Era 9 Cycle 4)
- Policy: `lib/security/rbac-wave4-era9-policy.ts` (`era9-rbac-wave4-recert-v1`)
- Bundle: `npm run test:ci:rbac-wave4` (15 negative/deny tests incl. production-calendar form deny)
- Security-db: chained at end of `npm run test:security`
- Wiring cert: `test:ci:rbac-wave4:cert` → `rbac-wave4-era9-cert-live.test.ts`

### 8c4i. Cron surface recert (Era 9 Cycle 3)
- Policy: `lib/cron/cron-surface-era9-policy.ts` (`era9-cron-surface-recert-v1`; extends `era4-active-production-only-v1`)
- Era 14 recert: `lib/cron/cron-surface-era14-policy.ts` (`era14-cron-surface-recert-v1`) — operator checklist `docs/cron-surface-honesty-checklist.md`; `npm run smoke:cron-surface`
- Validators: `npm run validate:production-crons`, `npm run validate:cron-inventory`
- Pilot: `scripts/ops/pilot-preflight.sh` forbids `ENABLE_EXPERIMENTAL_CRONS=true`
- Wiring cert: `test:ci:cron-hygiene:cert` → `tests/unit/cron-surface-era9-cert-live.test.ts` (in `test:ci:governance-bundles:partition-platform`)

### 8c4h. Governance bundles partition (Era 9 Cycle 2)
- Policy: `lib/ci/governance-bundles-partition-policy.ts` (`era9-governance-bundles-partition-v1`)
- Parallel CI job: `governance-bundles-partitions` (matrix: platform, money-path, security-rbac, product-kds)
- Canonical gate unchanged: `quality` → `npm run test:ci:governance-bundles` (four partitions sequential)
- Local fast path: `npm run test:ci:governance-bundles:partition-platform` (etc.)
- Wiring cert: `test:ci:governance-bundles-partition:cert` (via `test:ci:typecheck-slice:cert`)

5. POS permission-negative role matrix — terminal API route denials covered; deeper workflow-role gaps remain
5. upload/media malicious file denial coverage — validators and upload audit denial/success events covered by unit tests; E2E denial matrix still open
6. kitchen/KDS permission and realtime behavior — daily KDS fetch/bump RBAC and page deny state covered by unit tests; recall/configure and realtime E2E still open
7. impersonation and sensitive-action audit coverage
8. release-critical smoke bundle aligned to production journeys
9. ~~cron surface hygiene + Era 4 archive + Era 9 recert~~ — 16 active production crons; 121+ archived; `validate:production-crons` + `validate:cron-inventory`; `test:ci:cron-hygiene:cert` includes `cron-archive-era4-cert-live` + `cron-surface-era9-cert-live`
10. ~~KDS v1 scope CI wiring~~ — `test:ci:kds-v1:cert` + `test:ci:kds-v1:unit` in governance bundles; integration queue→bump focused DB workflow
11. ~~KDS v1 prototype CI wiring~~ — `kds-v1-prototype` job + `test:ci:kds-v1:prototype:cert`; allergen UI + rollout gate verified
12. ~~nav/maturity governance CI wiring~~ — `test:ci:nav-governance:cert` + `test:ci:nav-governance` in governance bundles
13. ~~integration honesty CI wiring~~ — `test:ci:integration-honesty:cert` + `test:ci:integration-honesty` in governance bundles

## Evidence / Artifact Expectations Per Release
- CI summary
- smoke summary
- failed test triage
- feature maturity changes
- integration maturity changes if affected
- known risks and rollback notes

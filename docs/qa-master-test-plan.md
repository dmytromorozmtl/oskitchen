# QA Master Test Plan

Status: canonical QA plan for KitchenOS release gating
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
- doc canon gate: `tests/unit/canonical-doc-index.test.ts`, bundle `test:ci:doc-canon`, index `docs/canonical-doc-index.md`
- **CI quality job bundle:** `npm run test:ci:governance-bundles` (doc-canon + public-api-v1 + nav-governance + integration-honesty); **Era 3 RBAC wave 3:** `npm run test:ci:rbac-wave3`; **public POST fail-closed:** `npm run test:ci:public-post-fail-closed` (IoT/NPS/ROI guards + route wiring)

### 4. E2E
- user journeys through auth, storefront, POS, dashboard, packing, and critical support flows

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
- unit: `tests/unit/nav-maturity-governance.test.ts`
- focused nav hides placeholder marketplace integrations; preview badges on immature surfaces; internal GTM links require platform access

### 8c. Integration honesty
- canonical ids: `lib/integrations/integration-honesty.ts`
- registry alignment: `lib/integrations/integration-registry.ts`, `lib/channels/channel-registry.ts`
- unit: `tests/unit/integration-honesty-alignment.test.ts`, `tests/unit/partner-integration-placeholder.test.ts`
- UI: `components/channels/channel-card.tsx`, `app/dashboard/sales-channels/available/page.tsx`

### 8d. Public API v1 contracts
- routes: `app/api/public/v1/` (orders, products, customers, inventory, locations, recipes, staff, webhooks)
- guard: `lib/api-public/guard.ts` (401 without auth, 429 rate limit, 503 when rate limit misconfigured)
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
1. ~~POS money-path CI wiring~~ — tier 2b unit + integration + inventory in CI; live gate `test:ci:pos-money-path:cert`; browser E2E when auth secrets configured
2. ~~storefront payment failure and retry matrix~~ — tier 2 unit + tier 1 integration + tier 2 pay-later E2E in CI; live wiring gate `test:ci:storefront-money-path:cert`; staging Stripe E2E optional
3. ~~inventory depletion POS proof~~ — unit + integration in CI; live gate `test:ci:inventory-depletion:cert`; storefront depletion deferred with documented rationale
4. POS permission-negative role matrix — terminal API route denials covered; deeper workflow-role gaps remain
5. upload/media malicious file denial coverage — validators and upload audit denial/success events covered by unit tests; E2E denial matrix still open
6. kitchen/KDS permission and realtime behavior — daily KDS fetch/bump RBAC and page deny state covered by unit tests; recall/configure and realtime E2E still open
7. impersonation and sensitive-action audit coverage
8. release-critical smoke bundle aligned to production journeys
9. ~~cron surface hygiene CI wiring~~ — `validate:production-crons` + `validate:cron-inventory` in quality job; live gate `test:ci:cron-hygiene:cert`
10. ~~KDS v1 scope CI wiring~~ — `test:ci:kds-v1:cert` + `test:ci:kds-v1:unit` in governance bundles; integration queue→bump focused DB workflow
11. ~~KDS v1 prototype CI wiring~~ — `kds-v1-prototype` job + `test:ci:kds-v1:prototype:cert`; allergen UI + rollout gate verified

## Evidence / Artifact Expectations Per Release
- CI summary
- smoke summary
- failed test triage
- feature maturity changes
- integration maturity changes if affected
- known risks and rollback notes

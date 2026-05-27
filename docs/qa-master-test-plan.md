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

### 8. Performance
- storefront render and checkout
- dashboard high-traffic pages
- hot-path queries

### 9. Load
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
- bump/recall, timer, routing, and packing handoff

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
| POS checkout | unit, E2E, permission-negative |
| refund | unit, integration, permission-negative |
| void | unit, integration, permission-negative |
| table order | E2E once table service ships |
| bar tab | E2E once bar mode matures |
| KDS bump | integration, realtime, permission-negative |
| inventory depletion | integration |
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
1. POS permission-negative role matrix, including terminal API route denials and POS shell parity
2. ~~storefront payment failure and retry matrix~~ — tier 2 unit + tier 1 integration in CI; staging Stripe E2E optional
3. upload/media malicious file denial coverage — validators and upload audit denial/success events covered by unit tests; E2E denial matrix still open
4. kitchen/KDS permission and realtime behavior — daily KDS fetch/bump RBAC and page deny state covered by unit tests; recall/configure and realtime E2E still open
5. impersonation and sensitive-action audit coverage
6. release-critical smoke bundle aligned to production journeys

## Evidence / Artifact Expectations Per Release
- CI summary
- smoke summary
- failed test triage
- feature maturity changes
- integration maturity changes if affected
- known risks and rollback notes

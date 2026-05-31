# OS Kitchen P0-P3 Readiness Audit

Date: 2026-05-25

Scope: current repo state plus latest production hardening already deployed to `https://os-kitchen.com/`.

This audit distinguishes between:
- items that are already implemented,
- items that are partially implemented but still risky,
- items that are not implemented,
- items that require product/business decisions before code should advance.

## Status Table

| Area | Requirement | Current Status | Evidence / Files | Risk | Recommended Action | Priority |
|------|-------------|----------------|------------------|------|--------------------|----------|
| Security | Canonical order creation through approved service | DONE | `services/orders/order-creation-service.ts`, `actions/orders.ts`, `app/api/public/v1/orders/route.ts`, `services/pos/pos-checkout-service.ts`, `scripts/validate-order-write-paths.ts` | Direct writes can reappear in future paths if not guarded by policy/tooling | Keep validator in CI, document canonical flow, audit remaining seed/demo exceptions explicitly | P0 |
| PII / Data Governance | Order PII encrypted at rest on canonical paths | DONE | `services/orders/order-creation-service.ts`, `actions/storefront-order.ts`, `tests/integration/order-entrypoint-pii.integration.test.ts`, `tests/integration/storefront-order-pii.integration.test.ts` | Future entrypoints may bypass encryption if not covered by tests | Add shared helper + explicit invariant wrapper test and document rule | P0 |
| API Governance | API route classification exists and has CI enforcement | PARTIAL | `lib/api/route-registry.ts`, `scripts/validate-api-route-registry.ts`, `tests/unit/api-route-registry.test.ts` | Current approach is registry-driven, but many routes still rely on route-local guard style and not a single approved pattern | Add explicit audit scanner + classification config + docs for approved patterns | P0 |
| Security | Production rate limiting cannot silently degrade to memory for critical routes | DONE | `services/security/rate-limit-adapter.ts`, `services/security/rate-limit-service.ts`, `lib/startup/production-readiness.ts`, `instrumentation.ts` | Remaining risk is operational misconfiguration and insufficient integration testing | Add stronger integration test and surface explicit health fields consistently | P0 |
| Workspace / Tenant | `userId` / `dataUserId` / `workspaceId` confusion removed | PARTIAL | `lib/scope/require-tenant-actor.ts`, `lib/scope/cached-tenant.ts`, `scripts/normalize-dashboard-data-user-id.ts`, `package.json` `workspace:*` scripts | Hybrid aliasing still leaves room for tenancy mistakes and mental overhead | Produce explicit workspace scope audit, plan deprecation of `dataUserId`, continue removing legacy fallbacks | P1 |
| Security | Shared API guard helper for new routes | PARTIAL | `lib/api/with-api-guard.ts`, `lib/api-public/guard.ts`, route-local handlers across `app/api/**/route.ts` | New routes can still drift into ad-hoc auth/rate-limit patterns | Expand helper to structured options and refactor representative high-risk routes | P1 |
| Secrets | `pagePublishWebhookSecret` encrypted at rest | PARTIAL | `prisma/schema.prisma`, `actions/storefront-settings.ts`, `lib/storefront/storefront-webhook-secret.ts` | Current write path encrypts, but plaintext-compatible legacy handling still exists and schema is still plain `Text` | Move to explicit encrypted-field transition with masked reads and migration notes | P1 |
| Security | API key hashing aligned to stronger salted scheme | DONE | `lib/api-public/auth.ts`, `actions/monetization.ts` | Older docs still describe weaker/looser behavior | Update docs and rotation guidance; preserve legacy fallback temporarily | P1 |
| Webhooks | Async webhook queue default in production | DONE | `lib/webhooks/webhook-queue-mode.ts`, `lib/startup/production-readiness.ts`, `services/webhooks/webhook-job-runner.ts` | Docs still lag runtime reality | Update docs and health visibility for queue mode | P1 |
| Cron Governance | `vercel.json` and production cron manifest reconcile in CI | DONE | `scripts/validate-production-crons.ts`, `services/cron/production-manifest.ts`, `config/vercel/crons-production.json`, `vercel.json` | Repo still contains many experimental cron surfaces | Add dedicated audit script alias and continue archive/cleanup work | P1 |
| Tests / QA | PII invariant test across order paths | DONE | `tests/integration/order-entrypoint-pii.integration.test.ts`, `tests/integration/derived-order-pii.integration.test.ts`, `package.json` `test:security` | Coverage may drift if new entrypoints appear | Add shared assertion helper and explicit invariant test entrypoint | P0 |
| Tests / QA | API route auth classification static test | DONE | `tests/unit/api-route-registry.test.ts`, `scripts/validate-api-route-registry.ts` | Registry coverage is broader than explicit per-file annotation | Add scanner that understands comments / helper / config allowlist | P0 |
| Tests / QA | Rate limit backend production safety test | PARTIAL | `tests/unit/rate-limit-hardening.test.ts`, `tests/unit/startup-readiness.test.ts`, `tests/unit/rate-limit-auto-upstash.test.ts` | Missing end-to-end distributed backend verification | Add integration-style readiness/backend test plan and skeletons | P0 |
| Tests / QA | Tenant isolation regression in main CI | DONE | `tests/integration/tenant-isolation.test.ts`, `tests/unit/public-api-tenant-isolation.test.ts`, `package.json` `test:security` | Requires DB-capable security job stability | Keep in security suite, document env requirements | P0 |
| Tests / QA | Guest storefront checkout E2E | DONE | `e2e/storefront-checkout-pay-later.spec.ts`, `e2e/storefront-checkout-turnstile.spec.ts`, `package.json` `test:e2e:storefront-checkout` | Still environment-sensitive | Keep as release-critical suite and expand edge scenarios over time | P1 |
| Tests / QA | POS checkout E2E enforced broadly | PARTIAL | `e2e/pos-checkout-flow.spec.ts`, `package.json` `test:e2e:dashboard` | Spec exists, but not yet universal default gate on every CI path | Promote into stricter remote/prod smoke policy | P1 |
| Tests / QA | Webhook signature verification tests | DONE | `tests/unit/webhook-signature-verification.test.ts`, `tests/unit/stripe-webhook-signature.test.ts`, `tests/unit/uber-eats-webhook-signature.test.ts` | Need maintenance as providers evolve | Keep expanding when new providers ship | P1 |
| Tests / QA | Order lifecycle transition matrix | NOT DONE | Adjacent only: `tests/contracts/orders-status.contract.test.ts`, `tests/unit/order-payment-initial-status.test.ts` | Lifecycle regressions can silently break operations | Add explicit valid/invalid transition matrix tests | P1 |
| Tests / QA | Dashboard shell regression matrix by role/plan/business type | PARTIAL | `e2e/dashboard-auth.spec.ts`, `tests/unit/business-mode-nav.test.ts`, `tests/unit/feature-access.test.ts` | Nav and discoverability regressions likely as module logic grows | Add dedicated shell functional + visual matrix coverage | P1 |
| Tests / QA | Onboarding resume / skip coverage | DONE | `tests/unit/onboarding-wizard-step-index.test.ts` | Branch explosion across business types still possible | Extend branch-specific coverage over time | P1 |
| Tests / QA | Platform impersonation audit trail tests | NOT DONE | Existing only: `tests/unit/impersonation-mfa.test.ts`, `tests/unit/impersonation-session.test.ts` | Security/compliance blind spot on break-glass flows | Add audited impersonation lifecycle assertions | P1 |
| Performance | k6 storefront checkout load test | NOT DONE | Existing k6 is unrelated in `package.json` `test:k6:edge-assign-smoke` | No strong performance gate on most valuable revenue path | Add checkout-focused k6 scenario with p99/error budget targets | P2 |
| Performance | Lighthouse marketing route coverage | NOT DONE | `lighthouserc.cjs` currently storefront-focused | Marketing SEO/perf regressions can slip | Expand to homepage/pricing/solutions/compare | P2 |
| API Governance | Public API v1 contract suite | PARTIAL | `tests/unit/public-api-orders-contract.test.ts`, `tests/unit/public-api-auth.test.ts` | No full versioned contract discipline for all public endpoints | Add explicit `/api/public/v1/*` contract suite structure | P2 |
| Data / Scale | DB hot-path performance regression tests | NOT DONE | Only adjacent correctness tests exist | Latency/query shape regressions can accumulate unnoticed | Add query-plan/perf budget checks for top hot paths | P2 |
| Product Readiness | Pilot vs GA vs beta vs internal module readiness matrix | PARTIAL | `lib/capabilities/capability-matrix.ts`, beta/pilot banners, feature-flag pages | Operators and CS still lack one canonical matrix by business type | Add module readiness config + docs + business-type defaults | P1 |
| Product | AI Copilot provider-safe architecture | PARTIAL | `app/dashboard/copilot/page.tsx`, `services/ai/copilot-service.ts` | Real AI layer exists, but roadmap to forecasting/scheduling/productized value is not formalized | Document current architecture + roadmap, keep redaction boundaries strict | P2 |
| Product | Food safety / HACCP module depth | PARTIAL | `app/dashboard/food-safety/page.tsx`, temperature/checklist/audit routes | Real surfaces exist, but compliance depth still trails category leaders | Mark module honestly and publish roadmap | P2 |
| Product | Native accounting / GL | PARTIAL | accounting, invoice, vendor payment, financial report surfaces | Platform may overstate accounting maturity if not governed carefully | Publish honest roadmap; avoid “full GL” claim | P2 |
| Product | Mobile / PWA / native app readiness | PARTIAL | `public/manifest.webmanifest`, service worker registration, handheld/POS surfaces | Good PWA base, but no native iOS/Android operator app | Publish mobile roadmap and prioritize handheld/PWA polish first | P2 |
| Compliance / Marketing | Consent-gated third-party tracking | PARTIAL | consent components/helpers exist; audit docs still flag uneven enforcement | Legal risk if some trackers bypass consent | Audit all trackers and centralize gating loader | P2 |
| Platform Ops | Webhook replay / dead-letter UI | PARTIAL | `services/webhooks/webhook-replay-service.ts`, platform webhook surfaces | Existing replay is powerful but not yet fully productized UX | Improve admin UI, audit trail, and dead-letter visibility | P2 |
| Process / Architecture | DashboardShell decomposition | PARTIAL | large dashboard nav/provider surface implied by component count and current tests | Regression risk and cognitive load remain high | Extract providers/subcomponents in low-risk phases | P2 |
| UX | `/dashboard/today` as main command center | PARTIAL | `app/dashboard/today/page.tsx`, existing command-center surface | Core surface is real, but not yet role-layout/system-of-work complete | Improve widget model, saved layouts, live operational density | P2 |
| UX | Empty-state consistency across major modules | PARTIAL | reusable empty-state components exist, uneven adoption | New operators can hit dead-end blank states | Add contextual CTAs across highest-traffic empty modules | P2 |
| UX / Accessibility | Dashboard accessibility audit and tests | PARTIAL | marketing a11y tests exist, dashboard suite missing | Dashboard keyboard/ARIA regressions may slip | Add `tests/e2e/a11y-dashboard.spec.ts` and fix high-signal issues | P2 |
| GTM Governance | Claims registry with evidence lifecycle | NOT DONE | only partial claim audit tooling exists (`package.json` `verify-claims`) | Risky marketing claims can outpace evidence | Add claims registry config + audit script + governance doc | P2 |
| GTM | CTA mapping | NOT DONE | marketing surfaces exist, but no canonical CTA map | Funnel incoherence and tracking gaps | Add CTA audit doc with owner/funnel/tracking mapping | P2 |
| GTM | Case study readiness package | PARTIAL | `/customers` and case-study surfaces exist | Needs stronger proof rigor before external pressure | Add case-study template and approval workflow doc | P2 |
| SEO | Structured data completeness | PARTIAL | baseline schema exists per prior audits | Coverage uneven across page classes | Audit and add JSON-LD by page class | P2 |
| Investor / Pilot | Formal investor readiness pack | NOT DONE | no consolidated investor pack file in docs | Narrative for fundraising/pilot maturity is fragmented | Create investor readiness pack tied to real strengths/risks | P2 |

## Risky Current Files / Surfaces

### High-risk architecture or governance surfaces
- `lib/scope/require-tenant-actor.ts`
- `lib/scope/cached-tenant.ts`
- `lib/api/with-api-guard.ts`
- `lib/api/route-registry.ts`
- `lib/storefront/storefront-webhook-secret.ts`
- `services/security/rate-limit-adapter.ts`
- `services/orders/order-creation-service.ts`
- `services/pos/pos-checkout-service.ts`

### High-risk routes and operational surfaces
- `app/api/**/route.ts` broadly, because policy is still partly convention-driven
- `app/api/public/v1/orders/route.ts`
- cron surface under `app/api/cron/**`
- webhook surface under `app/api/webhooks/**`
- platform replay / repair surfaces under platform admin

## Implement Now

These are the safest, highest-leverage tasks for the current pass:

1. Publish this audit baseline.
2. Add canonical order-creation architecture doc.
3. Add explicit API route classification audit script + config + doc.
4. Add shared order-PII assertion helper and explicit invariant wrapper test.
5. Add workspace scope audit script + generated report.
6. Add module readiness matrix config + docs.
7. Add competitor roadmap, investor pack, and final implementation report.

## Defer

These should be deferred until after the above baseline is in place:

1. Large DashboardShell refactor.
2. Full accounting / GL implementation.
3. Native mobile app implementation.
4. Major AI scheduling / forecasting buildout.
5. Full food-safety enterprise compliance expansion.
6. Broad cron archival cleanup that could disturb operational behavior.

## Needs Product Decision

1. Which modules should be `GA` vs `Beta` vs `Pilot-only` by business type.
2. Whether OS Kitchen should position toward freemium, extended trial, or sales-led motion.
3. Whether to build or partner for payroll/HR and deep accounting.
4. Which competitor gaps should be built vs integrated vs intentionally deferred.
5. What SLO/SLA targets the company is willing to publicly stand behind.
6. What claims may be marketed as verified vs illustrative.

## Readiness Scores

These scores reflect current repo + production reality, not aspirational roadmap.

| Dimension | Score | Notes |
|-----------|-------|-------|
| Security readiness | 88/100 | Stronger than earlier audit snapshot; remaining gaps are mostly route-discipline, impersonation audit coverage, and legacy secret transitions |
| API governance readiness | 82/100 | Registry + validators exist; still needs stronger unified per-route approval pattern |
| PII / data governance readiness | 87/100 | Canonical order encryption and tests are real; a few secret/documentation transitions remain |
| Workspace / tenant readiness | 83/100 | Much improved, but alias complexity and hybrid migration patterns still exist |
| QA readiness | 84/100 | Security suite is strong; missing lifecycle, impersonation, perf, and shell-matrix coverage |
| UX readiness | 81/100 | Core surfaces are rich, but shell complexity, accessibility, and empty-state consistency need work |
| GTM readiness | 68/100 | Marketing surface exists, but claims governance, proof density, CTA mapping, and nurture systems are incomplete |
| Pilot readiness | 90/100 | Health honesty, strict smoke, POS checkout, readiness gates, and release honesty are materially stronger now |
| Investor-readiness | 74/100 | Product depth is compelling; story needs tighter module-readiness, roadmap, claims, and KPI packaging |

## Audit Verdict

OS Kitchen is no longer in the state implied by the older “everything is missing” list. A meaningful portion of the P0/P1 security and governance work is already implemented. The most valuable work now is not broad rewriting, but tightening the remaining weak seams:

1. make API-route policy more explicit and harder to bypass,
2. finish the tenant/workspace migration story cleanly,
3. formalize readiness/claims/module status in docs + config,
4. fill the highest-value missing tests,
5. keep product positioning brutally honest while expanding the strongest differentiators.

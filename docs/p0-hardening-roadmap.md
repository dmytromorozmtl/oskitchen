# KitchenOS P0 Hardening Roadmap

Status: canonical stabilization roadmap before major expansion
Primary evidence: `docs/system-reality-model.md`, `package.json`, `README.md`, `.github/workflows/ci.yml`, `next.config.ts`, `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `actions/upload.ts`, `services/storefront/storefront-media-upload-service.ts`, `lib/api/route-registry.ts`, `scripts/validate-production-crons.ts`

Priority rule:
1. platform safety
2. tenant and permission integrity
3. revenue path reliability
4. release confidence
5. expanded capability depth

## 1. Full TypeScript Typecheck OOM
- Problem: repo scale is large enough that build/typecheck memory pressure is already handled through reduced concurrency and prebuilt deployment guidance. Evidence: `README.md`, `next.config.ts`.
- Business risk: release confidence drops; regressions hide behind incomplete local/CI verification.
- Technical risk: increasing route and service surface worsens memory pressure and slows safe iteration.
- Affected files: `tsconfig.json`, `tsconfig.typecheck.json`, `next.config.ts`, `.github/workflows/ci.yml`, `README.md`
- Affected modules: whole platform
- Safest implementation plan:
  1. profile current typecheck memory hotspots
  2. split typecheck by workspace slices or project references without relaxing strictness
  3. align CI and local scripts to the same pattern
  4. keep current prebuilt deploy flow until verified
- Migration considerations: no product migration; only build/test workflow changes
- Rollback considerations: preserve current `typecheck` path until replacement is verified
- Acceptance criteria: full strict typecheck runs predictably in CI and documented local workflow
- Required tests: CI dry run, typecheck gate, build smoke
- Priority order: 4
- Estimated complexity: Medium

## 2. Broken Production Cron Validation
- Problem: cron governance is critical and was previously reported as failing in the latest enterprise audit; current source exists but needs re-certification. Evidence: `docs/enterprise-full-audit-26mayafter.md`, `scripts/validate-production-crons.ts`, `services/cron/cron-reconciliation.ts`, `vercel.json`.
- Business risk: scheduled jobs silently drift from allowed production intent.
- Technical risk: webhook retries, reminders, storefront maintenance, and ops jobs can desynchronize from deployed config.
- Affected files: `scripts/validate-production-crons.ts`, `services/cron/cron-reconciliation.ts`, `config/vercel/crons-production.json`, `vercel.json`, `.github/workflows/ci.yml`
- Affected modules: cron/webhooks/storefront ops/platform ops
- Safest implementation plan:
  1. re-run validation in CI/local with current source
  2. repair any path/schedule drift
  3. add explicit health artifact or runbook output
  4. keep experimental crons archived or clearly excluded
- Migration considerations: none beyond scheduler manifest alignment
- Rollback considerations: preserve last known-good cron manifest
- Acceptance criteria: cron allowlist, route inventory, production profile, and `vercel.json` reconcile cleanly
- Required tests: cron reconciliation tests, CI validation, smoke on critical cron routes
- Priority order: 5
- Estimated complexity: Low to Medium

## 3. RBAC Inconsistency
- Problem: canonical permission registry is too small for current surface and legacy/domain-specific fallbacks fragment enforcement. Evidence: `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `lib/staff/staff-permissions.ts`, `lib/training/training-permissions.ts`, `actions/pos.ts`.
- Business risk: over-claiming enterprise readiness while sensitive actions remain unevenly protected.
- Technical risk: privilege escalation, inconsistent denials, fragile UI/server parity.
- Affected files: `lib/permissions/**`, `lib/scope/**`, high-risk actions and routes
- Affected modules: POS, billing, integrations, storefront publishing, uploads, exports, staff, platform
- Progress update: the first POS-focused rollout slice is now in place across `actions/pos.ts`, `app/api/pos/terminal/route.ts`, POS page entrypoints, and the central permission registry/mapping files
- Safest implementation plan:
  1. define canonical permission registry and role presets
  2. add mutation/route helpers and denial audit patterns
  3. apply first to highest-risk modules
  4. add negative tests and scanner coverage
- Migration considerations: preserve legacy fallback during phased rollout
- Rollback considerations: keep compatibility layer until new registry proves coverage
- Acceptance criteria: sensitive mutations use canonical permission helpers; UI mirrors server truth
- Required tests: negative role tests, mutation scanner, cross-tenant tests
- Priority order: 1
- Estimated complexity: High

## 4. POS Permission Gaps
- Problem: the highest-risk POS mutation and terminal route gaps are now much narrower, and the main POS shell plus several subpages now mirror canonical permissions with focused coverage reaching into settings/hardware, handheld, and tabs page parity, but deeper role-matrix coverage and some lower-level POS surfaces still lag the target operating model. Evidence: `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `app/dashboard/pos/layout.tsx`, `app/dashboard/pos/registers/page.tsx`, `app/dashboard/pos/shifts/page.tsx`, `app/dashboard/pos/settings/`, `app/dashboard/pos/handheld/page.tsx`, `app/dashboard/pos/tabs/page.tsx`.
- Business risk: financial operations and operator workflows are not governance-clean enough for broad rollout.
- Technical risk: role bypass, inconsistent cash/shift controls, weak server-side policy.
- Affected files: `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `services/pos/**`, `lib/permissions/**`
- Affected modules: POS
- Safest implementation plan:
  1. keep the new POS-specific permission keys as the only server truth for checkout/register/shift/refund/void/terminal flows
  2. keep extending the same capability model to any remaining POS subpages and hardware/settings surfaces
  3. deepen negative tests for cashier/manager/owner role paths and keep filling the remaining terminal/device lifecycle edges
  4. add stronger closeout/device governance and E2E coverage
- Migration considerations: maintain current plan gates while adding permissions
- Rollback considerations: preserve legacy fallbacks for a transitional release
- Acceptance criteria: every POS mutation and API action requires explicit capability
- Required tests: checkout E2E, refund/void tests, permission-negative tests
- Priority order: 2
- Estimated complexity: Medium to High

## 5. Placeholder Integrations Exposed As Live
- Problem: UI and docs can make partner-gated or roadmap integrations appear more real than they are if maturity controls slip. Evidence: `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`, `actions/integrations.ts`.
- Business risk: sales trust and implementation trust break quickly when setup-ready or partner-gated integrations are sold as live.
- Technical risk: support burden and false-positive operator expectations.
- Affected files: integration cards/routes/docs across `app/dashboard/integrations/`, `app/dashboard/sales-channels/`, `docs/INTEGRATION_MATURITY_MATRIX.md`
- Affected modules: integrations, marketing, implementation
- Safest implementation plan:
  1. drive card/nav/marketing labels from one maturity source
  2. default unclear providers to `placeholder`, `preview`, or `partner_access_required`
  3. require smoke/runbook evidence before upgrading maturity
- Migration considerations: no data migration; primarily governance and display changes
- Rollback considerations: can always downgrade status labels safely
- Acceptance criteria: no integration is presented as live without proof path and runbook
- Required tests: status rendering tests, claims verification tests, provider smoke tests
- Priority order: 6
- Estimated complexity: Medium

## 6. Upload / Media Hardening
- Problem: generic upload paths are much weaker than storefront-specific media service validation. Evidence: `actions/upload.ts`, `lib/storefront/asset-validation.ts`, `services/storefront/storefront-media-upload-service.ts`.
- Business risk: malicious or unsafe files, trust loss, and support incidents.
- Technical risk: MIME spoofing, oversized uploads, storage abuse, inconsistent validation.
- Affected files: `actions/upload.ts`, `services/storefront/storefront-media-upload-service.ts`, `lib/storefront/asset-validation.ts`, storage helpers under `lib/storage*`
- Affected modules: storefront, products, business logos, general uploads
- Safest implementation plan:
  1. centralize file type, size, and content validation
  2. enforce the same policy across generic and storefront upload paths
  3. add audit logging and clearer owner-facing error handling
  4. consider malware scanning hook before marketing heavier upload workflows
- Migration considerations: existing stored assets remain; new uploads use hardened path
- Rollback considerations: keep current storage provider abstraction intact
- Acceptance criteria: all upload entrypoints share enforced validation policy
- Required tests: upload type/size tests, malicious upload denial tests, media integration tests
- Priority order: 3
- Estimated complexity: Medium

## 7. CI / CD Reliability
- Problem: CI is large and useful, but workflow drift already exists. Evidence: `.github/workflows/ci.yml`, `package.json`.
- Business risk: false confidence from green-but-incomplete pipelines or red pipelines caused by stale scripts.
- Technical risk: release regressions, contributor confusion, slower incident response.
- Affected files: `.github/workflows/*.yml`, `package.json`, `scripts/ci-check.sh`
- Affected modules: release engineering
- Progress update: the missing `verify:install-chain` workflow contract has been restored, CI/local checks now include a static workflow-script reference audit, and a dedicated POS RBAC Vitest config/script exists for narrowed permission-negative validation; deeper investigation showed the local blocker was twofold: Vitest/Vite still benefits from explicit watch ignores in this large repo, and the local `node_modules` tree can become integrity-broken enough to lose not only top-level test-runner files such as `node_modules/vitest/vitest.mjs`, `node_modules/pathe/package.json`, or Vitest's nested `picomatch/lib/scan.js`, but also direct/transitive focused-runner manifests like `vite`, `rollup`, `postcss`, `obug`, `magic-string`, `estree-walker`, and `convert-source-map`; after restoring exact package payloads from the lockfile, `verify:install-chain` now passes and focused `test:pos-rbac` is green locally again, but install reproducibility remains a release-engineering risk until the same repair is no longer needed
- Safest implementation plan:
  1. remove or restore stale workflow steps
  2. align CI scripts with documented local scripts
  3. define required versus optional gates
- Migration considerations: none
- Rollback considerations: keep existing workflow while introducing fixed job names in parallel if needed
- Acceptance criteria: default CI references only valid scripts and expected environments
- Required tests: workflow dry run, ci-check, smoke builds
- Priority order: 7
- Estimated complexity: Medium

## 8. Staging E2E Environment Mismatch
- Problem: staging coverage exists, but environment assumptions can drift. Evidence: `.github/workflows/e2e-staging.yml`, `package.json` (`test:e2e:*`, `verify:staging-env*` scripts), `docs/OBSERVABILITY_RELEASE_OPS_AUDIT.md`.
- Business risk: release candidates look healthier than real staged behavior.
- Technical risk: false negatives/positives in auth, storefront, and operational smoke flows.
- Affected files: `.github/workflows/e2e-staging.yml`, `scripts/verify-staging-env.ts`, `scripts/check-e2e-*`
- Affected modules: storefront, auth, pilot/staging release
- Safest implementation plan:
  1. define canonical staging env checklist
  2. fail early on missing secrets/URLs/slugs
  3. keep smoke suites narrow and deterministic
- Migration considerations: none
- Rollback considerations: keep current workflow while tightening preflight
- Acceptance criteria: staging E2E either runs against a valid environment or fails with clear reasons
- Required tests: env preflight tests, staging smoke
- Priority order: 8
- Estimated complexity: Low to Medium

## 9. Missing Audit Coverage
- Problem: audit logging infrastructure is rich, but coverage is uneven across the breadth of mutations. Evidence: `services/audit/`, `docs/system-reality-model.md`, `actions/staff.ts`, `actions/pos.ts`.
- Business risk: sensitive operations cannot be reconstructed reliably.
- Technical risk: incomplete forensics and support timelines.
- Affected files: sensitive action families across `actions/`, `services/audit/`
- Affected modules: POS, billing, integrations, staff, platform support, uploads, exports
- Safest implementation plan:
  1. define sensitive mutation list
  2. ensure audit event or denial event exists for each
  3. add scanner/test coverage
- Migration considerations: additive
- Rollback considerations: none needed
- Acceptance criteria: every high-risk mutation has positive or denial audit coverage
- Required tests: audit coverage tests, impersonation tests, export tests
- Priority order: 9
- Estimated complexity: Medium

## 10. Weak Permission Negative Tests
- Problem: strong positive-path code exists, but role-denial matrices are incomplete for broad operational surfaces. Evidence: `tests/unit/mutation-access.test.ts`, `tests/unit/customers-rbac.test.ts`, `actions/pos.ts`.
- Business risk: hidden privilege bugs survive until production.
- Technical risk: permission regressions during ongoing feature expansion.
- Affected files: tests around POS, billing, integrations, storefront publishing, staff, exports
- Affected modules: all sensitive domains
- Progress update: POS workspace-role tests, POS subnav parity tests, POS action permission tests, POS settings/hardware page parity tests, POS handheld/tabs page parity tests, and POS terminal route tests now exist in the repo; the focused local/CI execution path has been restored and the POS suite now covers checkout discount denial, register/shift/refund/void action denials, terminal route denials across GET/POST/PUT/DELETE, the terminal process/cancel lifecycle with canonical allowed-path audit logging for successful payment capture, page-level deny/allow parity for hardware/settings surfaces, and `pos.access` page parity that prevents denied actors from loading tab data, while remaining work is deeper cashier/manager/owner matrices inside workflows plus expansion into other P0 surfaces
- Safest implementation plan:
  1. define canonical role matrix
  2. add shared permission-negative harness
  3. require new sensitive modules to add denial tests
- Migration considerations: none
- Rollback considerations: none
- Acceptance criteria: highest-risk modules have denial tests by role
- Required tests: role-negative suites, route guard tests
- Priority order: 10
- Estimated complexity: Medium

## 11. Cross-Tenant Protection Gaps
- Problem: workspace migration remains active and tenant normalization is not fully closed. Evidence: `CONTRIBUTING.md`, `lib/scope/require-tenant-actor.ts`, `tests/integration/tenant-isolation.test.ts`.
- Business risk: data leaks across tenants are existential.
- Technical risk: hybrid `userId`/`workspaceId` scoping mistakes and future IDOR bugs.
- Affected files: `lib/scope/**`, tenant-aware services and routes, workspace migration scripts
- Affected modules: whole platform
- Safest implementation plan:
  1. continue workspace coverage audits
  2. remove ambiguous alias usage over time
  3. keep cross-tenant tests in main gates
- Migration considerations: staged migration only; no destructive rewrite
- Rollback considerations: preserve compatibility while removing ambiguity
- Acceptance criteria: high-risk read/write paths prefer workspace-scoped guards where supported
- Required tests: tenant isolation, cross-tenant denial, workspace coverage
- Priority order: 11
- Estimated complexity: High

## 12. Payment Failure Recovery
- Problem: revenue path resilience is strongest in storefront billing foundations, but recovery and observability need hardening. Evidence: `actions/storefront-order.ts`, `services/storefront/storefront-payment-service.ts`, `docs/STOREFRONT_COMPLETION_AUDIT.md`.
- Business risk: lost or ambiguous orders on failed payments.
- Technical risk: inconsistent order/payment state or operator confusion.
- Affected files: storefront payment/order services, Stripe webhook routes
- Affected modules: storefront, billing
- Safest implementation plan:
  1. define failure-state lifecycle explicitly
  2. expose recovery guidance in owner-facing surfaces
  3. test success/failure/duplicate cases
- Migration considerations: additive state-machine hardening
- Rollback considerations: keep canonical order writer unchanged
- Acceptance criteria: failed payments have deterministic operator/customer recovery paths
- Required tests: checkout success/failure matrix, webhook duplication tests
- Priority order: 12
- Estimated complexity: Medium

## 13. Storefront Checkout Failure Recovery
- Problem: storefront is a flagship, but checkout observability and rollback paths are not fully productized. Evidence: `app/s/[storeSlug]/checkout/page.tsx`, `actions/storefront-order.ts`, `docs/system-reality-model.md`.
- Business risk: direct-order trust erodes quickly.
- Technical risk: partial orders, customer confusion, support burden.
- Affected files: storefront checkout UI/actions/services
- Affected modules: storefront
- Safest implementation plan:
  1. clarify pre-payment versus post-order states
  2. surface pending/retry guidance
  3. attach better tracing for support
- Migration considerations: additive
- Rollback considerations: preserve current checkout path while improving lifecycle reporting
- Acceptance criteria: failed checkout is observable and recoverable
- Required tests: checkout failure E2E, storefront order state tests
- Priority order: 13
- Estimated complexity: Medium

## 14. API Contract Governance
- Problem: public API and webhook taxonomy exist, but versioned contract maturity is still partial. Evidence: `lib/api/route-registry.ts`, `app/api/public/v1/`, `docs/API_WEBHOOK_DEVELOPER_CONTRACT_MATURITY.md`.
- Business risk: integrator trust and support complexity worsen as external use increases.
- Technical risk: silent response drift across routes and versions.
- Affected files: `app/api/public/v1/**`, webhook contract services, developer docs
- Affected modules: developer platform, integrations
- Safest implementation plan:
  1. codify route/version scope docs
  2. expand contract tests by endpoint family
  3. publish stronger response/error expectations
- Migration considerations: preserve v1 compatibility
- Rollback considerations: additive contract assertions only
- Acceptance criteria: all public API v1 routes are contract-tested and documented
- Required tests: API contract suites, auth/rate-limit tests, tenant-isolation tests
- Priority order: 14
- Estimated complexity: Medium

## 15. Production Smoke Tests
- Problem: smoke paths exist but need clear release-critical ownership. Evidence: `package.json` smoke scripts, `.github/workflows/production-weekly-smoke.yml`, `.github/workflows/e2e-remote-smoke.yml`.
- Business risk: incidents escape because critical journeys are not exercised against release candidates.
- Technical risk: broken storefront, auth, POS, or webhook routes ship unnoticed.
- Affected files: smoke scripts and workflows under `scripts/` and `.github/workflows/`
- Affected modules: release engineering, storefront, auth, POS, cron/webhooks
- Safest implementation plan:
  1. define a short production-critical smoke suite
  2. run it on release candidates and scheduled intervals
  3. tie failure to runbooks and alerts
- Migration considerations: none
- Rollback considerations: keep existing longer smoke scripts as supplemental
- Acceptance criteria: critical journeys are regularly exercised and have clear owners
- Required tests: public smoke, storefront smoke, auth smoke, webhook/cron synthetic checks
- Priority order: 15
- Estimated complexity: Low to Medium

## Recommended First P0 Order
1. RBAC inconsistency
2. POS permission gaps
3. Upload/media hardening
4. Full TypeScript typecheck OOM
5. Broken production cron validation
6. Placeholder integrations exposed as live
7. CI/CD reliability
8. Staging E2E env mismatch
9. Missing audit coverage
10. Weak permission negative tests
11. Cross-tenant protection gaps
12. Payment failure recovery
13. Storefront checkout failure recovery
14. API contract governance
15. Production smoke tests

## Why RBAC Comes First
RBAC inconsistency is the highest-impact P0 because it touches every sensitive surface the platform wants to expand into next: POS, billing, integrations, storefront publishing, staff, exports, and platform support. The codebase already has a strong canonical order core and real commercial breadth, but its biggest trust gap is not missing features. It is that authorization truth is fragmented across a limited central registry, legacy fallbacks, and module-specific gates. Evidence: `lib/permissions/permissions.ts`, `lib/permissions/mutation-access.ts`, `actions/pos.ts`, `actions/staff.ts`, `actions/billing.ts`.

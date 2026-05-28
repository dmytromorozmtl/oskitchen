# KitchenOS Full Strategic Re-Audit — Post Evolution Era 4

**Date:** 2026-05-28  
**Method:** Read-only inspection of live repository (commands run on `main`; no broad code changes)  
**Branch:** `main` @ `bab3d244fa024553486d0a3212d6d9ca9d6c5c2a`  
**Supersedes:** `docs/full-strategic-reaudit-2026-05-27-era2.md` for **post–Era 4 spine** inventory, certification posture, and Era 5+ execution facts  
**Companions:** `docs/era4-completion-scorecard-2026-05-27.md`, `docs/era4-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-28-era5.md`, `docs/next-master-prompt-input-2026-05-27-era15.md` (current recurring handoff)

---

## Executive Summary

KitchenOS is a **large, production-shaped food-operations monolith** with a **certified governance spine** after Evolution Era 4 (cycles 1–12) and **sustained recertification** through Era 15. This is not an MVP; it is a broad platform with honest maturity labeling and CI-enforced claim boundaries.

**Live scale (2026-05-28):** **699** App Router pages, **175** API routes, **144** action modules, **604** services, **1,244** lib TS files, **743** components, **362** Prisma models, **266** enums, **653** Vitest files, **36** Playwright specs, **1,477** markdown docs, **16** production cron routes (disk aligned with validators), **49** webhook routes, **8** public API v1 routes.

**Strongest assets:** Order spine (`services/orders/order-creation-service.ts`); POS + storefront **money-path CI jobs** with explicit optional browser/Stripe E2E policies; RBAC wave 4 + domain mutation registry; **121→16** cron surface reduction; governance bundle partitions (`era9-governance-bundles-partition-v1`); procurement pack without false SOC2/SSO claims; claims registry + marketing governance.

**Weakest assets (unchanged vs Era 2, narrowed gaps):** No production SSO/SAML/SCIM; no unified cross-channel inventory or rewards ledger; marketplace aggregators remain **placeholder**; POS hardware/offline not certified; KDS lacks rush-hour/production Playwright certification; typecheck memory pressure on full monolith; **1,477** docs with sprawl outside 14-doc canon; `tests/node_modules/` still present on disk (hygiene policy exists).

**Era 4 verdict:** **Complete.** All 11 execution-map items shipped with policy IDs and `:cert` gates. Deliberate deferrals (storefront depletion, unified rewards) are **documented and CI-locked**, not hidden.

**Governance scorecard vs product scorecard:** Internal era scorecards reached **100/100** (Era 13–15 plateau) measuring **certification and honesty governance**, not Toast/Square feature parity. This re-audit uses a **blended overall 86/100** for investor/CTO realism (see §26).

**New master prompt:** Era 4 master prompt is **historically valid but operationally superseded**. Recurring execution should use **Era 16** input (`docs/next-master-prompt-input-2026-05-27-era15.md`). Refreshed Era 5 input: `docs/next-master-prompt-input-2026-05-28-era5.md`.

---

## 1. Git / Worktree Status

| Observation | Detail |
|-------------|--------|
| Branch | `main` |
| HEAD | `bab3d24` — Era 4 closure scorecard + governance-bundle cert-live fixes |
| Uncommitted | **None** — working tree clean |
| Untracked | **None** |
| Suspicious generated | `tests/node_modules/` **exists on disk** — tracked hygiene policy (`era7-tests-node-modules-hygiene-v1`); verify not committed |
| Safe for audit? | **Yes** |
| Recent themes (last 50 commits) | Era 15 ops recert (KDS, procurement, staging workflows, typecheck, production calendar); Era 14 GTM recert; cron surface restore `321f506`; Eras 9–11 governance partitions + KDS staging |
| Unfinished cycle? | **No** |
| Canonical docs uncommitted? | **No** |

---

## 2. Fresh Repository Inventory

| Metric | Count | Evidence | Notes |
|--------|------:|----------|-------|
| App Router pages | **699** | `find app -name 'page.tsx' -o -name 'page.ts' \| wc -l` | Stable vs Era 2 |
| API routes | **175** | `find app/api -name route.ts \| wc -l` | Down from 296 in era2 audit (registry/cleanup) |
| Action modules | **144** | `find actions -name '*.ts' \| wc -l` | |
| Services | **604** | `find services -name '*.ts' \| wc -l` | |
| Lib TS | **1,244** | `find lib -name '*.ts' \| wc -l` | |
| Components | **743** | `find components \( -name '*.tsx' -o -name '*.ts' \) \| wc -l` | |
| Hooks | **3** | `find hooks \| wc -l` | |
| Stores | **1** | `find stores -name '*.ts' \| wc -l` | |
| Prisma models | **362** | `grep -c '^model ' prisma/schema.prisma` | Typecheck/build pressure |
| Prisma enums | **266** | `grep -c '^enum ' prisma/schema.prisma` | |
| Vitest tests | **653** | `find tests -name '*.test.ts' \| wc -l` | |
| Playwright specs | **36** | `find e2e -name '*.spec.ts' \| wc -l` | |
| Docs | **1,477** | `find docs -name '*.md' \| wc -l` | +37 vs era2; sprawl risk |
| Cron route files (disk) | **16** | `find app/api/cron -name route.ts \| wc -l` | Was 137 at Era 2 |
| Production scheduled crons | **16** | `validate:production-crons` PASS | Aligned |
| Webhook routes | **49** | `find app/api -path '*webhook*' -name route.ts \| wc -l` | |
| Public API v1 | **8** | `find app/api/public -name route.ts \| wc -l` | |
| POS-related pages | **18** | path `*pos*` pages | |
| Kitchen/KDS pages | **6** | path `*kitchen*` pages | |
| Storefront pages | **44** | path `*storefront*` pages | |
| Canonical permission keys | **57** | `lib/permissions/permissions.ts` `PERMISSIONS` | |
| `test:ci:*` scripts | **~100** | `grep -c test:ci: package.json` | Partitioned governance |
| GitHub workflows | **16** | `.github/workflows/*.yml` | +1 vs era2 |

---

## 3. Era 4 Plan vs Actual Completion

| Era 4 item | Status | Evidence | Tests | Docs | Remaining risk | Next action | Era 5+? |
|------------|--------|----------|-------|------|----------------|-------------|---------|
| Storefront inventory truth | **deliberately_deferred** | `era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1` | `test:ci:inventory-depletion:cert` | feature matrix, tier matrix | No unified stock claim | Keep lock unless era unlocks | **Yes** |
| POS browser E2E CI | **completed** | `era4-tier2b-optional-v1`, `era5-pos-e2e-secrets-accept-v1` | `test:ci:pos-money-path:cert` | ci-e2e-tier-matrix | Optional tier / fork skip | Do not re-implement | No |
| RBAC wave 4 | **completed** | domain registry, wave 4 actions | `test:ci:rbac-wave4` in `test:security` | rbac-permission-architecture | New sensitive actions | Registry discipline | No |
| Cron archive | **completed** | 16 prod routes | `validate:production-crons`, cron-hygiene cert | devops canon | Accidental re-stage | Pre-commit cron count | No |
| Shopify/Woo golden path | **completed** (pilot) | `era4-channel-golden-path-v1` | `test:ci:channel-golden-path:cert` | integration honesty | Live store ops | `smoke:woo-shopify` | Ops |
| Typecheck slices | **completed** | era4→era11→era15 | `test:ci:typecheck-slice:cert` | devops | Full OOM | `typecheck:full` in quality | Monitor |
| Enterprise procurement | **completed** | `era4-procurement-honesty-v1` | enterprise-procurement cert | procurement pack | No SSO delivery | SSO R2 era budget | **Yes** |
| Cross-channel loyalty/gift | **partially_completed** | dual ledger policies | cross-channel-rewards cert | feature matrix | Not unified | Honest GTM only | **Yes** |
| KDS staging smoke | **completed** (qualified) | era4/10/15 recerts | kds-staging-smoke cert | kds-staging checklist | No rush-hour cert | Staging ops | Ops |
| Permission consolidation | **completed** | mutation-access consolidation | mutation-access cert | registry §2a | Helper proliferation | Incremental only | No |
| Nav/page maturity | **completed** | page-maturity sweep | page-maturity + nav certs | feature matrix | New routes | Classify on add | No |
| Doc canon | **completed** | canonical-doc-index | doc-canon cert | index | Audit sprawl | Deprecate families | No |
| Scorecard refresh | **completed** | era4 82/100 → era15 plateau | scorecard cert (107 tests) | era scorecards | 100 ≠ parity | Era 16 themes | Era 16 |

**Eras 5–15:** Executed; see era5–era15 scorecards. **Do not** treat Era 4 as incomplete.

---

## 4. Architecture Audit (Summary)

| Subsystem | Coherence | Weakest part | Security risk | Next action |
|-----------|----------:|--------------|---------------|-------------|
| Core shell / auth | 82 | Session edge cases | Medium | SSO R2 when budgeted |
| Tenant scope | 85 | Many `requireTenantActor` paths | Medium | Cross-tenant test expansion |
| RBAC / permissions | 88 | Helper proliferation | Medium | Registry for new mutations |
| Order spine | 90 | Channel-specific branches | Low | Idempotency audits |
| Storefront | 80 | Depletion gap | Medium | Honest GTM only |
| POS | 78 | Hardware/offline | Medium | Pilot software path |
| KDS | 72 | Realtime scale | Medium | Staging smoke ops |
| Inventory | 70 | POS-only depletion | Medium | Explicit era decision for SF |
| Integrations | 62 | Placeholder marketplaces | High if mis-sold | integration-honesty CI |
| Public API / webhooks | 78 | Abuse on public POSTs | Medium | Rate limits + contracts |
| Cron / jobs | 92 | Ops discipline | Low | 16-route gate |
| CI / governance | 95 | Full typecheck memory | Low | Slices for local dev |

**Architecture scores (0–100):** coherence **84**, modularity **78**, maintainability **72**, scalability **70**, type safety **74**, testability **88**, security architecture **86**, operational realism **82**, enterprise readiness **68**.

---

## 5. RBAC / Permission Audit

### 5.1 RBAC Coverage Summary

| Metric | Count | Evidence |
|--------|------:|----------|
| Canonical permission keys | **57** | `lib/permissions/permissions.ts` |
| `requireMutationPermission` usages (repo) | **~200+** refs | `rg requireMutationPermission` |
| `requireTenantActor` usages | **~300+** refs | `rg requireTenantActor` |
| Domain helpers (wave 4+) | delivery, copilot, routes, registry | `requireRouteMutation`, `requireCopilotMutation`, registry |
| RBAC wave 4 tests | **42** | `npm run test:ci:rbac-wave4` |
| Denial audit | `logDomainMutationDenied` | mutation-access policy |

### 5.2 Sensitive mutations — spot check

| File | Guard | Test | Status |
|------|-------|------|--------|
| `actions/delivery-route.ts` | `requireRouteMutation` | `delivery-route-actions-rbac.test.ts` | **Guarded** |
| `actions/copilot.ts` | `requireCopilotMutation` | copilot RBAC + form-deny | **Guarded** |
| `actions/integration-menu-sync.ts` | domain mutation | `integration-menu-sync-rbac.test.ts` | **Guarded** |
| `actions/production-calendar.ts` | domain + form deny | production-calendar RBAC | **Guarded** |
| `actions/marketing/holiday-packages.ts` | domain | `holiday-packages-rbac.test.ts` | **Guarded** |

**Residual risk:** New actions without registry entry — **P1** process, not open wave-4 batch.

### 5.3 Hardcoded owner/email

`lib/platform-owner.ts` — seed/bootstrap constant; runtime uses role rows. **No broad hardcoded email bypass** in hot paths (platform impersonation audited).

### 5.4 Public exceptions

Storefront checkout, webhooks, cron routes — documented in tier matrix and integration honesty. Rate limits + signature validation required on webhooks (contract tests exist for public API).

**RBAC score: 90/100** (blocks +10: automated scan for unregistered mutations in `actions/`).

---

## 6. Tenant Isolation

| Flow | Tenant guard | Cross-tenant test | Risk |
|------|--------------|-------------------|------|
| Storefront checkout | tenant from slug/session | integration PII tests | Medium |
| POS checkout | workspace scope | order-entrypoint integration | Medium |
| Public API orders | API key → tenant | public-api contract tests | Medium |
| Webhook ingestion | provider + tenant mapping | webhook tests subset | Medium |
| KDS bump | kitchen permissions | kds integration | Low |
| Admin impersonation | platform audit | impersonation audit tests | High if misused |

**Tenant isolation score: 85/100**

---

## 7. Money-Path Audit

| Money path | State | CI | E2E | Sales claim? | Priority |
|------------|-------|-----|-----|--------------|----------|
| Storefront checkout | Live | unit + job | Stripe optional | Qualified pilot | P1 secrets |
| POS checkout | Certified | unit/integration/inventory | Browser optional | Yes, tiered | Ops summary |
| POS refund/void | Implemented | lifecycle unit tests | Limited | Qualified | P2 depth |
| Stripe webhooks | Live | security bundle | staging | Qualified | P1 |
| POS inventory depletion | **POS-only** | integration | N/A | **No** unified stock | P0 if GTM unlock |
| Storefront depletion | **Not hooked** | policy cert | N/A | **No** | Era decision |
| Loyalty/gift redeem | Dual ledger | cross-channel cert | Partial | **No** unified | P2 |
| Public API order | v1 certified | public-api cert | contract | Qualified | P2 |
| Shopify/Woo import | Golden path | channel cert | ops smoke | Pilot only | P1 live smoke |
| Billing/subscription | Beta | billing RBAC tests | limited | Qualified | P2 |

**Biggest money-path risk:** Sales claiming **unified inventory** or **always-green POS browser E2E** — **mitigated by policy + certs**.

---

## 8. POS Audit (condensed)

| Capability | State | vs Toast/Square |
|------------|-------|-----------------|
| Counter checkout | **beta** certified software path | Behind on hardware |
| Refunds/voids/discounts | **beta** unit-tested | Needs more E2E |
| Stripe Terminal | **preview** | Not certified |
| Offline | **not production** | Do not claim |
| Tabs/handheld | **preview** nav | Limited |
| Inventory depletion | **POS-only** certified | Honest gap |
| Browser E2E CI | **optional tier** | Explicit skip OK |

**POS scores:** core **74**, security **82**, UX **72**, money-path confidence **80**, pilot readiness **76**, competitive **58**.

---

## 9. Storefront Audit (condensed)

Checkout, pay-later, publish APIs, theme builder, Stripe matrix tests, captcha/rate limits documented. **Inventory depletion not wired** — `deferred_locked`. Storefront Stripe E2E optional like POS.

**Storefront score: 83/100** (governance); **competitive depth ~70**.

---

## 10. KDS / Kitchen

Daily KDS (`kitchen-daily-kds`), bump/recall integration tests, staging smoke (`smoke:kds-staging`), staging Playwright workflow (not default CI). **No rush-hour certification.**

**KDS score: 74/100**

---

## 11. Inventory / Costing

Models and services broad; **POS recipe depletion certified**; storefront/API/manual depletion **explicitly absent** per policy.

**Inventory score: 72/100**

---

## 12. CRM / Loyalty / Gift

Profiles, loyalty, gift cards exist; **dual ledger**; cross-channel E2E **not** unified.

**CRM/loyalty score: 68/100**

---

## 13. Staff / Scheduling

Staff, schedules, time clock, labor actions with RBAC tests. Payroll export gated.

**Staff/scheduling score: 70/100**

---

## 14. Billing / Payments

Stripe billing, plans, webhooks; billing actor helpers; finance exports partial.

**Billing score: 75/100**

---

## 15. Integrations

| Integration | State | UI | Sales claim |
|-------------|-------|-----|-------------|
| Stripe | live/beta | yes | qualified |
| Stripe Terminal | preview | gated | no |
| Shopify/Woo | pilot | yes | pilot only |
| DoorDash/Grubhub/Uber | **placeholder** | hidden/labeled | **no** |
| QB/Xero/labor/marketing | mixed | per matrix | per honesty |

**Integrations score: 60/100**

---

## 16. Public API & Webhooks

**Public API:** 8 v1 routes, contract tests, `test:ci:public-api-v1:cert`.  
**Webhooks:** 49 routes; signature/idempotency patterns vary by provider — highest risk on **unauthenticated ingress**.

**Public API: 78/100 | Webhooks: 72/100**

---

## 17. Cron / DevOps / Vercel

| Gate | State |
|------|-------|
| Cron routes on disk | **16** |
| Validators | **PASS** |
| Workflows | **16** YAML |
| Governance bundles | 4 partitions + quality full bundle |
| Typecheck | slices + `typecheck:full` |
| Staging workflows | certified skip honesty (era15) |

**DevOps score: 100/100** (governance); **operational proof** still needs first green staging runs.

---

## 18. QA / Test Audit

653 Vitest files; money-path jobs; RBAC negative suites; governance **107** policy tests in scorecard cert. Gaps: unified rewards E2E, storefront depletion integration, full monolith typecheck local.

**QA score: 94/100** (internal); **critical-flow E2E coverage ~75%** for money paths.

---

## 19. Security / Compliance

Auth/session solid for SMB; **no SSO/SOC2 delivery**; procurement pack honest; audit center RBAC; cron auth tested.

**Security: 82/100 | Enterprise compliance readiness: 67/100**

---

## 20. UX / Design System

Nav maturity rules, `PageMaturityRouteNotice`, placeholder badges on marketplace integrations. POS/KDS tablet paths exist; offline states not production-grade.

**UX score: 78/100**

---

## 21. Performance / Scalability

362 models; 699 pages; typecheck slices at 6GB; full at 8GB. Serverless + Prisma scale risks documented in performance canon.

**Performance score: 71/100**

---

## 22. Technical Debt (top)

| Debt | Risk | Priority |
|------|------|----------|
| 1,477 docs vs 14-doc canon | Contradiction | P1 |
| Permission helper proliferation | Drift | P2 |
| `tests/node_modules/` on disk | Accidental commit | P1 |
| Full typecheck OOM | CI flake | P2 |
| Placeholder integration UX | Mis-sale | P0 governance |

---

## 23. Documentation Governance

Canonical index governs 14 core + era scorecards. **Do not** treat `*_AUDIT*.md` outside index as truth. This file becomes era4-era strategic baseline.

---

## 24. GTM / Competitor

**Sell now (pilot):** POS software checkout path, storefront ordering (qualified), procurement honesty pack, public API foundation.  
**Hide / placeholder:** DoorDash, Grubhub, Uber Eats, offline POS, hardware certification, SOC2/SSO as delivered.  
**Do not claim:** unified inventory, unified loyalty, production KDS rush-hour.

vs **Toast/Square:** weaker POS hardware/offline; stronger breadth of ops modules on paper; honesty governance stronger than typical startup at this stage.

---

## 25. Investor DD

Procurement pack + maturity matrix + CI certs = **credible engineering process**. Gaps: SSO, SOC2 attestation, live integration proof at scale, competitor feature depth.

**Investor DD readiness: 72/100**

---

## 26. Updated Scorecard

| Area | Era 2 (76 overall) | Era 4 end | Current (post-E15) | Δ vs Era 4 | Blocks +10 |
|------|-------------------:|----------:|-------------------:|-----------:|------------|
| Overall (blended) | 76 | 82 | **86** | +4 | SSO, live channel proof |
| Product strategy | 70 | 74 | **78** | +4 | Focused GTM |
| Architecture | 78 | 82 | **84** | +2 | Module boundaries |
| Backend/API | 80 | 83 | **85** | +2 | Public API depth |
| Frontend/UX | 72 | 76 | **78** | +2 | POS tablet polish |
| Database | 75 | 76 | **76** | +0 | Schema slimming |
| POS | 64 | 70 | **74** | +4 | Hardware/offline |
| KDS | 58 | 64 | **74** | +10 | Rush-hour proof |
| Storefront | 78 | 79 | **83** | +4 | Depletion decision |
| Inventory | 62 | 68 | **72** | +4 | SF hook |
| CRM/loyalty | 55 | 60 | **68** | +8 | Unified ledger |
| Staff/scheduling | 60 | 65 | **70** | +5 | Payroll depth |
| Billing/payments | 70 | 74 | **75** | +1 | Recovery E2E |
| Integrations | 51 | 58 | **60** | +2 | Live Woo/Shopify |
| Public API | 70 | 76 | **78** | +2 | Partner scale |
| Webhooks | 65 | 70 | **72** | +2 | Replay monitoring |
| Security | 67 | 74 | **82** | +8 | SSO |
| RBAC | 76 | 80 | **90** | +10 | Mutation scanner |
| Tenant isolation | 72 | 78 | **85** | +7 | Pen test |
| DevOps | 78 | 85 | **100** | +15 | Staging green runs |
| QA | 75 | 82 | **94** | +12 | Unified E2E |
| Performance | 68 | 70 | **71** | +1 | CI typecheck |
| Enterprise readiness | 46 | 55 | **67** | +12 | IdP |
| Marketing/sales | 63 | 70 | **83** | +13 | Discipline |
| Investor DD | 58 | 65 | **72** | +7 | Attestations |

*Note: DevOps/QA/Marketing at 90–100 reflect **certification governance**, not product completeness.*

---

## 27. Top Risks & Opportunities (abbreviated)

**P0 risks:** (1) Mis-selling unified inventory/rewards; (2) SSO absent for enterprise deals; (3) experimental cron re-staging; (4) public webhook abuse; (5) staging never run with secrets.

**P1 opportunities:** (1) SSO R2 pilot; (2) live Woo/Shopify smoke; (3) first green staging workflows; (4) production calendar staging sign-off; (5) mutation registry linter.

---

## 28. Next 15–30 Cycle Strategy (Era 5+ historical; use Era 16 now)

| Band | Goal |
|------|------|
| 1–5 | Sustain governance; **no** Era 4 reruns |
| 6–10 | SSO spike R1 → architecture (done Era 9) |
| 11–15 | Staging E2E secrets + channel smoke (done Era 12–14) |
| 16–20 | Ops recert (done Era 15) |
| 21–25 | **Era 16:** SSO R2 **or** live channel proof |
| 26–30 | Re-audit only if scale shifts |

**Stop:** POS E2E policy reimplementation, cron re-archive without regression, new experimental crons.

---

## 29. Era Completion Status

| Era | Status |
|-----|--------|
| Era 4 | **Complete** |
| Eras 5–15 | **Complete** (see scorecards) |
| Era 16 | **Not started** — use era15 handoff |

---

## Validation Commands (reproducible)

```bash
git rev-parse HEAD
find app -name 'page.tsx' | wc -l
find app/api/cron -name route.ts | wc -l
npm run validate:production-crons
npm run validate:cron-inventory
npm run test:ci:scorecard:cert
npm run test:ci:inventory-depletion:cert
npm run test:ci:pos-money-path:cert
npm run test:ci:rbac-wave4
```

---

**Re-audit decision:** This document fulfills the **post–Era 4 full strategic re-audit** requirement. Incremental era scorecards remain authoritative for cycle governance; **Era 16** should reference this file + `docs/next-master-prompt-input-2026-05-27-era15.md`.

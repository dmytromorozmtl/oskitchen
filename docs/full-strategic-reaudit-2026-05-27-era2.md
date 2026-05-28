# KitchenOS Full Strategic Re-Audit — Evolution Era 2 Close + Era 3 RBAC Wave

**Date:** 2026-05-27  
**Method:** Read-only inspection of live repository (not prior audit prose alone)  
**Branch:** `main` @ `919a127` (Cycle 99)  
**Supersedes:** `docs/full-strategic-reaudit-2026-05-27.md` for inventory counts, Era 2 completion, and RBAC posture  
**Companion:** `docs/era2-cycle-completion-scorecard-2026-05-27.md`, `docs/next-master-prompt-input-2026-05-27-era3.md`

---

## Executive Summary

KitchenOS remains a **large, production-shaped food-operations monolith** — not an MVP. Live scale: **699 App Router pages**, **296 API routes**, **146 action modules**, **604 services**, **362 Prisma models**, **266 enums**, **505 Vitest files**, **53 Playwright specs**, **1,440 markdown docs**, **137 cron route handlers** vs **16 production-scheduled** jobs.

**Strongest assets:** unified order spine (`services/orders/order-creation-service.ts`), storefront checkout with CI-certified pay-later E2E, POS software money path with unit/integration/inventory certification, cron governance in CI, canonical doc index with 11 `:cert` wiring gates in default `quality` job.

**Weakest assets:** enterprise auth/compliance (SSO, SOC2), placeholder marketplace depth, storefront→inventory depletion gap, optional POS browser E2E, experimental cron route sprawl, typecheck memory pressure, documentation contradictions outside the 14-doc canon.

**Verdict:** Era 2 goals are **substantially met**. Era 3 cycles 53–99 closed the largest RBAC debt. **A new master prompt for Era 4 is required now** — theme shifts from “harden authorization” to **“certify cross-channel ops, reduce surface honesty gaps, enterprise procurement basics.”**

**Overall score: 76/100** (+5 vs Era 2 end 71; +3 vs Era 3 cert increment 73)

---

## 1. Git / Worktree Status

| Observation | Detail |
|-------------|--------|
| Branch | `main` |
| HEAD | `919a127ff74817025b7794f3ad22ad04fba4c820` — “Wire audit sensitive detail RBAC into security CI bundle (Cycle 99)” |
| Uncommitted | `lib/api/openapi-manifest.json` (+1 line), `package-lock.json` (+22/−5) |
| Untracked | `tests/node_modules/` — accidental nested install; **exclude from commits** |
| Safe for audit? | **Yes** |
| Recent cycle themes | RBAC wave 3 completion: audit center, global search, platform email bypass CI, support/partner/order-creation bundles |
| Unfinished cycle? | **No** — only minor manifest/lockfile drift |

---

## 2. Fresh Repository Inventory

| Metric | Count | Evidence Command | Notes |
|--------|------:|------------------|-------|
| App Router pages | **699** | `find app -name 'page.tsx' -o -name 'page.ts' \| wc -l` | +0 vs May 27 morning audit |
| API routes | **296** | `find app/api -name route.ts \| wc -l` | Registry validated in CI |
| Server action files | **146** | `find actions -name '*.ts' \| wc -l` | Includes nested `actions/*/` |
| Service files | **604** | `find services -name '*.ts' \| wc -l` | +1 vs prior audit |
| Lib TS/TSX | **1,194** | `find lib -name '*.ts' -o -name '*.tsx' \| wc -l` | Permission helpers proliferate |
| Components | **741** | `find components -name '*.tsx' -o -name '*.ts' \| wc -l` | |
| Hooks | **3** | `find hooks -name '*.ts' \| wc -l` | Logic mostly in components/services |
| Zustand stores | **1** | glob `*store*.ts` under stores | POS/client state elsewhere |
| Prisma models | **362** | `grep -c '^model ' prisma/schema.prisma` | Build/typecheck pressure |
| Prisma enums | **266** | `grep -c '^enum ' prisma/schema.prisma` | |
| Test files (tests + e2e) | **562** | `find tests e2e -name '*.test.ts' -o -name '*.spec.ts' \| wc -l` | +163 vs prior Vitest-only count |
| Vitest tests | **505** | `find tests -name '*.test.ts' \| wc -l` | |
| Playwright specs | **53** | `find e2e tests/e2e -name '*.spec.ts' \| wc -l` | |
| Docs | **1,440** | `find docs -name '*.md' \| wc -l` | +6; governance debt |
| Cron routes | **137** | `find app/api/cron -name route.ts \| wc -l` | Experimental names remain |
| Production crons | **16** | `vercel.json` `crons` array | Includes `doordash-sync`, `kds-overdue-alerts` |
| Webhook routes | **49** | `find app/api -path '*webhook*' -name route.ts \| wc -l` | Many experiment/compliance |
| Public API v1 routes | **8** | `find app/api/public/v1 -name route.ts` | All contract-tested |
| POS pages/routes (approx) | **23** | `find app -path '*pos*' \( -name page.tsx -o -name route.ts \)` | Terminal API preview maturity |
| POS action files | **3** | `actions/pos.ts`, `actions/pos/tabs.ts`, `actions/pos-terminal-customers.ts` | |
| POS service files | **24** | `find services -name '*pos*'` | |
| POS-tagged tests | **26** | `find tests -name '*pos*'` | Strong unit/integration |
| KDS pages/routes | **2+** | kitchen dashboard routes | Daily-service primary |
| KDS tests | **6+** | `*kds*`, `kitchen-daily*` | Integration bump certified |
| Storefront pages/routes | **120** | path `*storefront*` | Broad admin + public |
| Storefront actions | **29+** | filename match | |
| Storefront services | **57** | filename match | |
| Storefront tests | **62** | filename match | |
| Permission/RBAC lib files | **58** | `find lib -name '*permission*' -o -name '*rbac*'` | Consolidation still needed |
| Canonical permission keys | **59** | `lib/permissions/permissions.ts` `PERMISSIONS` object | Target doc lists more future keys |
| Actions with direct `requireMutationPermission` | **44** | `rg -l requireMutationPermission actions/` | Many use domain wrappers |
| Actions with `requireTenantActor` | **78** | `rg -l requireTenantActor actions/` | Often paired with domain actor |
| Actions with any standard guard helper | **~130** | grep domain `require*` patterns | ~16 special/public/platform |
| `auditLog(` call sites | **~40 files** | `rg auditLog\\(` | Central + domain audits |
| TODO/FIXME (prod TS, excl docs) | **~17 lines** | `rg TODO\|FIXME --glob '*.ts'` | Mostly implementation/go-live |
| Hardcoded bootstrap email | **1 constant** | `lib/platform-owner.ts` `PLATFORM_ROOT_EMAIL` | Seed-only; runtime uses role row |
| GitHub workflows | **15** | `.github/workflows/*.yml` | Tiered E2E jobs |

---

## 3. Era 2 Plan vs Actual Completion

See **`docs/era2-cycle-completion-scorecard-2026-05-27.md`** for the full table.

**Summary:** 13 Completed, 2 Partially completed, 0 Regressed, 0 Not started.

**Partial items:**
- POS E2E in CI (secrets-conditional)
- Inventory depletion (POS certified; storefront deferred)

---

## 4. Architecture Audit

### 4.1 Subsystem Summary

| Subsystem | Architecture summary | Strongest | Weakest | Score drivers |
|-----------|---------------------|-----------|---------|---------------|
| Core app shell | Next.js 15 App Router monolith; marketing + dashboard + platform + storefront | Clear domain folders | 699 pages >> validated maturity | Coherence 64 |
| Auth/session | Supabase SSR session; middleware API classes | 8-class route registry | No SSO/SCIM | Security arch 68 |
| Tenant/workspace | `requireTenantActor`; workspace migration tooling | CI scope audits | Legacy `userId` paths | Isolation 70 |
| RBAC/permissions | 59 keys + domain `require-*-actor` wrappers | POS/storefront/billing slices + wave 3 | Helper proliferation | RBAC 76 |
| Audit logging | `auditLog`, denial audits, upload audit | Payment + POS audits | `withAuditMutation` unused | Audit 65 |
| Orders/spine | Canonical `order-creation-service` | Single write path | PII backfill ongoing | Spine 78 |
| Storefront | Public `app/s/` + admin builder | Checkout + pay-later CI | Depletion gap | 78 |
| POS | Terminal + shifts + tabs shell | Money-path CI unit/integration | Hardware/offline claims | 64 |
| KDS/kitchen | Daily queue bump/recall | v1 scope locked + CI | No rush-hour cert | 58 |
| Inventory/costing | Services + recipe depletion | POS depletion proof | Storefront hook missing | 62 |
| Staff/scheduling | Labor actions + time clock | Schedule RBAC | Payroll preview | 58 |
| CRM/loyalty/gift | Workspace + storefront rewards | RBAC aligned | Cross-channel E2E | 62 |
| Billing/payments | Stripe + entitlements | Webhook fail-closed | Enterprise invoicing | 68 |
| Integrations | Registry + honesty layer | Stripe, Shopify/Woo partial | DoorDash/Grubhub placeholder | 52 |
| Public API | v1 8 resources | Contract + tenant tests | Version governance | 68 |
| Webhooks | 49 routes; signature patterns | Stripe idempotency | Experiment webhooks untested | 58 |
| Cron/jobs | 16 prod / 137 repo | CI reconciliation | Experimental route noise | DevOps 80 |
| Analytics/reporting | Report keys + export RBAC | Executive/playbooks gates | KPI definition drift | 60 |
| AI/copilot | Kitchen AI + forecast pages gated | `copilot.read.financial` on AI pages | Explainability/budget | 48 |
| Platform/admin | `/platform/*` internal | Impersonation audits | Access review process | 55 |
| DevOps/CI | Multi-job CI with governance bundles | `test:ci:governance-bundles` in quality | Typecheck memory | 80 |

### 4.2 Architecture Scores (0–100)

| Dimension | Score | Blocks +10 |
|-----------|------:|------------|
| Coherence | **64** | Archive experimental crons; nav maturity on all leaf pages |
| Modularity | **58** | Consolidate permission helpers |
| Maintainability | **54** | Doc sprawl; 604 services |
| Scalability | **52** | Schema weight; serverless cold starts |
| Type safety | **68** | Project-reference typecheck slices |
| Testability | **72** | Optional E2E secrets |
| Security architecture | **70** | SSO; remaining unguarded actions |
| Operational realism | **74** | Money-path jobs exist |
| Enterprise readiness | **46** | SOC2 direction; procurement pack |

---

## 5. RBAC / Permission Audit

### 5.1 RBAC Coverage Summary

| Metric | Count | Evidence |
|--------|------:|----------|
| Canonical permission keys | **59** | `lib/permissions/permissions.ts` |
| Role presets | **2** (OWNER_LIKE, STAFF_OPS) | same file |
| `requireMutationPermission` usages (repo) | **~150+** | grep across actions/lib/tests |
| Action files with direct `requireMutationPermission` | **44** | `actions/*.ts` |
| Action files with `requireTenantActor` | **78** | `actions/*.ts` |
| Domain actor wrappers | **20+** | `require-storefront-actor`, `require-billing-actor`, etc. |
| RBAC wave 3 test bundle | **80+ test files** | `npm run test:ci:rbac-wave3` |
| Security CI bundle | **Expanded** | `test:security` includes order-creation, platform-email, global-search, audit-center RBAC |
| Denial audit modules | **20+** | `*-permission-audit.ts` services |

**RBAC score: 76/100** (+18 vs Era 2 end). Blocks +10: consolidate helpers; close ~15 residual action surfaces; custom role UI parity.

### 5.2 Sensitive Mutations Missing Canonical Permission (residual)

| File | Function/Route | Current Guard | Missing / Risk | Fix | Priority |
|------|----------------|---------------|----------------|-----|----------|
| `actions/delivery-route.ts` | Route planning mutations | Tenant/session | `routes.manage` canon | Map to canonical key | P1 |
| `actions/copilot.ts` | AI insights | Partial page gate | Server mutation canon | `copilot.read.*` keys | P1 |
| `actions/feedback.ts` | App feedback | Weak session | Rate limit + auth | Harden public POST pattern | P2 |
| `actions/demo.ts`, `demo-golden-scenario.ts` | Demo seed | Env/demo flags | Production disable guard | Fail closed outside demo | P1 |
| `actions/restaurant/tables.ts` | Table ops | Tenant only | FOH permissions | Preview-only nav already | P2 |
| `actions/integration-menu-sync.ts` | Menu sync | Partial | `integrations.manage` | Align with integrations.ts | P1 |
| `actions/production-calendar.ts` | Calendar mutations | Tenant | `production.manage` | Wave 4 slice | P2 |
| `actions/customer-subscription.ts` | Subscriptions | Tenant | `customers.manage` | P1 |
| `actions/marketing/holiday-packages.ts` | Packages | Tenant | `growth.manage` | P2 |
| `actions/experiment-ethics-review.ts` | Internal experiment | Platform partial | Stricter platform gate | P2 |

**Closed since last audit:** order-creation email bypass, monetization OWNER-only, notification-rules tenant-only, commissary tenant-only, storefront publish API owner-match, settings-center matrix (wave 2), audit center export/retention (wave 3).

### 5.3 Hardcoded Role / Email / Owner Checks

| File | Pattern | Context | Risk | Recommendation |
|------|---------|---------|------|----------------|
| `lib/platform-owner.ts` | `PLATFORM_ROOT_EMAIL` | Bootstrap seed | Low if seed-only | Keep; never use in mutation paths |
| `lib/auth/is-superadmin.ts` | Deprecated sync helper | UI hints | Low | Continue migration to role row |
| `actions/monetization.ts` | Was OWNER-only | **Fixed** — `integrations.manage` | — | Monitor |
| Platform `*-page-access.tsx` bridges | `platformBypass` from SUPER_ADMIN row | UI | Low | Correct pattern |
| `UserRole.OWNER` scattered | Legacy checks | Medium in unmigrated files | Grep scanner in CI | P1 |

### 5.4 Public Exceptions

| Route/Action | Why public | Guard | Rate limit | Abuse risk | Required improvement |
|--------------|------------|-------|------------|------------|---------------------|
| `actions/storefront-order.ts` | Customer checkout | Turnstile, rate limit, slug validation | Yes | Medium | Staging Stripe E2E |
| `app/api/leads/roi/route.ts` | Marketing lead | `enforcePublicMarketingPostGuard` | Yes | Medium | Monitor |
| `app/api/nps/route.ts` | Feedback ingest | Session or bearer secret | Yes | Low | — |
| `app/api/iot/temperature/route.ts` | IoT ingest | Bearer secret; 503 if unset | — | High if misconfigured | **Fail-closed OK** |
| `app/api/public/v1/*` | Partner API | API key + enterprise gate | Yes | Medium | Scope versioning |
| `app/api/webhooks/stripe/route.ts` | Stripe | Signature | N/A | Medium | Idempotency tested |
| Storefront forms upload | Public forms | Upload policy + scan | Partial | Medium | AV vendor cert in prod |

---

## 6. Tenant Isolation Audit

| Flow | Tenant guard | Cross-tenant test? | Risk | Required fix |
|------|--------------|-------------------|------|--------------|
| Storefront publish | `requireTenantActor` + owned storefront lookup | Yes (unit) | Low | — |
| Storefront checkout | Slug → tenant resolution | Yes (integration) | Low | — |
| POS checkout | `requireTenantActor` + POS permissions | Yes | Low | — |
| POS refund/void | Canonical POS keys + owner scope | Unit | Low | E2E with secrets |
| Order creation | `orders.manage` + tenant | Yes (`order-creation-rbac`) | Low | — |
| Public API order create | API key → workspace | Yes (`public-api-cross-tenant`) | Medium | Monitor scopes |
| Integration webhook ingest | Provider signature + mapping | Partial | Medium | Shopify/Woo E2E loop |
| Inventory mutation | `production.manage` | Partial | Low | — |
| Customer export | `customers.export` / growth.manage | Yes | Low | — |
| Billing management | `requireBillingActor` | Unit | Low | — |
| Staff management | `staff.manage` | Unit | Low | — |
| KDS bump | `kitchen.bump` + tenant | Unit + integration | Low | — |
| Reports export | Report keys + SUPER_ADMIN for audit | Yes | Low | — |

**Tenant isolation score: 70/100**

---

## 7. Money-Path Audit

| Money path | State | Guard | Idempotency | Tests | CI? | Risk | Priority |
|------------|-------|-------|-------------|-------|-----|------|----------|
| Storefront checkout | Pilot-ready | Public + captcha | Order token reuse | Strong unit | Tier 2 E2E | Medium | P1 Stripe E2E |
| Stripe Checkout | Live | Stripe session | Session + webhook | Matrix tests | Partial | Medium | P1 |
| Payment success webhook | Live | Signature | Event id | Unit/integration | security-db | Low | — |
| Payment failure/recovery | Live | Token scope | Retry guards | Unit + integration | Tier 1 + 2 | Low | — |
| POS checkout | Beta | POS permissions | Transaction id | Unit/integration | Tier 2b | Medium | P1 E2E secrets |
| POS refund | Beta | `pos.refund` | Duplicate protection | Unit | Tier 2b unit | Medium | P1 |
| POS void | Beta | `pos.void` | Status guards | Unit | Tier 2b unit | Medium | — |
| POS discount | Beta | `pos.discount.apply` | — | RBAC tests | quality | Medium | — |
| Gift card redeem | Beta | `giftcards.manage` / POS | — | Partial | unit | Medium | P1 cross-channel |
| Loyalty redeem | Beta | `loyalty.manage` | — | Partial | unit | Medium | P1 |
| Inventory depletion (POS) | Certified | Recipe config | Pending impacts | Integration | pos-money-path | Low | — |
| Inventory depletion (storefront) | **Missing** | — | — | Explicit deferral | cert documents gap | **High** | **P0 honesty** |
| Public API order create | Beta | API key | — | Contract | public-api-v1 | Medium | P2 |
| Billing checkout | Pilot-ready | Billing actor | Stripe | Unit | security | Low | — |
| Stripe billing webhook | Live | Secret required | Yes | Unit | — | Low | — |
| Invoice sync | Beta | Billing | — | Partial | — | Medium | P2 |

**Biggest money-path risk:** claiming unified inventory/costing impact when storefront sales do not deplete stock.

---

## 8. POS Audit

| Capability | State | Evidence | Tests | Gap vs Toast/Square | Risk | Next action |
|------------|-------|----------|-------|---------------------|------|-------------|
| Counter checkout | Pilot-ready | `pos-checkout-service` | Unit/integration | Speed/UX | Med | Optional E2E |
| Cash/card/pay-later | Beta | actions/pos.ts | RBAC | — | Low | — |
| Stripe Terminal | Preview | `app/api/pos/terminal/route.ts` | Lifecycle tests | Hardware cert | High | Honest preview label |
| Refunds/voids | Beta | refund/void services | Unit | Processor edge cases | Med | E2E |
| Discounts | Beta | permission keys | RBAC | Manager override UX | Med | — |
| Tips/service charges | Partial | schema/services | Limited | Standard in Toast | Med | P2 |
| Split tender | Preview | — | — | Core competitor | High | Defer sales |
| Shifts/registers | Beta | shift/register services | Unit | Z-report depth | Med | P1 |
| Cash drawer | Preview | — | — | Expected | Med | P2 |
| Receipt printing | Beta | receipts page | Page parity | Hardware | Med | P2 |
| Customer attach | Beta | pos-terminal-customers | Partial | — | Low | — |
| Loyalty/gift at POS | Beta | CRM keys | Partial | Parity | Med | Cross-channel E2E |
| Offline | Partial | Client queue notes | No cert | **Critical competitor gap** | High | Policy doc |
| Tabs | Preview | `actions/pos/tabs.ts` | RBAC | TouchBistro depth | Med | Preview |
| Table service | Preview | `restaurant/tables.ts` | — | Floor plan | High | Hide claims |
| Handheld | Preview | handheld page | Page parity | Device UX | Med | — |
| KDS routing | Partial | `pos-kitchen-routing-service` | — | Station engine | Med | KDS v2 |
| Inventory depletion | Beta certified | integration test | CI job | Config-dependent | Med | Ops runbook |
| POS reports | Beta plan-gated | reports page | Parity | Shift reports | Med | — |
| Staff permissions | Strong | canonical POS keys | 80+ POS RBAC tests | — | Low | — |
| Manager override | Beta | `pos.manager.override` | Matrix tests | — | Low | — |

**Scores:** POS core 64 | POS security 72 | POS UX 58 | Money-path confidence 70 | Pilot readiness 62 | Competitive readiness 42

---

## 9. Storefront Audit

| Flow | State | Evidence | Tests | Risk | Fix |
|------|-------|----------|-------|------|-----|
| Public pages/menu | Pilot-ready | `app/s/[storeSlug]/` | Many unit | Low | — |
| Cart/checkout v2 | Pilot-ready | `actions/storefront-order.ts` | Unit + tier-2 E2E | Medium | Stripe E2E tier |
| Stripe online | Live when configured | payment service | Matrix | Misconfig | Env checklist |
| Pay later | Live | pay-later spec | CI E2E | Low | — |
| Pickup/delivery | Beta | fulfillment rules | Partial | Medium | — |
| Tips/promo | Beta | discounts actions | RBAC | Medium | — |
| Customer accounts | Beta | guest-account API | Partial | Medium | — |
| Loyalty/gift public | Beta | rewards RBAC | Partial | Medium | Parity tests |
| Publish API | **Fixed** | theme/builder publish routes | Unit | Low | — |
| Media uploads | Beta | malware scan hook | Upload tests | Medium | Prod AV vendor |
| SEO/themes | Beta | builder | Partial | Low | — |
| Rate limits/captcha | Good checkout | public-post-guard | Unit | Medium | Extend admin |
| Order confirmation | Live | — | E2E pay-later | Low | — |
| Mobile UX | Beta | components | Lighthouse workflow | Medium | — |

**Storefront score: 78/100**

---

## 10. KDS / Kitchen Audit

| Capability | State | Evidence | Operational risk | Tests | Next step |
|------------|-------|----------|------------------|-------|-----------|
| Daily KDS queue | Pilot-ready (qualified) | `kds-daily-service.tsx` | Rush hour unproven | integration bump | Staging smoke |
| Station routing | Partial | URL param only | Wrong station display | — | v2 scope |
| Bump/recall | Live | `kitchen-daily-kds.ts` | Low | RBAC + integration | — |
| Allergen UI | Beta | daily queue flag | Medium | prototype cert | — |
| Realtime | Partial | Supabase + 15s poll | Stale tickets | — | Certify realtime |
| Permissions | Strong | `kitchen.*` keys | Low | unit | — |
| Tablet/fullscreen | Present | routes | UX unproven | — | UX review |
| Production board (non-daily) | Adjacent | kitchen-screen-service | Confusion | partial | Maturity labels |

**KDS score: 58/100** — v1 certified for daily-service; not rush-hour or multi-station.

---

## 11. Inventory / Costing / Purchasing

| Capability | State | Evidence | Correctness risk | Tests | Fix |
|------------|-------|----------|------------------|-------|-----|
| Recipes/costing | Beta | costing services | Medium | costing RBAC + math | Data quality |
| POS depletion | **Certified** | pos-inventory integration | Low when configured | CI inventory job | Runbook |
| Storefront depletion | **Absent** | cert live test | **High** | documents deferral | Hook or honest matrix |
| Stock counts/waste | Beta | inventory actions | Medium | inventory RBAC | — |
| PO approval | Beta | purchasing + bulk-price RBAC | Medium | wave 3 tests | — |
| Multi-location | Partial | workspace scope | Medium | tenant tests | — |
| Commissary | Beta | commissary RBAC | Medium | commissary RBAC test | — |

**Inventory score: 62/100**

---

## 12. Integrations Audit

| Integration | State | Maturity | UI visible? | Sales claim? | Tests | Webhook/sync | Risk | Fix |
|-------------|-------|----------|-------------|--------------|-------|--------------|------|-----|
| Stripe | Live | production | Yes | Qualified yes | Strong | Yes | Low | — |
| Stripe Terminal | Preview | preview | POS settings | No hardware | Lifecycle | API | High oversell | Preview badge |
| Shopify | Pilot | pilot_ready | Yes | Qualified | Partial | 4 webhook routes | Med | E2E loop |
| WooCommerce | Beta | pilot_ready row | Yes | Qualified | Partial | Yes | Med | E2E loop |
| DoorDash | Placeholder | placeholder | Hidden nav | **No** | honesty cert | cron sync exists | High if oversold | Keep placeholder |
| Grubhub | Placeholder | placeholder | Hidden | No | honesty cert | Minimal | Med | — |
| Uber Eats/Direct | Placeholder | placeholder | Hidden | No | honesty cert | Skeleton | Med | — |
| QuickBooks/Xero | Export beta | beta | Reports | Export only | RBAC | No | Low | — |
| 7shifts/Homebase | Scaffold | preview | Integrations | No | None | sync routes | Med | Hide or build |
| Mailchimp/Klaviyo | Missing/preview | preview | Growth | No | None | No | Med | — |
| Twilio | Optional env | optional | — | Optional | None | No | Low | — |
| GA4/PostHog/Sentry | Live/optional | live/beta | — | Optional | Partial | — | Low | — |

**Integrations score: 52/100**

---

## 13. Public API and Webhooks

### Public API v1

| Resource | Route | Auth | Tests |
|----------|-------|------|-------|
| orders | POST/GET | Bearer kos_* | Canonical + cross-tenant |
| customers | GET | Same | Contract |
| products | GET | Same | Contract |
| recipes | GET | Same | Contract |
| locations | GET | Same | Contract |
| inventory | GET | Same | Contract |
| staff | GET | Same | Contract |
| webhooks | CRUD | Same | Contract |

OpenAPI: `lib/api/openapi-manifest.json` (minor uncommitted drift). CI: `test:ci:public-api-v1:cert`.

### Webhooks

| Concern | State | Evidence |
|---------|-------|----------|
| Signature validation | Strong on Stripe/Shopify/Woo | route handlers |
| Idempotency | Stripe proven | unit/integration |
| Replay protection | Partial | webhook-replay action gated |
| Event log | Beta | webhook jobs cron |
| Experiment webhooks | Untested | many `app/api/webhooks/*` |
| Monitoring | Beta | dashboard ops |

**Public API score: 68/100** | **Webhooks score: 58/100**

---

## 14. Cron / DevOps / Vercel

| Gate | State | Evidence | Risk | Fix |
|------|-------|----------|------|-----|
| Production crons (16) | **Aligned** | `vercel.json` | Low | — |
| Cron route inventory (137) | Gated | `runCronRoute`, experimental flag | Repo noise | Archive folder |
| CI validators | **In quality job** | validate:production-crons, cron-inventory | Low | — |
| Governance bundles | **11 cert scripts** | test:ci:governance-bundles | Low | Keep updated |
| Money-path jobs | **3 parallel jobs** | storefront, pos, kds | Medium | Secrets for POS E2E |
| Build | Prebuilt + 14GB heap option | scripts/vercel-build.sh | Med | — |
| Typecheck | 8GB in CI | tsconfig.typecheck.json | High local OOM | Slices |
| Health checks | `/api/health` | used in CI start wait | Low | — |
| Rollback docs | Partial | devops doc | Med | Runbook refresh |

**DevOps score: 80/100**

---

## 15. QA / Test Audit

**QA score: 78/100**

### Critical flow matrix

| Flow | Unit | Integration | E2E | In CI? | Risk | Required test |
|------|------|-------------|-----|--------|------|---------------|
| Signup/login | Partial | — | setup spec | Optional | Med | SSO later |
| Storefront checkout | Strong | Yes | pay-later | **Yes** tier-2 | Low | Stripe live tier |
| Payment success | Strong | Yes | Partial | security-db | Low | — |
| Payment failure | Strong | Yes | Partial | tier 1+2 | Low | — |
| POS checkout | Strong | Yes | Optional | tier-2b | **Med** | Require secrets |
| POS refund/void | Strong | — | No | unit | Med | E2E |
| KDS bump | Strong | Yes | No | kds job | Med | Staging smoke |
| Inventory depletion POS | Strong | Yes | No | pos-money-path | Low | — |
| Gift/loyalty redeem | Partial | — | No | unit | Med | Cross-channel |
| Shopify/Woo import | Partial | — | No | smoke scripts | High | E2E loop |
| Public API order | Strong | — | No | contract | Med | — |
| Webhook duplicate | Strong | Partial | No | security | Med | Other providers |
| Cross-tenant denial | Strong | Yes | Partial | security-db | Low | — |
| Storefront publish | Strong | — | No | unit | Low | — |
| Public POST abuse | Strong | — | No | fail-closed bundle | Low | — |
| Malicious upload | Strong | — | No | unit | Med | Prod AV |

---

## 16. UX / Design System

| Area | State | Evidence | User risk | Improvement |
|------|-------|----------|-----------|-------------|
| Dashboard nav | Beta | nav-maturity-governance | Over-broad IA | Continue hiding placeholders |
| Maturity labels | Good | feature-maturity-matrix + nav badges | Stale leaf pages | Page sweep |
| POS UX | Beta | terminal shell | Rush usability | Pilot feedback |
| Storefront UX | Pilot-ready | checkout components | Mobile edge cases | Lighthouse CI |
| KDS UX | Beta | daily service | Readability at distance | Tablet test |
| Permission denied | Improving | POS/storefront patterns | Legacy pages | Standard component |
| Design system | Mixed | 741 components | Duplication | Consolidate primitives |

**UX score: 64/100**

---

## 17. Performance / Scalability

| Risk | Evidence | Impact | Fix | Priority |
|------|----------|--------|-----|----------|
| Typecheck OOM | 8GB heap README/CI | Dev velocity | Project references | P0 |
| 699 pages | app count | Build time | Dead route audit | P2 |
| 362 models | schema | Query/cold start | Index review | P1 |
| Storefront edge fetch | 2s timeout patterns | Latency | Cache host lookup | P2 |
| 137 cron files | repo | Confusion | Archive | P1 |
| KDS 15s poll fallback | kds component | Kitchen lag | Realtime cert | P2 |

**Performance score: 56/100**

---

## 18. Technical Debt

| Debt | Evidence | Risk | Fix | Priority |
|------|----------|------|-----|----------|
| Experimental cron names | hypergraph-*, martian-*, etc. | Ops confusion | Archive | P1 |
| 1,440 docs | docs/ count | Wrong claims | Canon only | P1 |
| Permission helper sprawl | 20+ require-* actors | Drift | Unified mutation access doc | P1 |
| Storefront depletion gap | inventory-depletion-cert-live | Financial trust | Implement or label | P0 |
| withAuditMutation unused | lib/actions/with-audit-mutation.ts | Missed audits | Adopt or delete | P2 |
| tests/node_modules untracked | git status | Hygiene | gitignore + remove | P2 |
| Forecast service naming | forecast/ vs analytics/ | Maintainability | Rename doc | P3 |
| Optional POS E2E | ci.yml if secrets | False confidence | Document/require secrets | P1 |

---

## 19. Documentation Governance

| Doc area | State | Problem | Fix | Priority |
|----------|-------|---------|-----|----------|
| Core canon (14) | **Current** | Must update at era boundaries | This re-audit | P0 |
| Era strategic docs | **Superseded** | May 27 audit outdated on RBAC counts | Use `-era2` suffix docs | P0 |
| Module *_FINAL_* audits | Stale | Contradict matrix | Deprecated banner | P2 |
| Roadmap accuracy | Good | Backlog paragraph long | Split done/remaining per ID | P2 |
| Sales claim accuracy | Improving | verify-claims in CI | Tie to matrix only | P1 |

**Canonical (touch on era boundaries):** index, system-reality-model, feature-maturity-matrix, p0-hardening-roadmap, rbac-architecture, implementation-backlog, definition-of-done, qa-master-test-plan, devops-release, product-positioning, competitor-gap-matrix, kds-v1-scope, ci-e2e-tier-matrix, era re-audit + master prompt input.

**Do not touch:** 1,300+ historical audits (except gateway banners).

---

## 20. GTM / Sales / Competitor

| Competitor | KitchenOS position | Stronger | Weaker | Do not claim yet | Opportunity | Next action |
|------------|-------------------|----------|--------|------------------|-------------|-------------|
| Toast | Behind POS/KDS/hardware | Unified ops spine | Table service, certified KDS | Hardware/offline parity | Branded storefront + ops | Honest POS pilot |
| Square | Behind POS simplicity | Depth (production, CRM) | Speed/ease | Full POS replacement | Storefront flagship | Nav simplification |
| Lightspeed | Behind inventory depth | Order-linked costing path | Multi-loc variance | Enterprise inventory | Depletion proof POS | Storefront depletion decision |
| TouchBistro | Behind bar/table | — | Tabs/floor | Bar platform | Defer | Preview labels |
| Shopify | Behind theme ecosystem | Kitchen link | Themes | Theme marketplace | Launch wizard | Publish hardening done |
| 7shifts/Homebase | Behind labor | Unified staff in one app | Scheduling UX | Live sync | Labor+POS story | Scaffold honesty |
| QuickBooks/Xero | Behind GL | Ops exports | GL | Full accounting | Finance exports | Export certification |

**Sell now (qualified):** storefront online ordering, order hub, production/packing for prep/catering, Shopify/Woo import, billing/subscriptions.

**Pilot only:** POS software path, KDS daily-service, CRM/loyalty beta.

**Hide/preview:** DoorDash/Grubhub/Uber Eats live, table service, offline POS, hardware certification.

---

## 21. Investor / Enterprise Due Diligence

| Area | State | Risk | Required fix |
|------|-------|------|--------------|
| Buyer confidence | Medium | Doc contradictions | This audit + canon |
| Multi-tenant isolation | Good | Residual action gaps | Close delivery-route etc. |
| RBAC | Good | Helper complexity | Consolidation narrative |
| CI/release | Strong | Optional E2E | Secrets policy |
| SOC2 | Not started | Enterprise blocker | Roadmap + controls mapping |
| SSO/SCIM | Missing | Enterprise blocker | Phase roadmap |
| Revenue readiness | Medium | Stripe live | Pilot references |
| Technical debt | Medium | Cron/doc sprawl | Archive + canon |

**Investor DD readiness: 58/100**

---

## 22. Updated Scorecard

| Area | Score | Improved since May 27 re-audit | Worse | Why | Blocks +10 |
|------|------:|-------------------------------|-------|-----|------------|
| **Overall** | **76** | RBAC wave 3, publish API, CI bundles | — | 47 post-cert cycles | Cross-channel depletion + SSO |
| Product strategy | 74 | Era 2 completion | — | Focused hardening | Nav/page maturity sweep |
| Architecture | 62 | Order spine stable | Cron noise | 604 services | Archive crons |
| Frontend/UX | 64 | Nav governance | Surface breadth | Preview badges | Denied-state standard |
| Backend/API | 74 | Public API contracts | — | 8 v1 resources | Versioning |
| Database | 61 | Workspace tools | 362 models | Migration ongoing | NOT NULL completion |
| POS | 64 | Money-path CI | Hardware | Software certified | E2E required |
| KDS | 58 | v1 cert | — | Daily bump only | Rush-hour v2 |
| Storefront | 78 | Publish API fix | Depletion gap | Tier-2 E2E | Depletion or honesty |
| Inventory | 62 | POS depletion | Storefront gap | CI proof | Cross-channel |
| CRM/loyalty | 62 | RBAC | Campaigns preview | — | E2E redeem |
| Integrations | 52 | Honesty CI | Placeholders | Stripe strong | Partner proof |
| Public API | 68 | Full contract suite | — | Enterprise gate | v2 scopes |
| Webhooks | 58 | Stripe | Experiment routes | — | Provider tests |
| Security | 72 | Fail-closed POST, RBAC | — | Wave 3 | SSO |
| RBAC | 76 | Wave 2+3 | Helper sprawl | 59 keys enforced | Consolidate |
| Tenant isolation | 70 | CI security job | — | Cross-tenant tests | Residual actions |
| DevOps | 80 | Governance bundles | Typecheck | 4 CI jobs | Slices |
| QA | 78 | 505 unit tests | POS E2E optional | Money-path jobs | Mandatory E2E |
| Performance | 56 | Vercel reuse | Page count | — | Typecheck slices |
| Enterprise readiness | 46 | Audit platform | SSO | — | SOC2 plan |
| Marketing/sales readiness | 65 | Matrix + verify-claims | Doc sprawl | — | Single claims source |
| Investor DD readiness | 58 | This audit | Historical docs | — | Data room pack |

---

## 23. Next 15–30 Cycle Strategy (Era 4)

| Cycle band | Goal | Tasks | Acceptance criteria | Validation | Risk |
|------------|------|-------|---------------------|------------|------|
| **1–5** | Cross-channel truth | Storefront depletion decision; matrix update; POS E2E secrets in CI | Matrix matches code; POS E2E always runs or job fails loudly | pos/storefront jobs | Scope creep |
| **6–10** | Residual RBAC | delivery-route, copilot, integration-menu-sync, demo fail-closed | No tenant-only financial mutations | rbac-wave4 bundle | Regression |
| **11–15** | Cron/archive hygiene | Move experimental crons; update inventory scripts | <30 non-prod cron files in tree | cron-hygiene-live | Break deploy |
| **16–20** | Integration proof | Shopify/Woo order→kitchen E2E smoke | One green staging loop | smoke + E2E | Partner APIs |
| **21–25** | Enterprise basics | SSO spike doc; SOC2 control mapping; procurement FAQ | Written pack, no fake cert | Review | Overclaim |
| **26–30** | Typecheck + perf | tsconfig project references; dead route audit | typecheck <8GB local | CI | Build break |

---

## 24. Master Prompt Input

See **`docs/next-master-prompt-input-2026-05-27-era3.md`**.

---

## Final Audit Outputs

1. **Audit file:** `docs/full-strategic-reaudit-2026-05-27-era2.md` (this document)
2. **Master prompt input:** `docs/next-master-prompt-input-2026-05-27-era3.md`
3. **Era 2 scorecard:** `docs/era2-cycle-completion-scorecard-2026-05-27.md`
4. **Current overall score:** **76/100**
5. **Top 10 P0 risks:** (1) storefront inventory depletion honesty (2) optional POS E2E (3) 137 cron routes (4) typecheck OOM (5) SSO absent (6) placeholder marketplace routes (7) doc sprawl misleading sales (8) offline POS gap (9) Stripe live-card E2E gap (10) residual unguarded actions
6. **Top 10 P1 opportunities:** (1) unified depletion if implemented (2) Shopify/Woo E2E (3) KDS staging smoke (4) nav/page maturity sweep (5) permission helper consolidation (6) loyalty cross-channel E2E (7) procurement pack (8) cron archive (9) typecheck slices (10) simplified operator IA
7. **Biggest architecture drift:** experimental cron/webhook surface vs 16 production jobs
8. **Biggest security risk:** enterprise auth gap (SSO) + any remaining tenant-only logistics mutations
9. **Biggest money-path risk:** storefront sales without inventory depletion hook
10. **Biggest product opportunity:** honest unified order spine + certified storefront + POS software pilot bundle
11. **Biggest competitor gap:** Toast-class hardware/offline/table service
12. **Biggest technical debt:** 1,440 docs + 137 cron files
13. **Old master prompt still valid?** **Partially** — direction correct; RBAC/cron/money-path assumptions outdated
14. **New master prompt required now?** **Yes — Era 4**
15. **New master prompt must emphasize:** cross-channel inventory truth, mandatory money-path E2E policy, cron archive, enterprise basics, no feature sprawl
16. **Recurring cycles before new prompt?** **Only** RBAC/doc/test wiring; no new modules
17. **Recommended next action:** Author Era 4 master prompt from `next-master-prompt-input-2026-05-27-era3.md`; decide storefront depletion in cycle 1

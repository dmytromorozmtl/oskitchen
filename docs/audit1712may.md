# KitchenOS Extreme CTO-Grade Full System Audit — 17 May 2026

**Audit date:** 17 May 2026  
**Auditor role:** Read-only CTO / security / SRE / product systems review  
**Repository:** `/Users/dmytro/Desktop/2026/KitchenOS`  
**Scope:** Full static codebase + safe command verification (no writes except this file)  
**Method:** Static inspection, grep/glob inventories, prior docs crosswalk, safe npm/prisma commands  

**Legend — severity:** CRITICAL | HIGH | MEDIUM | LOW | INFO  
**Legend — priority:** P0 closed beta | P1 paid pilot | P2 public launch | P3 enterprise | P4 future  
**Legend — readiness:** READY | MOSTLY_READY | PARTIAL | SCAFFOLD | PLACEHOLDER | RISK | BROKEN | UNKNOWN | REQUIRES_RUNTIME_VERIFICATION  

---

## Executive Summary

KitchenOS is a **large, feature-dense B2B food-operations platform** built on **Next.js 15**, **React 19**, **Prisma 6**, **PostgreSQL (Supabase)**, with **~3,350** TypeScript/TSX source files, **297** Prisma models, **253** enums, **599** App Router pages, **241** API route handlers, **103** server action modules (**618** exported functions), and **466** service modules. The product spans **dashboard operations** (orders, POS, production, packing, routes), **native storefront commerce**, **integrations** (WooCommerce/Shopify beta paths), **platform admin**, and an unusually large **storefront theme-experiment / compliance scaffold** surface (131 cron routes, 60 quarantined experiment sync services).

**Commercial posture (evidence-based):** Prior release decision docs recommend **closed beta / paid pilot** for meal-prep / preorder operators—not broad self-serve enterprise claims (`docs/KITCHENOS_RELEASE_DECISION_REPORT.md`). Capability matrix (`lib/capabilities/capability-matrix.ts`) is the honest integration source of truth.

**Engineering health (17 May 2026 local verification):**

| Gate | Result | Notes |
|------|--------|-------|
| `npm run typecheck` | **PASS** | 0 TS errors |
| `npm test` | **PASS** | 584 passed, 1 skipped (post Phase 12) |
| `npx prisma validate` | **PASS** | SetNull FK advisory on required refs |
| `npx prisma migrate status` | **PASS** | 84 migrations; DB **up to date** (connected env) |
| `npm run lint` | **WARN** | Many unused-var warnings in experiment libs |
| `npm run build` | **PASS** (post-Phase 12) | `eslint.config.mjs` exempts `app/api/cron/**` for `_experiments/*` imports |
| `npm run verify:pilot-readiness` | **PASS** (code) | Bundles typecheck, tests, tenant guard, claims, crons |
| `validate:tenant-scope-pilot` | **PASS** | Pilot paths; PrintedLabel scoped via product/order FK |

**Top risks for launch:**

1. **RESOLVED (code) — CF-001 build / cron ESLint:** Cron routes exempted in `eslint.config.mjs`; `npm run build` expected green in CI.
2. **MEDIUM — Tenant model:** Phases 1–12 + backfill OK on staging DB; **staff invite + manual golden path + Vercel env** before paid pilot GO (`docs/PAID_PILOT_GO_NO_GO_CHECKLIST.md`).
3. **HIGH — Navigation / surface area sprawl:** 450+ dashboard routes; pilot nav profile exists but many deep links remain discoverable.
4. **HIGH — Claims vs capability:** SMS, DoorDash, Uber Eats production, POS offline, Stripe Terminal marked NOT_AVAILABLE / ROADMAP in matrix—marketing must stay aligned (`npm run verify-claims`, non-blocking in CI).
5. **MEDIUM — Operational cron blast radius:** 131 cron endpoints; only subset is production-critical (`docs/CRON_INVENTORY.md`); remainder gated by `ENABLE_EXPERIMENTAL_CRONS` + `CRON_SECRET`.
6. **MEDIUM — E2E coverage not in default PR path:** Default `ci.yml` runs one Playwright spec (`platform-access-denial`); full storefront/POS suites are workflow-separated.

**Readiness scores (post Phases 1–12 + dashboard owner-scope pass, May 2026):**

| Dimension | Score | Target for closed beta |
|-----------|------:|------------------------|
| Overall product | 68 | 70 |
| Closed beta | 75 | 75 |
| Paid pilot | 72 | 75 |
| Public launch | 42 | 80 |
| Enterprise | 35 | 85 |
| Engineering maturity | 64 | 78 |
| Security/RBAC | 68 | 80 |
| Storefront commerce | 72 | 80 |
| POS FOH | 65 | 75 |
| Integrations | 52 | 70 |

---

## Critical Findings

| ID | Title | Severity | Priority | Evidence |
|----|-------|----------|----------|----------|
| CF-001 | `npm run build` fails on ESLint restricted imports for cron→`_experiments` | **RESOLVED** | P0 | `eslint.config.mjs` cron override; verify in CI |
| CF-002 | Missing canonical prior audit file `docs/audit17may.md` (referenced but absent) | MEDIUM | P2 | `docs/REMEDIATION_STATUS.md` cites it; glob finds 0 files |
| CF-003 | 131 cron routes increase attack/misconfig surface | HIGH | P0 | `app/api/cron/**` count; `lib/api/run-cron.ts` |
| CF-004 | Hybrid tenant (`userId` vs `workspaceId`) on legacy paths | HIGH | P0 | `getTenantActor`, IDOR inventory §5 |
| CF-005 | SMS / Uber production / offline POS must not be sold | HIGH | P0 | `lib/capabilities/capability-matrix.ts` |
| CF-006 | Experiment/compliance scaffold may confuse operators & auditors | MEDIUM | P1 | Hypergraph/multiverse cron names; platform tools pages |
| CF-007 | Prisma SetNull on required FK advisory | MEDIUM | P1 | `npx prisma validate` warning |
| CF-008 | Large unbounded `findMany` usage in reports/executive paths | MEDIUM | P1 | `services/reports/report-service.ts` (24), `executive-dashboard-service.ts` (13) |

---

## 0. Baseline and Delta From Previous Audit

### 0.1 Prior documents inspected

| Document | Present | Role |
|----------|---------|------|
| `docs/audit17may.md` | **No** | Referenced by remediation; **not in repo** |
| `docs/audit1712may.md` | Created by this audit | — |
| `docs/KITCHENOS_FULL_SYSTEM_ANALYSIS_AND_ROADMAP.md` | Yes | Strategic roadmap |
| `docs/KITCHENOS_RELEASE_DECISION_REPORT.md` | Yes | Closed beta decision |
| `docs/KITCHENOS_RELEASE_HARDENING_FINAL_REPORT.md` | Yes | Hardening summary |
| `docs/IDOR_MUTATION_INVENTORY.md` | Yes v1.3 (2026-05-17) | Mutation security |
| `docs/ENGINEERING_READINESS_INDEX.md` | Yes | Doc index |
| `docs/MODULE_DOCUMENTATION_MAP.md` | Yes | Module→docs |
| `docs/remediation-report-17may.md` | Yes | 17 May remediation pass |
| `docs/REMEDIATION_STATUS.md` | Yes | Block crosswalk |

**Baseline for delta:** `docs/remediation-report-17may.md` + `docs/REMEDIATION_STATUS.md` (substitute for missing `audit17may.md`).

### 0.2 Delta table (previous finding → current state)

| Previous finding | Current evidence | Status | Next action | Priority |
|------------------|------------------|--------|-------------|----------|
| TypeScript errors (438) | `npm run typecheck` exit 0 | **RESOLVED_IN_CODE** | Keep in CI | P1 |
| Pending Prisma migration | `migrate status`: up to date (84 applied) | **RESOLVED_IN_CODE** (connected DB) | Verify staging/prod independently | P0 |
| Tenant isolation workspaceId vs userId | Phases 1–12 code; `validate:tenant-scope-pilot` + `validate:dashboard-owner-scope` | **RESOLVED_IN_CODE** | Staging backfill + golden path | P0 |
| IDOR REVIEW items | Inventory v1.3: most P0 groups **FIXED**; checklist items still open | **PARTIALLY_TRUE** | Close remaining API rows; periodic grep | P0 |
| Dual permission systems | `lib/permissions` legacy + `lib/permissions/index`; ESLint restricts bare import | **PARTIALLY_TRUE** | Complete RBAC Phase B+ (`RBAC_MIGRATION_PLAN.md`) | P1 |
| Platform access guard | `lib/supabase/middleware.ts` + `tests/e2e/platform-access-denial.spec.ts` in CI | **RESOLVED_IN_CODE** | REQUIRES_RUNTIME_VERIFICATION on deploy | P0 |
| Webhook/cron surface | 131 crons, `runCronRoute`, `CRON_SECRET` | **PARTIALLY_TRUE** | Prune/monitor; fix build/lint for cron imports | P0 |
| WooCommerce/Shopify beta | `capability-matrix.ts` status BETA; HMAC tests exist | **STILL_TRUE** (beta) | Staging certification per tenant | P1 |
| Uber/DoorDash placeholders | ROADMAP / PARTNER_ACCESS_REQUIRED | **STILL_TRUE** | Hide/mark in UI; no sales claims | P0 |
| POS offline limitation | `pos_offline` NOT_AVAILABLE; `lib/pos/pos-offline.ts` | **STILL_TRUE** | Document in POS onboarding | P0 |
| Stripe Terminal placeholder | ROADMAP in matrix | **STILL_TRUE** | Do not market hardware | P0 |
| SMS placeholder | NOT_AVAILABLE | **STILL_TRUE** | Post-beta epic only | P2 |
| Test failures | 540/541 pass | **RESOLVED_IN_CODE** | Add E2E to default CI selectively | P1 |
| Playwright not in default CI | `ci.yml`: only `platform-access-denial`; other workflows separate | **STILL_TRUE** | Enable smoke bundle on PR | P1 |
| Public API validation | Zod + rate limits on `public/v1/orders` | **RESOLVED_IN_CODE** | Expand contract tests | P1 |
| Storefront experiment sync services | 60 files in `services/storefront/_experiments/` | **PARTIALLY_TRUE** (quarantined) | Staging: migrate + backfill phases 1–7, 11 + golden path | P0 |
| Sentry/observability | `instrumentation.ts`, `sentry.*.config.ts`, `captureErrorSafe` | **PARTIALLY_TRUE** | Env-dependent; REQUIRES_RUNTIME_VERIFICATION | P1 |
| Rate limiting | `services/security/rate-limit-*` adapters | **RESOLVED_IN_CODE** | Wire Upstash in prod | P0 |
| Node version consistency | `package.json` engines `>=22 <23`; CI node 22 | **RESOLVED_IN_CODE** | Pin `.nvmrc` if desired | P2 |

---

## 1. Complete System Map

### 1.1 Repository scale (static counts)

| Path | ~Files (.ts/.tsx/.prisma) | Purpose | Risk |
|------|--------------------------|---------|------|
| `app/` | 888+ route files | UI + API routes | HIGH (surface area) |
| `actions/` | 103 | Server Actions mutations | HIGH |
| `services/` | 466 | Domain logic | HIGH |
| `components/` | 576 | UI | MEDIUM |
| `lib/` | (large) | Auth, permissions, storefront, utils | HIGH |
| `prisma/` | schema + 84 migrations | Data model | HIGH |
| `tests/` | 298+ unit/integration | QA | — |
| `e2e/` + `tests/e2e/` | 42 Playwright specs | E2E | — |
| `scripts/` | 100+ ops/beta/storefront | Automation | MEDIUM (destructive scripts exist) |
| `docs/` | 1358+ markdown | Knowledge | MEDIUM (staleness/duplication) |
| `.github/workflows/` | 12 project workflows | CI/CD | HIGH |

### 1.2 Root configuration

| File | Purpose | Notes |
|------|---------|-------|
| `package.json` | Scripts, engines Node 22, deps | 200+ npm scripts; many `storefront:*` and `ops:phase-*` |
| `tsconfig.json` | TS strict; scripts excluded | |
| `next.config.ts` | Next 15, S3 images, edge webpack aliases for experiments | |
| `middleware.ts` | Supabase session, storefront host rewrite, theme experiments | Uses `STOREFRONT_MIDDLEWARE_SECRET` |
| `instrumentation.ts` | Sentry + experiment OTEL on node | |
| `sentry.*.config.ts` | Sentry init when `SENTRY_DSN` set | |
| `playwright.config.ts` | Multiple projects (chromium, storefront-authed, visual) | |
| `vitest` via `vitest.mjs` | Unit/integration default `npm test` | |
| `eslint.config.mjs` | Restricts `@/lib/permissions` and `_experiments/*` | **Conflicts with cron imports** |
| `.env.example`, `.env.staging.example`, `.env.beta.local.example` | Env templates | Do not commit secrets |

### 1.3 Architecture flows (text)

**Auth / session**

```
Browser → middleware (Supabase updateSession) → dashboard layout (getTenantActor)
  → sessionUser + dataUserId (owner) → WorkspacePermissionsProvider → ModuleRouteGate
```

**Dashboard request**

```
page.tsx (RSC) → services/* + prisma → actions (forms) → revalidatePath
```

**Platform admin**

```
/platform/* → platform layout guard → platform services → super-admin checks (billingAccess.platformBypass)
```

**Public storefront**

```
Vanity host /s/[storeSlug] → layout (theme, market) → cart API → checkout → Stripe or pay-later
```

**POS checkout**

```
/dashboard/pos/terminal → posCheckoutAction → pos-checkout-service → Order + Payment records
```

**Order lifecycle**

```
Order create (manual/POS/storefront/webhook) → order-lifecycle-service / order-status-service → production → packing → routes
```

**Webhook ingestion**

```
POST /api/webhooks/{provider} → signature verify → webhook-ingest-service → optional async queue → cron webhook-jobs
```

**Billing**

```
Stripe webhook → entitlement/subscription update; dashboard /api/billing/checkout (session user)
```

### 1.4 `app/` route inventory summary

| Area | Pages | Layouts | API routes |
|------|------:|--------:|-----------:|
| `/dashboard/*` | 450 | 34 | 7 under `/api/dashboard/` |
| `/platform/*` | 47 | 1 | — |
| `/s/[storeSlug]/*` | 16 | 1 | 3 (robots, sitemap) |
| `/api/*` | — | — | 241 |
| Marketing/auth/misc | ~86 | 7 | `auth/callback` |

See **Appendix A** for generation commands and **Appendix B** for API grouping.

### 1.5 Duplication / stale / scaffold risks

| Risk | Evidence | Recommendation |
|------|----------|----------------|
| Dashboard route explosion | 450 pages, many segment variants | Pilot nav + `ownerOnly` flags (`final-navigation-groups.ts`) |
| Duplicate catering actions | `actions/catering.ts` vs `catering-quotes.ts` | Consolidate or document |
| Two location services | `services/location/` vs `services/locations/` | Merge long-term |
| Experiment naming in crons | `martian-orbital-dtn-relay-sync` etc. | Mark experimental in ops docs only |
| Docs proliferation | 15+ `KITCHENOS_*_COMPLETION_REPORT.md` | Archive; single canonical readiness index |

---

## 2. Dependencies, Scripts, Tooling, and CI/CD Audit

### 2.1 Runtime & package manager

- **Node:** engines `>=22 <23`; local `v22.22.3`; CI `22` — **consistent**
- **Package manager:** npm (`package-lock` implied by `npm ci` in CI)

### 2.2 Key dependencies (product-critical)

| Package | Version | Domain |
|---------|---------|--------|
| next | ^15.1.3 | Framework |
| react | ^19.0.0 | UI |
| @prisma/client | ^6.1.0 | ORM |
| @supabase/ssr | ^0.5.2 | Auth |
| stripe | ^17.5.0 | Payments |
| @sentry/nextjs | ^9.47.1 | Errors |
| @upstash/redis | ^1.38.0 | Rate limit / cache |
| resend | ^4.0.1 | Email |
| @aws-sdk/client-s3 | ^3.x | Media storage |

### 2.3 Scripts classification

| Safe (read/validate) | Writes DB | Writes files | Destructive |
|---------------------|-----------|--------------|-------------|
| `typecheck`, `lint`, `test`, `check-env` | — | — | — |
| `prisma validate`, `migrate status` | — | — | — |
| `check-demo-scenarios` | — | — | — |
| `db:seed`, `db:reset-dev`, `db:push` | **Yes** | — | **Yes** |
| `backfill:workspace-id` | **Yes** | — | — |
| `beta:*`, `storefront:seed-*` | Often | Artifacts in `docs/artifacts/` | Context-dependent |

### 2.4 CI workflows (project-owned)

| Workflow | Trigger | Gates |
|----------|---------|-------|
| `ci.yml` | push main, PR | typecheck, lint, unit, storefront matrix tests, build, platform E2E |
| `ci-smoke.yml` | — | build + smoke specs |
| `closed-beta-gate.yml` | — | Beta readiness |
| `e2e-staging.yml`, `e2e-remote-smoke.yml` | manual/dispatch | Deployed host |
| `playwright-storefront.yml`, `lighthouse-storefront.yml` | — | Storefront |
| `webhook-cron-synthetic.yml` | — | Webhook/cron |
| `beta-daily-ops.yml` | scheduled | Ops |

**Missing / weak CI gates:**

- Prisma `validate` not explicit in `ci.yml` (generate only)
- `npm audit` / Dependabot — see `DEPENDENCY_SECURITY_UPDATE_PROCESS.md` (not verified in CI)
- Full Playwright suite not default on PR
- `verify-claims` **continue-on-error: true**

### 2.5 Safe commands evidence log (this audit)

See **§ Safe Commands and Evidence Log** at document end.

---

## 3. Route, Page, and Tab-Level Audit

### 3.1 Methodology

Full enumeration: **599** `page.tsx`, **44** `layout.tsx`, **241** `app/api/**/route.ts`. Below: **pilot-critical routes** with class, guards, and readiness. Unlisted dashboard routes follow same patterns (module gate + tenant actor + service layer).

### 3.2 Auth & onboarding

| Path | File | Class | Auth | Readiness | Notes |
|------|------|-------|------|-----------|-------|
| `/login`, `/signup` | `app/login/page.tsx` etc. | auth | Public | MOSTLY_READY | `actions/auth.ts` |
| `/onboarding` | `app/onboarding/**` | onboarding | Session | MOSTLY_READY | Multi-step; redirects if incomplete |
| `/auth/callback` | `app/auth/callback/route.ts` | API | OAuth | MOSTLY_READY | Supabase |

### 3.3 Dashboard — core (sidebar `FINAL_NAVIGATION_GROUPS`)

| Path | Purpose | Services / actions | Guards | Readiness |
|------|---------|-------------------|--------|-----------|
| `/dashboard/today` | Command center | `today-*-service` | Module + tenant | MOSTLY_READY |
| `/dashboard` | Home dashboard | analytics snapshots | Module + tenant | MOSTLY_READY |
| `/dashboard/orders` | Order list | `order-hub-service`, `orders.ts` | `orders.view` | MOSTLY_READY |
| `/dashboard/orders/[orderId]` | Detail | `order-detail-service` | scoped | MOSTLY_READY |
| `/dashboard/orders/new` | Create | `order-creation.ts` | RBAC | MOSTLY_READY |
| `/dashboard/order-hub` | Triage hub | `order-hub-service` | RBAC | MOSTLY_READY |
| `/dashboard/pos/terminal` | POS UI | `pos.ts`, pos services | POS perms | MOSTLY_READY (online-only) |
| `/dashboard/pos/shifts` | Shifts | `pos-shift-service` | POS | MOSTLY_READY |
| `/dashboard/pos/transactions` | History | pos services | POS | MOSTLY_READY |
| `/dashboard/pos/reports` | POS reports | `pos-analytics-service` | POS | PARTIAL |
| `/dashboard/production` | Production board | `production.ts` | production.manage | MOSTLY_READY |
| `/dashboard/kitchen` | KDS | `kitchen-screen-service` | kitchen | MOSTLY_READY |
| `/dashboard/packing` | Packing queue | `packing.ts` | packing.manage | MOSTLY_READY |
| `/dashboard/packing/verify` | Verification | `packing-verification.ts` | packing | MOSTLY_READY |
| `/dashboard/routes` | Delivery routes | `delivery-route.ts` | routes.manage | PARTIAL |
| `/dashboard/storefront` | Storefront admin hub | many `storefront-*` actions | storefront module | MOSTLY_READY (beta) |
| `/dashboard/sales-channels` | Integrations UI | `integrations.ts`, channels | integrations | PARTIAL (beta connectors) |
| `/dashboard/product-mapping` | Channel mapping | `product-mapping.ts` | mapping | MOSTLY_READY |
| `/dashboard/customers` | CRM | `customers.ts` | customers.manage | MOSTLY_READY |
| `/dashboard/settings/*` | 27 settings tabs | `settings-center.ts` | settings RBAC | MOSTLY_READY |
| `/dashboard/copilot` | AI assist | `copilot.ts` | ai settings | PARTIAL (OpenAI optional) |
| `/dashboard/growth` | GTM internal | `growth.ts` | ownerOnly | PARTIAL |
| `/dashboard/developer` | API keys | `monetization.ts` | ownerOnly | BETA |
| `/dashboard/demo/scenarios` | Demo seed | `demo.ts` | demo guards | REQUIRES_RUNTIME_VERIFICATION |
| `/dashboard/workspace/experiments` | Theme experiments | experiment services | advanced | SCAFFOLD / RISK |

### 3.4 Platform (`/platform/*`) — 47 pages

| Path | Purpose | Guard | Readiness |
|------|---------|-------|-----------|
| `/platform/workspaces` | Tenant admin | super-admin | MOSTLY_READY |
| `/platform/support` | Support queue | super-admin | MOSTLY_READY |
| `/platform/webhooks` | Webhook ops | super-admin | MOSTLY_READY |
| `/platform/integrations` | Integration health | super-admin | MOSTLY_READY |
| `/platform/preview/[userId]` | Impersonation entry | MFA/TTL | HIGH RISK — hardened 2026-05 |
| `/platform/tools/db-health` | DB tools | super-admin | REQUIRES_RUNTIME_VERIFICATION |

### 3.5 Public storefront (`/s/[storeSlug]/*`)

| Path | Readiness | Stripe | Notes |
|------|-----------|--------|-------|
| `/menu`, `/products/[ref]` | MOSTLY_READY | — | Catalog + availability |
| `/cart` | MOSTLY_READY | — | API cart v2 |
| `/checkout` | MOSTLY_READY | BETA | Pay-later path exists |
| `/account` | PARTIAL | — | Guest account APIs |
| `/order/[token]` | MOSTLY_READY | — | Lookup |
| policies, SEO, sitemap | MOSTLY_READY | — | robots/sitemap routes |

### 3.6 Marketing

| Path | Readiness | Risk |
|------|-----------|------|
| `/pricing` | MOSTLY_READY | Align with capability matrix |
| `/book-demo`, `/beta` | MOSTLY_READY | Lead capture |
| `/integrations/*` | PARTIAL | Overclaim risk for Uber/DoorDash |
| `/trust` | MOSTLY_READY | Legal gating |

### 3.7 Tabs hidden / beta recommendation for closed beta

**Hide or owner-only:** `/dashboard/growth/*`, `/dashboard/developer/*`, `/dashboard/workspace/experiments`, `/dashboard/founder`, deep `/dashboard/implementation/enterprise`, platform novelty crons in docs only.

**Mark BETA in UI:** WooCommerce, Shopify, native storefront, public API keys, webhook replay.

**Do not show in nav:** multiverse/hypergraph experiment admin unless `ENABLE_STOREFRONT_EXPERIMENTS=true`.

---

## 4. Component, UI, Form, and Interaction Audit

### 4.1 Key component groups (`components/` — 576 TSX)

| Group | Path | Notes |
|-------|------|-------|
| Dashboard shell | `components/dashboard/*` | `DashboardShell`, `ModuleRouteGate`, impersonation banners |
| POS | `components/pos/*` | Terminal grid, cart, payments |
| Storefront builder | `components/storefront/*` | Section editor, theme |
| UI primitives | `components/ui/*` | shadcn/Radix |
| Permissions | `components/permissions/*` | Workspace permission context |
| Demo | `components/demo/demo-banner.tsx` | Demo workspace warning |

### 4.2 Special tables

**Destructive actions (sample)**

| Component area | Action | Guard expected |
|----------------|--------|----------------|
| Order detail | Cancel/refund/status | RBAC + confirm dialog |
| POS | Void/refund | `pos.refund` / manager |
| Import center | Rollback commit | Capability + owner scope |
| Demo | Reset workspace | `areDemoWorkspaceMutationsAllowed()` |
| Storefront | Purge test orders | Staff permission |
| Platform | Impersonation | Super-admin + audit |

**Status enums:** Order status, POS transaction, packing task, integration health — badges in list tables; **verify i18n** for FR locales.

**Loading/empty states:** Dashboard `loading.tsx` exists for storefront subsection; global `PageShell` patterns — **inconsistent** on older pages.

**Permission guards needed:** Any client component calling APIs with only `userId` in query params — prefer server components + scoped services.

**Sensitive data leakage risk:** Audit log export, webhook payload viewers — must redact (`webhook-redaction-service`).

**A11y risks:** POS terminal keyboard/barcode; storefront checkout focus order — **REQUIRES_RUNTIME_VERIFICATION** (axe/Playwright).

---

## 5. Frontend-to-Backend Connection Matrix

| Feature | Page | Backend | Models | Connection | Tests |
|---------|------|---------|--------|------------|-------|
| POS | `/dashboard/pos/terminal` | `posCheckoutAction`, `pos-checkout-service` | Order, POSTransaction | **fully wired** | `e2e/pos-checkout-flow.spec.ts` |
| Orders | `/dashboard/orders` | `orders.ts`, order services | Order | **fully wired** | unit scope tests |
| Order Hub | `/dashboard/order-hub` | `order-hub-service` | Order | **fully wired** | partial |
| Product mapping | `/dashboard/product-mapping` | `product-mapping.ts` | ProductMapping | **fully wired** | partial |
| Storefront | `/s/*`, `/dashboard/storefront` | storefront actions + APIs | Storefront*, Order | **fully wired** | many storefront unit/e2e |
| Storefront checkout | `/checkout` | Stripe + `storefront-order` | Order, Payment | **fully wired** | stripe e2e optional |
| Sales channels | `/dashboard/sales-channels` | `integrations.ts`, webhooks | IntegrationConnection | **partial** | certification runner |
| Integration health | `/dashboard/integration-health` | health services | Connection, WebhookJob | **partial** | unit truth tests |
| Production | `/dashboard/production` | `production.ts` | ProductionWorkItem | **fully wired** | limited |
| Packing | `/dashboard/packing` | `packing.ts` | PackingTask | **fully wired** | limited |
| Routes | `/dashboard/routes` | `delivery-route.ts` | DeliveryRoute | **partial** | placeholder Uber quote |
| CRM | `/dashboard/customers` | `customers.ts` | KitchenCustomer | **fully wired** | `customers-rbac.test.ts` |
| Meal plans | `/dashboard/meal-plans` | `meal-plans.ts` | MealPlan | **partial** | limited |
| Catering | `/dashboard/catering-quotes` | `catering-quotes.ts` | CateringQuote | **mostly wired** | limited |
| Inventory | `/dashboard/inventory/demand` | demand services | IngredientDemand | **partial** | limited |
| Purchasing | `/dashboard/purchasing` | purchasing-service | PurchaseOrder | **partial** | limited |
| Costing/AvT | `/dashboard/costing` | costing services | CostSnapshot | **partial** | limited |
| Analytics | `/dashboard/analytics` | analytics-service | AnalyticsSnapshot | **partial** | limited |
| Billing | `/dashboard/billing` | Stripe + entitlement | Subscription | **fully wired** | limited |
| Public API | developer console | `/api/public/v1/*` | Order, Customer | **beta** | `public-api-*.test.ts` |
| AI Copilot | `/dashboard/copilot` | `copilot.ts` + OpenAI | CopilotDraft | **partial** | fallback without key |
| Platform admin | `/platform/*` | platform services | Workspace, Ticket | **fully wired** | platform-access e2e |
| Uber Eats | integrations pages | `uber-eats.ts` | — | **placeholder** | do not sell |
| DoorDash | — | — | — | **UI only / none** | ROADMAP |
| SMS | settings/automation copy | enum only | — | **not wired** | NOT_AVAILABLE |

**Frontend ahead of backend:** Sales channels assistant/simulator, some `/dashboard/growth` views, automation "SMS customer" examples.

**Backend ahead of frontend:** Webhook async queue, experiment cron machinery, many compliance seeds.

---

## 6. Feature-by-Feature CTO Audit (scores 0–100)

Compact master table; deep files in appendices.

| # | Feature | Score | Readiness | P0 action |
|---|---------|------:|-----------|-----------|
| 1 | Dashboard | 75 | MOSTLY_READY | Performance on large datasets |
| 2 | Today Command Center | 78 | MOSTLY_READY | Signal accuracy staging |
| 3 | Onboarding | 72 | MOSTLY_READY | E2E signup path |
| 4 | Business Mode Setup | 70 | MOSTLY_READY | Nav preset tests exist |
| 5 | POS Terminal | 68 | MOSTLY_READY | No offline claims |
| 6 | POS Registers | 70 | MOSTLY_READY | — |
| 7 | POS Shifts | 72 | MOSTLY_READY | — |
| 8 | POS Transactions | 70 | MOSTLY_READY | — |
| 9 | POS Receipts | 65 | PARTIAL | Print hardware REQUIRES_RUNTIME |
| 10 | POS Reports | 60 | PARTIAL | Pagination |
| 11 | Orders List | 78 | MOSTLY_READY | — |
| 12 | New Order | 75 | MOSTLY_READY | — |
| 13 | Order Detail | 76 | MOSTLY_READY | — |
| 14 | Order Lifecycle | 74 | MOSTLY_READY | E2E all transitions |
| 15 | Order Hub | 77 | MOSTLY_READY | Load test counts |
| 16 | Product Mapping | 73 | MOSTLY_READY | Channel certification |
| 17 | Weekly Menus | 72 | MOSTLY_READY | — |
| 18 | Menu Items/Products | 74 | MOSTLY_READY | — |
| 19 | Menu Planner | 68 | PARTIAL | — |
| 20 | Brands | 70 | MOSTLY_READY | Multi-brand complexity |
| 21 | Calendar | 65 | PARTIAL | — |
| 22 | Production | 75 | MOSTLY_READY | — |
| 23 | Kitchen Screen/KDS | 73 | MOSTLY_READY | Tablet UX verify |
| 24 | Packing | 74 | MOSTLY_READY | — |
| 25 | Packing Verify | 72 | MOSTLY_READY | — |
| 26 | Nutrition Labels | 68 | PARTIAL | Regulatory disclaimer |
| 27 | Routes | 62 | PARTIAL | Uber Direct ROADMAP |
| 28 | Driver Mode | 60 | PARTIAL | Mobile verify |
| 29 | Tasks | 70 | MOSTLY_READY | — |
| 30 | Locations | 72 | MOSTLY_READY | — |
| 31 | Storefront Builder | 76 | BETA | Theme experiments gated |
| 32 | Public Storefront | 78 | BETA | Lighthouse staging |
| 33 | Storefront Cart | 80 | MOSTLY_READY | — |
| 34 | Storefront Checkout | 77 | BETA | Stripe staging cert |
| 35 | Storefront Account | 65 | PARTIAL | — |
| 36 | Order Lookup | 75 | MOSTLY_READY | Token entropy verify |
| 37 | Storefront Themes | 74 | BETA | — |
| 38 | Storefront Sections | 76 | MOSTLY_READY | — |
| 39 | Storefront Assets | 72 | MOSTLY_READY | S3 bucket setup |
| 40 | Storefront Domains | 70 | SETUP_READY | DNS operator-owned |
| 41 | Storefront SEO | 73 | MOSTLY_READY | — |
| 42 | Sales Channels | 58 | PARTIAL | Beta only |
| 43 | Integration Health | 70 | MOSTLY_READY | — |
| 44 | Webhook Management | 72 | BETA | Replay break-glass |
| 45 | Public API | 68 | BETA | Rate limits + scopes |
| 46 | Import Center | 74 | MOSTLY_READY | Large file worker |
| 47 | Import/Export legacy | 68 | PARTIAL | Consolidate UX |
| 48 | Ingredient Demand | 66 | PARTIAL | — |
| 49 | Inventory | 64 | PARTIAL | — |
| 50 | Purchasing | 63 | PARTIAL | — |
| 51 | Costing/AvT | 62 | PARTIAL | — |
| 52 | Analytics | 65 | PARTIAL | Unbounded queries |
| 53 | Forecast | 60 | PARTIAL | — |
| 54 | Reports | 64 | PARTIAL | report-service findMany |
| 55 | Executive Dashboard | 58 | PARTIAL | Performance risk |
| 56 | AI Copilot | 55 | PARTIAL | OpenAI optional |
| 57 | Customer CRM | 76 | MOSTLY_READY | — |
| 58 | Meal Plans | 68 | PARTIAL | — |
| 59 | Catering Quotes | 72 | MOSTLY_READY | — |
| 60 | Staff | 74 | MOSTLY_READY | Workspace templates |
| 61 | Labor/Shifts | 70 | MOSTLY_READY | — |
| 62 | Billing | 72 | MOSTLY_READY | Org billing deferred |
| 63 | Entitlements | 73 | MOSTLY_READY | — |
| 64 | Notifications | 70 | MOSTLY_READY | Resend required |
| 65 | Alert Rules | 68 | PARTIAL | — |
| 66 | Support | 72 | MOSTLY_READY | SLA automation partial |
| 67 | Audit Logs | 74 | MOSTLY_READY | Retention policies |
| 68 | Settings | 76 | MOSTLY_READY | — |
| 69 | Implementation | 65 | PARTIAL | Enterprise scaffold |
| 70 | Go-Live | 70 | MOSTLY_READY | — |
| 71 | Training | 62 | PARTIAL | — |
| 72 | Playbooks | 70 | MOSTLY_READY | — |
| 73 | Templates | 68 | PARTIAL | — |
| 74 | Demo Scenarios | 66 | PARTIAL | Prod blocked |
| 75 | Growth | 55 | PARTIAL | ownerOnly |
| 76 | Developer Console | 65 | BETA | — |
| 77 | Beta Applications | 70 | MOSTLY_READY | — |
| 78 | Partner Dashboard | 60 | PARTIAL | — |
| 79 | Platform Dashboard | 75 | MOSTLY_READY | — |
| 80 | Platform Workspaces | 76 | MOSTLY_READY | — |
| 81 | Platform Users | 74 | MOSTLY_READY | — |
| 82 | Platform Support | 75 | MOSTLY_READY | — |
| 83 | Platform Integrations | 73 | MOSTLY_READY | — |
| 84 | Platform Webhooks | 72 | MOSTLY_READY | — |
| 85 | Platform Audit | 74 | MOSTLY_READY | — |
| 86 | Platform Tools | 50 | SCAFFOLD | DB health careful |
| 87 | Trust/Legal | 70 | PARTIAL | Counsel approval |
| 88 | Marketing site | 72 | MOSTLY_READY | verify-claims |
| 89 | Pricing | 70 | MOSTLY_READY | — |
| 90 | Book Demo/Beta forms | 74 | MOSTLY_READY | — |

---

## 7. Service and Function Audit

### 7.1 Domain summary

| Domain | Files | Tenant scoping | Test coverage |
|--------|------:|----------------|---------------|
| storefront | 178 | slug/userId/workspace | **high** (unit) |
| pos | 15 | userId register/shift | medium |
| orders | 8 | dataUserId | medium-high |
| webhooks | 9 | connection routing | medium |
| platform | 16 | super-admin | low-medium |
| crm | 11 | dataUserId | medium |
| security/rate-limit | 5 | key buckets | medium |
| permissions | 3 | workspace | medium |

### 7.2 High-risk function table (sample)

| File | Function | Why high risk | Severity | Priority | Recommendation |
|------|----------|---------------|----------|----------|----------------|
| `pos-checkout-service.ts` | checkout | Money + inventory | CRITICAL | P0 | Idempotency keys; audit |
| `pos-refund-service.ts` | refund | Money | CRITICAL | P0 | Stripe parity tests exist |
| `webhook-ingest-service.ts` | ingest | External payload | HIGH | P0 | Signature + queue |
| `webhook-replay-service.ts` | replay | Duplicate orders | HIGH | P0 | Break-glass only |
| `import-center-service.ts` | commit | Mass mutate | HIGH | P0 | Rollback scoped |
| `platform-impersonation-service.ts` | start/end | Cross-tenant | CRITICAL | P0 | TTL + audit (done) |
| `storefront-stripe-checkout-service.ts` | checkout | PCI boundary | HIGH | P0 | No card data touch |
| `export-service.ts` | CSV export | Data exfil | HIGH | P1 | Permission tests |
| `public API routes` | create order | API key | HIGH | P0 | Zod + rate limit (done) |
| `permission-service.ts` | checks | AuthZ core | HIGH | P0 | Unify RBAC |

---

## 8. Server Actions Mutation Audit

**Inventory:** 103 files, **618** exported functions (see **Appendix C**).

### 8.1 Status summary (from `IDOR_MUTATION_INVENTORY.md` v1.3)

| Status | Count (approx) | Notes |
|--------|----------------|-------|
| OK / FIXED | Majority of P0 domains | Orders, POS, import center, billing, platform |
| REVIEW (legacy checklist) | Decreasing | Training/playbooks marked FIXED 2026-05-17 in doc |
| Platform mutations | 4 files | Impersonation hardened |

### 8.2 P0 action risks (remaining vigilance)

| Action file | Risk | Mitigation evidence |
|-------------|------|---------------------|
| `platform-impersonation.ts` | Cross-tenant | TTL, audit, MFA |
| `demo.ts` | Destructive | production-guards |
| `webhook-replay.ts` | Duplicate side effects | super-admin + warnings |
| `import-center.ts` | Mass import | scoped rollback |
| `storefront-team-invite.ts` | Invite token | workspace scope |

### 8.3 Actions safe for beta (with guards)

Auth, onboarding, POS checkout (online), order status updates (scoped), public storefront order submit (slug-bound), settings-center (owner row), support tickets (workspace access).

---

## 9. API Routes, Webhooks, and Crons Audit

### 9.1 Totals

- **241** `app/api/**/route.ts`
- **131** under `/api/cron/`
- **46** under `/api/webhooks/`
- **22** storefront APIs

### 9.2 Cron audit

**Auth:** `runCronRoute` → `CRON_SECRET`; experimental requires `ENABLE_EXPERIMENTAL_CRONS` (`lib/security/cron-auth.ts`).

| Class | Count (approx) | Product critical? |
|-------|----------------|-------------------|
| Production ops | ~10 | **Yes** — webhook-jobs, reminders, storefront domain/cart/theme |
| Storefront experiments | ~25 | Flag-gated |
| Compliance/regulatory scaffold | ~40 | **No** — SOC2/ISO seeds |
| Novelty/research names | ~56 | **No** |

**Recommendation:** Vercel cron sync only production list; monitor `emitCronFailure` in Sentry.

### 9.3 Webhook audit (production-relevant)

| Provider | Route | Signature | Status |
|----------|-------|-----------|--------|
| Stripe | `/api/webhooks/stripe` | constructEvent | FIXED per inventory |
| Shopify | `/api/webhooks/shopify/*` | HMAC | BETA |
| WooCommerce | `/api/webhooks/woocommerce` | signature | BETA |
| Resend | `/api/webhooks/resend` | verify | MOSTLY_READY |
| Uber Eats | `/api/webhooks/uber-eats/orders` | PARTIAL | PARTNER only |

### 9.4 Public API

| Route | Methods | Auth | Validation |
|-------|---------|------|------------|
| `/api/public/v1/orders` | GET/POST | Bearer `kos_` | Zod + rate limit + workspaceId on create |
| `/api/public/v1/customers` | GET/POST | Bearer | Pagination added 2026-05 |
| `/api/public/v1/products` | GET | Bearer | Rate limit |

### 9.5 Health

| Route | Purpose |
|-------|---------|
| `/api/health` | Liveness + queue hints |

---

## 10. Database, Prisma, Migrations, and Data Model Audit

| Metric | Value |
|--------|------:|
| Models | 297 |
| Enums | 253 |
| Migrations | 84 |
| Pending (local connected DB) | 0 |

### 10.1 Warnings

- **SetNull on required FK** — Prisma validate advisory; review `brandId`/`locationId` cascades before change.

### 10.2 Tenant strategy

- **Primary legacy key:** `userId` on `Order`, `KitchenSettings`, many entities
- **Emerging:** `workspaceId` on orders (public API create), migration plan in `docs/WORKSPACE_MIGRATION_PLAN.md`
- **Staff access:** `dataUserId` resolves to owner; session user for audit actor

### 10.3 P0 schema risks

| Risk | Severity | Recommendation |
|------|----------|----------------|
| Missing composite indexes on hot lists | MEDIUM | Profile Order, WebhookJob, AuditLog |
| JSON overuse on experiment tables | MEDIUM | Archive old experiment rows |
| Enum explosion (253) | LOW | Consolidate where safe |
| Webhook job growth | HIGH | Retention cron + indexes |

### 10.4 Retention

Storefront webhook retention cron exists; audit retention configurable (`audit-center` actions).

---

## 11. Security, RBAC, IDOR, and Compliance Audit

### 11.1 Confirmed protections

| Control | Evidence |
|---------|----------|
| Supabase session middleware | `lib/supabase/middleware.ts` |
| Dashboard onboarding gate | `app/dashboard/layout.tsx` |
| Module route gate | `ModuleRouteGate` |
| Workspace permission provider | `WorkspacePermissionsProvider` |
| Cron secret | `verifyCronSecret` |
| Webhook signatures | unit `webhook-signature-verification.test.ts` |
| Rate limiting adapter | Upstash/memory/TCP |
| Platform redirect unauthenticated | middleware + e2e |
| Impersonation TTL/audit | `IMPERSONATION_RUNBOOK.md` |
| Demo mutations blocked in prod | `lib/production-guards.ts` |
| Observability redaction | `redactObservabilityContext` |

### 11.2 Missing / weak

| Gap | Severity | Priority |
|-----|----------|----------|
| Build broken (lint vs cron imports) | CRITICAL | P0 |
| SSO/SCIM ROADMAP only | INFO | P3 |
| Automated DSR pipeline partial | MEDIUM | P2 |
| Not all actions use workspaceId | HIGH | P0 |
| CSRF on cookie auth API routes | MEDIUM | P1 — verify Next defaults |

### 11.3 Before-beta security checklist

- [ ] Fix production build
- [ ] Staging: rotate `CRON_SECRET`, disable experimental crons
- [ ] Confirm `RATE_LIMIT_ADAPTER=upstash` in prod
- [ ] Run `npm run test:security`
- [ ] Pen-test public API + webhooks
- [ ] Review platform impersonation runbook with support team

---

## 12. End-to-End Workflow Audit (summary)

| # | Workflow | Completeness | Score | Staging required? |
|---|----------|--------------|------:|-------------------|
| 1 | Signup → onboarding → workspace | MOSTLY_READY | 70 | Yes |
| 2 | Business mode → modules | MOSTLY_READY | 72 | Yes |
| 3 | POS ready-now sale | MOSTLY_READY | 75 | Yes |
| 4 | POS made-to-order | MOSTLY_READY | 72 | Yes |
| 5 | POS shift open/close | MOSTLY_READY | 74 | Yes |
| 6 | Manual order | MOSTLY_READY | 76 | — |
| 7 | Dashboard order edit | MOSTLY_READY | 75 | — |
| 8 | Lifecycle transition | MOSTLY_READY | 74 | Yes |
| 9 | Storefront order request | MOSTLY_READY | 76 | Yes |
| 10 | Storefront Stripe checkout | BETA | 72 | **Yes** |
| 11 | Checkout without Stripe | MOSTLY_READY | 70 | Yes |
| 12 | Public order lookup | MOSTLY_READY | 74 | — |
| 13 | Woo webhook import | BETA | 65 | **Yes** |
| 14 | Shopify webhook import | BETA | 65 | **Yes** |
| 15 | Product mapping approval | MOSTLY_READY | 73 | — |
| 16 | Order → production | MOSTLY_READY | 75 | — |
| 17 | Production → packing | MOSTLY_READY | 74 | — |
| 18 | Packing → pickup | MOSTLY_READY | 73 | — |
| 19 | Delivery → route → driver | PARTIAL | 62 | Yes |
| 20 | Weekly menu → preorders | PARTIAL | 68 | Yes |
| 21 | Catering quote → order | MOSTLY_READY | 70 | — |
| 22 | Meal plan recurring | PARTIAL | 65 | Yes |
| 23 | Inventory → purchasing | PARTIAL | 60 | — |
| 24 | Costing/AvT | PARTIAL | 62 | — |
| 25 | CRM create/link | MOSTLY_READY | 76 | — |
| 26 | Support → platform reply | MOSTLY_READY | 74 | Yes |
| 27 | Billing → entitlement | MOSTLY_READY | 72 | Yes |
| 28 | Webhook fail → retry | BETA | 68 | **Yes** |
| 29 | Replay webhook | BETA | 60 | **Yes** — break-glass |
| 30 | Import CSV → commit | MOSTLY_READY | 74 | Yes |
| 31 | Export CSV | MOSTLY_READY | 72 | — |
| 32 | Demo seed/reset | PARTIAL | 66 | Staging only |
| 33 | Platform impersonation | MOSTLY_READY | 70 | **Yes** |
| 34 | Notification w/ Resend | SETUP_READY | 70 | Yes |
| 35 | Notification w/o Resend | PARTIAL | 50 | — |
| 36 | AI Copilot w/ OpenAI | PARTIAL | 60 | — |
| 37 | AI Copilot w/o OpenAI | MOSTLY_READY | 65 | deterministic fallback |

---

## 13. Performance, Scalability, Load, and Cost Audit

### 13.1 P0 performance risks

| Risk | Evidence | Mitigation |
|------|----------|------------|
| Unbounded report queries | `report-service.ts` heavy findMany | Pagination + materialized views |
| Executive dashboard aggregates | 13 findMany | Cache snapshots |
| Order hub exact counts | dedicated service | Monitor slow queries |
| 131 crons | Vercel invocations | Disable experimental |
| Storefront experiment edge | middleware fetch 2s timeout | Cache host resolution |

### 13.2 SLO suggestions

| Surface | p95 target |
|---------|------------|
| Storefront catalog | < 800ms |
| Dashboard Today | < 1.5s |
| POS checkout API | < 2s |
| Webhook ingest ACK | < 500ms |
| Webhook job lag | < 5 min |

### 13.3 Cost risks

Serverless + 131 crons + edge middleware + S3 media + Upstash + Supabase pooler — **REQUIRES_RUNTIME_VERIFICATION** of Vercel bill at pilot scale.

---

## 14. Storefront and Commerce Audit

| Subarea | Class |
|---------|-------|
| Theme builder + publish | BETA |
| Cart/checkout v2 | MOSTLY_READY |
| Stripe Connect option | PARTIAL — docs `STOREFRONT_STRIPE_CONNECT_OPTION_B` |
| Pay-later / order request | MOSTLY_READY |
| Custom domain | SETUP_READY |
| Turnstile | Env-dependent |
| i18n FR | PARTIAL |
| Rich HTML sanitizer | REQUIRED — verify on sections |
| Lighthouse | Workflow exists |

**Sell now:** Native preorder storefront, pickup/delivery scheduling, Stripe when configured, catering pages.

**Beta only:** High-traffic catalog, multi-store, theme experiments.

**Do not claim:** Shopify-parity app store, offline, marketplace Uber.

---

## 15. POS and Front-of-House Audit

| Area | Status |
|------|--------|
| Terminal grid/checkout | MOSTLY_READY |
| Cash / external terminal | MOSTLY_READY |
| Stripe Terminal hardware | **ROADMAP — not in repo** |
| Offline | **NOT_AVAILABLE** (`POS_OFFLINE_LIMITATIONS`) |
| Refund/void | MOSTLY_READY + unit tests |
| Shift variance | MOSTLY_READY |
| Kitchen routing | MOSTLY_READY |
| Receipt print | PARTIAL — REQUIRES_RUNTIME |

**Beta-safe POS scope:** Online checkout, cash, external terminal mode, shift tracking, basic reports.

**Unsafe claims:** Offline mode, integrated card readers, tip pooling (verify).

---

## 16. Integrations, Capability Matrix, and Claims Audit

Source: `lib/capabilities/capability-matrix.ts` + `scripts/verify-marketing-claims.ts`.

| Provider | Code | UI | Marketing risk |
|----------|------|-----|----------------|
| WooCommerce | BETA | BETA badge | Medium — certify per site |
| Shopify | BETA | BETA badge | Medium |
| Stripe checkout | Env-dependent | — | Low if keys set |
| Stripe Terminal | ROADMAP | — | **High if claimed** |
| Resend | SETUP_READY | — | Low |
| SMS | NOT_AVAILABLE | CRM consent UI only | **High if claimed** |
| Google Maps | SETUP_READY | — | Low |
| OpenAI | BETA | Copilot | Medium |
| Uber Eats | PARTNER | Badges | **High** |
| Uber Direct | ROADMAP | — | **High** |
| DoorDash | ROADMAP | — | **High** |
| Public API | BETA | Developer console | Medium |
| POS offline | NOT_AVAILABLE | Settings doc | **High** |

---

## 17. QA, Tests, Coverage, and CI Audit

| Suite | Count | Result (17 May) |
|-------|------:|-----------------|
| Vitest files | 154 | 153 pass, 1 skip |
| Vitest tests | 541 | 540 pass |
| Playwright specs | 42 | Not run in this audit |
| `test:security` script | bundled tests | Not run separately (subset of unit) |

**Top missing tests:** Full signup→order E2E in default CI; Shopify/Woo production webhooks; load tests on Order Hub; impersonation e2e; build/lint gate consistency.

**CI recommendation:** Add eslint override for `app/api/cron/**` OR fix restricted-imports; make `verify-claims` blocking for release branches.

---

## 18. Observability, SRE, Release, and Operations Audit

| Capability | Status |
|------------|--------|
| Sentry SDK | Configured; env-dependent |
| OTEL experiment | `experiment-otel` in instrumentation |
| Cron failure signals | `emitCronFailure` |
| Health endpoint | `/api/health` |
| Runbooks | Many in `docs/runbooks/`, beta playbooks |
| Backup/DR doc | `BACKUP_DISASTER_RECOVERY_PLAN.md` |
| Incident runbook | `INCIDENT_RESPONSE_RUNBOOK.md` |
| Migration deploy | Operator-owned; 84 migrations |

---

## 19. Marketing, Pricing, Sales, and Commercial Readiness Audit

**Recommended first ICP:** Meal prep / weekly menu operators with preorder + kitchen production + packing (not full-service restaurant POS replacement).

**Sell now:** Orders, production, packing, native storefront (beta), Woo/Shopify import (beta), CRM, basic POS (online).

**Do not sell:** SMS alerts, offline POS, Uber/DoorDash native, enterprise SSO, SOC2 certification, Stripe Terminal hardware.

**Mark beta:** Storefront, integrations, public API, webhook replay, AI copilot.

**Hide:** Growth GTM suite from non-owner roles; experiment compliance crons from marketing.

**Churn risks:** Overpromised integrations; migration pain; feature nav overwhelm.

---

## 20. Competitor and Market Positioning Audit

*General category knowledge — **Requires market verification** for pricing/feature parity.*

| Category | Competitor examples | KitchenOS wedge | Avoid competing |
|----------|---------------------|-----------------|---------------|
| Restaurant POS | Toast, Square, Clover | Ops + preorder + kitchen workflow | Full offline POS, hardware |
| Commerce | Shopify, Woo | **Integrated ops after sale** | Theme app store scale |
| Aggregator middleware | Cuboh, Deliverect | — (no certified Uber) | Marketplace hub claims |
| Inventory/costing | MarketMan, xtraCHEF | Partial costing | Deep inventory ERP |
| Scheduling | 7shifts | Staff module basic | Workforce compliance |
| Meal prep software | Various niche | **Strong fit** | — |

**Wedge:** Single stack for **make → pack → deliver** with owned storefront and channel order normalization.

**Feature sprawl risk:** 450 dashboard routes dilute positioning — pilot nav critical.

---

## 21. Documentation and Knowledge System Audit

**Best docs:** `IDOR_MUTATION_INVENTORY.md`, `CRON_INVENTORY.md`, `ENGINEERING_READINESS_INDEX.md`, `STOREFRONT_*` runbooks, beta playbooks.

**Stale/duplicate:** Multiple `KITCHENOS_*_1000*` completion reports; missing `audit17may.md`.

**Canonical set (recommended):** This audit + `ENGINEERING_READINESS_INDEX` + `capability-matrix.ts` + `MODULE_DOCUMENTATION_MAP.md`.

**Archive candidates:** Redundant completion reports dated same sprint.

---

## 22. Risk Register and Backlog

| ID | Domain | Finding | Severity | Priority | Effort | Recommendation |
|----|--------|---------|----------|----------|--------|----------------|
| R-001 | Build | ESLint blocks cron `_experiments` imports | CRITICAL | P0 | S | Add override glob `app/api/cron/**` |
| R-002 | Security | workspaceId not universal | HIGH | P0 | L | Phase migration |
| R-003 | Ops | 131 cron routes | HIGH | P0 | M | Vercel cron allowlist |
| R-004 | Commercial | SMS/offline/integration claims | HIGH | P0 | S | verify-claims blocking |
| R-005 | Perf | Report/executive queries | MEDIUM | P1 | M | Paginate + cache |
| R-006 | QA | E2E not default | MEDIUM | P1 | M | PR smoke bundle |
| R-007 | Schema | SetNull FK warning | MEDIUM | P1 | S | Schema review |
| R-008 | DX | 450 dashboard routes | MEDIUM | P2 | L | Nav gating |
| R-009 | Storefront | Experiment surface | MEDIUM | P1 | M | Keep gated |
| R-010 | Docs | Missing audit17may | LOW | P2 | XS | Point to this doc |

### P0 backlog (closed beta)

1. Fix build (R-001)
2. Staging webhook+cron smoke
3. Rate limit prod adapter
4. Close IDOR checklist items
5. Marketing claims audit gate

### P1 backlog (paid pilot)

1. Woo/Shopify certification per tenant
2. Order Hub performance
3. E2E signup→order
4. RBAC phase B
5. Import large-file worker

---

## 23. Readiness Scorecard

| Dimension | Score | Fastest improvement |
|-----------|------:|---------------------|
| Overall product | 58 | Fix build + narrow nav |
| Closed beta | 62 | Staging smoke |
| Paid pilot | 55 | Integration certification |
| Public launch | 42 | Hide scaffold |
| Enterprise | 35 | SSO roadmap only |
| Product completeness | 70 | — |
| Engineering maturity | 64 | Build gate |
| TypeScript/build health | 55 | ESLint cron override |
| Test coverage | 68 | E2E in CI |
| Security/RBAC | 68 | workspace migration |
| Tenant isolation | 65 | workspaceId phase |
| POS | 65 | Honest offline docs |
| Storefront | 72 | Stripe staging |
| Order workflow | 76 | — |
| Integration | 52 | Beta labels |
| Webhook/queue | 66 | Async queue verify |
| Billing | 72 | — |
| Support/platform | 74 | — |
| Performance | 58 | Report pagination |
| Observability | 62 | Sentry prod DSN |
| Documentation | 60 | Canonical index |
| Marketing/commercial | 64 | verify-claims |

**Scenarios:** Optimistic 70 / Realistic 62 / Conservative 55 for closed beta readiness.

---

## 24. Final Roadmap and Next Steps

### 48 hours
- Fix ESLint/build (cron path exception)
- Run `npm run test:security` + staging smoke scripts
- Confirm Vercel cron list = production subset only

### 7 days
- Woo/Shopify test shop certification
- Enable Upstash rate limits staging/prod
- Playwright: signup + storefront checkout on CI smoke

### 14 days
- Workspace Phase 1 migration on staging
- Order Hub query profiling
- Archive stale completion docs

### 30 days
- RBAC Phase B completion
- Import/export background worker spike
- Paid pilot legal + capability signoff

### 60–90 days
- Public API hardening + scoped keys
- Performance budgets on Today/Hub
- Evaluate SSO partner

### Hide now
Growth, developer console (non-owner), workspace experiments, platform novelty tools.

### Sell first
Preorder storefront + kitchen ops + packing + Woo/Shopify beta.

---

## Safe Commands and Evidence Log

| Command | Result | Duration | Interpretation |
|---------|--------|----------|----------------|
| `node -v` | v22.22.3 | — | Matches engines |
| `npm -v` | 10.9.8 | — | OK |
| `npm run typecheck` | **PASS** exit 0 | ~9.5s | 0 TS errors |
| `npm run lint` | exit 1, warnings only | ~12s | Unused vars in experiment libs |
| `npm test` | **PASS** 540/541 | ~6.7s | 1 skipped test |
| `npx prisma validate` | **PASS** + SetNull warn | ~7s | Schema valid |
| `npx prisma migrate status` | **up to date**, 84 migrations | — | Connected DB only |
| `npm run build` | **FAIL** exit 1 | ~125s | ESLint `no-restricted-imports` on cron→`_experiments` |

**Delta from remediation-report-17may:** Tests increased 458→540; migrate status was pending storefront_phase6_invites, now up to date on connected DB; **new regression:** build fails on restricted imports (may post-date remediation CI green).

---

## Appendix A — Route Inventory

**Generation (read-only):**

```bash
find app -name 'page.tsx' | sed 's|/page.tsx||;s|^app||' | sort > /tmp/kos-pages.txt
find app -name 'layout.tsx' | sed 's|/layout.tsx||;s|^app||' | sort > /tmp/kos-layouts.txt
find app/api -name 'route.ts' | sed 's|/route.ts||;s|^app||' | sort > /tmp/kos-api.txt
```

**Counts:** 599 pages · 44 layouts · 241 API routes (131 cron · 46 webhooks · 22 storefront · remainder).

**Dashboard segments (pages):** storefront 31 · settings 27 · implementation 24 · sales-channels 21 · locations 20 · growth 17 · developer 14 · training 13 · customers 13 · analytics 13 · product-mapping 12 · meal-plans 12 · tasks 11 · routes 11 · reports 11 · playbooks 11 · costing 11 · catering-quotes 11 · billing 11 · templates 10 · staff 9 · pos 9 · notifications 9 · import-export 9 · import-center 7 · purchasing 8 · executive 8 · copilot 8 · integrations 7 · brands 7 · + single-route modules.

**Storefront public pages:** `/s/[storeSlug]`, `/menu`, `/cart`, `/checkout`, `/account`, `/products/[productRef]`, `/collections/[collectionSlug]`, policies, FAQ, catering, contact, order tokens, CMS `/p/[pageSlug]`.

**Platform pages:** 47 — see §3.4.

---

## Appendix B — API Route Inventory

| Prefix | Count | Auth model |
|--------|------:|------------|
| `/api/cron/` | 131 | CRON_SECRET (+ experimental flag) |
| `/api/webhooks/` | 46 | Provider signatures / scaffold |
| `/api/storefront/` | 22 | Public + staff/session mixes |
| `/api/dashboard/` | 7 | Session + permissions |
| `/api/public/v1/` | 3 | API key bearer |
| `/api/integrations/` | 7 | Session owner |
| `/api/internal/` | 7 | Internal/scaffold |
| Other | ~26 | Mixed |

**Production cron allowlist:** See `docs/CRON_INVENTORY.md` § Production.

---

## Appendix C — Server Action Inventory

**103 files · 618 exports.** Largest: `customers.ts`, `catering-quotes.ts`, `meal-plans.ts`, `storefront-pages.ts`.

Full per-file export list maintained in repo via:

```bash
rg '^export (async )?function' actions --no-heading
```

Categories: auth(2), orders/pos/packing/production(12+), storefront(25+), platform(4), crm(5), settings(8), import(4), growth/demo/training/playbooks, integrations.

---

## Appendix D — Service Inventory

**466 TS files** under `services/` (+ 1 README in `_experiments`).

| Subdirectory | Files |
|--------------|------:|
| storefront | 178 |
| storefront/_experiments | 60 |
| platform | 16 |
| developer | 15 |
| pos | 15 |
| crm | 11 |
| orders | 8 |
| observability | 8 |
| analytics | 8 |
| growth | 12 |
| webhooks | 9 |
| *(see §7.1 for full domain list)* | |

---

## Appendix E — Prisma Model Inventory

**297 models · 253 enums** in `prisma/schema.prisma`.

**High-risk model groups:** Order*, Payment*, POSTransaction*, Webhook*, IntegrationConnection*, Storefront*, Subscription*, Audit*, Platform*, ImportJob*, KitchenCustomer*.

**Tenant fields to track:** `userId`, `workspaceId`, `organizationId`, `brandId`, `locationId`.

List models:

```bash
rg '^model ' prisma/schema.prisma -o 'model \w+'
```

---

## Appendix F — Component Inventory

**576** `components/**/*.tsx`.

Major prefixes: `dashboard/`, `storefront/`, `pos/`, `ui/`, `permissions/`, `orders/`, `packing/`, `platform/`, `marketing/`.

---

## Appendix G — Test Inventory

| Area | Files (approx) |
|------|----------------|
| Unit `tests/unit/` | 200+ |
| Integration `tests/integration/` | several |
| E2E `e2e/` + `tests/e2e/` | 42 specs |
| Visual `tests/visual/` | present (workflow) |
| Security-focused | `mutation-access`, `cross-tenant-denial`, `impersonation-mfa`, etc. |

---

## Appendix H — Documentation Inventory

**1358+** markdown files under `docs/`.

**Tier 1 (canonical):** `ENGINEERING_READINESS_INDEX.md`, `IDOR_MUTATION_INVENTORY.md`, `CRON_INVENTORY.md`, `MODULE_DOCUMENTATION_MAP.md`, `TESTING.md`, `BETA_START_HERE.md`, storefront runbooks.

**Tier 2 (release):** `KITCHENOS_RELEASE_DECISION_REPORT.md`, `PRODUCTION_DEPLOY_CHECKLIST.md`, `READINESS_REPORT_17MAY_FINAL.md`.

**Tier 3 (archive candidate):** `KITCHENOS_*_COMPLETION_REPORT.md` duplicates, old phase completion reports.

---

---

## Paid pilot ops update (18 May 2026)

### Track A — LOCAL 100% (automated now)

```bash
npm run pilot:local:100
```

Closes: secrets, TOTP, DB migrate/backfill, `verify:staging-env --local-pilot`, code readiness.  
Report: `docs/generated/PILOT_LOCAL_100_REPORT.md`

### Track B — VERCEL GO (one human step: Upstash)

| Step | Action | DoD |
|------|--------|-----|
| 1 | `npm run pilot:open:paste` → paste REST URL + token from [Upstash](https://console.upstash.com/redis) | `staging:ops:status` → UPSTASH OK |
| 2 | `npm run pilot:upstash:gate` | ping OK + Vercel checklist generated |
| 3 | `npm run vercel:staging-push -- --apply` + **Redeploy** | — |
| 4 | `npm run pilot:deploy:gate -- --url=https://….vercel.app` | `/api/health` 200 |
| 5 | `npm run pilot:100-next` | queue → staff → HTTP → sign-off |

| Item | Status |
|------|--------|
| Code gates (`verify:pilot-readiness`, 584+ tests) | **PASS** |
| Staging DB migrate + backfill 16 tables | **PASS** |
| Staff scope DB check | **PASS** (invite pending — product) |
| Upstash on Vercel | **BLOCKED** — `.env.upstash.paste.local` still template |
| Deploy live | **BLOCKED** — preview 404 until redeploy |

**Handoff:** `docs/generated/PILOT_OPS_HANDOFF.md` · **Runbook:** `docs/PILOT_100_PERCENT_RUNBOOK.md`

*End of audit.*

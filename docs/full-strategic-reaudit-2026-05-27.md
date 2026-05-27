# KitchenOS Full Strategic Re-Audit

**Date:** 2026-05-27  
**Method:** Read-only inspection of live repository state (not prior audit docs alone)  
**Branch evidence:** `952571a` (Fix production TypeScript errors blocking Vercel build)  
**Working tree:** Small delta on `package.json`, `openapi-manifest.json` only; prior RBAC cycles largely committed

---

## Executive Summary

KitchenOS is a **large, real, multi-surface food-operations monolith** — not an MVP skeleton. The codebase has **699 App Router pages**, **296 API routes**, **144 server action files**, **603 service files**, **362 Prisma models**, and **399 Vitest tests**. The **canonical order spine** and **storefront checkout** are the strongest production assets. **POS**, **RBAC**, and **KDS** improved materially in recent autonomous cycles but remain **below Toast/Square certification bar**. The largest structural risks are **permission fragmentation** (~85 action files still tenant-scoped without canonical mutation permissions), **cron/experiment surface bloat** (137 cron routes vs 15 production-scheduled), **CI/E2E gap** (57 Playwright specs, 3 in default CI), and **documentation sprawl** (1,434 markdown files, many stale).

**Verdict:** A **new master prompt is required now**. The previous master prompt’s direction (platform safety → revenue paths → depth) remains valid, but assumptions about “RBAC not started” and “cron validation broken” are **outdated**. New prompt must emphasize **finishing RBAC canon**, **KDS productization**, **cron/archive hygiene**, **E2E gates for money paths**, and **sales/navigation governance** — not broad feature expansion.

---

## Step 1 — Fresh Repository Inventory

| Metric | Count | Evidence |
|--------|------:|----------|
| App Router pages (`page.tsx`) | **699** | `find app -name page.tsx` |
| API routes (`route.ts` under `app/api`) | **296** | `find app/api -name route.ts` |
| Server action files | **144** | `find actions -name '*.ts'` |
| Service files | **603** | `find services -name '*.ts'` |
| Prisma models | **362** | `grep '^model '` `prisma/schema.prisma` |
| Prisma enums | **266** | `grep '^enum '` `prisma/schema.prisma` |
| Vitest `*.test.ts` | **399** | `find tests -name '*.test.ts'` |
| Playwright specs (`tests/e2e` + `e2e`) | **53** (18 + 35) | `find` |
| Docs (`docs/**/*.md`) | **1,434** | `find docs -name '*.md'` |
| Cron route handlers | **137** | `find app/api/cron -name route.ts` |
| Production-scheduled crons (`vercel.json`) | **15** | `vercel.json` |
| Webhook routes | **49** | `find app/api -path '*webhook*' -name route.ts` |
| `components/**/*.tsx` | **739** | `find components` |
| `lib/**/*.ts` | **1,145** | `find lib` |
| POS dashboard pages | **~12+** | `app/dashboard/pos/` |
| POS action files | **2+** (`actions/pos.ts`, `actions/pos/tabs.ts`) | grep |
| POS service files | **17** | `services/pos/` |
| Storefront public pages | **27** under `app/s/` | glob |
| Storefront-related unit tests | **58** filename matches | `tests/**/*storefront*` |
| Kitchen/KDS pages | **12** | `app/dashboard/kitchen*` |
| Canonical permission keys | **59** | `lib/permissions/permissions.ts` |
| Plan feature keys (entitlements) | **27** | `lib/plans/feature-registry.ts` |
| Actions using `requireMutationPermission` | **20** | grep |
| Actions using `requireTenantActor` | **104** (~85 tenant-only) | grep |
| Integration subdirs under `services/integrations/` | **3** + 10 root files | listing |
| TODO/FIXME in prod TS/TSX | **~20 lines** (low) | grep — concentrated in implementation/go-live |
| GitHub workflows | **15** | `.github/workflows/` |

**Recent commits (last 20):** Production TS/build fixes; growth actor scope; async RBAC Promise types; storefront subnav/billing/import-center/storefront RBAC alignment; Vercel `npm ci` + Prisma generate; storefront discounts/loyalty/gift cards RBAC.

---

## Step 2 — Prior Roadmap Docs vs Current Reality

| Document | Still Accurate? | Completed Since Last Master Prompt | Outdated / Wrong Assumptions | New Risks | Required Update |
|----------|-----------------|-------------------------------------|------------------------------|-----------|-----------------|
| `docs/system-reality-model.md` (2026-05-26) | **Mostly yes** | POS RBAC slice, import center canon, cron auth audits, storefront rewards RBAC | Understates POS test depth; cron count explosion | Experimental crons still in repo | Refresh inventory counts; mark POS RBAC progress |
| `docs/feature-maturity-matrix.md` | **Mostly yes** | POS terminal lifecycle tests, storefront media RBAC, import center | Some rows still say “refunds weaker than checkout” — now closer | Over-optimistic “pilot_ready” on order hub without E2E | Re-score POS/KDS after E2E gap audit |
| `docs/p0-hardening-roadmap.md` | **Partially** | Cron validation CI live; POS permission keys; timing-safe cron auth | Item “broken cron validation” largely fixed | RBAC still P0 #1 | Close cron item; elevate E2E + tenant-only actions |
| `docs/rbac-permission-architecture.md` | **Target doc, not reality** | 59 keys exist; POS/KDS/billing/storefront slices | Lists 80+ target keys not in registry | Two permission systems (canon + domain helpers) | Mark “implemented vs target” columns |
| `docs/competitor-feature-gap-matrix.md` | **Strategically yes** | POS checkout/terminal tests improved | Toast POS parity still far | Selling POS before hardware honesty | Add “2026-05-27 evidence” column |
| `docs/product-positioning.md` | **Yes** | Unified order spine framing holds | None major | Nav breadth vs maturity | Tie to nav reduction initiative |
| `docs/implementation-backlog.md` | **Yes but noisy** | Long progress paragraph on KOS-P0-001/002 | Hard to parse what remains | Autonomous cycles append without closing | Split “done” vs “remaining” per ID |
| `docs/definition-of-done.md` | **Yes** | Still valid standard | Most modules fail DoD | — | Use as gate for maturity promotions |
| `docs/qa-master-test-plan.md` | **Partially** | 399 unit tests exist | CI does not run most E2E | False confidence from unit-only | Add CI tier matrix |
| Domain roadmaps (`restaurant-pos`, `kds-kitchen-ops`, `storefront-online-ordering`, etc.) | **Directionally yes** | POS RBAC, storefront checkout retry | KDS “certified live service” still false | — | Merge into one ops roadmap |
| `docs/enterprise-full-audit-26mayafter.md` | **Historical** | Superseded by May 26–27 cycles | Typecheck OOM may still apply | — | Archive; pointer to this doc |
| 1,300+ other `docs/*audit*.md` | **Mixed / often stale** | — | Contradictory readiness claims | Sales uses wrong doc | **Doc governance P1** |

---

## Step 3 — Architecture Audit

### 3.1 Layer Summary

| Layer | Implementation | Strongest | Weakest |
|-------|----------------|-----------|---------|
| App Router | 699 pages; marketing + dashboard + platform + storefront | Clear domain folders | Surface >> maturity |
| Server actions | 144 files; mixed guards | POS, storefront-order, integrations (partial canon) | ~85 tenant-only mutations |
| Services | 603 files; domain-oriented | `order-creation-service`, storefront payment, billing | Duplicated domain helpers; AI/experiment sprawl |
| Lib | 1,145 TS files | `route-registry`, scope, storefront edge | Permission fragmentation |
| Auth | Supabase session + middleware API classes | 8-class API registry | Storefront publish API gaps |
| Data | 362 models; workspace migration ongoing | Order/storefront/POS models | Schema weight → build/typecheck pressure |

### 3.2 Area Ratings (0–100)

| Dimension | Score | Why | Blocks +10 |
|-----------|------:|-----|------------|
| Architecture coherence | **58** | Monolith with good order spine; experiment/cron noise | Archive experimental routes; slice typecheck |
| Modularity | **55** | Services bounded by domain; actions leak orchestration | Extract shared mutation guard |
| Service boundaries | **62** | Canonical order creation | Forecast/AI duplicate naming; cross-imports |
| Type safety | **65** | Strict TS; recent build fixes | OOM at full `tsc`; 8GB CI heap |
| Maintainability | **52** | 1,434 docs; 137 crons | Doc + cron consolidation |
| Scalability | **50** | Serverless + large schema | Cold starts; N+1 in reports |
| Operational realism | **68** | CI gates, smoke scripts, runbooks | E2E not in default CI |
| Enterprise readiness | **40** | Audit/impersonation exist | SSO/SCIM; RBAC canon; cert integrations |

### 3.3 Duplication / Drift

- **Permissions:** `lib/permissions/*` + `lib/staff/staff-permissions.ts` + `lib/training/training-permissions.ts` + `lib/billing/billing-permissions.ts` + per-domain `require-*-actor.ts`.
- **Order entry:** Intentionally unified via `services/orders/order-creation-service.ts` (good).
- **Forecast:** `services/forecast/` vs `services/analytics/forecast-service.ts` vs `services/forecasting/` — naming overlap risk.
- **Cron:** 137 handlers; production manifest ~15 — **122+ non-production cron routes remain deployable if misconfigured**.

---

## Step 4 — RBAC / Security / Tenant Isolation

### 4.1 Registry & Enforcement

- **59** canonical keys in `lib/permissions/permissions.ts` (target doc lists more).
- **20/144** action files use `requireMutationPermission`.
- **104/144** use `requireTenantActor`; **~85** without canonical mutation permission.
- API policy: **8** route classes, **6** auth strategies (`lib/api/route-registry.ts`).

### 4.2 High-Risk Findings (Top 15)

| File | Mutation/API | Risk | Current Guard | Missing | Fix | Pri |
|------|--------------|------|---------------|---------|-----|-----|
| `actions/order-creation.ts` | Create order | Financial + bypass | Tenant + **email allowlist** | `orders.manage` | Remove email bypass | P0 |
| `actions/monetization.ts` | API keys, branding | Credential leak | `UserRole.OWNER` only | `billing.manage` / dev keys | Canon permissions | P0 |
| `actions/notification-rules.ts` | Toggle rules | Ops misuse | Tenant only | `workspace.settings` | Mutation permission | P0 |
| `actions/commissary.ts` | Transfers | Inventory | Tenant only | `production.manage` | Mutation permission | P0 |
| `app/api/leads/roi/route.ts` | POST lead | Spam/abuse | None | Rate limit + captcha | Harden | P0 |
| `app/api/nps/route.ts` | POST feedback | Spoofed operatorId | Weak | Auth or signed token | Harden | P1 |
| `app/api/iot/temperature/route.ts` | POST ingest | **Open if secret unset** | Optional bearer | Fail closed | Env guard | P0 |
| `app/api/storefront/theme/publish/route.ts` | Live publish | Brand damage | Session owner match | `storefront.publish` | Route guard | P0 |
| `app/api/storefront/builder/publish/route.ts` | Layout publish | Same | Same | Same | Same | P0 |
| `actions/customer-success.ts` | CS mutations | Role bypass | OWNER check | Growth permissions | Canon | P1 |
| `actions/channel-certification.ts` | Cert runs | Integration abuse | OWNER only | `integrations.manage` | Canon | P1 |
| `actions/settings-center.ts` | Settings saves | Over-broad staff | Section matrix | Unified keys | Audit + migrate | P1 |
| `lib/platform-owner.ts` | Super bypass | Cross-cutting | Hardcoded email | Platform role only | Remove prod email | P0 |
| `actions/storefront-order.ts` | Public checkout | By design | Captcha/rate limit | Misconfigured store | Config tests | P0 |
| `actions/feedback.ts` | App feedback | Low | Weak session | Rate limit | P2 |

### 4.3 POS / Billing / Storefront Permission Coverage

| Domain | Server canon | UI parity | Tests |
|--------|--------------|-----------|-------|
| POS checkout/refund/void/shift/register/terminal | **Strong** | Good on main shell | `test:pos-rbac`, terminal lifecycle tests |
| KDS daily bump/recall | **Good** | Kitchen pages gated | `kitchen-daily-kds-rbac` |
| Billing hub + Stripe webhook | **Good** | Subnav aligned | `billing-actions-rbac` |
| Storefront publish/media/manage | **Good** on actions; **gap on 2 publish API routes** | Subnav filtered | Many storefront RBAC tests |
| Integrations / channels | **Good** on manage mutations | Layout URL guard | Integration matrix tests |
| Import center | **Recent canon** | Type-scoped jobs | `import-center-rbac` |

### 4.4 Audit Logging

- Central: `auditLog()` ~62 call sites, 42 files.
- Denial audits: ~20 `*-permission-audit.ts` modules.
- `withAuditMutation()` defined but **0 production callers**.

---

## Step 5 — POS Audit (vs Toast / Square / Lightspeed / TouchBistro / Clover)

| Capability | State | Competitor Expectation | Gap | Risk | Priority |
|------------|-------|------------------------|-----|------|----------|
| Counter checkout | **Pilot-ready** | Fast tender | UX speed vs Square | Medium | P1 |
| Card present / Terminal | **Partial** | Certified hardware | Stripe Terminal wired; docs say placeholder | High | P0 honesty |
| Cash / pay-later | **Pilot** | Standard | OK for pilot | Low | — |
| Refunds / voids | **Partial** | Full reversal | MVP notes on processor reversal | Medium | P1 |
| Shifts / registers | **Pilot** (plan-gated) | Required | Closeout depth | Medium | P1 |
| Discounts / comps | **Beta** | Manager override | Tests exist | Medium | P1 |
| Bar tabs | **Preview** | Core for bars | Thin vs TouchBistro | Medium | P2 |
| Table service | **Preview** | Floor plan, split | Enums only | High | P2 |
| Handheld | **Partial** (shell) | Dedicated device UX | Reuses terminal | Medium | P2 |
| Offline | **Partial** | Certified offline | Client queue; server finalize required | High | P1 |
| Receipts / kitchen print | **Beta** | Reliable print | — | Medium | P2 |
| Loyalty / gift at POS | **Beta** | Seamless | Cross-channel parity tests needed | Medium | P1 |
| Reporting | **Beta** (plan-gated) | Shift Z-report | — | Medium | P2 |
| Multi-location POS | **Preview** | Enterprise | Workspace migration | High | P1 |

**POS score: 55/100** — Real money path; not competitor-ready for full-service restaurants.

**Tests:** 23 POS-tagged unit files; `e2e/pos-checkout-flow.spec.ts`; **not in default CI Playwright trio**.

---

## Step 6 — KDS / Kitchen Operations

| Capability | State | Notes |
|------------|-------|-------|
| Daily KDS bump/recall | **Pilot** | `actions/kitchen-daily-kds.ts`, permissions `kitchen.bump`/`kitchen.recall` |
| Main kitchen screen (production work items) | **Pilot** | Not ticket-level KDS |
| Station routing | **Partial** | URL `?station=` + heuristics, not canonical stations |
| Realtime | **Partial** | Supabase + 15s polling fallback in daily KDS |
| Expo / packing | **Beta** elsewhere | Fragmented product story |
| POS → kitchen routing | **Partial** | `pos-kitchen-routing-service.ts` |
| Tablet / fullscreen modes | **Present** | UX unproven at rush hour |
| Label printing | **Beta** | `label-print-queue` actions |
| Offline KDS | **Missing** | — |

**KDS score: 48/100** — Usable for daily-service mode; **not** rush-hour certified vs Toast KDS.

**Tests:** 2 KDS filename tests + kitchen RBAC; **no** dedicated realtime/bump E2E.

---

## Step 7 — Storefront / Online Ordering

| Flow | State | Risk | Missing vs Shopify/Square |
|------|-------|------|---------------------------|
| Browse / menu | **Pilot-ready** | Low | Theme ecosystem depth |
| Cart | **Live** | Medium | — |
| Checkout v2 | **Pilot-ready** | Medium | Broader failure E2E |
| Stripe online | **Live** when configured | High if misconfig | Connect parity |
| Pay later | **Live** | Medium | — |
| Pickup windows / delivery rules | **Beta** | Medium | Zone editor UX |
| Customer accounts | **Beta** | Medium | Lifecycle |
| Gift cards / loyalty public | **Beta** | Medium | Parity with POS |
| Publish / rollback | **Beta** | **High** on API routes without `storefront.publish` | DNS automation |
| Media upload | **Beta** | Medium | AV vendor cert in prod |
| Rate limits | **Good** on checkout | Medium | Not all admin routes |
| SEO / themes | **Beta** | Low | — |
| QR / kiosk | **Preview** | — | Competitor standard |

**Storefront score: 72/100** — Flagship module; govern claims and publish API gaps.

---

## Step 8 — Inventory / Costing / Purchasing

| Capability | Implementation | Correctness Risk | Priority |
|------------|----------------|------------------|----------|
| Recipes / costing | `services/costing/`, `actions/costing.ts` | Medium — math tests exist | P1 |
| POS depletion | `pos-inventory-impact-service.ts`, `pos-recipe-depletion` | **High** if not configured | P0 |
| Stock counts / waste | `actions/inventory.ts` | Tenant-only guard gap | P1 |
| Purchase orders | `actions/purchasing.ts` | Beta | P1 |
| Theoretical vs actual | AVT services | Reporting trust | P2 |
| Multi-location inventory | Models exist | Workspace scope | P1 |
| Commissary transfers | `actions/commissary.ts` | **No permission key** | P0 |

**Inventory score: 58/100**

---

## Step 9 — CRM / Loyalty / Gift Cards / Marketing

| Area | State | Risk |
|------|-------|------|
| Customer profiles / segments | **Pilot-ready** | PII export permissions exist |
| Loyalty | **Beta** | POS/online parity |
| Gift cards | **Beta** | Fraud/recovery |
| Campaigns / email | **Preview** | Mailchimp **not implemented** |
| Consent | **Partial** | `marketing-consent` tests |
| Attribution | **Early** | — |

**CRM score: 60/100**

---

## Step 10 — Integrations / API / Webhooks

### Integration Maturity

| Integration | State | Webhook | Tests | Sales claim |
|-------------|-------|---------|-------|-------------|
| Stripe | **Live** | Yes | Strong | Yes (qualified) |
| Shopify | **Pilot** | Yes (4 routes) | Partial | Qualified |
| WooCommerce | **Beta** | Yes | Partial | Qualified |
| Uber Eats | **Placeholder** | Yes (skeleton) | Signature only | **No** |
| DoorDash | **Placeholder** | No | Minimal | **No** |
| Grubhub | **Placeholder** | No | Minimal | **No** |
| QuickBooks / Xero | **Export beta** | No | RBAC only | Export only |
| 7shifts | **Scaffold** | No | None | **No** |
| Twilio SMS | **Optional env** | No | None | Optional |
| Mailchimp | **Missing** | No | None | **No** |

### Public API (`app/api/public/v1/`)

- **8** routes; Bearer `kos_*` keys; enterprise gate in `lib/api-public/resolve-enterprise-api.ts`.
- Tests: auth, orders, cross-tenant — **other 6 resources thin**.

### Webhooks

- **49** routes; Stripe/Shopify/Woo/Uber Eats covered; many experiment/compliance webhooks **untested**.

---

## Step 11 — DevOps / CI / Vercel / Cron

### CI Gates (`.github/workflows/ci.yml`)

| Gate | Command | Status (expected) | Risk if fails |
|------|---------|-------------------|---------------|
| Typecheck | `npm run typecheck` | Runs on 8GB heap | OOM locally |
| Prisma validate | `npx prisma validate` | Pass | Schema drift |
| Production crons | `validate:production-crons` | **Fixed path** | Schedule drift |
| Cron inventory | `validate:cron-inventory` | Pass | Orphan routes |
| API registry | `validate:api-route-registry` | Pass | Ungoverned routes |
| Unit tests + coverage | `npm test`, `test:coverage` | Pass | — |
| POS RBAC | `test:pos-rbac` | Pass | Regression |
| Build | `npm run build` | Pass with placeholders | — |
| Playwright | **3 specs only** | A11y + access denial | **Major gap** |
| Security DB job | `test:security` | Postgres service | Good |

### Vercel

- `installCommand`: `npm ci && prisma generate`
- **15** production crons in `vercel.json` aligned with `config/vercel/crons-production.json`
- Build: `scripts/vercel-build.sh` — reuse `.next`, 14GB heap on Vercel

### Cron Risk

| Gate | State | Evidence |
|------|-------|----------|
| Production manifest | **15 jobs** | `vercel.json` |
| Repo cron routes | **137** | Includes `hypergraph-l11-*`, `martian-orbital-*`, brainstem sync, etc. |
| Risk | **High** | Accidental exposure or confusion; attack surface |

---

## Step 12 — QA / Test Coverage by Critical Flow

| Flow | Tests? | Path | Gap | Risk | Pri |
|------|--------|------|-----|------|-----|
| Signup/login | Partial | auth tests, e2e setup | SSO | Med | P2 |
| Publish storefront | Unit | storefront RBAC | **API publish routes** | High | P0 |
| Online order + pay | Strong unit; opt-in E2E | storefront-order, stripe matrix | Default CI E2E | High | P0 |
| Payment failure recovery | Unit | storefront payment tests | Full E2E | Med | P1 |
| POS checkout | Unit + 1 E2E | pos-checkout-flow | Not in CI | High | P0 |
| Refund/void | Unit | pos-refund-void-service | E2E | Med | P1 |
| KDS bump | Unit RBAC | kitchen-daily-kds | Realtime E2E | High | P1 |
| Inventory depletion | Unit | recipe-depletion | POS E2E chain | High | P1 |
| Loyalty earn/redeem | Partial | rewards-rbac | Cross-channel E2E | Med | P1 |
| Cross-tenant denial | **Strong** | `test:security` | — | Low | — |
| Webhook duplicate | Integration | stripe idempotency | Other providers | Med | P1 |
| Malicious upload | Unit | upload-policy | Prod AV hook | Med | P1 |
| Shopify order loop | **Missing E2E** | — | Full loop | High | P1 |

**QA score: 65/100** (unit-strong, CI-E2E-weak)

---

## Step 13 — UX / Design System

- **739** components — duplication likely across dashboard/storefront/POS.
- POS terminal uses pilot loading/error chrome.
- Role-based nav **in progress**; dashboard still broad vs maturity.
- Storefront checkout: dedicated client components; mobile-oriented.
- Permission-denied states: improving on POS/storefront; inconsistent on legacy pages.

**Frontend/UX score: 62/100**

---

## Step 14 — Performance / Scalability

| Area | Risk | Evidence | Fix | Pri |
|------|------|----------|-----|-----|
| Build / typecheck memory | High | 8–14GB heaps, SSG concurrency=1 | Project references / slices | P0 |
| Route count | High | 699 pages | ISR audit; remove dead routes | P2 |
| Prisma schema size | High | 362 models | Query review; indexes | P1 |
| Storefront edge middleware | Medium | Host resolution fetch 2s timeout | Cache | P2 |
| Cron load | Medium | 15 prod jobs OK; 137 routes exist | Archive non-prod | P0 |
| Realtime KDS polling fallback | Medium | 15s poll | Certify Supabase path | P1 |

---

## Step 15 — Technical Debt

| Debt | Evidence | Risk | Consolidation | Pri |
|------|----------|------|---------------|-----|
| 137 cron routes | `app/api/cron/` | Deploy/confusion | Move to `_archive` or flag | P0 |
| 1,434 docs | `docs/` | Wrong sales truth | Canonical 12-doc set | P1 |
| ~85 tenant-only actions | grep | Privilege escalation | RBAC migration waves | P0 |
| Permission helper proliferation | 20+ `require-*-actor` | Drift | Single mutation access | P1 |
| Storefront publish API bypass | 2 routes | Live site risk | `storefront.publish` | P0 |
| Email superadmin bypass | `platform-owner.ts` | Audit/compliance | Platform roles | P0 |
| Experimental theme/ZK crons | route names | Noise/cost | Hide from inventory | P1 |
| OWNER role checks in actions | monetization, CS, channel-cert | Inconsistent | Permission keys | P1 |

---

## Step 16 — Competitor Re-Check (Summary)

| Competitor | KitchenOS Position | Gap | Opportunity | Next Action |
|------------|-------------------|-----|-------------|-------------|
| Toast | Behind on POS/KDS/hardware | Table service, certified KDS | Unified order spine | Finish POS RBAC + honest hardware |
| Square | Behind on POS simplicity; **ahead** on ops breadth | Ease of use | Branded storefront + ops | Simplify nav; storefront flagship |
| Lightspeed | Behind inventory depth | Multi-loc variance | Order-linked costing | Depletion E2E |
| TouchBistro | Behind table/bar | Floor plan | Defer table sales | Preview only |
| Shopify | Behind theme ecosystem; **ahead** kitchen link | Themes | Restaurant launch wizard | Publish hardening |
| 7shifts/Homebase | Behind labor UX | Scheduling polish | Labor + POS unified | Canon labor RBAC |
| QuickBooks/Xero | Behind GL; **OK** as export | Full accounting | Ops → finance exports | Export certification |

**Do not compete yet on:** native hardware ecosystem, enterprise SSO, full GL, DoorDash/Grubhub live marketplaces, certified offline POS.

**Leapfrog opportunity:** Single order model across storefront + POS + production + CRM with honest maturity labels.

---

## Step 17 — Scorecard (2026-05-27)

| Area | Score | Improved | Worsened | Blocks +10 |
|------|------:|----------|----------|------------|
| **Overall** | **64** | POS RBAC, cron CI, storefront RBAC | Cron route bloat | E2E CI + RBAC completion |
| Product strategy | 70 | Canonical docs exist | Nav vs maturity | Nav governance |
| Architecture | 58 | Order spine | Monolith weight | Cron archive |
| Frontend/UX | 62 | POS shell parity | Complexity | Nav reduction |
| Backend/API | 66 | Route registry | Unguarded APIs | Publish route fix |
| Database | 60 | Workspace migration tools | 362 models | Coverage completion |
| POS | 55 | Terminal lifecycle tests | Hardware gap | E2E + offline |
| KDS | 48 | Daily KDS permissions | No ticket KDS | Productized KDS v1 |
| Storefront | 72 | Checkout retry, RBAC | Publish API gap | E2E in CI |
| Inventory | 58 | Services exist | Depletion proof | Sale→deplete E2E |
| CRM/loyalty | 60 | RBAC alignment | Campaigns | Cross-channel tests |
| Integrations | 45 | Stripe strong | Placeholders sold? | Hide placeholders |
| Security | 58 | Cron timing-safe | Public POST routes | Fail-closed IoT |
| RBAC | 52 | POS/storefront slices | 85 tenant-only actions | Wave 2 migration |
| DevOps | 70 | Cron validation | E2E not gated | Add money-path E2E |
| QA | 65 | 399 unit tests | CI Playwright=3 | Expand CI tier |
| Performance | 55 | Vercel build reuse | Page count | Typecheck slices |
| Enterprise readiness | 40 | Audit platform | SSO/compliance | RBAC + exports |
| Marketing/sales readiness | 55 | Maturity matrix | Doc sprawl | Single claims doc |
| Investor DD readiness | 50 | Data room docs | Contradictory audits | This re-audit as canonical |

---

## Step 18 — New Risks After Recent Autonomous Cycles

1. **False confidence from unit-only POS/storefront tests** while CI skips checkout E2E.
2. **RBAC partial migration** — new canonical keys on POS but tenant-only on commissary, notification-rules, costing-adjacent flows.
3. **Storefront publish API routes** still owner-match only — regression risk if actions are fixed but API not.
4. **Cron route proliferation** — experimental names suggest unreviewed autonomous additions.
5. **Working tree cleanliness** — `tests/node_modules/` untracked; should not ship.
6. **Superadmin email bypass** — unchanged security debt.
7. **Integration registry vs marketing** — DoorDash/Grubhub still placeholder; risk of oversell.
8. **Typecheck** — production build fixed but full local `tsc` may still OOM without 8GB+.

---

## Recommended Next Master Execution Strategy (15–30 Cycles)

### Phase A — Platform truth (cycles 1–5)
1. Fix storefront publish API routes (`storefront.publish`).
2. Remove/neutralize email allowlist bypasses; platform roles only.
3. Fail-closed IoT and harden `leads/roi`, `nps` POST routes.
4. RBAC wave 2: notification-rules, commissary, monetization, settings-center.
5. Archive or gate non-production cron routes; document 15 prod crons only.

### Phase B — Money paths (cycles 6–12)
6. Add CI job: storefront checkout + POS checkout + payment failure (3–5 E2E).
7. POS: offline policy doc + tests; defer hardware claims.
8. Inventory: sale→deplete integration test from POS + storefront.
9. Storefront: duplicate payment + webhook idempotency E2E.
10. Public API: contract tests for remaining v1 resources.

### Phase C — Kitchen & ops productization (cycles 13–20)
11. KDS v1 spec: ticket-level bump, station model, one certified realtime path.
12. Consolidate kitchen screen vs daily KDS UX under one nav entry.
13. Table service: preview only — no marketing until floor plan exists.
14. Labor: schedule/timeclock RBAC audit completion.

### Phase D — GTM governance (cycles 21–30)
15. Rewrite canonical 12 docs; archive contradictory audits.
16. Nav filter by `feature-maturity-matrix` statuses.
17. Integration marketplace: hide PLACEHOLDER from default UI.
18. Typecheck slicing for CI/local parity.
19. Performance pass on top 10 dashboard queries.
20. Investor pack: single scorecard sourced from this doc.

---

## Final Answers

| Question | Answer |
|----------|--------|
| Audit file | `docs/full-strategic-reaudit-2026-05-27.md` |
| Master prompt input | `docs/next-master-prompt-input-2026-05-27.md` |
| Current master prompt still valid? | **Partially** — priorities right, facts outdated |
| New master prompt required? | **Yes, immediately** |
| Safe to continue blind cycles? | **No** — need doc + RBAC + E2E guardrails first |
| Emphasize | RBAC completion, money-path E2E, cron hygiene, KDS v1, honesty |
| Avoid | New modules, experimental crons, competitor parity claims |

---

*Evidence gathered 2026-05-27 via repository inspection, `git log`, file counts, grep, subagent read-only audits, and review of canonical docs dated 2026-05-26.*

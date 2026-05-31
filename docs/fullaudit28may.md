# OS Kitchen Full Audit — 28 May 2026

**Date:** 2026-05-28  
**Method:** Read-only repo inspection @ `70a467b` on `main`; inventory commands; artifact review; code path verification; synthesis of post–Era 19 audit family + Era 20 cycles 1–18  
**HEAD commit:** `70a467b` — `feat(era20): cycle 18 integration health recovery flow proof on health hub`  
**Supersedes:** All prior dated full audits for strategic decisions; companion to `docs/*-post-era19-2026-05-28.md`  
**Rule:** No maturity inflation. No fake PASS. Evidence over narrative.

---

# 1. Executive Summary

OS Kitchen is a **Next.js App Router monolith** restaurant operating system: orders, POS, storefront, KDS, production, packing, inventory, CRM, labor, billing, integrations, and platform admin. Era 19 delivered five **real UX pillars** (Owner Daily Briefing, Launch Wizard, Integration Health Center, operational command-flow convergence, partial operational intelligence). Era 20 cycles 1–18 added **proof wiring, flow proofs, permission-denied guards, and pilot package docs** — but **P0 staging proof remains SKIPPED** (`awaiting_ops_credentials`, 11 env vars). **No paid pilot customer. GO/NO-GO remains NO-GO.**

**Verdict:** OS Kitchen is an **impressive demo-grade operational nervous system** in the dashboard for owners/managers. It is **not commercially closed** for paid pilots, enterprise buyers, or competitor parity claims until ops vault credentials, live channel smoke, SSO IdP proof, and a signed LOI exist.

| Area | Current State | Score | Risk | Next Action |
|------|---------------|------:|------|-------------|
| Governance / CI honesty | Certified wave 4 RBAC, mutation linter, money-path CI, claims registry | **100** | Low | Sustain certs |
| Blended product | Deep feature surface; Era 19 pillars + Era 20 proof wiring | **91** | Medium | Execute P0 PASS |
| WOW factor | Real briefing/wizard/health pillars; no market proof | **59** | High | Demo + pilot metrics |
| Operator UX | Role packs, deep-links, POS/KDS clarity | **86** | Medium | Nav hide sweep |
| Commercial pilot readiness | Runbook + package ready; execution blocked | **71** | **Critical** | Ops vault + LOI |
| Pilot readiness (executable) | Flow proofs wired; artifacts SKIPPED | **66** | **Critical** | `smoke:p0-staging-proof-unblock` PASS |
| Enterprise readiness | SSO pilot_foundation; procurement pack honest | **73** | High | IdP staging PASS |
| Competitor readiness | Software spine strong; hardware/offline weak | **59** | High | Honest defer claims |
| Security / RBAC | 57 permission keys; guard-before-query expanded Era 20 | **90** | Medium | Pen test pre-enterprise |
| Technical scalability | 365 models, 614 services, 701 pages | **71** | Medium | Post-pilot consolidation |

**Strongest areas:** Order spine + money-path CI; KDS/production/packing pilot_ready surfaces; Integration Health honesty UX; commercial pilot governance pack; Era 19 Owner Daily Briefing; RBAC wave 4.

**Weakest areas:** P0 ops credentials gap; zero paid pilot references; live Woo/Shopify SKIPPED; SSO IdP proof SKIPPED; nav sprawl (701 pages); table service/campaigns preview; unified loyalty/inventory locked; hardware/offline absent.

**Biggest risks:** Selling before P0 PASS; maturity inflation in GTM; 11 missing env vars blocking all staging proof; no customer/LOI; inverted priority history (39 UX cycles before proof band).

**Biggest opportunities:** Honest Integration Health Center as moat; Launch Wizard TTV story post-proof; unified order spine from storefront+POS+webhooks; role-based operator landing; KDS priority lane; commercial GO/NO-GO artifact discipline.

| Readiness question | Answer |
|--------------------|--------|
| **Pilot-ready (controlled)?** | **NO** — only after P0 PASS + GO artifact + qualified ICP + signed LOI per `commercial-pilot-runbook.md` |
| **Enterprise-ready?** | **NO** — IdP proof, pen test, SCIM/SOC2 deferred honestly |
| **Competitor-ready?** | **NO** — Toast/Square hardware, offline, rush KDS, unified loyalty ahead |
| **What must happen next?** | Era 20 Band A completion: ops vault → P0 PASS → channel/SSO/staging PASS → GO → kickoff |

---

# 2. Git / Repo State

| Item | Evidence | Status | Risk |
|------|----------|--------|------|
| Branch | `git branch --show-current` → `main` | **main** | Low |
| HEAD | `70a467bca202efbc799d69a0e5816a3d4867332b` | **70a467b** | Low |
| Working tree | `git status` → clean | **Clean** | Low |
| Untracked files | None at audit time | **None** | Low |
| Recent commits (30) | Era 20 cycles 1–18 (proof wiring, flow proofs, permission-denied); Era 19 cycles 1–39 (WOW convergence) | **Proof band partial** | Medium — P0 still SKIPPED |
| Audit mode | Read-only inspection; only `docs/fullaudit28may.md` created | **Read-only** | Low |
| Generated artifacts | `artifacts/p0-staging-proof-unblock-summary.json` present (SKIPPED) | **Committed/present** | Medium — do not fake PASS |
| Commit needed | New audit doc only | **Yes** (docs only) | Low |

**Era timeline at audit HEAD:**
- Era 18: 60 cycles — operator focus (closed)
- Era 19: 39 cycles — WOW convergence (product goal largely met; no scorecard doc)
- Era 20: 18 cycles — proof execution wiring (Band A **not complete**; P0 still `awaiting_ops_credentials`)

**Missing canonical docs (noted):**
- `docs/era19-cycle-completion-scorecard-2026-05-28.md` — **missing**
- `docs/era20-cycle-completion-scorecard-2026-05-28.md` — **missing** (expected at era close)

**Required docs read status:**

| Doc | Status |
|-----|--------|
| `docs/full-strategic-reaudit-post-era19-2026-05-28.md` | ✅ Read (@ 7b17ffa baseline) |
| `docs/feature-by-feature-audit-post-era19-2026-05-28.md` | ✅ Read |
| `docs/operator-workflow-audit-post-era19-2026-05-28.md` | ✅ Read |
| `docs/competitor-gap-audit-post-era19-2026-05-28.md` | ✅ Read |
| `docs/ux-design-system-audit-post-era19-2026-05-28.md` | ✅ Read |
| `docs/commercial-readiness-audit-post-era19-2026-05-28.md` | ✅ Read |
| `docs/security-rbac-audit-post-era19-2026-05-28.md` | ✅ Read |
| `docs/technical-debt-audit-post-era19-2026-05-28.md` | ✅ Read |
| `docs/next-master-prompt-input-post-era19-2026-05-28.md` | ✅ Read |
| `docs/next-30-cycle-execution-map-post-era19-2026-05-28.md` | ✅ Read |
| `docs/feature-maturity-matrix.md` | ✅ Read (partial + Era 20 cycles) |
| `docs/implementation-backlog.md` | ✅ Indexed (264 `###` sections) |
| `docs/commercial-pilot-runbook.md` | ✅ Read (partial) |
| `docs/canonical-doc-index.md` | ✅ Read |

---

# 3. Complete System Inventory

| Metric | Count | Evidence Command | Notes |
|--------|------:|------------------|-------|
| App Router pages | **701** | `find app -name 'page.tsx' -o -name 'page.ts' \| wc -l` | Nav sprawl risk |
| Dashboard pages | **528** | `find app/dashboard -name 'page.tsx' \| wc -l` | IA debt |
| Platform pages | **48** | `find app/platform -name 'page.tsx' \| wc -l` | Support/admin |
| Public storefront pages | **20** | `find app/s -name 'page.tsx' \| wc -l` | `app/s/[storeSlug]/` |
| API routes | **176** | `find app/api -name 'route.ts' \| wc -l` | Review public POST |
| Public API v1 routes | **8** | `find app/api/public -name 'route.ts' \| wc -l` | Beta; no SLA |
| Webhook routes | **46** | `find app/api/webhooks -name 'route.ts' \| wc -l` | Partial replay ops |
| Cron routes | **16** | `find app/api/cron -name 'route.ts' \| wc -l` | Production allowlist in policy |
| Server action modules | **145** | `find actions -name '*.ts' \| wc -l` | Registry gaps vs 18 mutation entries |
| Services | **614** | `find services -name '*.ts' \| wc -l` | +2 vs Era 19 audit |
| Components | **842** | `find components -name '*.tsx' \| wc -l` | +9 vs Era 19 |
| Hooks | **3** | `find hooks -name '*.ts' -o -name '*.tsx' \| wc -l` | Thin hook layer |
| Stores | **243** | `find . -name '*store*.ts'` (excl node_modules) | Many zustand/context |
| Prisma models | **365** | `grep -c '^model ' prisma/schema.prisma` | Typecheck pressure |
| Prisma enums | **268** | `grep -c '^enum ' prisma/schema.prisma` | Schema noise |
| Package scripts | **682** | `node -e "Object.keys(require('./package.json').scripts).length"` | Discovery via qa-master-test-plan |
| Smoke scripts | **53** | `ls scripts/smoke* \| wc -l` | P0 orchestrators exist |
| Cert scripts | **8** | `ls scripts/cert* \| wc -l` | CI cert wiring |
| GitHub workflows | **17** | `find .github/workflows -name '*.yml' \| wc -l` | Staging unproven |
| Vitest files | **956** | `find tests -name '*.test.ts' \| wc -l` | +38 vs Era 19 |
| Playwright specs | **36** | `find e2e -name '*.spec.ts' \| wc -l` | KDS staging awaiting PASS |
| Docs (total `.md`) | **1557** | `find docs -name '*.md' \| wc -l` | Truth drift risk |
| Canonical doc index rows | **~115** | `docs/canonical-doc-index.md` | Governance |
| Maturity matrix rows | **~57** | `docs/feature-maturity-matrix.md` table rows | Honest labels |
| Backlog sections | **264** | `grep -c '^###' docs/implementation-backlog.md` | Execution queue |
| Permission keys | **57** | `grep -E '^\s+"[a-z._]+":' lib/permissions/permissions.ts \| wc -l` | Wave 4 certified |
| RBAC helpers | **12+ modules** | `lib/permissions/*.ts` export functions | guards, mutation-access |
| Mutation registry entries | **18** | `grep -c '^\s*id: "' lib/permissions/domain-mutation-registry.ts` | Linter certified |
| Integrations (registry) | **8** | `lib/integrations/integration-registry.ts` | 0 LIVE, 4 BETA, 4 PLACEHOLDER |
| Placeholder integrations | **4** | DoorDash, Grubhub, Uber Eats, Uber Direct | Honest PLACEHOLDER |
| Live integrations (registry) | **0** | `integration-registry.ts` — no `status: "LIVE"` | **Critical GTM gap** |
| Era 19 unit test files | **42** | `find tests -name '*era19*'` | Strong pillar coverage |
| Era 20 unit test files | **37** | `find tests -name '*era20*'` | Flow proof + guards |
| TODO/FIXME (app/lib/services) | **~53** | ripgrep (prior audit baseline; sparse in scan) | Low |
| Placeholder UI strings | **~574** | ripgrep `coming soon\|placeholder` (prior baseline) | Preview surfaces |
| Hardcoded test emails | Low | `@example.com` scan | Mostly test fixtures |

**Architecture summary:** Frontend (App Router pages + 842 components) → server actions (145 modules) + API routes (176) → services layer (614 TS modules) → Prisma (365 models) → PostgreSQL (Supabase). Auth via Supabase session + workspace RBAC. Tenant scoping via `requireTenantActor` / workspace guards on mutations.

---

# 4. Product Reality Model

| Product Area | Status | Evidence | Sales Claim Allowed? | Risk | Required Fix |
|--------------|--------|----------|---------------------|------|--------------|
| Auth | **live** | `app/login`, Supabase auth | Yes (standard login) | Low | MFA P2 |
| SSO | **pilot_foundation** | enterprise-sso R2; IdP smoke SKIPPED | **No** (production SSO) | **High** | P0 IdP proof |
| Workspace/Tenant | **beta/live** | Prisma workspace model, guards | Qualified | Medium | Multi-loc polish |
| RBAC | **beta/strong** | 57 keys, wave 4 cert | Qualified | Low | Registry expansion |
| Owner Daily Briefing | **pilot_ready UX** | `/dashboard/today`, era19+20 services | Qualified demo | Medium | Outcome telemetry |
| Launch Wizard | **beta** | `/dashboard/launch-wizard`, era20 production-grade | Qualified setup narrative | Medium | TTV measurement |
| Integration Health Center | **beta** | `/dashboard/integration-health`, trust layer era20 | **Unique honest sell** | Medium | P0 live smoke PASS |
| Storefront | **pilot_ready** | `app/s/`, tier-2 CI | Qualified | Medium | Domain automation P2 |
| POS | **beta** | tier-2b CI, flow proof era20 | Qualified software POS | Medium | Hide hardware |
| KDS | **pilot_ready** | priority lane era19 | Qualified; no rush SLO | Medium | Staging Playwright PASS |
| Production | **pilot_ready** | board + calendar | Qualified | Low | KDS sync depth P2 |
| Packing | **pilot_ready** | QC clarity era19 | Qualified | Low | Scanner hardware P3 |
| Inventory | **beta** | POS-only depletion locked | **No unified stock** | Medium | Honest messaging only |
| CRM | **pilot_ready** | crm services | Qualified | Low | Campaign automation defer |
| Loyalty | **beta dual ledger** | locked policy | **No unified rewards** | High | Defer unlock |
| Gift Cards | **beta dual** | locked | Qualified channel-specific | Medium | Defer cross-channel |
| Staff/Labor | **beta** | schedule, time clock | Qualified basic | Medium | 7shifts depth P2 |
| Billing | **pilot_ready** | Stripe subscriptions | Qualified | Low | Enterprise invoicing P2 |
| Public API | **beta** | 8 routes | **No SLA** | Medium | Scope picker P2 |
| Webhooks | **beta** | 46 routes, security matrix | Qualified ingest | Medium | Replay ops P1 |
| Integrations | **beta/placeholder** | 0 LIVE registry | **No LIVE marketplace** | **High** | Woo/Shopify live PASS |
| Platform Admin | **internal_only/beta** | `app/platform/` | N/A | Medium | Support boundaries |
| Commercial Pilot | **live governance** | runbook, GO/NO-GO evaluator | Process yes; GO **no** | **Critical** | Execute P0 |
| Enterprise Procurement | **beta (honest pack)** | `enterprise-procurement-pack.md` | Honest roadmap only | Medium | IdP + pen test |
| Investor Readiness | **template** | one-pager era17 | **No KPI claims** | High | Post-pilot metrics |

---

# 5. Feature-by-Feature Audit

**Legend:** Status from `feature-maturity-matrix.md` + code verification @ `70a467b`. UX/Test scores 0–100 honest.

| Feature | Status | Routes/Files | Buttons/Actions | Backend Logic | RBAC | Tests | UX Score | Risk | Next Action |
|---------|--------|--------------|-----------------|---------------|------|-------|---------:|------|-------------|
| 1 Marketing site | live | `app/page.tsx` | Book demo, nav | `book-demo.ts` | public | marketing cert | 75 | Low | sustain |
| 2 Demo funnel | live | demo routes | Submit demo form | CRM lead capture | public | partial | 70 | Low | finish attribution |
| 3 Auth/login | live | `/login` | Email/password, SSO entry | Supabase auth | public | auth tests | 78 | Low | MFA P2 |
| 4 Signup | live | `/signup` | Create workspace | bootstrap service | public | signup tests | 75 | Low | sustain |
| 5 Staff invites | beta | staff settings | Invite, revoke | `actions/staff.ts` | `staff.manage` | staff tests | 72 | Medium | finish onboarding |
| 6 SSO | pilot_foundation | `/login`, SSO admin | Configure IdP, test login | enterprise-sso R2 | workspace.settings | era16–18 unit; staging SKIP | 80 | **High** | **P0 IdP proof** |
| 7 SCIM | not_implemented | procurement only | — | — | — | — | — | Medium | defer |
| 8 Workspace/tenant | beta/live | dashboard shell | Switch workspace | Prisma + guards | `workspace.view` | tenant tests | 70 | Medium | multi-loc P2 |
| 9 RBAC | beta/strong | permissions UI | Assign roles | `permissions.ts` | admin | wave4 cert | 75 | Low | sustain |
| 10 Domain mutation registry | beta | `domain-mutation-registry.ts` | — | 18 helpers | mutation-access | linter cert | — | Medium | expand slow |
| 11 Audit logs | beta | `/dashboard/audit` | Export CSV | `services/audit/` | `audit.export` | export tests | 68 | Medium | retention P2 |
| 12 Support impersonation | internal_only | platform go-live | Start/end session | platform-impersonation | platform roles | era20 flow proof | 72 | High | access review |
| 13 Dashboard shell | beta | `app/dashboard/` | Nav, search | layout services | role-based | nav tests | 82 | Medium | nav redesign |
| 14 Navigation | beta | nav config | Sidebar links | page-maturity-governance | RBAC filter | nav cert | 65 | Medium | hide preview 40% |
| 15 Role-based landing | beta | persona paths | Auto-redirect | landing service | role | era18+19 tests | 85 | Low | sustain |
| 16 Owner Daily Briefing | pilot_ready UX | `/dashboard/today` | Tile clicks, ranked actions | `owner-daily-briefing-service.ts` | role packs | 20+ era19; era20 prod-grade | 82 | Medium | telemetry |
| 17 Restaurant Launch Wizard | beta | `/dashboard/launch-wizard` | Step nav, next action | `launch-wizard-service.ts` | owner/manager | 7+ era19; era20 | 78 | Medium | TTV proof |
| 18 Integration Health Center | beta | `/dashboard/integration-health` | Recovery, smoke rerun links | health + artifact readers | `integrations.read` | era19+20 trust layer | 85 | Medium | P0 PASS |
| 19 Owner onboarding | beta | wizard + getting-started | Complete steps | onboarding services | owner | era18 tests | 80 | Medium | merge go-live |
| 20 Staff onboarding | beta | invites flow | Accept invite | staff service | `staff.manage` | partial | 70 | Medium | finish |
| 21 Go-live checklist | beta | `/dashboard/go-live` | Check items, unlock | go-live services | `go-live.manage` | era18 tests | 78 | Medium | merge wizard |
| 22 Order hub | pilot_ready | `/dashboard/order-hub` | Filter, actions, channel hints | `order-hub-service.ts` | `orders.manage` | era18+20 guard | 85 | Low | sustain |
| 23 Manual orders | pilot_ready | order creation | Create order | order-creation | `orders.manage` | tier tests | 75 | Low | promote |
| 24 Storefront core | pilot_ready | `app/s/[storeSlug]/` | Browse, cart | storefront services | public + admin | tier-2 CI | 75 | Medium | sustain |
| 25 Storefront checkout | pilot_ready | checkout flow | Pay | Stripe + order spine | public | tier-2 CI | 78 | Low | sustain |
| 26 Storefront publish | beta | publish UI | Publish theme | publish actions | `storefront.publish` | publish tests | 72 | Medium | finish |
| 27 Storefront builder/theme | beta | builder | Edit blocks | builder services | `storefront.manage` | partial | 70 | Medium | P2 |
| 28 Storefront domains | preview | domains settings | Add domain | domains actions | `storefront.manage` | partial | 55 | High | finish P2 |
| 29 Storefront media | beta | media library | Upload | upload+scan | `storefront.media.manage` | upload tests | 68 | Medium | AV vendor P2 |
| 30 Storefront customer accounts | beta | account API | Login/register | account services | customer | partial | 65 | Medium | P2 |
| 31 Storefront SEO | beta | seo settings | Edit meta | seo lib | `storefront.manage` | partial | 65 | Low | P3 |
| 32 POS checkout | beta | POS hub/terminal | Add items, pay | POS checkout svc | `pos.checkout` | tier-2b CI | 80 | Medium | pilot train |
| 33 POS terminal | beta | `/dashboard/pos/terminal` | Speed mode, checkout | terminal svc | `pos.access` | era19+20 flow proof | 82 | Medium | sustain |
| 34 POS registers | beta | registers page | Open register | register svc | `pos.register.manage` | partial | 70 | Low | P2 |
| 35 POS shifts | beta | shifts page | Open/close shift | shift svc | `pos.shift.*` | era20 closeout proof | 85 | Low | sustain |
| 36 POS refunds | beta | refunds UI | Issue refund | refund svc | `pos.refund` | money-path tests | 70 | Medium | sustain |
| 37 POS voids | beta | voids UI | Void txn | void svc | `pos.void` | money-path tests | 70 | Medium | sustain |
| 38 POS discounts | beta | discount UI | Apply discount | discount svc | `pos.discount.apply` | era20 audit proof | 78 | Medium | sustain |
| 39 POS manager override | beta | terminal `#pos-manager-override` | Override approval | override svc | `pos.manager.override` | era19+20 proof | 80 | Low | sustain honest |
| 40 POS receipts | beta | receipt settings | Print/email | receipt svc | `pos.access` | partial | 68 | Low | P2 |
| 41 POS reports | beta | POS reports | View/export | reports svc | plan-gated | partial | 65 | Low | P2 |
| 42 POS hardware | preview | Stripe Terminal route | Pair device | hardware svc | `pos.hardware.manage` | cert only | 50 | High | **hide** |
| 43 POS offline | not_implemented | — | — | — | — | — | — | High | defer |
| 44 Tables/floor | preview | tables actions | Seat, order | table svc | `pos.access` | preview tests | 45 | High | P2 beta |
| 45 Bar tabs | preview | tabs page | Open tab | tabs actions | `pos.access` | partial | 45 | Medium | P3 |
| 46 Handheld ordering | preview | handheld page | Order | handheld svc | `pos.access` | partial | 40 | Medium | P3 |
| 47 KDS | pilot_ready | `/dashboard/kitchen` | Bump, recall, priority | KDS svc | `kitchen.*` | era18+19 | 88 | Medium | staging proof |
| 48 KDS stations | beta | station config | Configure | routing svc | `kitchen.configure` | partial | 70 | Low | P2 |
| 49 KDS bump/recall | pilot_ready | KDS columns | Bump/recall buttons | kitchen mutations | `kitchen.bump/recall` | certified | 90 | Low | sustain |
| 50 KDS realtime | beta | 15s poll | Auto-refresh | polling | `kitchen.view` | partial | 70 | Medium | honest banner |
| 51 Production board | pilot_ready | production board | Move batches | production svc | `production.manage` | era18 | 82 | Low | sustain |
| 52 Production calendar | pilot_ready | calendar + `#drill` | Plan batches | calendar svc | `production.manage` | era19 drill | 85 | Low | sustain |
| 53 Packing | pilot_ready | packing hub | Pack order | packing svc | `packing.manage` | era19 QC | 82 | Low | sustain |
| 54 Packing verification | pilot_ready | verify console | Scan/verify | verify svc | `packing.manage` | partial | 80 | Low | sustain |
| 55 Labels | beta/preview | label surfaces | Print | label svc | `packing.manage` | partial | 60 | Low | P3 |
| 56 Catering | beta | catering quotes | Quote/order | catering svc | `orders.manage` | partial | 70 | Low | P2 |
| 57 Reservations | preview | reservations | Book table | reservations | preview | partial | 50 | Medium | defer |
| 58 Delivery routing | beta | routes | Dispatch | routes svc | `routes.manage` | partial | 65 | Medium | defer live |
| 59 Inventory | beta | inventory section | Count, adjust | inventory actions | `production.manage` | era20 layout guard | 68 | Medium | honest lock |
| 60 Inventory depletion | beta POS-only | policy locked | POS checkout depletes | depletion hook | POS only | cert locked | 70 | **High** | **locked** |
| 61 Recipe costing | beta | costing pages | Run costing | costing svc | reports | partial | 65 | Medium | spot-check |
| 62 Menu costing | beta | margin reports | View margins | margin svc | `reports.read.financial` | partial | 65 | Medium | P2 |
| 63 Purchasing | beta | PO flow | Create PO | purchasing svc | production.manage | partial | 68 | Medium | P2 |
| 64 Vendors | beta | vendors | Add vendor | vendor svc | partial | partial | 60 | Low | P3 |
| 65 Receiving | beta | receive PO | Receive | receiving svc | partial | partial | 60 | Low | P3 |
| 66 Waste | beta | waste log | Log waste | waste actions | partial | partial | 58 | Low | P3 |
| 67 Transfers | beta/preview | transfers | Transfer stock | transfer svc | partial | partial | 55 | Low | P3 |
| 68 Low-stock alerts | beta | alerts | Acknowledge | alert svc | partial | partial | 65 | Low | P3 |
| 69 CRM customers | pilot_ready | CRM hub | View/edit customer | crm services | `customers.*` | era20 guard | 72 | Low | sustain |
| 70 Segmentation | pilot_ready | segments | Create segment | segment svc | `customers.manage` | partial | 70 | Low | P2 |
| 71 Loyalty | beta dual | loyalty settings | Configure rules | loyalty svc | `loyalty.manage` | cert locked | 65 | **High** | **locked** |
| 72 Gift cards | beta dual | gift cards | Issue/redeem | giftcard svc | `giftcards.manage` | cert locked | 65 | High | **locked** |
| 73 Cross-channel rewards | deferred_locked | policy | — | — | cert | 0 | — | **High** | defer |
| 74 Campaigns | preview | growth campaigns | Create (preview) | growth svc | `growth.manage` | partial | 45 | Medium | defer |
| 75 Email/SMS marketing | preview/beta | marketing | Send (limited) | marketing svc | growth | partial | 50 | Medium | defer |
| 76 Feedback/NPS | preview | feedback | Submit/view | feedback svc | preview | partial | 50 | Low | defer |
| 77 Staff scheduling | beta | schedule | Edit shifts | schedule svc | `schedule.manage` | partial | 65 | Medium | P2 |
| 78 Time clock | beta | time clock | Clock in/out | timeclock svc | `timeclock.manage` | partial | 68 | Medium | P2 |
| 79 Payroll exports | preview | payroll route | Export CSV | payroll svc | `payroll.view` | partial | 55 | Medium | P3 |
| 80 Labor reports | beta | labor reports | View | labor svc | reports | partial | 65 | Medium | P2 |
| 81 Training | beta | training | Assign program | training svc | `training.*` | RBAC tests | 68 | Low | P2 |
| 82 Playbooks | beta | playbooks | Run playbook | playbook svc | `playbooks.*` | partial | 65 | Low | P2 |
| 83 Templates | beta | templates | Apply template | template svc | `templates.*` | partial | 70 | Low | P2 |
| 84 Food safety | preview | food-safety | Log (preview) | food-safety | preview | partial | 45 | Medium | hide |
| 85 Analytics | beta | reports hub | View charts | analytics svc | `reports.read.*` | era20 guard | 68 | Medium | P2 |
| 86 Forecasting | preview | forecast | View forecast | forecast svc | preview | partial | 40 | Low | defer |
| 87 Executive dashboard | beta | executive | Dismiss insights | executive svc | `executive.insights.manage` | partial | 65 | Medium | P2 |
| 88 AI/copilot | preview | copilot chat | Ask copilot | copilot svc | era20 guard | era20 cycle 17 | 50 | High | defer/hide |
| 89 Billing/subscriptions | pilot_ready | billing | Manage plan | billing svc | `billing.*` | era20 guard | 72 | Low | sustain |
| 90 Entitlements | pilot_ready | entitlements | View features | billing/entitlements | admin | cert | 70 | Low | sustain |
| 91 Stripe payments | pilot_ready | checkout/webhooks | Pay | Stripe integration | money guards | tier CI | 75 | Low | sustain |
| 92 Stripe webhooks | beta | `/api/webhooks/stripe` | — | webhook handler | signature | cert | 70 | Medium | sustain |
| 93 Public API v1 | beta | 8 public routes | CRUD orders | public API svc | API key scope | contract tests | 60 | Medium | no SLA |
| 94 OpenAPI | beta | partner pack docs | — | OpenAPI spec | — | cert | 65 | Low | P2 |
| 95 Webhooks platform | beta | 46 webhook routes | Configure endpoints | webhook svc | integrations | cert matrix | 75 | Medium | P1 replay |
| 96 Shopify | pilot_ready synthetic | channel settings | Connect, map products | shopify sync | `integrations.manage` | golden path CI; live SKIP | 80 | **High** | **P0 live smoke** |
| 97 WooCommerce | pilot_ready synthetic | channel settings | Connect webhook | woo sync | `integrations.manage` | golden path CI; live SKIP | 80 | **High** | **P0 live smoke** |
| 98 DoorDash/Uber/Grubhub | placeholder | integration cards | Configure (placeholder) | honesty registry | integrations.read | cert | 70 | Low | hide |
| 99 QuickBooks/Xero | beta | accounting integrations | Connect | accounting svc | integrations | partial | 55 | Medium | P2 |
| 100 7shifts/Homebase | beta | labor integrations | Connect | labor integration | integrations | partial | 55 | Medium | P2 |
| 101 Mailchimp/Klaviyo/Brevo/Twilio | beta/preview | growth integrations | Connect | marketing integrations | growth | partial | 50 | Medium | P3 |
| 102 GA4/PostHog/Sentry | beta | observability settings | Configure | analytics integrations | admin | partial | 60 | Low | P2 |
| 103 Enterprise procurement | beta | procurement pack doc | — | honest questionnaire | — | cert | 75 | Medium | honest only |
| 104 Commercial pilot runbook | live governance | GO/NO-GO, implementation | Run smokes | commercial services | platform | cert | 85 | **Critical** | **execute P0** |
| 105 Investor readiness | template | one-pager era17 | Generate draft | investor svc | — | smoke | 60 | High | post-pilot |

---

# 6. Button-by-Button / Action-by-Action Audit

Inspection of major interactive surfaces @ `70a467b`. **Verified pattern:** Era 19/20 added loading/error states, permission guards (guard-before-query), and honest blocked states on pillars. Preview modules may lack full state coverage.

## `/dashboard/today` (Owner Daily Briefing)

| Page | Button/Action | User Role | What It Should Do | Actual Handler | Backend/Action/API | Permission | Risk | Missing State | Fix |
|------|---------------|-----------|-------------------|----------------|-------------------|------------|------|---------------|-----|
| Today | Ranked action tile click | Owner/Manager | Deep-link to ops surface | `owner-daily-briefing-service` href registry | Server-loaded tiles | role pack filter | Low | Outcome telemetry | Instrument clicks |
| Today | Risk radar row | Owner | Open integration/order fix | tile-link registry | briefing aggregates | role filter | Low | — | sustain |
| Today | Launch wizard strip CTA | Owner | Open next wizard step | `/dashboard/launch-wizard` | launch-wizard-service | owner implied | Low | TTV unmeasured | timed study |
| Today | Pilot GO/NO-GO chip | Owner | Show honest NO-GO | reads `pilot-gono-go-summary` | commercial svc | owner | Low | — | sustain honesty |
| Today | P0 proof chip | Owner | Link to integration health | `#p0-trust-banner` anchor | P0 artifact reader | owner | Low | — | sustain |

## `/dashboard/launch-wizard`

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| Launch Wizard | Step navigator | Owner | Jump to setup step | client nav + server step state | `launch-wizard-service.ts` | owner/manager | Low | — | sustain |
| Launch Wizard | Next best step hero | Owner | Open highest-priority incomplete step | wizard hero CTA | step completion signals | owner | Low | — | sustain |
| Launch Wizard | Commercial blockers panel | Owner | Show P0/SSO/channel blockers | blocker merge svc | GO/NO-GO + P0 artifacts | owner | Low | — | sustain |
| Launch Wizard | Golden path panel (E20) | Owner | Map Tier 2 workflows | era20 operator golden path | workflow crosswalk doc | owner | Low | Tier 2 not executed | ops checklist |
| Launch Wizard | Integration error recovery link | Owner | Open health recovery | `/dashboard/integration-health` | health recovery | owner | Low | — | sustain |

## `/dashboard/integration-health`

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| Integration Health | P0 trust banner | Owner | List missing env vars | `integration-health-trust-layer-era20` | P0 artifact | `integrations.read` | Low | — | sustain |
| Integration Health | Channel card CTA | Owner | Next smoke action | channel cards era19 | smoke artifact reader | integrations.read | Medium | Live still SKIP | P0 creds |
| Integration Health | Recovery checklist step | Owner/Support | Prioritized fix steps | recovery era19+20 | recovery svc | integrations.read | Low | Live proof hop SKIP | P0 creds |
| Integration Health | Smoke artifact viewer | Support | View PASS/FAIL/SKIP | artifact depth era19 | JSON artifacts | support mode | Low | — | sustain |
| Integration Health | Support triage `?mode=support` | Platform support | Tenant-scoped triage | support-admin era19 | tenant guard | platform role | Medium | cross-tenant review | sustain tests |

## `/dashboard/order-hub`

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| Order Hub | Filter/search | Manager | Filter orders | client + server | `order-hub-service.ts` | `orders.manage` | Low | — | sustain |
| Order Hub | Row next action | Manager | Fix stuck order | era18 stuck-state | order-hub svc | orders.manage | Low | Live channel ingest SKIP | P0 |
| Order Hub | Channel hint (Woo/Shopify) | Manager | Product mapping link | era18 channel actions | mapping svc | integrations | Medium | live smoke SKIP | P0 |
| Order Hub | Fulfillment flow proof panel (E20) | Manager | 5-hop crosswalk | era20 storefront fulfillment proof | order spine | orders.manage | Low | ingest blocked honest | P0 |

## Storefront Admin / Publish

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| Storefront admin | Publish live | Owner | Publish theme | publish action | `storefront.publish` | publish perm | Medium | domain preview | P2 DNS |
| Storefront builder | Save draft | Manager | Persist draft | builder actions | storefront.manage | manage | Medium | complexity | wizard handoff |
| Domains | Add custom domain | Owner | Configure DNS | domains actions | DNS svc preview | manage | High | automation gap | P2 |

## POS Terminal / Shifts / Refunds

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| POS Terminal | Speed mode `?speed=1` | Cashier | Fast checkout UI | era19 speed mode | terminal svc | pos.access | Low | not default | default for cashiers |
| POS Terminal | Checkout | Cashier | Complete sale | checkout action | tier-2b path | pos.checkout | Low | — | sustain |
| POS Terminal | Manager override checklist | Manager | Approve override | `#pos-manager-override` | override svc | pos.manager.override | Low | no PIN parity | honest only |
| POS Shifts | Open shift | Cashier | Open register shift | shift open action | shift svc | pos.shift.open | Low | — | sustain |
| POS Shifts | Close shift (4-step) | Cashier | Close with checklist | era19+20 closeout | shift close | pos.shift.close | Low | — | sustain E20 proof |
| POS Refunds/Voids | Issue refund/void | Manager | Money mutation | refund/void actions | money svc | pos.refund/void | Medium | scattered UI | sustain |

## KDS / Production / Packing

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| KDS | Bump ticket | Kitchen | Mark prepared | bump mutation | kitchen svc | kitchen.bump | Low | poll not realtime | honest banner |
| KDS | Recall ticket | Kitchen | Return to prep | recall mutation | kitchen svc | kitchen.recall | Low | — | sustain |
| KDS | Priority lane strip | Kitchen | Focus top 3 | era19 priority lane | scoring svc | kitchen.view | Low | rush SLO unproven | staging proof |
| Production Calendar | Drill checklist `#production-calendar-drill` | Manager | Run daily drill | era19 drill | calendar svc | production.manage | Low | — | sustain |
| Packing | QC checklist `#packing-qc-clarity` | Packer | Verify QC steps | era19 QC | packing svc | packing.manage | Low | scanner hardware | P3 |
| Packing Verification | Verify scan | Packer | Confirm items | verify action | verify svc | packing.manage | Medium | hardware | P3 |

## CRM / Loyalty / Gift Cards / Staff / Billing

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| CRM customers | View/edit customer | Manager | CRM CRUD | crm actions | crm svc | customers.manage | Low | E20 guard | sustain |
| Loyalty | Configure program | Owner | Rules setup | loyalty actions | loyalty svc | loyalty.manage | High | dual ledger confusion | locked messaging |
| Gift cards | Issue card | Manager | Issue/redeem | giftcard actions | giftcard svc | giftcards.manage | High | cross-channel | locked |
| Staff | Invite member | Owner | Send invite | staff actions | staff svc | staff.manage | Low | E20 guard | sustain |
| Billing | Change plan | Owner | Stripe subscription | billing actions | billing svc | billing.manage | Low | E20 guard | sustain |

## Public API / Webhooks / Integrations / SSO / Platform

| Page | Button/Action | User Role | Should Do | Handler | Backend | Permission | Risk | Missing | Fix |
|------|---------------|-----------|-----------|---------|---------|------------|------|---------|-----|
| Public API settings | Create API key | Owner | Scoped key | API settings actions | public API svc | admin | Medium | no scope picker UI | P2 |
| Webhooks | Add endpoint | Owner | Register webhook | webhook actions | webhook svc | integrations.manage | Medium | replay ops | P1 |
| Shopify/Woo settings | Connect channel | Owner | OAuth/webhook setup | channel actions | channel svc | integrations.manage | **High** | live smoke SKIP | **P0** |
| SSO settings | Configure IdP | Owner | SAML/OIDC setup | SSO admin actions | enterprise-sso | workspace.settings | **High** | IdP login SKIP | **P0** |
| Platform support | Impersonate tenant | Support | Start session | platform impersonation | platform svc | platform role | High | E20 5-hop proof | access review |
| Go-live / Implementation | GO/NO-GO panel | Owner/Ops | Honest decision | commercial pilot svc | GO/NO-GO artifact | go-live.manage | **Critical** | NO-GO | execute P0 |
| Commercial pilot pages | ICP qualification (E20) | Founder | Qualify prospect | era20 ICP bridge | ICP evaluator | platform | Medium | no real customer | LOI |

**Cross-cutting verification:** Critical money buttons (POS checkout, refund, void, SF checkout) have tier CI coverage. Permission-denied surfaces on Order Hub, Integration Health, Reports, Inventory, pilot hubs (E20) use guard-before-query. No dead primary CTAs found on pillar pages; preview modules may expose reachability without production maturity.

---

# 7. End-to-End Workflow Audit

| Workflow | E2E State | Broken Link | UX Pain | Backend Risk | Commercial Risk | Competitor Standard | Next Action |
|----------|-----------|-------------|---------|--------------|-----------------|---------------------|-------------|
| 1 Visitor → demo → sales | Partial | CRM automation weak | Standard funnel | Low | Medium | HubSpot speed | finish attribution |
| 2 Owner signup → workspace → first order | **Real** | Many nav paths | Wizard helps | Medium | Low | Square 1-day | default Launch Wizard path |
| 3 Staff invite → login → RBAC | **Real** | SSO invite gap | Role confusion | Medium | Medium | Standard | finish SSO invite |
| 4 SSO login → dashboard | **Blocked** | IdP proof SKIPPED | Good recovery UX | **High** | **High** | Okta SSO | **P0 env + smoke** |
| 5 Profile → menu → SF publish | **Real** | Domains preview | Multi-page | Medium | Medium | Shopify | wizard steps 3–4 |
| 6 SF customer checkout | **Real (CI)** | Stripe browser optional | — | Low | Low | Shopify | sustain tier-2 |
| 7 SF order → hub → KDS → packing | **Real (CI)** | Live channel ingest SKIPPED | Briefing deep-links help | Medium | **High** | Toast spine | P0 channel + briefing |
| 8 POS checkout → receipt → depletion | **Real (CI)** | POS-only lock messaging | Speed mode good | Medium | Medium | Toast | pilot train |
| 9 POS refund/void | **Real** | Manager discovery | Scattered UI | Medium | Medium | Toast | sustain E20 proofs |
| 10 POS shift open → closeout | **Real** | Multi-step close | E19/E20 checklist | Low | Low | Toast | sustain |
| 11 Manager discount override | **Real** | No PIN parity claim | Checklist hero | Low | Low | Toast PIN | sustain honest |
| 12 Table → kitchen | **Preview** | No floor plan | Preview only | High | High | TouchBistro | P2 beta |
| 13 Bar tab → payment | **Preview** | Rush UI missing | Preview | Medium | Medium | — | P3 |
| 14 KDS station workflow | **Real** | Rush SLO unproven | Priority lane win | Medium | Medium | Toast expo | staging Playwright |
| 15 Production calendar planning | **Real** | KDS auto-sync limited | Drill anchor win | Low | Low | Lightspeed | sustain |
| 16 Packing verification | **Real** | Scanner hardware | QC checklist win | Low | Low | — | sustain |
| 17 Inventory count adjustment | **Real** | Cross-channel policy | POS-only honest | Medium | **High** | R365 | locked messaging |
| 18 Recipe costing → margin | Partial | Data quality | Reports depth | Medium | Medium | MarginEdge | spot-check |
| 19 PO → receiving | Partial | Vendor sync | — | Medium | Medium | MarketMan | P2 |
| 20 Customer → segment → campaign | **Broken** | Campaign preview | — | Medium | High | Klaviyo | defer |
| 21 Loyalty earn/redeem | Partial | Dual ledger | Channel confusion | **High** | **High** | Square unified | locked |
| 22 Gift card redeem | Partial | Cross-channel | — | High | High | — | locked |
| 23 Schedule → clock → labor report | Partial | Payroll preview | — | Medium | Medium | 7shifts | P2 |
| 24 Woo webhook → canonical order | **Synthetic CI** | **Live SKIPPED** | Health honest | **High** | **Critical** | Woo plugins | **P0** |
| 25 Shopify webhook → order | **Synthetic CI** | **Live SKIPPED** | Same | **High** | **Critical** | Shopify | **P0** |
| 26 Public API order create | **Real (contract)** | No SLA | — | Medium | Medium | — | narrow claims |
| 27 Stripe webhook finalization | **Real** | — | — | Low | Low | — | sustain |
| 28 Webhook duplicate/replay | Partial | Not universal ops | — | Medium | Medium | — | P1 expansion |
| 29 Support impersonation → audit | **Real** | — | E20 5-hop proof | High | Medium | — | sustain |
| 30 Paid pilot GO/NO-GO | **Blocked** | Customer + P0 | Briefing shows truth | **Critical** | **Critical** | — | **execute** |
| 31 Staging release workflow | **Blocked** | No PASS URL | — | **High** | **High** | — | GitHub secrets |
| 32 Enterprise procurement Q | **Real (doc)** | SOC2/SCIM gaps honest | — | Medium | Medium | Oracle | sustain honesty |
| 33 Incident/rollback | Template | Not executed | — | Medium | High | — | tabletop P1 |
| 34 Pilot metrics capture | Template | Not PASSED | — | High | High | — | Week 1 post-GO |
| 35 Investor one-pager | Template | No KPIs | — | Medium | High | — | post-pilot |
| 36 Briefing → action taken | **Real (UX)** | No outcome telemetry | — | Medium | Medium | — | instrument |
| 37 Launch Wizard → first ops order | **Real (guided)** | TTV unmeasured | Wizard convergence win | Medium | Medium | Square | timed study |
| 38 Integration Health → issue resolved | **Real (guided)** | Live proof missing | E20 recovery flow proof | **High** | **High** | — | **P0 credentials** |

---

# 8. Department-by-Department Audit

**Scoring:** 0–100 honest departmental confidence in OS Kitchen readiness for their function. **Evidence base:** repo @ `70a467b`, post-Era 19 audits, Era 20 proof wiring.

| Role | What They Care About | Current Concerns | Evidence Needed | Top 10 Actions | Score |
|------|---------------------|------------------|-----------------|---------------|------:|
| 1 Founder | Pilot GO, honest GTM, velocity vs proof | P0 blocked; no customer; 39 UX cycles before proof | GO/NO-GO artifact, LOI, P0 PASS | 1) Ops vault 11 vars 2) Qualify ICP 3) Sign LOI 4) P0 PASS 5) GO kickoff 6) Freeze UX cycles 7) Pilot Week 1 8) Case study plan 9) Era 20 scorecard 10) Stop fake claims | 72 |
| 2 CEO | Market readiness, revenue pilot | No paid pilot; competitor hardware gap | Pilot metrics, customer quote | Same as founder + pricing SKU publish + staging URL in pack | 68 |
| 3 CTO | Architecture, security, scale | 365 models; 614 services; Prisma pressure | RBAC cert, money-path CI | 1) P0 PASS 2) Sustain wave4 3) Pen test plan 4) Service map 5) No big refactor pre-pilot 6) SSO proof 7) Webhook replay 8) Cross-tenant E2E 9) Typecheck discipline 10) Era 21 consolidation RFC | 85 |
| 4 CIO | SSO, audit, enterprise identity | IdP proof SKIPPED; SCIM not built | SSO staging artifact, audit export tests | 1) IdP smoke PASS 2) Sustain audit logs 3) DPA alignment 4) Impersonation review 5) Secrets vault 6) No SOC2 claims 7) Backup policy 8) Incident template 9) Data retention doc 10) Procurement pack sync | 74 |
| 5 COO | Operator workflows, pilot execution | Tier 2 golden path not executed | Operator golden path doc, runbook | 1) Tier 2 checklist 2) Train pilot staff 3) KDS staging drill 4) POS shift validation 5) Launch Wizard onboarding 6) Support boundaries 7) Rollback tabletop 8) Pilot metrics Week 1 9) Integration health training 10) Go-live merge wizard | 78 |
| 6 CPO | Product completeness, WOW, roadmap | Nav sprawl; preview visible; campaigns broken | Feature matrix, pillar pages | 1) P0 unblock sales 2) Nav hide sweep 3) Merge go-live/wizard 4) Table service RFC post-pilot 5) Briefing telemetry 6) TTV study 7) Profit tile P2 8) Defer loyalty unlock 9) Era 20 scorecard 10) Stop convergence cycles | 82 |
| 7 VP Engineering | Delivery, CI, debt | Staging workflows SKIPPED; service monolith | CI matrix, test counts | 1) P0 orchestrator 2) GitHub first green 3) KDS Playwright PASS 4) Sustain certs 5) Permission-denied sweep 6) Registry lint 7) No schema split pre-pilot 8) Flow proof sustain 9) Flaky test audit 10) Post-pilot consolidation | 84 |
| 8 VP Product | ICP, pilot scope, claims | Forbidden claims temptation; dual ledger confusion | Claims registry, runbook | 1) ICP qualification 2) Pilot package 3) Forbidden claims gate 4) Matrix alignment 5) Wizard TTV 6) Hide preview 7) Channel live proof 8) Case study pipeline 9) Competitor honest deck 10) Investor template hold | 80 |
| 9 VP Design | UX consistency, design system | 701 pages; density inconsistency | UX audit, surface scores | 1) Briefing-first Today 2) Token pass post-pilot 3) Wizard component system 4) Permission-denied cards 5) POS/KDS density 6) a11y sweep P2 7) Hide preview nav 8) Reduce strip overlap 9) Mobile Today scroll 10) Command center brand | 76 |
| 10 VP Marketing | Positioning, landing, SEO | Cannot claim production-ready platform | product-positioning.md, claims cert | 1) Honest pillar messaging 2) No SSO/marketplace claims 3) Integration health as differentiator 4) Pilot case study wait 5) verify-claims in CI 6) Demo funnel attribution 7) Forbidden list training 8) Staging proof before broad launch 9) ICP-specific landing 10) Competitor defer hardware | 70 |
| 11 VP Sales | Close pilot, LOI | NO-GO; no reference customer | GO/NO-GO, pilot package | 1) Qualify 1 ICP 2) LOI template 3) Demo with SKIPPED visible 4) Pilot pricing hypothesis 5) No unified inventory pitch 6) Channel optional day 1 7) Success metrics in contract 8) Staging proof before enterprise 9) Health center in deck 10) Post-P0 GO | 65 |
| 12 VP Customer Success | Onboarding, health, retention | Unmeasured TTV; support untested at scale | Runbook, wizard, health center | 1) Launch Wizard kickoff 2) Week 1 metrics 3) Integration health training 4) Support impersonation boundaries 5) Rollback doc 6) Pilot check-ins 7) Briefing adoption 8) Escalation paths 9) Training mode P2 10) Case study capture | 74 |
| 13 VP Operations | Release, staging, incidents | P0 awaiting creds; rollback not run | p0 artifact, devops doc | 1) Configure 11 env vars 2) Staging URL record 3) Rollback drill 4) Cron allowlist sustain 5) Smoke artifact commit policy 6) On-call webhook runbook 7) Commerce drill 8) Pilot ops checklist 9) GitHub green 10) Incident tabletop | 70 |
| 14 Product Managers | Feature scope, backlog | 264 backlog sections; sprawl | implementation-backlog.md | Prioritize P0 band; hide preview; pilot-only scope; defer campaigns | 78 |
| 15 Senior PMs | Cross-module flows | Parallel go-live vs wizard | workflow audit | Converge onboarding; instrument briefing; channel proof | 79 |
| 16 Technical PMs | API, integrations, webhooks | 0 LIVE registry; live smoke SKIP | integration-registry, channel certs | P0 live smoke; replay ops; Public API scope UI P2 | 76 |
| 17 Program Managers | Era execution, scorecards | Missing era19/20 scorecards | execution maps | Close Era 20 Band A; publish scorecard at proof | 75 |
| 18 Scrum Masters | Sprint hygiene, blockers | Ops blockers external to eng | board, artifacts | Track P0 env vars as blocker; no fake done | 80 |
| 19 Agile Coaches | Flow, WIP | UX cycles before proof | git log themes | Proof-first WIP limits; stop strip cycles | 77 |
| 20 Solution Architects | E2E integration | Channel ingest blocked live | order spine, webhooks | Golden path + live smoke; webhook security matrix | 83 |
| 21 Software Architects | Monolith boundaries | 614 services | system-reality-model | Post-pilot domain map; sustain mutation registry | 82 |
| 22 Frontend Developers | Pages, components, guards | 701 pages; hook layer thin | app/dashboard, components | Permission-denied sweep; briefing layout; nav hide | 80 |
| 23 Backend Developers | Services, actions, API | Action/registry gap | services/, actions/ | Sustain money paths; expand registry slowly; webhook replay | 81 |
| 24 Full Stack Developers | Feature delivery | Preview vs production confusion | matrix | Pilot-ready features only in demos | 82 |
| 25 Mobile Developers | Native apps | No native owner app | — | Defer P3; tablet web for POS/KDS pilot | 35 |
| 26 React Developers | Component patterns | Strip proliferation | components/ | Shared AttentionStrip primitives P2 | 79 |
| 27 Next.js Developers | App Router, RSC | Data loading variance | app/ structure | Guard-before-query pattern sustain | 84 |
| 28 Android Developers | Handheld POS | Handheld preview only | handheld page | Defer; web tablet first | 30 |
| 29 DevOps Engineers | CI, staging, secrets | 11 missing env vars | workflows, smoke scripts | P0 orchestrator; GitHub first green; secrets vault | 72 |
| 30 SREs | Uptime, monitoring, rollback | Rollback not executed | devops doc, Sentry | Health checks; rollback drill; staging proof | 70 |
| 31 Cloud Engineers | Vercel, env, crons | Staging unproven | vercel config, 16 crons | Env validation; cron allowlist sustain | 75 |
| 32 QA Engineers | Test coverage | Tier 2 SKIPPED | 956 vitest, 36 playwright | Execute golden path; KDS staging E2E | 83 |
| 33 Automation QA | CI tiers, smoke | Live smokes ops-dep | ci-e2e-tier-matrix | Wire P0 into release gate; no fake PASS | 80 |
| 34 Security Engineers | RBAC, tenant isolation | SSO unproven live | security audit, wave4 | IdP proof; pen test; impersonation review | 86 |
| 35 Pen Testers | Vuln assessment | No pen test yet | — | Schedule pre-enterprise; public POST matrix | 60 |
| 36 Data Engineers | Pipelines, events | Limited event instrumentation | Prisma models | Briefing telemetry; pilot metrics pipeline | 65 |
| 37 Data Analysts | Reports, KPIs | No pilot KPI baseline | reports hub | Week 1 metrics capture post-GO | 62 |
| 38 BI Analysts | Executive dashboards | Forecast preview | executive dashboard | Real profit tile P2 post-pilot | 58 |
| 39 AI/ML Engineers | Copilot | Preview only; claim risk | copilot svc | Defer/hide; guard-before-query done E20 | 45 |
| 40 UX Researchers | Operator tasks, TTV | No measured TTV | wizard, today | Timed onboarding study with first pilot | 68 |
| 41 UX Designers | Flows, IA | Nav noise | UX audit surfaces | Hide preview; briefing-first; wizard single entry | 77 |
| 42 UI Designers | Visual polish | Density inconsistency | design surfaces | Token pass post-pilot | 74 |
| 43 Product Designers | End-to-end journeys | Duplicate onboarding paths | go-live + wizard | Merge messaging; command center brand | 78 |
| 44 Motion Designers | Micro-interactions | Limited motion system | — | KDS bump feedback P3 | 50 |
| 45 Graphic Designers | Brand, marketing | Marketing site live | app/page.tsx | Align with honest claims registry | 72 |
| 46 Design System Engineers | Tokens, components | No unified operator density | components/ | Extract wizard/health patterns post-pilot | 65 |
| 47 CRM Specialists | Segments, campaigns | Campaign flow broken | CRM svc | Sustain segments; defer automation | 66 |
| 48 SEO Specialists | SF SEO, marketing SEO | SF SEO beta | seo lib | P3 after pilot | 55 |
| 49 PPC Specialists | Paid acquisition | Demo funnel partial | book-demo | Attribution finish | 58 |
| 50 Growth Marketers | Campaigns, loyalty | Locked dual ledger | growth surfaces | Defer; consent winback P3 | 50 |
| 51 Content Managers | Docs, help | 1557 docs; drift risk | canonical index | Update index at Era 20 close only | 70 |
| 52 Copywriters | Claims, UX copy | Forbidden claims risk | claims-registry | Train on SKIPPED WITH REASON language | 75 |
| 53 Social Media Managers | Brand presence | No case study | — | Hold production claims until pilot | 55 |
| 54 Brand Managers | Positioning consistency | Governance 100 ≠ market ready | product-positioning | Honest pillar narrative | 68 |
| 55 Sales Managers | Pipeline, pilot close | NO-GO | GO/NO-GO artifact | ICP + LOI + P0 before scale | 64 |
| 56 SDR | Demo booking | Demo funnel live | book-demo.ts | Qualify ICP on call | 70 |
| 57 Account Executives | Contract, pilot scope | No signed pilot | pilot package, LOI template | Sell qualified pilot only | 63 |
| 58 Customer Success Managers | Adoption, health | Unmeasured briefing outcomes | runbook | Wizard + Week 1 metrics | 72 |
| 59 Onboarding Specialists | Launch Wizard, training | Parallel paths | launch-wizard | Single wizard entry; training checklists | 76 |
| 60 Technical Support Engineers | Impersonation, health triage | Scale untested | platform support, health | E20 impersonation proof; pilot boundaries | 77 |
| 61 Fintech Specialists | Stripe, money paths | Strong CI | tier-2/2b | Sustain; no hardware terminal claims | 82 |
| 62 Payment Integration Engineers | Webhooks, Stripe | Strong replay certs partial | stripe routes | Commerce drill execution | 80 |
| 63 Hardware Engineers | Terminals, scanners | Preview/defer | POS hardware preview | Hide; defer cert race | 25 |
| 64 Embedded Engineers | KDS devices | Web KDS only | KDS pages | Tablet validation in pilot | 40 |
| 65 ERP/POS Integration Specialists | Woo/Shopify/QB | Live smoke SKIP | channel golden path | **P0 live smoke** | 68 |
| 66 Compliance Specialists | SOC2, DPA, retention | SOC2 not certified | procurement pack | Honest roadmap; no SOC2 sales claims | 70 |
| 67 Legal Team | Contracts, claims | LOI missing | pilot-icp-contract-template | Review pilot LOI; forbidden claims | 72 |
| 68 HR Team | Staff module | Staff beta | staff actions | Sustain invites; training RBAC | 65 |
| 69 Recruiters | Hiring narrative | Strong eng surface | repo size | Honest stage in recruiting | N/A |
| 70 Finance Team | Billing, pilot pricing | Pricing hypothesis only | billing svc | Publish pilot SKU; Stripe sustain | 75 |
| 71 Procurement Team | Enterprise pack | SSO/SCIM gaps honest | enterprise-procurement-pack | Sustain honesty; IdP proof for RFP | 71 |
| 72 Field Technicians | Hardware install | No hardware program | — | Defer | 20 |
| 73 Restaurant Operations Specialists | Daily open-to-close | Strong ops spine in software | order hub, KDS, POS | Pilot train; POS-only inventory messaging | **84** |

---

# 9. UX / Design System Audit

**Operator UX: 86/100** · **WOW UX (pillar surfaces): 62/100** · **Design polish: 78/100**

| Surface | UX Score | Design Score | Mobile Score | Tablet Score | Accessibility | Issues | Fix |
|---------|---------:|-------------:|-------------:|-------------:|--------------:|--------|-----|
| `/dashboard/today` | 88 | 85 | 75 | 78 | 72 | Strip overlap with briefing | briefing-first layout |
| Owner Daily Briefing | 85 | 88 | 75 | 76 | 70 | Alert noise; long mobile scroll | cap ranked actions to 3 |
| Launch Wizard | 80 | 82 | 82 | 80 | 75 | Parallel go-live pages | single entry CTA |
| Integration Health | 88 | 90 | 75 | 78 | 72 | Technical density for owners | owner vs support modes |
| Order Hub | 85 | 86 | 72 | 75 | 70 | Live proof rows SKIPPED | sustain honesty |
| Storefront admin | 72 | 74 | 70 | 72 | 68 | Builder complexity | wizard handoff |
| Storefront publish | 70 | 72 | 68 | 70 | 68 | Domain preview gap | P2 DNS automation |
| POS Terminal | 82 | 80 | 78 | **85** | 70 | Speed mode not default | default `?speed=1` cashiers |
| POS Shifts | 85 | 86 | 80 | 82 | 72 | Multi-step close | sustain E20 checklist |
| POS Refunds/Voids | 70 | 72 | 68 | 70 | 68 | Scattered from terminal | sustain |
| KDS | 88 | 88 | 80 | **88** | 75 | 15s poll vs realtime expectation | honest banner |
| Production Board | 82 | 84 | 75 | 78 | 70 | — | sustain |
| Production Calendar | 85 | 86 | 75 | 78 | 72 | — | sustain drill anchor |
| Packing | 84 | 85 | 72 | 75 | 70 | — | sustain QC checklist |
| Packing Verification | 80 | 82 | 70 | 72 | 68 | Scanner hardware gap | P3 |
| Inventory | 68 | 70 | 65 | 68 | 65 | Cross-channel confusion risk | POS-only messaging |
| Purchasing | 68 | 70 | 65 | 68 | 65 | — | P2 |
| CRM | 72 | 74 | 70 | 72 | 68 | — | sustain E20 guard |
| Loyalty/Gift Cards | 65 | 68 | 65 | 68 | 65 | Dual ledger UX | locked honesty |
| Staff | 70 | 72 | 68 | 70 | 68 | — | sustain |
| Payroll | 55 | 58 | 50 | 55 | 60 | Preview maturity | P3 |
| Reports | 68 | 70 | 65 | 68 | 65 | Heavy vs order hub | briefing-style next actions P2 |
| Billing | 72 | 74 | 70 | 72 | 70 | — | sustain |
| Public API settings | 60 | 62 | 58 | 60 | 65 | No scope picker | P2 |
| Webhooks | 75 | 76 | 68 | 70 | 68 | — | P1 replay ops UI |
| Shopify/Woo settings | 80 | 78 | 70 | 72 | 70 | Live proof blocked | P0 |
| SSO settings | 80 | 82 | 72 | 74 | 72 | IdP proof external | inline proof status |
| Platform support | 80 | 82 | 70 | 72 | 68 | — | sustain deep links |
| Go-live | 78 | 80 | 72 | 75 | 70 | Duplicates wizard | merge messaging |
| Commercial pilot / Implementation | 82 | 84 | 72 | 75 | 72 | NO-GO visible | execute P0 |

**System-wide:** Navigation clarity **62** (701 pages). Permission-denied **85** (E19 packing/production + E20 hubs). Deep links **90**. Role-based UX **88**.

---

# 10. Architecture / Engineering Audit

| Area | Current State | Risk | Evidence | Fix | Priority |
|------|---------------|------|----------|-----|----------|
| App Router | 701 pages, dashboard-centric | High IA | `find app -name page.tsx` | Nav hide sweep | P1 |
| Server actions | 145 modules | RBAC drift | `find actions` | Registry expansion lint | P1 |
| API routes | 176 routes, 46 webhooks | Public POST abuse | app/api | Sustain matrix | P1 |
| Services layer | 614 TS modules | Monolith maintainability | services/ | Post-pilot consolidation | P2 |
| Prisma | 365 models, 268 enums | Typecheck OOM | schema.prisma | Grouping; no split pre-pilot | P0 sustain |
| Domain boundaries | Orders/kitchen/integrations separated in services | Leakage in places | system-reality-model | Domain map | P2 |
| Data loading | RSC + server actions mix | Inconsistent patterns | page loaders | Guard-before-query standard | P1 |
| Error handling | Good on money paths | Uneven on preview | tier CI tests | Extend to hubs | P2 |
| Logging | Sentry/observability beta | Gaps in ops drill | integrations | Commerce drill | P1 |
| Audit logging | beta, export guarded | Retention ops | audit svc | P2 retention policy |
| RBAC helpers | 57 keys, wave4 cert | Registry 18 vs 145 actions | permissions/ | Slow registry expand | P1 |
| Tenant scoping | requireTenantActor widespread | Support mode review | security audit | Cross-tenant E2E | P1 |
| Testing | 956 vitest, 36 playwright | Tier 2 SKIPPED | tests/ | Execute golden path | **P0** |
| CI architecture | 17 workflows, cert scripts | Staging unproven | .github/workflows | First green | **P0** |
| Smoke/cert system | 53 smoke, 8 cert | Ops-dependent | scripts/ | P0 orchestrator PASS | **P0** |
| Package scripts | 682 scripts | Discovery hard | package.json | qa-master-test-plan | Low |
| Typecheck | Pressure at 365 models | CI flake risk | prior era notes | prisma generate discipline | P1 |
| Performance | Briefing aggregates real queries | Scale unproven | briefing svc | Pilot load test | P2 |
| Maintainability | Era policy file proliferation | Indirection | lib/briefing/*era* | Merge post-stabilization | P2 |
| Scalability | Single monolith OK for pilot | Model sprawl blocks velocity | inventory counts | Era 21 consolidation | P2 |

**Frontend → backend connection:** Pages call server actions or load functions → actions invoke `services/*` → Prisma queries scoped by workspace ID from session. Public routes (storefront, webhooks, public API) use separate guards (store slug, webhook signatures, API keys).

---

# 11. Security / RBAC / Compliance Audit

**Security: 90/100** · **RBAC: 89/100** (+1 Era 20 guards) · **Tenant isolation: 86/100**

## Critical Risks

| Risk | Severity | Evidence | Fix |
|------|----------|----------|-----|
| SSO IdP unproven | **P0** | `p0-staging-proof-unblock-summary.json` SSO child SKIPPED | Configure 6 SSO env vars + smoke PASS |
| Live channel ingest unproven | **P0** | channel live child SKIPPED | DATABASE_URL, ENCRYPTION_KEY, CHANNEL_SMOKE_OWNER_EMAIL |
| Support impersonation high privilege | P1 | platform impersonation + E20 flow proof | Access review + cross-tenant E2E |
| Public API scope UI missing | P1 | 8 routes, contract tests only | Scope picker P2 |
| Preview modules URL-reachable | P1 | page-maturity notices partial | Nav hide + URL guard |
| No pen test | P1 | — | Schedule pre-enterprise |
| Artifact false PASS risk | P1 | artifacts/*.json | Commit policy: PASS only after real run |

## RBAC Gaps

| Gap | Status | Fix |
|-----|--------|-----|
| POS/KDS permission-denied partial | Medium | Universal sweep remaining routes |
| 145 actions vs 18 mutation registry | Medium | Expand registry slowly with linter |
| Copilot preview | **Fixed E20** | guard-before-query cycle 17 |
| Pilot hubs (implementation, staff, billing, CRM) | **Fixed E20** | cycle 10 guards |

## Tenant Isolation Gaps

| Flow | Guard | Risk |
|------|-------|------|
| Order/briefing/wizard | workspace scoped | Low |
| Integration health support mode | tenant + platform role | Medium — sustain tests |
| Webhook ingest | connection→workspace mapping | Medium until live PASS |
| SSO callback | sso_workspace_id mapping | **High** until IdP proof |
| Public API | API key→workspace | Medium |

## Compliance Gaps

| Area | Status | Fix |
|------|--------|-----|
| SOC2 | Roadmap only — **no certification claim** | Defer implementation |
| SCIM | not_implemented | Defer; honest in procurement pack |
| DPA | Template in procurement pack | Legal review per customer |
| Data retention | Partial docs | P2 operational policy |
| Backup/restore | Template | Execute drill P1 |
| Incident response | Template | Tabletop P1 |

## Required Tests (sustain)

- `test:ci:rbac-wave4`
- `test:ci:mutation-registry-linter-era16:cert`
- `test:ci:permission-denied-ux-era20:cert`
- Money-path tier-2 / tier-2b
- Cross-tenant isolation unit/integration sustain

---

# 12. QA / Testing / Validation Audit

| Area | Tests Exist? | CI? | Missing Tests | Risk | Fix |
|------|--------------|-----|---------------|------|-----|
| Unit tests (Vitest) | **Yes — 956 files** | Yes | Preview module depth | Low | Sustain |
| Era 19 pillar tests | **Yes — 42 files** | Yes | — | Low | Sustain |
| Era 20 flow proof tests | **Yes — 37 files** | Yes | — | Low | Sustain |
| Integration tests | Partial | Yes | Live channel real env | **High** | P0 smoke |
| E2E Playwright | **36 specs** | Partial | KDS staging GitHub PASS | **High** | Ops secrets |
| Smoke scripts | **53 scripts** | Orchestrated | Execution ops-blocked | **Critical** | P0 creds |
| Cert scripts | **8 scripts** | Chained in CI | Live smokes not in default CI | High | Post-proof wiring |
| Money-path CI | **Yes** tier-2/2b | Yes | — | Low | **Do not reopen** |
| RBAC wave 4 | Yes | Yes | — | Low | Sustain |
| Mutation registry linter | Yes | Yes | — | Low | Sustain |
| Role/RBAC denial UX | Yes E19+E20 | Yes | POS/KDS remaining | Medium | Sweep |
| Tenant isolation | Yes unit/integration | Partial | Support impersonation E2E | Medium | Add E2E |
| Workflow tests | Partial | Partial | Tier 2 golden path manual | **High** | Execute checklist |
| Pilot GO/NO-GO | Yes evaluator | Yes | Customer/LOI missing | **Critical** | Sign LOI |
| Performance tests | Minimal | No | Briefing at scale | Medium | Post-pilot |
| Security tests | Partial matrix | Yes | Pen test | High | Pre-enterprise |
| Flaky risks | Low in unit | Medium E2E | Staging env dependency | High | Stable staging |
| Marketing claims | Yes verify-claims | Yes | — | Low | Sustain |

---

# 13. DevOps / SRE / Cloud Audit

| Area | Current State | Risk | Evidence | Next Action |
|------|---------------|------|----------|-------------|
| GitHub Actions | 17 workflows | Staging unproven | `.github/workflows` | First green URL in artifact |
| Vercel config | Deploy-ready | Env-dependent | vercel.json | Staging URL in evidence pack |
| Env validation | P0 checklist 11 vars | **Critical** | p0 artifact | Ops vault configure |
| Staging workflows | SKIPPED | **High** | staging-workflows artifact | E2E_LOGIN_* + BASE_URL |
| Production crons | 16 routes (allowlist policy) | Low | app/api/cron | Sustain hygiene cert |
| Smoke artifacts | Present; SKIPPED | Medium | artifacts/ | PASS only after real run |
| Logging | Sentry beta | Medium | observability integrations | Wire pilot monitoring |
| Monitoring | Partial | Medium | — | Week 1 pilot dashboards |
| Health checks | Present | Low | API health routes | Sustain |
| Rollback | Template only | **High** | rollback artifact | Tabletop drill |
| Deployment readiness | Code ready; proof not | **Critical** | GO/NO-GO | P0 PASS gate |
| Backup/restore | Documented template | Medium | devops doc | Execute drill |
| Incident response | Template | Medium | — | Tabletop P1 |
| Secrets management | Documented; not set | **Critical** | 11 missing vars | Configure vault |
| Uptime strategy | Standard Vercel | Medium | — | SLA page enterprise P3 |

---

# 14. Data / Analytics / BI / AI Audit

| Data Area | Current State | Gap | Business Value | Required Work |
|-----------|---------------|-----|----------------|---------------|
| Data model (Prisma) | 365 models — comprehensive | Sprawl, typecheck pressure | Full restaurant domain | Post-pilot grouping |
| Events / telemetry | Limited product analytics | No briefing click tracking | Pilot success measurement | Instrument Era 20 cycle 14 |
| Analytics / reports | Beta reports hub | No profit briefing tile | Owner decision speed | P2 profit tile |
| Executive dashboard | Beta | Preview insights | Leadership view | P2 |
| Forecasting | Preview | Not production | Prep planning | Defer |
| AI / copilot | Preview; E20 guard | Auto-action risk | Low until proof | Defer/hide |
| Owner Daily Briefing data | **Strong** — real DB slices | Outcome telemetry | **High** — unique moat | Click instrumentation |
| Risk radar data | **Strong** — multi-signal | Alert noise at scale | High | Cap signals per role |
| Integration health data | **Strong** — artifact-backed | Live channel gap | **High** — sales honesty | P0 PASS |
| Pilot metrics | Template artifact | Not PASSED | **Critical** for investor | Week 1 post-GO |
| BI readiness | Partial exports | No warehouse | Medium | Post-pilot |
| Data quality | Order spine strong | Costing/recipe quality | Medium | Accountant spot-check |
| Data lineage | Webhook→order documented | Not universal replay ops | Medium | P1 runbook |

---

# 15. Marketing / Sales / GTM Audit

| GTM Area | Current State | Gap | Risk | Next Action |
|----------|---------------|-----|------|-------------|
| Positioning | OS for restaurants — honest matrix | Hardware defer not in headline | Medium | Integration health differentiator |
| ICP | Documented in pilot package | Not qualified in evaluator | **High** | Founder qualify prospect |
| Pricing | Hypothesis $500–2500/mo pilot | Not in product SKU | Medium | Publish pilot SKU |
| Pilot offer | Runbook + E20 package ready | No GO | **Critical** | P0 + LOI |
| Sales claims | Claims registry + verify-claims | Temptation on SSO/LIVE | **High** | Pre-contract enforcement |
| Forbidden claims | Documented | Violation risk if ignored | **High** | Sales training |
| Sales deck | Pillar narrative possible | No customer proof | High | Post-pilot case study |
| Landing page | Live marketing site | Standard | Low | Sustain |
| SEO | Basic | Not deep | Low | P3 |
| Demo funnel | Live book-demo | Weak CRM automation | Low | Attribution |
| Case study | Internal draft era17 | No approval | High | Post-pilot |
| Competitor messaging | Honest gap matrix | Hardware gap visible | Medium | Defer hardware honestly |
| Brand positioning | Governance-strong | Market trust low | Medium | First pilot reference |

**Forbidden claims (still):** Production SSO, SOC2 certified, SCIM, unified inventory, unified loyalty, marketplace LIVE, POS hardware/offline certified, rush-hour KDS SLO, Public API SLA, "production-ready platform" without matrix alignment.

---

# 16. Customer Success / Onboarding / Support Audit

| CS Area | Current State | Gap | Risk | Next Action |
|---------|---------------|-----|------|-------------|
| Launch Wizard | **Strong** E19+E20 | TTV unmeasured | Medium | Timed pilot study |
| Onboarding flow | Wizard + getting-started + go-live parallel | Path confusion | Medium | Single wizard entry |
| Go-live checklist | Beta, linked | Duplicates wizard | Medium | Merge messaging |
| Training | Beta training RBAC | Not pilot-packaged | Low | Pilot training checklist |
| Support inbox | Platform support wired | Scale untested | Medium | Pilot boundaries doc |
| Support impersonation | Real + E20 flow proof | High privilege | High | Access review |
| Help text | Uneven on preview | Preview reachable | Medium | Nav hide |
| Recovery flows | **Strong** on SSO/login, integration health | — | Low | Sustain |
| Pilot runbook | **Live governance** | Not executed | **Critical** | Week 1 kickoff |
| Rollback process | Template | Not run | High | Tabletop |
| Support boundaries | Documented in package | Untested | Medium | Train support |
| Customer health score | Not instrumented | No telemetry | Medium | Pilot metrics baseline |

---

# 17. Finance / Procurement / Legal Audit

| Area | Current State | Gap | Risk | Next Action |
|------|---------------|-----|------|-------------|
| Pricing | Hypothesis in runbook | Not productized | Medium | Publish SKU |
| Billing | pilot_ready Stripe | Enterprise invoicing | Low | P2 |
| Subscriptions | Entitlements wired | — | Low | Sustain |
| Payment flows | tier-2/2b certified | — | Low | Sustain |
| Stripe | Strong webhook handling | — | Low | Commerce drill |
| Procurement pack | Honest beta | SOC2/SCIM gaps | Medium | Sync at proof |
| Legal claims | Forbidden list enforced | Sales override risk | High | Pre-contract gate |
| Contract/LOI | Template era17 | **Not signed** | **Critical** | Sign qualified LOI |
| DPA readiness | Template | Per-customer legal | Medium | Legal review |
| Data retention | Partial | Operational policy | Medium | P2 |
| Tax/accounting | QB/Xero beta | No live GL sync | Medium | Export visibility only |
| QuickBooks/Xero | BETA registry | Live sync gap | Medium | P2 |
| Payroll export | Preview | Certification gap | Medium | P3 |
| Vendor purchasing | Beta PO flow | MarketMan depth gap | Low | P2 |

---

# 18. Restaurant Operations Audit

| Restaurant Flow | Current State | Operator Pain | Missing Piece | Fix |
|-----------------|---------------|---------------|---------------|-----|
| Daily open | Briefing + shift open | Parallel nav paths | Single Today entry | briefing-first |
| Prep planning | Production calendar strong | KDS auto-sync limited | Deeper sync | P2 |
| Ordering (SF/POS/manual) | **Real** spine | Channel live ingest SKIP | Live Woo/Shopify | P0 |
| POS rush | Speed mode good | Not default | Default speed mode | config |
| Kitchen (KDS) | **Strong** priority lane | Poll not realtime | Honest banner | sustain |
| Packing | **Strong** QC checklist | Scanner hardware | Hardware defer | P3 |
| Delivery routing | Beta | Marketplace live defer | — | honest |
| Closeout | Shift checklist strong | Multi-step | — | sustain E20 proof |
| Staff schedule | Beta | 7shifts depth | Compliance packaging | P2 |
| Inventory | Beta POS-only | Cross-channel expectation | Locked policy | honest messaging |
| Customer follow-up | CRM strong | Campaign automation | Klaviyo-class flows | defer |
| Issue recovery | Integration health + briefing | Live proof missing | P0 creds | ops vault |
| Owner daily review | **Best-in-class briefing** | No outcome metrics | Telemetry | instrument |
| Manager shift workflow | Manager packs + override | Table service preview | Floor plan | P2 |
| Kitchen rush workflow | KDS priority lane | Rush SLO unproven | Staging proof | Playwright |
| Catering workflow | Beta quotes | — | — | P2 |
| Ghost kitchen workflow | Order hub + production | Multi-brand polish | P2 |
| Meal prep workflow | Production board/calendar | Forecast tie | Predictive prep | P3 |

---

# 19. Competitor Audit

## Competitor Matrix

| Competitor | What They Do Better | OS Kitchen Advantage | Gap | Copy? | Avoid? | Leapfrog Opportunity |
|------------|---------------------|---------------------|-----|-------|--------|---------------------|
| Toast | Hardware, offline, rush KDS, tables | Unified spine, briefing, integration honesty | Hardware/offline | Patterns only | Hardware lock-in | Ops nervous system with proof |
| Square | SMB UX, Terminal, unified loyalty | Role landing, launch wizard, speed mode | Terminal, loyalty | Terminal defer | Closed ecosystem | Guided TTV wizard |
| Lightspeed | Multi-site inventory | Production calendar+board | Cross-channel stock | — | Full parity | Calendar+KDS bundle |
| TouchBistro | iPad FOH, tables | RBAC governance | Floor/split | Table UX | Full parity | Table beta post-pilot |
| Clover | App marketplace | Platform breadth | Hardware apps | — | Hardware | Partner API story |
| SpotOn | Bundled loyalty pitch | CRM segments | Unified rewards | — | Fake bundle | Order-attributed CRM |
| Revel | Multi-location | Modern stack | Rollout polish | — | — | Multi-loc scorecard P2 |
| Oracle Simphony | Enterprise scale | Audit/RBAC foundations | SSO/SCIM/SOC2 prod | — | 12-mo deploy | Modern governance UX |
| Shopify | Commerce UX, themes | Kitchen spine from webhooks | Theme ecosystem | Golden path | Admin clone | Live smoke PASS + health |
| WooCommerce | Plugin ecosystem | Same spine | Plugins | — | Plugin parity | Operator workflow post-capture |
| Restaurant365 | Inventory+accounting | Order-linked costing | GL depth | — | GL replacement | POS depletion honest |
| MarginEdge | Invoice OCR, food cost alerts | Recipe costing base | AP automation | — | Invoice AI now | Briefing margin tile P2 |
| MarketMan | Vendor sync | PO approval+audit | Sync depth | — | — | Forecast tie P2 |
| 7shifts | Labor compliance | In-app labor+orders | Compliance packaging | — | Standalone clone | Labor alerts in briefing P2 |
| Homebase | Simple clock | Full OS | Labor UX | — | — | Time clock in role home |
| QuickBooks/Xero | Accounting dominance | Scoped exports | Live sync | — | Full accounting | Export visibility |
| Klaviyo | Automation, attribution | First-party orders | Campaign builder | — | Full suite | Consent winback P3 |
| Mailchimp | Email campaigns | CRM base | Automation | defer | — | — |
| DoorDash/Uber/Grubhub | Marketplace ops | Placeholder honesty | Live APIs | — | Marketplace economics | Direct-order governance |

## Top 30 Competitor Features OS Kitchen Lacks

1. Toast offline POS queue 2. Toast proprietary hardware 3. Toast rush-hour KDS SLO 4. Toast table service depth 5. Square Terminal certification 6. Square unified loyalty 7. Square same-day onboarding proof 8. Shopify theme marketplace 9. Shopify checkout polish at scale 10. 7shifts labor compliance marketplace 11. Klaviyo flow builder 12. MarginEdge invoice OCR 13. MarketMan vendor catalog sync 14. R365 cross-location inventory truth 15. TouchBistro floor plan editor 16. Lightspeed multi-site transfers 17. DoorDash live order inject 18. Uber Eats tablet integration 19. QuickBooks live GL sync 20. Toast gift card network 21. Square mobile owner app 22. Toast labor vs sales realtime 23. Revel franchise permissions 24. Oracle menu engineering at scale 25. SpotOn marketing bundle 26. Clover app marketplace 27. Woo plugin ecosystem hooks 28. Toast xtraCHEF invoice intelligence 29. Toast payroll depth 30. **Competitor proven customer references (OS Kitchen: zero paid pilots)**

## Top 30 Features OS Kitchen Should Not Copy

1. Toast hardware lock-in 2. Marketplace aggregator wedge 3. Oracle 12-month implementation 4. Unified loyalty before pilot proof 5. Cross-channel inventory claims 6. SOC2 claims pre-audit 7. SCIM sales before SSO pilot_ready 8. Public API SLA before partner smoke 9. Offline POS before software pilot stable 10. Rush-hour KDS SLO claims 11. Full Klaviyo clone 12. Full QuickBooks replacement 13. UX-only cycles without proof 14. Fake green integration status 15. Governance score inflation in GTM 16. Copilot auto-actions without approval 17. DoorDash live before direct-order proof 18. Hardware Terminal cert race 19. Woo plugin marketplace before spine proof 20. Enterprise franchise before single-loc pilot 21–30. *(See `competitor-gap-audit-post-era19-2026-05-28.md` avoid list)*

## Top 20 Leapfrog Opportunities

1. **Honest Integration Health Center** 2. **Owner Daily Briefing** (pilot GO/NO-GO + ops + integrations) 3. **Launch Wizard** with commercial blocker merge 4. Unified order spine with governance 5. Webhook security matrix 6. Commercial GO/NO-GO artifact pack 7. Forbidden claims enforcement 8. POS-only inventory honesty 9. Dual-ledger rewards honesty 10. Role-based operator landing 11. KDS priority lane + allergen scoring 12. Fulfillment briefing→KDS→packing convergence 13. Production calendar drill anchors 14. Channel golden path CI + live smoke gate 15. Enterprise procurement pack synced to code 16. Mutation registry linter 17. Platform support→go-live deep links 18. Pilot-tier preflight orchestrator 19. Cross-channel order hub 20. Modern monolith velocity vs legacy re-platform cost

## Top 20 Unique Moat Ideas

Same as leapfrog list above — **honesty + operational convergence + governance** are defensible where Toast/Square compete on hardware and marketplace bundling.

---

# 20. Scorecard

| Area | Score | Evidence | Blocks Next +10 | Priority Fix |
|------|------:|----------|-----------------|--------------|
| **Overall (governance)** | **100** | RBAC wave4, mutation linter, claims cert, money-path CI | — | Sustain |
| **Overall (blended product)** | **91** | 701 pages, Era 19 pillars, Era 20 proof wiring | P0 PASS + customer | **P0 ops vault** |
| Architecture | 88 | App Router monolith, 176 API routes | Service consolidation | Post-pilot |
| Product completeness | 82 | 105 features; preview gaps | Table service, campaigns | P2 |
| UX maturity | 86 | Operator UX audit | Nav reduction 40% | Hide preview |
| Design polish | 78 | Surface table | Density tokens | P2 |
| Mobile/tablet readiness | 74 | Wizard mobile CTAs; POS tablet | Field proof in pilot | Pilot validate |
| Operator speed | 84 | POS speed mode, KDS priority | Cashier default speed | Pilot measure |
| **WOW factor** | **59** | Real pillars; no market proof | Demo + pilot reference | Proof era |
| Owner Daily Briefing | 79 | era19+20 production-grade | Outcome telemetry | Instrument clicks |
| Launch Wizard | 76 | era20 production-grade | TTV measurement | Timed study |
| Integration Health Center | 82 | trust layer + recovery flow proof | Live smoke PASS | **P0** |
| Operational intelligence | 65 | Risk radar; copilot preview | Profit/prep tiles | P2 |
| POS | 73 | tier-2b + E20 flow proofs | Hardware/offline | defer |
| KDS | 76 | priority lane; bump/recall | Rush-hour + Playwright PASS | Staging |
| Storefront | 74 | tier-2 CI | Domains automation | P2 |
| Production | 77 | board + calendar drill | KDS sync depth | P2 |
| Packing | 76 | QC checklist | Scanner hardware | P3 |
| Inventory | 68 | beta; POS-only locked | Cross-channel pressure | honest only |
| Costing | 70 | recipe/menu costing beta | Accountant sign-off | spot-check |
| Purchasing | 68 | PO flow beta | Vendor sync depth | P2 |
| CRM | 74 | pilot_ready | Campaign automation | P3 |
| Loyalty | 62 | dual ledger locked | Unified competitor parity | defer |
| Staff/labor | 68 | schedule + time clock | 7shifts depth | P2 |
| Billing/payments | 80 | Stripe pilot_ready | Enterprise invoicing | P2 |
| Integrations | 70 | 0 LIVE registry | Woo/Shopify PASS | **P0** |
| Public API | 68 | 8 routes, contract tests | SLA + scope UI | P2 |
| Webhooks | 82 | 46 routes, security matrix | Universal replay ops | P1 |
| Security | 90 | wave4, guards expanded E20 | Pen test | pre-enterprise |
| RBAC | 89 | 57 keys; E20 guard-before-query | Registry coverage | sustain |
| Tenant isolation | 86 | workspace guards | Cross-tenant E2E | sustain |
| Enterprise readiness | 73 | procurement pack honest | IdP proof | **P0** |
| Commercial readiness | 71 | runbook + E20 package | Customer + LOI | **P0** |
| Pilot readiness (executable) | 66 | flow proofs; artifacts SKIP | P0 PASS | **P0** |
| Investor readiness | 55 | template one-pager | KPI baseline PASSED | post-pilot |
| Competitor readiness | 59 | software spine; hardware gap | FOH + hardware narrative | honest defer |
| Market trust | 58 | zero paid pilots | Case study | post-pilot |
| Technical scalability | 71 | 365 models, 614 services | Prisma sprawl | Era 21 |

---

# 21. Top Risks / Top Opportunities

## Top 25 P0 Risks

1. 11 P0 env vars missing (`p0ProofStatus: awaiting_ops_credentials`) 2. No signed LOI / pilot customer 3. GO/NO-GO artifact → NO-GO 4. Tier 0/1/2 pilot gates fail/SKIP 5. Woo/Shopify live smoke SKIPPED 6. SSO IdP staging login SKIPPED 7. GitHub staging workflows no PASS URL 8. ICP not qualified in evaluator 9. KDS Playwright GitHub PASS missing 10. Zero paid pilot customer references 11. Sales maturity inflation risk 12. Unified loyalty/inventory claim pressure 13. Live integration registry 0 LIVE 14. Support impersonation privilege 15. Artifact false PASS commit risk 16. Era 19 inverted priority (39 UX before proof) 17. Nav preview modules reachable 18. Table service sold as production 19. Campaign preview sold as marketing automation 20. Copilot preview claim risk 21. Staging rollback not executed 22. Pilot metrics baseline not PASSED 23. Missing era19/20 scorecard docs 24. Cross-tenant E2E gaps on support flows 25. Typecheck pressure at 365 models

## Top 25 P1 Risks

Webhook replay ops not universal; commerce webhook drill not executed; POS permission-denied sweep incomplete; KDS realtime expectation vs poll; go-live/wizard path duplication; briefing alert noise at scale; service monolith maintainability; 1557 docs truth drift; payroll export preview sold; costing data quality; public API abuse surface; cron experimental archive hygiene; multi-location workspace polish; channel product mapping at scale; support model untested at pilot scale; investor template with no KPIs; case study without customer approval; staging URL not in evidence pack; AV vendor cert for media upload; a11y not certified; performance at briefing scale unproven; flaky E2E when staging unstable; procurement SOC2 question handling; training module depth; labor compliance packaging vs 7shifts

## Top 30 Product Gaps

Live channel proof; table service production; campaign automation; unified loyalty; cross-channel inventory; offline POS; POS hardware; realtime KDS; storefront domain automation; multi-location scorecard; profit briefing tile; predictive prep; Public API scope picker; payroll certification; food safety production; reservations production; bar tabs production; handheld production; label printing depth; vendor catalog sync; invoice OCR; marketplace live ops; SCIM; SOC2 portal; native mobile owner app; franchise rollup; tip pooling; voice KDS bump; competitor menu import; shop-pay express checkout

## Top 30 UX Gaps

Nav preview visibility; parallel go-live/wizard; no briefing telemetry; cashier speed not default; table preview labeling; campaign preview reachable; copilot beta banner inconsistency; storefront builder overwhelm; reports lack next actions; mobile Today scroll; integration health owner density; KDS poll banner; permission-denied not universal; dark mode uncertified; POS keyboard shortcuts sparse; KDS haptic/audio absent; multi-loc switcher polish; preview empty states uneven; error recovery loops (partial fixed); no unified command center brand; wizard/go-live duplicate CTAs; legacy strips on Today; support mode UX for owners; SSO proof status inline; order hub live ingest messaging; POS refund discovery; inventory cross-channel confusion; loyalty channel confusion; payroll preview reachability; executive dashboard depth

## Top 30 Engineering Gaps

P0 orchestrator PASS; staging GitHub green; live channel smoke; SSO IdP smoke; Tier 2 golden path execution; KDS Playwright staging; service consolidation map; mutation registry expansion; prisma model audit; action/registry alignment; preview URL guards; cross-tenant E2E; commerce drill; rollback drill; briefing telemetry pipeline; pilot metrics automation; webhook replay monitoring; typecheck flake reduction; shared AttentionStrip primitives; briefing policy consolidation; go-live/wizard merge; nav maturity hide 40%; AV scan vendor; public API rate limits UI; cron archive policy sustain; generated artifact commit discipline; era scorecard docs; performance load test; pen test; staging URL automation in CI

## Top 30 Commercial Gaps

No customer; no LOI; no pilot revenue; no case study; no investor KPIs; pricing not in product; ICP not qualified; staging URL missing from pack; sales deck without proof; forbidden claims training gap; competitor hardware narrative gap; marketplace LIVE claim temptation; SSO production claim temptation; unified stock claim temptation; unified rewards claim temptation; Public API SLA temptation; rush-hour KDS claim temptation; SOC2 claim temptation; pilot Week 1 not executed; pilot Week 4 not executed; support boundaries untested; rollback not tested; channel mapping burn-in not measured; accountant costing sign-off; enterprise invoicing; DPA per-customer; legal LOI execution; prospect placeholder only (E20); GO artifact NO-GO; governance 100 confused with market ready

## Top 30 Competitor Gaps

*(See Section 19 — hardware, offline, Terminal, unified loyalty, theme marketplace, Klaviyo automation, MarginEdge OCR, 7shifts compliance, live marketplaces, QB live sync, rush KDS, table depth, proven references)*

## Top 30 Next Actions

1. Configure 11 P0 env vars 2. `smoke:p0-staging-proof-unblock` → `proof_passed` 3. Fix Tier 0 → PASS 4. SSO IdP smoke PASS 5. Woo or Shopify live PASS 6. GitHub staging first green 7. Qualify ICP prospect 8. Sign LOI 9. Re-run `smoke:pilot-gono-go` → GO 10. Execute Tier 2 golden path 11. Pilot kickoff Week 1 12. Capture pilot metrics baseline 13. **Freeze** new UX convergence cycles 14. Measure Launch Wizard TTV 15. Instrument briefing clicks 16. KDS Playwright staging PASS 17. Commerce webhook drill 18. Rollback tabletop 19. Publish pilot SKU 20. Customer case study draft 21. Investor one-pager v3 with KPIs 22. Nav hide preview sweep 23. Table service RFC (post-pilot month 2) 24. Sustain forbidden-claims gate 25. Record staging URL in evidence pack 26. Train support on pilot boundaries 27. Create era20 scorecard at proof closure 28. Update canonical-doc-index → this audit 29. Profit briefing tile (P2) 30. Multi-location scorecard (P2)

## Top 20 Things to Stop Doing

1. Era 19-style deep-link/strip cycles before P0 PASS 2. Fake PASS on smokes/artifacts 3. Maturity inflation in matrix/GTM 4. Reopening browser E2E policy 5. Hardware/offline/marketplace live claims 6. UX-only cycles without proof 7. SCIM/SOC2 implementation claims 8. Unlocking cross-channel inventory 9. Unlocking unified rewards 10. Selling rush-hour KDS SLO 11. Selling Public API SLA 12. Creating ad-hoc audit docs outside canon 13. Duplicating go-live and wizard messaging 14. Committing SKIPPED artifacts as PASS 15. Governance score as market readiness proxy 16. Copilot auto-actions 17. Full Klaviyo clone attempts 18. Full QuickBooks replacement attempts 19. Toast hardware mimicry 20. Enterprise franchise rollout before single-loc pilot

## Top 20 Things to Double Down On

1. Honest Integration Health Center 2. Owner Daily Briefing 3. Launch Wizard pilot onboarding 4. Order spine + money-path CI 5. GO/NO-GO artifact discipline 6. Forbidden claims enforcement 7. KDS priority lane 8. POS speed mode + shift closeout 9. Packing/production QC checklists 10. Role-based landing + packs 11. Guard-before-query RBAC 12. Webhook security matrix 13. Channel golden path synthetic CI 14. Commercial pilot runbook execution 15. Flow proof pattern (E20 5-hop) 16. Pilot package + ICP bridge (E20) 17. POS-only inventory honesty 18. Dual-ledger rewards honesty 19. Platform support deep links 20. First paid pilot customer capture

---

# 22. Final Roadmap

## Next 7 days

| Item | Detail |
|------|--------|
| **Goal** | Ops vault configured; P0 orchestrator attempted |
| **Tasks** | Sign ops checklist; set 11 env vars; run `smoke:p0-staging-proof-unblock --checklist-only`; run full orchestrator; fix Tier 0 taxonomy if needed |
| **Acceptance** | `p0ProofStatus: proof_passed` OR documented SKIPPED with owner sign-off on blockers |
| **Validation** | `artifacts/p0-staging-proof-unblock-summary.json` |
| **Owner** | VP Operations + DevOps |
| **Score lift** | Pilot readiness +5 → ~71 |

## Next 14 days

| Item | Detail |
|------|--------|
| **Goal** | SSO + one channel + staging workflow PASS |
| **Tasks** | IdP smoke; Woo **or** Shopify live; GitHub first green; re-run GO/NO-GO |
| **Acceptance** | Child artifacts `proof_passed`; GO/NO-GO moves toward GO pending LOI |
| **Validation** | SSO, channel-live, staging-workflows artifacts |
| **Owner** | CTO + Integration engineer |
| **Score lift** | Commercial +5 → ~76; Integrations +8 |

## Next 30 days

| Item | Detail |
|------|--------|
| **Goal** | **GO decision + pilot kickoff** |
| **Tasks** | Qualify ICP; sign LOI; Tier 2 golden path; forbidden claims gate; Week 1 runbook |
| **Acceptance** | `pilot-gono-go-summary.json` → **GO**; customer record; Tier 2 sign-off |
| **Validation** | GO/NO-GO + golden path + kickoff checklist |
| **Owner** | Founder + COO + CS |
| **Score lift** | Commercial +10 → ~81; Market trust +8 |

## Next 60 days

| Item | Detail |
|------|--------|
| **Goal** | Pilot execution + Era 19 pillar measurement |
| **Tasks** | Week 1–4 check-ins; Launch Wizard TTV study; briefing telemetry; KDS Playwright PASS; rollback drill |
| **Acceptance** | `pilot-metrics-baseline-summary` overall PASSED target; TTV documented |
| **Validation** | Metrics artifact + timed onboarding study |
| **Owner** | CPO + CS + QA |
| **Score lift** | WOW +8 → ~67; Investor +10 |

## Next 90 days

| Item | Detail |
|------|--------|
| **Goal** | GTM proof + Era 20 closure |
| **Tasks** | Case study approval; investor one-pager v3; nav hide sweep; table service RFC; era20 scorecard; Era 21 planning |
| **Acceptance** | Customer quote; real KPIs; scorecard published; canonical index updated |
| **Validation** | Case study + investor doc + scorecard |
| **Owner** | CEO + VP Marketing + VP Product |
| **Score lift** | Blended product +3 → ~94; Competitor readiness +5 |

---

# 23. Next Master Prompt Input

## 1. Current Reality

OS Kitchen @ `70a467b`: **701 pages**, **614 services**, **365 Prisma models**, unified restaurant OS with **real Era 19 WOW pillars** (Owner Daily Briefing, Launch Wizard, Integration Health) and **Era 20 cycles 1–18 proof wiring** (flow proofs, guard-before-query, trust layer, ICP bridge, pilot package). **P0 staging proof: `awaiting_ops_credentials` (11 env vars). GO/NO-GO: NO-GO. No paid pilot customer. Integration registry: 0 LIVE.**

## 2. Biggest Blockers

11 P0 env vars; no LOI/customer; live Woo/Shopify SKIPPED; SSO IdP SKIPPED; staging GitHub PASS missing; Tier 2 golden path not executed; zero customer references.

## 3. What to Focus On Next

**Era 20 Band A completion (cycles 19–30 in execution map spirit):** ops vault → P0 PASS → channel/SSO/staging PASS → ICP + LOI → GO → kickoff. Use pillars in demos/pilot onboarding only with honest SKIPPED labels.

## 4. What to Stop

New UX convergence/deep-link cycles; fake PASS; maturity inflation; hardware/offline/marketplace claims; unified inventory/rewards unlock; SCIM/SOC2 claims.

## 5. Priority Order

P0 ops proof → GO/NO-GO GO → pilot kickoff → metrics baseline → measure pillars (TTV, briefing) → GTM proof (case study, investor v3) → operational depth (table service RFC, nav hide).

## 6. Required Workstreams

**A.** Ops/DevOps secrets + P0 orchestrator **B.** Integration live smoke **C.** SSO IdP proof **D.** Commercial (ICP, LOI, GO) **E.** Pilot execution (runbook) **F.** Measurement (TTV, telemetry) **G.** GTM proof post-pilot

## 7. Safety Rules

Read-only audit discipline; no fake PASS; no deploy/push unless requested; matrix wins over marketing; money-path CI frozen; POS-only inventory locked; dual-ledger locked; commit artifacts only after real PASS.

## 8. Next 20–30 Cycle Map

| Band | Cycles | Theme |
|------|--------|-------|
| A | 19–26 | Complete P0 proof + GO (continues Era 20) |
| B | 27–30 | Pilot kickoff + metrics baseline |
| C | 31–33 | Measure pillars (no new features) |
| D | 34–38 | KDS Playwright, rollback, nav hide, drills |
| E | 39–43 | Channel depth, webhook ops, Public API scope UI |
| F | 44–48 | Case study, investor v3, era20 scorecard |

*(Aligns with `docs/next-30-cycle-execution-map-post-era19-2026-05-28.md` Bands A–F; Era 20 cycles 1–18 already delivered proof **wiring**, not proof **PASS**.)*

## 9. Acceptance Criteria (Era 20 Closure)

1. `p0ProofStatus: proof_passed` 2. GO/NO-GO → **GO** with customer 3. One paid pilot ≥30 days 4. Pilot metrics baseline PASSED 5. Launch Wizard TTV measured 6. No maturity inflation 7. `docs/era20-cycle-completion-scorecard-2026-05-28.md` published

## 10. Final Recommendation

**Stop product polish. Execute proof.** OS Kitchen has crossed a **UX inflection** but not a **commercial inflection**. The next master prompt theme remains **EVOLUTION ERA 20 — PROOF EXECUTION + FIRST PAID PILOT**. Controlled pilot is **ready in product UX** and **not ready in commercial execution**. New master prompt **is required** to prevent regression into Era 19 convergence loops.

---

*End of full audit @ `70a467b` · 2026-05-28 · Read-only inspection · Single deliverable: `docs/fullaudit28may.md`*


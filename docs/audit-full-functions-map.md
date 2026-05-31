# Full Project Function & Logic Audit

> **Audit date:** 2026-05-21  
> **Mode:** Read-only — no code, schema, env, or database changes.  
> **Artifact:** `docs/audit-full-functions-map.md`

---

## Audit coverage statistics

| Metric | Count |
|--------|------:|
| Files reviewed (app pages, API, actions, services, lib, components, hooks, schema, tests) | **~3,518** |
| App `page.tsx` routes | **655** |
| Dashboard pages | **493** |
| API `route.ts` handlers | **264** |
| Server action files | **126** |
| Exported server action functions | **670** |
| Service layer `.ts` files | **519** |
| `lib/` modules | **1020** |
| React components | **675** |
| Hooks | **3** |
| Prisma models | **330** |
| Vitest files | **219** |
| Playwright e2e specs (root `e2e/`) | **36** |
| TypeScript `tsc --noEmit` | **PASS** (0 errors at audit time) |

---

## 1. Executive Summary

### Overall status

OS Kitchen is a **large, production-shaped Next.js 15 monolith** for meal-prep / catering / commissary operators: dashboard ops, POS, KDS, production, packing, storefront checkout, channel imports, CRM, billing, and an extensive internal platform surface. The codebase is **feature-rich and architecturally intentional** (tenant actor, workspace RBAC, lifecycle rules, service layer), but carries **migration debt** (userId vs workspaceId), **API surface bloat** (133 cron folders, 46 webhooks), and **uneven auth hardening** on some integration paths.

### Production readiness score: **72 / 100**

| Area | Score | Notes |
|------|------:|-------|
| Product completeness | 78 | Broad module coverage; some routes are pilot/growth gated |
| Backend logic | 74 | Strong services + lifecycle; dual permission systems |
| Frontend logic | 70 | Many dashboard pages; loading/error parity varies |
| DB consistency | 65 | 330 models; workspace migration ~38/200 scoped models |
| Security | 68 | Good Stripe/cron/public API patterns; Uber Eats webhook weak |
| Tenant isolation | 70 | Query-layer guards solid when used; IDOR risk on raw id queries |
| UX readiness | 73 | Storefront mature; dashboard density high |
| Performance | 71 | CDN tags, indexes on hot paths; shopDomain unindexed |
| Maintainability | 62 | Experimental cron/webhook sprawl |
| **Overall production readiness** | **72** | Ship-ready core paths; tighten integrations + scope audit |

### Top risks (do not fix in this audit)

1. **Uber Eats webhook** accepts any POST with `?cid=` — `signatureValid: true` hardcoded (`app/api/webhooks/uber-eats/orders/route.ts`).
2. **Workspace migration incomplete** — 162+ models still primarily `userId`-scoped; handlers skipping `buildOwnerScopedWhere` are IDOR candidates.
3. **UserProfile cascade** — deleting owner wipes ~300 related tables.
4. **121 experimental cron routes on disk** — gated but increase attack surface if `CRON_SECRET` leaks.
5. **WebhookEvent dedup** — no DB unique on `(connectionId, externalEventId)`; race duplicates possible.
6. **Middleware excludes `/api/*`** — every API must self-guard.

### Strongest parts

- **Order lifecycle** — `lib/workflows/order-lifecycle-rules.ts` + `services/workflows/order-lifecycle-service.ts`
- **Mutation RBAC** — `requireMutationPermission` with workspace + legacy fallback
- **Storefront checkout** — rate limit, Turnstile, Zod v2 schema, Stripe Connect path
- **Production crons** — allowlist in `services/cron/production-manifest.ts`, fail-closed auth
- **Test investment** — 200+ unit tests on tenant scope, storefront, POS, crons

### Weakest parts

- Experimental/regulatory cron & webhook naming surface (disk clutter)
- Dual permission systems (legacy `UserProfile.role` + workspace keys)
- Billing still **per-user** not per-workspace
- Inconsistent action auth (`requireUserProfile` vs `requireMutationPermission` vs public)

---

## 2. Full Route Map

### Route taxonomy

| Segment | Pages | Auth (edge) | Purpose |
|---------|------:|-------------|---------|
| `/dashboard/*` | 493 | Supabase session required | Operator workspace |
| `/platform/*` | ~40 | Session + platform admin | Internal ops |
| `/s/[slug]/*` storefront | ~30+ | Public (+ optional account) | Customer ordering |
| Marketing (`/`, `/pricing`, `/product`, …) | ~80 | Public | GTM / SEO |
| `/onboarding` | 4 | Session | Setup wizard |
| `/login`, `/signup` | 5 | Public (redirect if authed) | Auth |
| `/kds`, `/driver` | 2 | Role-specific | Floor apps |
| `/order/*` public lookup | 2 | Token-based | Order status QR |
| Other (help, legal, demo, lp) | ~50 | Mostly public | Support / compliance |

### Representative dashboard routes

| Route | File | Purpose | Auth | Data source | Status | Issues |
|-------|------|---------|------|-------------|--------|--------|
| `/dashboard` | `app/dashboard/page.tsx` | Home / KPIs | Session + tenant actor | Prisma aggregates | OK | Module gates may hide widgets |
| `/dashboard/orders` | `app/dashboard/orders/page.tsx` | Order list | `orders.manage` | `orderListWhereForOwner` | OK | Verify filters on workspace switch |
| `/dashboard/orders/[id]` | `app/dashboard/orders/[id]/page.tsx` | Order detail | Scoped order guard | `loadOrderDetailPageData` | OK | statusDetail vs status enum drift |
| `/dashboard/orders/new` | `app/dashboard/orders/new/page.tsx` | Manual order | `createOrder` action | Form → action | OK | Plan limit check in action |
| `/dashboard/pos` | `app/dashboard/pos/page.tsx` | POS terminal | POS permissions | POS services | OK | Stripe terminal env dependent |
| `/dashboard/production` | `app/dashboard/production/page.tsx` | Production board | `production.manage` | ProductionBatch/WorkItem | OK | |
| `/dashboard/packing` | `app/dashboard/packing/page.tsx` | Packing queue | `packing.manage` | PackingTask | OK | |
| `/dashboard/kitchen` (KDS) | KDS routes | Kitchen display | KDS actions | `kitchen-daily-kds` | OK | Separate from `/kds` public? |
| `/dashboard/storefront/*` | Many | Storefront admin | Tenant + staff | Storefront actions | OK | Largest action cluster |
| `/dashboard/customers/*` | CRM | Customer 360 | `requireCrmMutation` | `KitchenCustomer` | OK | |
| `/dashboard/billing/*` | SaaS billing | Owner billing | Session owner id | Subscription | Partial | Not workspace-scoped |
| `/dashboard/settings/*` | Settings center | Section ACL | `settings-center` actions | KitchenSettings | OK | |
| `/dashboard/integrations/*` | Channels | `integrations.manage` | IntegrationConnection | OK | Uber webhook weak |
| `/dashboard/reports/*` | Reporting | Report permissions | `report-service` | OK | Heavy queries |
| `/dashboard/meal-plans/*` | Meal plans | Meal plan mutation gate | MealPlan models | OK | Auto-renew cron |
| `/dashboard/catering-quotes/*` | Catering | Quote permissions | CateringQuote | OK | 24 actions |
| `/dashboard/copilot/*` | AI copilot | Feature flag / billing | Copilot services | Pilot | |
| `/dashboard/demo/*` | Demo scenarios | Platform/demo | Demo seed services | Dev | |

### Storefront public routes

| Route | File | Purpose | Auth | Data | Status |
|-------|------|---------|------|------|--------|
| `/s/[slug]` | `app/s/[slug]/page.tsx` | Store home | Public | StorefrontSettings + menu | OK |
| `/s/[slug]/checkout` | checkout page | Cart checkout | Public + Turnstile | `submitPublicStorefrontOrder` | OK |
| `/s/[slug]/collections/[...]` | Collections | Catalog browse | Public | Menu/products | OK |
| `/order/[token]` | Public order lookup | Token | Order by lookup token | OK | Token entropy critical |

### Marketing / auth (sample)

| Route | Auth | Notes |
|-------|------|-------|
| `/` | Public | Landing |
| `/login`, `/signup` | Public | Supabase auth actions |
| `/onboarding` | Session | 14 onboarding actions |
| `/platform/*` | Platform admin | `lib/platform/platform-guards.ts` |

**Full dashboard route inventory:** see [Appendix A — Dashboard Routes](#appendix-a--dashboard-routes) (493 routes).

---

## 3. Full API Map

### API summary by prefix

| Prefix | Count | Auth pattern | Notes |
|--------|------:|--------------|-------|
| `cron/*` | 133 | Bearer `CRON_SECRET` | **12 production** allowlisted |
| `webhooks/*` | 46 | HMAC / Bearer per provider | Stripe strong; Uber weak |
| `storefront/*` | 23 | Public + internal secrets | Cart, catalog, host resolve |
| `public/v1/*` | 8 | API key `kos_*` | Enterprise gate |
| `dashboard/*` | 7 | Session / internal | Ops helpers |
| `integrations/*` | 9 | Mixed | Channel callbacks |
| `export/*` | 9 | Auth + permissions | CSV/stream exports |
| Other | 35 | Mixed | billing, health, import |

### Production cron routes (scheduled)

| API Route | Method | File | Purpose | Auth | DB / Services | Issues |
|-----------|--------|------|---------|------|---------------|--------|
| `/api/cron/webhook-jobs` | GET/POST | `app/api/cron/webhook-jobs/route.ts` | Drain webhook queue | CRON_SECRET | WebhookProcessingJob | dryRun supported |
| `/api/cron/reminders` | GET/POST | `app/api/cron/reminders/route.ts` | Order reminder emails | CRON_SECRET | Order, email | timezone? |
| `/api/cron/storefront-domain-recheck` | GET/POST | domain recheck | CRON_SECRET | StorefrontDomain | |
| `/api/cron/storefront-cart-recovery` | GET/POST | abandoned cart | CRON_SECRET | StorefrontCartRecovery | |
| `/api/cron/storefront-theme-publish` | GET/POST | theme publish | CRON_SECRET | theme experiments | |
| `/api/cron/storefront-team-invite-reminders` | GET/POST | invites | CRON_SECRET | team invites | |
| `/api/cron/storefront-webhook-retention` | GET/POST | retention | CRON_SECRET | webhook logs | |
| `/api/cron/storefront-invite-audit-retention` | GET/POST | audit retention | CRON_SECRET | audit | weekly |
| `/api/cron/storefront-ga4-parity` | GET/POST | GA4 parity | CRON_SECRET | analytics | |
| `/api/cron/storefront-edge-sync` | GET/POST | edge sync | CRON_SECRET | CDN/experiments | every 2 min |
| `/api/cron/pilot-daily-health` | GET/POST | pilot health | CRON_SECRET | ops | |
| `/api/cron/meal-plan-auto-renew` | GET/POST | meal plan renew | CRON_SECRET | MealPlan | |

Manifest: `services/cron/production-manifest.ts`. **121 cron folders are experimental** (hypergraph/regulatory names) — return 404 in prod unless `ENABLE_EXPERIMENTAL_CRONS=true`.

### Critical webhooks

| API Route | Method | File | Auth | DB Models | Issues |
|-----------|--------|------|------|-----------|--------|
| `/api/webhooks/stripe` | POST | `app/api/webhooks/stripe/route.ts` | Stripe signature | BillingEvent, Subscription, Order | Idempotent billing |
| `/api/webhooks/shopify/*` | POST | shopify routes | HMAC per connection | IntegrationConnection | shopDomain lookup — **no index** |
| `/api/webhooks/woocommerce` | POST | woocommerce | WC signature + cid | IntegrationConnection | OK |
| `/api/webhooks/uber-eats/orders` | POST | uber-eats | **cid only** | WebhookEvent, Order | **CRITICAL: no signature** |
| `/api/webhooks/resend` | POST | resend | Svix HMAC | notifications | OK |

### Storefront API (sample)

| API Route | Purpose | Auth |
|-----------|---------|------|
| `/api/storefront/cart` | Cart CRUD | Public slug scope |
| `/api/storefront/catalog` | Menu catalog | Public |
| `/api/storefront/resolve-host` | Vanity host → slug | `x-kos-mw-secret` |
| `/api/storefront/shipping/quote` | Shipping quote | Public |
| `/api/storefront/qr` | QR helpers | Public |

### Public enterprise API

| API Route | Purpose | Auth |
|-----------|---------|------|
| `/api/public/v1/orders` | Order API | `guardPublicApi` + API key |
| `/api/public/v1/customers` | Customers | same |
| `/api/public/v1/products` | Products | same |
| `/api/public/v1/webhooks` | Manual webhook ingest | enterprise gate |

**Full API inventory:** [Appendix B — API Routes](#appendix-b--api-routes) (264 routes).

---

## 4. Full Server Actions Map

### Auth pattern distribution (126 files)

| Pattern | Files (approx) | Examples |
|---------|----------------|----------|
| `requireMutationPermission` | ~45 | `orders.ts`, `production.ts`, `packing.ts` |
| `requireTenantActor` | ~35 | storefront admin, POS tabs, tables |
| `requireUserProfile` | ~20 | staff, implementation, import-center |
| `requireCrmMutation` | 1 (24 fns) | `customers.ts` |
| Public / rate limit | 4 | `auth.ts`, `storefront-order.ts`, `beta.ts`, `book-demo.ts` |
| Platform-only | 3 | `platform-support*`, `platform-impersonation.ts` |

### Actions by domain (file → function count)

| File | # exports | Primary permission | Key DB models |
|------|----------:|-------------------|---------------|
| `customers.ts` | 24 | CRM | KitchenCustomer, segments |
| `catering-quotes.ts` | 24 | quotes | CateringQuote |
| `storefront-pages.ts` | 22 | tenant | StorefrontPage |
| `meal-plans.ts` | 20 | meal plan | MealPlan |
| `kitchen-task.ts` | 19 | tasks | KitchenTask |
| `growth.ts` | 17 | growth/internal | BetaLead |
| `locations.ts` | 16 | tenant | Location |
| `implementation.ts` | 16 | user profile | ImplementationProject |
| `settings-center.ts` | 16 | settings sections | KitchenSettings |
| `onboarding.ts` | 14 | session | UserProfile, KitchenSettings |
| `delivery-route.ts` | 15 | routes | DeliveryRoute |
| `orders.ts` | 5 | orders.manage | Order, Menu, Product |
| `storefront-order.ts` | 1 | **public** | Order, StorefrontSettings, Stripe |
| `pos.ts` | 9 | POS | POSTransaction, Order |
| `auth.ts` | 4 | Supabase | UserProfile |

**Full action list (670 functions):** [Appendix C — Server Actions](#appendix-c--server-actions).

---

## 5. Full Services Map

Functional modules (no `*Service` classes). Top directories by file count:

| Domain | Files | Purpose | Key entrypoints |
|--------|------:|---------|-----------------|
| storefront/ | 178 | Checkout, theme, domains, cart recovery | `storefront-payment-service`, `storefront-cart-service` |
| platform/ | 15 | Support, impersonation | `platform-support-service` |
| pos/ | 15 | Checkout, refunds, tabs | `pos-checkout-service` |
| integrations/ | 9 | Uber, Shopify, DoorDash | normalizers + sync |
| orders/ | 9 | Creation, detail, blockers | `order-creation-service`, `order-detail-service` |
| crm/ | 10 | Customers, metrics | `customer-service` |
| billing/ | 6 | Stripe SaaS | `subscription-service` |
| reports/ | 1 (large) | Report registry | `runReport` |
| permissions/ | 3 | RBAC resolution | `permission-service` |
| production/ | 3 | Batches, calendar | production generators |
| inventory/ | 8 | Stock, recipes, waste | receiving, counts |
| webhooks/ | 8 | Ingest, retry | `webhook-retry-service` |
| audit/ | 5 | Audit log/export | `audit-service` |
| forecast/ | 5 | Demand/labor | `forecast-service` |
| training/ | 1 (21 exports) | LMS | programs, quizzes |
| playbooks/ | 2 | Runbooks | orchestration |
| go-live/ | 1 | Launch validation | checklist |
| implementation/ | 2 | Onboarding projects | mapping |
| ai/ | 8 | Copilot | drafts, insights |

### Hooks, layouts, middleware (supporting surface)

| Asset | Path | Purpose |
|-------|------|---------|
| `useStorefrontCart` | `hooks/use-storefront-cart.ts` | Client cart state for `/s/[slug]` |
| `useSyncedServerState` | `hooks/use-synced-server-state.ts` | Sync client state with server props |
| `useMounted` | `hooks/use-mounted.ts` | Hydration-safe mount guard |
| Root layout | `app/layout.tsx` | Global HTML, fonts, providers |
| Dashboard layout | `app/dashboard/layout.tsx` | `getTenantActor`, permissions, module gates, onboarding redirect |
| Platform layout | `app/platform/layout.tsx` | Platform admin guard |
| Storefront layout | `app/s/[slug]/layout.tsx` | Store theme, market/brand cookies |
| Edge middleware | `middleware.ts` | Supabase refresh, vanity host rewrite, theme experiments; **matcher excludes `/api/*`** |
| Supabase redirects | `lib/supabase/middleware.ts` | `/dashboard`, `/platform`, `/onboarding` → login if anonymous |

**Layouts:** 44 `layout.tsx` files under `app/` (dashboard subtree dominates).

**Components:** 675 files under `components/` — primary clusters: `components/dashboard/*` (shell, tables, forms), `components/storefront/*` (checkout, builder), `components/orders/*`, `components/pos/*`, `components/production/*`, `components/auth/*`, `components/permissions/*`.

---

## 6. Full Database Model Map

**Schema:** `prisma/schema.prisma` — **330 models**, PostgreSQL.

### Core tenant models

| Model | Purpose | Key fields | Relations / risks |
|-------|---------|------------|-------------------|
| **UserProfile** | Auth mirror, legacy owner | email, role, onboardingCompleted | Cascade deletes ~all tenant data |
| **Workspace** | Multi-tenant boundary | ownerUserId, organizationId | SetNull on many children |
| **WorkspaceMember** | Membership | roleType | unique (workspaceId, userId) |
| **Organization** | Billing shell | owner | workspaces |
| **Brand** | Concept within workspace | slug | unique per workspace |
| **KitchenSettings** | 1:1 kitchen config | businessName, locale, tax | **userId only** |
| **Subscription** | SaaS plan | stripe ids, status | **per userId** not workspace |

### Operations models

| Model | CRUD hotspots | Indexes | Notes |
|-------|---------------|---------|-------|
| **Order** | actions/orders, storefront-order, POS, channels | userId+createdAt, workspaceId+status | status + statusDetail widening |
| **OrderItem** | order create, POS | orderId, productId | product onDelete **Restrict** |
| **Menu** / **Product** | menus, products actions | workspace scoped | catalogOnly menus |
| **ProductionBatch** / **ProductionWorkItem** | production actions | productionDate | links to orders |
| **PackingTask** / **PackingVerificationSession** | packing actions | | pack token flows |
| **KitchenCustomer** | customers.ts (24 actions) | | CRM hub |
| **StorefrontSettings** | 20+ storefront actions | unique storeSlug | vanity host |
| **IntegrationConnection** | integrations | workspaceId+provider | **shopDomain unindexed** |
| **WebhookEvent** | webhooks + cron | receivedAt | dedup race risk |
| **POSTransaction** / **PosTab** | pos.ts | | Stripe refunds |

### Domain counts (330 models)

| Domain | ~Models | Examples |
|--------|--------:|------------|
| Orders & catalog | 30 | Order, Product, Menu, ChannelImportBatch |
| Storefront | 29 | StorefrontSettings, StorefrontCartRecovery |
| Production & packing | 20 | ProductionBatch, PackingTask |
| Inventory & costing | 30 | Ingredient, Recipe, CostingRun |
| Customers & catering | 31 | KitchenCustomer, CateringQuote, DeliveryRoute |
| Staff & training | 26 | StaffMember, TrainingProgram |
| Platform & support | 28 | AuditLog, SupportTicket |
| POS | 14 | POSTerminal, RestaurantTable |
| Analytics & AI | 21 | CopilotConversation, ForecastRun |
| Compliance / experiments | 74+ | Many regulatory-named experiment models |

**Workspace migration:** ~38 models have `workspaceId`; **162+ models remain userId-primary**. Always use `lib/scope/workspace-resource-scope.ts` OR filters.

---

## 7. Full Frontend ↔ Backend Flow Map

### 7.1 Orders — manual create

| Step | Component / route | Backend | DB |
|------|-------------------|---------|-----|
| Render form | `components/dashboard/order-create-form.tsx` | — | loads menus/products server-side |
| Submit | form action `createOrder` | `actions/orders.ts` | Order, OrderItem |
| Auth | — | `requireMutationPermission("orders.manage")` | |
| Validate | — | `orderCreateSchema` (Zod) | |
| Business rules | — | active menu check, plan limits | Menu, Product |
| Side effects | — | email, CRM upsert, audit | Customer metrics |
| UX | — | returns `{ error }` string | **No toast in action itself** — component must show |
| Missing | optimistic update N/A (form) | double-submit: browser default | loading state in component |

### 7.2 Orders — status update

| Step | `components/orders/order-detail-operations.tsx` | `updateOrderStatus` | |
| Lifecycle | — | `validateOrderDbStatusTransition` | Prisma Order.status |
| Revalidate | — | `revalidatePath` dashboard orders | |

### 7.3 Storefront checkout

| Step | `components/storefront/store-checkout-client.tsx` | `submitPublicStorefrontOrder` |
| Rate limit | — | `enforceStorefrontRateLimit` |
| Bot protection | Turnstile token | `verifyTurnstileToken` |
| Honeypot | websiteUrl field | rejects if set |
| Catalog | — | `buildStorefrontMenuCatalog`, `priceCartLines` |
| Totals | — | `computeCheckoutTotals`, tax provider |
| Payment | Stripe redirect or pay-later | `createStorefrontStripeCheckoutSession` |
| CRM | — | `upsertCustomerFromOrder` |

### 7.4 POS checkout

| Step | POS UI components | `posCheckoutAction` → `services/pos/pos-checkout-service.ts` |
| Auth | — | POS permissions / tenant actor |
| Payment | Stripe card present / cash | POSTransaction |
| Kitchen | — | routing to production/KDS |

### 7.5 KDS

| Step | KDS page | `fetchTodayQueueAction`, `bumpDailyKdsOrderAction` |
| Data | — | orders in kitchen statuses |

### 7.6 Packing verification

| Step | packing verify UI | `lookupOrderByPackTokenAction` (token-based) |
| Security | pack token entropy | scoped to packing session |

### 7.7 Settings center

| Step | settings sections | `actions/settings-center.ts` (16 saves) |
| Auth | — | `requireTenantActor` + `canAccessSettingsSection` |

---

## 8. Module-by-module Deep Audit

### Orders
- **Works:** create, status transitions, reminders, public lookup token, lifecycle guards, CRM sync.
- **Connections:** production, packing, routes, storefront, channels, POS.
- **Incomplete:** `statusDetail` widened string vs DB enum-only transitions.
- **Risk:** IDOR if detail page loads by id without `whereOwnedOrderForOwner`.
- **Test:** plan limits, transition matrix, empty line items, workspace switch.

### POS
- **Works:** checkout, shifts, refunds, tabs, table layout.
- **Risk:** Stripe terminal config; void/refund permissions.
- **Test:** `tests/unit/pos-*`, `e2e/pos-checkout-flow.spec.ts`.

### Kitchen Display (KDS)
- **Works:** daily queue fetch/bump actions.
- **Test:** manual kitchen floor + bump edge cases.

### Production
- **Works:** tasks, batches, calendar, daily queue.
- **Connections:** orders → work items → packing.
- **Test:** batch generation from orders.

### Meal Plans
- **Works:** 20 actions, auto-renew cron.
- **Test:** renewal failure, proration.

### Storefront
- **Works:** largest module — checkout, theme experiments, domains, team invites, cart recovery.
- **Strong:** rate limits, Turnstile, Stripe Connect, middleware host resolution.
- **Risk:** experiment cron surface; preview tokens.
- **Test:** extensive `tests/unit/storefront*`, many e2e specs.

### Products / Menus / Categories
- **Works:** CRUD actions, catalog-only menus, POS visibility flags.
- **Test:** active menu gating on order create.

### Customers (CRM)
- **Works:** 24 actions — segments, follow-ups, dedupe.
- **Auth:** `requireCrmMutation` consistently.

### Payments / Stripe
- **Split:** SaaS (`lib/billing`, stripe webhook) vs order payment modes vs storefront Connect.
- **Test:** `stripe-checkout-ready`, webhook signature tests.

### Subscriptions / Invoices
- **Works:** billing dashboard, BillingEvent idempotency.
- **Gap:** workspace-level billing not modeled.

### Reports
- **Works:** `report-service` registry, CSV export action.
- **Risk:** heavy queries without pagination on large tenants.

### Inventory / Costing / Recipes
- **Works:** inventory actions, costing snapshots.
- **Test:** costing alerts unit tests.

### Staff / Roles / Permissions
- **Dual system:** legacy OWNER/STAFF + workspace permission keys.
- **Test:** `mutation-access.test.ts`, `customers-rbac.test.ts`.

### Workspace / Tenant
- **Works:** `getTenantActor`, scoped where builders.
- **Gap:** migration incomplete — audit every `findUnique({ where: { id } })`.

### Settings
- **Works:** section-gated saves.
- **Test:** `settings-workspace-access.test.ts`.

### QR / Public lookup
- **Works:** `generatePublicLookupToken` on order create.
- **Test:** token guessing resistance.

### Notifications / Email
- **Works:** reminder cron, Resend webhook, notification center actions.
- **Test:** email failure paths.

### Cron / Automation
- **Works:** 12 production crons with manifest sync.
- **Risk:** 121 experimental routes on disk.

### Import / Export
- **Works:** import-center, channel command center, CSV exports.
- **Test:** `import-center-scope.test.ts`.

### Admin / Platform
- **Works:** platform layout guards, impersonation, support sessions.
- **Test:** `platform-access-denial.spec.ts`, impersonation MFA tests.

---

## 9. Function-by-function Inventory (critical paths)

### createOrder()
- **File:** `actions/orders.ts`
- **Used by:** components/dashboard/order-create-form.tsx
- **Auth:** requireMutationPermission("orders.manage")
- **Database:** Order, OrderItem, Menu, Product
- **Input:** FormData → {error}|success
- **Logic:** Plan limits, lifecycle, CRM, email
- **Risks:** HIGH if scope bypass
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### updateOrderStatus()
- **File:** `actions/orders.ts`
- **Used by:** order-detail-operations.tsx
- **Auth:** orders.manage
- **Database:** Order
- **Input:** orderId, status
- **Logic:** validateOrderDbStatusTransition
- **Risks:** statusDetail drift
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### submitPublicStorefrontOrder()
- **File:** `actions/storefront-order.ts`
- **Used by:** store-checkout-client.tsx
- **Auth:** rate limit + Turnstile
- **Database:** Order, StorefrontSettings
- **Input:** checkoutSubmitV2Schema
- **Logic:** Stripe session or pay-later
- **Risks:** slug enumeration
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### createOrderViaCenterAction()
- **File:** `actions/order-creation.ts`
- **Used by:** order-center.tsx
- **Auth:** requireUserProfile + tenant
- **Database:** Order
- **Input:** center payload
- **Logic:** order-creation-service
- **Risks:** different auth than orders.ts
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### posCheckoutAction()
- **File:** `actions/pos.ts`
- **Used by:** POS UI
- **Auth:** POS perms
- **Database:** POSTransaction, Order
- **Input:** POS payload
- **Logic:** pos-checkout-service
- **Risks:** Stripe env
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### signInAction()
- **File:** `actions/auth.ts`
- **Used by:** login-form.tsx
- **Auth:** public
- **Database:** Supabase session
- **Input:** credentials
- **Logic:** redirect
- **Risks:** brute force — Supabase rate limits
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### requireMutationPermission()
- **File:** `lib/permissions/mutation-access.ts`
- **Used by:** most mutations
- **Auth:** session+workspace
- **Database:** —
- **Input:** PermissionKey
- **Logic:** legacy fallback
- **Risks:** dual matrix confusion
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### getTenantActor()
- **File:** `lib/scope/cached-tenant.ts`
- **Used by:** dashboard layout
- **Auth:** session
- **Database:** UserProfile, Workspace
- **Input:** —
- **Logic:** resolves data owner
- **Risks:** stale cache rare
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### checkoutPosSale()
- **File:** `services/pos/pos-checkout-service.ts`
- **Used by:** posCheckoutAction
- **Auth:** called from action
- **Database:** Order, POSTransaction
- **Input:** sale DTO
- **Logic:** Stripe/inventory
- **Risks:** payment partial failure
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### loadOrderDetailPageData()
- **File:** `services/orders/order-detail-service.ts`
- **Used by:** order [id] page
- **Auth:** scoped
- **Database:** Order+*
- **Input:** orderId
- **Logic:** blockers bundle
- **Risks:** overfetch
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### runReport()
- **File:** `services/reports/report-service.ts`
- **Used by:** reports actions
- **Auth:** permissions
- **Database:** many
- **Input:** report key
- **Logic:** aggregations
- **Risks:** timeout on big tenants
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### applyStripeSubscription()
- **File:** `services/billing/subscription-service.ts`
- **Used by:** stripe webhook
- **Auth:** signature
- **Database:** Subscription, BillingEvent
- **Input:** Stripe event
- **Logic:** idempotent
- **Risks:** webhook secret rotation
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### isStorefrontOnlineCheckoutAvailable()
- **File:** `services/storefront/storefront-payment-service.ts`
- **Used by:** checkout
- **Auth:** public slug
- **Database:** StorefrontSettings
- **Input:** slug
- **Logic:** Connect readiness
- **Risks:** false negative blocks sales
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### createStorefrontStripeCheckoutSession()
- **File:** `services/storefront/storefront-stripe-checkout-service.ts`
- **Used by:** storefront-order
- **Auth:** public
- **Database:** Order
- **Input:** totals
- **Logic:** Stripe
- **Risks:** currency minor units
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### upsertCustomerFromOrder()
- **File:** `services/crm/customer-service.ts`
- **Used by:** orders + storefront
- **Auth:** internal
- **Database:** KitchenCustomer
- **Input:** order
- **Logic:** dedupe email
- **Risks:** merge conflicts
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### validateOrderDbStatusTransition()
- **File:** `lib/workflows/order-lifecycle-rules.ts`
- **Used by:** orders.ts
- **Auth:** internal
- **Database:** —
- **Input:** OrderLike
- **Logic:** enum matrix
- **Risks:** does not validate statusDetail
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### auditLog()
- **File:** `services/audit/audit-service.ts`
- **Used by:** many actions
- **Auth:** workspace
- **Database:** AuditLog
- **Input:** event
- **Logic:** immutable
- **Risks:** PII in metadata
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### enforceStorefrontRateLimit()
- **File:** `lib/storefront/storefront-rate-limit.ts`
- **Used by:** storefront-order
- **Auth:** IP/slug
- **Database:** —
- **Input:** key
- **Logic:** Upstash/memory
- **Risks:** misconfigured limiter
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### createWebhookEvent()
- **File:** `lib/webhooks/webhook-event-store.ts`
- **Used by:** webhooks
- **Auth:** per connection
- **Database:** WebhookEvent
- **Input:** payload
- **Logic:** dedup
- **Risks:** race duplicate
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### runCronHandler()
- **File:** `lib/api/run-cron.ts`
- **Used by:** all crons
- **Auth:** CRON_SECRET
- **Database:** —
- **Input:** slug
- **Logic:** prod vs experimental
- **Risks:** secret leak
- **Production readiness:** See module notes
- **Manual test:** Happy path + permission denial + cross-tenant denial

### Remaining 650 actions

Catalogued in Appendix C. Typical per-action pattern:
- Zod or FormData parse → permission gate → Prisma scoped query → `revalidatePath` → `{ error: string }` or void (FormAction).

---

## 10. Critical Issues

### Blocker

#### Uber Eats webhook has no signature verification
- **File:** `app/api/webhooks/uber-eats/orders/route.ts`
- **Why it matters:** Anyone with connection UUID can inject orders
- **Impact:** Order fraud, cross-tenant data corruption
- **Recommended fix (later):** Implement partner HMAC; reject if invalid
- **Do not fix now:** per audit charter

### Critical

#### WebhookEvent dedup not DB-unique
- **File:** `lib/webhooks/webhook-event-store.ts`
- **Why it matters:** Concurrent duplicate events
- **Impact:** Double order import
- **Recommended fix (later):** Add unique (connectionId, externalEventId)
- **Do not fix now:** per audit charter

#### API routes bypass middleware auth
- **File:** `middleware.ts matcher`
- **Why it matters:** Forgotten auth on new routes
- **Impact:** Data leak
- **Recommended fix (later):** Lint rule: require guard import
- **Do not fix now:** per audit charter

#### UserProfile delete cascades entire tenant
- **File:** `prisma schema`
- **Why it matters:** Accidental owner delete
- **Impact:** Total data loss
- **Recommended fix (later):** Soft-delete or export gate
- **Do not fix now:** per audit charter

### High

#### Workspace migration incomplete (162 userId-only models)
- **File:** `prisma + handlers`
- **Why it matters:** IDOR on id-only queries
- **Impact:** Cross-workspace read/write
- **Recommended fix (later):** Scope audit program
- **Do not fix now:** per audit charter

#### shopDomain lookup without index
- **File:** `IntegrationConnection`
- **Why it matters:** Slow Shopify webhooks
- **Impact:** Timeouts/retries
- **Recommended fix (later):** Add @@index([shopDomain])
- **Do not fix now:** per audit charter

#### Billing per userId not workspaceId
- **File:** `Subscription model`
- **Why it matters:** Wrong entitlements for staff workspaces
- **Impact:** Feature gate bugs
- **Recommended fix (later):** Model workspace billing
- **Do not fix now:** per audit charter

#### Dual permission systems
- **File:** `lib/permissions/*`
- **Why it matters:** Confusing effective permissions
- **Impact:** Escalation via legacy role
- **Recommended fix (later):** Deprecate legacy matrix
- **Do not fix now:** per audit charter

### Medium

#### 121 experimental cron routes on disk
- **File:** `app/api/cron/*`
- **Why it matters:** Noise + attack surface
- **Impact:** Ops confusion
- **Recommended fix (later):** Archive or move out of app/api
- **Do not fix now:** per audit charter

#### status vs statusDetail mismatch
- **File:** `Order model + UI`
- **Why it matters:** UI shows state DB cannot transition
- **Impact:** Stuck orders
- **Recommended fix (later):** Align lifecycle
- **Do not fix now:** per audit charter

#### FormAction duplicates (~50% of actions)
- **File:** `actions/*`
- **Why it matters:** Maintenance burden
- **Impact:** Drift between pairs
- **Recommended fix (later):** Codegen or single export
- **Do not fix now:** per audit charter

### Low

#### Inconsistent error UX (string vs toast)
- **File:** `actions + components`
- **Why it matters:** Poor operator feedback
- **Impact:** Support load
- **Recommended fix (later):** Standardize action-result helper
- **Do not fix now:** per audit charter

#### Missing loading on some dashboard tables
- **File:** `components/dashboard/*`
- **Why it matters:** Double fetch perceived slowness
- **Impact:** UX
- **Recommended fix (later):** Skeleton components
- **Do not fix now:** per audit charter

---

## 11. Missing Tests

### Unit (priority)
- Uber Eats webhook rejection without signature
- Every action using `findUnique({ id })` without scope — property tests
- Order `statusDetail` transitions
- Workspace billing entitlement resolution
- WebhookEvent concurrent dedup

### Integration
- Full storefront checkout → Stripe webhook → order paid
- Channel import → normalize → order → production task
- POS sale → refund → inventory adjustment
- Meal plan auto-renew cron failure rollback

### E2E
- Multi-user workspace: staff cannot see other workspace orders
- Platform impersonation audit trail
- Packing token cannot access unrelated orders
- Experimental cron returns 404 in production profile

### Security
- IDOR suite on orders, customers, integrations, storefront admin
- CRON_SECRET missing → 503
- Public API key cross-tenant denial (extend `public-api-tenant-isolation`)

### Regression
- Legacy permission fallback matrix vs workspace permissions parity
- Dashboard module gate when billing trial expires

---

## 12. Final Readiness Score

| Dimension | Score (/10) |
|-----------|------------:|
| Product completeness | 7.8 |
| Backend logic | 7.4 |
| Frontend logic | 7.0 |
| DB consistency | 6.5 |
| Security | 6.8 |
| Tenant isolation | 7.0 |
| UX readiness | 7.3 |
| Performance | 7.1 |
| Maintainability | 6.2 |
| **Production readiness** | **7.2** |

### Verdict

OS Kitchen **can support production operators** on core flows (orders, production, packing, storefront checkout, POS, CRM) provided **integration webhooks are hardened**, a **tenant scope IDOR pass** is completed for workspace migration, and **experimental cron routes** are kept disabled in production. The codebase quality is **above average for a vertical SaaS monolith**, with exceptional breadth and test coverage on storefront/tenant scope, offset by **surface-area debt** in experimental APIs and dual auth models.

---

## Appendix A — Dashboard Routes

| Route | File |
|-------|------|
| /dashboard/accounting/bank-reconciliation | app/dashboard/accounting/bank-reconciliation/page.tsx |
| /dashboard/accounting/cash-counts | app/dashboard/accounting/cash-counts/page.tsx |
| /dashboard/accounting/invoices | app/dashboard/accounting/invoices/page.tsx |
| /dashboard/analytics | app/dashboard/analytics/page.tsx |
| /dashboard/analytics/catering | app/dashboard/analytics/catering/page.tsx |
| /dashboard/analytics/channels | app/dashboard/analytics/channels/page.tsx |
| /dashboard/analytics/customers | app/dashboard/analytics/customers/page.tsx |
| /dashboard/analytics/delivery | app/dashboard/analytics/delivery/page.tsx |
| /dashboard/analytics/forecasting | app/dashboard/analytics/forecasting/page.tsx |
| /dashboard/analytics/inventory | app/dashboard/analytics/inventory/page.tsx |
| /dashboard/analytics/meal-plans | app/dashboard/analytics/meal-plans/page.tsx |
| /dashboard/analytics/orders | app/dashboard/analytics/orders/page.tsx |
| /dashboard/analytics/production | app/dashboard/analytics/production/page.tsx |
| /dashboard/analytics/reports | app/dashboard/analytics/reports/page.tsx |
| /dashboard/analytics/revenue | app/dashboard/analytics/revenue/page.tsx |
| /dashboard/analytics/saved-views | app/dashboard/analytics/saved-views/page.tsx |
| /dashboard/audit-logs | app/dashboard/audit-logs/page.tsx |
| /dashboard/audit-logs/retention | app/dashboard/audit-logs/retention/page.tsx |
| /dashboard/beta-applications | app/dashboard/beta-applications/page.tsx |
| /dashboard/billing | app/dashboard/billing/page.tsx |
| /dashboard/billing/cancel | app/dashboard/billing/cancel/page.tsx |
| /dashboard/billing/cancelled | app/dashboard/billing/cancelled/page.tsx |
| /dashboard/billing/entitlements | app/dashboard/billing/entitlements/page.tsx |
| /dashboard/billing/history | app/dashboard/billing/history/page.tsx |
| /dashboard/billing/invoices | app/dashboard/billing/invoices/page.tsx |
| /dashboard/billing/payment-method | app/dashboard/billing/payment-method/page.tsx |
| /dashboard/billing/plans | app/dashboard/billing/plans/page.tsx |
| /dashboard/billing/settings | app/dashboard/billing/settings/page.tsx |
| /dashboard/billing/success | app/dashboard/billing/success/page.tsx |
| /dashboard/billing/usage | app/dashboard/billing/usage/page.tsx |
| /dashboard/brands | app/dashboard/brands/page.tsx |
| /dashboard/brands/[brandId] | app/dashboard/brands/[brandId]/page.tsx |
| /dashboard/brands/[brandId]/reports | app/dashboard/brands/[brandId]/reports/page.tsx |
| /dashboard/brands/assignment | app/dashboard/brands/assignment/page.tsx |
| /dashboard/brands/command-center | app/dashboard/brands/command-center/page.tsx |
| /dashboard/brands/multi-brand-setup | app/dashboard/brands/multi-brand-setup/page.tsx |
| /dashboard/brands/new | app/dashboard/brands/new/page.tsx |
| /dashboard/brands/templates | app/dashboard/brands/templates/page.tsx |
| /dashboard/calendar | app/dashboard/calendar/page.tsx |
| /dashboard/catering | app/dashboard/catering/page.tsx |
| /dashboard/catering-quotes | app/dashboard/catering-quotes/page.tsx |
| /dashboard/catering-quotes/[quoteId] | app/dashboard/catering-quotes/[quoteId]/page.tsx |
| /dashboard/catering-quotes/accepted | app/dashboard/catering-quotes/accepted/page.tsx |
| /dashboard/catering-quotes/follow-ups | app/dashboard/catering-quotes/follow-ups/page.tsx |
| /dashboard/catering-quotes/new | app/dashboard/catering-quotes/new/page.tsx |
| /dashboard/catering-quotes/pipeline | app/dashboard/catering-quotes/pipeline/page.tsx |
| /dashboard/catering-quotes/public-proposals | app/dashboard/catering-quotes/public-proposals/page.tsx |
| /dashboard/catering-quotes/quotes | app/dashboard/catering-quotes/quotes/page.tsx |
| /dashboard/catering-quotes/reports | app/dashboard/catering-quotes/reports/page.tsx |
| /dashboard/catering-quotes/settings | app/dashboard/catering-quotes/settings/page.tsx |
| /dashboard/catering-quotes/templates | app/dashboard/catering-quotes/templates/page.tsx |
| /dashboard/commissary/transfers | app/dashboard/commissary/transfers/page.tsx |
| /dashboard/compliance/experiment-audit | app/dashboard/compliance/experiment-audit/page.tsx |
| /dashboard/copilot | app/dashboard/copilot/page.tsx |
| /dashboard/copilot/audit | app/dashboard/copilot/audit/page.tsx |
| /dashboard/copilot/chat | app/dashboard/copilot/chat/page.tsx |
| /dashboard/copilot/drafts | app/dashboard/copilot/drafts/page.tsx |
| /dashboard/copilot/insights | app/dashboard/copilot/insights/page.tsx |
| /dashboard/copilot/settings | app/dashboard/copilot/settings/page.tsx |
| /dashboard/copilot/sources | app/dashboard/copilot/sources/page.tsx |
| /dashboard/copilot/summaries | app/dashboard/copilot/summaries/page.tsx |
| /dashboard/costing | app/dashboard/costing/page.tsx |
| /dashboard/costing/alerts | app/dashboard/costing/alerts/page.tsx |
| /dashboard/costing/avt | app/dashboard/costing/avt/page.tsx |
| /dashboard/costing/channel-fees | app/dashboard/costing/channel-fees/page.tsx |
| /dashboard/costing/components | app/dashboard/costing/components/page.tsx |
| /dashboard/costing/items | app/dashboard/costing/items/page.tsx |
| /dashboard/costing/menus | app/dashboard/costing/menus/page.tsx |
| /dashboard/costing/recipes-missing | app/dashboard/costing/recipes-missing/page.tsx |
| /dashboard/costing/reports | app/dashboard/costing/reports/page.tsx |
| /dashboard/costing/scenarios | app/dashboard/costing/scenarios/page.tsx |
| /dashboard/costing/settings | app/dashboard/costing/settings/page.tsx |
| /dashboard/crm/customers/[customerId] | app/dashboard/crm/customers/[customerId]/page.tsx |
| /dashboard/customers | app/dashboard/customers/page.tsx |
| /dashboard/customers/[customerId] | app/dashboard/customers/[customerId]/page.tsx |
| /dashboard/customers/allergies | app/dashboard/customers/allergies/page.tsx |
| /dashboard/customers/at-risk | app/dashboard/customers/at-risk/page.tsx |
| /dashboard/customers/companies | app/dashboard/customers/companies/page.tsx |
| /dashboard/customers/dedupe | app/dashboard/customers/dedupe/page.tsx |
| /dashboard/customers/deduplication | app/dashboard/customers/deduplication/page.tsx |
| /dashboard/customers/follow-ups | app/dashboard/customers/follow-ups/page.tsx |
| /dashboard/customers/list | app/dashboard/customers/list/page.tsx |
| /dashboard/customers/loyalty | app/dashboard/customers/loyalty/page.tsx |
| /dashboard/customers/new | app/dashboard/customers/new/page.tsx |
| /dashboard/customers/reports | app/dashboard/customers/reports/page.tsx |
| /dashboard/customers/segments | app/dashboard/customers/segments/page.tsx |
| /dashboard/customers/vip | app/dashboard/customers/vip/page.tsx |
| /dashboard/demo/scenarios | app/dashboard/demo/scenarios/page.tsx |
| /dashboard/developer | app/dashboard/developer/page.tsx |
| /dashboard/developer/api-keys | app/dashboard/developer/api-keys/page.tsx |
| /dashboard/developer/docs | app/dashboard/developer/docs/page.tsx |
| /dashboard/developer/email-preview | app/dashboard/developer/email-preview/page.tsx |
| /dashboard/developer/flags | app/dashboard/developer/flags/page.tsx |
| /dashboard/developer/health | app/dashboard/developer/health/page.tsx |
| /dashboard/developer/incidents | app/dashboard/developer/incidents/page.tsx |
| /dashboard/developer/integrations | app/dashboard/developer/integrations/page.tsx |
| /dashboard/developer/jobs | app/dashboard/developer/jobs/page.tsx |
| /dashboard/developer/logs | app/dashboard/developer/logs/page.tsx |
| /dashboard/developer/performance | app/dashboard/developer/performance/page.tsx |
| /dashboard/developer/releases | app/dashboard/developer/releases/page.tsx |
| /dashboard/developer/tools | app/dashboard/developer/tools/page.tsx |
| /dashboard/developer/webhooks | app/dashboard/developer/webhooks/page.tsx |
| /dashboard/error-recovery | app/dashboard/error-recovery/page.tsx |
| /dashboard/executive | app/dashboard/executive/page.tsx |
| /dashboard/executive/brands-locations | app/dashboard/executive/brands-locations/page.tsx |
| /dashboard/executive/customers | app/dashboard/executive/customers/page.tsx |
| /dashboard/executive/operations | app/dashboard/executive/operations/page.tsx |
| /dashboard/executive/profitability | app/dashboard/executive/profitability/page.tsx |
| /dashboard/executive/report | app/dashboard/executive/report/page.tsx |
| /dashboard/executive/revenue | app/dashboard/executive/revenue/page.tsx |
| /dashboard/executive/risks | app/dashboard/executive/risks/page.tsx |
| /dashboard/food-safety/allergens | app/dashboard/food-safety/allergens/page.tsx |
| /dashboard/food-safety/audits | app/dashboard/food-safety/audits/page.tsx |
| /dashboard/food-safety/audits/[auditId] | app/dashboard/food-safety/audits/[auditId]/page.tsx |
| /dashboard/food-safety/checklists | app/dashboard/food-safety/checklists/page.tsx |
| /dashboard/food-safety/temperature | app/dashboard/food-safety/temperature/page.tsx |
| /dashboard/forecast | app/dashboard/forecast/page.tsx |
| /dashboard/forecast/[runId] | app/dashboard/forecast/[runId]/page.tsx |
| /dashboard/forecast/ai | app/dashboard/forecast/ai/page.tsx |
| /dashboard/forecast/history | app/dashboard/forecast/history/page.tsx |
| /dashboard/forecast/new | app/dashboard/forecast/new/page.tsx |
| /dashboard/forecast/settings | app/dashboard/forecast/settings/page.tsx |
| /dashboard/founder | app/dashboard/founder/page.tsx |
| /dashboard/franchise/royalties | app/dashboard/franchise/royalties/page.tsx |
| /dashboard/gift-cards | app/dashboard/gift-cards/page.tsx |
| /dashboard/go-live | app/dashboard/go-live/page.tsx |
| /dashboard/go-live/projects/[projectId] | app/dashboard/go-live/projects/[projectId]/page.tsx |
| /dashboard/go-live/test-run | app/dashboard/go-live/test-run/page.tsx |
| /dashboard/growth | app/dashboard/growth/page.tsx |
| /dashboard/growth/accounts | app/dashboard/growth/accounts/page.tsx |
| /dashboard/growth/advisory-board | app/dashboard/growth/advisory-board/page.tsx |
| /dashboard/growth/content-library | app/dashboard/growth/content-library/page.tsx |
| /dashboard/growth/customer-success | app/dashboard/growth/customer-success/page.tsx |
| /dashboard/growth/demo-requests | app/dashboard/growth/demo-requests/page.tsx |
| /dashboard/growth/feedback | app/dashboard/growth/feedback/page.tsx |
| /dashboard/growth/launch-analytics | app/dashboard/growth/launch-analytics/page.tsx |
| /dashboard/growth/leads | app/dashboard/growth/leads/page.tsx |
| /dashboard/growth/leads/[id] | app/dashboard/growth/leads/[id]/page.tsx |
| /dashboard/growth/onboarding-calls | app/dashboard/growth/onboarding-calls/page.tsx |
| /dashboard/growth/outreach | app/dashboard/growth/outreach/page.tsx |
| /dashboard/growth/partner-leads | app/dashboard/growth/partner-leads/page.tsx |
| /dashboard/growth/referrals | app/dashboard/growth/referrals/page.tsx |
| /dashboard/growth/roadmap | app/dashboard/growth/roadmap/page.tsx |
| /dashboard/growth/sales-inquiries | app/dashboard/growth/sales-inquiries/page.tsx |
| /dashboard/growth/usage | app/dashboard/growth/usage/page.tsx |
| /dashboard/implementation | app/dashboard/implementation/page.tsx |
| /dashboard/implementation/[projectId] | app/dashboard/implementation/[projectId]/page.tsx |
| /dashboard/implementation/[projectId]/activity | app/dashboard/implementation/[projectId]/activity/page.tsx |
| /dashboard/implementation/[projectId]/checklist | app/dashboard/implementation/[projectId]/checklist/page.tsx |
| /dashboard/implementation/[projectId]/go-live | app/dashboard/implementation/[projectId]/go-live/page.tsx |
| /dashboard/implementation/[projectId]/integrations | app/dashboard/implementation/[projectId]/integrations/page.tsx |
| /dashboard/implementation/[projectId]/migration | app/dashboard/implementation/[projectId]/migration/page.tsx |
| /dashboard/implementation/[projectId]/risks | app/dashboard/implementation/[projectId]/risks/page.tsx |
| /dashboard/implementation/[projectId]/timeline | app/dashboard/implementation/[projectId]/timeline/page.tsx |
| /dashboard/implementation/[projectId]/training | app/dashboard/implementation/[projectId]/training/page.tsx |
| /dashboard/implementation/[projectId]/uat | app/dashboard/implementation/[projectId]/uat/page.tsx |
| /dashboard/implementation/activity | app/dashboard/implementation/activity/page.tsx |
| /dashboard/implementation/checklist | app/dashboard/implementation/checklist/page.tsx |
| /dashboard/implementation/enterprise | app/dashboard/implementation/enterprise/page.tsx |
| /dashboard/implementation/go-live | app/dashboard/implementation/go-live/page.tsx |
| /dashboard/implementation/handoff | app/dashboard/implementation/handoff/page.tsx |
| /dashboard/implementation/integrations | app/dashboard/implementation/integrations/page.tsx |
| /dashboard/implementation/migration | app/dashboard/implementation/migration/page.tsx |
| /dashboard/implementation/new | app/dashboard/implementation/new/page.tsx |
| /dashboard/implementation/projects | app/dashboard/implementation/projects/page.tsx |
| /dashboard/implementation/reports | app/dashboard/implementation/reports/page.tsx |
| /dashboard/implementation/risks | app/dashboard/implementation/risks/page.tsx |
| /dashboard/implementation/training | app/dashboard/implementation/training/page.tsx |
| /dashboard/implementation/uat | app/dashboard/implementation/uat/page.tsx |
| /dashboard/import-center | app/dashboard/import-center/page.tsx |
| /dashboard/import-center/errors | app/dashboard/import-center/errors/page.tsx |
| /dashboard/import-center/history | app/dashboard/import-center/history/page.tsx |
| /dashboard/import-center/jobs/[jobId] | app/dashboard/import-center/jobs/[jobId]/page.tsx |
| /dashboard/import-center/migrate | app/dashboard/import-center/migrate/page.tsx |
| /dashboard/import-center/settings | app/dashboard/import-center/settings/page.tsx |
| /dashboard/import-center/templates | app/dashboard/import-center/templates/page.tsx |
| /dashboard/import-center/upload | app/dashboard/import-center/upload/page.tsx |
| /dashboard/import-export | app/dashboard/import-export/page.tsx |
| /dashboard/import-export/export | app/dashboard/import-export/export/page.tsx |
| /dashboard/import-export/exports | app/dashboard/import-export/exports/page.tsx |
| /dashboard/import-export/import | app/dashboard/import-export/import/page.tsx |
| /dashboard/import-export/imports | app/dashboard/import-export/imports/page.tsx |
| /dashboard/import-export/imports/[jobId] | app/dashboard/import-export/imports/[jobId]/page.tsx |
| /dashboard/import-export/settings | app/dashboard/import-export/settings/page.tsx |
| /dashboard/import-export/templates | app/dashboard/import-export/templates/page.tsx |
| /dashboard/import-export/validation-errors | app/dashboard/import-export/validation-errors/page.tsx |
| /dashboard/integration-health | app/dashboard/integration-health/page.tsx |
| /dashboard/integrations | app/dashboard/integrations/page.tsx |
| /dashboard/integrations/7shifts | app/dashboard/integrations/7shifts/page.tsx |
| /dashboard/integrations/doordash | app/dashboard/integrations/doordash/page.tsx |
| /dashboard/integrations/grubhub | app/dashboard/integrations/grubhub/page.tsx |
| /dashboard/integrations/health | app/dashboard/integrations/health/page.tsx |
| /dashboard/integrations/homebase | app/dashboard/integrations/homebase/page.tsx |
| /dashboard/integrations/quickbooks | app/dashboard/integrations/quickbooks/page.tsx |
| /dashboard/integrations/shopify | app/dashboard/integrations/shopify/page.tsx |
| /dashboard/integrations/uber-direct | app/dashboard/integrations/uber-direct/page.tsx |
| /dashboard/integrations/uber-eats | app/dashboard/integrations/uber-eats/page.tsx |
| /dashboard/integrations/webhooks | app/dashboard/integrations/webhooks/page.tsx |
| /dashboard/integrations/woocommerce | app/dashboard/integrations/woocommerce/page.tsx |
| /dashboard/integrations/xero | app/dashboard/integrations/xero/page.tsx |
| /dashboard/inventory/counts | app/dashboard/inventory/counts/page.tsx |
| /dashboard/inventory/counts/[countId] | app/dashboard/inventory/counts/[countId]/page.tsx |
| /dashboard/inventory/demand | app/dashboard/inventory/demand/page.tsx |
| /dashboard/inventory/demand/settings | app/dashboard/inventory/demand/settings/page.tsx |
| /dashboard/inventory/receiving | app/dashboard/inventory/receiving/page.tsx |
| /dashboard/inventory/waste | app/dashboard/inventory/waste/page.tsx |
| /dashboard/kitchen | app/dashboard/kitchen/page.tsx |
| /dashboard/kitchen/fullscreen | app/dashboard/kitchen/fullscreen/page.tsx |
| /dashboard/kitchen/tablet | app/dashboard/kitchen/tablet/page.tsx |
| /dashboard/locations | app/dashboard/locations/page.tsx |
| /dashboard/locations/[locationId] | app/dashboard/locations/[locationId]/page.tsx |
| /dashboard/locations/[locationId]/brands | app/dashboard/locations/[locationId]/brands/page.tsx |
| /dashboard/locations/[locationId]/fulfillment | app/dashboard/locations/[locationId]/fulfillment/page.tsx |
| /dashboard/locations/[locationId]/hours | app/dashboard/locations/[locationId]/hours/page.tsx |
| /dashboard/locations/[locationId]/inventory | app/dashboard/locations/[locationId]/inventory/page.tsx |
| /dashboard/locations/[locationId]/menus | app/dashboard/locations/[locationId]/menus/page.tsx |
| /dashboard/locations/[locationId]/orders | app/dashboard/locations/[locationId]/orders/page.tsx |
| /dashboard/locations/[locationId]/production | app/dashboard/locations/[locationId]/production/page.tsx |
| /dashboard/locations/[locationId]/profile | app/dashboard/locations/[locationId]/profile/page.tsx |
| /dashboard/locations/[locationId]/reports | app/dashboard/locations/[locationId]/reports/page.tsx |
| /dashboard/locations/[locationId]/routes | app/dashboard/locations/[locationId]/routes/page.tsx |
| /dashboard/locations/[locationId]/settings | app/dashboard/locations/[locationId]/settings/page.tsx |
| /dashboard/locations/active | app/dashboard/locations/active/page.tsx |
| /dashboard/locations/assignment | app/dashboard/locations/assignment/page.tsx |
| /dashboard/locations/new | app/dashboard/locations/new/page.tsx |
| /dashboard/locations/reports | app/dashboard/locations/reports/page.tsx |
| /dashboard/locations/settings | app/dashboard/locations/settings/page.tsx |
| /dashboard/locations/setup | app/dashboard/locations/setup/page.tsx |
| /dashboard/locations/templates | app/dashboard/locations/templates/page.tsx |
| /dashboard/meal-plans | app/dashboard/meal-plans/page.tsx |
| /dashboard/meal-plans/[planId] | app/dashboard/meal-plans/[planId]/page.tsx |
| /dashboard/meal-plans/active | app/dashboard/meal-plans/active/page.tsx |
| /dashboard/meal-plans/customers | app/dashboard/meal-plans/customers/page.tsx |
| /dashboard/meal-plans/cycles | app/dashboard/meal-plans/cycles/page.tsx |
| /dashboard/meal-plans/generated | app/dashboard/meal-plans/generated/page.tsx |
| /dashboard/meal-plans/needs-review | app/dashboard/meal-plans/needs-review/page.tsx |
| /dashboard/meal-plans/new | app/dashboard/meal-plans/new/page.tsx |
| /dashboard/meal-plans/paused | app/dashboard/meal-plans/paused/page.tsx |
| /dashboard/meal-plans/reports | app/dashboard/meal-plans/reports/page.tsx |
| /dashboard/meal-plans/settings | app/dashboard/meal-plans/settings/page.tsx |
| /dashboard/meal-plans/templates | app/dashboard/meal-plans/templates/page.tsx |
| /dashboard/meal-subscriptions | app/dashboard/meal-subscriptions/page.tsx |
| /dashboard/menu-planner | app/dashboard/menu-planner/page.tsx |
| /dashboard/menus | app/dashboard/menus/page.tsx |
| /dashboard/menus/[menuId] | app/dashboard/menus/[menuId]/page.tsx |
| /dashboard/menus/[menuId]/reports | app/dashboard/menus/[menuId]/reports/page.tsx |
| /dashboard/menus/new | app/dashboard/menus/new/page.tsx |
| /dashboard/menus/templates | app/dashboard/menus/templates/page.tsx |
| /dashboard/notifications | app/dashboard/notifications/page.tsx |
| /dashboard/notifications/alerts | app/dashboard/notifications/alerts/page.tsx |
| /dashboard/notifications/log | app/dashboard/notifications/log/page.tsx |
| /dashboard/notifications/preferences | app/dashboard/notifications/preferences/page.tsx |
| /dashboard/notifications/provider | app/dashboard/notifications/provider/page.tsx |
| /dashboard/notifications/retry | app/dashboard/notifications/retry/page.tsx |
| /dashboard/notifications/rules | app/dashboard/notifications/rules/page.tsx |
| /dashboard/notifications/settings | app/dashboard/notifications/settings/page.tsx |
| /dashboard/notifications/templates | app/dashboard/notifications/templates/page.tsx |
| /dashboard/nutrition-labels | app/dashboard/nutrition-labels/page.tsx |
| /dashboard/nutrition-labels/import | app/dashboard/nutrition-labels/import/page.tsx |
| /dashboard/nutrition-labels/items/[productId] | app/dashboard/nutrition-labels/items/[productId]/page.tsx |
| /dashboard/nutrition-labels/print-queue | app/dashboard/nutrition-labels/print-queue/page.tsx |
| /dashboard/nutrition-labels/reports | app/dashboard/nutrition-labels/reports/page.tsx |
| /dashboard/operations/audits | app/dashboard/operations/audits/page.tsx |
| /dashboard/operations/audits/[auditId] | app/dashboard/operations/audits/[auditId]/page.tsx |
| /dashboard/operations/checklists | app/dashboard/operations/checklists/page.tsx |
| /dashboard/operations/compliance | app/dashboard/operations/compliance/page.tsx |
| /dashboard/order-hub | app/dashboard/order-hub/page.tsx |
| /dashboard/orders | app/dashboard/orders/page.tsx |
| /dashboard/orders/[orderId] | app/dashboard/orders/[orderId]/page.tsx |
| /dashboard/orders/hub | app/dashboard/orders/hub/page.tsx |
| /dashboard/orders/new | app/dashboard/orders/new/page.tsx |
| /dashboard/orders/quick | app/dashboard/orders/quick/page.tsx |
| /dashboard/packing | app/dashboard/packing/page.tsx |
| /dashboard/packing/reports | app/dashboard/packing/reports/page.tsx |
| /dashboard/packing/scanner | app/dashboard/packing/scanner/page.tsx |
| /dashboard/packing/verify | app/dashboard/packing/verify/page.tsx |
| /dashboard/page.tsx | app/dashboard/page.tsx/page.tsx |
| /dashboard/partner | app/dashboard/partner/page.tsx |
| /dashboard/playbooks | app/dashboard/playbooks/page.tsx |
| /dashboard/playbooks/[playbookId] | app/dashboard/playbooks/[playbookId]/page.tsx |
| /dashboard/playbooks/active | app/dashboard/playbooks/active/page.tsx |
| /dashboard/playbooks/all | app/dashboard/playbooks/all/page.tsx |
| /dashboard/playbooks/custom | app/dashboard/playbooks/custom/page.tsx |
| /dashboard/playbooks/new | app/dashboard/playbooks/new/page.tsx |
| /dashboard/playbooks/reports | app/dashboard/playbooks/reports/page.tsx |
| /dashboard/playbooks/runs/[runId] | app/dashboard/playbooks/runs/[runId]/page.tsx |
| /dashboard/playbooks/schedule | app/dashboard/playbooks/schedule/page.tsx |
| /dashboard/playbooks/settings | app/dashboard/playbooks/settings/page.tsx |
| /dashboard/playbooks/templates | app/dashboard/playbooks/templates/page.tsx |
| /dashboard/pos | app/dashboard/pos/page.tsx |
| /dashboard/pos/handheld | app/dashboard/pos/handheld/page.tsx |
| /dashboard/pos/receipts | app/dashboard/pos/receipts/page.tsx |
| /dashboard/pos/registers | app/dashboard/pos/registers/page.tsx |
| /dashboard/pos/reports | app/dashboard/pos/reports/page.tsx |
| /dashboard/pos/settings | app/dashboard/pos/settings/page.tsx |
| /dashboard/pos/settings/hardware | app/dashboard/pos/settings/hardware/page.tsx |
| /dashboard/pos/shifts | app/dashboard/pos/shifts/page.tsx |
| /dashboard/pos/tabs | app/dashboard/pos/tabs/page.tsx |
| /dashboard/pos/terminal | app/dashboard/pos/terminal/page.tsx |
| /dashboard/pos/transactions | app/dashboard/pos/transactions/page.tsx |
| /dashboard/product-mapping | app/dashboard/product-mapping/page.tsx |
| /dashboard/product-mapping/activity | app/dashboard/product-mapping/activity/page.tsx |
| /dashboard/product-mapping/aliases | app/dashboard/product-mapping/aliases/page.tsx |
| /dashboard/product-mapping/approved | app/dashboard/product-mapping/approved/page.tsx |
| /dashboard/product-mapping/batches | app/dashboard/product-mapping/batches/page.tsx |
| /dashboard/product-mapping/bulk | app/dashboard/product-mapping/bulk/page.tsx |
| /dashboard/product-mapping/conflicts | app/dashboard/product-mapping/conflicts/page.tsx |
| /dashboard/product-mapping/health | app/dashboard/product-mapping/health/page.tsx |
| /dashboard/product-mapping/modifiers | app/dashboard/product-mapping/modifiers/page.tsx |
| /dashboard/product-mapping/settings | app/dashboard/product-mapping/settings/page.tsx |
| /dashboard/product-mapping/suggestions | app/dashboard/product-mapping/suggestions/page.tsx |
| /dashboard/product-mapping/unmapped | app/dashboard/product-mapping/unmapped/page.tsx |
| /dashboard/production | app/dashboard/production/page.tsx |
| /dashboard/production/batches/[batchId] | app/dashboard/production/batches/[batchId]/page.tsx |
| /dashboard/production/calendar | app/dashboard/production/calendar/page.tsx |
| /dashboard/production/reports | app/dashboard/production/reports/page.tsx |
| /dashboard/production/templates | app/dashboard/production/templates/page.tsx |
| /dashboard/products | app/dashboard/products/page.tsx |
| /dashboard/products/[productId] | app/dashboard/products/[productId]/page.tsx |
| /dashboard/products/new | app/dashboard/products/new/page.tsx |
| /dashboard/purchasing | app/dashboard/purchasing/page.tsx |
| /dashboard/purchasing/bulk-pricing | app/dashboard/purchasing/bulk-pricing/page.tsx |
| /dashboard/purchasing/direct-ordering | app/dashboard/purchasing/direct-ordering/page.tsx |
| /dashboard/purchasing/exports | app/dashboard/purchasing/exports/page.tsx |
| /dashboard/purchasing/price-history | app/dashboard/purchasing/price-history/page.tsx |
| /dashboard/purchasing/purchase-orders | app/dashboard/purchasing/purchase-orders/page.tsx |
| /dashboard/purchasing/purchase-orders/[poId] | app/dashboard/purchasing/purchase-orders/[poId]/page.tsx |
| /dashboard/purchasing/receiving | app/dashboard/purchasing/receiving/page.tsx |
| /dashboard/purchasing/reorder-queue | app/dashboard/purchasing/reorder-queue/page.tsx |
| /dashboard/purchasing/suppliers | app/dashboard/purchasing/suppliers/page.tsx |
| /dashboard/recipes/yield | app/dashboard/recipes/yield/page.tsx |
| /dashboard/reports | app/dashboard/reports/page.tsx |
| /dashboard/reports/[reportKey] | app/dashboard/reports/[reportKey]/page.tsx |
| /dashboard/reports/enterprise | app/dashboard/reports/enterprise/page.tsx |
| /dashboard/reports/executive | app/dashboard/reports/executive/page.tsx |
| /dashboard/reports/financial | app/dashboard/reports/financial/page.tsx |
| /dashboard/reports/financial/pnl | app/dashboard/reports/financial/pnl/page.tsx |
| /dashboard/reports/history | app/dashboard/reports/history/page.tsx |
| /dashboard/reports/labor | app/dashboard/reports/labor/page.tsx |
| /dashboard/reports/library | app/dashboard/reports/library/page.tsx |
| /dashboard/reports/menu-engineering | app/dashboard/reports/menu-engineering/page.tsx |
| /dashboard/reports/operations | app/dashboard/reports/operations/page.tsx |
| /dashboard/reports/saved | app/dashboard/reports/saved/page.tsx |
| /dashboard/reports/settings | app/dashboard/reports/settings/page.tsx |
| /dashboard/routes | app/dashboard/routes/page.tsx |
| /dashboard/routes/[routeId] | app/dashboard/routes/[routeId]/page.tsx |
| /dashboard/routes/[routeId]/driver | app/dashboard/routes/[routeId]/driver/page.tsx |
| /dashboard/routes/[routeId]/manifest | app/dashboard/routes/[routeId]/manifest/page.tsx |
| /dashboard/routes/driver | app/dashboard/routes/driver/page.tsx |
| /dashboard/routes/drivers | app/dashboard/routes/drivers/page.tsx |
| /dashboard/routes/planner | app/dashboard/routes/planner/page.tsx |
| /dashboard/routes/reports | app/dashboard/routes/reports/page.tsx |
| /dashboard/routes/settings | app/dashboard/routes/settings/page.tsx |
| /dashboard/routes/uber-direct | app/dashboard/routes/uber-direct/page.tsx |
| /dashboard/routes/zones | app/dashboard/routes/zones/page.tsx |
| /dashboard/sales-channels | app/dashboard/sales-channels/page.tsx |
| /dashboard/sales-channels/[providerKey]/setup | app/dashboard/sales-channels/[providerKey]/setup/page.tsx |
| /dashboard/sales-channels/analytics | app/dashboard/sales-channels/analytics/page.tsx |
| /dashboard/sales-channels/assistant | app/dashboard/sales-channels/assistant/page.tsx |
| /dashboard/sales-channels/attention | app/dashboard/sales-channels/attention/page.tsx |
| /dashboard/sales-channels/available | app/dashboard/sales-channels/available/page.tsx |
| /dashboard/sales-channels/conflicts | app/dashboard/sales-channels/conflicts/page.tsx |
| /dashboard/sales-channels/connected | app/dashboard/sales-channels/connected/page.tsx |
| /dashboard/sales-channels/connections/[connectionId] | app/dashboard/sales-channels/connections/[connectionId]/page.tsx |
| /dashboard/sales-channels/handoff | app/dashboard/sales-channels/handoff/page.tsx |
| /dashboard/sales-channels/health | app/dashboard/sales-channels/health/page.tsx |
| /dashboard/sales-channels/imports/[batchId] | app/dashboard/sales-channels/imports/[batchId]/page.tsx |
| /dashboard/sales-channels/mapping | app/dashboard/sales-channels/mapping/page.tsx |
| /dashboard/sales-channels/reliability | app/dashboard/sales-channels/reliability/page.tsx |
| /dashboard/sales-channels/rules | app/dashboard/sales-channels/rules/page.tsx |
| /dashboard/sales-channels/settings | app/dashboard/sales-channels/settings/page.tsx |
| /dashboard/sales-channels/simulator | app/dashboard/sales-channels/simulator/page.tsx |
| /dashboard/sales-channels/staging | app/dashboard/sales-channels/staging/page.tsx |
| /dashboard/sales-channels/sync-jobs | app/dashboard/sales-channels/sync-jobs/page.tsx |
| /dashboard/sales-channels/webhook-lab | app/dashboard/sales-channels/webhook-lab/page.tsx |
| /dashboard/sales-channels/webhooks | app/dashboard/sales-channels/webhooks/page.tsx |
| /dashboard/scan | app/dashboard/scan/page.tsx |
| /dashboard/security/audit-logs | app/dashboard/security/audit-logs/page.tsx |
| /dashboard/settings | app/dashboard/settings/page.tsx |
| /dashboard/settings/advanced | app/dashboard/settings/advanced/page.tsx |
| /dashboard/settings/ai | app/dashboard/settings/ai/page.tsx |
| /dashboard/settings/automation | app/dashboard/settings/automation/page.tsx |
| /dashboard/settings/backups | app/dashboard/settings/backups/page.tsx |
| /dashboard/settings/billing | app/dashboard/settings/billing/page.tsx |
| /dashboard/settings/branding | app/dashboard/settings/branding/page.tsx |
| /dashboard/settings/compliance | app/dashboard/settings/compliance/page.tsx |
| /dashboard/settings/crm | app/dashboard/settings/crm/page.tsx |
| /dashboard/settings/delivery | app/dashboard/settings/delivery/page.tsx |
| /dashboard/settings/developer | app/dashboard/settings/developer/page.tsx |
| /dashboard/settings/domains | app/dashboard/settings/domains/page.tsx |
| /dashboard/settings/imports | app/dashboard/settings/imports/page.tsx |
| /dashboard/settings/integrations | app/dashboard/settings/integrations/page.tsx |
| /dashboard/settings/modules | app/dashboard/settings/modules/page.tsx |
| /dashboard/settings/notifications | app/dashboard/settings/notifications/page.tsx |
| /dashboard/settings/operations | app/dashboard/settings/operations/page.tsx |
| /dashboard/settings/orders | app/dashboard/settings/orders/page.tsx |
| /dashboard/settings/packing | app/dashboard/settings/packing/page.tsx |
| /dashboard/settings/pos | app/dashboard/settings/pos/page.tsx |
| /dashboard/settings/production | app/dashboard/settings/production/page.tsx |
| /dashboard/settings/routes | app/dashboard/settings/routes/page.tsx |
| /dashboard/settings/security | app/dashboard/settings/security/page.tsx |
| /dashboard/settings/staff | app/dashboard/settings/staff/page.tsx |
| /dashboard/settings/storefront | app/dashboard/settings/storefront/page.tsx |
| /dashboard/settings/white-label | app/dashboard/settings/white-label/page.tsx |
| /dashboard/settings/workspace | app/dashboard/settings/workspace/page.tsx |
| /dashboard/staff | app/dashboard/staff/page.tsx |
| /dashboard/staff/[staffId] | app/dashboard/staff/[staffId]/page.tsx |
| /dashboard/staff/availability | app/dashboard/staff/availability/page.tsx |
| /dashboard/staff/certifications | app/dashboard/staff/certifications/page.tsx |
| /dashboard/staff/drivers | app/dashboard/staff/drivers/page.tsx |
| /dashboard/staff/payroll | app/dashboard/staff/payroll/page.tsx |
| /dashboard/staff/reports | app/dashboard/staff/reports/page.tsx |
| /dashboard/staff/roles | app/dashboard/staff/roles/page.tsx |
| /dashboard/staff/roster | app/dashboard/staff/roster/page.tsx |
| /dashboard/staff/schedule | app/dashboard/staff/schedule/page.tsx |
| /dashboard/staff/shifts | app/dashboard/staff/shifts/page.tsx |
| /dashboard/staff/time-clock | app/dashboard/staff/time-clock/page.tsx |
| /dashboard/storefront | app/dashboard/storefront/page.tsx |
| /dashboard/storefront/advanced | app/dashboard/storefront/advanced/page.tsx |
| /dashboard/storefront/analytics | app/dashboard/storefront/analytics/page.tsx |
| /dashboard/storefront/builder | app/dashboard/storefront/builder/page.tsx |
| /dashboard/storefront/catalog | app/dashboard/storefront/catalog/page.tsx |
| /dashboard/storefront/discounts | app/dashboard/storefront/discounts/page.tsx |
| /dashboard/storefront/domains | app/dashboard/storefront/domains/page.tsx |
| /dashboard/storefront/forms | app/dashboard/storefront/forms/page.tsx |
| /dashboard/storefront/forms/[formId] | app/dashboard/storefront/forms/[formId]/page.tsx |
| /dashboard/storefront/forms/[formId]/submissions | app/dashboard/storefront/forms/[formId]/submissions/page.tsx |
| /dashboard/storefront/forms/new | app/dashboard/storefront/forms/new/page.tsx |
| /dashboard/storefront/fulfillment | app/dashboard/storefront/fulfillment/page.tsx |
| /dashboard/storefront/launch | app/dashboard/storefront/launch/page.tsx |
| /dashboard/storefront/markets | app/dashboard/storefront/markets/page.tsx |
| /dashboard/storefront/media | app/dashboard/storefront/media/page.tsx |
| /dashboard/storefront/menu | app/dashboard/storefront/menu/page.tsx |
| /dashboard/storefront/notifications | app/dashboard/storefront/notifications/page.tsx |
| /dashboard/storefront/ordering | app/dashboard/storefront/ordering/page.tsx |
| /dashboard/storefront/pages | app/dashboard/storefront/pages/page.tsx |
| /dashboard/storefront/pages/[pageId] | app/dashboard/storefront/pages/[pageId]/page.tsx |
| /dashboard/storefront/pickup-windows | app/dashboard/storefront/pickup-windows/page.tsx |
| /dashboard/storefront/preview | app/dashboard/storefront/preview/page.tsx |
| /dashboard/storefront/products | app/dashboard/storefront/products/page.tsx |
| /dashboard/storefront/redirects | app/dashboard/storefront/redirects/page.tsx |
| /dashboard/storefront/seo | app/dashboard/storefront/seo/page.tsx |
| /dashboard/storefront/settings | app/dashboard/storefront/settings/page.tsx |
| /dashboard/storefront/settings/experiments | app/dashboard/storefront/settings/experiments/page.tsx |
| /dashboard/storefront/team | app/dashboard/storefront/team/page.tsx |
| /dashboard/storefront/team/audit | app/dashboard/storefront/team/audit/page.tsx |
| /dashboard/storefront/theme | app/dashboard/storefront/theme/page.tsx |
| /dashboard/storefront/website | app/dashboard/storefront/website/page.tsx |
| /dashboard/storefront/workspace | app/dashboard/storefront/workspace/page.tsx |
| /dashboard/support | app/dashboard/support/page.tsx |
| /dashboard/support/[ticketId] | app/dashboard/support/[ticketId]/page.tsx |
| /dashboard/support/inbox | app/dashboard/support/inbox/page.tsx |
| /dashboard/support/kb | app/dashboard/support/kb/page.tsx |
| /dashboard/support/reports | app/dashboard/support/reports/page.tsx |
| /dashboard/system-health | app/dashboard/system-health/page.tsx |
| /dashboard/system-health/data-integrity | app/dashboard/system-health/data-integrity/page.tsx |
| /dashboard/tables | app/dashboard/tables/page.tsx |
| /dashboard/tasks | app/dashboard/tasks/page.tsx |
| /dashboard/tasks/[taskId] | app/dashboard/tasks/[taskId]/page.tsx |
| /dashboard/tasks/calendar | app/dashboard/tasks/calendar/page.tsx |
| /dashboard/tasks/kanban | app/dashboard/tasks/kanban/page.tsx |
| /dashboard/tasks/list | app/dashboard/tasks/list/page.tsx |
| /dashboard/tasks/my | app/dashboard/tasks/my/page.tsx |
| /dashboard/tasks/new | app/dashboard/tasks/new/page.tsx |
| /dashboard/tasks/recurring | app/dashboard/tasks/recurring/page.tsx |
| /dashboard/tasks/reports | app/dashboard/tasks/reports/page.tsx |
| /dashboard/tasks/settings | app/dashboard/tasks/settings/page.tsx |
| /dashboard/tasks/templates | app/dashboard/tasks/templates/page.tsx |
| /dashboard/templates | app/dashboard/templates/page.tsx |
| /dashboard/templates/[templateKey] | app/dashboard/templates/[templateKey]/page.tsx |
| /dashboard/templates/[templateKey]/apply | app/dashboard/templates/[templateKey]/apply/page.tsx |
| /dashboard/templates/all | app/dashboard/templates/all/page.tsx |
| /dashboard/templates/history | app/dashboard/templates/history/page.tsx |
| /dashboard/templates/imports | app/dashboard/templates/imports/page.tsx |
| /dashboard/templates/module-packs | app/dashboard/templates/module-packs/page.tsx |
| /dashboard/templates/playbooks | app/dashboard/templates/playbooks/page.tsx |
| /dashboard/templates/starters | app/dashboard/templates/starters/page.tsx |
| /dashboard/templates/storefront | app/dashboard/templates/storefront/page.tsx |
| /dashboard/today | app/dashboard/today/page.tsx |
| /dashboard/training | app/dashboard/training/page.tsx |
| /dashboard/training/analytics | app/dashboard/training/analytics/page.tsx |
| /dashboard/training/assignments | app/dashboard/training/assignments/page.tsx |
| /dashboard/training/certifications | app/dashboard/training/certifications/page.tsx |
| /dashboard/training/kitchen | app/dashboard/training/kitchen/page.tsx |
| /dashboard/training/manager | app/dashboard/training/manager/page.tsx |
| /dashboard/training/packing | app/dashboard/training/packing/page.tsx |
| /dashboard/training/practice | app/dashboard/training/practice/page.tsx |
| /dashboard/training/programs | app/dashboard/training/programs/page.tsx |
| /dashboard/training/programs/[programId] | app/dashboard/training/programs/[programId]/page.tsx |
| /dashboard/training/simulations | app/dashboard/training/simulations/page.tsx |
| /dashboard/training/sops | app/dashboard/training/sops/page.tsx |
| /dashboard/training/tablet | app/dashboard/training/tablet/page.tsx |
| /dashboard/workspace/experiments | app/dashboard/workspace/experiments/page.tsx |

---

## Appendix B — API Routes

| API Route |
|-----------|
| /api/billing-portal |
| /api/billing/checkout |
| /api/billing/portal |
| /api/checkout |
| /api/compliance/auditor/experiment-controls |
| /api/cron/antarctic-subglacial-mesh-sync |
| /api/cron/arctic-quantum-mesh-sync |
| /api/cron/basal-ganglia-action-selection-publish-sync |
| /api/cron/brainstem-autonomic-guard-sync |
| /api/cron/cen-cenelec-digital-product-governance-registry-sync |
| /api/cron/cerebellar-motor-organoid-sync |
| /api/cron/cerebellum-motor-refinement-publish-sync |
| /api/cron/cmmc-l3-monitoring |
| /api/cron/cortical-organoid-mesh-sync |
| /api/cron/cosmic-web-federation-sync |
| /api/cron/dna-audit-trail-archive |
| /api/cron/eo-14110-inventory-seed |
| /api/cron/eu-ai-act-art71-pmm-live-sync |
| /api/cron/eu-ai-act-live-registry-sync |
| /api/cron/eu-ai-act-seed |
| /api/cron/eu-ai-office-conformity-sync |
| /api/cron/eu-ai-office-continuous-conformity-sync |
| /api/cron/experiment-bq-private-link-audit |
| /api/cron/fedramp-high-monitoring |
| /api/cron/five-eyes-cloud-compact-monitoring |
| /api/cron/five-eyes-plus-compact-monitoring |
| /api/cron/galactic-mesh-sync |
| /api/cron/heliopause-dtn-sync |
| /api/cron/hipaa-baa-evidence-binder |
| /api/cron/hippocampal-organoid-mesh-sync |
| /api/cron/homomorphic-dna-federation-sync |
| /api/cron/hypergraph-evolution-anchor |
| /api/cron/hypergraph-l10-quantum-resilient-anchor |
| /api/cron/hypergraph-l11-topological-fault-tolerant-anchor |
| /api/cron/hypergraph-l12-categorical-quantum-anchor |
| /api/cron/hypergraph-l13-homotopy-type-theoretic-anchor |
| /api/cron/hypergraph-l3-recursive-anchor |
| /api/cron/hypergraph-l4-meta-anchor |
| /api/cron/hypergraph-l5-compositional-anchor |
| /api/cron/hypergraph-l6-holographic-anchor |
| /api/cron/hypergraph-l7-entanglement-anchor |
| /api/cron/hypergraph-l8-fault-tolerant-anchor |
| /api/cron/hypergraph-l9-byzantine-anchor |
| /api/cron/hypergraph-zk-dna-rollup |
| /api/cron/icao-imo-ai-aviation-registry-sync |
| /api/cron/indo-pacific-compact-sync |
| /api/cron/intergalactic-mesh-federation-sync |
| /api/cron/irap-essential-eight-monitoring |
| /api/cron/ismap-nzism-monitoring |
| /api/cron/iso-42001-ai-ms-seed |
| /api/cron/iso-42001-cert-body-seed |
| /api/cron/iso-42001-stage2-surveillance |
| /api/cron/iso-iec-ai-standards-harmonization-registry-sync |
| /api/cron/iso27001-quarterly-attestation |
| /api/cron/itu-uncitral-digital-commerce-ai-registry-sync |
| /api/cron/jupiter-trojan-dtn-lagrange-sync |
| /api/cron/kuiper-scattered-disk-dtn-aphelion-sync |
| /api/cron/lunar-farside-dtn-mesh-sync |
| /api/cron/martian-orbital-dtn-relay-sync |
| /api/cron/meal-plan-auto-renew |
| /api/cron/medulla-oblongata-emergency-halt-sync |
| /api/cron/metaverse-finality-seal-crdt-sync |
| /api/cron/midbrain-arousal-publish-pacing-sync |
| /api/cron/motor-cortex-execution-publish-sync |
| /api/cron/multiverse-branch-merge-seal-crdt-sync |
| /api/cron/multiverse-causality-lock-crdt-sync |
| /api/cron/multiverse-counterfactual-crdt-sync |
| /api/cron/multiverse-outcome-crdt-sync |
| /api/cron/multiverse-reconciliation-crdt-sync |
| /api/cron/multiverse-timeline-seal-crdt-sync |
| /api/cron/neptune-triton-retrograde-dtn-halo-sync |
| /api/cron/nist-ai-rmf-live-control-feed-sync |
| /api/cron/nist-ai-rmf-seed |
| /api/cron/oecd-state-ag-ai-transparency-mesh-sync |
| /api/cron/omniverse-causal-graph-crdt-sync |
| /api/cron/omniverse-epoch-freeze-crdt-sync |
| /api/cron/omniverse-epoch-seal-crdt-sync |
| /api/cron/pan-pacific-quantum-mesh-sync |
| /api/cron/parallel-universe-merge-crdt-sync |
| /api/cron/pci-dss-saq-attestation |
| /api/cron/pilot-daily-health |
| /api/cron/pluto-charon-binary-dtn-barycenter-sync |
| /api/cron/pons-autonomic-bridge-failover-sync |
| /api/cron/pqc-dna-archival-seal |
| /api/cron/prefrontal-ethics-board-sync |
| /api/cron/prefrontal-organoid-mesh-sync |
| /api/cron/premotor-sma-planning-publish-sync |
| /api/cron/pspf-nz-dta-monitoring |
| /api/cron/recursive-zk-dna-rollup |
| /api/cron/reminders |
| /api/cron/saturn-ring-dtn-shepherd-sync |
| /api/cron/soc2-experiment-evidence |
| /api/cron/soc2-fedramp-replicate |
| /api/cron/soc2-type2-evidence-binder |
| /api/cron/soci-nz-gcdo-monitoring |
| /api/cron/spinal-cord-publish-throttle-sync |
| /api/cron/stateramp-txramp-monitoring |
| /api/cron/storefront-cart-recovery |
| /api/cron/storefront-domain-recheck |
| /api/cron/storefront-edge-sync |
| /api/cron/storefront-experiment-audit-archive |
| /api/cron/storefront-experiment-audit-control |
| /api/cron/storefront-experiment-auto-conclude |
| /api/cron/storefront-experiment-autonomous-scientist |
| /api/cron/storefront-experiment-causal-discovery |
| /api/cron/storefront-experiment-cislunar-dtn-sync |
| /api/cron/storefront-experiment-contextual-bandit |
| /api/cron/storefront-experiment-crdt-gossip |
| /api/cron/storefront-experiment-dtn-mesh-sync |
| /api/cron/storefront-experiment-ebpf-purge |
| /api/cron/storefront-experiment-feature-store |
| /api/cron/storefront-experiment-global-mesh-sync |
| /api/cron/storefront-experiment-holdout-decay |
| /api/cron/storefront-experiment-holdout-ws-sync |
| /api/cron/storefront-experiment-interference-holdout |
| /api/cron/storefront-experiment-linucb-realtime |
| /api/cron/storefront-experiment-linucb-stream |
| /api/cron/storefront-experiment-mab-update |
| /api/cron/storefront-experiment-multi-agent-orchestrator |
| /api/cron/storefront-experiment-planet-edge |
| /api/cron/storefront-experiment-post-publish-guard |
| /api/cron/storefront-experiment-report |
| /api/cron/storefront-experiment-srm |
| /api/cron/storefront-experiment-vertex-promote |
| /api/cron/storefront-ga4-parity |
| /api/cron/storefront-invite-audit-retention |
| /api/cron/storefront-team-invite-reminders |
| /api/cron/storefront-theme-publish |
| /api/cron/storefront-webhook-retention |
| /api/cron/thalamus-sensory-gating-publish-sync |
| /api/cron/uk-ai-safety-seed |
| /api/cron/uk-dsit-algorithmic-transparency-sync |
| /api/cron/un-ai-office-global-registry-mesh-sync |
| /api/cron/uranus-obliquity-dtn-polar-relay-sync |
| /api/cron/us-ftc-ai-transparency-live-sync |
| /api/cron/webhook-jobs |
| /api/cron/wto-upu-cross-border-ai-trade-registry-sync |
| /api/cron/zk-dna-rollup |
| /api/dashboard/compliance/experiment-audit-download |
| /api/dashboard/experiment-publish-preflight |
| /api/dashboard/orders/storefront-export |
| /api/dashboard/storefront/experiment-audit-export |
| /api/dashboard/storefront/experiment-legal-hold |
| /api/dashboard/storefront/experiment-series |
| /api/dashboard/storefront/team-invite-audit-export |
| /api/delivery/cancel |
| /api/delivery/create |
| /api/delivery/quote |
| /api/export |
| /api/export/allergen-sheet |
| /api/export/franchise-royalties |
| /api/export/nutrition-label |
| /api/export/payroll |
| /api/export/quickbooks |
| /api/export/report |
| /api/export/restaurant-pnl |
| /api/export/xero |
| /api/gift-cards/balance |
| /api/growth/customer-success/export |
| /api/growth/leads/export |
| /api/health |
| /api/import-center/[jobId]/errors.csv |
| /api/import-center/templates/[type] |
| /api/import-export/template |
| /api/import-templates/[type] |
| /api/integrations/7shifts/sync |
| /api/integrations/homebase/sync |
| /api/integrations/shopify/sync-orders |
| /api/integrations/shopify/sync-products |
| /api/integrations/shopify/test |
| /api/integrations/uber-eats/test |
| /api/integrations/woocommerce/sync-orders |
| /api/integrations/woocommerce/sync-products |
| /api/integrations/woocommerce/test |
| /api/internal/dsr/export |
| /api/internal/experiment-dna-audit-block |
| /api/internal/experiment-ebpf-sample |
| /api/internal/experiment-ethics-review |
| /api/internal/experiment-quantum-seal |
| /api/internal/experiment-tee-attest |
| /api/internal/experiment-wetware-calibrate |
| /api/internal/experiment-zk-proof |
| /api/internal/stripe/resolve-prices |
| /api/invite/magic-link |
| /api/labor/realtime |
| /api/loyalty/balance |
| /api/public/v1/customers |
| /api/public/v1/inventory |
| /api/public/v1/locations |
| /api/public/v1/orders |
| /api/public/v1/products |
| /api/public/v1/recipes |
| /api/public/v1/staff |
| /api/public/v1/webhooks |
| /api/purchasing/edi/submit |
| /api/storefront/account/orders |
| /api/storefront/account/reorder |
| /api/storefront/account/reorder/preview |
| /api/storefront/account/session |
| /api/storefront/analytics |
| /api/storefront/cart |
| /api/storefront/cart-recovery |
| /api/storefront/cart-recovery/unsubscribe |
| /api/storefront/catalog |
| /api/storefront/experiment/auto-conclude/approve |
| /api/storefront/experiment/auto-conclude/bulk-approve |
| /api/storefront/experiment/auto-conclude/reject |
| /api/storefront/experiment/causal-discovery/approve |
| /api/storefront/experiment/orchestrator/approve |
| /api/storefront/form-submissions-export/[formId] |
| /api/storefront/forms/upload |
| /api/storefront/guest-account |
| /api/storefront/preview-token |
| /api/storefront/qr |
| /api/storefront/resolve-host |
| /api/storefront/resolve-redirect |
| /api/storefront/shipping/quote |
| /api/storefront/theme-experiment |
| /api/webhooks/bigquery-bayesian-prior |
| /api/webhooks/bigquery-causal-discovery-outcomes |
| /api/webhooks/bigquery-causal-lift |
| /api/webhooks/bigquery-causal-posteriors |
| /api/webhooks/bigquery-federated-gradients |
| /api/webhooks/bigquery-ga4-parity |
| /api/webhooks/bigquery-global-mesh-outcomes |
| /api/webhooks/bigquery-homomorphic-metrics |
| /api/webhooks/bigquery-interference-matrix |
| /api/webhooks/bigquery-linucb-weights |
| /api/webhooks/bigquery-off-policy |
| /api/webhooks/bigquery-spillover-daily |
| /api/webhooks/bigquery-workspace-acl |
| /api/webhooks/cen-cenelec-digital-product-governance-registry |
| /api/webhooks/eu-ai-act-art71-pmm-live |
| /api/webhooks/eu-ai-act-live-registry |
| /api/webhooks/eu-ai-office-conformity-sync |
| /api/webhooks/experiment-cislunar-dtn-bundle |
| /api/webhooks/experiment-dtn-bundle |
| /api/webhooks/experiment-feature-stream |
| /api/webhooks/experiment-feature-stream-flink |
| /api/webhooks/experiment-heliopause-dtn-bundle |
| /api/webhooks/experiment-holdout-ws-push |
| /api/webhooks/experiment-scientist-proposal |
| /api/webhooks/icao-imo-ai-aviation-registry |
| /api/webhooks/iso-42001-cert-body-attest |
| /api/webhooks/iso-iec-ai-standards-harmonization-registry |
| /api/webhooks/itu-uncitral-digital-commerce-ai-registry |
| /api/webhooks/nist-ai-rmf-live-control-feed |
| /api/webhooks/oecd-state-ag-ai-transparency-mesh |
| /api/webhooks/resend |
| /api/webhooks/scim/experiment-auditor |
| /api/webhooks/shopify/app-uninstalled |
| /api/webhooks/shopify/orders-create |
| /api/webhooks/shopify/orders-updated |
| /api/webhooks/shopify/products-update |
| /api/webhooks/slack/experiment-interactive |
| /api/webhooks/stripe |
| /api/webhooks/uber-direct |
| /api/webhooks/uber-eats/orders |
| /api/webhooks/uk-dsit-algorithmic-transparency |
| /api/webhooks/un-ai-office-global-registry-mesh |
| /api/webhooks/us-ftc-ai-transparency-live |
| /api/webhooks/vertex-ml-model |
| /api/webhooks/woocommerce |
| /api/webhooks/wto-upu-cross-border-ai-trade-registry |

---

## Appendix C — Server Actions

| Action | File |
|--------|------|
| createInvoiceAction | actions/accounting/ap.ts |
| matchInvoiceAction | actions/accounting/ap.ts |
| approveInvoiceAction | actions/accounting/ap.ts |
| markPaidInvoiceAction | actions/accounting/ap.ts |
| importBankCsvAction | actions/accounting/bank-reconciliation.ts |
| reconcileBankTxAction | actions/accounting/bank-reconciliation.ts |
| submitCashCountAction | actions/accounting/cash.ts |
| upsertAllergenProfileFormAction | actions/allergen-profile.ts |
| generateAnalyticsSnapshotAction | actions/analytics.ts |
| generateAnalyticsSnapshotFormAction | actions/analytics.ts |
| createAnalyticsSavedViewAction | actions/analytics.ts |
| createAnalyticsSavedViewFormAction | actions/analytics.ts |
| deleteAnalyticsSavedViewAction | actions/analytics.ts |
| deleteAnalyticsSavedViewFormAction | actions/analytics.ts |
| toggleAnalyticsAlertAction | actions/analytics.ts |
| toggleAnalyticsAlertFormAction | actions/analytics.ts |
| exportAnalyticsCsvAction | actions/analytics.ts |
| loadAuditCenterPageData | actions/audit-center.ts |
| loadMoreAuditLogsAction | actions/audit-center.ts |
| getAuditLogDetailAction | actions/audit-center.ts |
| runAuditExportAction | actions/audit-center.ts |
| upsertAuditRetentionAction | actions/audit-center.ts |
| getAuditRetentionForOwnerAction | actions/audit-center.ts |
| signInAction | actions/auth.ts |
| signUpAction | actions/auth.ts |
| signOutAction | actions/auth.ts |
| resetPasswordAction | actions/auth.ts |
| updateBetaLeadProgramStage | actions/beta-operations.ts |
| updateBetaLeadFounderFields | actions/beta-operations.ts |
| sendBetaLifecycleEmail | actions/beta-operations.ts |
| bulkUpdateBetaProgramStage | actions/beta-operations.ts |
| submitBetaApplication | actions/beta.ts |
| setEntitlementOverrideAction | actions/billing.ts |
| clearEntitlementOverrideAction | actions/billing.ts |
| adminAssignPlanAction | actions/billing.ts |
| submitDemoRequest | actions/book-demo.ts |
| createBrandVoid | actions/brands.ts |
| createBrandWizardVoid | actions/brands.ts |
| createBrand | actions/brands.ts |
| updateBrandDetails | actions/brands.ts |
| updateBrandDetailsFormAction | actions/brands.ts |
| updateBrandLifecycle | actions/brands.ts |
| updateBrandLifecycleFormAction | actions/brands.ts |
| createCateringQuoteAction | actions/catering-quotes.ts |
| createCateringQuoteFormAction | actions/catering-quotes.ts |
| updateCateringQuoteAction | actions/catering-quotes.ts |
| updateCateringQuoteFormAction | actions/catering-quotes.ts |
| setCateringQuoteStatusAction | actions/catering-quotes.ts |
| setCateringQuoteStatusFormAction | actions/catering-quotes.ts |
| addCateringQuoteLineAction | actions/catering-quotes.ts |
| addCateringQuoteLineFormAction | actions/catering-quotes.ts |
| removeCateringQuoteLineAction | actions/catering-quotes.ts |
| removeCateringQuoteLineFormAction | actions/catering-quotes.ts |
| snapshotCateringQuoteVersionAction | actions/catering-quotes.ts |
| snapshotCateringQuoteVersionFormAction | actions/catering-quotes.ts |
| rotateCateringPublicLinkAction | actions/catering-quotes.ts |
| rotateCateringPublicLinkFormAction | actions/catering-quotes.ts |
| revokeCateringPublicLinkAction | actions/catering-quotes.ts |
| revokeCateringPublicLinkFormAction | actions/catering-quotes.ts |
| createCateringFollowUpAction | actions/catering-quotes.ts |
| createCateringFollowUpFormAction | actions/catering-quotes.ts |
| completeCateringFollowUpAction | actions/catering-quotes.ts |
| completeCateringFollowUpFormAction | actions/catering-quotes.ts |
| convertCateringQuoteAction | actions/catering-quotes.ts |
| convertCateringQuoteFormAction | actions/catering-quotes.ts |
| createCateringTemplateAction | actions/catering-quotes.ts |
| createCateringTemplateFormAction | actions/catering-quotes.ts |
| createCateringQuoteAction | actions/catering.ts |
| markQuoteSentAction | actions/catering.ts |
| createCateringQuoteFormAction | actions/catering.ts |
| markQuoteSentFormAction | actions/catering.ts |
| runChannelCertificationAction | actions/channel-certification.ts |
| recordCertificationSignOffAction | actions/channel-certification.ts |
| approveChannelImportRecords | actions/channel-command-center.ts |
| rejectChannelImportRecord | actions/channel-command-center.ts |
| retryChannelImportValidation | actions/channel-command-center.ts |
| resolveChannelConflict | actions/channel-command-center.ts |
| saveChannelHandoffSettings | actions/channel-command-center.ts |
| createChannelRule | actions/channel-command-center.ts |
| toggleChannelRule | actions/channel-command-center.ts |
| rollbackChannelImportBatch | actions/channel-command-center.ts |
| runChannelIngestSimulation | actions/channel-command-center.ts |
| processWebhookLabPayload | actions/channel-command-center.ts |
| exportChannelImportErrorCsv | actions/channel-command-center.ts |
| createTransferAction | actions/commissary.ts |
| chatTurnAction | actions/copilot.ts |
| createActionDraftAction | actions/copilot.ts |
| approveActionDraftFormAction | actions/copilot.ts |
| rejectActionDraftFormAction | actions/copilot.ts |
| executeActionDraftFormAction | actions/copilot.ts |
| refreshDeterministicAction | actions/copilot.ts |
| resolveCopilotInsightFormAction | actions/copilot.ts |
| updateCopilotSettingsFormAction | actions/copilot.ts |
| recalculateCostSnapshotsAction | actions/costing.ts |
| saveCostingSettingsAction | actions/costing.ts |
| createChannelFeeRuleAction | actions/costing.ts |
| createMarginRuleAction | actions/costing.ts |
| savePriceScenarioAction | actions/costing.ts |
| createCustomerSubscriptionAction | actions/customer-subscription.ts |
| setSubscriptionStatusAction | actions/customer-subscription.ts |
| createCustomerSubscriptionFormAction | actions/customer-subscription.ts |
| setSubscriptionStatusFormAction | actions/customer-subscription.ts |
| appendCustomerSuccessNoteForm | actions/customer-success.ts |
| markCustomerContactedForm | actions/customer-success.ts |
| createCustomerAction | actions/customers.ts |
| createCustomerFormAction | actions/customers.ts |
| updateCustomerProfileAction | actions/customers.ts |
| updateCustomerProfileFormAction | actions/customers.ts |
| updateCustomerDietaryAction | actions/customers.ts |
| updateCustomerDietaryFormAction | actions/customers.ts |
| createCustomerNoteAction | actions/customers.ts |
| createCustomerNoteFormAction | actions/customers.ts |
| createCustomerFollowUpAction | actions/customers.ts |
| createCustomerFollowUpFormAction | actions/customers.ts |
| updateCustomerFollowUpStatusAction | actions/customers.ts |
| updateCustomerFollowUpStatusFormAction | actions/customers.ts |
| updateCustomerConsentAction | actions/customers.ts |
| updateCustomerConsentFormAction | actions/customers.ts |
| createCustomerSegmentAction | actions/customers.ts |
| createCustomerSegmentFormAction | actions/customers.ts |
| rebuildSegmentMembershipsAction | actions/customers.ts |
| rebuildSegmentMembershipsFormAction | actions/customers.ts |
| createCompanyAccountAction | actions/customers.ts |
| createCompanyAccountFormAction | actions/customers.ts |
| archiveCustomerAction | actions/customers.ts |
| archiveCustomerFormAction | actions/customers.ts |
| recomputeCrmMetricsAction | actions/customers.ts |
| recomputeCrmMetricsFormAction | actions/customers.ts |
| createDeliveryRouteFromOrdersAction | actions/delivery-route.ts |
| createDeliveryRouteFromOrdersFormAction | actions/delivery-route.ts |
| createManualRouteAction | actions/delivery-route.ts |
| createManualRouteFormAction | actions/delivery-route.ts |
| reorderStopAction | actions/delivery-route.ts |
| updateStopStatusAction | actions/delivery-route.ts |
| updateStopStatusFormAction | actions/delivery-route.ts |
| assignDriverAction | actions/delivery-route.ts |
| assignDriverFormAction | actions/delivery-route.ts |
| createDriverAction | actions/delivery-route.ts |
| createDriverFormAction | actions/delivery-route.ts |
| createZoneAction | actions/delivery-route.ts |
| createZoneFormAction | actions/delivery-route.ts |
| recordManifestPrintedAction | actions/delivery-route.ts |
| recordUberQuotePlaceholderAction | actions/delivery-route.ts |
| seedGoldenScenarioAction | actions/demo-golden-scenario.ts |
| resetGoldenScenarioAction | actions/demo-golden-scenario.ts |
| importDemoWorkspace | actions/demo.ts |
| importDemoWorkspaceFromForm | actions/demo.ts |
| resetDemoWorkspace | actions/demo.ts |
| createPlatformIncidentAction | actions/developer-platform.ts |
| validateEnvironmentNowAction | actions/developer-platform.ts |
| recordDeveloperToolInvocationAction | actions/developer-platform.ts |
| recordDeveloperPingAction | actions/developer-platform.ts |
| refreshExecutiveSnapshotAction | actions/executive.ts |
| refreshExecutiveSnapshotFormAction | actions/executive.ts |
| resolveExecutiveInsightAction | actions/executive.ts |
| dismissExecutiveInsightAction | actions/executive.ts |
| resolveExecutiveInsightFormAction | actions/executive.ts |
| dismissExecutiveInsightFormAction | actions/executive.ts |
| submitEthicsReviewAction | actions/experiment-ethics-review.ts |
| submitSupportTicketVoid | actions/external.ts |
| submitSupportTicket | actions/external.ts |
| submitPartnerLeadVoid | actions/external.ts |
| submitPartnerLead | actions/external.ts |
| submitSalesInquiryVoid | actions/external.ts |
| submitSalesInquiry | actions/external.ts |
| submitAppFeedback | actions/feedback.ts |
| logTemperatureAction | actions/food-safety.ts |
| createChecklistAction | actions/food-safety.ts |
| startAuditAction | actions/food-safety.ts |
| submitAuditResponseAction | actions/food-safety.ts |
| runForecastAction | actions/forecast.ts |
| runForecastFormAction | actions/forecast.ts |
| addForecastAdjustmentAction | actions/forecast.ts |
| addForecastAdjustmentFormAction | actions/forecast.ts |
| sendForecastToProductionAction | actions/forecast.ts |
| sendForecastToProductionFormAction | actions/forecast.ts |
| sendForecastToIngredientDemandAction | actions/forecast.ts |
| sendForecastToIngredientDemandFormAction | actions/forecast.ts |
| archiveForecastRunAction | actions/forecast.ts |
| archiveForecastRunFormAction | actions/forecast.ts |
| restoreForecastRunAction | actions/forecast.ts |
| restoreForecastRunFormAction | actions/forecast.ts |
| createGiftCardAction | actions/gift-cards.ts |
| runGlobalSearch | actions/global-search.ts |
| createGoLiveProjectAction | actions/go-live.ts |
| refreshValidationAction | actions/go-live.ts |
| updateChecklistItemAction | actions/go-live.ts |
| runSimulationAction | actions/go-live.ts |
| recordApprovalAction | actions/go-live.ts |
| createIncidentAction | actions/go-live.ts |
| updateIncidentAction | actions/go-live.ts |
| createRollbackPlanAction | actions/go-live.ts |
| transitionLaunchStatusAction | actions/go-live.ts |
| updateBetaLeadStatus | actions/growth.ts |
| updateBetaLeadPriority | actions/growth.ts |
| appendBetaLeadNote | actions/growth.ts |
| convertBetaLeadToDemoRequest | actions/growth.ts |
| updateDemoRequestStatus | actions/growth.ts |
| updateAppFeedbackStatus | actions/growth.ts |
| createOnboardingCall | actions/growth.ts |
| dismissActivationChecklist | actions/growth.ts |
| ensureReferralCode | actions/growth.ts |
| createDraftReleaseNote | actions/growth.ts |
| publishReleaseNote | actions/growth.ts |
| generateOutreachMessage | actions/growth.ts |
| sendTestLeadEmail | actions/growth.ts |
| submitDraftReleaseNoteForm | actions/growth.ts |
| submitOnboardingCallForm | actions/growth.ts |
| dismissActivationChecklistForm | actions/growth.ts |
| publishReleaseNoteFromForm | actions/growth.ts |
| createImplementationProjectAction | actions/implementation-center.ts |
| updateImplementationStatusAction | actions/implementation-center.ts |
| updateChecklistItemAction | actions/implementation-center.ts |
| assignChecklistItemAction | actions/implementation-center.ts |
| updatePhaseStatusAction | actions/implementation-center.ts |
| addImplementationRiskAction | actions/implementation-center.ts |
| resolveImplementationRiskAction | actions/implementation-center.ts |
| runReadinessAction | actions/implementation-center.ts |
| previewImplementationTasksAction | actions/implementation-center.ts |
| generateImplementationTasksAction | actions/implementation-center.ts |
| markGoLiveAction | actions/implementation-center.ts |
| createImplementationProjectVoid | actions/implementation.ts |
| createImplementationProject | actions/implementation.ts |
| updateImplementationTaskStatusVoid | actions/implementation.ts |
| updateImplementationTaskStatus | actions/implementation.ts |
| createImportJobFromCsvVoid | actions/implementation.ts |
| createImportJobFromCsv | actions/implementation.ts |
| commitImportJobVoid | actions/implementation.ts |
| commitImportJob | actions/implementation.ts |
| createProductMappingSuggestionVoid | actions/implementation.ts |
| createProductMappingSuggestion | actions/implementation.ts |
| updateProductMappingStatusVoid | actions/implementation.ts |
| updateProductMappingStatus | actions/implementation.ts |
| mergeCustomersVoid | actions/implementation.ts |
| mergeCustomers | actions/implementation.ts |
| runGoLiveTestRunVoid | actions/implementation.ts |
| runGoLiveTestRun | actions/implementation.ts |
| uploadImportCsvAction | actions/import-center.ts |
| commitImportJobAction | actions/import-center.ts |
| rollbackImportJobAction | actions/import-center.ts |
| cancelImportJobAction | actions/import-center.ts |
| assertCommitable | actions/import-center.ts |
| validateIngredientImportPreviewAction | actions/import-export.ts |
| upsertIngredientDeclarationFormAction | actions/ingredient-declaration.ts |
| runIntegrationHealthCheckVoid | actions/integration-health.ts |
| runIntegrationHealthCheckForm | actions/integration-health.ts |
| saveWooCommerceSettings | actions/integrations.ts |
| saveShopifySettings | actions/integrations.ts |
| saveUberEatsSettings | actions/integrations.ts |
| saveUberDirectSettings | actions/integrations.ts |
| disconnectIntegration | actions/integrations.ts |
| requestDoorDashQuoteAction | actions/integrations/doordash.ts |
| createDoorDashDeliveryAction | actions/integrations/doordash.ts |
| testGrubhubOrderAction | actions/integrations/grubhub.ts |
| logWasteEventAction | actions/inventory.ts |
| startInventoryCountAction | actions/inventory.ts |
| submitCountItemAction | actions/inventory.ts |
| completeInventoryCountAction | actions/inventory.ts |
| runAIOrderForecastAction | actions/kitchen-ai.ts |
| runAIMenuSuggestionsAction | actions/kitchen-ai.ts |
| runAIWhatToOrderAction | actions/kitchen-ai.ts |
| fetchDailyKdsOrdersAction | actions/kitchen-daily-kds.ts |
| bumpDailyKdsOrderAction | actions/kitchen-daily-kds.ts |
| createKitchenTaskAction | actions/kitchen-task.ts |
| updateKitchenTaskStatusAction | actions/kitchen-task.ts |
| createKitchenTaskFormAction | actions/kitchen-task.ts |
| updateKitchenTaskStatusFormAction | actions/kitchen-task.ts |
| createFullTaskAction | actions/kitchen-task.ts |
| createFullTaskFormAction | actions/kitchen-task.ts |
| assignTaskAction | actions/kitchen-task.ts |
| assignTaskFormAction | actions/kitchen-task.ts |
| updateTaskPriorityAction | actions/kitchen-task.ts |
| updateTaskPriorityFormAction | actions/kitchen-task.ts |
| rescheduleTaskAction | actions/kitchen-task.ts |
| rescheduleTaskFormAction | actions/kitchen-task.ts |
| addTaskCommentAction | actions/kitchen-task.ts |
| addTaskCommentFormAction | actions/kitchen-task.ts |
| toggleChecklistAction | actions/kitchen-task.ts |
| toggleChecklistFormAction | actions/kitchen-task.ts |
| applyBuiltInTemplateAction | actions/kitchen-task.ts |
| applyBuiltInTemplateFormAction | actions/kitchen-task.ts |
| createIntegrationFollowUpTask | actions/kitchen-task.ts |
| createPrintedLabelJobAction | actions/label-print-queue.ts |
| markPrintedLabelJobAction | actions/label-print-queue.ts |
| ensureDefaultLabelTemplatesAction | actions/label-print-queue.ts |
| createPrintedLabelJobFormAction | actions/label-print-queue.ts |
| markPrintedLabelJobFormAction | actions/label-print-queue.ts |
| createShiftAction | actions/labor/schedule.ts |
| updateShiftAction | actions/labor/schedule.ts |
| deleteShiftAction | actions/labor/schedule.ts |
| clockInAction | actions/labor/time-clock.ts |
| clockOutAction | actions/labor/time-clock.ts |
| createLocationAction | actions/locations.ts |
| createLocationFormAction | actions/locations.ts |
| createFullLocationAction | actions/locations.ts |
| createFullLocationFormAction | actions/locations.ts |
| updateLocationProfileAction | actions/locations.ts |
| updateLocationProfileFormAction | actions/locations.ts |
| updateLocationHoursAction | actions/locations.ts |
| updateLocationHoursFormAction | actions/locations.ts |
| updateLocationFulfillmentAction | actions/locations.ts |
| updateLocationFulfillmentFormAction | actions/locations.ts |
| archiveLocationAction | actions/locations.ts |
| archiveLocationFormAction | actions/locations.ts |
| bulkAssignAction | actions/locations.ts |
| bulkAssignFormAction | actions/locations.ts |
| setActiveLocationAction | actions/locations.ts |
| setActiveLocationFormAction | actions/locations.ts |
| updateLoyaltyProgramAction | actions/loyalty.ts |
| createMealPlanAction | actions/meal-plans.ts |
| createMealPlanFormAction | actions/meal-plans.ts |
| updateMealPlanAction | actions/meal-plans.ts |
| updateMealPlanFormAction | actions/meal-plans.ts |
| setMealPlanStatusAction | actions/meal-plans.ts |
| setMealPlanStatusFormAction | actions/meal-plans.ts |
| materializeCyclesAction | actions/meal-plans.ts |
| materializeCyclesFormAction | actions/meal-plans.ts |
| skipCycleAction | actions/meal-plans.ts |
| skipCycleFormAction | actions/meal-plans.ts |
| createSelectionAction | actions/meal-plans.ts |
| createSelectionFormAction | actions/meal-plans.ts |
| removeSelectionAction | actions/meal-plans.ts |
| removeSelectionFormAction | actions/meal-plans.ts |
| generateCycleDraftAction | actions/meal-plans.ts |
| generateCycleDraftFormAction | actions/meal-plans.ts |
| backfillLegacyAction | actions/meal-plans.ts |
| backfillLegacyFormAction | actions/meal-plans.ts |
| createTemplateAction | actions/meal-plans.ts |
| createTemplateFormAction | actions/meal-plans.ts |
| createMenu | actions/menus.ts |
| createMenuFromWizard | actions/menus.ts |
| applyMenuTemplate | actions/menus.ts |
| updateMenu | actions/menus.ts |
| setMenuActive | actions/menus.ts |
| duplicateMenu | actions/menus.ts |
| deleteMenu | actions/menus.ts |
| reorderMenus | actions/menus.ts |
| saveKitchenModulePreferences | actions/module-preferences.ts |
| clearKitchenModulePreferences | actions/module-preferences.ts |
| resetKitchenModulePreferencesToRecommended | actions/module-preferences.ts |
| submitCancellationFeedbackVoid | actions/monetization.ts |
| submitCancellationFeedbackForm | actions/monetization.ts |
| saveBrandingSettingsVoid | actions/monetization.ts |
| saveBrandingSettingsForm | actions/monetization.ts |
| createApiKeyForm | actions/monetization.ts |
| revokeApiKeyById | actions/monetization.ts |
| toggleNotificationRuleAction | actions/notification-rules.ts |
| seedNotificationRulesAction | actions/notification-rules.ts |
| toggleNotificationRuleFormAction | actions/notification-rules.ts |
| seedNotificationRulesFormAction | actions/notification-rules.ts |
| sendTestEmailAction | actions/notifications-center.ts |
| retryNotificationAction | actions/notifications-center.ts |
| cancelNotificationAction | actions/notifications-center.ts |
| installDefaultRulesAction | actions/notifications-center.ts |
| updateRuleAction | actions/notifications-center.ts |
| updateNutritionPackingGatesAction | actions/nutrition-label-settings.ts |
| updateStorefrontLabelVisibilityAction | actions/nutrition-label-settings.ts |
| updateNutritionPackingGatesFormAction | actions/nutrition-label-settings.ts |
| updateStorefrontLabelVisibilityFormAction | actions/nutrition-label-settings.ts |
| verifyNutritionProfileAction | actions/nutrition-label-verification.ts |
| setNutritionVerificationStatusAction | actions/nutrition-label-verification.ts |
| verifyAllergenProfileAction | actions/nutrition-label-verification.ts |
| verifyIngredientDeclarationAction | actions/nutrition-label-verification.ts |
| verifyNutritionProfileFormAction | actions/nutrition-label-verification.ts |
| setNutritionVerificationStatusFormAction | actions/nutrition-label-verification.ts |
| verifyAllergenProfileFormAction | actions/nutrition-label-verification.ts |
| verifyIngredientDeclarationFormAction | actions/nutrition-label-verification.ts |
| upsertNutritionProfileAction | actions/nutrition-profile.ts |
| upsertNutritionProfileFormAction | actions/nutrition-profile.ts |
| onboardingSaveWelcome | actions/onboarding.ts |
| onboardingSaveOperatingModel | actions/onboarding.ts |
| onboardingSaveBrandsLocations | actions/onboarding.ts |
| onboardingSaveStep1 | actions/onboarding.ts |
| onboardingSaveStep2 | actions/onboarding.ts |
| onboardingSaveStep3Menu | actions/onboarding.ts |
| onboardingSaveStep4Products | actions/onboarding.ts |
| onboardingSkipWeeklyMenu | actions/onboarding.ts |
| onboardingSaveStep5Channels | actions/onboarding.ts |
| onboardingSaveRecommendedModules | actions/onboarding.ts |
| onboardingComplete | actions/onboarding.ts |
| reopenOnboardingWizard | actions/onboarding.ts |
| onboardingSkipToDashboard | actions/onboarding.ts |
| onboardingSkipStepGeneric | actions/onboarding.ts |
| updateKitchenOperatingMode | actions/operating-mode.ts |
| createOperationsChecklistAction | actions/operations.ts |
| startOperationsAuditAction | actions/operations.ts |
| submitOperationsResponseAction | actions/operations.ts |
| createOrderViaCenterAction | actions/order-creation.ts |
| createOrder | actions/orders.ts |
| updateOrderStatus | actions/orders.ts |
| updateOrderKitchenNotes | actions/orders.ts |
| sendReminderEmails | actions/orders.ts |
| sendFulfillmentReminders | actions/orders.ts |
| getVerificationSessionDetailAction | actions/packing-verification.ts |
| startVerificationSessionAction | actions/packing-verification.ts |
| searchOrdersByCustomerAction | actions/packing-verification.ts |
| loadVerificationShellAction | actions/packing-verification.ts |
| verifyItemFullQuantityAction | actions/packing-verification.ts |
| incrementVerifiedQuantityAction | actions/packing-verification.ts |
| setVerificationItemStatusAction | actions/packing-verification.ts |
| markAllergenCheckedAction | actions/packing-verification.ts |
| markLabelCheckedAction | actions/packing-verification.ts |
| completeVerificationSessionAction | actions/packing-verification.ts |
| supervisorOverrideVerificationAction | actions/packing-verification.ts |
| sendVerificationBackToPackingAction | actions/packing-verification.ts |
| lookupOrderByPackTokenAction | actions/packing-verify.ts |
| logPackingEventAction | actions/packing-verify.ts |
| logPackingEventFormAction | actions/packing-verify.ts |
| generatePackingQueueAction | actions/packing.ts |
| updatePackingTaskStatusAction | actions/packing.ts |
| markLabelPrintedPlaceholderAction | actions/packing.ts |
| createPackingWaveAction | actions/packing.ts |
| createPartnerOrganization | actions/partner-operations.ts |
| startPlatformImpersonation | actions/platform-impersonation.ts |
| endPlatformImpersonation | actions/platform-impersonation.ts |
| startImpersonationFormAction | actions/platform-impersonation.ts |
| startPlatformSupportSessionAction | actions/platform-support-session.ts |
| endPlatformSupportSessionAction | actions/platform-support-session.ts |
| addPlatformSupportInternalCommentAction | actions/platform-support.ts |
| addPlatformSupportCustomerReplyAction | actions/platform-support.ts |
| platformUpdateSupportTicketStatusAction | actions/platform-support.ts |
| platformAssignSupportTicketAction | actions/platform-support.ts |
| ensureSystemPlaybooksAction | actions/playbooks.ts |
| startRunAction | actions/playbooks.ts |
| transitionStepAction | actions/playbooks.ts |
| generateTasksAction | actions/playbooks.ts |
| completeRunAction | actions/playbooks.ts |
| cancelRunAction | actions/playbooks.ts |
| createCustomPlaybookAction | actions/playbooks.ts |
| archivePlaybookAction | actions/playbooks.ts |
| updatePlaybookSettingsAction | actions/playbooks.ts |
| posSearchKitchenCustomersAction | actions/pos-terminal-customers.ts |
| posQuickCreateKitchenCustomerAction | actions/pos-terminal-customers.ts |
| posCheckoutAction | actions/pos.ts |
| posCreateRegisterAction | actions/pos.ts |
| posCreateRegisterFormAction | actions/pos.ts |
| posOpenShiftAction | actions/pos.ts |
| posOpenShiftFormAction | actions/pos.ts |
| posCloseShiftAction | actions/pos.ts |
| posCloseShiftFormAction | actions/pos.ts |
| posRefundTransactionAction | actions/pos.ts |
| posVoidTransactionAction | actions/pos.ts |
| createTabAction | actions/pos/tabs.ts |
| addItemToTabAction | actions/pos/tabs.ts |
| closeTabAction | actions/pos/tabs.ts |
| createMappingSuggestionAction | actions/product-mapping.ts |
| updateProductMappingStatusVoid | actions/product-mapping.ts |
| approveMappingAction | actions/product-mapping.ts |
| rejectMappingAction | actions/product-mapping.ts |
| bulkApproveSafeAction | actions/product-mapping.ts |
| bulkArchiveAction | actions/product-mapping.ts |
| bulkIgnoreAction | actions/product-mapping.ts |
| createAliasAction | actions/product-mapping.ts |
| upsertModifierAction | actions/product-mapping.ts |
| createPlanTaskAction | actions/production-calendar.ts |
| movePlanTaskAction | actions/production-calendar.ts |
| fetchTodayQueueAction | actions/production-daily-queue.ts |
| updateProductionTask | actions/production.ts |
| bulkProductionUpdate | actions/production.ts |
| generateProductionMenuPrepFormAction | actions/production.ts |
| generateProductionOrdersFormAction | actions/production.ts |
| updateProductionWorkItemStatusFormAction | actions/production.ts |
| assignProductionWorkItemStaffFormAction | actions/production.ts |
| createProduct | actions/products.ts |
| updateProduct | actions/products.ts |
| updateProductImageFormAction | actions/products.ts |
| deleteProduct | actions/products.ts |
| reorderProducts | actions/products.ts |
| submitPurchaseOrderForApproval | actions/purchasing.ts |
| approvePurchaseOrder | actions/purchasing.ts |
| rejectPurchaseOrder | actions/purchasing.ts |
| bulkUpdatePricesAction | actions/purchasing/bulk-price.ts |
| undoBulkPricesAction | actions/purchasing/bulk-price.ts |
| saveReportAction | actions/reports.ts |
| deleteSavedReportAction | actions/reports.ts |
| duplicateSavedReportAction | actions/reports.ts |
| toggleSavedReportPinAction | actions/reports.ts |
| saveReportFormAction | actions/reports.ts |
| exportReportCsvAction | actions/reports.ts |
| createRestaurantTable | actions/restaurant/tables.ts |
| updateTablePosition | actions/restaurant/tables.ts |
| updateTableStatusAction | actions/restaurant/tables.ts |
| deleteRestaurantTable | actions/restaurant/tables.ts |
| submitAdvisoryBoardApplicationVoid | actions/scale.ts |
| submitAdvisoryBoardApplication | actions/scale.ts |
| saveWorkspaceIdentity | actions/settings-center.ts |
| saveBusinessHours | actions/settings-center.ts |
| saveOperationsSettings | actions/settings-center.ts |
| saveOrderSettings | actions/settings-center.ts |
| saveProductionSettings | actions/settings-center.ts |
| savePackingSettings | actions/settings-center.ts |
| saveDeliverySettings | actions/settings-center.ts |
| saveRouteSettings | actions/settings-center.ts |
| saveCrmSettings | actions/settings-center.ts |
| saveAiSettings | actions/settings-center.ts |
| saveAutomationSettings | actions/settings-center.ts |
| saveBackupsSettings | actions/settings-center.ts |
| saveComplianceSettings | actions/settings-center.ts |
| saveDeveloperSettings | actions/settings-center.ts |
| saveAdvancedSettings | actions/settings-center.ts |
| applyBusinessModePreset | actions/settings-center.ts |
| updateKitchenSettings | actions/settings.ts |
| createStaffMemberAction | actions/staff-member.ts |
| createStaffMemberFormAction | actions/staff-member.ts |
| createStaffAction | actions/staff.ts |
| updateStaffAction | actions/staff.ts |
| archiveStaffAction | actions/staff.ts |
| upsertRoleAction | actions/staff.ts |
| deactivateRoleAction | actions/staff.ts |
| saveAvailabilityAction | actions/staff.ts |
| createShiftAction | actions/staff.ts |
| updateShiftStatusAction | actions/staff.ts |
| upsertStaffCertificationAction | actions/staff.ts |
| revokeStaffCertificationAction | actions/staff.ts |
| upsertStorefrontRedirectAction | actions/storefront-advanced.ts |
| deleteStorefrontRedirectAction | actions/storefront-advanced.ts |
| upsertStorefrontFulfillmentRuleAction | actions/storefront-advanced.ts |
| deleteStorefrontFulfillmentRuleAction | actions/storefront-advanced.ts |
| createStorefrontTestOrderAction | actions/storefront-advanced.ts |
| purgeStorefrontTestOrdersAction | actions/storefront-advanced.ts |
| upsertStorefrontRedirectFormAction | actions/storefront-advanced.ts |
| deleteStorefrontRedirectFormAction | actions/storefront-advanced.ts |
| upsertStorefrontFulfillmentRuleFormAction | actions/storefront-advanced.ts |
| deleteStorefrontFulfillmentRuleFormAction | actions/storefront-advanced.ts |
| createStorefrontTestOrderFormAction | actions/storefront-advanced.ts |
| purgeStorefrontTestOrdersFormAction | actions/storefront-advanced.ts |
| createStorefrontBlackoutDate | actions/storefront-blackout.ts |
| createStorefrontBlackoutDateFormAction | actions/storefront-blackout.ts |
| deleteStorefrontBlackoutDate | actions/storefront-blackout.ts |
| deleteStorefrontBlackoutDateFormAction | actions/storefront-blackout.ts |
| upsertStorefrontVariantAction | actions/storefront-catalog-admin.ts |
| deleteStorefrontVariantAction | actions/storefront-catalog-admin.ts |
| upsertStorefrontModifierGroupAction | actions/storefront-catalog-admin.ts |
| deleteStorefrontModifierGroupAction | actions/storefront-catalog-admin.ts |
| addStorefrontModifierOptionAction | actions/storefront-catalog-admin.ts |
| deleteStorefrontModifierOptionAction | actions/storefront-catalog-admin.ts |
| setProductAvailabilityAction | actions/storefront-catalog-admin.ts |
| updateCheckoutExtensionsAction | actions/storefront-catalog-admin.ts |
| submitStorefrontContact | actions/storefront-contact.ts |
| createStorefrontDiscountAction | actions/storefront-discounts.ts |
| toggleStorefrontDiscountAction | actions/storefront-discounts.ts |
| deleteStorefrontDiscountAction | actions/storefront-discounts.ts |
| createStorefrontDiscountFormAction | actions/storefront-discounts.ts |
| toggleStorefrontDiscountFormAction | actions/storefront-discounts.ts |
| deleteStorefrontDiscountFormAction | actions/storefront-discounts.ts |
| verifyStorefrontDomainDnsAction | actions/storefront-domains.ts |
| refreshStorefrontDomainStatusAction | actions/storefront-domains.ts |
| updateStorefrontExperimentOpsSettings | actions/storefront-experiment-settings.ts |
| updateStorefrontExperimentOpsSettingsFormAction | actions/storefront-experiment-settings.ts |
| createStorefrontFormAction | actions/storefront-forms.ts |
| updateStorefrontFormAction | actions/storefront-forms.ts |
| linkStorefrontFormsAction | actions/storefront-forms.ts |
| markFormSubmissionReadAction | actions/storefront-forms.ts |
| archiveStorefrontFormAction | actions/storefront-forms.ts |
| submitPublicStorefrontForm | actions/storefront-forms.ts |
| submitPublicStorefrontFormFormAction | actions/storefront-forms.ts |
| createStorefrontFormFormAction | actions/storefront-forms.ts |
| updateStorefrontFormFormAction | actions/storefront-forms.ts |
| linkStorefrontFormsFormAction | actions/storefront-forms.ts |
| archiveStorefrontFormFormAction | actions/storefront-forms.ts |
| markFormSubmissionReadFormAction | actions/storefront-forms.ts |
| updateStorefrontMarketsAction | actions/storefront-markets.ts |
| seedDefaultMarketAction | actions/storefront-markets.ts |
| seedDefaultMarketFormAction | actions/storefront-markets.ts |
| uploadStorefrontMediaFormAction | actions/storefront-media.ts |
| deleteStorefrontMediaFormAction | actions/storefront-media.ts |
| setActiveAdminStorefrontAction | actions/storefront-multi-store.ts |
| createAdditionalStorefrontAction | actions/storefront-multi-store.ts |
| setPrimaryStorefrontAction | actions/storefront-multi-store.ts |
| listOwnerStorefrontsForDashboard | actions/storefront-multi-store.ts |
| updateStorefrontNavigationSettings | actions/storefront-navigation.ts |
| updateStorefrontNavigationSettingsFormAction | actions/storefront-navigation.ts |
| updateStorefrontFooterSettings | actions/storefront-navigation.ts |
| updateStorefrontFooterSettingsFormAction | actions/storefront-navigation.ts |
| submitPublicStorefrontOrder | actions/storefront-order.ts |
| createStorefrontPage | actions/storefront-pages.ts |
| createStorefrontPageFormAction | actions/storefront-pages.ts |
| deleteStorefrontPage | actions/storefront-pages.ts |
| updateStorefrontPageDetails | actions/storefront-pages.ts |
| updateStorefrontPageDetailsFormAction | actions/storefront-pages.ts |
| addStorefrontSection | actions/storefront-pages.ts |
| addStorefrontSectionFormAction | actions/storefront-pages.ts |
| duplicateStorefrontSection | actions/storefront-pages.ts |
| duplicateStorefrontSectionFormAction | actions/storefront-pages.ts |
| addStorefrontSectionPack | actions/storefront-pages.ts |
| addStorefrontSectionPackFormAction | actions/storefront-pages.ts |
| deleteStorefrontSection | actions/storefront-pages.ts |
| deleteStorefrontSectionFormAction | actions/storefront-pages.ts |
| moveStorefrontSection | actions/storefront-pages.ts |
| moveStorefrontSectionFormAction | actions/storefront-pages.ts |
| updateStorefrontSectionJson | actions/storefront-pages.ts |
| updateStorefrontSectionJsonFormAction | actions/storefront-pages.ts |
| updateStorefrontSectionContent | actions/storefront-pages.ts |
| updateStorefrontSectionContentFormAction | actions/storefront-pages.ts |
| deleteStorefrontPageFormAction | actions/storefront-pages.ts |
| copyStorefrontSectionLocalesFormAction | actions/storefront-pages.ts |
| copyStorefrontPageLocalesFormAction | actions/storefront-pages.ts |
| updateStorefrontThemeSettings | actions/storefront-pillar-settings.ts |
| updateStorefrontThemeSettingsFormAction | actions/storefront-pillar-settings.ts |
| updateStorefrontFulfillmentSettings | actions/storefront-pillar-settings.ts |
| updateStorefrontFulfillmentSettingsFormAction | actions/storefront-pillar-settings.ts |
| updateStorefrontOrderingSettings | actions/storefront-pillar-settings.ts |
| updateStorefrontOrderingSettingsFormAction | actions/storefront-pillar-settings.ts |
| updateStorefrontMarketingSettings | actions/storefront-pillar-settings.ts |
| updateStorefrontMarketingSettingsFormAction | actions/storefront-pillar-settings.ts |
| updateStorefrontSeoSettings | actions/storefront-pillar-settings.ts |
| updateStorefrontSeoSettingsFormAction | actions/storefront-pillar-settings.ts |
| updateStorefrontCustomDomainSettings | actions/storefront-pillar-settings.ts |
| updateStorefrontCustomDomainSettingsFormAction | actions/storefront-pillar-settings.ts |
| updateStorefrontProductFields | actions/storefront-product-public.ts |
| updateStorefrontProductFieldsFormAction | actions/storefront-product-public.ts |
| updateStorefrontRegionalSettings | actions/storefront-regional.ts |
| updateStorefrontRegionalSettingsFormAction | actions/storefront-regional.ts |
| upsertStorefrontSettings | actions/storefront-settings.ts |
| upsertStorefrontSettingsFormAction | actions/storefront-settings.ts |
| updateStorefrontBusinessSettings | actions/storefront-settings.ts |
| updateStorefrontBusinessSettingsFormAction | actions/storefront-settings.ts |
| setStorefrontActiveMenu | actions/storefront-settings.ts |
| setStorefrontActiveMenuFormAction | actions/storefront-settings.ts |
| updateStorefrontStaffPermissions | actions/storefront-settings.ts |
| updateStorefrontStaffPermissionsFormAction | actions/storefront-settings.ts |
| updateStorefrontThemeExperiment | actions/storefront-settings.ts |
| updateStorefrontThemeExperimentFormAction | actions/storefront-settings.ts |
| startStorefrontStripeConnectAction | actions/storefront-stripe-connect.ts |
| saveStorefrontTaxSettingsFormAction | actions/storefront-tax-settings.ts |
| saveStorefrontTaxSettings | actions/storefront-tax-settings.ts |
| applyStorefrontTaxPresetFormAction | actions/storefront-tax-settings.ts |
| inviteStorefrontTeamMemberAction | actions/storefront-team-invite.ts |
| cancelStorefrontTeamInviteAction | actions/storefront-team-invite.ts |
| removeStorefrontTeamMemberAction | actions/storefront-team-invite.ts |
| acceptStorefrontInviteByTokenAction | actions/storefront-team-invite.ts |
| updateStorefrontStaffAccessAction | actions/storefront-team.ts |
| retryThemeExperimentEdgeSyncAction | actions/storefront-theme-experiment.ts |
| retryThemeExperimentEdgeSyncFormAction | actions/storefront-theme-experiment.ts |
| concludeThemeExperimentAction | actions/storefront-theme-experiment.ts |
| concludeThemeExperimentFormAction | actions/storefront-theme-experiment.ts |
| applyExperimentWinnerAction | actions/storefront-theme-experiment.ts |
| applyStorefrontThemePreset | actions/storefront-theme-preset.ts |
| applyStorefrontThemePresetFormAction | actions/storefront-theme-preset.ts |
| publishStorefrontThemeFormAction | actions/storefront-theme-publish.ts |
| redeliverPagePublishWebhookFormAction | actions/storefront-webhook-delivery.ts |
| linkStorefrontToWorkspaceAction | actions/storefront-workspace.ts |
| linkStorefrontToBrandAction | actions/storefront-workspace.ts |
| createWorkspaceForStorefrontAction | actions/storefront-workspace.ts |
| createPickupWindowFormAction | actions/storefront/pickup-windows.ts |
| createPickupWindowAction | actions/storefront/pickup-windows.ts |
| assignSupportTicket | actions/support-tickets.ts |
| updateSupportTicketStatus | actions/support-tickets.ts |
| addSupportTicketComment | actions/support-tickets.ts |
| escalateSupportTicketAction | actions/support-tickets.ts |
| bulkAssignSupportTickets | actions/support-tickets.ts |
| submitDashboardSupportTicketForm | actions/support-tickets.ts |
| previewTemplateAction | actions/templates.ts |
| applyTemplateAction | actions/templates.ts |
| rollbackTemplateAction | actions/templates.ts |
| createProgramAction | actions/training.ts |
| assignProgramAction | actions/training.ts |
| recordProgressAction | actions/training.ts |
| submitQuizAction | actions/training.ts |
| issueCertificationAction | actions/training.ts |
| revokeCertificationAction | actions/training.ts |
| createSimulationAction | actions/training.ts |
| runSimulationAction | actions/training.ts |
| createSopAction | actions/training.ts |
| publishSopAction | actions/training.ts |
| archiveSopAction | actions/training.ts |
| acknowledgeSopAction | actions/training.ts |
| uploadProductImageAction | actions/upload.ts |
| uploadBusinessLogoAction | actions/upload.ts |
| replayWebhookEventAction | actions/webhook-replay.ts |

---

## Appendix D — Prisma models (330)

- UserProfile
- KitchenSettings
- KitchenModulePreference
- Menu
- Product
- Order
- OrderItem
- ProductionTask
- ProductionBatch
- ProductionWorkItem
- ProductionStation
- ProductionStagePreset
- ProductionWorkEvent
- ProductionTemplate
- Subscription
- BillingCustomer
- UsageCounter
- BillingEvent
- InvoiceRecord
- EntitlementOverride
- NotificationLog
- NotificationTemplate
- NotificationEvent
- NotificationPreference
- IntegrationConnection
- TrialState
- LifecycleEvent
- LifecycleEmail
- CancellationFeedback
- IntegrationHealthCheck
- ApiKey
- ExternalOrder
- ExternalProduct
- OrderChannel
- WebhookEvent
- WebhookProcessingJob
- ErrorRecoveryItem
- ChannelSyncJob
- ChannelSetupProgress
- ChannelCredentialAudit
- ChannelImportBatch
- ChannelImportRecord
- ChannelConflict
- ChannelRule
- ChannelImportRollback
- ChannelRetryAttempt
- DeliveryDispatch
- MenuChannelPublish
- BetaApplication
- BetaCohort
- BetaLead
- BetaInvitation
- BetaFeedback
- BetaLeadNote
- DemoRequest
- AppFeedback
- OnboardingCall
- UsageEvent
- ActivationState
- ReferralCode
- ReferralEvent
- OutreachCampaign
- CustomerHealthSnapshot
- ReleaseNote
- UserTourState
- Location
- LocationAssignmentEvent
- StorefrontSettings
- StorefrontTeamInvite
- StorefrontTeamInviteEvent
- StorefrontEdgeSyncJob
- StorefrontExperimentAuditEvent
- StorefrontCartRecovery
- StorefrontPage
- StorefrontSection
- StorefrontTheme
- StorefrontOrder
- StorefrontOrderItem
- StorefrontContactSubmission
- StorefrontDomain
- StorefrontVisit
- StorefrontConversionEvent
- StorefrontBlackoutDate
- StorefrontDiscount
- StorefrontRedirect
- StorefrontForm
- StorefrontFormSubmission
- StorefrontMenuPublish
- StorefrontNavigation
- StorefrontFooter
- StorefrontFulfillmentRule
- StorefrontAsset
- ProductAvailability
- StorefrontProductVariant
- StorefrontModifierGroup
- StorefrontModifierOption
- StorefrontCustomer
- MenuTemplate
- Ingredient
- Recipe
- RecipeSubRecipe
- RecipeIngredient
- CostSnapshot
- CostingRun
- ProfitabilityLine
- CostComponent
- LaborRate
- PackagingItem
- ProductPackagingRule
- ChannelFeeRule
- MarginRule
- PriceScenario
- IngredientDemandLine
- IngredientDemandRun
- IngredientDemandRunLine
- InventoryStock
- WasteEvent
- InventoryCount
- InventoryCountItem
- IngredientLot
- TimeEntry
- TemperatureLog
- FoodSafetyChecklist
- FoodSafetyChecklistItem
- FoodSafetyAudit
- FoodSafetyAuditResponse
- SupplierInvoice
- SupplierInvoiceLine
- OperationsChecklist
- OperationsChecklistItem
- OperationsAudit
- OperationsAuditResponse
- DoorDashDelivery
- GrubhubDelivery
- BankTransaction
- Franchise
- CashCount
- CommissaryTransfer
- CommissaryTransferLine
- ProductionPlanTask
- LoyaltyProgram
- LoyaltyAccount
- LoyaltyTransaction
- GiftCard
- IngredientSubstitution
- Supplier
- SupplierItem
- PurchaseOrder
- PurchaseOrderLine
- ReorderQueueItem
- ReceivingEvent
- SupplierPriceHistory
- PurchaseApprovalEvent
- NutritionProfile
- AllergenProfile
- IngredientDeclaration
- LabelVerificationEvent
- StaffMember
- StaffRole
- StaffAvailability
- StaffShift
- StaffCertification
- StaffEvent
- KitchenTask
- KitchenTaskComment
- KitchenTaskEvent
- KitchenTaskTemplate
- KitchenTaskDependency
- KitchenTaskRecurrence
- KitchenCustomer
- CustomerAddress
- CustomerNote
- CustomerTimelineEvent
- CustomerSegment
- CustomerSegmentMembership
- CustomerMergeCandidate
- CustomerFollowUp
- CustomerConsentEvent
- CompanyAccount
- CustomerSubscription
- CateringQuote
- CateringQuoteItem
- CateringQuotePackage
- CateringQuoteEvent
- CateringQuoteVersion
- CateringProposalView
- CateringQuoteFollowUp
- CateringQuoteTemplate
- DeliveryRoute
- DeliveryStop
- DeliveryZone
- DriverProfile
- DeliveryEvent
- PackingEvent
- PackingBatch
- PackingWave
- PackingTask
- LabelTemplate
- PrintedLabel
- PackingVerificationEvent
- PackingVerificationSession
- PackingVerificationItem
- PackingQcEvent
- PackingVerificationOverride
- PackingScanEvent
- NotificationRule
- ImplementationProject
- ImplementationPhase
- ImplementationChecklistItem
- ImplementationEvent
- GoLiveReadinessCheck
- ImplementationTask
- ImportJob
- ImportRowError
- ImportJobPreviewRow
- ImportRollback
- ExportJob
- DataTemplate
- ImportMappingTemplate
- ProductMapping
- ProductMappingAlias
- ProductModifierMapping
- ProductMappingEvent
- ProductMappingImportBatch
- CustomerMergeEvent
- StagedOrderImport
- GoLiveTestRun
- GoLiveProject
- GoLiveChecklistItem
- GoLiveSimulation
- GoLiveApproval
- GoLiveIncident
- GoLiveRollbackPlan
- GoLiveProjectEvent
- TrainingProgram
- TrainingModule
- TrainingLesson
- TrainingQuiz
- TrainingQuizAttempt
- TrainingAssignment
- TrainingProgress
- TrainingCertification
- TrainingSimulation
- TrainingSimulationRun
- TrainingIncidentDrill
- SOPDocument
- SOPAcknowledgement
- TrainingEvent
- PartnerAccount
- PartnerMember
- PartnerClient
- PartnerRevenue
- PartnerManagedTicket
- PartnerReferral
- PartnerCommissionPlaceholder
- Organization
- OrganizationMember
- Workspace
- WorkspaceMember
- Brand
- AuditRetentionPolicy
- AuditExport
- AuditLog
- SupportTicket
- SupportTicketComment
- SupportTicketEvent
- SupportSlaPolicy
- SupportSavedView
- SupportMacro
- PartnerLead
- SalesInquiry
- ImplementationStakeholder
- ImplementationWave
- ImplementationRisk
- ImplementationSignoff
- AdvisoryBoardApplication
- AutomationRule
- AutomationTrigger
- AutomationAction
- AutomationExecution
- PlatformUserRole
- ImpersonationSession
- PlatformSupportSession
- InternalNote
- FeatureFlag
- WorkspaceFeatureOverride
- MealPlan
- MealPlanCycle
- MealPlanSelection
- MealPlanEvent
- MealPlanTemplate
- AnalyticsSnapshot
- AnalyticsEvent
- AnalyticsSavedView
- AnalyticsAlert
- ForecastRun
- ForecastLine
- ForecastAdjustment
- ForecastEvent
- SavedReport
- ExecutiveSnapshot
- ExecutiveInsight
- CopilotInsight
- CopilotConversation
- CopilotMessage
- CopilotActionDraft
- CopilotAuditEvent
- Playbook
- PlaybookStep
- PlaybookRun
- PlaybookRunStep
- PlaybookEvent
- WorkspaceTemplate
- TemplateApplication
- TemplateApplicationEvent
- CopilotSettings
- POSTerminal
- POSRegister
- POSShift
- POSCart
- POSTransaction
- POSPayment
- POSReceipt
- POSHeldOrder
- POSAuditEvent
- PosInventoryImpactEvent
- RestaurantTable
- PosTab
- PosTabItem
- PickupWindow
# OS Kitchen — Full System Audit Report

**Document:** `docs/fullreport25may.md`  
**Date:** 2026-05-25  
**Workspace:** `OS Kitchen`  
**Audit mode:** static code and configuration audit, route map audit, architecture audit, operational audit, SEO/GTM audit, security and scale review  
**Primary lens:** engineering, architecture, product operations, SEO, GTM, DevOps, audit-readiness  

---

## 1. Audit Purpose

This report is designed as a **transfer-grade audit artifact** that can be handed to:

- engineering teams,
- external auditors,
- DevOps / SRE teams,
- security reviewers,
- SEO and content teams,
- growth / GTM teams,
- product managers,
- delivery and implementation teams.

The goal is not only to say "what exists", but to document:

- how the system is structured,
- how core chains actually work,
- how pages, actions, services, and Prisma models connect,
- where the strongest implementation patterns already exist,
- where the main technical, operational, product, SEO, and governance risks still remain.

This report is intentionally **broad and deep**. It covers architecture, runtime flows, page taxonomy, backend logic, database patterns, security posture, deployment posture, observability, testing posture, SEO/GTM surface, and prioritized gaps.

---

## 2. Scope And Methodology

### 2.1 What this audit is based on

This report was assembled from:

- direct inspection of key production codepaths,
- repository structure and route inventory analysis,
- direct review of `package.json`, `next.config.ts`, `middleware.ts`, `vercel.json`, deployment scripts, Prisma schema, auth flows, public/storefront flows, webhook flows, cron flows, and representative dashboard flows,
- current internal audit artifacts:
  - `docs/ultimate-audit-24may2026.md`
  - `docs/audit-full-functions-map.md`
- current repository metrics generated from the codebase itself.

### 2.2 Important limitation

This is a **code and configuration audit**, not a live database dump or cloud-console audit.  
That means:

- it is very strong for architecture, flow logic, code quality, security posture, coupling, maintainability, test posture, SEO implementation, and release posture;
- it is weaker for real production traffic distribution, actual conversion rates, real cloud cost data, true DB size, actual Redis load, or real incident frequency unless those are encoded in the repo or health interfaces.

### 2.3 Evidence standard

Whenever possible, conclusions in this report are grounded in real files, real functions, or real chains such as:

- `app/layout.tsx`
- `middleware.ts`
- `app/dashboard/layout.tsx`
- `lib/scope/cached-tenant.ts`
- `lib/permissions/require-workspace-permission.ts`
- `actions/storefront-order.ts`
- `services/orders/order-creation-service.ts`
- `services/pos/pos-checkout-service.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/webhooks/uber-eats/orders/route.ts`
- `services/cron/production-manifest.ts`
- `app/api/cron/webhook-jobs/route.ts`
- `app/sitemap.ts`
- `app/robots.ts`
- `scripts/deploy-prebuilt-prod.sh`

---

## 3. Executive Summary

OS Kitchen is a **large, production-shaped, business-domain-heavy Next.js 15 monolith** for food operators: meal prep, catering, ghost kitchen, multi-brand, POS, KDS, production, packing, storefront ordering, channel integrations, CRM, billing, pilot operations, and internal platform administration.

The codebase shows clear signs of **real production ambition**:

- very wide route surface,
- explicit separation of marketing, dashboard, platform, and storefront,
- deep service-layer decomposition,
- a mature Prisma schema,
- deployment scripts that encode hard-earned operational knowledge,
- real cron governance,
- real webhook ingestion,
- nontrivial testing,
- strong product breadth.

At the same time, the repo also shows the cost of speed and scale:

- long-running migration from `userId` scoping to `workspaceId`,
- dual permission concepts in some areas,
- mixed "new centralized path" vs "legacy direct write path" patterns,
- operational clutter around build artifacts, multiple env-specific scripts, and experimental cron/webhook surfaces,
- security and data-governance inconsistencies in a few legacy flows.

### 3.1 Bottom-line assessment

**Overall technical posture:** strong  
**Overall architectural maturity:** strong  
**Overall product breadth:** very strong  
**Overall operational maturity:** strong but complex  
**Overall security posture:** good foundation, but not yet uniform  
**Overall SEO/GTM posture:** materially stronger than typical internal tools, but still not fully evidence-hardened  
**Overall audit-readiness:** high for internal engineering review, medium-high for external formal audit, pending cleanup of several governance inconsistencies

### 3.2 Key strengths

1. The app is not a thin demo. It has genuine operational depth across orders, POS, storefront, CRM, production, packing, billing, pilot, and admin surfaces.
2. The architecture has recognizable control points: tenant actor resolution, workspace permission resolution, cron allowlisting, health checks, payment readiness checks, lifecycle guards, and service-layer orchestration.
3. Storefront checkout is materially more mature than a typical small SaaS checkout path. It includes validation, rate limiting, anti-bot, shipping/tax logic, fulfillment rule evaluation, duplicate suppression, and optional Stripe flows.
4. POS is modeled as a real operational chain, not just a UI form. It creates orders, POS transactions, payments, receipts, audit events, kitchen routing, inventory impact events, CRM sync, and loyalty handling.
5. Deployment logic acknowledges actual platform constraints, especially Vercel build memory pressure, and provides a repeatable prebuilt deployment path.

### 3.3 Highest-priority gaps

1. **PII-at-rest consistency is not uniform.** The centralized order creation path encrypts order PII, but some legacy order creation paths still write directly.
2. **API safety depends heavily on route-local discipline.** `/api/*` is intentionally exempt from middleware session gating, so every new route must self-guard correctly.
3. **Rate limiting can silently downgrade to per-instance memory mode** when distributed backend config is absent or incorrect.
4. **Workspace migration is still visibly in progress.** The codebase still carries `userId`, `dataUserId`, and `workspaceId` in parallel in many places.
5. **Operational footprint is very large.** The number of cron directories, scripts, pilot/release helpers, and experimental surfaces raises maintenance burden and audit complexity.

---

## 4. Repository Metrics Snapshot

The following metrics were derived from the current repository:

### 4.1 Core size metrics

- `app/**/page.tsx`: **689**
- `app/dashboard/**/page.tsx`: **522**
- `app/platform/**/page.tsx`: **47**
- `app/s/**/page.tsx`: **20**
- `app/**/loading.tsx`: **499**
- `app/**/error.tsx`: **495**
- `app/api/**/route.ts`: **295**
- `app/api/webhooks/**/route.ts`: **46**
- `app/api/cron/*`: **136 directories**
- `actions/**/*.ts`: **141 files**
- exported action functions in `actions/`: **677**
- `services/**/*.ts`: **562**
- `components/**/*.ts/tsx`: **732**
- `lib/**/*.ts/tsx`: **1084**
- Prisma models: **358**
- Prisma enums: **266**
- Prisma migrations: **121**

### 4.2 What this means

This is not a small app. It is a large monolith with:

- a broad route surface,
- domain-heavy data model depth,
- multi-surface product positioning,
- significant operational automation,
- high audit surface area.

This scale has two implications:

1. OS Kitchen already has enough surface area to function as a serious operational platform.
2. The cost of inconsistency is high; anything not standardized will multiply fast.

---

## 5. Product Surface Inventory

### 5.1 Top-level route categories

From current route counts:

- `dashboard`: **522 pages**
- `platform`: **47 pages**
- `s` storefront: **20 pages**
- `help`: **12 pages**
- `integrations`: **9 pages**
- `resources`: **7 pages**
- `blog`: **7 pages**
- `legal`: **7 pages**
- `partner`: **5 pages**
- `support`: **4 pages**
- `markets`: **4 pages**
- `visual-test`: **4 pages**
- `product`: **3 pages**
- `developers`: **3 pages**
- `customers`: **2 pages**
- `demo`: **2 pages**
- `lp`: **2 pages**
- `solutions`: **2 pages**
- `compare`: **2 pages**
- `trust`: **2 pages**

### 5.2 What these surfaces represent

The application is effectively split into four macro-products:

1. **Public / marketing / SEO layer**
   - landing pages,
   - solution pages,
   - comparison pages,
   - integration SEO pages,
   - blog/resources/legal/trust pages,
   - Google Ads landing pages.

2. **Operator dashboard**
   - internal business operations workspace,
   - majority of product value surface,
   - orders, POS, KDS, production, packing, storefront admin, CRM, billing, integrations, reporting, staff, inventory, purchasing, growth, analytics.

3. **Public storefront**
   - customer-facing commerce surface,
   - catalog, cart, checkout, order lookup, domain/slug-based storefront.

4. **Platform admin**
   - internal super-admin / support / founder tooling,
   - internal-only navigation and privilege-gated operational pages.

This segmentation is architecturally good. It matches user roles and business workflows.

---

## 6. Top-Level Architecture

### 6.1 Runtime shape

At a high level, the system works like this:

```text
Marketing / Public pages
Dashboard / Platform pages
Storefront / Customer commerce
        ->
App Router pages + layouts + middleware
        ->
Server Actions and API routes
        ->
Services / lib domain orchestration
        ->
Prisma
        ->
PostgreSQL (Supabase)
        ->
External systems (Stripe, Resend, Redis, analytics, integrations)
```

### 6.2 Architectural layers in practice

#### Presentation layer

- App Router pages and layouts in `app/`
- large component library in `components/`
- dashboard shell and workspace chrome
- storefront rendering and checkout UX
- platform admin chrome

#### Request control layer

- `middleware.ts`
- `lib/supabase/middleware.ts`
- `lib/api/middleware-api-auth.ts`
- `lib/api/with-api-guard.ts`
- route-local guards for public API, webhooks, crons, platform access

#### Domain control layer

- `actions/` for dashboard and interactive mutations
- `services/` for operational logic
- `lib/` for shared runtime helpers, validation, auth, security, analytics, SEO, domain rules

#### Data layer

- `prisma/schema.prisma`
- Prisma client in `lib/prisma.ts`
- DB health, query batching, and scoped where-builders

#### Infra and ops layer

- `vercel.json`
- deployment scripts
- observability bootstrapping
- cron governance
- health endpoints
- staging/pilot/release scripts

### 6.3 Architecture verdict

This is a **monolith**, but not a naive monolith.  
It is a **structured domain monolith** with real subdomains and runtime controls.

That is a good fit for the current product stage because:

- product coordination is still tight,
- cross-domain workflows are numerous,
- database transactions matter,
- the team benefits more from shared types and shared code than from premature service extraction.

The main architectural risk is not "monolith vs microservices".  
The main risk is **pattern drift inside a large monolith**.

---

## 7. Repository Structure Audit

### 7.1 Important top-level directories

- `app/` — routing, pages, API handlers, metadata routes
- `actions/` — server actions
- `components/` — UI and feature components
- `services/` — domain and integration services
- `lib/` — shared runtime helpers and domain infrastructure
- `prisma/` — schema, migrations, seeds, SQL helpers
- `scripts/` — deployment, audits, smoke checks, migrations, ops automation
- `tests/` and `e2e/` — unit, integration, visual, and E2E coverage
- `supabase/` — SQL / RLS support assets
- `docs/` — substantial internal documentation estate

### 7.2 Structure quality

The structure is generally strong:

- code is separated by concern,
- domain folders are visible,
- services and libs are not mixed into one flat namespace,
- product surfaces are discoverable from route structure.

### 7.3 Structure complexity

The main complexity driver is not folder chaos.  
It is **business-domain breadth plus historical iteration speed**.

Visible signs:

- many workspace migration scripts,
- many ops and pilot scripts,
- large number of cron and experiment surfaces,
- duplicate / alternate config artifacts in root such as `vercel 2.json`, `vercel 3.json`,
- build trash management in deployment scripts,
- broad `lib/` surface that now acts as both shared infra and domain toolkit.

Recommendation:

- keep the monolith,
- but progressively harden "blessed paths" and deprecate direct/legacy alternatives.

---

## 8. Tenant, Session, Workspace, And Permissions Model

This is one of the most important architectural areas in the entire system.

### 8.1 Session model

Auth is Supabase-backed.

Core entrypoints:

- `lib/auth.ts`
- `actions/auth.ts`
- `app/auth/callback/route.ts`
- `lib/supabase/middleware.ts`

Session flow:

1. user signs in or signs up through Supabase,
2. callback finalizes session,
3. `ensureAppUser()` provisions or syncs local app state,
4. profile, subscription, workspace, kitchen settings, activation state, and platform bootstrap are ensured,
5. middleware routes users to login/dashboard/platform/onboarding as appropriate.

### 8.2 Tenant actor pattern

Core files:

- `lib/scope/require-tenant-actor.ts`
- `lib/scope/cached-tenant.ts`

This is a good pattern.

The system resolves:

- session user,
- owner data user,
- primary workspace id.

Returned shape:

- `sessionUser`
- `sessionUserId`
- `userId`
- `dataUserId` (deprecated alias)
- `workspaceId`

This is extremely important because it decouples:

- who is authenticated,
- which owner dataset they operate on,
- which workspace is the operational container.

### 8.3 Workspace permissions

Core files:

- `lib/permissions/require-workspace-permission.ts`
- `lib/permissions/resolve-ui-permissions.ts`
- `services/permissions/permission-service.ts`

The permission flow is:

1. resolve tenant actor,
2. load user profile role,
3. optionally load linked `staffMember`,
4. compute permission context,
5. resolve granted workspace permissions,
6. gate UI and mutations.

This is a solid modern pattern.

### 8.4 Current weakness in this area

The codebase still carries evidence of a migration-era mixed model:

- `userId`
- `dataUserId`
- `workspaceId`
- legacy role fallbacks
- newer workspace permission sets

This is not fatal, but it is a major audit theme:

- the **design direction is correct**,
- the **migration is not fully complete**.

### 8.5 Assessment

**Strength:** strong  
**Risk:** medium  
**Reason:** the model is good, but consistency is not yet absolute across all legacy paths.

---

## 9. Middleware And Request Control

### 9.1 Root middleware

`middleware.ts` is doing real work, not just auth decoration.

It handles:

- session updating,
- dashboard/platform/onboarding/login redirects via `updateSession()`,
- API session enforcement hook,
- storefront slug/domain rewriting,
- vanity domain resolution,
- locale stripping and rewrite,
- storefront redirect resolution,
- brand context propagation,
- cache tag stamping,
- preview signaling,
- storefront theme experiment middleware.

### 9.2 Middleware design quality

This middleware is powerful and business-aware.

It acts as a traffic router for:

- app-domain traffic,
- vanity domain storefront traffic,
- preview traffic,
- localized storefront paths,
- brand-context storefront paths.

That is a strength because it centralizes request-shape normalization.

### 9.3 Important caveat

`lib/api/is-api-auth-exempt.ts` explicitly exempts:

- `/api/webhooks/*`
- `/api/cron/*`
- `/api/public/*`
- `/api/storefront/*`
- `/api/health`
- `/api/invite/*`

This means:

- API safety is intentionally **route-local**, not globally middleware-enforced.

This is not wrong, but it is high-risk operationally because:

- every new API route must remember to self-guard,
- exemptions are broad,
- inconsistency can creep in over time.

### 9.4 Audit conclusion on request control

**Request routing sophistication:** high  
**Auth consistency risk:** medium-high  
**Reason:** middleware itself is capable, but the `/api/*` security model relies on careful local implementation discipline.

---

## 10. Detailed Page Surface Audit

### 10.1 Dashboard module footprint

Largest dashboard domains by page count:

- `storefront` — 41
- `settings` — 32
- `implementation` — 24
- `sales-channels` — 21
- `locations` — 20
- `growth` — 17
- `customers` — 16
- `developer` — 14
- `reports` — 14
- `training` — 13
- `integrations` — 13
- `routes` — 13
- `analytics` — 13
- `meal-plans` — 12
- `costing` — 12
- `staff` — 12
- `product-mapping` — 12
- `tasks` — 11
- `playbooks` — 11
- `pos` — 11
- `catering-quotes` — 11
- `billing` — 11

### 10.2 What this says about the product

This is not "just POS" and not "just storefront".

The product is trying to be a full operational operating system for food businesses:

- commerce,
- production,
- internal operations,
- staff,
- procurement,
- analytics,
- implementation,
- training,
- GTM growth tooling,
- compliance and audit logs,
- platform admin.

### 10.3 Platform pages

`/platform/*` is clearly a separate internal plane with:

- its own layout,
- its own permission model,
- internal labeling,
- support and impersonation tooling,
- environment context in UI,
- internal-only navigation.

This is a sign of maturity. Many teams never build this layer early enough.

### 10.4 Public storefront pages

The storefront is not a single static landing page. It is a commerce surface with:

- slug-based public entry,
- checkout,
- order lookup,
- domain mapping,
- market-specific context,
- brand context,
- SEO metadata,
- checkout payment readiness,
- recovery and remarketing hooks.

### 10.5 Public marketing surface

Marketing is unusually rich for an internal-heavy operational product:

- solution pages,
- product pages,
- compare pages,
- developer pages,
- integration pages,
- trust/legal pages,
- blog/resources,
- demo/customer/case-study style pages,
- Google Ads landing pages,
- geo/location pages.

That is a strong GTM sign, but it must be backed by truthful, continuously verified claims.

---

## 11. Core End-To-End Chains

This section is the most important for external handoff because it explains how the system actually works.

### 11.1 Chain A — signup -> user bootstrap -> workspace bootstrap -> onboarding

Primary files:

- `actions/auth.ts`
- `lib/auth.ts`
- `app/auth/callback/route.ts`
- `app/onboarding/page.tsx`
- `components/onboarding/onboarding-wizard.tsx`

Flow:

1. User submits signup form.
2. `signUpAction()` validates email/password/full name/company data.
3. Supabase creates auth identity.
4. `ensureAppUser()` runs.
5. `ensureAppUser()` upserts:
   - `userProfile`
   - `subscription`
   - `kitchenSettings`
   - `activationState`
   - platform-owner bootstrap
   - pending storefront invite acceptance
6. auth callback finalizes session and redirects.
7. middleware/layout logic redirects incomplete users to `/onboarding`.
8. onboarding flow resolves adaptive business-type-specific wizard steps.
9. wizard persists business profile, operating model, channels, modules, and optional demo/import choices.

Assessment:

- good provisioning story,
- good early lifecycle automation,
- good onboarding adaptability,
- strong for reducing cold-start friction.

Risk:

- bootstrap is doing a lot in one helper; great leverage, but important to keep idempotent and observable.

### 11.2 Chain B — dashboard request -> tenant actor -> permissions -> shell -> module gate

Primary files:

- `app/dashboard/layout.tsx`
- `lib/scope/cached-tenant.ts`
- `lib/permissions/require-workspace-permission.ts`
- `lib/permissions/resolve-ui-permissions.ts`
- `components/dashboard/dashboard-shell.tsx`

Flow:

1. user hits any dashboard route,
2. middleware refreshes session,
3. `getTenantActor()` resolves session user, owner data user, workspace id,
4. `ensureAppUser()` guarantees app bootstrap exists,
5. dashboard layout loads profile, kitchen settings, workspace, billing access,
6. workspace UI permissions are resolved,
7. disabled modules are loaded,
8. `DashboardShell` renders adaptive nav, command palette, brand switching, account/billing/support affordances,
9. `ModuleRouteGate` blocks hidden or not-yet-released routes.

Assessment:

- strong and coherent,
- good place for cross-cutting UI policy,
- good extensibility for role-based UI.

Risk:

- dashboard shell now carries significant responsibility and should remain one of the most protected regression surfaces.

### 11.3 Chain C — manual dashboard order creation

Primary files:

- `actions/orders.ts`
- `lib/permissions/mutation-access`
- `lib/workflows/order-lifecycle-rules.ts`
- CRM recompute services

Flow:

1. mutation permission `orders.manage` is required,
2. plan limits are checked,
3. form lines are extracted and validated,
4. active menu is resolved,
5. selected products are validated against active menu,
6. total is computed,
7. order is created,
8. confirmation email optionally sends,
9. CRM customer upsert runs,
10. customer metrics recompute runs,
11. push notification fires,
12. relevant dashboard routes are revalidated.

Strength:

- permission gating,
- plan enforcement,
- menu consistency validation,
- side effects wired into CRM/notifications.

Finding:

- this path still creates orders directly instead of routing through the centralized order-creation service.
- that creates consistency risk, especially for PII-at-rest and future order invariants.

### 11.4 Chain D — order detail read model

Primary files:

- `services/orders/order-detail-service.ts`
- `services/workflows/order-lifecycle-service.ts`
- workflow services

Flow:

1. scoped owned-order lookup is performed,
2. order is loaded with rich includes:
   - order items,
   - customer,
   - external channel linkage,
   - production work items,
   - packing tasks,
   - delivery stops,
   - POS transaction snapshot,
3. order PII is decrypted,
4. activity feed is loaded,
5. channel mapping conflicts are counted,
6. storefront commerce details are loaded when applicable,
7. blockers are computed,
8. lifecycle view is built,
9. allowed transitions are computed,
10. next best action is generated,
11. foodops workflow view is built.

Assessment:

- excellent read-model design,
- strong operator UX support,
- very good example of service-layer orchestration.

### 11.5 Chain E — order lifecycle transition

Primary files:

- `actions/orders.ts`
- `lib/workflows/order-lifecycle-rules.ts`
- `services/workflows/order-lifecycle-service.ts`

Flow:

1. fetch scoped order,
2. validate target enum,
3. build lifecycle snapshot,
4. validate transition hop,
5. enforce data prerequisites:
   - non-empty items,
   - required pickup/service date,
   - delivery address presence,
   - payment status before completion,
6. write new order status,
7. write audit event,
8. recompute CRM metrics on completion,
9. send ready notifications when relevant,
10. revalidate dashboards.

Assessment:

- very strong pattern,
- lifecycle rules are explicit and reusable,
- one of the best controlled business flows in the codebase.

### 11.6 Chain F — POS checkout

Primary files:

- `app/dashboard/pos/page.tsx`
- `services/pos/pos-checkout-service.ts`
- `services/orders/order-creation-service.ts`

Flow:

1. feature gate checks whether POS is available for plan,
2. manager-only logic applies for comped sales,
3. register and shift are validated,
4. gift card and loyalty redemption can alter discount,
5. an `OrderCreateInput` is assembled,
6. centralized `createOrderViaCenter()` is called,
7. created order is reloaded,
8. subtotal/tax/discount/total are normalized,
9. receipt number and receipt text are generated,
10. transaction, payment, receipt, and POS audit rows are written inside a DB transaction,
11. business audit events are emitted,
12. analytics logs,
13. kitchen routing,
14. inventory impacts,
15. CRM sync,
16. loyalty earn.

Assessment:

- this is a very strong, production-realistic POS chain,
- good use of centralized order creation,
- good post-checkout fan-out into downstream systems.

### 11.7 Chain G — centralized order creation service

Primary files:

- `services/orders/order-creation-service.ts`
- `lib/orders/order-pii.ts`

Flow:

1. plan limits are enforced,
2. order mode is resolved,
3. status/fulfillment/payment compatibility is enforced,
4. customer is resolved or synthesized,
5. lines are priced against product catalog or custom items,
6. total math is normalized,
7. workspace id is resolved,
8. order PII is encrypted via `encryptOrderPiiFields()`,
9. order and items are created,
10. audit entry is written,
11. CRM/metrics side effects run,
12. loyalty can be earned for storefront orders.

Assessment:

- this should become the **canonical path** for all order creation.

Finding:

- not all order creation flows use this yet.

### 11.8 Chain H — storefront browse -> cart -> checkout -> order submit

Primary files:

- `app/s/[storeSlug]/page.tsx`
- `app/s/[storeSlug]/checkout/page.tsx`
- `components/storefront/store-checkout-client.tsx`
- `app/api/storefront/cart/route.ts`
- `actions/storefront-order.ts`

Flow:

1. middleware resolves slug/domain/market/brand context,
2. public storefront is loaded with locale and closure-window awareness,
3. sections are rendered for public home,
4. checkout page loads catalog, kitchen tax settings, payment readiness, pickup windows,
5. client cart computes line totals, shipping quote, tax, tips, market context,
6. server cart API supports GET/PATCH/POST/DELETE with rate limiting and price-version synchronization,
7. checkout submit path validates:
   - payload schema,
   - honeypot field,
   - rate limit,
   - Turnstile token,
   - storefront enabled/published/preorder state,
   - cutoff window,
   - daily max orders,
   - market/menu consistency,
   - sold-out protection,
   - duplicate suppression,
   - pickup window validity,
   - blackout dates,
   - delivery eligibility,
   - fulfillment rule engine,
   - minimum order amount,
   - payment readiness,
   - promo logic,
   - shipping and tax,
8. order is finalized,
9. Stripe checkout may be created if online payment is selected,
10. cart recovery is marked converted,
11. CRM and email paths are updated,
12. client redirects to Stripe or storefront order confirmation.

Assessment:

- strongest commerce flow in the repo,
- very auditable,
- clearly evolved with real operational edge cases in mind.

### 11.9 Chain I — public enterprise API

Primary files:

- `lib/api-public/guard.ts`
- `app/api/public/v1/orders/route.ts`

Flow:

1. bearer token is resolved to enterprise user,
2. client IP is used for rate limiting,
3. request body is validated,
4. owner workspace is resolved,
5. order row is created,
6. CRM upsert and metrics recompute run.

Assessment:

- the public API exists and is real, which is a product strength.

Finding:

- not all public API routes use the shared guard helper consistently.
- the shown order route creates the DB row directly instead of reusing the centralized order creation service.

### 11.10 Chain J — webhook ingress

Primary files:

- `app/api/webhooks/stripe/route.ts`
- `app/api/webhooks/uber-eats/orders/route.ts`
- `lib/webhooks/webhook-event-store.ts`

Flow:

1. provider route receives raw body,
2. route resolves signature secret,
3. signature is verified,
4. webhook event row is created with dedup protection,
5. duplicates short-circuit,
6. invalid signatures are rejected and marked,
7. valid events route into provider-specific processing.

Assessment:

- current Stripe path is solid,
- current Uber Eats path is materially better than the older audit state because signature validation is now present,
- dedup logic with composite lookup is also improved.

### 11.11 Chain K — cron execution

Primary files:

- `services/cron/production-manifest.ts`
- `vercel.json`
- `app/api/cron/webhook-jobs/route.ts`
- `lib/api/run-cron.ts`

Flow:

1. Vercel schedules only allowlisted cron paths,
2. route requires `CRON_SECRET` auth,
3. cron logic executes bounded work,
4. duration and batch stats are emitted,
5. production allowlist separates scheduled production jobs from experimental cron surface.

Assessment:

- good governance pattern,
- strong from a platform-safety perspective.

Risk:

- the on-disk cron surface is much larger than the production allowlist and increases audit overhead.

---

## 12. Frontend Engineering Audit

### 12.1 Strengths

- Strong App Router adoption.
- Good use of colocated `loading.tsx` and `error.tsx`.
- Clear dashboard chrome and adaptive nav model.
- Public marketing surface has metadata discipline.
- Storefront checkout is reasonably advanced.
- Onboarding wizard is adaptive, not static.
- Client analytics and web vitals instrumentation exist.

### 12.2 Observations

- `DashboardShell` is a major UI integration point; it now carries business mode, owner/platform state, command palette routes, support links, brand context, billing state, and mobile/desktop nav.
- The public landing page composition is well structured and conversion-oriented.
- The storefront checkout client is doing a lot of client orchestration but still hands off core business validation server-side, which is the correct balance.

### 12.3 Risks

- Some client surfaces are very heavy responsibility hubs; regression risk is concentrated in a few shells and core clients.
- The UI surface is so broad that visual regression coverage will need continuous expansion to keep up.
- A lot of product breadth means UX coherence can drift if design-system enforcement weakens.

### 12.4 Verdict

**Frontend maturity:** high  
**Frontend surface complexity:** very high  
**Biggest need:** ongoing standardization and regression protection

---

## 13. Backend Engineering Audit

### 13.1 Strengths

- Service-oriented domain logic without premature service extraction.
- Strong use of validation and guard layers.
- Business rules are frequently explicit rather than implicit.
- Clear use of revalidation after mutations.
- Solid provider-specific webhook handling patterns.
- Good separation of read models, workflow views, and mutation flows in some domains.

### 13.2 Weaknesses

- Not all flows use shared canonical services yet.
- Some direct Prisma writes remain in route/action handlers.
- Several areas duplicate auth/rate-limit/guard logic manually.
- Legacy and modern patterns coexist.

### 13.3 Important engineering conclusion

The system is already good enough that the next leap in quality is not "add more features".  
It is:

- centralize invariants,
- collapse duplicate write paths,
- reduce legacy branching,
- formalize a few canonical creation/update services.

---

## 14. Database And Schema Audit

### 14.1 Schema posture

The schema is large:

- **358 models**
- **266 enums**
- **121 migrations**

This is enterprise-shaped, not hobby-shaped.

### 14.2 Positive signs

- workspace ids are present in many modern paths,
- webhook dedup composite lookup exists,
- POS, storefront, and operational data appear modeled as first-class entities,
- order model is rich enough to support multiple fulfillment and source contexts,
- cart recovery, experiments, and ops evidence tables indicate product maturity.

### 14.3 Main risks

1. **Migration complexity**
   - schema is large enough that migration safety must be treated as a product discipline.

2. **UserId/workspaceId coexistence**
   - still visible across code and scripts,
   - requires careful scoping and auditing.

3. **Mixed data consistency across legacy and centralized paths**
   - especially order writes and PII handling.

### 14.4 PII at rest finding

Current state is mixed:

- `services/orders/order-creation-service.ts` uses `encryptOrderPiiFields()`.
- `actions/orders.ts` direct order creation path writes `customerName`, `customerEmail`, and `customerPhone` directly.
- `app/api/public/v1/orders/route.ts` also writes directly.
- `lib/security/pii-field.ts` explicitly allows legacy plaintext pass-through for decryption compatibility.

Conclusion:

- the system has **PII encryption capability**,
- but **PII encryption is not yet uniformly enforced across all order-creation surfaces**.

This is one of the most important technical findings in the report.

---

## 15. Security Audit

### 15.1 Security strengths

- CSP and security headers are configured in `next.config.ts`.
- Stripe webhooks use signature verification.
- Uber Eats route now performs signature verification.
- Turnstile support exists for storefront checkout.
- Storefront checkout has honeypot + rate limit + CAPTCHA + duplicate suppression.
- Sensitive integration secrets are encrypted through `lib/crypto.ts`.
- PII encryption support exists.
- Audit logging exists in key operational flows.
- Health endpoints do not dump secrets.

### 15.2 High-priority findings

#### Finding 1 — inconsistent PII encryption across order creation paths

Severity: **High**

Impact:

- customer PII may be encrypted on some paths and plaintext on others,
- data governance and audit narratives become harder,
- future export/search/retention logic may behave inconsistently.

Needed action:

- route all order creation through the centralized service,
- add enforcement tests for encrypted-at-rest order fields,
- add migration/backfill plan for legacy plaintext rows if required by policy.

#### Finding 2 — API auth depends on route-local implementation

Severity: **High**

Impact:

- new route omissions are possible,
- broad exempt prefixes increase human-factor risk,
- security posture is only as strong as every route implementation.

Needed action:

- define a canonical API guard policy,
- add CI/static checks for auth-less non-public routes,
- maintain an explicit registry of public/exempt API surfaces.

#### Finding 3 — rate limiting can degrade to in-memory per instance

Severity: **High**

Evidence:

- `services/security/rate-limit-adapter.ts`
- `lib/rate-limit/rate-limit.ts`
- health snapshot exposes production memory warning

Impact:

- abuse protection weakens under multi-instance scale,
- quota behavior may become inconsistent,
- protection may look present but behave differently under production traffic.

Needed action:

- make distributed rate limiting mandatory in production,
- fail startup or at least fail readiness when required policy backend is missing.

### 15.3 Medium-priority findings

#### Finding 4 — workspace migration still in-flight

Severity: **Medium**

Impact:

- tenant boundary logic remains harder to reason about,
- mistakes are more likely in old paths,
- audits require more explanation than they should.

#### Finding 5 — direct writes bypass canonical services

Severity: **Medium**

Impact:

- business invariants are not guaranteed equally everywhere,
- future feature evolution costs more,
- security/data consistency improvements must be repeated across paths.

#### Finding 6 — deployment/build hygiene complexity

Severity: **Medium**

Impact:

- build fragility,
- stale artifact growth,
- operator confusion,
- harder external audit of release discipline.

### 15.4 Security items that appear improved relative to older audits

1. Uber Eats webhook now verifies signature before processing.
2. Webhook event dedup now uses composite key lookup for `connectionId + externalEventId`.

This matters: the system is not static; it is improving.

---

## 16. Performance And Scalability Audit

### 16.1 Positive signs

- `next.config.ts` reduces static generation concurrency to manage Vercel memory pressure.
- deployment scripts explicitly account for Vercel OOM behavior.
- query batching helpers exist.
- health endpoint surfaces latency and queue posture.
- storefront checkout avoids trusting client-side prices and re-prices server-side.
- revalidate patterns are widely used.
- cron worker uses bounded batches.

### 16.2 Main scale limits visible in code

1. **Inline webhook mode**
   - current queue posture may remain inline at low volume unless async queue is enabled.

2. **Per-instance rate limits**
   - if not backed by distributed Redis/Upstash.

3. **Large route surface**
   - App Router + high route count + large TS surface creates build pressure.

4. **Large monolith operational overhead**
   - no problem now if managed well,
   - but stricter conventions are needed as team count grows.

### 16.3 Dev performance and build scalability

The repo already encodes that remote Vercel builds are memory-constrained.  
That is not ideal, but the team has adapted with a realistic prebuilt strategy.

This is honest engineering, not a flaw by itself.

### 16.4 Recommendation

The next performance step is not premature decomposition. It is:

- strict canonical write paths,
- distributed rate limiting everywhere critical,
- async queue generalization for webhook and background-heavy workloads,
- periodic query plan review on hot operational pages.

---

## 17. DevOps And Release Engineering Audit

### 17.1 Strengths

- `vercel.json` exists and is aligned with cron configuration.
- production deploy is explicitly prebuilt.
- deployment script validates expected artifacts before deploy.
- health check runs after deploy.
- build scripts tune memory and static generation concurrency.
- health endpoint exposes readiness-like information.
- there is a very large set of operational scripts for staging, pilots, remediation, audits, and rollout.

### 17.2 Important observations

`scripts/deploy-prebuilt-prod.sh` shows strong operational learning:

- avoid raw remote `vercel deploy --prod`,
- move stale `.next.trash.*` aside,
- generate manifest,
- run tests,
- build locally,
- verify critical artifacts,
- deploy prebuilt,
- verify production health.

This is not beginner deployment logic. It reflects real operational scars.

### 17.3 DevOps risks

1. **Workspace clutter**
   - stale build trash and alternate config artifacts exist.

2. **Script sprawl**
   - a very large script inventory is powerful but hard to govern.

3. **Implicit env fallback behavior**
   - deployment script contains fallback public config values; useful operationally, but governance-sensitive.

### 17.4 DevOps verdict

**Operational maturity:** strong  
**Operational complexity:** very high  
**Needed next step:** script consolidation and runbook normalization

---

## 18. Observability And Ops Readiness

### 18.1 What exists

- health endpoint with database, env, Supabase, queue mode, observability, Sentry, and rate-limit adapter visibility
- Sentry node and edge registration
- optional OTEL trace export for experiment flows
- webhook and cron logging
- audit logging in business flows

### 18.2 Positive interpretation

The system is not blind.  
It has the beginnings of a serious ops story.

### 18.3 What should improve

- standard incident dashboards/runbooks per major subsystem,
- explicit SLA/SLO packages for storefront checkout, webhook latency, and cron completion,
- centralization of ops evidence instead of many discrete scripts and point solutions.

---

## 19. Testing And QA Audit

### 19.1 Strong signals

- unit tests exist for mutation access and other security-sensitive paths
- Playwright config supports:
  - authenticated dashboard flows
  - staff flows
  - pilot flows
  - critical-path smoke
  - visual regression
- Lighthouse CI exists for storefront paths
- many environment-aware smoke and verification scripts exist

### 19.2 Meaning

This is a team that already understands:

- auth regressions are expensive,
- storefront needs browser coverage,
- pilot environments need special handling,
- visual regressions matter.

### 19.3 Gap

Given the size of the product, the testing challenge is not "tests missing entirely".  
The challenge is:

- maintaining coverage against route sprawl,
- making canonical-service adoption testable,
- adding policy tests for tenant scoping and PII invariants.

### 19.4 Recommended next tests

1. Assert all order creation paths persist PII consistently.
2. Static or integration test for API route auth classification.
3. Regression tests for workspace-scoped resource isolation across remaining migration surfaces.
4. CI assertion that production cron list matches `vercel.json`.

---

## 20. SEO, Content, And Marketing Audit

### 20.1 Strong implementation signals

- root metadata is configured in `app/layout.tsx`
- canonical/open graph/twitter metadata helper exists in `lib/marketing/page-metadata.ts`
- `app/sitemap.ts` builds sitemap from marketing URLs and ads landings
- `app/robots.ts` disallows dashboard/platform/api/onboarding
- dedicated Google Ads landing system exists
- compare, solutions, integrations, blog, customers, locations, trust, legal, and case-study paths exist

### 20.2 Marketing architecture quality

OS Kitchen is unusually well positioned for a product that also has deep internal ops complexity.

The site has clear GTM segmentation for:

- restaurants,
- meal prep,
- catering,
- ghost kitchens,
- integrations,
- comparison pages,
- geo pages,
- paid landing pages.

### 20.3 GTM strengths

- path taxonomy is SEO-friendly,
- metadata helper encourages consistency,
- sitemap is programmatic,
- paid landing system is structured rather than ad hoc,
- there are scripts like `verify-marketing-claims` and GSC preflight tools, which is a strong governance sign.

### 20.4 GTM risks

1. **Proof and claims governance**
   - some ads landing quotes are explicitly marked illustrative/pilot-style,
   - all external-facing claims must remain tightly aligned with evidence.

2. **Content operations burden**
   - broad page taxonomy requires sustained refresh discipline.

3. **Commercial readiness vs breadth**
   - the marketing surface may be broader than the current fully proven public case-study base.

### 20.5 SEO verdict

**Technical SEO posture:** good  
**Content structure posture:** strong  
**Commercial proof maturity:** needs continued hardening

---

## 21. Product Management And Operational Design Audit

### 21.1 What PMs should notice

The repo encodes multiple product lines inside one platform:

- internal operator OS,
- storefront commerce engine,
- POS/KDS/floor operations,
- growth and GTM tooling,
- internal platform/admin,
- beta/pilot operational workflows.

This means roadmap management must explicitly separate:

- core production-critical paths,
- pilot-only features,
- platform-only features,
- experimental or future-state surfaces.

### 21.2 Strong PM signals

- route grouping mirrors domain grouping,
- onboarding adapts to business model,
- module gating exists,
- nav release profiles exist,
- support and impersonation tooling exist,
- pilot workflows are encoded in code and scripts.

### 21.3 PM risks

- breadth can outpace polish,
- legacy vs canonical patterns increase delivery cost,
- release complexity needs stronger artifact discipline.

---

## 22. Department-Specific Handoff Notes

### 22.1 For engineering teams

Focus first on:

1. canonicalizing order creation,
2. completing workspace scoping migration,
3. standardizing API guard patterns,
4. enforcing PII-at-rest consistency,
5. shrinking legacy duplication.

### 22.2 For security reviewers

Focus first on:

1. order PII write-path consistency,
2. exempt API surface registry,
3. distributed rate limit enforcement,
4. webhook secret governance,
5. migration-era tenant scope audit.

### 22.3 For DevOps / SRE

Focus first on:

1. production distributed rate-limit backend guarantee,
2. script consolidation,
3. deploy artifact cleanup governance,
4. standardized post-deploy smoke evidence,
5. queue posture evolution beyond inline low volume.

### 22.4 For SEO teams

Focus first on:

1. maintaining page-to-proof consistency,
2. expanding case-study and customer-proof assets,
3. monitoring indexation quality of compare/integration/location pages,
4. auditing internal link structure and conversion pathways.

### 22.5 For marketing / GTM

Focus first on:

1. aligning claims to pilot evidence,
2. expanding commercial proof,
3. mapping each high-intent page to a clear CTA and measurable funnel,
4. operationalizing landing-page refresh cadence.

### 22.6 For PM / implementation / customer success

Focus first on:

1. separating production-ready vs pilot-only messaging,
2. clarifying module enablement/default flows by business type,
3. documenting which modules are critical by vertical,
4. turning operational scripts into customer-facing/internal runbooks where appropriate.

---

## 23. Major Findings Matrix

### 23.1 Strength findings

1. **Tenant actor + permission architecture is directionally strong.**
2. **Storefront checkout is one of the most mature chains in the repo.**
3. **POS checkout is highly operational and business-realistic.**
4. **Cron governance is better than average because production allowlist is explicit.**
5. **Deployment scripts reflect real production learning, not hypothetical docs.**
6. **Observability and health modeling exist and are useful.**
7. **Marketing/SEO architecture is materially ahead of many B2B ops products at this stage.**

### 23.2 Risk findings

1. **High:** order PII encryption is not uniformly enforced across all write paths.
2. **High:** API auth posture relies on per-route guard discipline because `/api/*` is broadly exempt from middleware auth.
3. **High:** rate limiting may fall back to in-memory mode in production if misconfigured.
4. **Medium:** workspace migration remains in-flight and still shapes mental complexity.
5. **Medium:** legacy direct DB writes still coexist with stronger canonical services.
6. **Medium:** operational script and cron surface is very broad and raises governance cost.
7. **Medium:** marketing/commercial breadth is strong, but proof-hardening must keep up.

---

## 24. Priority Roadmap

### Priority 0 — immediately after this audit

1. Route all order creation through `createOrderViaCenter()` or equivalent canonical service.
2. Add tests proving encrypted-at-rest behavior for order PII.
3. Add CI or static audit to classify every API route as:
   - public,
   - webhook,
   - cron,
   - session-guarded,
   - platform/internal.
4. Enforce distributed rate limiting in production.

### Priority 1 — architecture hardening

1. Continue and complete workspace migration.
2. Reduce `dataUserId` legacy alias usage.
3. Collapse duplicate auth/rate-limit logic behind shared helpers.
4. Create a "blessed mutation patterns" guide for new work.

### Priority 2 — ops simplification

1. Consolidate scripts by lifecycle:
   - build/deploy,
   - staging,
   - pilot,
   - migration,
   - storefront release,
   - GTM/SEO.
2. Archive or clearly mark experimental/non-production cron and helper surfaces.
3. Clean root config and stale deployment artifacts.

### Priority 3 — GTM and external audit readiness

1. Build hard proof inventory for public claims.
2. Map each major page category to measurable funnel stages.
3. Prepare an external audit evidence pack:
   - auth and tenant scope overview,
   - deployment process,
   - backup/PITR posture,
   - security headers,
   - webhook auth controls,
   - rate limit posture,
   - PII policy and storage handling.

---

## 25. Final Verdict

OS Kitchen is already a **serious operational software product**, not a prototype.

It has:

- real product breadth,
- a meaningful systems architecture,
- explicit domain modeling,
- operational deployment knowledge,
- strong commerce and POS chains,
- a large page and service surface,
- visible audit and testing investment.

The main challenge is no longer "can this product work?"  
The main challenge is now:

- making the architecture more uniform,
- reducing legacy/canonical drift,
- tightening security and data-governance consistency,
- simplifying operational governance as the product scales.

If those issues are addressed, OS Kitchen can move from "strong production-shaped platform" to "high-confidence audit-grade production platform".

---

## 26. Key Files For External Review

If another engineering or audit company needs a starting point, review these first:

- `package.json`
- `next.config.ts`
- `middleware.ts`
- `app/layout.tsx`
- `app/page.tsx`
- `app/dashboard/layout.tsx`
- `app/platform/layout.tsx`
- `app/onboarding/page.tsx`
- `app/s/[storeSlug]/page.tsx`
- `app/s/[storeSlug]/checkout/page.tsx`
- `app/api/health/route.ts`
- `app/api/public/v1/orders/route.ts`
- `app/api/storefront/cart/route.ts`
- `app/api/webhooks/stripe/route.ts`
- `app/api/webhooks/uber-eats/orders/route.ts`
- `app/api/cron/webhook-jobs/route.ts`
- `actions/auth.ts`
- `actions/orders.ts`
- `actions/storefront-order.ts`
- `lib/auth.ts`
- `lib/scope/require-tenant-actor.ts`
- `lib/scope/cached-tenant.ts`
- `lib/permissions/require-workspace-permission.ts`
- `lib/workflows/order-lifecycle-rules.ts`
- `services/orders/order-creation-service.ts`
- `services/orders/order-detail-service.ts`
- `services/pos/pos-checkout-service.ts`
- `services/cron/production-manifest.ts`
- `lib/webhooks/webhook-event-store.ts`
- `lib/security/pii-field.ts`
- `lib/crypto.ts`
- `prisma/schema.prisma`
- `vercel.json`
- `scripts/vercel-build.sh`
- `scripts/deploy-prebuilt-prod.sh`

---

## 27. Related Internal Artifacts

For even deeper historical and function-level context, cross-read:

- `docs/ultimate-audit-24may2026.md`
- `docs/audit-full-functions-map.md`

This `fullreport25may` document should be treated as the **board-level and cross-department audit narrative**, while the two internal artifacts above remain useful as deeper engineering appendices.

---

## Appendix A — Quantitative Breakdown

### A.1 Dashboard page distribution

Largest dashboard route groups currently visible in code:

- `storefront` — 41
- `settings` — 32
- `implementation` — 24
- `sales-channels` — 21
- `locations` — 20
- `growth` — 17
- `customers` — 16
- `developer` — 14
- `reports` — 14
- `training` — 13
- `integrations` — 13
- `routes` — 13
- `analytics` — 13
- `meal-plans` — 12
- `costing` — 12
- `staff` — 12
- `product-mapping` — 12
- `tasks` — 11
- `playbooks` — 11
- `pos` — 11
- `catering-quotes` — 11
- `billing` — 11
- `purchasing` — 10
- `templates` — 10
- `import-export` — 9
- `notifications` — 9
- `import-center` — 8
- `copilot` — 8
- `brands` — 8
- `executive` — 8
- `food-safety` — 7
- `forecast` — 6
- `support` — 6
- `inventory` — 6
- `nutrition-labels` — 5
- `production` — 5
- `menus` — 5
- `orders` — 5
- `accounting` — 4
- `products` — 4
- `operations` — 4
- `packing` — 4

Interpretation:

- Storefront admin is the single largest dashboard domain.
- Settings and implementation are unusually large, which suggests the product is trying to operationalize setup and change management instead of hiding it in admin-only tooling.
- Growth, analytics, developer, and executive surfaces exist early, which is strategically interesting for a product at this stage.

### A.2 Service layer distribution

Largest service namespaces:

- `storefront` — 190
- `platform` — 16
- `pos` — 16
- `developer` — 15
- `growth` — 12
- `integrations` — 12
- `crm` — 11
- `inventory` — 9
- `orders` — 9
- `webhooks` — 9
- `analytics` — 9
- `beta` — 8
- `accounting` — 8
- `purchasing` — 8
- `observability` — 8
- `partner` — 8
- `ai` — 8

Interpretation:

- Storefront is not a side feature. It is one of the primary architectural pillars.
- POS, CRM, integrations, inventory, and observability are all real service domains, not decorative folder names.

### A.3 Component layer distribution

Largest component namespaces:

- `dashboard` — 386
- `storefront` — 82
- `marketing` — 38
- `ui` — 24
- `landing` — 19
- `storefront-builder` — 16

Interpretation:

- The dashboard UI is the dominant front-end surface by far.
- Storefront also has enough component mass to be considered its own UI system inside the product.

### A.4 `lib/` distribution

Largest `lib/` namespaces:

- `storefront` — 284
- `compliance` — 58
- `marketing` — 38
- `scope` — 31
- `orders` — 21
- `beta-ops` — 18
- `billing` — 17
- `channels` — 17
- `platform` — 14
- `experiment-production` — 14
- `storefront-builder` — 14
- `analytics` — 14
- `permissions` — 13
- `webhooks` — 13

Interpretation:

- `lib/` contains both infrastructure and business-domain logic, especially for storefront, compliance, scope, billing, permissions, and analytics.
- The large `storefront` footprint confirms commerce is one of the platform’s deepest domains.

### A.5 Control-surface counts

- API routes: **295**
- Webhook routes: **46**
- Cron directories: **136**
- Production allowlisted cron slugs in current manifest: **15**

Interpretation:

- The production-scheduled cron surface is controlled,
- but the on-disk operational surface is much larger than the production-scheduled surface.

---

## Appendix B — Practical Findings By Severity

### Critical-to-high implementation risks

1. Centralize all order creation through a single canonical service.
2. Enforce encrypted-at-rest order PII uniformly.
3. Make distributed rate limiting a production requirement, not a best effort.
4. Add API route classification checks so non-public routes cannot ship without an auth story.

### Medium implementation risks

1. Finish `workspaceId` migration and reduce alias complexity.
2. Consolidate route-local auth and rate limit code into shared helpers.
3. Reduce script and build-artifact clutter in the repo root and deployment workflow.
4. Archive or clearly isolate experimental cron surfaces.

### Low but important hygiene work

1. Clean alternate config artifacts and stale root files.
2. Normalize naming and documentation around pilot/beta/ops scripts.
3. Continue improving public proof assets to match broad marketing surface area.

---

## Appendix C — What Changed Relative To Older Internal Audits

The current codebase appears stronger in several areas than some earlier internal audit snapshots:

1. Uber Eats webhook handling now includes signature validation before processing.
2. Webhook event dedup now uses composite key lookup for connection-bound external event ids.
3. Health and rate-limit posture are more explicitly surfaced in code and health output.
4. Storefront checkout continues to show stronger anti-abuse and rules-based validation depth than typical early-stage commerce layers.

This is important for any external auditor: the codebase is under active hardening, and older findings should be revalidated against current code before being treated as still-open issues.

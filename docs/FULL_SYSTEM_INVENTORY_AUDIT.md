# OS Kitchen — Full System Inventory Audit

**Generated:** 2026-05-15 (automated + manual codebase pass)  
**Scope:** Entire repository under `/Users/dmytro/Desktop/2026/OS Kitchen` excluding `node_modules` / `.next`.  
**Purpose:** Route, service, database, and UI inventory with notes on duplication, risk, and consolidation.

---

## 1. Routes

### 1.1 App Router — marketing & public (`app/`)

| Area | Pattern / examples | Notes |
|------|---------------------|--------|
| Landing & GTM | `/`, `/product`, `/product/[slug]`, `/product/pos-terminal`, `/solutions`, `/solutions/[slug]`, `/roi-calculator`, `/beta`, `/demo`, `/demo/[slug]`, `/signup`, `/changelog`, `/status`, `/trust`, `/trust/status`, `/support/*` | Marketing + trust + support surfaces; many share marketing layout components. |
| Resources SEO | `/resources`, `/resources/*` | Long-form content pages. |
| Order/quote tokens | `/order/[token]`, `/quote/[token]` | Public token-gated flows. |
| Role-lite surfaces | `/kds`, `/driver`, `/customers` | Standalone operator/driver/customer paths (verify auth expectations per page). |
| Partner portal | `/partner`, `/partner/*` | Partner-facing subset. |

### 1.2 Dashboard (`app/dashboard/**`)

Large **command-center** style tree: Today, Order Hub, Orders, Production, Packing, Packing verify, Routes, Tasks, Locations, CRM, Meal plans, Catering quotes, Inventory demand, Purchasing, Costing/AvT, Analytics, Forecast, Reports, Executive, Copilot, Staff, Billing, Notifications, Alert rules, Support, Settings (many sub-pages), Audit logs, Error recovery, Data integrity, Demo scenarios, Integrations, Integration health, Webhooks, Import/export, Brands, Training, Go-live, Playbooks, Growth, Partner, Security, System health, Scan, Founder, etc.

**Observation:** Depth is high; navigation is grouped in shell + business modes (`lib/business-modes.ts`). Some paths overlap conceptually (e.g. security vs settings vs audit).

### 1.3 Platform admin (`app/platform/**`)

All routes under `/platform` are **internal**. Layout (`app/platform/layout.tsx`) calls `requirePlatformAccess()` which:

- Requires authenticated session.
- Bootstraps founder super-admin row for `workspace.moroz@gmail.com`.
- Requires `isPlatformAdmin` **or** founder email, then `platform:access` permission.

Pages include: dashboard, workspaces, organizations, billing, revenue, integrations, webhooks, jobs, errors, error-recovery, health, system-health, support queue, audit, users, roles, feature flags, trials, plans, entitlements, training, automations, implementations, go-live, partner, growth CRM, preview, tools/db-health, etc.

### 1.4 Public storefront (`app/s/[storeSlug]/**`)

| Route | Role |
|-------|------|
| `/s/[storeSlug]` | Home |
| `/s/[storeSlug]/menu`, `/products/[productRef]`, `/cart`, `/checkout` | Commerce |
| `/s/[storeSlug]/order/[token]`, `/order-confirmation/[token]` | Post-submit |
| `/s/[storeSlug]/about`, `/faq`, `/contact`, `/catering`, `/p/[pageSlug]` | Content |
| `/s/[storeSlug]/policies/privacy|terms` | Legal |
| `/s/[storeSlug]/sitemap.xml` | SEO |

Custom domains / subdomains: `middleware.ts` rewrites to `/s/...` when `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN` / `STOREFRONT_MIDDLEWARE_SECRET` / optional redirects enabled.

### 1.5 API routes (`app/api/**`)

Representative inventory:

| Class | Paths |
|-------|--------|
| Health | `/api/health` |
| Auth | `/auth/callback` (route handler under `app/auth`) |
| Billing | `/api/billing/checkout`, `/api/billing/portal`, `/api/billing-portal` |
| Stripe webhook | `/api/webhooks/stripe` |
| Resend | `/api/webhooks/resend` |
| Storefront | `/api/storefront/analytics`, `resolve-host`, `resolve-redirect`, `preview-token`, `form-submissions-export/[formId]` |
| Public API v1 | `/api/public/v1/orders`, `customers`, `products` |
| Import/export | `/api/export`, `/api/export/report`, `/api/import-center/*`, `/api/import-templates/*`, `/api/import-export/template` |
| Integrations | WooCommerce + Shopify sync + test routes under `/api/integrations/*` |
| Webhooks (ingress) | WooCommerce, Shopify (orders create/update, products, app-uninstalled), Uber Eats/Direct placeholders |
| Cron | `/api/cron/webhook-jobs`, `/api/cron/reminders` |
| Delivery | `/api/delivery/quote`, `create`, `cancel` |
| Checkout | `/api/checkout` |
| Growth | `/api/growth/leads/export`, `customer-success/export` |

### 1.6 Cron / webhook / job alignment

- **Cron:** `webhook-jobs` and `reminders` — `CRON_SECRET` enforced on webhook job drain (see `app/api/cron/webhook-jobs/route.ts`).
- **Webhook processing:** Async rows (`WebhookProcessingJob*`) processed by drain + replay paths (documented in existing `docs/WEBHOOK_QUEUE_RETRY_ARCHITECTURE.md`).

---

## 2. Services (`services/**`)

Grouped by domain (files discovered under `services/`):

| Domain | Examples |
|--------|-----------|
| Orders / workflows | `workflows/order-lifecycle-service`, `workflows/foodops-workflow-service`, `orders` (via actions + services) |
| POS | `pos/pos-checkout-service`, `pos-receipt-service`, `pos-service`, `pos-register-service`, `pos-shift-service`, `pos-crm-service`, … |
| Storefront | `storefront/*`, `storefront-builder/*` |
| Integrations | `integrations/woocommerce`, `shopify`, `uber-eats`; `channels/*` |
| Webhooks / queue | `webhooks/*`, `queue/job-service`, `queue/queue-service` |
| CRM | `crm/*` (many specialized services) |
| Inventory / costing | `inventory/*`, `ingredient-demand/*`, `costing/*`, `purchasing/*` |
| Analytics / forecast | `analytics/*`, `forecast/*`, `forecasting/*` |
| Billing | `billing/*` |
| Support | `support/*` |
| Audit | `audit/*` |
| Permissions | `permissions/*`, `scope/scope-validation-service` |
| Platform | `platform/*`, `developer/*` (platform health, job monitor, etc.) |
| Demo | `demo/*`, `demo-data.ts` |
| Today | `today/*` |
| Recovery | `recovery/error-recovery-service`, `webhooks/webhook-error-recovery-service` |

**Used vs unused:** Static “unused” detection was **not** run to completion (repo size). Heuristic: services imported from `actions/*`, `app/**`, or `lib/**` are on the hot path; orphan services may still be used from scripts — recommend `knip` or `ts-prune` in a follow-up **P3**.

**Duplication risk:** Multiple “overview” and “snapshot” services (`analytics`, `executive`, `kpi-snapshot-service` thin alias over `loadExecutiveOverview`) — acceptable layering; watch for **parallel KPI computations** on the same page (performance doc).

---

## 3. Database (Prisma)

| Metric | Approximate value |
|--------|-------------------|
| `model` declarations | **288** |
| `enum` declarations | **252** |
| Applied migrations (`prisma/migrations/*/migration.sql`) | **72** |

**Multi-tenant scoping:** Predominant patterns are `workspaceId`, `organizationId`, `locationId`, `brandId` on tenant tables — verified in services via `userWorkspaceIds`, `visibleTicketsWhere`, storefront slug resolution, etc. (See security audit for exceptions to verify per feature.)

**Risky nullables / JSON:** Large JSON blobs on settings, storefront theme, channel payloads — validate at write boundaries (Zod in actions). **P2:** periodic audit of new JSON columns for PII.

**Indexes:** Many migrations add `@@index`; given model count, **query-level review** (performance audit) matters more than schema-only review.

**Client consistency:** `npm run build` runs `prisma generate`; CI/local should use same Prisma version as `package.json`.

---

## 4. UI (`components/**`)

| Category | Location / notes |
|----------|------------------|
| Shared primitives | `components/ui/*` (shadcn-style) |
| Dashboard shell | `components/dashboard/dashboard-shell.tsx`, `command-palette.tsx`, nav configs |
| Tables / data | Various `*-table.tsx`, report clients |
| Cards / forms | Settings forms under `components/dashboard/settings/forms/` |
| Modals | Radix dialog patterns across dashboard |
| Empty states | `components/dashboard/empty-state.tsx`, `components/feedback/empty-state.tsx`, `components/empty-state/actionable-empty-state.tsx` (re-export pattern) |
| Storefront | `components/storefront/*` |
| Platform | `components/platform/*` |

**Duplication:** Multiple empty-state entry points — **consolidation candidate (P3):** single `ActionableEmptyState` API wrapping `EmptyState` props + module-specific presets.

**Mobile / tablet:** Tailwind responsive classes pervasive; no single virtualization layer — heavy tables may need `@tanstack/react-virtual` **P2** where datasets unbounded.

---

## 5. Server actions (`actions/**`)

**~85** action modules covering POS, orders, storefront, platform, billing, support, webhooks, demo, etc.

**Risk pattern:** Any action that takes `workspaceId` from client must re-validate membership (audit in `SECURITY_RBAC_TENANCY_AUDIT.md`).

---

## 6. What appears consolidated vs still sprawling

| Strength | Gap |
|----------|-----|
| Clear split: marketing / dashboard / platform / storefront | Very large dashboard surface — onboarding hints and “setup required” must stay consistent |
| Central capability matrix story (`docs/HONEST_CAPABILITY_MATRIX.md`, landing `features.tsx`) | Occasional legacy copy on niche pages may drift |
| Prisma as single persistence layer | Schema size increases onboarding cost for new engineers |

---

## 7. References

- `middleware.ts` — Supabase session + storefront host rewrite.
- `lib/platform/platform-guards.ts` — platform access.
- `lib/platform-owner.ts` — founder email constant.
- Existing deep dives: `docs/HONEST_CAPABILITY_MATRIX.md`, `docs/WEBHOOK_QUEUE_RETRY_ARCHITECTURE.md`, `docs/ENVIRONMENT_VARIABLES.md`.

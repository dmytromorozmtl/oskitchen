# OS Kitchen — Storefront Module Audit

**Date:** 21 May 2026  
**Auditor:** Senior Full-Stack Architect / QA Director  
**Method:** Static code analysis + production HTTP probe (unauthenticated)  
**Production:** https://os-kitchen.com  
**Scope:** `app/dashboard/storefront` (25 canonical routes) + actions, services, API, Prisma

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Canonical audit pages (25) | **25/25** `page.tsx` present |
| Loading states (25 routes) | **25/25** `loading.tsx` present |
| Error boundaries (25 routes) | **25/25** `error.tsx` present |
| Extra storefront pages (beyond 25) | **7** (see § Extended routes) |
| Total `page.tsx` under storefront | **32** |
| Storefront action files | **28** (+ `actions/storefront/pickup-windows.ts`) |
| Storefront services (`.ts`) | **178** (118 prod + 60 `_experiments`) |
| Storefront components (`.tsx`) | **60** |
| Public API routes (`app/api/storefront`) | **24** |
| Prisma `Storefront*` models | **27** |

**Overall:** The 25-route storefront admin surface is **structurally complete** (page + loading + error on every audited route). Auth is enforced via dashboard layout (`getTenantActor`). Gaps concentrate on **unbounded Prisma reads**, **missing `force-dynamic` on analytics**, **partial Zod on server actions**, and **rate limiting only on a subset of public API routes**.

**Production HTTP (unauthenticated probe):** All 25 dashboard URLs return **307** → login redirect. Expected; does not validate authenticated 200 responses.

---

## Inventory (Step 1)

### Pages (`page.tsx`)

```
app/dashboard/storefront/page.tsx
app/dashboard/storefront/advanced/page.tsx
app/dashboard/storefront/analytics/page.tsx
app/dashboard/storefront/builder/page.tsx
app/dashboard/storefront/catalog/page.tsx
app/dashboard/storefront/discounts/page.tsx
app/dashboard/storefront/domains/page.tsx
app/dashboard/storefront/forms/[formId]/page.tsx
app/dashboard/storefront/forms/[formId]/submissions/page.tsx
app/dashboard/storefront/forms/new/page.tsx
app/dashboard/storefront/forms/page.tsx
app/dashboard/storefront/fulfillment/page.tsx
app/dashboard/storefront/launch/page.tsx
app/dashboard/storefront/markets/page.tsx
app/dashboard/storefront/media/page.tsx
app/dashboard/storefront/menu/page.tsx
app/dashboard/storefront/notifications/page.tsx
app/dashboard/storefront/ordering/page.tsx
app/dashboard/storefront/page.tsx
app/dashboard/storefront/pages/[pageId]/page.tsx
app/dashboard/storefront/pages/page.tsx
app/dashboard/storefront/pickup-windows/page.tsx
app/dashboard/storefront/preview/page.tsx
app/dashboard/storefront/products/page.tsx
app/dashboard/storefront/redirects/page.tsx
app/dashboard/storefront/seo/page.tsx
app/dashboard/storefront/settings/experiments/page.tsx
app/dashboard/storefront/settings/page.tsx
app/dashboard/storefront/team/audit/page.tsx
app/dashboard/storefront/team/page.tsx
app/dashboard/storefront/theme/page.tsx
app/dashboard/storefront/website/page.tsx
app/dashboard/storefront/workspace/page.tsx
```

### Actions

```
actions/storefront-advanced.ts
actions/storefront-blackout.ts
actions/storefront-catalog-admin.ts
actions/storefront-contact.ts
actions/storefront-discounts.ts
actions/storefront-domains.ts
actions/storefront-experiment-settings.ts
actions/storefront-forms.ts
actions/storefront-markets.ts
actions/storefront-media.ts
actions/storefront-multi-store.ts
actions/storefront-navigation.ts
actions/storefront-order.ts
actions/storefront-pages.ts
actions/storefront-pillar-settings.ts
actions/storefront-product-public.ts
actions/storefront-regional.ts
actions/storefront-settings.ts
actions/storefront-stripe-connect.ts
actions/storefront-tax-settings.ts
actions/storefront-team-invite.ts
actions/storefront-team.ts
actions/storefront-theme-experiment.ts
actions/storefront-theme-preset.ts
actions/storefront-theme-publish.ts
actions/storefront-webhook-delivery.ts
actions/storefront-workspace.ts
actions/storefront/pickup-windows.ts
```

### Prisma models (`Storefront*`)

`StorefrontSettings`, `StorefrontTeamInvite`, `StorefrontTeamInviteEvent`, `StorefrontEdgeSyncJob`, `StorefrontExperimentAuditEvent`, `StorefrontCartRecovery`, `StorefrontPage`, `StorefrontSection`, `StorefrontTheme`, `StorefrontOrder`, `StorefrontOrderItem`, `StorefrontContactSubmission`, `StorefrontDomain`, `StorefrontVisit`, `StorefrontConversionEvent`, `StorefrontBlackoutDate`, `StorefrontDiscount`, `StorefrontRedirect`, `StorefrontForm`, `StorefrontFormSubmission`, `StorefrontMenuPublish`, `StorefrontNavigation`, `StorefrontFooter`, `StorefrontFulfillmentRule`, `StorefrontAsset`, `StorefrontProductVariant`, `StorefrontModifierGroup`, `StorefrontModifierOption`, `StorefrontCustomer`

Related (non-`Storefront*` prefix): `Menu`, `Product`, `Brand`, `Workspace`, `KitchenSettings`, `UserProfile`

---

## Actions & API Summary (Step 3)

### Server actions

| File | Exports | Zod refs | revalidatePath/Tag | requireTenantActor |
|------|---------|----------|-------------------|-------------------|
| storefront-advanced.ts | 12 | 0 | 11 | 7 |
| storefront-blackout.ts | 4 | 4 | 3 | 3 |
| storefront-catalog-admin.ts | 8 | 22 | 2 | 3 |
| storefront-contact.ts | 1 | 13 | 0 | 0 (public) |
| storefront-discounts.ts | 6 | 7 | 4 | 4 |
| storefront-domains.ts | 2 | 0 | 3 | 3 |
| storefront-experiment-settings.ts | 2 | 0 | 4 | 2 |
| storefront-forms.ts | 12 | 1* | 9 | 6 |
| storefront-markets.ts | 3 | 3 | 2 | 3 |
| storefront-media.ts | 2 | 0 | 3 | 3 |
| storefront-multi-store.ts | 4 | 4 | 4 | 4 |
| storefront-navigation.ts | 4 | 4 | 3 | 3 |
| storefront-order.ts | 1 | 1** | 10 | 0 (public checkout) |
| storefront-pages.ts | 22 | 17 | 13 | 13 |
| storefront-pillar-settings.ts | 12 | 47 | 0 | 7 |
| storefront-product-public.ts | 2 | 9 | 2 | 2 |
| storefront-regional.ts | 2 | 6 | 0 | 2 |
| storefront-settings.ts | 10 | 18 | 3 | 6 |
| storefront-stripe-connect.ts | 1 | 0 | 2 | 2 |
| storefront-tax-settings.ts | 3 | 6 | 0 | 2 |
| storefront-team-invite.ts | 4 | 3 | 6 | 4 |
| storefront-team.ts | 1 | 3 | 2 | 2 |
| storefront-theme-experiment.ts | 5 | 0 | 5 | 4 |
| storefront-theme-preset.ts | 2 | 0 | 2 | 2 |
| storefront-theme-publish.ts | 1 | 0 | 4 | 2 |
| storefront-webhook-delivery.ts | 1 | 0 | 2 | 2 |
| storefront-workspace.ts | 3 | 4 | 5 | 4 |

\* `storefront-forms.ts` uses Zod for `kindSchema` and `storefrontFormFieldsSchema` on subset of handlers; not all 12 exports are schema-wrapped.  
\*\* `storefront-order.ts` uses `submitSchema.safeParse` — grep `z.` count understates validation.

### Public API routes (`app/api/storefront`)

| Route | Methods | Zod | Rate limit (`enforceStorefrontRateLimit*`) | Dashboard auth |
|-------|---------|-----|---------------------------------------------|----------------|
| account/orders | POST | 4 | Yes | N/A (guest session) |
| account/reorder/preview | GET | 0 | Yes | N/A |
| account/reorder | POST | 5 | Yes | N/A |
| account/session | GET | 0 | **No** | N/A |
| account/subscription | POST | 6 | Yes | N/A |
| analytics | POST | 6 | Yes | N/A |
| cart | GET/PATCH/POST/DELETE | 4 | Yes | N/A |
| cart-recovery | GET/POST | 6 | **No** | N/A |
| cart-recovery/unsubscribe | GET | 0 | **No** | N/A |
| catalog | GET | 0 | Yes | N/A |
| experiment/* (6 routes) | GET/POST | 0–3 | **No** | Token/HMAC (per-route) |
| form-submissions-export/[formId] | GET | 0 | **No** | Tenant export |
| forms/upload | POST | 4 | **No** | N/A |
| guest-account | POST | 4 | **No** | N/A |
| preview-token | POST | 0 | **No** | Admin mint |
| qr | POST | 3 | **No** | requireTenantActor (2) |
| resolve-host | GET | 0 | **No** | Server secret |
| resolve-redirect | GET | 0 | **No** | N/A |
| shipping/quote | POST | 0 | Yes | N/A |
| theme-experiment | POST | 1 | **No** | N/A |

Rate limiting is implemented via `lib/storefront/storefront-rate-limit.ts` → `consumeRateLimitToken`, not inline `rateLimit` strings in route files.

---

## Page-by-Page Analysis (25 routes, 8 levels)

Legend: **UI states** = patterns observed in `page.tsx` + child components. **Tenant** = `getTenantActor()` / `requireTenantActor` / `resolveStorefrontAdminAccess`.

---

### `/dashboard/storefront` (Overview)

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ `page.tsx`, `loading.tsx`, `error.tsx` |
| 2. Connections | Action: `storefront-settings` (`upsertStorefrontSettingsFormAction`). Lib: `findAdminStorefront`, `ensureCatalogMenu`, `menuListWhereForOwner`. Direct Prisma in page. |
| 3. Prisma | `StorefrontSettings`, `storefrontOrder`, `storefrontPage`, `menu`, `brand` |
| 4. UI states | Empty (no menus), success (dashboard + form), loading/error via route files |
| 5. Validation | Form → server action (Zod in `storefront-settings`) |
| 6. Optimization | `take: 40` on menus; no `force-dynamic` |
| 7. Security | `getTenantActor()`; owner-scoped menus |
| 8. Issues | Multi-brand warning (no `brandId` storefront model). Orders today query unbounded by design (count only). |

**HTTP (prod):** 307

---

### `/dashboard/storefront/launch`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Lib: `loadPublishChecklistForStorefront`, `publishChecklistBlocksGoLive`, `isStorefrontStrictLaunchEnabled`. Components: `PublishChecklistCard`, `StorefrontLaunchOpsCard`. |
| 3. Prisma | `menu`, `product` (counts) |
| 4. UI states | Empty (no settings/menus), blocked gate banner, success checklist |
| 5. Validation | N/A (read-only checklist) |
| 6. Optimization | No `take` on product count query (filtered by menuId) |
| 7. Security | `getTenantActor()` |
| 8. Issues | Strict launch env `STOREFRONT_STRICT_LAUNCH=1` not obvious without reading code |

**HTTP (prod):** 307

---

### `/dashboard/storefront/website`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Hub/navigation only — `findAdminStorefront`, no actions |
| 3. Prisma | None in page |
| 4. UI states | Empty card → Overview; link grid when configured |
| 5. Validation | N/A |
| 6. Optimization | Static hub |
| 7. Security | `getTenantActor()` |
| 8. Issues | **`dataUserId` destructured but unused** (dead variable) |

**HTTP (prod):** 307

---

### `/dashboard/storefront/builder`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Services: `page-builder-service`, `theme-service`. Component: `NavFooterBuilder`. |
| 3. Prisma | `storefrontPage` (CUSTOM, published, no `take`) |
| 4. UI states | Empty (no storefront), success builder |
| 5. Validation | Nav/footer saved via `storefront-navigation` actions (in component) |
| 6. Optimization | Custom pages query unbounded |
| 7. Security | `getTenantActor()` |
| 8. Issues | JSON nav/footer still underlying model — visual builder only |

**HTTP (prod):** 307

---

### `/dashboard/storefront/media`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Service: `listStorefrontMediaForOwner`. Component: `MediaLibrary`. |
| 3. Prisma | `StorefrontAsset` (via service) |
| 4. UI states | Empty (not set up), success library, upload disabled when storage not configured |
| 5. Validation | Upload actions in `storefront-media` (no Zod — manual checks) |
| 6. Optimization | Full asset list — no pagination in page |
| 7. Security | `getTenantActor()` + owner media scope in service |
| 8. Issues | Upload requires server storage config — correctly documented in UI |

**HTTP (prod):** 307

---

### `/dashboard/storefront/pages`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-pages` (`deleteStorefrontPageFormAction`). Component: `CreateStorefrontPageForm`. |
| 3. Prisma | `storefrontPage` + sections |
| 4. UI states | Empty list, per-page translation warnings, success list |
| 5. Validation | Create/delete via Zod-backed actions |
| 6. Optimization | **`findMany` without `take`** — risk for large sites |
| 7. Security | `getTenantActor()`, `userId: dataUserId` filter |
| 8. Issues | Unbounded page list |

**HTTP (prod):** 307

---

### `/dashboard/storefront/theme`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Services: `media-service`. Lib: publish checklist, theme diff. Components: publish form, preset, contrast. Actions via child forms (`storefront-theme-publish`, `storefront-theme-preset`, `storefront-settings`). |
| 3. Prisma | `storefrontPage`, `StorefrontNavigation`, `StorefrontFooter`, theme fields on settings |
| 4. UI states | Empty, publish blocked banner, success editor |
| 5. Validation | Mixed — pillar/settings + theme publish actions |
| 6. Optimization | All pages for storefront loaded (no `take`) |
| 7. Security | `getTenantActor()` |
| 8. Issues | Publish gated by checklist — good; heavy page load |

**HTTP (prod):** 307

---

### `/dashboard/storefront/menu`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-settings` (`setStorefrontActiveMenuFormAction`) |
| 3. Prisma | `menu` (`take: 50`) |
| 4. UI states | Empty active menu, success selector |
| 5. Validation | Zod in settings action |
| 6. Optimization | `take: 50` on menus |
| 7. Security | `getTenantActor()`, workspace menu scope |
| 8. Issues | None critical |

**HTTP (prod):** 307

---

### `/dashboard/storefront/catalog`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Service: `storefront-catalog-admin-service`. Component: `StorefrontCatalogAdminPanel`. Actions in component: `storefront-catalog-admin`. |
| 3. Prisma | Variants, modifiers, availability (via service) |
| 4. UI states | Permission denied, not configured, success panel |
| 5. Validation | Strong Zod in `storefront-catalog-admin.ts` |
| 6. Optimization | Context loads all products for active menu (service-level) |
| 7. Security | **`resolveStorefrontAdminAccess` + `storefront.catalog` permission** |
| 8. Issues | Large menus → heavy admin payload |

**HTTP (prod):** 307

---

### `/dashboard/storefront/products`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-product-public` |
| 3. Prisma | `Product` via `activeMenu` include (**all products, no take**) |
| 4. UI states | Empty (no menu), per-product forms |
| 5. Validation | Zod in product-public actions |
| 6. Optimization | No pagination — N+1 forms for large menus |
| 7. Security | `getTenantActor()` |
| 8. Issues | **Unbounded product list render** |

**HTTP (prod):** 307

---

### `/dashboard/storefront/markets`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-markets`. Component: `StorefrontMarketsEditor`. |
| 3. Prisma | `kitchenSettings.settingsCenterJson`, `menu` |
| 4. UI states | Empty, success editor |
| 5. Validation | Zod in markets actions |
| 6. Optimization | Menus list unbounded |
| 7. Security | `getTenantActor()` |
| 8. Issues | Markets stored in settings center JSON — migration/consistency risk |

**HTTP (prod):** 307

---

### `/dashboard/storefront/workspace`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Actions: `storefront-multi-store`, `storefront-workspace` |
| 3. Prisma | `workspaceMember`, `storefrontSettings`, `brand`, `kitchenSettings` |
| 4. UI states | Multi-store list, link/create forms |
| 5. Validation | Zod in both action files |
| 6. Optimization | Workspace storefronts query unbounded |
| 7. Security | `getTenantActor()` |
| 8. Issues | Multi-store UX depends on workspace membership |

**HTTP (prod):** 307

---

### `/dashboard/storefront/team`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-team`. Service: `storefront-team-invite-service`. Component: `StorefrontTeamInvitePanel`. |
| 3. Prisma | `workspaceMember`, `kitchenSettings`, invites |
| 4. UI states | Permission matrix, pending invites |
| 5. Validation | Zod partial on team actions |
| 6. Optimization | Members list unbounded per workspace |
| 7. Security | `getTenantActor()`; staff permissions in settings JSON |
| 8. Issues | Permissions in `settingsCenterJson` — not normalized RBAC table |

**HTTP (prod):** 307

---

### `/dashboard/storefront/ordering`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-pillar-settings`. Service: `storefront-payment-service`. Stripe/tax panels. |
| 3. Prisma | `storefrontSettings`, `kitchenSettings` |
| 4. UI states | Empty, payment readiness indicators |
| 5. Validation | Zod in pillar-settings (47 refs) |
| 6. Optimization | Single settings row |
| 7. Security | `getTenantActor()` |
| 8. Issues | Beta Stripe path — banner on overview |

**HTTP (prod):** 307

---

### `/dashboard/storefront/fulfillment`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Actions: `storefront-pillar-settings`, `storefront-blackout` (via `BlackoutDatesPanel`) |
| 3. Prisma | `storefrontSettings`, `StorefrontBlackoutDate`, delivery zones JSON |
| 4. UI states | Empty, zones editor, blackout panel |
| 5. Validation | Zod on blackout; pillar forms |
| 6. Optimization | Includes all blackout dates (typically small) |
| 7. Security | `getTenantActor()` |
| 8. Issues | Delivery zones as raw JSON textarea — operator error risk |

**HTTP (prod):** 307

---

### `/dashboard/storefront/forms`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Actions: `storefront-forms` |
| 3. Prisma | `StorefrontForm` (`take: 50` on relation) |
| 4. UI states | Empty, list, link to new/submissions |
| 5. Validation | Partial Zod (not all handlers) |
| 6. Optimization | `take: 50` on forms relation |
| 7. Security | `getTenantActor()` |
| 8. Issues | Sub-routes: `forms/new`, `forms/[formId]`, submissions — fully covered with loading/error |

**HTTP (prod):** 307

---

### `/dashboard/storefront/domains`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-pillar-settings` (hostname). Component: `DomainVerificationCard` → `storefront-domains` (DNS verify) |
| 3. Prisma | `StorefrontSettings` domain fields; `StorefrontDomain` model exists but page uses settings columns |
| 4. UI states | Empty, DNS instructions, verification status |
| 5. Validation | Pillar form + domain actions (no Zod on domains.ts) |
| 6. Optimization | Single row |
| 7. Security | `getTenantActor()`; resolve-host API uses server secret |
| 8. Issues | `storefront-domains.ts` has 0 Zod — manual validation only |

**HTTP (prod):** 307

---

### `/dashboard/storefront/redirects`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Component: `StorefrontRedirectsPanel` → `storefront-advanced` actions |
| 3. Prisma | `StorefrontRedirect` via relation |
| 4. UI states | Empty, CRUD table |
| 5. Validation | Manual in `storefront-advanced` (no Zod) |
| 6. Optimization | Redirect list unbounded |
| 7. Security | `requireAdminStorefrontRow` in actions |
| 8. Issues | **`STOREFRONT_REDIRECTS_ENABLED` required in prod** — documented in UI |

**HTTP (prod):** 307

---

### `/dashboard/storefront/discounts`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Actions: `storefront-discounts` |
| 3. Prisma | `StorefrontDiscount` |
| 4. UI states | Empty, create form, list with toggle/delete |
| 5. Validation | Zod present |
| 6. Optimization | All discounts loaded |
| 7. Security | `getTenantActor()` |
| 8. Issues | None critical |

**HTTP (prod):** 307

---

### `/dashboard/storefront/seo`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-pillar-settings` (`updateStorefrontSeoSettingsFormAction`). Component: `SeoSocialPreviewLive`. |
| 3. Prisma | `storefrontSettings` SEO/pixel fields |
| 4. UI states | Empty, live preview |
| 5. Validation | Zod in pillar-settings |
| 6. Optimization | Single row |
| 7. Security | `getTenantActor()` |
| 8. Issues | None critical |

**HTTP (prod):** 307

---

### `/dashboard/storefront/analytics`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Service: `storefront-analytics-report-service`. Search params: `days` (7/30/90). |
| 3. Prisma | `StorefrontVisit`, `StorefrontConversionEvent`, `StorefrontOrder` (via service) |
| 4. UI states | Empty, empty report, charts/tables |
| 5. Validation | N/A (read-only) |
| 6. Optimization | **No `export const dynamic = 'force-dynamic'`** — may cache stale analytics in production |
| 7. Security | `getTenantActor()` |
| 8. Issues | **Recommend `force-dynamic` or short `revalidate`** |

**HTTP (prod):** 307

---

### `/dashboard/storefront/notifications`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | **Static page** — links only, no data fetching |
| 3. Prisma | None |
| 4. UI states | Static informational cards only |
| 5. Validation | N/A |
| 6. Optimization | Trivial |
| 7. Security | **No `getTenantActor()` in page** — relies on parent dashboard auth layout |
| 8. Issues | Inconsistent with other RSC pages; harmless if layout always runs |

**HTTP (prod):** 307

---

### `/dashboard/storefront/settings`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Actions: `storefront-settings`. Services: cart recovery, webhook log. |
| 3. Prisma | `storefrontSettings`, contact submissions (`take: 25`), cart recovery metrics |
| 4. UI states | Empty, business form, recovery chart, webhook log |
| 5. Validation | Zod in settings actions |
| 6. Optimization | Submissions capped at 25; webhook log limit 50 |
| 7. Security | `getTenantActor()`; owner-only staff permissions form |
| 8. Issues | Sub-route `/settings/experiments` exists with own loading/error |

**HTTP (prod):** 307

---

### `/dashboard/storefront/advanced`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Action: `storefront-settings` (theme experiment). Many experiment services/cards. |
| 3. Prisma | Experiment/edge sync models via services |
| 4. UI states | Complex dashboards, SRM, edge sync tables |
| 5. Validation | Mixed; `storefront-advanced` has **no Zod** |
| 6. Optimization | Heavy RSC — many parallel service calls |
| 7. Security | `getTenantActor()` |
| 8. Issues | **Large experimental surface** (60 `_experiments` services); ops noise for typical operators |

**HTTP (prod):** 307

---

### `/dashboard/storefront/preview`

| Level | Finding |
|-------|---------|
| 1. Page files | ✅ all three |
| 2. Connections | Component: `StorefrontPreviewFrame`. API: `preview-token` for cookie mint. |
| 3. Prisma | `findAdminStorefront` only |
| 4. UI states | Empty, iframe preview |
| 5. Validation | N/A |
| 6. Optimization | iframe loads public URL |
| 7. Security | Preview token gated by env config |
| 8. Issues | `preview-token` API has **no rate limit** |

**HTTP (prod):** 307

---

## Extended routes (beyond the 25)

| Route | page | loading | error | Notes |
|-------|------|---------|-------|-------|
| `/dashboard/storefront/pickup-windows` | ✅ | ✅ | ✅ | Only storefront page with `force-dynamic` |
| `/dashboard/storefront/forms/new` | ✅ | ✅ | ✅ | |
| `/dashboard/storefront/forms/[formId]` | ✅ | ✅ | ✅ | |
| `/dashboard/storefront/forms/.../submissions` | ✅ | ✅ | ✅ | |
| `/dashboard/storefront/pages/[pageId]` | ✅ | ✅ | ✅ | |
| `/dashboard/storefront/settings/experiments` | ✅ | ✅ | ✅ | |
| `/dashboard/storefront/team/audit` | ✅ | ✅ | ✅ | |

**Missing loading/error for the 25 canonical set:** **0**

---

## Layout & shared infrastructure

- **`layout.tsx`:** `getTenantActor()`, `StorefrontSubnav`, multi-store `StorefrontSwitcher` when `owned.length > 1`.
- **Root `error.tsx`:** Client boundary with Prisma/DB detection and reset — good operator UX.
- **Root `loading.tsx`:** `PilotRouteLoading` — consistent skeleton.

---

## Issues Found

### Critical (0)

No blocking security defects found in static review (tenant isolation present on admin mutations via `requireTenantActor` / `requireAdminStorefrontRow`).

### High (2)

| # | Area | Issue | Recommendation |
|---|------|-------|----------------|
| H1 | Analytics | No `force-dynamic` / revalidate on analytics RSC | Add `export const dynamic = 'force-dynamic'` or `revalidate = 0` |
| H2 | Products / Pages | Unbounded `findMany` / full menu product include | Add `take` + pagination or virtualized list |

### Medium (8)

| # | Area | Issue | Recommendation |
|---|------|-------|----------------|
| M1 | Public API | 15/24 routes lack `enforceStorefrontRateLimit*` | Add policies for `preview-token`, `guest-account`, `forms/upload`, `cart-recovery`, `resolve-redirect`, `account/session` |
| M2 | Actions | `storefront-advanced`, `storefront-domains`, `storefront-media`, theme experiment actions: **0 Zod** | Introduce shared path/status schemas |
| M3 | Actions | `storefront-pillar-settings`: 47 Zod refs but **0 revalidatePath** in file | Verify revalidation happens in called helpers or add explicit paths |
| M4 | Redirects | Middleware redirects require `STOREFRONT_REDIRECTS_ENABLED=true` | Document in deploy checklist; add health check |
| M5 | Architecture | Multi-brand workspaces: single owner-scoped storefront | Track `brandId` model in backlog (already noted in UI) |
| M6 | Advanced tab | 60 experimental services inflate bundle/complexity | Gate behind feature flag or separate “Labs” route |
| M7 | website page | Unused `dataUserId` | Remove or use for scoped query |
| M8 | Catalog admin | Loads full catalog context for active menu | Paginate or lazy-load variants/modifiers |

### Low (6)

| # | Area | Issue | Recommendation |
|---|------|-------|----------------|
| L1 | notifications | Static page without `getTenantActor()` | Add actor fetch for consistency (optional) |
| L2 | Fulfillment | Delivery zones as freeform JSON | Structured zone editor |
| L3 | Markets | Data in `settingsCenterJson` | Consider first-class `StorefrontMarket` model |
| L4 | Team RBAC | Permissions in JSON blob | Normalize to permission grants table |
| L5 | HTTP probe | All routes 307 without session | Run authenticated smoke in CI |
| L6 | services/ | 60 files under `_experiments/` | Archive or namespace outside production import graph |

---

## Recommendations (prioritized)

1. **Analytics freshness** — `force-dynamic` on `/dashboard/storefront/analytics`.
2. **Pagination** — `pages`, `products`, `builder` custom pages, `redirects`.
3. **Rate limits** — extend `storefront-rate-limit.ts` policies to unprotected public routes (especially `preview-token`, `forms/upload`, `cart-recovery`).
4. **Zod coverage** — `storefront-advanced`, `storefront-domains`, `storefront-media`, theme experiment actions.
5. **Deploy checklist** — `STOREFRONT_REDIRECTS_ENABLED`, `STOREFRONT_STRICT_LAUNCH`, storage for media upload, Resend for notifications.
6. **Simplify Advanced** — move experiment/neuromorphic/cosmic cards behind `STOREFRONT_LABS=1`.
7. **Authenticated smoke** — extend `npm run smoke:storefront-redirects` to all 25 dashboard routes.

---

## Storefront Architecture Overview

### Data flow

```
Page (RSC) → getTenantActor → findAdminStorefront / services
     ↓
Server Action → requireTenantActor → Service → Prisma → PostgreSQL
     ↓
revalidatePath / revalidateStorefrontDashboardAndPublic

Public guest:
Browser → /api/storefront/* → rate limit (partial) → service → Prisma
     ↓
/s/[storeSlug]/* (App Router public storefront)
```

### Key models

- **`StorefrontSettings`** — slug, publish flags, theme, domain mode, checkout/fulfillment fields
- **`StorefrontPage` / `StorefrontSection`** — builder content
- **`StorefrontOrder` / `StorefrontOrderItem`** — guest orders
- **`StorefrontForm` / `StorefrontFormSubmission`** — lead capture
- **`StorefrontDomain`** — custom host records (parallel to settings hostname fields)
- **`StorefrontTheme`** — theme snapshots
- **`StorefrontNavigation` / `StorefrontFooter`** — builder JSON
- **`StorefrontDiscount` / `StorefrontRedirect` / `StorefrontBlackoutDate`**
- **`StorefrontVisit` / `StorefrontConversionEvent`** — first-party analytics

### Public routes (guest)

| Path | Purpose |
|------|---------|
| `GET /s/[storeSlug]/menu` | Public menu |
| `GET /s/[storeSlug]/products/[ref]` | Product detail |
| `GET /s/[storeSlug]/cart` | Cart |
| `GET /s/[storeSlug]/checkout` | Checkout |
| `POST /api/storefront/cart` | Server cart sync |
| `POST /api/storefront/analytics` | Event ingest |
| `GET /api/storefront/catalog` | Catalog JSON |
| `POST` checkout via `actions/storefront-order` | Order submit |

---

## Audit completion

| Step | Status |
|------|--------|
| 1. File inventory | ✅ |
| 2. Per-page analysis (25 × 8 levels) | ✅ |
| 3. Actions & API analysis | ✅ |
| 4. Report `docs/storefront-audit-21may.md` | ✅ |

**No code changes were made during this audit** (documentation only).

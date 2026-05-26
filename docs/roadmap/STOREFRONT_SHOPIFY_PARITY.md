# Storefront ↔ Shopify parity roadmap

KitchenOS storefront targets **preorder kitchen ICP**, not a full Shopify clone. This document tracks bek/front alignment, architecture rules, and sprint order.

## Architecture (mandatory for every feature)

```
Admin (dashboard/storefront/*)
  → draft → publish snapshot → cache purge
        ↓ published JSON only
RSC Public (/s/[slug]/*) — prices, stock, theme
        ↓ kos_cart cookie (signed server cart)
API /api/storefront/cart — authority on lines/prices
        ↓ POST checkout
actions/storefront-order.ts — final validate + Order
```

**Rules**

| Rule | Implementation |
|------|----------------|
| Prices/stock/theme on render | `loadStorefrontMenuCatalogForPage`, `priceVersion`, `ProductAvailability` |
| Shared contracts | `lib/storefront/contracts/cart.ts`, Zod in order action |
| Optimistic UI | Client `useStorefrontCart`; server returns warnings + refreshed cart |
| Feature flags | `STOREFRONT_EXPERIMENTS_ENABLED` off in pilot |
| Smoke pyramid | unit → `storefront:phase0-complete` → Playwright → post-deploy |

## Phase 0 — Pilot close-out (ops)

| Step | Status | Command / artifact |
|------|--------|-------------------|
| Prod URL bind | Human | `STORAGE_KNOWN_PRODUCTION_URL=… npm run storefront:bind-deploy-url` |
| Manual QA | Human | `docs/artifacts/MANUAL_QA_SESSION_2026-05-17.md` |
| Phase 0 smoke | Auto | `npm run storefront:phase0-complete` |
| Media bucket | Auto | `npm run storefront:week2-complete` |
| Crons sync | Deploy | `npm run vercel:crons:production` |

## Phase 1 — Shopify Lite (implemented in code)

### 1.1 Cart v2 ✅

- **Bek:** `services/storefront/storefront-cart-service.ts`, `app/api/storefront/cart/route.ts`, signed cookie in `lib/storefront/server-cart.ts`
- **Front:** `hooks/use-storefront-cart.ts`, menu/cart/checkout use API; localStorage = cache only via `readCartFromStorage` fallback
- **Contract:** `lib/storefront/contracts/cart.ts`
- **Criterion:** Menu price change → `priceVersion` mismatch → warning or checkout reject

### 1.2 Inventory on storefront ✅

- **Bek:** `services/storefront/storefront-menu-availability-service.ts` → catalog `soldOut`, `availableQty`, `canAddToCart`
- **Front:** Sold-out badge, disabled `+`, cart caps, order action validates availability
- **Files:** `store-menu-client.tsx`, `storefront-order.ts`

### 1.3 Analytics funnel v1 ✅

- **Events:** `lib/storefront/analytics-events.ts` — `view_menu`, `add_to_cart`, `cart_view`, `begin_checkout`, `purchase`
- **Dashboard:** `storefront-analytics-report-service.ts` aggregates funnel

### 1.4 Domains ✅

- **Cron:** `/api/cron/storefront-domain-recheck` (6h in `config/vercel/crons-production.json`)
- **Admin:** Domains tab — Verify DNS + **Recheck now**

### 1.5 Builder publish gate ✅ (prior work)

- `lib/storefront/sections.ts`, `publish-checklist.ts`

### 1.6 Stripe Option B 📄

- **Today:** Platform Stripe keys (`storefront-payment-service.ts`)
- **Target:** Connect for merchant payouts — see `docs/roadmap/STOREFRONT_STRIPE_CONNECT_OPTION_B.md`
- **Admin:** Ordering tab shows readiness status

### 1.7 Tax & checkout extensions ✅

- **Tax:** `computeCheckoutTotals` + `kitchenSettings.defaultTaxRate`
- **Tips:** `checkout-extensions.ts` + checkout UI presets
- **Order:** `actions/storefront-order.ts` validates `priceVersion`, stock, totals

### 1.8 Customer account (lite) ✅

- **Route:** `/s/[slug]/account` — email lookup + Turnstile
- **API:** `/api/storefront/account/orders`
- **Footer:** “My orders” link

## Phase 2 — Implemented (code)

### 2.1 Variants & modifiers ✅

- **Prisma:** `StorefrontProductVariant`, `StorefrontModifierGroup`, `StorefrontModifierOption`
- **Cart line:** `{ productId, variantId?, modifierOptionIds?, quantity }` + `lineKey`
- **Contracts:** `lib/storefront/contracts/checkout-v2.ts`, extended `contracts/cart.ts`
- **Pricing:** `priceCartLines()` validates variants/modifiers against catalog

### 2.2 Shipping profiles (zones → line items) ✅

- **Engine:** `lib/storefront/shipping-engine.ts` (uses existing `deliveryZonesJson`)
- **API:** `POST /api/storefront/shipping/quote`
- **Checkout:** live quote on address blur/debounce; order action uses same engine

### 2.3 Stripe Connect (Option B) ✅ (flag-gated)

- **Env:** `STOREFRONT_STRIPE_CONNECT=1`, `STRIPE_CONNECT_CLIENT_ID`
- **Prisma:** Connect fields on `StorefrontSettings`
- **Onboarding:** `startStorefrontStripeConnectAction` → Express Account Link
- **Checkout:** `payment_intent_data.application_fee_amount` on connected account
- **Webhook:** `account.updated` refreshes charges/payouts flags
- **Admin:** Ordering tab + **Connect Stripe account** button

### 2.4 Customer portal v2 ✅

- **Prisma:** `StorefrontCustomer` (email + `supabaseUserId`)
- **Session API:** `GET /api/storefront/account/session`
- **UI:** Magic link sign-in panel + guest email lookup (Turnstile)

### 2.5 E2E & unit tests ✅

- `e2e/storefront-phase2-cart.spec.ts` — cart API, 409, shipping quote, checkout disabled
- `tests/unit/storefront-shipping-engine.test.ts`

### Apply DB migration (pilot)

```bash
unset DATABASE_URL DIRECT_URL
npm run diagnose:prisma-env          # must be OK
npm run db:apply-storefront-phase2   # idempotent SQL — do NOT raw db push
npm run dev:safe
```

### Week 1 — Phase 2 hardening ✅

| Task | Command / path |
|------|----------------|
| Dashboard CRUD variants/modifiers | `/dashboard/storefront/catalog` |
| Seed pilot `hello` (variants + sold-out) | `npm run storefront:seed-phase2-hello` |
| Stripe Connect smoke | `STOREFRONT_STRIPE_CONNECT=1 npm run storefront:stripe-connect-smoke` |
| E2E sold-out + cart 409 | `npm run test:e2e:storefront-phase2` (requires `dev:safe`) |
| Shipping zones visual editor | Fulfillment tab — `DeliveryZonesEditor` |
| Deposit + tips admin | Ordering tab — checkout extensions panel |
| Catalog API (QA) | `GET /api/storefront/catalog?storeSlug=hello` |
| Phase 0 gate | `npm run storefront:phase0-complete` |

---

## Phase 3 — Implemented

| # | Feature | Command / path |
|---|---------|----------------|
| 1 | **Prod sign-off** | `npm run storefront:prod-signoff` (+ `STOREFRONT_SMOKE_BASE_URL`) |
| 2 | **Markets routing** | `?market=id` + cookie `kos_market` → `/dashboard/storefront/markets` |
| 3 | **revalidateTag** | `sf-catalog-*`, `sf-theme-*`, `sf-settings-*` + `unstable_cache` on menu |
| 4 | **Reorder polish** | `StorefrontReorderActions` — preview dialog, replace vs add |
| 5 | **Required modifiers** | PDP blocks `+`; server `validateModifiers` fixed |
| 6 | **Lighthouse CI** | Staging gate: 200 check → LHCI; `LHCI_STRICT=1` to fail build |
| 7 | **Multi-staff** | `/dashboard/storefront/team` — workspace STAFF permissions |

## Phase 2.5 — Implemented (scaffold + reorder)

| Feature | Path / command |
|---------|----------------|
| **Reorder from order** | `POST /api/storefront/account/reorder`, `StorefrontReorderButton` on account + order confirmation |
| **Markets scaffold** | `/dashboard/storefront/markets`, `lib/storefront/markets.ts` (JSON in settings center; routing Phase 3) |
| **Catalog admin v2** | Edit variants inline, add/remove modifier options |
| **Menu ISR** | `revalidate = 60` on `/s/[slug]/menu` |
| **Lighthouse URLs** | menu, cart, checkout, account in `lighthouserc.cjs` |
| **Full verify** | `npm run storefront:phase2-verify` |

## Phase 6 — Implemented

| Priority | Feature | Path / command |
|----------|---------|----------------|
| P0 | Prod sign-off + email env | `STOREFRONT_CHECK_EMAIL=1 npm run storefront:prod-signoff` |
| P0 | RESEND on prod | `RESEND_API_KEY` + `RESEND_FROM_EMAIL` in release env check |
| P1 | LHCI vanity hosts | `LHCI_VANITY_HOSTS` in `lighthouserc.cjs` + staging gate |
| P1 | Stripe E2E in CI | `STOREFRONT_E2E_STRIPE=1` in `playwright-storefront.yml` |
| P2 | `storefront_team_invites` table | `npm run db:apply-storefront-phase6` |
| P2 | `/invite/[token]` deep link | `app/invite/[token]/page.tsx` |
| P2 | Wildcard DNS guide | `docs/STOREFRONT_WILDCARD_DNS.md` |
| P3 | Per-market cache tags | (Phase 5) |
| P3 | `next/image` LCP on menu | `store-menu-client.tsx` priority on first tile |
| P3 | brandId linkage UI | `/dashboard/storefront/workspace` |
| P3 | Invite reminder cron | `/api/cron/storefront-team-invite-reminders` daily |
| — | Phase 6 verify | `npm run storefront:phase6-verify` |

## Phase 5 — Implemented

| Priority | Feature | Path / command |
|----------|---------|----------------|
| P0 | Prod sign-off (extended) | `npm run storefront:prod-signoff` |
| P1 | LHCI_STRICT fail step | `.github/workflows/storefront-staging-gate.yml` |
| P1 | Pay-later checkout E2E | `npm run test:e2e:storefront-pay-later` |
| P1 | Stripe checkout E2E | `STOREFRONT_E2E_STRIPE=1 npm run test:e2e:storefront-stripe` |
| P2 | Auto-accept invites on login | `ensureAppUser` → `acceptPendingStorefrontInvitesForUser` |
| P2 | Invite email | `sendStorefrontTeamInviteEmail` via Resend |
| P2 | Vanity host per market | `hostSubdomain` + `hello-weekday.{root}` in middleware |
| P3 | Per-market cache tags | `sf-catalog-{slug}-{marketId}` + CDN purge |
| P3 | Image CDN hosts | `lib/storefront/image-cdn-config.ts` + `STOREFRONT_IMAGE_HOSTS` |
| P3 | Multi-store workspace UI | `/dashboard/storefront/workspace` |
| — | Phase 5 verify | `npm run storefront:phase5-verify` |

## Phase 4 — Implemented

| Priority | Feature | Path / command |
|----------|---------|----------------|
| P0 | Prod sign-off | `STOREFRONT_SMOKE_BASE_URL=… npm run storefront:prod-signoff` |
| P1 | LHCI strict staging | Repo var `LHCI_STRICT=1` + `storefront-staging-gate.yml` |
| P1 | Stripe Connect smoke | `npm run storefront:stripe-connect-smoke` |
| P2 | Per-market `activeMenuId` | `lib/storefront/market-resolve.ts`, markets visual editor |
| P2 | Workspace invite UI | `/dashboard/storefront/team` + `actions/storefront-team-invite.ts` |
| P2 | PDP/cart/checkout cache | `revalidate=60` + `loadStorefrontMenuCatalogForPage(…, market)` |
| P3 | CDN purge + tags | `purgeStorefrontCdnByScope` in `cdn-purge.ts` wired on catalog publish |
| P3 | Multi-slug / subdomain | `resolve-storefront.ts` subdomain column + market `storeSlug` in switcher |
| — | Phase 4 verify | `npm run storefront:phase4-verify` |

## Phase 3 — Remaining (backlog)

| Epic | Shopify analog | Notes |
|------|----------------|-------|
| Markets host routing | Markets | Full vanity host per market (beyond `?market=` + slug override) |
| Performance | CDN / Lighthouse | Image CDN, stricter perf budgets on prod |
| Multi-staff | Staff permissions | Email notifications for pending invites |

## Phase 3 — Platform (12+ months)

Markets, multi-store workspace, app webhooks, theme app blocks, subscriptions — **do not invest in pilot**.

## Conscious non-goals

POS, Shop App, 21k app store, Sidekick-level AI, enterprise experiment sync services.

## 4-week execution (recommended)

| Week | Focus | Outcome |
|------|-------|---------|
| 1 | Phase 0 sign-off | Pilot live on real Vercel URL |
| 2 | Cart v2 hardening | No localStorage price drift |
| 3 | Inventory QA | Sold-out E2E |
| 4 | Analytics + domains | Funnel visible; DNS auto-recheck |

## Key files index

| Area | Path |
|------|------|
| Cart API | `app/api/storefront/cart/route.ts` |
| Cart service | `services/storefront/storefront-cart-service.ts` |
| Catalog | `services/storefront/storefront-menu-catalog-service.ts` |
| Menu RSC | `lib/storefront/menu-page-data.ts` |
| Checkout action | `actions/storefront-order.ts` |
| Client hook | `hooks/use-storefront-cart.ts` |
| Phases doc | `docs/roadmap/STOREFRONT_PHASES_0_3.md` |

## Next human steps

1. `npm run dev:safe` → manual path: menu → cart → checkout → order status
2. Bind production URL → `npm run storefront:post-deploy`
3. `npm run vercel:crons:production`
4. Sign off Phase 1 → start Phase 2 variants

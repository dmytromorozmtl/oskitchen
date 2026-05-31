# OS Kitchen — Competitor Feature Audit Report

## Date: Sun May 31 07:31:05 EDT 2026
## Git: `080aeea9` Ship Shopify Markets Phase 25 consolidated B2B multi-invoice pay links.

**Method:** Read-only forensic audit against actual codebase paths, tests, artifacts, and RFC status. The internal `artifacts/competitor-feature-tracker.json` marks 54/96 items `done`; this report applies stricter sales-safe criteria (BETA gates, live-smoke proof, E2E env deps, honesty banners).

**Path note:** Many features live outside the audit script’s expected paths (e.g. delivery under `services/integrations/{doordash,uber-eats,grubhub}/`, handheld at `/dashboard/pos/handheld`, multi-location at `/dashboard/locations/dashboard`).

---

### Summary

| Category | Features | Done | Partial | Placeholder | Missing |
|----------|----------|------|---------|-------------|---------|
| Delivery Marketplace | 5 | 0 | 5 | 0 | 0 |
| POS & Offline | 1 | 0 | 1 | 0 | 0 |
| Table Service | 4 | 1 | 3 | 0 | 0 |
| Multi-Location | 2 | 0 | 2 | 0 | 0 |
| Workforce | 4 | 0 | 4 | 0 | 0 |
| E-Commerce | 4 | 0 | 2 | 2 | 0 |
| Reservations | 2 | 0 | 2 | 0 | 0 |
| Loyalty & Marketplace | 3 | 0 | 3 | 0 | 0 |
| **TOTAL** | **25** | **1** | **22** | **2** | **0** |

**Legend:** **Done** = YES in code with meaningful tests and no material sales caveats. **Partial** = implemented BETA/scaffold with honesty limits. **Placeholder** = RFC-only or live proof skipped / wiring-only. **Missing** = no meaningful implementation.

---

### Detailed Findings

#### Delivery Marketplace (DoorDash / Uber Eats / Grubhub)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| DoorDash ingest | **PARTIAL** | `services/integrations/doordash/doordash-service.ts`, `services/integrations/doordash/order-import.service.ts`, `app/api/webhooks/doordash/orders/route.ts`, `app/dashboard/integrations/doordash/page.tsx`, `actions/integrations/doordash.ts`, `tests/unit/doordash-order-import-canonical.test.ts` | **UNTESTED** — `e2e/doordash-integration.spec.ts` skips without `DOORDASH_E2E_CONNECTION_ID` | **parity** (BETA ingest path) | **ONLY_WITH_CAVEAT** — registry BETA; `getDoorDashPlaceholderMessage()` when env creds absent; partner API approval required |
| Uber Eats ingest | **PARTIAL** | `services/integrations/uber-eats/uber-eats-service.ts`, `services/integrations/uber-eats.ts`, `app/api/webhooks/uber-eats/orders/route.ts`, `app/dashboard/integrations/uber-eats/page.tsx`, `tests/unit/uber-eats-order-import-canonical.test.ts`, `tests/unit/uber-eats-webhook-signature.test.ts` | **UNTESTED** — `e2e/uber-eats-integration.spec.ts` env-gated | **parity** | **ONLY_WITH_CAVEAT** — BETA + credential/env dependency |
| Grubhub ingest | **PARTIAL** | `services/integrations/grubhub/grubhub-service.ts`, `app/api/webhooks/grubhub/orders/route.ts`, `app/dashboard/integrations/grubhub/page.tsx`, `actions/integrations/grubhub.ts`, `tests/unit/grubhub-order-import-canonical.test.ts` | **UNTESTED** — `e2e/grubhub-integration.spec.ts` env-gated | **parity** | **ONLY_WITH_CAVEAT** — BETA |
| Menu sync → marketplaces | **PARTIAL** | `services/integrations/doordash/menu-sync.service.ts` (`pushMenu`), `services/integrations/uber-eats/menu-sync.service.ts`, `services/integrations/grubhub/menu-sync.service.ts`, API routes `app/api/integrations/{doordash,uber-eats,grubhub}/menu/route.ts`, `syncMenuTo*` exports in each service | **UNTESTED** live — unit coverage on Uber menu sync only | **parity** | **ONLY_WITH_CAVEAT** — push requires live marketplace API creds |
| Unified delivery analytics | **PARTIAL** | `services/analytics/delivery-channel-analytics.ts`, `app/dashboard/analytics/delivery-channels/page.tsx`, `tests/unit/delivery-channel-analytics.test.ts` | **UNTESTED** browser E2E | **parity** | **YES** for aggregated reporting; **ONLY_WITH_CAVEAT** if claiming live marketplace connection health |

**Registry:** `lib/integrations/integration-registry.ts` — DoorDash, Grubhub, Uber Eats all **BETA**; Uber Direct **PLACEHOLDER**.

---

#### POS & Offline (Square Parity)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| Offline mode default | **PARTIAL** | `lib/pos/pos-settings.ts` (`offlineQueueEnabled: true` default), `lib/pos/offline-pos-queue.ts` (client IndexedDB), `services/pos-offline-queue.ts` (server replay), `components/dashboard/pos-terminal-client.tsx`, `lib/pos/pos-offline.ts`, `tests/unit/offline-sync.test.ts`, `e2e/pos-offline-queue.spec.ts` | **YES** spec present | **behind** certified Square offline card capture | **ONLY_WITH_CAVEAT** — enabled by default for cash/mark-paid queue; explicitly **no offline card**; server queue is in-memory staging buffer |

---

#### Table Service (TouchBistro Parity)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| Floor plan drag-and-drop | **PARTIAL** | `app/dashboard/floor-plans/page.tsx`, `components/restaurant/floor-plan-editor.tsx` (drag state, grid snap, `updateTablePosition`), `services/restaurant/table-service.ts`, `actions/restaurant/tables.ts` | **UNTESTED** — no dedicated floor-plan E2E | **parity** layout editor | **ONLY_WITH_CAVEAT** — BETA; no dedicated editor/view sub-routes |
| Real-time table occupancy | **PARTIAL** | `components/restaurant/floor-plan-editor.tsx` + `hooks/use-synced-server-state.ts` (prop sync after `router.refresh`, **not WebSocket**) | **UNTESTED** | **behind** TouchBistro live floor sync | **NO** for “real-time” — honesty: refresh-based only; KDS has websocket RFC but floor plan does not |
| Handheld ordering | **PARTIAL** | `app/dashboard/pos/handheld/page.tsx`, `components/pos/handheld-ordering-client.tsx`, `services/pos/handheld-ordering-service.ts`, `lib/pos/handheld-ordering.ts`, `e2e/handheld-ordering.spec.ts`, `docs/HANDHELD_ORDERING.md` | **YES** Playwright smoke | **parity** mobile waiter UI | **ONLY_WITH_CAVEAT** — `page-maturity-honesty.ts`: BETA PWA; tab fire needs connectivity; not certified native hardware |
| Complete bill splitting | **YES** | `lib/pos/bill-splitting.ts` (equal, percentage, seat, item), `services/pos/bill-splitting-service.ts`, `components/pos/bill-split-panel.tsx`, `actions/pos/bill-split.ts`, `tests/unit/bill-splitting.test.ts`, `e2e/bill-splitting.spec.ts` | **YES** | **parity** | **YES** |

---

#### Multi-Location (Lightspeed Parity)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| Multi-location dashboard | **PARTIAL** | `app/dashboard/locations/dashboard/page.tsx`, `services/analytics/multi-location-analytics.ts`, `tests/unit/multi-location-analytics.test.ts` — **not** at `app/dashboard/multi-location/` | **UNTESTED** | **parity** ops rollup | **ONLY_WITH_CAVEAT** — `PlanGate` feature `multi_location` |
| Advanced reporting + benchmarking | **PARTIAL** | `services/analytics/advanced-reporting-service.ts` (period-over-period benchmarks, 7-day forecast, anomalies), `app/dashboard/analytics/advanced/page.tsx`, `tests/unit/advanced-reporting.test.ts` | **UNTESTED** | **behind** on industry benchmarking — internal period compare only | **ONLY_WITH_CAVEAT** — do not claim industry benchmarks |

---

#### Workforce Management (7shifts/Homebase Parity)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| AI scheduling | **PARTIAL** | `services/labor/ai-scheduling-service.ts`, `actions/labor/ai-scheduling.ts`, `app/dashboard/staff/schedule/page.tsx`, `tests/unit/ai-scheduling-service.test.ts` — demand/heuristic planner, not ML black box | **UNTESTED** | **parity** suggestions | **ONLY_WITH_CAVEAT** — label as “AI-assisted staffing suggestions” |
| Tip pooling | **PARTIAL** | `services/labor/tip-pooling-service.ts`, `lib/labor/tip-pool-settings.ts`, `actions/labor/tip-pooling.ts`, `services/labor/tip-pooling-load.ts` | **UNTESTED** | **parity** | **ONLY_WITH_CAVEAT** — BETA labor module |
| Labor cost % realtime | **PARTIAL** | `services/labor/labor-realtime-service.ts`, `app/api/labor/realtime/route.ts`, `components/labor/labor-realtime-tracker.tsx`, `components/labor/labor-realtime-widget.tsx`, `tests/unit/labor-realtime-service.test.ts` | **UNTESTED** | **parity** | **ONLY_WITH_CAVEAT** — polling/API snapshot, not sub-second POS labor |
| Team communication | **PARTIAL** | `services/team/team-communication-service.ts`, `components/dashboard/staff/team-communication-panel.tsx`, `app/dashboard/staff/team/page.tsx`, `tests/unit/team-communication-service.test.ts` — operational event feed, not full chat | **UNTESTED** | **behind** Slack-style messaging | **ONLY_WITH_CAVEAT** — staff ops feed, not two-way team chat |

**Note:** 7shifts/Homebase also appear as **BETA** entries in `integration-registry.ts` (separate from native labor modules).

---

#### E-Commerce (Shopify/WooCommerce)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| Live smoke (Woo/Shopify) | **PLACEHOLDER** | `artifacts/woocommerce-live-smoke-summary.json`, `artifacts/shopify-live-smoke-summary.json`, `artifacts/channel-live-smoke-summary.json` — all **`overall: SKIPPED`** missing staging env; synthetic golden-path cert **PASSED** in channel summary | **BLOCKED_BY_VAULT** | **behind** live-certified connectors | **NO** for “live certified” — **ONLY_WITH_CAVEAT** for wiring/synthetic cert |
| Bidirectional inventory sync | **PARTIAL** | `services/integrations/inventory-sync-service.ts`, `services/integrations/inventory-sync-load.ts`, `actions/integrations/inventory-sync.ts`, `app/dashboard/integrations/inventory-sync/page.tsx`, `components/integrations/inventory-sync-panel.tsx`, `tests/unit/inventory-sync-service.test.ts` | **UNTESTED** live | **parity** conflict resolution UX | **ONLY_WITH_CAVEAT** — Shopify/Woo compare + resolve; not at legacy path `services/inventory/channel-inventory-sync.ts` |
| Shopify Markets | **PARTIAL** | Extensive stack: `docs/shopify-markets-rfc.md` (Phases 1–25 B2B shipped per RFC/tracker), `services/integrations/shopify-markets-service.ts`, bidirectional services, B2B AR/receivables phases, `components/dashboard/integrations/shopify-markets-panel.tsx`, 20+ unit tests | **UNTESTED** live tenant — smoke SKIPPED | **ahead** on B2B AR depth vs typical POS; **parity** on core Markets discovery/sync | **ONLY_WITH_CAVEAT** — many B2B sub-features flag-gated (`SHOPIFY_MARKETS_B2B_*`); do not claim full Markets Pro parity |
| WooCommerce Subscriptions | **PLACEHOLDER** | `docs/woocommerce-subscriptions-rfc.md` — **“not implemented”**; native meal plans exist separately (`CustomerSubscription`, meal-plan cron) but **no Woo bridge** | **N/A** | **behind** Woo-native subscription merchants | **NO** |

---

#### Reservations (Resy/OpenTable Parity)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| Reservation system | **PARTIAL** | `app/dashboard/reservations/page.tsx`, `services/storefront/reservation-service.ts`, `services/storefront/reservation-public-service.ts`, `app/s/[storeSlug]/reservations/page.tsx`, `app/api/storefront/reservations/route.ts`, `components/storefront/reservations-calendar-client.tsx`, `tests/unit/reservation-conflict.test.ts` | **UNTESTED** full E2E | **parity** calendar + public booking | **ONLY_WITH_CAVEAT** — BETA; deep POS table sync not certified (`page-maturity-honesty.ts`) |
| Waitlist + SMS | **PARTIAL** | `services/storefront/waitlist-service.ts`, `services/storefront/waitlist-management-service.ts` (`sendWaitlistJoinedSms`, `sendWaitlistReadySms`), `actions/storefront-reservations.ts`, `e2e/waitlist-public.spec.ts`, `tests/unit/waitlist-service.test.ts` | **PARTIAL** — public waitlist E2E | **parity** waitlist | **ONLY_WITH_CAVEAT** — SMS on waitlist notify/join; **no reservation confirmation SMS** found |

---

#### Loyalty & Marketplace (SpotOn/Clover Parity)

| Feature | Exists | File evidence | E2E | vs Competitor | Sales claim safe? |
|---------|--------|---------------|-----|---------------|-------------------|
| Restaurant-specific loyalty | **PARTIAL** | `services/loyalty/restaurant-loyalty-service.ts` (tiers, item bonuses, visit rewards), `lib/loyalty/restaurant-loyalty-settings.ts`, `app/dashboard/customers/loyalty/page.tsx`, `app/dashboard/storefront/loyalty/page.tsx`, `app/api/storefront/loyalty/{balance,redeem}/route.ts` | **UNTESTED** | **parity** | **ONLY_WITH_CAVEAT** — not at legacy path `services/loyalty/restaurant-loyalty.ts` |
| App marketplace | **PARTIAL** | `docs/app-marketplace-rfc.md` (Phases 1–7 shipped per tracker), `app/dashboard/integrations/extensions/page.tsx`, `services/platform/extensions-catalog-service.ts`, OAuth apps + outbound webhooks routes; UI explicitly states **“not a self-serve OAuth app store yet”** | **UNTESTED** | **behind** Toast/Square/Shopify app stores | **NO** for “app marketplace”; **ONLY_WITH_CAVEAT** for “extensions catalog / partner directory BETA” |
| Restaurant capital | **PARTIAL** | `docs/restaurant-capital-rfc.md` (Phases 1–6), `app/dashboard/analytics/capital/page.tsx`, `components/dashboard/analytics/capital-lender-marketplace-panel.tsx`, `services/commercial/capital-lender-oauth-service.ts`, lender webhooks/OAuth API routes, unit tests | **UNTESTED** live lender | **parity** referral/OAuth hub | **NO** for “instant funding”; **ONLY_WITH_CAVEAT** for partner referral + lender OAuth BETA — KitchenOS does not originate loans |

---

### Top 5 Blockers

1. **Live channel smoke proof SKIPPED** — Woo, Shopify, and combined channel artifacts missing staging credentials (`E2E_STAGING_BASE_URL`, `ENCRYPTION_KEY`, channel connection IDs). Cannot claim live-certified integrations.
2. **WooCommerce Subscriptions unimplemented** — RFC-only; meal-prep merchants on Woo Subscriptions have no bridge; deal risk vs WordPress-native stacks.
3. **“Real-time” table/floor gaps** — floor plan uses refresh/prop sync, not WebSocket; sales language must not imply TouchBistro-grade live occupancy.
4. **Delivery marketplace live dependency** — all three marketplaces BETA with env-gated E2E; production ingest requires partner credentials and API host approval.
5. **App marketplace positioning** — extensions catalog + OAuth sandbox shipped, but no self-serve install store; procurement “marketplace” checkbox still fails vs Toast/Square.

---

### Recommended Next Actions

1. **Configure staging channel smoke env** and re-run live smoke to move Woo/Shopify from SKIPPED → PASS or honest FAIL with artifact proof.
2. **Ship WooCommerce Subscriptions Phase 1** (read-only subscription import) or explicitly de-scope in sales collateral until native meal plans suffice.
3. **Add floor-plan realtime** (Supabase/KDS-style channel) or tighten marketing copy to “refresh-based floor view.”
4. **Complete Shopify Markets Phase 26** (B2B AR sync policy & drift resolution) — next item on internal tracker after Phase 25 consolidated pay.
5. **Publish integration maturity matrix update** reconciling `competitor-feature-tracker.json` (optimistic “done”) with this sales-safe audit.

---

### Tracker vs Audit Reconciliation

| Tracker key | Tracker status | Audit verdict |
|-------------|----------------|---------------|
| `doordash-ingest` / `uber-eats-ingest` / `grubhub-ingest` | done | PARTIAL (BETA, env-gated E2E) |
| `delivery-analytics-unified` | done | PARTIAL (no browser E2E) |
| `offline-mode-default` | done | PARTIAL (caveats on card offline) |
| `floor-plan-editor` | done | PARTIAL |
| `handheld-ordering` | done | PARTIAL |
| `bill-splitting-complete` | done | **YES** |
| `multi-location-dashboard` | done | PARTIAL (plan gate) |
| `advanced-reporting` | done | PARTIAL |
| `woocommerce-subscriptions-rfc` | done | **PLACEHOLDER** (RFC shipped, product not) |
| `shopify-markets-rfc` | done | PARTIAL (deep code, flag-gated B2B) |

**Internal tracker:** 54/96 keys marked `done` · **This audit (25 competitor features):** 1 done · 22 partial · 2 placeholder · 0 missing.

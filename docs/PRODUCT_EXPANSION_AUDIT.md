# OS Kitchen — Product expansion audit

This document audits the MVP baseline (post-integration expansion pass) against the vertical SaaS vision. Each row follows: **current state**, **gaps**, **recommended upgrade**, **priority** (P0–P3), **risk** (Low / Medium / High).

---

## Landing page

| | |
|---|---|
| **Current** | Marketing shell with signup paths; positions preorder/kitchen workflows. |
| **Gaps** | Channel messaging (“one dashboard for every order channel”), trust badges, integration logos, clearer ICP segments (meal prep vs bakery vs ghost kitchen). |
| **Upgrade** | Above-the-fold value prop refresh, rotating integration strip, social proof, FAQ on webhooks/security. |
| **Priority** | P2 |
| **Risk** | Low |

---

## Signup / login

| | |
|---|---|
| **Current** | Supabase email/password, PKCE callback, middleware-protected routes, `ensureAppUser` mirrors profile + default subscription. |
| **Gaps** | MFA, SSO, org invites, email verification hardening for production. |
| **Upgrade** | Optional MFA; team invites (Phase 20); magic-link variant for operators. |
| **Priority** | P2 |
| **Risk** | Medium (auth UX changes affect conversion) |

---

## Dashboard

| | |
|---|---|
| **Current** | Operational snapshot, navigation shell, locale-aware labels. |
| **Gaps** | Cross-channel KPIs, onboarding checklist, integration health widgets. |
| **Upgrade** | Embed integration status + Order hub summary cards; setup checklist (Phase 22). |
| **Priority** | P1 |
| **Risk** | Low |

---

## Menus

| | |
|---|---|
| **Current** | Weekly menus, products tied to menus, plan limits on menu count. |
| **Gaps** | Multi-channel publish workflow, per-channel pricing/overrides, conflict detection. |
| **Upgrade** | `MenuChannelPublish` model exists — build `/dashboard/menus/[id]/channels` UI (Phase 12). |
| **Priority** | P1 |
| **Risk** | Medium |

---

## Products

| | |
|---|---|
| **Current** | Rich product fields, categories, allergens, production linkage. |
| **Gaps** | SKU-first ops, external ↔ internal mapping UI, bulk import from channels. |
| **Upgrade** | Unmatched external SKUs screen; map/create/ignore flows (Phase 11). |
| **Priority** | P1 |
| **Risk** | Medium |

---

## Orders

| | |
|---|---|
| **Current** | Internal orders CRUD, statuses, fulfillment types, customer-facing lookup token. |
| **Gaps** | Import pipeline from `ExternalOrder` → internal `Order`, batch actions, channel attribution on internal orders. |
| **Upgrade** | Order hub actions: import selected, assign menu/date, dispatch delivery (Phase 10). |
| **Priority** | P0 |
| **Risk** | High if breaking existing capture flows — mitigate with feature flags & thorough QA. |

---

## Production

| | |
|---|---|
| **Current** | Tasks per product (cooked/packed/labeled), assignment string, dashboard views. |
| **Gaps** | Batches, prep stages, ingredient demand, station filters, channel grouping. |
| **Upgrade** | `ProductionBatch` model + kanban/table/kitchen modes (Phase 13). |
| **Priority** | P1 |
| **Risk** | Medium |

---

## Packing

| | |
|---|---|
| **Current** | Packing-oriented UI / exports at MVP level. |
| **Gaps** | Label templates (4×6, Avery), QR verification, allergen lane routing. |
| **Upgrade** | Printable label pipeline + packing checklist (Phase 14). |
| **Priority** | P1 |
| **Risk** | Medium |

---

## Customers

| | |
|---|---|
| **Current** | Customer list derived from orders / basic CRM slice. |
| **Gaps** | Unified cross-channel profile, LTV, favorites, dietary tags, timeline. |
| **Upgrade** | Aggregate by email/phone; channel badges; notes & preferences (Phase 15). |
| **Priority** | P2 |
| **Risk** | Low |

---

## Billing

| | |
|---|---|
| **Current** | Stripe Checkout + portal webhooks; plans Starter / Pro / Team / **Enterprise (contact)**; usage limits for menus & orders; integration count in limits object. |
| **Gaps** | Stripe price for Enterprise; strict integration/order meter enforcement UI; usage dashboards. |
| **Upgrade** | Surface meters + upgrade prompts; wire `maxIntegrations` enforcement on connect (Phase 19). |
| **Priority** | P2 |
| **Risk** | Medium |

---

## Settings

| | |
|---|---|
| **Current** | Kitchen settings (hours, locale, notifications, delivery toggles). |
| **Gaps** | Global webhook base URL, retry policy, staff roster, security/rotation docs surfacing. |
| **Upgrade** | Expand sections per Phase 18; link to encryption key rotation instructions. |
| **Priority** | P2 |
| **Risk** | Low |

---

## Database schema & Prisma

| | |
|---|---|
| **Current** | Extended with integration enums/models: `IntegrationConnection`, `ExternalOrder`, `ExternalProduct`, `OrderChannel`, `WebhookEvent`, `DeliveryDispatch`, `MenuChannelPublish`; `SubscriptionPlan.ENTERPRISE`. |
| **Gaps** | Production batch / inventory models (Phases 13, 17); multi-location tenancy. |
| **Upgrade** | Incremental migrations only; backfill scripts as needed. |
| **Priority** | P0 (foundation done); next P1 for batches |
| **Risk** | Medium if migrations applied without backup |

---

## Supabase auth

| | |
|---|---|
| **Current** | SSR-safe client, session in middleware, profile row sync. |
| **Gaps** | Row-level security if exposing DB to client; service role discipline. |
| **Upgrade** | Keep server-side Prisma default; document RLS posture (`supabase/rls.sql`). |
| **Priority** | P2 |
| **Risk** | Low |

---

## Stripe

| | |
|---|---|
| **Current** | Checkout for three paid tiers; webhook syncs subscription rows; degrades without keys. |
| **Gaps** | Metered billing for orders; Enterprise custom contracts. |
| **Upgrade** | Usage records or hybrid billing for high-volume merchants. |
| **Priority** | P3 |
| **Risk** | Medium |

---

## Resend

| | |
|---|---|
| **Current** | Transactional emails + cron reminders; safe no-op without API key. |
| **Gaps** | SMS fallback placeholders; per-channel branded templates. |
| **Upgrade** | Template variables for external order context (Phase 18). |
| **Priority** | P2 |
| **Risk** | Low |

---

## Environment variables

| | |
|---|---|
| **Current** | Documented Supabase, Stripe, Resend, cron; **`ENCRYPTION_KEY`** added for AES-GCM secret storage. |
| **Gaps** | Uber / Shopify custom env namespaces when hardening multi-tenant secrets (optional KMS). |
| **Upgrade** | Validate env at boot for production (`lib/env` pattern extension). |
| **Priority** | P2 |
| **Risk** | Medium if secrets logged |

---

## Integrations (new)

| | |
|---|---|
| **Current** | WooCommerce REST test/sync + signed webhooks; Shopify GraphQL sync + HMAC webhooks; Uber Eats & Uber Direct adapters with honest placeholders; encrypted credentials; webhook event log. |
| **Gaps** | Full OAuth for Shopify public apps; Woo webhook registration API; Uber partner-signed verification; automatic internal order creation; replay tooling. |
| **Upgrade** | Harden idempotency, add replay & DLQ-style UX (Phase 21); import wizard (Phase 10–11). |
| **Priority** | P0 |
| **Risk** | High without staging stores — mitigate with sandbox credentials |

---

## Overall limitations (today)

- External orders are stored and visible; **automatic promotion** into internal `Order` + line items is not fully productized yet.
- Uber marketplace & Uber Direct **live** HTTP calls are intentionally stubbed pending partner endpoints.
- Analytics, inventory lite, advanced production/packing, and roles are **roadmapped** — schema hooks exist where noted.

---

## Sequencing recommendation

1. **P0** — Order hub import actions + product matching (`ExternalProduct.mappedProductId` usage).  
2. **P1** — Menu channel publish UI; production batches; packing labels.  
3. **P2** — CRM unification; settings expansion; billing meters.  
4. **P3** — Enterprise Stripe SKUs; advanced analytics; multi-location.

This ordering preserves a working deploy after each increment.

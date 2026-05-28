# KitchenOS Product Positioning

Status: canonical positioning draft tied to current implementation reality
Primary evidence: `docs/system-reality-model.md`, `README.md`, `app/dashboard/pos/terminal/page.tsx`, `app/s/[storeSlug]/checkout/page.tsx`, `services/orders/order-creation-service.ts`, `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`, `docs/INTEGRATION_MATURITY_MATRIX.md`

## 1. Core Positioning
KitchenOS should be positioned as:

> the modern operating platform for restaurants, cafes, bars, ghost kitchens, catering teams, and multi-location food businesses.

The most accurate strategic framing today is not "replacement for every incumbent POS stack on day one." It is "the unified operating layer that connects front of house, back of house, online ordering, customer growth, and operations on top of a strong order and storefront core." Evidence: `docs/system-reality-model.md`, `services/orders/order-creation-service.ts`, `app/dashboard/pos/terminal/page.tsx`, `app/s/[storeSlug]/checkout/page.tsx`.

## 2. Ideal Customer Profiles
- Founder-led and operator-led food businesses that feel pain from disconnected tools for ordering, production, storefront, delivery coordination, CRM, and operational reporting.
- Multi-channel operators already selling through a mix of direct ordering, phone/manual orders, and commerce channels such as Shopify or WooCommerce. Evidence: `actions/integrations.ts`, `docs/INTEGRATION_MATURITY_MATRIX.md`.
- Restaurants, cafes, bars, ghost kitchens, catering teams, and meal-prep businesses that want one operator console instead of separate storefront, packing, CRM, and reporting systems. Evidence: `app/dashboard/`, `app/s/[storeSlug]/`, `README.md`.
- Multi-location operators that can tolerate pilot/beta posture in some modules while prioritizing unification over perfect hardware depth. Evidence: `prisma/schema.prisma`, `docs/ENTERPRISE_READINESS_AUDIT_FINAL.md`.

## 3. Non-ICP For Early Stages
- Large enterprise chains requiring production-certified offline POS, native hardware ecosystems, SSO/SCIM, and formal compliance attestations today. Evidence: `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/ENTERPRISE_SECURITY_ROADMAP.md`.
- Operators whose primary buying criteria are native hardware breadth or deep accounting/GL replacement. Evidence: `docs/POS_ARCHITECTURE.md`, `docs/kitchenos-p0-p3-readiness-audit.md`.
- Operators who only need a simple card-present POS with no interest in storefront, production, customer growth, or operational control. KitchenOS is stronger when the workflow is multi-surface. Evidence: `docs/system-reality-model.md`.

## 4. Primary Use Cases
- Counter, pickup, and online-order operations with one shared order spine. Evidence: `actions/pos.ts`, `actions/storefront-order.ts`, `services/orders/order-creation-service.ts`.
- Storefront-led ordering for branded restaurants, cafes, and catering businesses. Evidence: `app/s/[storeSlug]/`, `services/storefront/`.
- Multi-channel order management with direct, manual, public API, and imported channel flows converging into one operating model. Evidence: `app/api/public/v1/orders/route.ts`, `actions/orders.ts`, `actions/integrations.ts`.
- Production, packing, and fulfillment-heavy operations such as meal prep, catering, ghost kitchen, and commissary workflows. Evidence: `actions/packing.ts`, `actions/packing-verification.ts`, `services/pos/pos-kitchen-routing-service.ts`, `README.md`.
- Customer profile, loyalty, and gift card workflows connected to commerce and POS. Evidence: `actions/customers.ts`, `actions/loyalty.ts`, `actions/gift-cards.ts`.

## 5. Product Pillars
### A. Front Of House
- POS
- tables
- floor plans
- servers
- bar tabs
- handheld
- payments
- tips
- receipts
- refunds
- voids
- manager overrides

Current truth: POS, checkout, shifts, receipts, refunds, and voids are real; table service, bar speed workflows, handheld resilience, and hardware depth are not yet certification-grade. Evidence: `app/dashboard/pos/terminal/page.tsx`, `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `docs/POS_ARCHITECTURE.md`.

### B. Back Of House
- KDS
- station routing
- prep
- production
- packing
- quality control
- allergens
- waste
- kitchen analytics

Current truth: production, packing, allergen/nutrition, and kitchen-routing foundations are real; KDS/service-line maturity is still uneven. Evidence: `actions/packing.ts`, `actions/packing-verification.ts`, `actions/inventory.ts`, `services/pos/pos-kitchen-routing-service.ts`, `docs/KITCHEN_SCREEN_ARCHITECTURE.md`.

### C. Online & Omnichannel
- storefront
- online ordering
- QR ordering
- kiosk
- pickup
- delivery
- catering
- customer accounts
- order tracking

Current truth: storefront, checkout, accounts/session, order tracking, pickup/delivery rules, and catering surfaces are real; QR self-order, kiosk, and some publish/rollback/media layers are still partial. Evidence: `app/s/[storeSlug]/`, `app/api/storefront/guest-account/route.ts`, `actions/storefront-order.ts`, `docs/STOREFRONT_COMPLETION_AUDIT.md`.

### D. Growth
- CRM
- loyalty
- gift cards
- campaigns
- segmentation
- feedback
- reviews
- referrals

Current truth: CRM, segments, loyalty, gift cards, and some feedback/follow-up tooling are real; full campaign automation and attribution maturity lag Mailchimp/Klaviyo-class expectations. Evidence: `actions/customers.ts`, `actions/loyalty.ts`, `actions/gift-cards.ts`, `services/marketing/email-marketing-service.ts`.

### E. Operations
- inventory
- recipe costing
- purchasing
- staff
- scheduling
- shifts
- time clock
- compliance

Current truth: foundational inventory, costing, purchasing, staff, schedule, and time-clock systems exist; compliance, payroll depth, and enterprise controls are not fully mature. Evidence: `actions/inventory.ts`, `actions/costing.ts`, `actions/purchasing.ts`, `actions/staff.ts`, `actions/labor/time-clock.ts`, `actions/training.ts`.

Loyalty and gift cards: POS checkout applies the **kitchen** ledger (`giftCard`, `loyaltyAccount`). Storefront uses **separate** `storefrontGiftCard` / `storefrontLoyalty*` models — codes and points are **not** interchangeable across channels (**dual ledger**). Policies: `era4-cross-channel-rewards-v1`, permanent GTM lock `era6-dual-ledger-gtm-lock-v1` (`lib/rewards/cross-channel-rewards-policy.ts`).

### F. Intelligence
- analytics
- forecasting
- AI recommendations
- menu engineering
- margin analysis
- operational insights

Current truth: analytics, reports, costing alerts, and forecast surfaces exist; AI must still be treated as preview/beta and never as autonomous production control. Evidence: `app/dashboard/analytics/`, `app/dashboard/forecast/`, `services/ai/`, `actions/costing.ts`.

### G. Platform
- RBAC
- multi-location
- enterprise governance
- integrations
- API
- webhooks
- audit
- security
- billing

Current truth: all of these surfaces exist, but RBAC canon, enterprise governance, and certification posture are the main platform gaps. Evidence: `lib/permissions/`, `lib/scope/`, `actions/integrations.ts`, `app/api/public/`, `app/api/webhooks/`, `actions/billing.ts`.

## 6. Competitive Advantage
- Unified order spine across manual, POS, storefront, and public API flows. Evidence: `services/orders/order-creation-service.ts`, `actions/pos.ts`, `app/api/public/v1/orders/route.ts`.
- Better connection between commerce capture and kitchen/packing/operations than generic commerce stacks. Evidence: `services/pos/pos-kitchen-routing-service.ts`, `actions/packing.ts`, `README.md`.
- Honest integration and maturity vocabulary can become a trust differentiator if consistently enforced. Evidence: `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/MARKETING_PAGES_EXPANSION_HONESTY.md`.
- Ability to serve both preorder-heavy and restaurant-service workflows from one codebase, provided maturity is governed carefully. Evidence: `README.md`, `app/dashboard/pos/`, `app/dashboard/meal-plans/`, `app/dashboard/catering-quotes/`.

## 7. Differentiation Against Toast
- Do not compete head-on on native hardware, offline depth, or ecosystem size yet. Evidence: `docs/POS_ARCHITECTURE.md`.
- Compete on unified storefront + order hub + production + packing + CRM workflow, especially for operators who outgrow POS-only thinking. Evidence: `docs/system-reality-model.md`, `actions/pos.ts`, `actions/storefront-order.ts`.
- Best narrative: KitchenOS is the operating layer for operators who need more than a terminal. It connects direct ordering, kitchen execution, packaging, delivery coordination, and customer growth in one system.

## 8. Differentiation Against Square
- Square wins on simplicity and payment familiarity. KitchenOS should not deny that. Evidence: `docs/system-reality-model.md`.
- KitchenOS should differentiate on operational breadth after checkout: production, packing, route planning, customer depth, and multi-surface order governance. Evidence: `app/dashboard/production/`, `app/dashboard/routes/`, `actions/customers.ts`.

## 9. Differentiation Against Lightspeed
- Lightspeed sets a stronger expectation for inventory and reporting depth.
- KitchenOS should compete by unifying inventory and costing with commerce, storefront, and operational signals rather than by claiming equal maturity today. Evidence: `actions/costing.ts`, `actions/inventory.ts`, `docs/system-reality-model.md`.

## 10. Differentiation Against TouchBistro
- TouchBistro is restaurant-focused and table-service credible.
- KitchenOS should differentiate on direct commerce, multi-channel order flows, catering/ghost-kitchen/meal-prep flexibility, and modern platform extensibility. Evidence: `app/s/[storeSlug]/`, `actions/catering-quotes.ts`, `app/api/public/v1/orders/route.ts`.

## 11. Differentiation Against Shopify / WooCommerce
- Shopify and WooCommerce are strong commerce ecosystems but not purpose-built restaurant operating systems.
- KitchenOS should position itself as the operational brain after the order is captured: production, kitchen, fulfillment, packing verification, customer history, and operator control. Evidence: `actions/integrations.ts`, `services/orders/order-creation-service.ts`, `actions/packing-verification.ts`.

## 12. What KitchenOS Should Not Claim Yet
- Full Toast/Square replacement across all hardware and offline scenarios.
- Production-certified native Stripe Terminal or restaurant hardware ecosystem.
- Broad live marketplace coverage across DoorDash/Uber/Grubhub without partner certification and verified production flows.
- Enterprise-grade SSO/SCIM/compliance readiness.
- AI autopilot for restaurant operations or autonomous customer messaging.
- Unified cross-channel inventory depletion (storefront or online sales automatically reducing on-hand stock). **POS checkout depletes** recipe-linked ingredients when configured; **storefront, public API, and manual orders do not** — permanent GTM lock until a future era ships a certified hook (`era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1`, `lib/inventory/inventory-depletion-policy.ts`).
- Unified cross-channel loyalty or gift card balances (same code redeemable on POS and storefront). **Dual ledger** — kitchen vs storefront tables; unification `deferred_locked` until a future era (`era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`).

Evidence: `docs/POS_ARCHITECTURE.md`, `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/ENTERPRISE_SECURITY_ROADMAP.md`, `services/ai/`.

## 13. What KitchenOS Can Claim Safely Now
- Unified direct ordering, manual ordering, and operational order management.
- Branded storefront and online ordering foundation with one shared order model.
- Real POS foundation with receipts, shifts, refunds, and canonical order creation.
- CRM, loyalty, and gift card foundations connected to ordering (POS kitchen ledger + separate storefront ledger — not interchangeable).
- Inventory, costing, purchasing, staff, and training foundations that are real but still maturing (inventory recipe depletion on sale is **POS-certified only** — not storefront/API).
- Strong founder-led pilot posture for operators who value workflow unification over pure hardware maturity.

Evidence: `services/orders/order-creation-service.ts`, `app/s/[storeSlug]/checkout/page.tsx`, `actions/pos.ts`, `actions/customers.ts`, `actions/inventory.ts`, `actions/staff.ts`.

## 14. What Requires Certification Before Sales Claims
- Offline POS and resilience claims.
- Native terminal/hardware ecosystem claims.
- Partner marketplace claims and multi-provider delivery orchestration claims.
- Enterprise governance, security questionnaire, SSO/SCIM, and compliance claims.
- AI recommendation and automation claims that imply operational reliability or customer impact.

Evidence: `docs/INTEGRATION_MATURITY_MATRIX.md`, `docs/POS_ARCHITECTURE.md`, `docs/ENTERPRISE_READINESS_AUDIT_FINAL.md`.

## 15. Pilot-Ready Positioning
KitchenOS is pilot-ready for operator-led businesses that need one system for direct ordering, order management, storefront, production/packing coordination, and customer growth. It is best sold with a defined module scope and explicit maturity language by module.

## 16. SMB-Ready Positioning
KitchenOS is SMB-ready where the operator values unified workflow more than deep hardware ecosystem parity. Best-fit SMBs are restaurants, cafes, catering teams, and ghost kitchens running direct online ordering plus staff-operated order flows.

## 17. Enterprise-Ready Positioning
Enterprise-ready messaging should remain future-facing and architecture-led, not certification-led. Safe language today is: multi-location architecture, platform governance direction, public API/webhook foundation, and phased enterprise roadmap. **Canonical procurement source:** [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) (`era4-procurement-honesty-v1`). Do not cite deprecated `docs/ENTERPRISE_*_FINAL.md` for current SSO/SOC2 posture.

## 18. Website Messaging
- Headline: "Run your food business from one operating platform."
- Subhead: "Unify POS, direct ordering, kitchen operations, customer growth, inventory, staff, and reporting in one system."
- Supporting proof points should emphasize order unification, storefront-to-kitchen flow, and operational control.
- Do not use competitor replacement language unless it is narrow and evidence-backed.

## 19. Demo Messaging
- Start with the unified order story, not the terminal.
- Show one order moving across storefront or POS into order hub, kitchen/packing, customer history, and reporting.
- For restaurant demos, present POS as a strong operational module in progress, not as a fully certified hardware platform.
- For catering/ghost-kitchen/meal-prep demos, emphasize direct commerce plus production and packing.

## 20. Sales Positioning
- Sell outcomes: fewer disconnected tools, clearer operational control, faster direct-order execution, stronger customer ownership, and one data model across workflows.
- Sell honesty: live, pilot-ready, beta, preview, hidden, and placeholder status must map to the maturity matrix and integration matrix.
- Sell vertically: restaurant, cafe, bar, ghost kitchen, catering, and multi-location variants should use the same platform narrative with different proof paths.
- Close with phased adoption: storefront + orders first, then POS/KDS/inventory/staff expansions as the maturity model allows.

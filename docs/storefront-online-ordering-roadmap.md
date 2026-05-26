# Storefront, Online Ordering, QR, And Kiosk Roadmap

Status: flagship commerce roadmap built on current storefront core
Primary evidence: `app/s/[storeSlug]/`, `actions/storefront-order.ts`, `services/storefront/`, `middleware.ts`, `actions/storefront-domains.ts`, `actions/storefront-media.ts`, `actions/storefront-forms.ts`, `docs/STOREFRONT_COMPLETION_AUDIT.md`, `docs/system-reality-model.md`

## Goal
Turn KitchenOS storefront from a strong pilot-ready commerce surface into a restaurant-grade omnichannel ordering system that feeds POS, KDS, order hub, CRM, and fulfillment without brittle side paths.

## Capability Roadmap
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| restaurant, cafe, bar, catering, ghost-kitchen themes | core storefront and theming exist | vertical templates are not yet complete or governed by maturity | theme preset metadata and vertical defaults | theme publish and safe-content services | launch wizard with vertical presets | `storefront.theme.manage`, `storefront.publish` | theme publish/restore events | theme preset tests, visual regression | operator can launch a vertical-appropriate storefront quickly |
| menu sections, item availability, 86/sold-out handling | menu/catalog and availability services exist | operator-facing sold-out controls need stronger realtime/operator linkage | availability and override snapshots | sold-out propagation to storefront + POS/KDS | availability controls and clear sold-out UI | `products.manage`, `storefront.manage` | availability override audit | sold-out tests, catalog tests | unavailable items never sell accidentally |
| pickup windows, pickup throttling | pickup window foundations exist | fuller throttling and operator controls needed | pickup throttle and quota metadata | pickup scheduling and throttle service | owner controls and customer date/time UX | `storefront.manage` | pickup policy changes | pickup-window tests | restaurants can control order volume safely |
| delivery zones, delivery fees, taxes, tips | delivery and tax engines exist | publish confidence and edge-case recovery need work | zone/fee policy normalization | delivery quote and tax services hardening | clearer delivery eligibility and fee/tip UX | `storefront.manage` | zone and fee change audit | tax engine and delivery tests | customers see correct delivery pricing and eligibility |
| promo codes, loyalty redemption, gift card redemption | discounts, loyalty, and gift-card foundations exist | parity across all checkout modes needs certification | redemption event linkage | checkout redemption services | checkout redemption states and recovery | `giftcards.manage`, `loyalty.manage`, `storefront.manage` | redemption audit | promo/loyalty/gift-card tests | incentives work reliably online |
| customer accounts, reorder, saved addresses | guest account and account routes exist | fuller lifecycle and UX polish needed | account/order preference models as needed | reorder and address-book services | account dashboard, reorder flows | `storefront.read` for owner tools only | account recovery and reorder events | account/reorder tests | customers can return and reorder quickly |
| allergies, dietary preferences | data capture exists in checkout and CRM | stronger customer-facing warning UX and kitchen carry-through needed | warning metadata only if needed | allergen validation/warning services | clearer checkout warnings | none for customers; owner-side `customers.manage` | allergy capture audit | allergen tests | allergy notes survive checkout and kitchen flow |
| abandoned checkout | cart recovery cron exists | fuller revenue recovery and attribution maturity needed | cart recovery and attribution rows | recovery campaign and unsubscribe handling | recovery messaging and admin reporting | `campaigns.manage`, `storefront.manage` | recovery send/unsubscribe logs | cart-recovery tests | operators can recover abandoned carts responsibly |
| order tracking | order tracking route exists | customer messaging and stage clarity need more polish | order-state projection rows if needed | status projection service | clearer live tracking UI | `orders.update` on staff side | tracking state changes | tracking tests | customer can see accurate order progress |
| QR table ordering, QR menu, pay at table | QR surfaces exist in parts, not certified | no mature table-attach and pay-at-table flow | table/check/QR attachment model | QR-to-table order resolver | QR menu/order and pay-at-table UX | `tables.read`, `checks.close`, `storefront.manage` | QR session and table-attach audit | QR/table tests | QR orders attach to correct table/check |
| kiosk mode | kiosk is not certified | self-service shell and device model missing | kiosk session/device model | kiosk submit and recovery service | kiosk shell | `storefront.publish`, `pos.hardware.manage` | kiosk audit | kiosk E2E | kiosk mode is explicit and recoverable |
| payment failure recovery | storefront payment core exists | best customer/operator recovery path still needs strengthening | failed-payment and retry metadata | retry and support-state projection | clear retry and failure states | `storefront.manage` for operator tools | payment-failure audit | payment failure E2E | failed payments have clear retry and support paths |
| checkout observability | events and conversion rows exist | support/operator visibility is incomplete | checkout incident and trace metadata | checkout tracing/report service | owner-facing health/report cards | `analytics.view` | checkout incident logs | event/trace tests | operators can diagnose checkout issues quickly |
| storefront launch wizard | route and settings depth exist | setup is still too expert-driven | launch-readiness snapshots | setup/readiness service | guided launch wizard | `storefront.manage`, `storefront.publish` | launch events | launch-readiness tests | setup does not require a developer |
| publish / rollback | publish flows exist | rollback confidence and history UX need more polish | version linkage and rollback metadata | publish/restore services | version history and rollback UI | `storefront.publish` | publish/rollback audit | publish/restore tests | operators can safely publish and restore storefront versions |
| SEO checklist | metadata and sitemap pieces exist | holistic SEO workflow is incomplete | SEO readiness snapshot | metadata/sitemap validators | SEO checklist UI | `storefront.manage` | SEO publish audit optional | metadata and sitemap tests | storefront can be launched with sane SEO defaults |

## Implementation Order
1. publish/rollback and media/upload hardening
2. checkout recovery and observability
3. vertical theme/launch wizard polish
4. loyalty/gift card/promo parity certification
5. pickup throttling and sold-out operational controls
6. QR table ordering and kiosk flows

## Acceptance Bar
- customer can order on mobile quickly
- online orders flow to POS/KDS/order hub
- restaurants can pause or throttle orders
- failed payments have recovery
- QR table orders attach to table/check

## Product Guardrails
- Treat storefront as a flagship now, but keep publish/media/domains maturity honest.
- Do not let experiment infrastructure outrun checkout reliability.
- Never mark online payments as production-clean without failure and duplicate-path coverage.

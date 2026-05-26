# Restaurant POS Roadmap

Status: phased path from current POS beta to restaurant-grade maturity
Primary evidence: `app/dashboard/pos/terminal/page.tsx`, `actions/pos.ts`, `app/api/pos/terminal/route.ts`, `services/pos/pos-checkout-service.ts`, `services/orders/order-creation-service.ts`, `docs/POS_ARCHITECTURE.md`, `docs/system-reality-model.md`

## Goal
Move KitchenOS POS from a credible operational beta into a restaurant-grade FOH system that preserves KitchenOS’s unified order, storefront, CRM, and kitchen advantages.

## A. Core POS
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fast item grid, product search, categories | Real touch-first terminal grid and product bootstrap | needs richer role polish, speed tuning, category ergonomics | none initially | optimize bootstrap/search helpers in `services/pos/pos-session-service.ts` | improve category/search UX in terminal client | require `pos.access` | checkout start/search events | terminal smoke, visual, perf | cashier can locate and add products in seconds |
| modifiers, required modifiers, nested modifiers, combo meals, quick modifiers | basic modifiers payload path exists through order lines | no mature restaurant modifier/combo engine | add structured modifier/combo entities linked to products/order lines | catalog resolver + pricing service enhancement | modifier drawer and quick-mod UI | `products.manage`, `pricing.manage`, `pos.checkout` | modifier overrides and required-choice denials | combo/modifier tests | modifier logic is enforced server-side and priced correctly |
| open-price items, discounts, service charges, tax | basic unit-price overrides and tax/discount fields exist | no complete open-price/service-charge governance | add reason codes, open-price markers, service-charge rows | pricing + validation service layers | manager approval prompts and charge summaries | `pos.discount.apply`, `pos.manager.override`, `pricing.manage` | discount/service charge/open-price audit events | price override tests, tax tests | open pricing and charges are permissioned, visible, and auditable |
| tips, split tender, cash, card, gift card, loyalty redemption | cash, placeholder card modes, gift card and loyalty hooks exist | no split tender or production-certified card path | add payment split model and tender allocation rows | extend `services/pos/pos-payment-service.ts` and checkout flow | multi-tender UI and tip prompts | `pos.checkout`, `giftcards.manage`, `loyalty.manage` | tender allocation and tip events | payment matrix, gift-card, loyalty tests | cashier can complete cash/card/gift/loyalty flows cleanly |
| offline queue, receipt printing, customer display | offline messaging exists, receipts exist, hardware not certified | no certified offline replay or device workflow | add offline queue persistence + replay model if approved | replay service, receipt adapter abstraction | offline queue states and recovery UI | `pos.offline.replay`, `pos.hardware.manage` | replay and print attempt logs | offline replay tests, receipt tests | offline/degraded mode is explicit and recoverable |
| cash drawer, drawer count, end-of-day report | shift/register foundations exist | no mature cash-control workflow | add drawer counts, variance rows, closeout records | shift closeout and cash reconciliation services | end-of-day closeout UI | `pos.cash.drawer.open`, `pos.shift.close`, `financials.view` | drawer open/close/variance events | shift close and cash-count tests | manager can close day with a trustworthy report |
| refunds, voids, reason codes, manager override | refund and void services exist; reason text exists | broader role controls and reason taxonomy required | reason code enums/tables and approval metadata | strengthen refund/void service checks | manager override dialog and reason UX | `pos.refund`, `pos.void`, `pos.manager.override` | refund/void/override audit | refund/void negative tests | unauthorized staff cannot refund or void transactions |

## B. Table Service
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| floor plan builder, rooms, zones, tables, seats, covers, server sections | early table primitives only | no production-ready floor management | add room/zone/seat assignment models | table state, assignment, and timer services | floor-plan editor and service dashboard | `tables.read`, `tables.manage` | table open/assign/move events | table-service integration tests | host/server can manage tables and sections reliably |
| open table, transfer table, merge tables | not production-ready | core FOH workflow missing | table/check link model | transfer/merge service logic | quick actions in FOH UI | `tables.transfer`, `tables.merge` | transfer/merge audit | table transfer tests | staff can move parties safely |
| split check, split by seat, move item, checks close, checks reopen | partial order/receipt core exists | no table-aware check engine | check/seat split models | item move/split/check close services | split-check UI | `checks.split`, `checks.close`, `checks.reopen` | check split/close/reopen audit | check split tests | check operations preserve totals and auditability |
| course firing, hold/fire, table timers, guest notes | kitchen routing and notes exist, not table-service complete | no coursing model | course/hold state on items | fire/hold orchestration with kitchen services | coursing controls and timers | `orders.update`, `kitchen.expo.manage` | fire/hold events | coursing tests | server and kitchen can coordinate courses |
| payment at table, tip prompts | partial payment core exists | no server tableside payment flow | payment session linkage to table/check | payment-at-table service | payment prompts in service UI | `pos.checkout`, `checks.close` | payment-at-table audit | tableside payment tests | server can close checks from the table flow |

## C. Bar Mode
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| open tabs, quick reorder, repeat last drink | tab surfaces exist in early form | no fast bar workflow tuning | tab recurrence and recall data | tab service acceleration | bar-focused terminal mode | `pos.access`, `pos.checkout` | tab open/reorder logs | tab workflow tests | bartender can run repeat/tab workflows quickly |
| happy hour pricing, fast cash, tab split, tip after close | no mature bar pricing/state system | bar-specific pricing and close behavior missing | pricing windows and post-close tip states | pricing/tip settlement services | rush-hour shortcuts and fast cash buttons | `pricing.manage`, `pos.checkout`, `pos.manager.override` | price override and tab close audit | bar pricing tests | bartender closes tabs with clean audit trail |
| age-restricted item governance, bartender permissions | no canonical bar permission model yet | compliance and role separation missing | age-restricted product flags | sale validation services | age prompt and denial states | `pos.manager.override`, future compliance permission | age-check denials and overrides | compliance tests | restricted items cannot be sold without authorized workflow |
| keyboard shortcuts, rush-hour UI | not specialized yet | speed path missing | none | client-side workflow helpers | dense high-speed UI mode | `pos.access` | optional analytics only | UX/perf tests | bar flow is optimized for peak volume |

## D. QSR / Fast Casual
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| counter checkout, order number, pickup screen | POS counter core exists; order core exists | pickup display and numbering need stronger productization | order-numbering fields/display rows | queue display services | pickup screen and order-ready view | `pos.checkout`, `orders.update` | order-ready events | QSR E2E | counter service feels fast and predictable |
| SMS ready notification, combo upsell | notification and CRM bases exist | no QSR upsell/notification packaging | upsell + notification trigger metadata | notification service hooks | post-add upsell cards, SMS options | `campaigns.manage`, `orders.update` | upsell/notification logs | notification tests | customers receive correct pickup-ready signal |
| kiosk mode, customer display | not certified | self-service flow missing | kiosk session/device model | kiosk order service | kiosk shell + customer display mode | `pos.hardware.manage` | kiosk session audit | kiosk flow tests | kiosk mode is isolated and recoverable |

## E. Handheld
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| server ordering, tableside send | handheld route exists | no mature handheld workflow | device/session assignment models | handheld order submit services | mobile-first handheld shell | `pos.access`, `orders.create`, `tables.read` | handheld order events | handheld ordering E2E | servers can send orders tableside quickly |
| tableside payment, device assignment, staff PIN, shift-bound usage | no production-grade device governance | operational safety missing | device assignment, PIN/session tables | auth + device/session policy services | device sign-in and locked session flows | `pos.shift.open`, `pos.checkout`, `pos.hardware.manage` | device assignment/PIN logs | device/PIN tests | handheld is bound to staff and shift correctly |
| offline resilience | not production-certified | degraded mode unresolved | queued handheld action model if approved | replay/sync services | offline indicator and recovery flows | `pos.offline.replay` | replay and denial logs | offline handheld tests | handheld fails safely and recovers explicitly |

## Implementation Order
1. POS permissions and audit canon
2. cashier closeout, refunds/voids, and payment trust
3. QSR speed and pickup flows
4. bar mode speed paths
5. table-service foundations
6. handheld/device governance
7. certified hardware and offline roadmap

## Non-Negotiable Rules
- Keep `services/orders/order-creation-service.ts` as the single order spine.
- Do not ship native hardware claims before certification.
- Do not add UI-only permission gates.
- Treat POS permissions, audit logs, and negative tests as part of the feature, not follow-up polish.

# CRM, Loyalty, Gift Card, And Growth Roadmap

Status: customer-growth roadmap tied to real ordering and profile data
Primary evidence: `actions/customers.ts`, `actions/loyalty.ts`, `actions/gift-cards.ts`, `services/crm/`, `services/loyalty/`, `services/gift-cards/`, `services/pos/pos-crm-service.ts`, `docs/system-reality-model.md`

## Goal
Turn OS Kitchen customer data from a useful profile store into a revenue operating system that spans storefront, POS, and operator follow-up without violating consent or maturity honesty.

## Capability Roadmap
| Capability bundle | Current state | Gap | Model changes | Service changes | UI changes | Permission changes | Audit logs | Tests | Acceptance criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| customer profiles, notes, allergies, preferences, favorite items | rich customer profile actions already exist | broader cross-module surfacing and privacy UX needed | mostly additive only | continue profile and metrics services | cleaner profile tabs and history | `customers.read`, `customers.manage` | note/profile updates | CRM profile tests | operators can trust and use customer context |
| LTV, AOV, visit count, last order | metrics foundations exist | stronger packaging and report trust needed | snapshot refinement if needed | customer metrics recompute services | KPI cards and segment filters | `analytics.view`, `customers.read` | recompute events | metrics tests | customer value metrics are accurate |
| tags, segments, VIP, inactive, at-risk, new customer, regular, catering prospect | segment logic exists | lifecycle automation is still partial | segment snapshot/materialization optional | segment evaluation and trigger services | segment management and targeting UI | `customers.manage`, `campaigns.manage` | segment rule changes | segment tests | marketers can act on meaningful segments |
| loyalty points, loyalty tiers, rewards | loyalty program foundation exists | cross-channel parity and tier sophistication not yet certified | tiers/reward entities if needed | unified earn/redeem services across POS/storefront | loyalty wallet and admin controls | `loyalty.manage` | earn/redeem/config logs | loyalty parity tests | loyalty works online and POS |
| gift cards, stored balance | gift card foundation exists | fuller cross-channel and fraud/recovery maturity needed | redemption event and balance-history refinements | gift-card issuance/redemption services | balance, issue, redeem, and customer views | `giftcards.manage` | issue/redeem/reversal logs | gift-card parity tests | gift cards work online and POS |
| email campaigns, SMS campaigns, weekly menu campaign | early marketing service foundations exist | automation builder and consent-aware orchestration are not mature | campaign/send/event models as needed | campaign orchestration and attribution services | campaign composer and schedule UI | `campaigns.manage` | send and consent logs | consent and campaign tests | campaigns respect opt-in and can be traced |
| abandoned cart, winback, birthday, review request, post-order feedback, referral | some recovery/follow-up pieces exist | lifecycle playbooks are fragmented | trigger/event tracking models | lifecycle automation services | event-driven campaign templates | `campaigns.manage` | trigger/send/response logs | recovery and attribution tests | revenue from lifecycle flows can be attributed |
| campaign attribution | metrics and storefront conversion data exist | no strong end-to-end attribution story yet | campaign attribution rows | attribution service | campaign results dashboards | `analytics.view` | attribution recompute logs | attribution tests | operators can see campaign revenue impact |
| consent management | consent-awareness exists in parts | must be canonical before stronger growth claims | consent model extensions if needed | consent resolver and channel policy service | clear opt-in/opt-out UX | `customers.manage`, `campaigns.manage` | consent changes and send denials | marketing consent tests | campaigns are consent-aware |

## Implementation Order
1. certify loyalty and gift-card parity across POS and storefront
2. package customer metrics, segments, and profile UX
3. build consent-first lifecycle campaigns
4. add attribution and automated revenue reporting
5. extend customer intelligence and retention playbooks

## Acceptance Bar
- loyalty works online and POS
- gift cards work online and POS
- campaigns are consent-aware
- revenue is attributed

## Product Guardrails
- AI or automation must not message customers without human-approved policy and consent.
- CRM claims should focus on first-party restaurant operating context, not on being a full enterprise CDP.

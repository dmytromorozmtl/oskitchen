# Feature-by-Feature Audit — Post Era 19

**Date:** 2026-05-28 · **HEAD:** `7b17ffa` · **Matrix:** `docs/feature-maturity-matrix.md`

**Legend:** UX/Backend/Test/Commercial scores 0–100 (honest, not inflated). **Action:** finish | hide | defer | redesign | promote.

---

## Era 19 Pillar Features (Deep)

| Feature | Maturity | Evidence | UX | Backend | Test | Commercial | Competitor gap | Next action |
|---------|----------|----------|---:|--------:|-----:|-------------|----------------|-------------|
| Owner Daily Briefing | **beta→pilot_ready UX** | `owner-daily-briefing-service.ts`, `/dashboard/today`, 35 lib files, 20+ era19 tests | 82 | 85 | 88 | 55 (shows NO-GO honestly) | Toast day-part dashboard | **promote** after pilot metrics |
| Restaurant Launch Wizard | **beta** | `/dashboard/launch-wizard`, `launch-wizard-service.ts`, 7 tests | 78 | 80 | 82 | 60 | Square onboarding speed | **finish** TTV proof |
| Integration Health Center | **beta** | `/dashboard/integration-health`, smoke viewer, recovery, 6 tests | 85 | 88 | 85 | 65 | No competitor has this honesty UX | **promote** qualified |
| Operational command flows | **beta** | Briefing deep-links, KDS priority, packing QC, POS override | 75 | 78 | 80 | 70 | Toast expo workflows | sustain |
| Operational intelligence | **preview/beta mix** | risk-radar, production calendar, exec/copilot preview | 70 | 72 | 75 | 50 | MarginEdge alerts | finish profit tile P2 |

---

## Full Feature Table (105)

| Feature | Maturity | Evidence | UX | Backend | Test | Commercial | Competitor gap | Next action |
|---------|----------|----------|---:|--------:|-----:|-------------|----------------|-------------|
| 1 Marketing site | live | `app/page.tsx`, demo | 75 | 80 | 70 | 80 | Standard | sustain |
| 2 Demo funnel | live | `book-demo.ts` | 70 | 75 | 65 | 85 | HubSpot automation | finish |
| 3 Auth/login | live | login/signup | 78 | 85 | 80 | 85 | MFA | P2 |
| 4 Signup | live | workspace bootstrap | 75 | 82 | 78 | 85 | — | sustain |
| 5 Staff invites | beta | `actions/staff.ts` | 72 | 80 | 75 | 75 | — | finish |
| 6 SSO | pilot_foundation | enterprise-sso R2, Era 18 UX | 80 | 75 | 85 | **30** | Okta-native | **finish IdP proof P0** |
| 7 SCIM | not_implemented | procurement | — | — | — | 0 | Enterprise | **defer** |
| 8 Workspace/tenant | beta/live | Prisma, guards | 70 | 88 | 82 | 75 | Revel multi-loc | P1 |
| 9 RBAC | beta/strong | 59 keys, wave4 | 75 | 90 | 92 | 80 | Standard | sustain |
| 10 Domain mutation registry | beta | 19 entries, linter | — | 88 | 90 | 70 | — | expand slow |
| 11 Audit logs | beta | `services/audit/` | 68 | 82 | 80 | 65 | Retention ops | P2 |
| 12 Support impersonation | internal_only | platform-impersonation | 72 | 85 | 80 | N/A | — | sustain |
| 13 Dashboard shell | beta | dashboard/, today | 82 | 80 | 78 | 70 | Toast nav noise | **redesign** nav |
| 14 Navigation | beta | nav-maturity-governance | 65 | 85 | 88 | 60 | Square simplicity | hide preview |
| 15 Role-based landing | beta | era18+19 persona paths | 85 | 82 | 85 | 75 | Square | sustain |
| 16 Owner Daily Briefing | beta | era19 pillar | 82 | 85 | 88 | 55 | No direct Toast equiv | **promote** |
| 17 Restaurant Launch Wizard | beta | era19 pillar | 78 | 80 | 82 | 60 | Square TTV | **finish** |
| 18 Integration Health Center | beta | era19 pillar | 85 | 88 | 85 | 65 | Unique honesty | **promote** |
| 19 Owner onboarding | beta | wizard + getting-started | 80 | 78 | 80 | 65 | Square 1-day | converge go-live |
| 20 Staff onboarding | beta | invites | 70 | 78 | 72 | 60 | — | finish |
| 21 Go-live checklist | beta | go-live/, Era 18+19 links | 78 | 80 | 78 | 70 | — | merge into wizard |
| 22 Order hub | pilot_ready | order-hub-service | 85 | 85 | 85 | 85 | — | sustain |
| 23 Manual orders | pilot_ready | order-creation | 75 | 88 | 88 | 90 | — | promote |
| 24 Storefront core | pilot_ready | app/s, tier-2 CI | 75 | 85 | 90 | 85 | Shopify themes | P1 |
| 25 Storefront checkout | pilot_ready | money-path CI | 78 | 88 | 92 | 88 | Shopify polish | sustain |
| 26 Storefront publish | beta | publish RBAC | 72 | 82 | 80 | 75 | — | finish |
| 27 Storefront builder/theme | beta | builder | 70 | 78 | 75 | 65 | Shopify | P2 |
| 28 Storefront domains | preview | domains actions | 55 | 65 | 60 | 40 | Shopify DNS | finish P2 |
| 29 Storefront media | beta | upload+scan | 68 | 80 | 78 | 55 | — | finish AV vendor |
| 30 Storefront customer accounts | beta | account API | 65 | 75 | 70 | 55 | — | P2 |
| 31 Storefront SEO | beta | seo lib | 65 | 70 | 65 | 50 | — | P3 |
| 32 POS checkout | beta | tier-2b | 80 | 85 | 90 | 75 | Toast hardware | qualified sell |
| 33 POS terminal | beta | terminal+speed mode | 82 | 85 | 88 | 70 | Square Terminal | hide hardware |
| 34 POS registers | beta | register service | 70 | 78 | 75 | 65 | — | P2 |
| 35 POS shifts | beta | era19 closeout clarity | 85 | 82 | 85 | 75 | Toast | sustain |
| 36 POS refunds | beta | refund service | 70 | 88 | 90 | 75 | — | sustain |
| 37 POS voids | beta | void service | 70 | 88 | 88 | 75 | — | sustain |
| 38 POS discounts | beta | era18+19 UI | 78 | 85 | 85 | 70 | — | sustain |
| 39 POS manager override | beta | era19 checklist | 80 | 82 | 85 | 65 | Toast PIN | sustain |
| 40 POS receipts | beta | receipt services | 68 | 75 | 72 | 60 | — | P2 |
| 41 POS reports | beta | plan-gated | 65 | 75 | 70 | 55 | Toast | P2 |
| 42 POS hardware | preview | Stripe Terminal route | 50 | 70 | 85 | 20 | Toast/Square | **hide** |
| 43 POS offline | not_implemented | architecture honest | — | — | — | 0 | Toast | **defer** |
| 44 Tables/floor | preview | tables actions | 45 | 70 | 75 | 30 | TouchBistro | finish P2 |
| 45 Bar tabs | preview | tabs actions | 45 | 72 | 75 | 30 | — | P3 |
| 46 Handheld ordering | preview | handheld page | 40 | 65 | 70 | 25 | — | P3 |
| 47 KDS | pilot_ready | priority lane era19 | 88 | 85 | 88 | 75 | Rush-hour | staging proof |
| 48 KDS stations | beta | routing | 70 | 78 | 75 | 60 | — | P2 |
| 49 KDS bump/recall | pilot_ready | era18+19 | 90 | 88 | 90 | 80 | — | sustain |
| 50 KDS realtime | beta | 15s poll fallback | 70 | 75 | 80 | 55 | Toast realtime | P1 staging |
| 51 Production board | pilot_ready | era18 focus | 82 | 82 | 82 | 80 | — | sustain |
| 52 Production calendar | pilot_ready | drill era19 | 85 | 82 | 85 | 78 | Lightspeed | sustain |
| 53 Packing | pilot_ready | QC era19 | 82 | 82 | 82 | 78 | — | sustain |
| 54 Packing verification | pilot_ready | verify console | 80 | 82 | 80 | 75 | — | sustain |
| 55 Labels | beta/preview | label surfaces | 60 | 65 | 60 | 45 | — | P3 |
| 56 Catering | beta | catering-quotes | 70 | 75 | 72 | 70 | — | P2 |
| 57 Reservations | preview | reservations | 50 | 60 | 55 | 40 | OpenTable | defer |
| 58 Delivery routing | beta | routes | 65 | 70 | 68 | 50 | DoorDash | defer live |
| 59 Inventory | beta | inventory actions | 68 | 80 | 82 | 60 | R365 | honest lock |
| 60 Inventory depletion | beta POS-only | policy locked | 70 | 85 | 90 | 55 | Unified stock | **locked** |
| 61 Recipe costing | beta | costing | 65 | 78 | 80 | 60 | MarginEdge | spot-check |
| 62 Menu costing | beta | margin | 65 | 78 | 78 | 60 | — | P2 |
| 63 Purchasing | beta | PO flow | 68 | 80 | 82 | 65 | MarketMan | P2 |
| 64 Vendors | beta | purchasing | 60 | 75 | 72 | 55 | — | P3 |
| 65 Receiving | beta | PO receive | 60 | 75 | 72 | 55 | — | P3 |
| 66 Waste | beta | waste actions | 58 | 72 | 70 | 50 | — | P3 |
| 67 Transfers | beta/preview | transfers | 55 | 70 | 68 | 45 | — | P3 |
| 68 Low-stock alerts | beta | alerts | 65 | 75 | 72 | 60 | — | P3 |
| 69 CRM customers | pilot_ready | crm services | 72 | 82 | 80 | 80 | HubSpot | sustain |
| 70 Segmentation | pilot_ready | segments | 70 | 80 | 78 | 75 | Klaviyo | P2 |
| 71 Loyalty | beta dual | loyalty locked | 65 | 80 | 85 | 50 | Square unified | **locked** |
| 72 Gift cards | beta dual | gift cards | 65 | 80 | 82 | 50 | — | **locked** |
| 73 Cross-channel rewards | deferred_locked | policy | — | — | cert | 0 | Toast marketing | defer |
| 74 Campaigns | preview | growth | 45 | 55 | 50 | 30 | Klaviyo | defer |
| 75 Email/SMS marketing | preview/beta | marketing svc | 50 | 60 | 55 | 35 | Mailchimp | defer |
| 76 Feedback/NPS | preview | feedback | 50 | 60 | 55 | 40 | — | defer |
| 77 Staff scheduling | beta | schedule | 65 | 78 | 78 | 55 | 7shifts | P2 |
| 78 Time clock | beta | time-clock | 68 | 80 | 80 | 55 | Homebase | P2 |
| 79 Payroll exports | preview | payroll route | 55 | 75 | 78 | 45 | — | P3 |
| 80 Labor reports | beta | labor | 65 | 75 | 72 | 55 | 7shifts | P2 |
| 81 Training | beta | training RBAC | 68 | 78 | 80 | 60 | — | P2 |
| 82 Playbooks | beta | playbooks | 65 | 75 | 78 | 55 | — | P2 |
| 83 Templates | beta | templates | 70 | 78 | 78 | 65 | — | P2 |
| 84 Food safety | preview | food-safety | 45 | 60 | 55 | 35 | — | hide |
| 85 Analytics | beta | reports | 68 | 75 | 75 | 60 | — | P2 |
| 86 Forecasting | preview | forecast | 40 | 55 | 50 | 30 | — | defer |
| 87 Executive dashboard | beta | executive | 65 | 75 | 75 | 55 | — | P2 |
| 88 AI/copilot | preview | copilot | 50 | 60 | 65 | 25 | — | defer |
| 89 Billing/subscriptions | pilot_ready | billing, Stripe | 72 | 85 | 85 | 85 | — | sustain |
| 90 Entitlements | pilot_ready | billing | 70 | 85 | 85 | 80 | — | sustain |
| 91 Stripe payments | pilot_ready | webhooks | 75 | 88 | 90 | 85 | — | sustain |
| 92 Stripe webhooks | beta | stripe route | 70 | 88 | 92 | 80 | — | sustain |
| 93 Public API v1 | beta | 8 routes | 60 | 82 | 90 | 45 | — | no SLA |
| 94 OpenAPI | beta | partner pack | 65 | 80 | 85 | 50 | — | P2 |
| 95 Webhooks platform | beta | 46 routes | 75 | 85 | 90 | 70 | — | P1 replay ops |
| 96 Shopify | pilot_ready | golden path | 80 | 85 | 88 | **40** live | Shopify admin | **P0 live smoke** |
| 97 WooCommerce | pilot_ready | golden path | 80 | 85 | 88 | **40** live | Woo plugins | **P0 live smoke** |
| 98 DoorDash/Uber/Grubhub | placeholder | honesty registry | 70 | 50 | 90 | 0 | Marketplaces | hide |
| 99 QuickBooks/Xero | beta | integrations | 55 | 65 | 70 | 40 | QB live | P2 |
| 100 7shifts/Homebase | beta | labor integrations | 55 | 65 | 68 | 40 | 7shifts | P2 |
| 101 Mailchimp/Klaviyo/Brevo/Twilio | beta/preview | growth integrations | 50 | 60 | 65 | 35 | Klaviyo | P3 |
| 102 GA4/PostHog/Sentry | beta | observability | 60 | 70 | 75 | 50 | — | P2 |
| 103 Enterprise procurement | beta | procurement pack | 75 | 80 | 88 | 65 | SOC2 claims | honest only |
| 104 Commercial pilot runbook | live governance | era7–17 pack | 85 | 90 | 92 | **35** execution | — | **execute P0** |
| 105 Investor readiness | template | one-pager era17 | 60 | 70 | 80 | 30 | — | post-pilot |

---

## Summary Counts by Maturity (matrix families)

| Status | Approx. families |
|--------|-----------------|
| live / pilot_ready | ~22 |
| beta | ~35 |
| preview / placeholder | ~18 |
| internal_only / hidden | ~4 |

**Sales-claim-safe without qualification:** marketing, order hub, manual orders, storefront checkout (tier-2), CRM (qualified), billing (qualified) — **not** SSO production, marketplace live, unified rewards, hardware POS, Public API SLA.

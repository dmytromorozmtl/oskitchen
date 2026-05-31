# OS Kitchen Feature-by-Feature WOW Gap Audit

**Date:** 2026-05-28  
**HEAD:** `064af17` @ `main`  
**Maturity source:** `docs/feature-maturity-matrix.md`, Era 18 policies, live repo paths, smoke artifacts  
**Companion:** `docs/full-wow-product-breakthrough-audit-2026-05-28.md`

**Legend:** Maturity uses matrix vocabulary. **WOW** = market-differentiating delight (not governance polish). **Revenue** = direct pilot/enterprise upsell. **Action:** finish | redesign | hide | defer | delete | promote.

---

## Master Feature Table (100 Features)

| # | Feature | Current State | Evidence | Missing Pieces | Competitor Gap | WOW Potential | Revenue Impact | Risk | Next Action | Era Priority |
|---|---------|---------------|----------|----------------|----------------|---------------|----------------|------|-------------|--------------|
| 1 | Marketing site | live | `app/page.tsx`, `app/demo/` | Attribution depth | Standard | Low | Medium | Medium | Tie claims to matrix | P2 |
| 2 | Demo funnel | live | `actions/book-demo.ts` | CRM handoff automation | HubSpot | Low | High | Low | finish | P2 |
| 3 | Auth/login | live | `app/login/`, `actions/auth.ts` | MFA | Standard | Low | High | Low | sustain | P2 |
| 4 | Staff invites | live/beta | `actions/staff.ts` | SSO onboarding path | Standard | Low | High | Medium | finish SSO path | P2 |
| 5 | SSO | pilot_foundation | `lib/enterprise/*`, Era 16–18 policies | **IdP login PASS** | Okta-native | Medium | **High** | **High** | **finish** | **P0** |
| 6 | SCIM | not_implemented | procurement pack | Full build | Enterprise IdP | Low | High | High | **defer** | defer |
| 7 | Workspace/tenant | beta/live | `requireTenantActor`, Prisma | Multi-loc polish | Revel/Simphony | Low | Medium | Medium | finish | P1 |
| 8 | RBAC | beta/strong | 59 keys, wave 4 | Registry coverage | Standard | Low | Medium | Low | sustain | sustain |
| 9 | Audit logs | beta | `services/audit/` | Retention ops | Enterprise export | Low | Medium | Medium | finish | P2 |
| 10 | Support impersonation | internal_only | `platform-impersonation` | Access review drill | — | Low | Low | Medium | sustain | sustain |
| 11 | Dashboard shell | beta | `app/dashboard/` | IA simplification | Toast nav | Medium | Medium | High | **redesign** | P1 |
| 12 | Navigation | beta | `nav-maturity-governance` | Preview noise | Square simplicity | Medium | Medium | High | **redesign** | P1 |
| 13 | Role-based home | beta | `era18-operator-default-landing-v1` | Deeper persona kits | Square | **High** | Medium | Medium | **finish** | P1 |
| 14 | Owner onboarding | beta | getting-started, Era 18 focus | Hour-scale TTV | Square 1-day | **High** | **High** | Medium | **redesign** | **P0** |
| 15 | Staff onboarding | beta | invites, roles | Training tie-in | — | Low | Medium | Low | finish | P2 |
| 16 | Go-live checklist | beta | `app/dashboard/go-live/`, Era 18 heroes | Launch cert | — | **High** | **High** | High | **finish** | P1 |
| 17 | Order hub | pilot_ready | `order-hub-service`, stuck-state Era 18 | Live channel proof rows | — | Medium | **High** | Medium | sustain | sustain |
| 18 | Manual orders | pilot_ready | `order-creation-service` | — | — | Low | **High** | Low | promote | sustain |
| 19 | Order spine | pilot_ready | canonical creation service | Packaging in GTM | Toast fragmented | **High** | **High** | Low | **promote** | P0 |
| 20 | Storefront | pilot_ready | `app/s/[storeSlug]/` | Theme ecosystem | Shopify | Medium | **High** | Medium | finish publish | P1 |
| 21 | Storefront checkout | pilot_ready | tier-2 CI | Stripe browser optional | Shopify | Medium | **High** | Low | sustain | sustain |
| 22 | Storefront publish | beta | publish actions | Rollback rigor | Shopify | Medium | High | Medium | finish | P1 |
| 23 | Storefront builder/theme | beta | builder surfaces | CMS depth | Shopify | Medium | Medium | Medium | finish | P2 |
| 24 | Storefront domains | preview | `actions/storefront-domains.ts` | DNS automation | Shopify | Low | Medium | Medium | finish | P2 |
| 25 | Storefront media | beta | upload service, malware scan | AV vendor cert | — | Low | Medium | High | finish | P2 |
| 26 | Storefront customer accounts | beta | `app/api/storefront/account/` | Lifecycle UX | — | Low | Medium | Medium | finish | P2 |
| 27 | Storefront SEO | beta | `lib/seo/` | — | Shopify apps | Low | Medium | Low | finish | P3 |
| 28 | POS checkout | beta | tier-2b CI | Hardware | Toast terminal | Medium | **High** | High | finish software | P1 |
| 29 | POS terminal | beta/preview | terminal route | Device lifecycle | Square Terminal | Low | High | High | hide hardware claims | defer |
| 30 | POS registers | beta | register service | — | — | Low | Medium | Medium | finish | P2 |
| 31 | POS shifts | beta | Era 18 closeout arc | Broader workflow | Toast | Medium | High | Medium | **finish** | P1 |
| 32 | POS refunds | beta | refund service tests | — | — | Low | High | Low | sustain | sustain |
| 33 | POS voids | beta | void service | — | — | Low | High | Low | sustain | sustain |
| 34 | POS discounts | beta | Era 18 manager UI wired | Rush UX | — | Medium | Medium | Medium | finish | P1 |
| 35 | POS manager override | beta | permission + UI | Flow polish | — | Medium | Medium | Medium | finish | P2 |
| 36 | POS receipts | beta | receipt services | Brand templates | — | Low | Medium | Low | finish | P2 |
| 37 | POS reports | beta | plan-gated | Depth | Toast reports | Low | Medium | Low | finish | P2 |
| 38 | POS hardware | preview | Stripe Terminal route | Certification | Toast/Square | Low | High | **High** | **hide** | defer |
| 39 | POS offline | not_implemented | POS_ARCHITECTURE honest | Full offline | Toast | Low | High | **High** | **defer** | defer |
| 40 | Tables/floor service | preview | `actions/restaurant/tables.ts` | Floor plans, splits | TouchBistro | Medium | Medium | Medium | finish | P2 |
| 41 | Bar tabs | preview | `actions/pos/tabs.ts` | Rush UI | — | Low | Medium | Medium | finish | P3 |
| 42 | Handheld ordering | preview | handheld page | Offline/device | — | Low | Medium | High | finish | P3 |
| 43 | KDS | pilot_ready | kitchen-screen-service | Rush-hour | Toast expo | **High** | **High** | High | finish proof | P1 |
| 44 | KDS stations | beta | routing service | Station depth | — | Medium | Medium | Medium | finish | P2 |
| 45 | KDS bump/recall | pilot_ready | Era 18 bump-next | — | — | **High** | High | Medium | sustain | sustain |
| 46 | KDS realtime | beta | polling fallback 15s | Production SLO | Toast | Medium | Medium | High | finish staging | P1 |
| 47 | Production board | pilot_ready | Era 18 focus strip | Templates | — | **High** | **High** | Medium | sustain | sustain |
| 48 | Production calendar | pilot_ready | today focus Era 18 | Drag-drop, KDS sync | Lightspeed | **High** | **High** | Medium | finish drill | P1 |
| 49 | Packing | pilot_ready | Era 18 focus | Scanner hardware | — | Medium | High | Medium | sustain | sustain |
| 50 | Labels | beta/preview | label surfaces | Hardware cert | — | Low | Medium | Medium | finish | P3 |
| 51 | Catering | beta | catering-quotes | Conversion | — | Medium | High | Medium | finish | P2 |
| 52 | Reservations | preview | reservations pages | Host workflow | OpenTable | Low | Medium | Medium | defer | P3 |
| 53 | Delivery routing | beta | routes actions | Live providers | DoorDash | Low | Medium | High | defer live | P2 |
| 54 | Inventory | beta | inventory actions | Cross-channel | R365 | Medium | High | Medium | honest lock | P2 |
| 55 | Inventory depletion | beta POS-only | depletion policy | SF/API hook | Unified stock | Low | High | **High** | **locked** | locked |
| 56 | Recipe costing | beta | costing services | Data quality | MarginEdge | Medium | High | Medium | finish spot-check | P2 |
| 57 | Menu costing | beta | margin service | Reporting | — | Medium | High | Medium | finish | P2 |
| 58 | Purchasing | beta | purchasing actions | Vendor sync | MarketMan | Medium | High | Medium | finish | P2 |
| 59 | Vendors | beta | purchasing | — | — | Low | Medium | Low | finish | P3 |
| 60 | Receiving | beta | PO flow | Depth | — | Low | Medium | Low | finish | P3 |
| 61 | Waste | beta | inventory waste | Dashboards | — | Low | Medium | Low | finish | P3 |
| 62 | Transfers | beta/preview | transfers | Multi-loc | — | Low | Medium | Medium | finish | P3 |
| 63 | Low-stock alerts | beta | alerts | Push ops | — | Medium | Medium | Medium | finish | P3 |
| 64 | CRM customers | pilot_ready | crm services | Attribution | HubSpot | Medium | **High** | Medium | sustain | sustain |
| 65 | Segmentation | pilot_ready | segments | Automation | Klaviyo | **High** | **High** | Medium | finish | P2 |
| 66 | Loyalty | beta dual | loyalty-service | Unified ledger | Square Loyalty | Medium | High | **High** | **locked** | locked |
| 67 | Gift cards | beta dual | gift-card-service | Cross-channel | — | Medium | High | **High** | **locked** | locked |
| 68 | Cross-channel rewards | deferred_locked | policy | Unification | Toast Marketing | Low | High | **High** | **defer** | defer |
| 69 | Campaigns | preview | email-marketing | Builder | Klaviyo | Medium | High | Medium | defer | P3 |
| 70 | Email/SMS marketing | preview/beta | growth services | Consent depth | Mailchimp | Medium | High | Medium | defer | P3 |
| 71 | Feedback/NPS | preview | feedback actions | — | — | Low | Medium | Low | defer | P3 |
| 72 | Staff scheduling | beta | schedule actions | Swaps | 7shifts | Low | Medium | Medium | finish | P2 |
| 73 | Time clock | beta | time-clock-service | Policies | Homebase | Low | Medium | Medium | finish | P2 |
| 74 | Payroll exports | preview | payroll route | Certification | — | Low | Medium | Medium | finish | P3 |
| 75 | Labor reports | beta | labor dashboards | Intelligence | 7shifts | Medium | Medium | Medium | finish | P2 |
| 76 | Training | beta | training actions | Go-live gates | — | Low | Medium | Medium | finish | P2 |
| 77 | Playbooks | beta | playbooks | SOP depth | — | Medium | Medium | Medium | finish | P2 |
| 78 | Templates | beta | templates | Bootstrap speed | — | **High** | Medium | Medium | finish | P2 |
| 79 | Food safety | preview | food-safety pages | HACCP depth | — | Low | Medium | High | hide | P3 |
| 80 | Analytics | beta | reports, exports | KPI defs | — | Medium | High | Medium | finish | P2 |
| 81 | Forecasting | preview | forecast pages | Explainability | — | **High** | Medium | Medium | defer | P3 |
| 82 | Executive dashboard | beta | executive actions | Leadership polish | — | **High** | High | Medium | **redesign** | P2 |
| 83 | AI/copilot | preview | copilot pages | Explainability | — | **High** | Medium | **High** | defer | defer |
| 84 | Billing/subscriptions | pilot_ready | billing, Stripe | Enterprise invoice | — | Low | **High** | Low | sustain | sustain |
| 85 | Entitlements | pilot_ready | billing services | Packaging UX | — | Low | **High** | Low | finish | P1 |
| 86 | Stripe payments | live/beta | Stripe integration | — | — | Low | **High** | Low | sustain | sustain |
| 87 | Stripe webhooks | beta | webhook route | Replay all | — | Low | High | Medium | finish P1 | P1 |
| 88 | Public API v1 | beta | 8 routes, scopes | SLA | Partner programs | Medium | High | High | finish | P1 |
| 89 | OpenAPI | beta | partner confidence pack | Published SLA | — | Low | Medium | Medium | finish | P2 |
| 90 | Webhooks outbound | beta | partner webhook docs | Partner ops | — | Medium | Medium | Medium | finish | P2 |
| 91 | Shopify | pilot_ready | webhooks, wizard, Era 18 live proof UX | **Live smoke PASS** | Native admin | Medium | **High** | **High** | **finish** | **P0** |
| 92 | WooCommerce | pilot_ready | same | **Live smoke PASS** | Plugins | Medium | **High** | **High** | **finish** | **P0** |
| 93 | DoorDash/Uber/Grubhub | placeholder | integration-registry | Live APIs | Incumbents | Low | Medium | **High** | **hide** | defer |
| 94 | QuickBooks/Xero | beta | registry BETA | Certified sync | Native | Low | High | Medium | finish | P2 |
| 95 | 7shifts/Homebase | beta | registry BETA | Depth | Incumbents | Low | Medium | Medium | defer | P3 |
| 96 | Mailchimp/Klaviyo/Brevo/Twilio | preview/beta | partial | Automation | Klaviyo | Medium | High | Medium | defer | P3 |
| 97 | GA4/PostHog/Sentry | beta | analytics hooks | Ops dashboards | — | Low | Medium | Low | finish | P2 |
| 98 | Enterprise procurement | beta | procurement pack | SSO/SOC2 delivery | Oracle | Low | **High** | High | finish after SSO | P1 |
| 99 | Commercial pilot runbook | pilot_ready gov | GO/NO-GO, runbook | **Customer execution** | — | Medium | **High** | **High** | **finish** | **P0** |
| 100 | Investor readiness | template | investor one-pager | Pilot metrics | — | Medium | **High** | Medium | finish post-pilot | P1 |

---

## End-to-End Workflow Table (35 Workflows)

| Workflow | E2E State | Broken Link | Operator Pain | Competitor Standard | Required Fix | Priority |
|----------|-----------|-------------|-----------------|---------------------|--------------|----------|
| Visitor → demo → sales follow-up | Partial | CRM automation | Manual follow-up | HubSpot instant | Lead routing | P2 |
| Owner signup → workspace → first order | **Yes** | Nav complexity | Too many clicks | Square fast | Launch wizard | **P0** |
| Staff invite → login → role access | **Yes** | SSO path unproven | — | Standard | IdP proof | P2 |
| SSO login → dashboard | **No** | IdP proof SKIPPED | Enterprise block | Okta day-1 | P0 smoke PASS | **P0** |
| Menu → storefront publish | **Yes** | Domain preview | DNS manual | Shopify auto | Domain service | P2 |
| Customer storefront checkout | **Yes** | — | — | Shopify | Sustain tier-2 | sustain |
| SF order → hub → KDS → packing | **Yes** | No SF depletion | Stock confusion | Unified (competitors) | Honest messaging | P1 |
| POS checkout → receipt → depletion | **Yes** (POS) | No hardware | Software-only OK | Toast terminal | Sustain tier-2b | sustain |
| POS refund/void | **Yes** | — | — | Standard | Sustain | sustain |
| POS shift open → closeout | **Yes** | Variance edge cases | Manager approval | Toast closeout | Sustain Era 18 arc | P1 |
| Manager discount override | **Yes** | Rush UX | Tap count | — | Polish | P2 |
| Table order → kitchen | Partial | preview tables | No floor plan | TouchBistro | Table beta path | P2 |
| Bar tab → payment | Partial | preview | — | — | Defer | P3 |
| KDS station workflow | **Yes** qualified | Playwright SKIPPED | Rush expectations | Toast expo | GitHub PASS | P1 |
| Production calendar planning | **Yes** qualified | Drill SKIPPED | — | Lightspeed | Staging drill | P1 |
| Packing verification | **Yes** | Scanner depth | Manual verify | — | P2 hardware | P2 |
| Inventory count | **Yes** | POS-only depletion | Cross-channel ask | R365 unified | Locked messaging | locked |
| Recipe costing → margin | Partial | Data quality | Accountant trust | MarginEdge | Spot-check drill | P2 |
| PO → receiving | Partial | Depth | — | MarketMan | Finish receiving | P3 |
| Customer → segment → campaign | **No** | Campaign preview | No automation | Klaviyo | Defer | P3 |
| Loyalty earn/redeem | Partial | Dual ledger | Confusion | Square unified | Locked | locked |
| Gift card redeem | Partial | Cross-channel | — | — | Locked | locked |
| Schedule → time clock → labor | Partial | Payroll preview | Export gaps | 7shifts | P2 band | P2 |
| Woo order → webhook → order | **Yes** synthetic | **Live SKIPPED** | Proof gap | Native sync | P0 credentials | **P0** |
| Shopify order → webhook → order | **Yes** synthetic | **Live SKIPPED** | Proof gap | Native sync | P0 credentials | **P0** |
| Public API order create | **Yes** | Beta SLA | Partner trust | — | Live smoke | P1 |
| Stripe webhook finalization | **Yes** | Partial replay | — | — | P1 replay | P1 |
| Webhook replay/duplicate | Partial | Not all routes | Incident risk | — | P1 expansion | P1 |
| Support impersonation → audit | **Yes** | internal_only | — | — | Access review | sustain |
| Paid pilot GO/NO-GO | Wired | **NO-GO** | Cannot sell | — | P0 + customer | **P0** |
| Staging release workflow | **No** | No GitHub PASS | Release fear | — | Ops secrets | **P0** |
| Enterprise procurement Q&A | **Yes** honest | SSO partial | Deal friction | — | pilot_ready gate | P1 |
| Incident/rollback workflow | Partial | Drill template only | Untested | — | Execute drill | P1 |
| Pilot metrics capture | Partial | Baseline not PASSED | No case study | — | Post-kickoff | **P0** |
| Investor one-pager generation | Template | No KPIs | Weak deck | — | Post-pilot | P1 |

---

## Finish First (Top 20 Existing Features)

1. SSO IdP staging login → `pilot_ready`  
2. GitHub staging workflows first green  
3. Woo/Shopify live smoke PASS  
4. Paid pilot GO/NO-GO → GO with customer  
5. Owner onboarding / launch wizard (hour-scale TTV)  
6. Role-based home + Today command center WOW  
7. KDS staging Playwright PASS  
8. Production calendar operator drill  
9. Tier 2 golden path sign-off  
10. Tier 0 engineering gate PASS  
11. Go-live command center → pilot execution bridge  
12. Public API partner live smoke  
13. Commerce webhook incident drill execution  
14. Storefront publish/rollback rigor  
15. Table service depth (preview → beta)  
16. Integration health live proof panel → PASS artifact  
17. Pilot metrics baseline PASSED  
18. QuickBooks/Xero export narrative  
19. Payroll export certification path  
20. Investor one-pager with real KPIs  

## Add Selectively (Top 20 — Not Deferred Locks)

1. **Owner Daily Briefing** command center (WOW pillar)  
2. Integration Health Center with remediation hints  
3. One-click pilot setup wizard (beyond checklists)  
4. Restaurant Launch Wizard (menu + SF + POS + KDS in one flow)  
5. Staging ops evidence recorder (GitHub URLs in artifact)  
6. Paid pilot customer record in GO/NO-GO artifact  
7. Smart manager alerts (variance, stuck orders, integration failures)  
8. Real-time profit dashboard (order-linked margins)  
9. Operator training mode (sandbox toggles)  
10. Multi-location comparison scorecard  
11. Smart KDS priority sorting  
12. Prep batch optimization suggestions  
13. Menu engineering suggestions (cost + velocity)  
14. Customer winback automation (consent-aware)  
15. Supplier price intelligence (purchasing)  
16. Smart incident recovery playbooks  
17. Partner onboarding v2 with scope picker UI  
18. Published case study (post-customer)  
19. POS cashier speed mode (minimal chrome)  
20. Platform integration observability for support admins  

**Explicitly defer (do not add without era unlock):** unified inventory depletion, unified rewards, offline POS, hardware cert, marketplace LIVE APIs, SCIM, SOC2 Type II.

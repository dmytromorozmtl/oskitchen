# KitchenOS Feature-by-Feature Audit — Era 17 Baseline

**Date:** 2026-05-28  
**HEAD:** `5e00dd4` @ `main`  
**Maturity source:** `docs/feature-maturity-matrix.md`, live repo paths, Era 17 policies  
**Companion:** `docs/full-product-strategic-reaudit-2026-05-28-era17.md`

**Legend — Sales claim:** `Y` = qualified yes; `Q` = qualified only; `N` = no; `I` = internal only

---

## Master Feature Table

| # | Feature | Maturity | Evidence | Missing | Competitor Gap | Sales | Era 18 Pri |
|---|---------|----------|----------|---------|----------------|-------|------------|
| 1 | Auth / login / staff invites | live | `app/login/`, `actions/auth.ts`, `actions/staff.ts` | MFA depth | Standard | Y | P2 |
| 2 | SSO / SAML pilot | pilot_foundation | `lib/enterprise/*sso*`, `workspace-sso-*`, Era 16–17 policies | IdP login PASS | Okta-native prod SSO | Q | **P0** |
| 3 | SCIM roadmap | not_implemented | procurement pack, roadmap docs | Full build | Enterprise IdP | N | defer |
| 4 | Workspace / tenant model | beta/live | `requireTenantActor`, Prisma workspace | Multi-loc polish | Revel/Simphony | Q | P1 |
| 5 | RBAC / permissions | beta | `lib/permissions/permissions.ts` (59 keys), wave 4 | Registry coverage | Standard | Q | sustain |
| 6 | Domain mutation registry | beta | 18 entries, Era 16 linter | Legacy actions | — | I | sustain |
| 7 | Audit logs | beta | `services/audit/`, export RBAC | Retention ops | Enterprise export | Q | P2 |
| 8 | Dashboard shell | beta | `app/dashboard/`, nav maturity Era 17 | IA polish | Toast nav | N | P1 |
| 9 | Navigation maturity | beta | `nav-maturity-sweep-era17` | Preview honesty | — | N | P2 |
| 10 | Owner onboarding | beta | `getting-started-checklist`, go-live | Faster TTV | Square simplicity | Q | P1 |
| 11 | Staff onboarding | beta | invites, roles | SSO onboarding | — | Q | P2 |
| 12 | Order hub | pilot_ready | `services/order-hub/`, `app/dashboard/orders/` | Stuck-state UX | — | Q | sustain |
| 13 | Manual orders | pilot_ready | `actions/order-creation.ts` | — | — | Q | sustain |
| 14 | Storefront online ordering | pilot_ready | `app/s/[storeSlug]/` | — | Shopify native | Q | sustain |
| 15 | Storefront checkout | pilot_ready | `actions/storefront-order.ts`, tier-2 CI | Stripe browser optional | Shopify checkout | Q | sustain |
| 16 | Storefront publish/theme/builder | beta/preview | builder actions, theme policies | Rollback rigor | Shopify themes | Q | P1 |
| 17 | Storefront media/uploads | beta | `storefront-media-upload-service`, malware scan | AV vendor cert | — | N | P2 |
| 18 | Storefront customer accounts | beta | `app/api/storefront/account/` | Lifecycle UX | — | N | P2 |
| 19 | Storefront SEO | beta | `lib/seo/`, metadata | — | Shopify SEO apps | N | P3 |
| 20 | POS checkout | beta | `pos-checkout-service`, tier-2b CI | Hardware | Toast terminal | Q | P1 |
| 21 | POS register | beta | `pos-register-service` | Device lifecycle | — | N | P2 |
| 22 | POS shifts | beta | `pos-shift-service`, closeout math | Variance UI | — | N | P2 |
| 23 | POS refunds | beta | `pos-refund-service`, tests | — | — | N | sustain |
| 24 | POS voids | beta | `pos-void-service` | — | — | N | sustain |
| 25 | POS discounts | beta | `pos-discount-guard`, manager policy Era 17 | Manager UI | — | N | P2 |
| 26 | POS tips | beta | checkout service | — | — | Q | P2 |
| 27 | POS tablet UX | beta | `era17-pos-tablet-ux-v1` | Rush polish | Square iPad | Q | P2 |
| 28 | POS manager override | beta | `pos.manager.override` permission | UI flows | — | N | P2 |
| 29 | POS receipts | beta | receipt services, spot check Era 17 | — | — | Q | P2 |
| 30 | POS reports | beta | plan-gated reports | — | Toast reports | N | P2 |
| 31 | POS hardware/Stripe Terminal | preview | `app/api/pos/terminal/` | Certification | Toast/Square | N | defer |
| 32 | POS offline | not_implemented | `POS_ARCHITECTURE.md` honest | Full offline | Toast | N | defer |
| 33 | Tables/floor service | preview | `actions/restaurant/tables.ts` | Floor plans, splits | TouchBistro | N | P2 |
| 34 | Bar tabs | preview | `actions/pos/tabs.ts` | Rush UI | — | N | P3 |
| 35 | Handheld ordering | preview | `app/dashboard/pos/handheld/` | Offline/device | — | N | P3 |
| 36 | KDS | pilot_ready | `kitchen-screen-service`, KDS gate | Rush-hour | Toast expo | Q | P1 |
| 37 | KDS bump/recall | pilot_ready | `kitchen.bump/recall` permissions | — | — | Q | sustain |
| 38 | KDS stations | beta | routing service | Station depth | — | Q | P2 |
| 39 | KDS realtime/polling | beta | realtime staging policy | Production SLO | Toast | N | P1 |
| 40 | Production board | pilot_ready | `actions/production.ts` | Templates | — | Q | sustain |
| 41 | Production calendar | pilot_ready | calendar UI policies Era 10–17 | Drag-drop, KDS sync | Lightspeed | Q | P1 |
| 42 | Packing | pilot_ready | `actions/packing.ts` | Scanner depth | — | Q | sustain |
| 43 | Labels | beta/preview | label surfaces | Hardware cert | — | N | P3 |
| 44 | Catering | beta | `actions/catering-quotes.ts` | Conversion | — | Q | P2 |
| 45 | Reservations | preview | `storefront-reservations`, dashboard | Host workflow | OpenTable | N | P3 |
| 46 | Delivery routing | beta | `actions/delivery-route.ts`, routes | Live providers | DoorDash | N | P2 |
| 47 | Inventory | beta | `actions/inventory.ts` | Cross-channel | R365 | Q | P2 |
| 48 | Inventory depletion | beta POS-only | `inventory-depletion-policy.ts` | SF/API hook locked | All-in-one stock | N | **locked** |
| 49 | Recipe costing | beta | `services/costing/` | Data quality | MarginEdge | Q | P2 |
| 50 | Menu costing | beta | margin service | Reporting polish | — | Q | P2 |
| 51 | Purchasing | beta | `actions/purchasing.ts` | Vendor sync | MarketMan | Q | P2 |
| 52 | Vendors | beta | purchasing services | — | — | Q | P3 |
| 53 | Receiving | beta | purchasing flow | Depth | — | N | P3 |
| 54 | Waste | beta | inventory waste | Dashboards | — | N | P3 |
| 55 | Transfers | beta/preview | inventory transfers | Multi-loc | — | N | P3 |
| 56 | Low stock alerts | beta | alert services | Push ops | — | N | P3 |
| 57 | CRM customers | pilot_ready | `services/crm/`, `actions/customers.ts` | Attribution | HubSpot | Q | sustain |
| 58 | Segmentation | pilot_ready | `customer-segments.ts` | Automation | Klaviyo | Q | P2 |
| 59 | Loyalty | beta dual | `loyalty-service`, kitchen ledger | Unified ledger | Square Loyalty | Q | locked |
| 60 | Gift cards | beta dual | `gift-card-service` | Cross-channel | — | Q | locked |
| 61 | Cross-channel rewards | deferred_locked | `cross-channel-rewards-policy.ts` | Unification era | Toast Marketing | N | defer |
| 62 | Campaigns | preview | `email-marketing-service` | Builder | Klaviyo | N | P3 |
| 63 | Email/SMS marketing | preview/beta | growth services | Consent depth | Mailchimp | N | P3 |
| 64 | Feedback/NPS | preview | feedback actions | — | — | N | P3 |
| 65 | Staff scheduling | beta | `actions/labor/schedule.ts` | Swaps | 7shifts | N | P2 |
| 66 | Time clock | beta | `time-clock-service` | Policies | Homebase | N | P2 |
| 67 | Payroll exports | preview | `app/api/export/payroll/` | Certification | — | N | P3 |
| 68 | Labor reports | beta | labor dashboards | Intelligence | 7shifts | N | P2 |
| 69 | Billing/subscriptions | pilot_ready | `actions/billing.ts`, Stripe | Enterprise invoice | — | Q | sustain |
| 70 | Plans/entitlements | pilot_ready | billing services, `ssoOidc` | Packaging clarity | — | Q | sustain |
| 71 | Stripe payments | live/beta | Stripe integration | — | — | Q | sustain |
| 72 | Stripe webhooks | beta | `app/api/webhooks/stripe/` | Replay all routes | — | Q | P1 |
| 73 | Public API v1 | beta | `app/api/public/v1/` (8 routes) | SLA | Partner programs | N | P1 |
| 74 | OpenAPI | beta | partner confidence pack Era 16 | Published SLA | — | N | P2 |
| 75 | Webhooks (outbound) | beta | developer docs Era 17 | Partner ops | — | N | P2 |
| 76 | Shopify integration | pilot_ready | webhooks, golden path | **Live smoke PASS** | Native admin | Q | **P0** |
| 77 | WooCommerce integration | pilot_ready | same | **Live smoke PASS** | Plugins | Q | **P0** |
| 78 | DoorDash/Uber/Grubhub | placeholder | `integration-registry.ts` | Live APIs | Incumbents | N | defer |
| 79 | QuickBooks/Xero | beta | registry BETA, export | Certified sync | Native | N | P2 |
| 80 | 7shifts/Homebase | beta | registry BETA | Depth | Incumbents | N | P3 |
| 81 | Mailchimp/Klaviyo/Brevo/Twilio | preview/beta | partial connectors | Automation | Klaviyo | N | P3 |
| 82 | GA4/PostHog/Sentry | beta | analytics, monitoring | Ops dashboards | — | Q | P2 |
| 83 | AI/copilot | preview | `services/ai/`, copilot pages | Explainability | — | N | defer |
| 84 | Analytics/reporting | beta | `app/dashboard/reports/`, exports | KPI defs | — | Q | P2 |
| 85 | Executive dashboard | beta | `actions/executive.ts` | Leadership polish | — | N | P2 |
| 86 | Platform admin | internal_only | `app/platform/` | Access review | — | I | sustain |
| 87 | Support impersonation | internal_only | `platform-impersonation` | Audit completeness | — | I | sustain |
| 88 | DevOps/CI | governance 100 | 17 workflows, bundles | GitHub staging PASS | — | I | **P0** |
| 89 | Staging workflows | awaiting proof | `smoke:staging-workflows-first-green` | Secrets + PASS URL | — | I | **P0** |
| 90 | Typecheck slices | beta | Era 16 slice report | Full CI OOM | — | I | P2 |
| 91 | Enterprise procurement | beta | `enterprise-procurement-pack.md` | SSO/SOC2 delivery | Oracle | Q | P1 |
| 92 | Commercial pilot runbook | pilot_ready (governance) | `commercial-pilot-runbook.md`, GO/NO-GO | **Customer execution** | — | I | **P0** |
| 93 | Claims governance | live | `claims-registry.json`, `verify-claims` | Registry size (6) | — | I | sustain |
| 94 | Investor readiness | template | `investor-narrative-onepager-era17.md` | Pilot metrics | — | N | P1 |

---

## End-to-End Workflow Table

| Workflow | E2E? | Evidence | Broken Link | Competitor Standard | Fix |
|----------|------|----------|-------------|---------------------|-----|
| Restaurant owner onboarding | Partial | checklist, go-live | Nav complexity | Square 1-day setup | Golden path doc + UX |
| Staff invite → login → role | Yes | auth + staff actions | — | Standard | SSO path for enterprise |
| SSO login → dashboard | **No** | SSO runtime; smoke SKIPPED | IdP proof | Okta SSO day-1 | Era 18 P0 #1 |
| Menu → storefront publish | Yes | builder + publish actions | Domain verify | Shopify | DNS automation P2 |
| Storefront customer checkout | Yes | tier-2 CI | — | Shopify | Sustain |
| SF order → hub → kitchen | Yes | order spine + KDS routing | No SF depletion | Unified stock (competitors) | Honest messaging |
| POS checkout → receipt → depletion | Yes (POS) | tier-2b + depletion policy | Hardware | Toast terminal | Software-only claim |
| POS refund / void | Yes | service tests | — | Standard | Sustain |
| POS shift open → closeout | Yes | shift service + spot check | Variance UI | Toast closeout | Manager approval UI |
| KDS ticket bump/recall | Yes (qualified) | KDS actions + smoke | Playwright SKIPPED | Toast expo | GitHub PASS |
| Production calendar planning | Yes (qualified) | calendar policies | Operator drill SKIPPED | — | Staging drill |
| Packing flow | Yes | packing-verification | Scanner | — | P2 hardware |
| Inventory count adjustment | Yes | inventory actions | SF depletion N/A | Unified | POS-only lock |
| Recipe costing → margin | Partial | costing services + spot check | Data quality | MarginEdge | Pilot menu QA |
| Woo/Shopify → canonical order | Yes (synthetic) | golden path cert | Live SKIPPED | Native sync | P0 credentials |
| Public API order create | Yes | public v1 orders route | Beta SLA | — | Partner smoke |
| Stripe webhook finalization | Yes | webhook route + tests | Partial replay | — | P1 replay |
| Woo/Shopify webhook ingest | Yes | webhook routes | Live proof | — | P0 smoke |
| Loyalty earn/redeem | Partial | dual ledger | Cross-channel | Square unified | locked |
| Gift card redeem | Partial | dual services | Cross-channel | — | locked |
| Customer segment → campaign | No | preview campaigns | Builder | Klaviyo | Defer |
| Schedule → time clock → labor | Partial | labor actions | Payroll cert | 7shifts | P2 |
| Manager override | Yes (server) | permissions | UI | — | P2 UI |
| Support impersonation → audit | Yes | platform actions | internal | — | Access review |
| Paid pilot GO/NO-GO | Wired | `smoke:pilot-gono-go` → NO-GO | P0 + customer | — | Era 18 execute |
| Staging release workflow | No | first-green SKIPPED | GitHub URL | — | Ops secrets |
| Enterprise procurement Q&A | Yes (honest) | procurement pack | SSO partial | — | pilot_ready gate |
| Incident/rollback workflow | Partial | rollback drill template | Execution | — | Tabletop with pilot |

---

## Top 20 Features to Finish (Existing)

1. SSO IdP staging login → `pilot_ready`  
2. GitHub staging workflows first green  
3. Woo/Shopify live smoke PASS  
4. Paid pilot GO/NO-GO → GO with customer  
5. KDS staging Playwright PASS  
6. Production calendar operator drill on staging  
7. Tier 2 operator golden path sign-off  
8. Tier 0 engineering gate PASS in GO/NO-GO  
9. POS manager discount UI  
10. Storefront publish/rollback rigor  
11. Public API partner live smoke  
12. Commerce webhook incident drill execution  
13. Table service depth (post-permission)  
14. Payroll export certification path  
15. QuickBooks/Xero certified sync narrative  
16. Labor scheduling polish  
17. Campaign/consent maturity (preview → beta)  
18. Domain/DNS verification automation  
19. Pilot metrics baseline `overall: PASSED`  
20. Investor one-pager with real KPIs  

---

## Top 20 Features to Add (Selective — Era 18)

1. SSO `pilot_ready` **evidence module** (not production SAML for all)  
2. Staging ops evidence record (GitHub run URLs in artifact)  
3. Paid pilot customer record in GO/NO-GO artifact  
4. Live channel smoke PASS artifact  
5. KDS rush-hour **explicit non-cert** → optional future cert only  
6. Bounded Public API rate limits on all routes  
7. Webhook replay for remaining P1 matrix routes  
8. Storefront checkout gift redeem wiring (only if era unlock) — **defer by default**  
9. Storefront inventory depletion hook — **defer by default**  
10. Unified rewards ledger — **defer by default**  
11. POS hardware certification path — **defer**  
12. Offline POS — **defer**  
13. Marketplace live DoorDash/Uber — **defer**  
14. SCIM — **defer**  
15. SOC2 Type II — **defer**  
16. Multi-location rollout playbook  
17. Operator speed dashboard (role-based home)  
18. Integration health dashboard for pilots  
19. Pilot success metrics dashboard export  
20. Published case study (post-customer approval)  

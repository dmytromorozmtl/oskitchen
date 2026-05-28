# Operator Workflow Audit — Post Era 19

**Date:** 2026-05-28 · **HEAD:** `7b17ffa`

---

## Workflow Table

| Workflow | E2E state | Broken link | UX pain | Risk | Competitor standard | Next action |
|----------|-----------|-------------|---------|------|---------------------|-------------|
| 1 Visitor → demo → sales | **Partial** | CRM automation weak | Standard funnel | Low | HubSpot speed | finish attribution |
| 2 Owner signup → workspace → first order | **Real** | — | Many nav paths | Medium | Square 1-day | **Launch Wizard** default path |
| 3 Staff invite → login → RBAC | **Real** | SSO onboarding gap | Role confusion | Medium | Standard | finish SSO invite path |
| 4 SSO login → dashboard | **Blocked** | IdP proof SKIPPED | Good recovery UX | **High** | Okta SSO | **P0 env + smoke** |
| 5 Profile → menu → SF publish | **Real** | Domains preview | Multi-page | Medium | Shopify | wizard step 3–4 |
| 6 SF customer checkout | **Real** (CI) | Stripe browser optional | — | Low | Shopify | sustain tier-2 |
| 7 SF order → hub → KDS → packing | **Real** | Live channel ingest SKIPPED | Briefing helps | Medium | Toast spine | **P0 channel** + briefing link |
| 8 POS checkout → receipt → depletion | **Real** (CI) | POS-only lock messaging | Speed mode good | Medium | Toast | pilot train |
| 9 POS refund/void | **Real** | Manager discovery | Scattered UI | Medium | Toast | sustain |
| 10 POS shift open → closeout | **Real** | Multi-step close | Era19 checklist helps | Low | Toast | sustain |
| 11 Manager discount override | **Real** | PIN parity claim forbidden | Checklist hero | Low | Toast PIN | sustain honest |
| 12 Table → kitchen | **Preview** | No floor plan | Preview only | High | TouchBistro | P2 beta |
| 13 Bar tab → payment | **Preview** | Rush UI missing | Preview | Medium | — | P3 |
| 14 KDS station workflow | **Real** | Rush SLO | Priority lane **win** | Medium | Toast expo | staging Playwright |
| 15 Production calendar planning | **Real** | KDS auto-sync limited | Drill anchor **win** | Low | Lightspeed | sustain |
| 16 Packing verification | **Real** | Scanner hardware | QC checklist **win** | Low | — | sustain |
| 17 Inventory count adjustment | **Real** | Cross-channel | POS-only policy | Medium | R365 | honest messaging |
| 18 Recipe costing → margin | **Partial** | Data quality | Reports depth | Medium | MarginEdge | spot-check |
| 19 PO → receiving | **Partial** | Vendor sync | — | Medium | MarketMan | P2 |
| 20 Customer → segment → campaign | **Broken** | Campaign preview | — | Medium | Klaviyo | defer |
| 21 Loyalty earn/redeem | **Partial** | Dual ledger | Channel confusion | **High** | Square unified | locked |
| 22 Gift card redeem | **Partial** | Cross-channel | — | High | — | locked |
| 23 Schedule → clock → labor report | **Partial** | Payroll preview | — | Medium | 7shifts | P2 |
| 24 Woo webhook → canonical order | **Synthetic CI** | **Live SKIPPED** | Health center honest | **High** | Woo plugins | **P0** |
| 25 Shopify webhook → order | **Synthetic CI** | **Live SKIPPED** | Same | **High** | Shopify | **P0** |
| 26 Public API order create | **Real** (contract) | No SLA | — | Medium | — | narrow claims |
| 27 Stripe webhook finalization | **Real** | — | — | Low | — | sustain |
| 28 Webhook duplicate/replay | **Partial** | Not universal ops | — | Medium | — | P1 expansion |
| 29 Support impersonation → audit | **Real** | — | Deep links improved | Low | — | sustain |
| 30 Paid pilot GO/NO-GO | **Blocked** | Customer + P0 | Briefing shows truth | **Critical** | — | **execute** |
| 31 Staging release workflow | **Blocked** | No PASS URL | — | **High** | — | GitHub secrets |
| 32 Enterprise procurement Q | **Real** (doc) | SOC2/SCIM gaps honest | — | Medium | Oracle | sustain honesty |
| 33 Incident/rollback | **Template** | Not executed | — | Medium | — | tabletop P1 |
| 34 Pilot metrics capture | **Template** | Not PASSED | — | High | — | Week 1 post-GO |
| 35 Investor one-pager | **Template** | No KPIs | — | Medium | — | post-pilot |
| 36 Briefing → action taken | **Real (UX)** | No outcome telemetry | — | Medium | — | instrument clicks |
| 37 Launch Wizard → first ops order | **Real (guided)** | TTV unmeasured | Wizard convergence **win** | Medium | Square | timed study |
| 38 Integration Health → issue resolved | **Real (guided)** | Live proof missing | Recovery checklist **win** | High | — | P0 credentials |

---

## Era 19 Workflow Improvements (Evidence)

- **Owner/manager/kitchen/cashier/support** role packs on Today with ranked actions
- **Fulfillment convergence:** briefing → order hub / KDS priority / packing `#packing-qc-clarity`
- **Launch wizard onboarding convergence:** Today tiles → next wizard step
- **Integration recovery convergence:** risk radar → smoke next-action or recovery checklist
- **Production drill convergence:** unified `#production-calendar-drill` anchors

## Still Broken for Commercial Claims

SSO E2E, live Woo/Shopify, paid pilot GO, staging GitHub green, segment→campaign, unified loyalty, table service production, offline POS.

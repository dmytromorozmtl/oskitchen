# Partner program — Shopify agencies

**Task:** MKT-31  
**Status:** **PRE-LAUNCH** — program opens only after WooCommerce + Shopify live smokes PASS  
**Updated:** 2026-06-03  
**Parent:** [`shopify-bundle-sales-guide.md`](./shopify-bundle-sales-guide.md) · [`shopify-live-smoke-setup.md`](./shopify-live-smoke-setup.md) · [`woocommerce-live-smoke-setup.md`](./woocommerce-live-smoke-setup.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md)

This doc defines the **Shopify agency partner program** for agencies that implement Shopify for meal-prep, ghost-kitchen, and commissary operators. Agencies refer qualified ICP prospects; OS Kitchen handles pilot onboarding and honest integration scope.

**Honest baseline (June 2026):** WooCommerce live smoke **FAILED/SKIPPED**, Shopify live smoke **SKIPPED**. Partner program remains **PRE-LAUNCH** until both channels show `overall: PASSED` in staging artifacts.

---

## Program enable gate (hard block)

| # | Gate | Artifact | Required |
|---|------|----------|----------|
| **PG1** | WooCommerce live smoke | `artifacts/woocommerce-live-smoke-summary.json` | `overall: PASSED` |
| **PG2** | Shopify live smoke | `artifacts/shopify-live-smoke-summary.json` | `overall: PASSED` |
| **PG3** | Combined channel smoke (optional CI) | `artifacts/channel-live-smoke-summary.json` | Both rows PASS |
| **PG4** | P0 orchestrator Tier 2.2 | `.github/workflows/p0-orchestrator.yml` | Channel smokes not SKIPPED |
| **PG5** | Partner agreement template | Legal review complete | Signed template on file |

Run: `isPartnerProgramShopifyAgenciesEnabled(wooPassed, shopifyPassed)` — returns `true` only when **PG1 + PG2** are both satisfied.

**Do not recruit agencies publicly** while either channel smoke is SKIPPED — screen-shares will expose Integration Health gaps ([`integration-honesty-screen-share-guide.md`](./integration-honesty-screen-share-guide.md)).

---

## Agency qualification criteria (≥8/10 before invite)

| # | Criterion | How to verify |
|---|-----------|---------------|
| **A1** | Shopify Partner account in good standing | partners.shopify.com profile link |
| **A2** | **≥5 F&B or HoReCa Shopify builds** in portfolio | Case links or client references |
| **A3** | Serves **meal-prep, ghost kitchen, commissary, or catering** segments | Portfolio segment tags |
| **A4** | Willing to use **honest BETA/SKIPPED** labels in client conversations | Discovery call screen |
| **A5** | Can commit **monthly partner sync** (30 min) during pilot phase | Calendar hold |
| **A6** | No promise of **Toast/Square replacement day one** to clients | Partner agreement clause |
| **A7** | US/Canada or agreed timezone overlap | Address / team location |
| **A8** | Accepts **referral-only comp** until program legal SOW signed | Written ack |
| **A9** | Uses **Shopify custom app** or Plus checkout patterns (not legacy only) | Tech stack review |
| **A10** | Agrees to **ICP disqualifiers** — no pure dropship, no enterprise SSO blockers in pilot | [`icp-definition-final.md`](./icp-definition-final.md) |

**Disqualify:** agencies selling “Shopify + fake ERP green tiles,” demanding LIVE DoorDash/Uber Eats as day-one blocker, or refusing `/trust` maturity labels.

---

## Partner tiers

| Tier | Requirements | Agency benefits | OS Kitchen obligations |
|------|--------------|-----------------|------------------------|
| **Registered** | PG1–PG2 PASS + signed partner ack | Partner deck, sandbox demo creds, `/shopify` co-brand one-pager | Monthly office hours |
| **Certified** | **1** referred LOI signed | Co-branded pilot proposal template, priority demo slot | Named partner success contact |
| **Premier** | **3** referred pilots in active Week-4+ | Case study co-marketing (opt-in), quarterly business review | Executive sponsor call |

**No tier upgrade** based on referral promises alone — evidence required (LOI PDF, pilot kickoff date).

---

## Referral economics (illustrative — not binding)

Until legal partner SOW is signed, use **internal planning numbers only**:

| Event | Illustrative referral credit | Paid when |
|-------|------------------------------|-----------|
| Qualified discovery call held | $0 | N/A — qualification only |
| Design-partner LOI signed | **TBD** — legal review | LOI countersigned |
| Paid pilot SOW signed | **TBD** — % of first-year ACV cap | First invoice collected |

**Forbidden:** guaranteed commission rates in outreach, “passive income,” or revenue share without signed partner agreement.

---

## Partner enablement kit (when PG1–PG2 PASS)

| Asset | Path | Use |
|-------|------|-----|
| Shopify bundle sales guide | [`shopify-bundle-sales-guide.md`](./shopify-bundle-sales-guide.md) | Positioning (MKT-13) |
| Outbound sequence | [`shopify-bundle-outbound-sequence.md`](./shopify-bundle-outbound-sequence.md) | Agency → operator email |
| Integration honesty screen-share | [`integration-honesty-screen-share-guide.md`](./integration-honesty-screen-share-guide.md) | Client demo prep (MKT-27) |
| Discovery call script | [`discovery-call-script.md`](./discovery-call-script.md) | Qualification (MKT-21) |
| LOI outreach | [`loi-outreach-email.md`](./loi-outreach-email.md) | Warm intro template (MKT-03) |
| Trust labels | [`/trust`](/trust) | Client-facing maturity defs |

Archive signed partner acks in `artifacts/partner-program-shopify-agencies/`.

---

## Partner outreach email (template)

**Subject:** OS Kitchen × `[AGENCY]` — Shopify kitchen ops referrals (pilot program)

> Hi `[PARTNER_NAME]` —  
>  
> We’re opening a **limited Shopify agency partner track** for agencies serving meal-prep and ghost-kitchen brands on Shopify. OS Kitchen sits **beside Shopify checkout** — production board, KDS, and owner briefing with honest **BETA** labels ([`/trust`](/trust)).  
>  
> **Gate:** we activate partners only after Woo + Shopify live smokes PASS in staging — currently **PRE-LAUNCH**. If your portfolio matches our ICP ([`icp-definition-final.md`](./icp-definition-final.md)), reply with 2–3 relevant Shopify F&B builds and we’ll schedule a partner intro.  
>  
> No commission terms until partner SOW is signed.  
>  
> `[SENDER_NAME]`

Run `lintPartnerProgramShopifyAgenciesCopy(draft)` before send.

---

## Forbidden partner program claims

- “Official Shopify app” (custom app beta — not App Store listing yet)
- “WooCommerce and Shopify LIVE for all tenants” without artifact PASS
- “Beat Shopify POS” — we complement, not replace Shopify checkout
- “Guaranteed referral income” or published commission % without legal SOW
- “Thousands of agency partners” or implied network scale
- “Enterprise SSO included for referred clients” in pilot term
- “Production-certified channel sync” while Integration Health shows SKIPPED

---

## Launch checklist (when PG1–PG2 PASS)

1. Legal publishes partner acknowledgment PDF (non-binding referral intent).
2. Update `/shopify` footer with “Agency partners — apply” → `/book-demo?partner=shopify-agency`.
3. Run forbidden-claims lint on partner one-pager.
4. First **Registered** tier invite: max **5 agencies** in cohort 1.
5. Log referrals in CRM with `utm_source=partner&utm_medium=shopify-agency`.
6. Monthly review: did partner-sourced demos match ICP scorecard ≥8/10?

---

## Related docs

| Doc | Use |
|-----|-----|
| [`shopify-live-smoke-setup.md`](./shopify-live-smoke-setup.md) | PG2 unblock path |
| [`woocommerce-live-smoke-setup.md`](./woocommerce-live-smoke-setup.md) | PG1 unblock path |
| [`competitive-battle-cards.md`](./competitive-battle-cards.md) | BC5 Shopify/Woo (MKT-26) |
| [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) | Public launch defer (MKT-30) |

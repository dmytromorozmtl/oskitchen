# Free pilot tier program — first 5 design partners

**Policy:** `free-pilot-tier-program-absolute-final-v1`  
**Date:** 2026-06-06  
**Status:** **INTERNAL GTM** — founder-approved outreach only; not a public homepage claim until slot 5/5 or explicit launch  
**Parent:** [`loi-signed.md`](./loi-signed.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`icp-definition-final.md`](./icp-definition-final.md) · [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md) · [`referral-program.md`](./referral-program.md)

OS Kitchen offers a **limited free pilot tier** for the **first five** qualified restaurant operators (ghost kitchen, meal prep, or commissary ICP). Software subscription is waived for the 90-day design-partner term in exchange for weekly feedback, honest BETA acceptance, and pilot metrics capture.

**Honesty rule:** This is **not free forever**, unlimited seats, or production certification. Slots are capped at **5**. Do not publish “Join free” on `/pricing` until the founder marks the program **public**.

---

## Program summary

| Attribute | Value |
|-----------|-------|
| **Max slots** | **5** operators (design partners) |
| **Term** | 90 calendar days from Pilot Week 0 kickoff |
| **Software credit** | Pro or Team plan list price waived — see **Included** |
| **ICP** | P0 segments only — ghost kitchen, meal prep, commissary |
| **Prerequisite** | Signed LOI (`LOI-DP-00N`) + ICP qualification pass |
| **Slots used (internal)** | 1 signed LOI on file — **4 remaining** |

---

## Eligibility

### Required (all must be true)

1. **Single-location or ≤5 locations** in pilot scope.  
2. **Owner or ops lead** commits to weekly 30-minute product sync.  
3. **Needs core kitchen + order path** — order hub, storefront and/or in-browser POS, KDS bump/recall.  
4. **Accepts BETA / SKIPPED labels** — no blanket production certification demand.  
5. **Countersigned LOI** on file before Week 0 kickoff.

Run `evaluatePilotIcpQualification` via [`pilot-icp-contract-era17.ts`](../lib/commercial/pilot-icp-contract-era17.ts) — export answers in `PILOT_GONOGO_ICP_INPUT_JSON` when running `npm run smoke:pilot-gono-go`.

### Hard disqualifiers

Same as [`loi-signed.md`](./loi-signed.md) — production SSO/SAML, SOC 2 in pilot term, unified cross-channel inventory, rush-hour KDS SLA, live marketplace delivery ops, offline POS parity, refusal of qualified wording.

---

## Included in free pilot tier

| Benefit | Detail |
|---------|--------|
| **Software subscription** | Pro ($79/mo) or Team ($199/mo) — **waived** for 90-day term |
| **Staging workspace** | Dedicated slug; golden path before production traffic |
| **Founder product line** | Direct Slack/email during business hours |
| **Launch wizard + Week 1 roadmap** | [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md) |
| **Integration Health Center** | Honest maturity labels + recovery playbooks |
| **Pilot metrics baseline** | `npm run smoke:pilot-metrics-baseline` at Week 2 + Week 8 |

### Excluded (not waived — not in scope)

| Item | Notes |
|------|-------|
| **Stripe processing fees** | Operator pays Stripe Connect fees on their account |
| **Third-party SaaS** | Shopify, Woo, delivery marketplaces — operator contracts |
| **Custom development** | No bespoke features outside agreed Exhibit A |
| **Enterprise SLA / SSO** | Roadmap-only — see [`soc2-roadmap-with-timeline.md`](./soc2-roadmap-with-timeline.md) |
| **Hardware** | No terminal lease or reader subsidy |

---

## Operator obligations

1. **Weekly sync** — product feedback, blockers, and scope honesty.  
2. **Golden path execution** — Tier 2 operator checklist within first 14 days.  
3. **Metrics capture** — allow internal export of orders/week, checkout success, support tickets (anonymized for investor deck only with written approval).  
4. **Case study option** — right of first refusal on anonymized pre-pilot → pilot case study ([`case-study-template-pre-pilot.md`](./case-study-template-pre-pilot.md)).  
5. **Forbidden claims training** — operator understands OS Kitchen will not overstate integration LIVE status in their co-marketing.

---

## Human gate checklist

Founder **must** approve before offering a free pilot slot:

- [ ] Fewer than **5** slots consumed (check [`loi-signed.md`](./loi-signed.md) signed LOI count).  
- [ ] ICP qualification documented — segment + criteria pass.  
- [ ] LOI countersigned and SKU assigned (`LOI-DP-002` … `LOI-DP-005`).  
- [ ] Exhibit A modules match [`feature-maturity-matrix.md`](./feature-maturity-matrix.md).  
- [ ] Staging workspace reserved; production cutover date agreed.  
- [ ] `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` green for deck used on call.  
- [ ] Free tier offer recorded in CRM with **start date** and **day-90 conversion plan**.

**Gate owner:** Founder/CEO. **Do not** offer slot 6+ without board/founder written exception.

---

## Slot tracker (internal)

| Slot | LOI SKU | Segment | Status | Kickoff |
|------|---------|---------|--------|---------|
| 1 | LOI-DP-001 | Design partner (signed) | **Active** | 2026-06-05 |
| 2 | — | — | **Open** | — |
| 3 | — | — | **Open** | — |
| 4 | — | — | **Open** | — |
| 5 | — | — | **Open** | — |

Update this table when LOI countersigned — never inflate slot count in sales materials.

---

## Conversion at day 90

| Outcome | Path |
|---------|------|
| **Continue (paid)** | Convert to Pro or Team at published `/pricing` rates; optional annual discount |
| **Extend (limited)** | Max one 30-day extension with written scope — no second free term |
| **Graduate off-platform** | Data export via import/export center; workspace deactivated per SOW |
| **No-go** | Document reasons in CRM; run `npm run smoke:pilot-gono-go` with honest NO-GO |

**Do not claim** automatic conversion or guaranteed ROI — pilot success metrics are evidence, not contractual SLA.

---

## Sales-safe wording

| Say | Do not say |
|-----|------------|
| "First five design partners — software waived for 90 days with signed LOI" | "Free for all restaurants" |
| "BETA labels on integrations — we prove before you bet rush hour" | "Production certified" |
| "4 slots remaining" (only if accurate internally) | "Thousands of operators" |
| "Convert to published Pro/Team pricing at day 90" | "Free forever" |

---

## Wiring & certification

| Asset | Path |
|-------|------|
| Policy | `lib/commercial/free-pilot-tier-program-absolute-final-policy.ts` |
| Audit | `lib/commercial/free-pilot-tier-program-audit.ts` |
| LOI human gate | `docs/loi-signed.md` |
| ICP | `docs/icp-definition-final.md` |
| CI cert | `npm run test:ci:free-pilot-tier-program:cert` |

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| `free-pilot-tier-program-absolute-final-v1` | 2026-06-06 | Task 71 — first 5 restaurants free pilot tier program |

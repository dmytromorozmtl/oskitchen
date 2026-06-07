# Local partner network — onboarding guide

**Policy:** `local-partner-network-absolute-final-v1`  
**Date:** 2026-06-06  
**Status:** **INTERNAL GTM** — founder-approved outreach only; **PRE-LAUNCH** public partner directory  
**Parent:** [`restaurant-partnerships-strategy.md`](./restaurant-partnerships-strategy.md) · [`referral-program.md`](./referral-program.md) · [`free-pilot-tier-program.md`](./free-pilot-tier-program.md) · [`icp-definition-final.md`](./icp-definition-final.md)

OS Kitchen builds a **local partner network** of restaurant-industry professionals who introduce qualified operators to the platform — POS consultants, accountants, commissary managers, culinary incubators, and regional integrators. This doc is the **onboarding playbook** for founder-led recruitment; it is **not** a public “certified partner” badge program.

**Honesty rule:** Do **not** call anyone a “partner” in marketing until a signed partner acknowledgment is on file. Use *“local introducer”* or *“in conversation”* until countersigned. **0 local partners signed** as of June 2026.

---

## Program summary

| Attribute | Value |
|-----------|-------|
| **Network type** | Local / regional introducers — not national resellers |
| **Target geographies** | US + Canada metros (founder timezone overlap first) |
| **ICP referrals** | Ghost kitchen, meal prep, commissary, multi-concept ≤5 locations |
| **Compensation model** | Referral credit + optional co-delivery SOW (legal review) |
| **Public directory** | **None** until ≥3 signed partners + ≥1 successful pilot referral |
| **Upstream tracks** | Separate from [`partner-program-shopify-agencies.md`](./partner-program-shopify-agencies.md) (MKT-31) and [`hardware-partner-program.md`](./hardware-partner-program.md) |

---

## Partner segments

| Segment | Typical profile | Intro value | Disqualifiers |
|---------|-----------------|-------------|-----------------|
| **Restaurant tech consultant** | Independent ops/tech advisor, 5–20 operator clients | Warm intro + implementation help | Promises Toast/Square rip-and-replace day one |
| **POS installer / local MSP** | Tablet, printer, network setup for restaurants | Hardware + software bundle story | Requires exclusive territory lock |
| **Restaurant accountant / bookkeeper** | QuickBooks/Xero for 10–50 restaurants | Trust + finance workflow intro | Demands revenue share without signed SOW |
| **Commissary / incubator manager** | Shared kitchen operator with tenant roster | Multi-tenant rollout path | Wants white-label rebrand of OS Kitchen |
| **Culinary / ops coach** | Former chef-operator turned advisor | Operator credibility | No weekly operator availability from clients |

**Not in scope:** National franchise HQ, delivery marketplace aggregators, pure SaaS resellers without kitchen ops experience.

---

## Onboarding checklist (founder-led)

Complete before sending a partner welcome kit:

| # | Step | Owner | Evidence |
|---|------|-------|----------|
| **O1** | Qualification call (30 min) — ICP + honesty training | Founder | CRM note |
| **O2** | Share [`forbidden-claims-training.md`](./forbidden-claims-training.md) — partner must ack | Marketing | Email reply or signed ack |
| **O3** | Issue unique referral code via in-app [`/dashboard/referrals`](../app/dashboard/referrals/page.tsx) or manual `ReferralCode` | Ops | Code in CRM |
| **O4** | Send partner one-pager: ICP, BETA labels, pilot Week 1 roadmap | PM | PDF / link pack |
| **O5** | Add to internal partner tracker (name, segment, city, tier, next step) | Founder | Spreadsheet or CRM |
| **O6** | Schedule **monthly 30-min sync** for first 90 days | Founder | Calendar hold |
| **O7** | Archive signed partner acknowledgment | Legal | `artifacts/local-partner-network/` |

**Do not** publish partner logo on `/product` or homepage until **O7** complete and at least one referred operator reaches Pilot Week 2.

---

## Partner tiers

| Tier | Requirements | Partner gets | OS Kitchen obligations |
|------|--------------|--------------|------------------------|
| **Explorer** | Signed ack + qualification pass | Referral link, honest deck, sandbox demo creds | Monthly office hours invite |
| **Active** | **1** referred operator with signed LOI | Co-branded pilot intro email template | Named founder line for intro |
| **Premier** | **3** referred pilots in active Week-4+ | Quarterly business review, optional case study co-marketing | Executive sponsor call |

**No tier upgrade** from promises alone — LOI PDF or pilot kickoff date required.

---

## Referral economics (illustrative — not binding)

Until legal partner SOW is signed, use **internal planning numbers only**:

| Event | Illustrative credit | Paid when |
|-------|---------------------|-----------|
| Qualified discovery call | $0 | Qualification only |
| Design-partner LOI signed | **TBD** — legal review | LOI countersigned |
| Paid subscription after pilot | **TBD** — % of first-year ACV cap | First invoice collected |

Operator-side reward remains the in-app **referral program** (30 days free for both parties) — see [`referral-program.md`](./referral-program.md). Local partners may also qualify as referrers if they operate their own restaurant workspace.

**Forbidden:** guaranteed commission rates in outreach, “passive income,” pyramid language, or “certified OS Kitchen partner” badges without legal template.

---

## Enable gate (public network PRE-LAUNCH)

| # | Gate | Threshold | Evidence |
|---|------|-----------|----------|
| **LG1** | Signed operator LOIs | **≥1** on file | [`loi-signed.md`](./loi-signed.md) |
| **LG2** | Referral program in-app | BETA live | `/dashboard/referrals` |
| **LG3** | Partner acknowledgments | **≥3** signed | `artifacts/local-partner-network/` |
| **LG4** | Successful referred pilot | **≥1** at Week 4+ | Pilot metrics baseline |
| **LG5** | Forbidden claims lint | 0 violations on partner copy | `lintReferralProgramCopy()` |

Run `isLocalPartnerNetworkPublicEnabled()` — returns `true` only when **LG1 + LG3 + LG4** satisfied.

**Before LG5 PASS:** recruit only via 1:1 founder outreach — no paid partner ads or public directory.

---

## Partner enablement kit

| Asset | Path | Use |
|-------|------|-----|
| ICP definition | [`icp-definition-final.md`](./icp-definition-final.md) | Qualify operator prospects |
| LOI template | [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Design partner path |
| Pilot Week 1 | [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md) | Set operator expectations |
| Free pilot tier | [`free-pilot-tier-program.md`](./free-pilot-tier-program.md) | First 5 slots (founder gate) |
| Integration honesty | [`integration-honesty-screen-share-guide.md`](./integration-honesty-screen-share-guide.md) | Demo without overclaim |
| Battle cards | [`competitor-battle-cards/`](./competitor-battle-cards/) | Sales-safe comparisons |
| Referral program | [`referral-program.md`](./referral-program.md) | Operator-to-operator track |

---

## Human gate checklist

Founder **must** approve before adding a local partner:

- [ ] Partner serves **≥3 restaurant operators** in target ICP (not pure retail/e-com only)
- [ ] Partner accepts **BETA / SKIPPED / PRE-LAUNCH** labels in client conversations
- [ ] Partner will **not** promise LIVE DoorDash/Uber Eats day-one or production SSO in pilot
- [ ] Partner has **no active conflict** — not employed by Toast/Square/Lightspeed sales
- [ ] Signed acknowledgment on file (**O7**)
- [ ] Referral code issued and logged (**O3**)

**Escalation:** defer partner enrollment if any disqualifier — offer operator referral link only, not co-delivery.

---

## Sales-safe wording

### Do say

- “We work with local consultants who introduce qualified kitchen operators — pilot phase only.”
- “Your referral link tracks signups; both restaurants get 30 days free when attribution completes.”
- “Integration maturity varies — we show honest labels in Integration Health Center.”

### Do not say

- “Certified OS Kitchen partner network nationwide”
- “Guaranteed referral income” or “passive revenue stream”
- “We replace Toast/Square in week one”
- “Thousands of local partners already enrolled”
- “Production-certified partner program”

---

## Slot tracker (internal)

| Metric | Value (June 2026) |
|--------|-------------------|
| Partners in conversation | 0 |
| Signed acknowledgments | 0 |
| Active tier (≥1 LOI referral) | 0 |
| Premier tier | 0 |
| Public directory | **OFF** |

Update this table when **O5** CRM entries change.

---

## Wiring & certification

| Asset | Path |
|-------|------|
| Policy | `lib/partners/local-partner-network-absolute-final-policy.ts` |
| Audit | `lib/partners/local-partner-network-audit.ts` |
| Strategy parent | `docs/restaurant-partnerships-strategy.md` |
| CI cert | `npm run test:ci:local-partner-network:cert` |

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| `local-partner-network-absolute-final-v1` | 2026-06-06 | Task 75 — local partner network onboarding doc |

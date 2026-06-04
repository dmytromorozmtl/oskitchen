# LOI template walkthrough — live call guide

**Policy:** `loi-template-walkthrough-mkt28-v1`  
**Updated:** 2026-06-03  
**Audience:** Founder, AE — post-discovery, post-demo LOI review call  
**Duration:** ~25 minutes (eight steps)  
**SKU:** `LOI-DP-001` · $0 platform fee · 3-month design partner term  
**Template:** [`loi-design-partner-template.md`](./loi-design-partner-template.md)  
**Honesty:** [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`icp-definition-final.md`](./icp-definition-final.md) · [`integration-honesty-screen-share-guide.md`](./integration-honesty-screen-share-guide.md)

Walk qualified prospects through the design-partner LOI **section by section** on a live call. Goal: countersigned LOI → Week 0 kickoff — **not** paid SOW on this call unless they explicitly upgrade path.

**Honest baseline (June 2026):** **0 signed LOIs** on file. This walkthrough recruits the **first** design partners with BETA / pilot_ready labels — not enterprise certification.

---

## When to walk through the LOI

| Prerequisite | Gate |
|--------------|------|
| Discovery score ≥8/12 | [`discovery-call-script.md`](./discovery-call-script.md) |
| Demo completed or scheduled | [`demo-script-15min.md`](./demo-script-15min.md) |
| ICP qualified — no disqualifiers | [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) |
| Proposal sent (optional) | [`pilot-proposal-template.md`](./pilot-proposal-template.md) |
| Outreach criteria met | [`loi-outreach-email.md`](./loi-outreach-email.md) T1–T10 |

| Stage | Document |
|-------|----------|
| Outreach → discovery | [`loi-outreach-email.md`](./loi-outreach-email.md) |
| Post-demo → LOI review | **This walkthrough** |
| LOI signed → kickoff | [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) |
| Paid evaluation after LOI | [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) |

**GO/NO-GO gate:** `loiSignedDate` and `customerName` in [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) remain `null` until countersigned LOI is on file.

---

## Pre-walkthrough checklist

- [ ] Fill-in fields drafted in LOI PDF (legal name, scope, weekly sync day, staging slug)
- [ ] Exhibit A customized to prospect segment (ghost kitchen / meal prep / commissary)
- [ ] `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` PASS
- [ ] `evaluatePilotIcpQualification` = QUALIFIED (or manual rubric ≥8/10)
- [ ] Integration Health screen-share completed if O5 raised ([`integration-honesty-screen-share-guide.md`](./integration-honesty-screen-share-guide.md))
- [ ] Legal reviewed template — **template only** until their counsel approves
- [ ] Staging workspace slug reserved (not provisioned until signature)
- [ ] Calendar hold for Week 0 kickoff drafted
- [ ] Prospect understands **non-binding** except confidentiality (and optional exclusivity)

---

## Eight walkthrough steps

Total ~1,260 seconds (~21 min content + Q&A). Policy: [`loi-template-walkthrough-policy.ts`](../lib/marketing/loi-template-walkthrough-policy.ts)

### W1 — Frame non-binding design partner LOI (2 min)

**Script:**

> "Today we walk through a **non-binding** design-partner Letter of Intent — SKU **LOI-DP-001**, $0 platform fee for three months. It's not a paid contract or production SLA. It records mutual intent: you get a staging workspace and weekly product access; we get honest feedback. Paid pilot SOW is optional at term end."

**Do not say:** binding agreement · production certified · existing design partners

---

### W2 — Purpose and mutual intent (2 min)

**LOI section:** §1 Purpose

**Script:**

> "§1 says we're co-designing restaurant workflows — order hub, kitchen, storefront, qualified AI modules — with **real operator feedback**. OS Kitchen is pre-revenue; this LOI is how we formalize a design partnership before any paid rollout."

**Show:** Purpose paragraph on shared screen or PDF page 1.

---

### W3 — Design partner commitments (3 min)

**LOI section:** §2 Design Partner commitments

**Script:**

> "Your commitments: **[PILOT_SCOPE_LOCATIONS]** in scope, **weekly 30–45 minute sync** on **[WEEKLY_SYNC_DAY]**, complete **staging golden path** before production traffic, honest defect reports, and no public marketing claims about OS Kitchen without our written approval."

**Confirm aloud:**

- Owner or ops lead on weekly sync  
- Accept BETA / pilot_ready labels  
- Will not demand Toast hardware parity or rush-hour SLA in LOI term  

**Disqualify if:** refuses weekly sync · requires production SSO in 90 days

---

### W4 — OS Kitchen commitments (2 min)

**LOI section:** §3 OS Kitchen commitments

**Script:**

> "We provision staging workspace **`[STAGING_WORKSPACE_SLUG]`**, prioritize your feedback in roadmap reviews for Exhibit A modules, provide qualified training, and maintain confidentiality. Optional commercial note: **[COMMERCIAL_NOTE]** — pilot credit toward year-1 if we convert."

**Do not promise:** 24/7 support · custom dev · LIVE aggregator sync in LOI term

---

### W5 — Scope and honest limitations (5 min)

**LOI section:** §4 Scope and honest limitations + **Exhibit A**

**Script:**

> "§4 is the honesty section — read it together. AI modules ship at configurable maturity; kitchen camera may be preview until configured. Marketplace and DoorDash/Uber/Grubhub are **BETA** — not live marketplace ops. POS is in-browser — no offline or Toast hardware cert. No SSO, SOC 2, unified inventory, or rush-hour SLA in this term."

**Mandatory:** Screen-share Integration Health or open Exhibit A table — pause on BETA and excluded rows.

**See:** [Exhibit A — modules to read aloud](#exhibit-a--modules-to-read-aloud)

---

### W6 — Confidentiality and non-binding (2 min)

**LOI section:** §5 Confidentiality · §6 Non-binding · §7 Term

**Script:**

> "Confidentiality binds both parties for two years. Everything else is **non-binding** — no production SLA. Optional exclusivity in §6 is initialed only if both want it. Term is **three months** with 14-day termination notice."

**Confirm:** Prospect initials exclusivity ☐ Accepted or ☐ Declined

---

### W7 — Exhibits B and C cadence (3 min)

**LOI sections:** Exhibit B · Exhibit C

**Script:**

> "**Exhibit B** is Week 0 kickoff through weekly syncs — we schedule **[WEEKLY_SYNC_DAY]** now. **Exhibit C** lists qualitative success signals — attendance, blocker triage, storefront/POS path without engineer shadowing — **not contractual SLAs**. Paid pilot metrics come later with `smoke:pilot-metrics-baseline`."

**Show:** Exhibit B table · agree on Week 0 date

---

### W8 — Signature path and post-LOI ops (2 min)

**LOI section:** Signature block

**Script:**

> "If this matches your expectations, we'll send PDF for your counsel. After countersign: we provision staging, update GO/NO-GO evidence, schedule Week 0, and **do not** publish logo or case study without written approval."

**CTA:** Send LOI PDF · legal review · target signature within 14 days

**Primary CTA:** [`/book-demo?utm_source=loi&utm_medium=walkthrough&utm_campaign=loi-walkthrough-mkt28`](/book-demo?utm_source=loi&utm_medium=walkthrough&utm_campaign=loi-walkthrough-mkt28)

---

## Exhibit A — modules to read aloud

Customize before call. Source: [`feature-maturity-matrix.md`](./feature-maturity-matrix.md)

| Module | Default maturity | Read aloud line |
|--------|------------------|-----------------|
| Today command center | pilot_ready | "Daily ops hub — pilot_ready" |
| Order hub + production + packing | pilot_ready | "Core fulfillment — pilot_ready" |
| Storefront + pay-later checkout | pilot_ready | "Online ordering — qualified checkout" |
| In-browser POS | pilot_ready | "Software POS — no hardware/offline cert" |
| KDS bump/recall | pilot_ready | "Operational KDS — not rush-hour certified" |
| AI briefing | BETA | "Deterministic briefing — BETA" |
| B2B marketplace buyer | BETA | "Catalog → PO — BETA scaffold" |
| Woo / Shopify test shop | BETA | "Staging test shop only — live smoke before LIVE claim" |
| DoorDash / Uber / Grubhub | BETA | "**Not** live marketplace ops in LOI term" |

**Delete rows** prospect will not use. **Never add** rows with LIVE maturity unless smoke artifact PASS.

---

## Forbidden LOI walkthrough claims

**Never** say during LOI review:

- Binding production SLA or guaranteed uptime  
- Production certified for all tenants  
- All integrations LIVE / live DoorDash / live Uber Eats  
- SOC 2 Type II / enterprise SSO included  
- Guaranteed ROI or savings  
- Thousands of customers or existing design partners (unless true — **0 today**)  
- Unified cross-channel inventory in LOI term  

Lint: `lintLoiTemplateWalkthroughCopy` in [`loi-template-walkthrough-policy.ts`](../lib/marketing/loi-template-walkthrough-policy.ts).

---

## Post-signature checklist

| # | Task | Owner |
|---|------|-------|
| 1 | Store countersigned PDF (customer evidence folder — not git if PII) | Sales |
| 2 | Set `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE` | Ops |
| 3 | Re-run `npm run smoke:pilot-gono-go` | Engineering |
| 4 | CRM: `design_partner_stage=loi_signed` | Sales |
| 5 | Provision staging workspace `[STAGING_WORKSPACE_SLUG]` | Ops |
| 6 | Schedule Week 0 kickoff per Exhibit B | CS |
| 7 | Send [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) | CS |
| 8 | **Do not** publish logo/case study without Exhibit D approval | Marketing |
| 9 | Run `verify-claims` before any partnership announcement | Marketing |

---

## CRM fields

| Field | Example |
|-------|---------|
| `loi_walkthrough_date` | 2026-06-15 |
| `loi_sku` | LOI-DP-001 |
| `loi_status` | walkthrough_complete · sent · signed · declined |
| `staging_workspace_slug` | design-partner-acme |
| `weekly_sync_day` | Tuesday |
| `exhibit_a_customized` | yes |
| `exclusivity_initialed` | declined |
| `week_0_kickoff_date` | 2026-06-22 |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Full LOI text + exhibits |
| [`loi-outreach-email.md`](./loi-outreach-email.md) | Pre-LOI outreach |
| [`pilot-proposal-template.md`](./pilot-proposal-template.md) | Pre-LOI proposal |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | Post-signature execution |
| [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) | GO/NO-GO after LOI |

**Primary CTA:** [`/book-demo?utm_source=loi&utm_medium=walkthrough&utm_campaign=loi-walkthrough-mkt28`](/book-demo?utm_source=loi&utm_medium=walkthrough&utm_campaign=loi-walkthrough-mkt28)

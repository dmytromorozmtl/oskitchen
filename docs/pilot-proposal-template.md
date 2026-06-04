# Pilot proposal template — design partner & paid pilot

**Policy:** `pilot-proposal-template-mkt24-v1`  
**Updated:** 2026-06-03  
**Audience:** Founder, AE — post-discovery / post-demo proposal email or PDF  
**Status:** template — **not** a signed agreement; legal SOW follows acceptance  
**Honesty:** [`icp-definition-final.md`](./icp-definition-final.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md)

Send this **after** a qualified discovery call ([`discovery-call-script.md`](./discovery-call-script.md)) and optional demo ([`demo-script-15min.md`](./demo-script-15min.md)). It bridges interest → LOI or paid pilot SOW — not a substitute for legal review.

No signed founding customers as of June 2026. Proposals recruit **design partners** with honest BETA posture.

---

## When to use

| Stage | Document | Binding? |
|-------|----------|:--------:|
| First mutual interest | [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Non-binding LOI |
| **Scoped proposal (this doc)** | **Pilot proposal** | No — offer only |
| Paid evaluation | [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | SOW / order form |
| Production rollout | MSA + order form | Yes |

**GO/NO-GO gate:** Do not promise production traffic or LIVE integration claims until [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) shows GO with captured metrics.

---

## Fill-in fields

| Field | Example |
|-------|---------|
| `[PROPOSAL_DATE]` | 2026-06-15 |
| `[PROSPECT_LEGAL_NAME]` | Example Kitchen LLC |
| `[PROSPECT_CONTACT_NAME]` | Jane Operator |
| `[PROSPECT_SEGMENT]` | Ghost kitchen · meal prep · commissary |
| `[LOCATIONS_IN_SCOPE]` | 1 commissary + 1 pickup storefront |
| `[PAIN_QUOTE_VERBATIM]` | "We copy Shopify into a Google Sheet every morning." |
| `[PROPOSAL_PATH]` | LOI-DP-001 · PILOT-PRO-50 · PILOT-PLAT-90 |
| `[PILOT_START_DATE]` | 2026-07-01 |
| `[WEEKLY_SYNC_DAY]` | Tuesday |
| `[OS_KITCHEN_SENDER]` | Founder / AE name |
| `[VALID_UNTIL]` | 2026-06-30 (14 days) |

Pricing SKUs: [`pilot-pricing-skus.ts`](../lib/marketing/pilot-pricing-skus.ts) · public list on [`/pricing`](../app/pricing/page.tsx).

---

## Executive summary (copy-paste block)

> **OS Kitchen — Pilot Proposal for [PROSPECT_LEGAL_NAME]**
>
> **Date:** [PROPOSAL_DATE] · **Valid until:** [VALID_UNTIL]
>
> You told us: *"[PAIN_QUOTE_VERBATIM]"*
>
> OS Kitchen is a **software-first** kitchen operating system — order hub, production, in-browser POS, KDS, and storefront — built for operators who run fulfillment in a licensed kitchen. We are **pre-revenue**, recruiting design partners with honest **BETA** / **pilot_ready** labels — not claiming enterprise certification or every integration LIVE.
>
> **Proposed path:** [PROPOSAL_PATH] for **[LOCATIONS_IN_SCOPE]** over a **90-day** qualified pilot window starting [PILOT_START_DATE].
>
> **What you get:** Staging workspace, Launch Wizard onboarding, Integration Health visibility (including SKIPPED states), weekly ops sync on [WEEKLY_SYNC_DAY], and influence on roadmap for in-scope modules.
>
> **What we ask:** Honest feedback, staging golden path before production traffic, and permission for anonymized case study metrics if pilot succeeds.
>
> **Next step:** 30-minute scope review call → LOI or SOW signature → kickoff Week 1 per [`pilot-execution-checklist.md`](./pilot-execution-checklist.md).

---

## Included modules (honest maturity)

Cross-check [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) and [`era20-first-paid-pilot-package-2026-05-28.md`](./era20-first-paid-pilot-package-2026-05-28.md). Use **qualified** wording in the proposal body.

| Module | Maturity | Proposal wording |
|--------|----------|------------------|
| Order hub + manual orders | pilot_ready | Core order intake and routing |
| Storefront checkout | pilot_ready | Online ordering — pay-later path |
| In-browser POS | beta | Software POS — no hardware/offline cert |
| KDS bump/recall | pilot_ready | Operational KDS — not rush-hour SLA |
| Production board + calendar | pilot_ready | Prep scheduling — qualified depth |
| Packing + verification | pilot_ready | QC checklist + verify console |
| Owner Daily Briefing | beta | Ops briefing — demo + pilot use |
| Launch Wizard | beta | Primary onboarding path |
| Integration Health Center | beta | Honest SKIPPED/FAILED visibility |
| CRM profiles/segments | pilot_ready | Customer profiles — qualified |
| Billing | pilot_ready | Workspace billing |

**Optional (post live smoke PASS only):** One Woo **or** Shopify test shop — not full marketplace aggregator ops.

---

## Excluded modules

Do **not** include in proposal scope unless explicitly re-qualified with engineering sign-off:

- Production SSO / SAML for all staff
- SOC 2 Type II / SCIM
- Unified cross-channel inventory depletion
- Unified rewards / gift cross-channel ledger
- Live DoorDash / Uber Eats / Grubhub marketplace ops
- POS hardware certification / offline card queue
- Rush-hour KDS SLA
- Public API production SLA
- Campaigns / Klaviyo-class automation (preview only)

Disqualifiers: [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md#disqualifiers).

---

## Pilot pricing table

Source of truth: [`pilot-pricing-skus.ts`](../lib/marketing/pilot-pricing-skus.ts). Pick **one primary path** per proposal.

| SKU | Name | Pilot price | Duration | Checkout |
|-----|------|-------------|----------|----------|
| **LOI-DP-001** | Design Partner LOI | $0 platform fee | 3 months | LOI → optional SOW |
| **PILOT-STA-50** | Pilot Starter | $15/mo (50% off $29) | 3 months | Invoice |
| **PILOT-PRO-50** | Pilot Pro | $40/mo (50% off $79) | 3 months | Invoice |
| **PILOT-TEA-50** | Pilot Team | $100/mo (50% off $199) | 3 months | Invoice |
| **PILOT-PLAT-90** | Paid Pilot Platform (SOW) | $500–2,500/mo | 90 days | Invoice + SOW |
| **PILOT-IMPL-001** | Implementation (one-time) | $2,000–8,000 | Kickoff | Scoped in SOW |

**Disclaimer (include in every proposal):** Pilot SKUs are contracted via LOI or SOW — not self-serve Stripe checkout. Self-serve 14-day trial uses standard list prices on `/pricing`.

Segment guidance: ghost kitchen → often **PILOT-PRO-50** or **PILOT-PLAT-90** · meal prep → **PILOT-PRO-50** · commissary multi-brand → **PILOT-TEA-50** or **PILOT-PLAT-90**.

---

## 90-day timeline

| Week | Milestone | Owner |
|------|-----------|-------|
| **Pre-kickoff** | Proposal accepted → LOI or SOW signed | Both |
| **Week 1** | Workspace provisioned · Launch Wizard · menu import · Integration Health review | OS Kitchen + prospect |
| **Week 2** | Storefront publish (staging) · POS first shift · KDS stations configured | Prospect |
| **Week 3–4** | Staging golden path complete · optional Woo/Shopify test shop | Both |
| **Week 5–8** | Production traffic (if GO/NO-GO allows) · weekly sync · metrics baseline | Both |
| **Week 9–12** | KPI review · conversion discussion · case study draft | Both |

Checklists: [`pilot-week1-checklist.md`](./pilot-week1-checklist.md) · [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md).

---

## Success metrics

Contract-specific — fill targets together. Do not guarantee outcomes.

| Metric | Example target | Source |
|--------|----------------|--------|
| Orders processed in OS Kitchen | Baseline Week 2 vs Week 8 | Order hub |
| Storefront checkout success | >98% pay-later path | Orders + Stripe |
| POS checkout success | >99% software path | POS audits |
| KDS operational sign-off | Weekly manual review | KDS checklist |
| Integration webhook failure rate | <1% | Webhook queue |
| Operator weekly sign-off | 100% weeks | Golden path |
| Support P0 unresolved | 0 >24h | Support inbox |

Artifact: `npm run smoke:pilot-metrics-baseline` (Week 1+).

---

## Support boundaries

| In scope | Out of scope |
|----------|--------------|
| Workspace setup, catalog, storefront, test-shop integrations | Custom marketplace / plugin dev |
| RBAC guidance, audit export, webhook review | SOC 2 attestation, prod IdP cutover without plan |
| Business-hours support per pilot agreement | 24/7 rush-hour KDS/marketplace on-call |
| Rollback assistance per runbook | Cross-tenant access except audited impersonation |

Escalation: [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · objection handling: [`objection-handling.md`](./objection-handling.md).

---

## Next steps and signature path

1. **Reply** to confirm proposal path ([PROPOSAL_PATH]) and [PILOT_START_DATE].
2. **Scope call** (30 min) — resolve open questions; run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` internally before send.
3. **Sign** [`loi-design-partner-template.md`](./loi-design-partner-template.md) (LOI-DP-001) **or** [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) (paid SOW).
4. **Kickoff** — calendar invite for Week 1 onboarding; record workspace ID in CRM.
5. **Re-run GO/NO-GO** — set `PILOT_GONOGO_CUSTOMER_NAME` + `PILOT_GONOGO_LOI_SIGNED_DATE` after signature.

**Primary CTA:** [`/book-demo`](/book-demo?utm_source=proposal&utm_medium=sales&utm_campaign=pilot-proposal-mkt24)

---

## Forbidden proposal claims

**Never** in proposal email, PDF, or deck:

- Production certified for all tenants
- Thousands of customers / market leader
- All integrations LIVE (DoorDash, Uber Eats, etc.)
- Guaranteed ROI or savings in 90 days
- SOC 2 Type II / enterprise SSO included
- Rush-hour KDS certified
- Toast/Square hardware replacement parity
- Offline POS included

Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before send. Lint helper: `lintPilotProposalCopy` in [`pilot-proposal-template-policy.ts`](../lib/marketing/pilot-proposal-template-policy.ts).

---

## Pre-send checklist

- [ ] Discovery score ≥8/12 ([`discovery-call-script.md`](./discovery-call-script.md))
- [ ] ICP qualified — no disqualifiers ([`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md))
- [ ] Pain quote captured verbatim from call
- [ ] One primary SKU selected — pricing matches `pilot-pricing-skus.ts`
- [ ] Included/excluded modules match era20 package
- [ ] Forbidden claims scan PASS
- [ ] Valid-until date set (default 14 days)
- [ ] P0 proof status documented if customer asks about production readiness
- [ ] Attachments: feature maturity excerpt, support boundaries, rollback summary (if paid SOW path)

---

## CRM fields

| Field | Value |
|-------|-------|
| `proposal_sent_date` | [PROPOSAL_DATE] |
| `proposal_sku` | LOI-DP-001 / PILOT-PRO-50 / PILOT-PLAT-90 |
| `proposal_valid_until` | [VALID_UNTIL] |
| `proposal_status` | sent · viewed · accepted · expired · declined |
| `pain_quote` | verbatim from discovery |
| `next_step` | scope call · LOI · SOW · nurture |

---

## Related documents

| Doc | Use |
|-----|-----|
| [`loi-outreach-email.md`](./loi-outreach-email.md) | Outbound before proposal |
| [`loi-template-walkthrough.md`](./loi-template-walkthrough.md) | Post-proposal LOI review (MKT-28) |
| [`objection-handling.md`](./objection-handling.md) | O4 no customers · O5 SKIPPED integrations |
| [`case-study-template.md`](./case-study-template.md) | Post-pilot narrative |
| [`outreach/pilot-agreement-template.md`](./outreach/pilot-agreement-template.md) | Short-form agreement (legacy) |

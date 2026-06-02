# Design partner letter of intent (LOI) — template

**Policy:** `design-partner-loi-v1`  
**Status:** template ready for sales/legal review — **not** a signed agreement  
**Updated:** 2026-06-02  
**Parent:** [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) · **GO/NO-GO:** [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json)

Use this LOI **before** a paid pilot SOW. It records mutual intent to co-design OS Kitchen with a qualified operator. It is **non-binding** except for confidentiality and the exclusivity window in §6 (if initialed).

Do not claim production certification, LIVE integrations, or investor-grade KPIs until [`pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) shows GO with captured metrics.

---

## When to use

| Stage | Document |
|-------|----------|
| First conversation → mutual interest | **This LOI** |
| Scoped paid evaluation | [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) |
| Production rollout | MSA + order form (legal) |

**GO/NO-GO gate:** `loiSignedDate` and `customerName` in `pilot-gono-go-summary.json` remain `null` until a countersigned LOI is on file.

---

## Qualified design partner profile

Align with Era 17 ICP — same disqualifiers apply ([`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md#disqualifiers)).

| Criterion | Required |
|-----------|:--------:|
| Single-location or small multi-unit (≤5 locations in scope) | **Y** |
| Owner or ops lead available for **weekly** 30–45 min feedback | **Y** |
| Will run staging golden path before production traffic | **Y** |
| Accepts **BETA** / **pilot_ready** labels per [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | **Y** |
| Willing to share operational feedback (not marketing testimonials until approved) | **Y** |

**Ideal fit:** commissary, ghost kitchen, meal-prep operator, or small chain testing order hub + storefront + Today command center — not enterprise SSO-first RFPs without qualification.

---

## Fill-in fields (copy to LOI body)

| Field | Example |
|-------|---------|
| `[EFFECTIVE_DATE]` | 2026-06-15 |
| `[DESIGN_PARTNER_LEGAL_NAME]` | Example Kitchen LLC |
| `[DESIGN_PARTNER_ADDRESS]` | 123 Main St, City, ST |
| `[DESIGN_PARTNER_SIGNER_NAME]` | Jane Operator |
| `[DESIGN_PARTNER_SIGNER_TITLE]` | Owner |
| `[OS_KITCHEN_ENTITY]` | OS Kitchen, Inc. |
| `[OS_KITCHEN_SIGNER_NAME]` | Founder / CEO |
| `[PILOT_SCOPE_LOCATIONS]` | 1 commissary + 1 pickup storefront |
| `[ENGAGEMENT_TERM_MONTHS]` | 3 (default) |
| `[WEEKLY_SYNC_DAY]` | Tuesday |
| `[STAGING_WORKSPACE_SLUG]` | design-partner-example |
| `[COMMERCIAL_NOTE]` | Pilot credit toward year-1 subscription if converted (optional) |

---

## LOI body (send to legal before signature)

> **Letter of Intent — OS Kitchen Design Partner Program**
>
> This Letter of Intent (“LOI”) is entered into as of **[EFFECTIVE_DATE]** by and between **[OS_KITCHEN_ENTITY]** (“OS Kitchen”) and **[DESIGN_PARTNER_LEGAL_NAME]** (“Design Partner”), with principal address **[DESIGN_PARTNER_ADDRESS]**.
>
> ### 1. Purpose
>
> The parties wish to collaborate so OS Kitchen can validate restaurant operating workflows (order hub, kitchen/production, storefront, and qualified AI modules) with real operator feedback. This LOI expresses intent only; a definitive paid pilot agreement may follow.
>
> ### 2. Design Partner commitments
>
> Design Partner agrees to:
>
> - Provide **[PILOT_SCOPE_LOCATIONS]** as the in-scope operating context for the engagement term.
> - Participate in a **weekly sync** (approximately 30–45 minutes on **[WEEKLY_SYNC_DAY]**) and async feedback in OS Kitchen support channels.
> - Complete the staging golden path ([`pilot-operator-golden-path-era17.md`](./pilot-operator-golden-path-era17.md)) before directing production customer traffic through OS Kitchen.
> - Report defects, workflow gaps, and priority feedback honestly; allow OS Kitchen to record session notes for internal product use.
> - Not represent OS Kitchen capabilities beyond qualified **BETA** / **pilot_ready** scope in public marketing without written approval.
>
> ### 3. OS Kitchen commitments
>
> OS Kitchen agrees to:
>
> - Provision a dedicated staging workspace **`[STAGING_WORKSPACE_SLUG]`** and onboarding support during business hours.
> - Prioritize Design Partner feedback in roadmap reviews for modules listed in **Exhibit A**.
> - Provide qualified documentation and training for in-scope modules at current maturity levels.
> - Offer **[COMMERCIAL_NOTE]** (if any — otherwise delete this sentence).
> - Maintain confidentiality of Design Partner operational data per §5.
>
> ### 4. Scope and honest limitations
>
> Modules in scope are listed in **Exhibit A**. Design Partner acknowledges:
>
> - **7 proprietary AI modules in production** at configurable maturity — not all are LIVE for every workflow; kitchen camera may run in preview/synthetic mode until a stream URL is configured.
> - **Marketplace**, delivery marketplaces (DoorDash, Uber Eats, Grubhub), and accounting connectors (QuickBooks, Xero) are **BETA** unless explicitly marked LIVE in writing.
> - POS is in-browser software — no offline mode or Toast/Square hardware certification in this engagement.
> - Inventory depletion applies to POS sales only unless separately unlocked.
> - No production SSO/SAML, SOC 2 attestation, 24/7 rush-hour SLA, or unified cross-channel rewards ledger in this LOI term.
>
> Forbidden claims: see Exhibit E in [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md#forbidden-contract-claims). Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before external materials reference this partnership.
>
> ### 5. Confidentiality
>
> Each party will keep the other’s non-public business, financial, and technical information confidential for **two (2) years** from the effective date, except as required by law or with prior written consent. Aggregated, anonymized product metrics may be used internally by OS Kitchen.
>
> ### 6. Non-binding nature; exclusivity (optional)
>
> Except for §5 (Confidentiality) and this §6 if initialed, this LOI is **non-binding** and does not obligate either party to enter a definitive agreement. Neither party may rely on this LOI as a production SLA.
>
> **Optional exclusivity (initialed by both parties):** For **[ENGAGEMENT_TERM_MONTHS]** months in the **[PILOT_SCOPE_LOCATIONS]** category, Design Partner will not join a competing “design partner” program for a direct OS Kitchen competitor named in writing. ☐ Accepted ☐ Declined
>
> ### 7. Term and termination
>
> Term: **[ENGAGEMENT_TERM_MONTHS]** months from **[EFFECTIVE_DATE]**, unless terminated earlier on **14 days’ written notice**. Either party may terminate if the other materially breaches confidentiality or repeatedly misses agreed sync cadence (three consecutive missed weeks without reschedule).
>
> ### 8. Success signals (non-SLA)
>
> Parties will review progress against **Exhibit B** cadence and the qualitative goals in **Exhibit C**. These are collaboration targets — not contractual SLAs or investor KPIs until captured in a paid pilot SOW and `npm run smoke:pilot-metrics-baseline`.
>
> ### 9. Governing law
>
> State of **[GOVERNING_LAW_STATE]** (legal to confirm). Disputes: good-faith negotiation, then courts of that state.
>
> ---
>
> **IN WITNESS WHEREOF**, the parties have executed this LOI as of the date first written above.
>
> | **OS Kitchen** | **Design Partner** |
> |----------------|-------------------|
> | Entity: **[OS_KITCHEN_ENTITY]** | Entity: **[DESIGN_PARTNER_LEGAL_NAME]** |
> | Name: _________________________ | Name: **[DESIGN_PARTNER_SIGNER_NAME]** |
> | Title: _________________________ | Title: **[DESIGN_PARTNER_SIGNER_TITLE]** |
> | Signature: _____________________ | Signature: _____________________ |
> | Date: _________________________ | Date: _________________________ |

*Legal must review before use — template only.*

---

## Exhibit A — Modules in scope (customize)

| Module | Maturity (default) | Design partner use |
|--------|-------------------|-------------------|
| Today command center | pilot_ready | Daily ops hub |
| Order hub + production + packing | pilot_ready | Fulfillment workflow |
| Storefront + pay-later checkout | pilot_ready | Online ordering |
| In-browser POS | pilot_ready | Counter service |
| KDS bump/recall | pilot_ready | Service window ops — not rush-hour certified |
| AI briefing (deterministic) | BETA | Morning ops summary |
| Kitchen camera / station view | BETA / preview | Optional — synthetic until camera configured |
| B2B marketplace (buyer) | BETA | Catalog → cart → PO when migration applied |
| WooCommerce / Shopify test shop | BETA | Staging store only |
| DoorDash / Uber Eats / Grubhub | BETA | **Not** live marketplace ops in LOI term |

Source of truth: [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) · [`lib/integrations/integration-registry.ts`](../lib/integrations/integration-registry.ts)

---

## Exhibit B — Engagement cadence

| Week | Activity | Owner |
|------|----------|-------|
| 0 | Kickoff + workspace provision + ICP confirmation | OS Kitchen CS |
| 1 | Staging golden path walkthrough | Design Partner ops lead |
| 2–N | Weekly sync **[WEEKLY_SYNC_DAY]** + defect log review | Both |
| Mid-term | Scope review — add/remove Exhibit A rows | Founder + Design Partner |
| Final | Retrospective + paid pilot decision | Both |

Runbooks: [`PILOT_ONBOARDING_RUNBOOK.md`](./PILOT_ONBOARDING_RUNBOOK.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

---

## Exhibit C — Qualitative success signals (not SLA)

| Signal | Target (example) |
|--------|------------------|
| Weekly sync attendance | ≥80% of scheduled weeks |
| Critical workflow blockers | Documented + triaged within 5 business days |
| Storefront / POS path | Operator can complete without engineer shadowing |
| Feedback quality | Actionable notes captured in support or shared doc |
| Conversion intent | Written go/no-go on paid pilot by end of term |

---

## Pre-signature checklist

| ID | Task | Owner | Blocker? |
|----|------|-------|:--------:|
| loi-icp | ICP criteria met; no disqualifiers | Sales | **Y** |
| loi-claims | `verify-claims` strict PASS | Engineering | **Y** |
| loi-scope | Exhibit A matches matrix maturity | Sales + Engineering | **Y** |
| loi-legal | Non-binding + confidentiality reviewed | Legal | **Y** |
| loi-staging | Staging workspace slug reserved | Ops | **Y** |
| loi-honest | No LIVE integration claims in outreach deck | Marketing | **Y** |

---

## After signature — internal updates

1. Store countersigned PDF in customer evidence folder (not in git if PII).
2. Update GO/NO-GO inputs:
   - Set `customerName` and `loiSignedDate` in evidence pack / env for `npm run smoke:pilot-gono-go`.
   - Re-run `npm run cert:commercial-pilot-evidence-era16` if staging credentials are available.
3. Record in CRM: design partner stage → **LOI signed**.
4. Schedule Week 0 kickoff per Exhibit B.
5. Do **not** publish case study or logo use without written Exhibit D approval (add as needed).

---

## Related docs

| Doc | Use |
|-----|-----|
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Paid pilot SOW after LOI |
| [`pilot-program.md`](./pilot-program.md) | Program overview |
| [`PAID_PILOT_GO_NO_GO_CHECKLIST.md`](./PAID_PILOT_GO_NO_GO_CHECKLIST.md) | GO/NO-GO criteria |
| [`feature-maturity-matrix.md`](./feature-maturity-matrix.md) | Maturity source of truth |

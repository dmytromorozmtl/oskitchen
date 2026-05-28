# Era 17 — Pilot case study draft (internal)

**Policy:** `era17-pilot-case-study-draft-v1`  
**Status:** **internal_draft_awaiting_customer_approval** — not for public publish until permission + verified KPIs  
**Updated:** 2026-05-28  
**Audience:** GTM, sales, founder (internal review only)  
**Parent:** [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md) · [`pilot-agreement-template.md`](./outreach/pilot-agreement-template.md)

This document is an **internal draft scaffold**. It is **not** a published customer story. Do not link from marketing pages, sales deck, or outreach until publish gates pass.

---

## Purpose and honest scope

KitchenOS has **no verified paid-pilot case study** as of 2026-05-28. This draft prepares structure for the **first** pilot story once:

1. A qualified paid pilot completes (GO/NO-GO artifact, signed agreement)
2. Pilot metrics baseline is captured (`overall: PASSED`)
3. Customer grants written case study permission (named or anonymized)

Legacy templates (`docs/templates/CASE_STUDY_TEMPLATE.md`, cold-email placeholders) remain **non-canonical** for Era 17 proof — use this doc + smoke gate instead.

---

## Internal draft only

| State | Meaning |
|-------|---------|
| **internal_draft_ready** | Template + cert wiring complete — internal review allowed |
| **publish blocked** | No `/customers` or blog publish until gates below pass |
| **No fake customer** | Do not name a pilot operator without signed LOI + agreement |

```bash
npm run smoke:pilot-case-study-draft
# → artifacts/pilot-case-study-draft-summary.json
```

---

## Customer permission gate

Before any external publish:

1. Pilot agreement signed — see [`outreach/pilot-agreement-template.md`](./outreach/pilot-agreement-template.md) case study clause
2. Set `PILOT_CASE_STUDY_CUSTOMER_APPROVAL=signed` (named) or `anonymized_signed`
3. Legal review of quote and metrics table
4. `publishProofStatus: proof_ready_for_publish` in smoke artifact

**Without approval:** keep draft internal; use qualitative pilot-readiness language in sales only.

---

## Metrics verification gate

Case study **numbers** require verified dashboard exports — not estimates or template placeholders.

1. `npm run smoke:pilot-metrics-baseline` → **`overall: PASSED`**
2. All six KPIs captured with pilot week + customer reference in artifact
3. Screenshot or export audit trail stored with case study package
4. Cross-check with `npm run smoke:investor-narrative-onepager` — metrics narrative gate

Until metrics gate passes: leave metric cells as `[TBD — awaiting pilot week-2 snapshot]`.

---

## Safe case study wording

**Allowed now (internal qualitative):**

- "Pilot case study draft prepared — awaiting first signed pilot permission"
- "Qualified pilot infrastructure with honest maturity labels"
- "Modules in scope: order hub, POS software path, KDS qualified, storefront, Woo/Shopify wiring"

**Allowed only after metrics + approval gates:**

- Before/after orders/week, checkout success %, KDS bump rate, support tickets, operator feedback
- Named or anonymized operator quote with signed release

**Not allowed:**

- Fabricated operator name, city, or results
- Cold-email placeholder metrics (e.g. "40 to 120 orders/week") as verified proof
- Production SSO, SOC2, unified inventory/rewards, rush-hour KDS, or marketplace live ops as outcomes

---

## Forbidden claims

Enforced via `era17-pilot-forbidden-claims-enforcement-v1` and `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`:

- Published customer case study without signed approval
- Fabricated pilot metrics or before/after numbers
- Named customer reference without permission
- Toast/Square hardware parity or offline POS outcomes
- Unified inventory depletion across channels
- Rush-hour KDS certification claims

---

## Anonymized pilot draft template

**Segment:** [Meal prep | Ghost kitchen | Single-location restaurant | Café]  
**Location:** [City, Region — or "Anonymized pilot, US"]  
**Plan:** [Starter | Pro | Team — pilot pricing per agreement]

### Before KitchenOS

- Orders/week: `[TBD — awaiting pilot week-2 snapshot]`
- Tools used: `[TBD — discovery notes]`
- Pain (1–2 sentences): `[TBD — operator interview]`

### Implementation (week 1)

- Modules enabled: `[POS | KDS | production calendar | storefront | Woo/Shopify — per pilot scope]`
- Time to first live order: `[TBD — onboarding log]`

### Results (pilot window) — verified exports only

| Metric | Before | After | Δ | Source |
|--------|--------|-------|---|--------|
| Orders/day | TBD | TBD | TBD | pilot-metrics-baseline artifact |
| Checkout success % | TBD | TBD | TBD | pilot-metrics-baseline artifact |
| KDS bump rate | TBD | TBD | TBD | pilot-metrics-baseline artifact |
| Support tickets / week | TBD | TBD | TBD | pilot-metrics-baseline artifact |
| Operator feedback (1–10) | TBD | TBD | TBD | pilot-metrics-baseline artifact |

### Quote

> "[TBD — operator quote after pilot retrospective]"  
> — [Name, Title] or "Operations lead, anonymized pilot"

### Stack context (optional)

- Replaced: `[TBD]`
- Kept: `[TBD]`
- Honest limitations acknowledged: `[e.g. POS-only inventory depletion; no offline POS]`

---

## Sign-off checklist

| Step | Owner | Status |
|------|-------|--------|
| Internal draft reviewed (`caseStudyProofStatus: internal_draft_ready`) | GTM | ☐ |
| Paid pilot agreement signed | Sales | ☐ |
| Pilot metrics baseline `overall: PASSED` | Ops | ☐ |
| Customer case study permission (`PILOT_CASE_STUDY_CUSTOMER_APPROVAL`) | Legal + customer | ☐ |
| Metrics verified from dashboard exports | Ops | ☐ |
| `npm run smoke:pilot-case-study-draft` → `publishProofStatus: proof_ready_for_publish` | GTM | ☐ |
| `MARKETING_CLAIMS_STRICT=1 verify-claims` before publish | GTM | ☐ |
| Published at `/customers/...` or approved channel | GTM | ☐ |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`pilot-metrics-baseline-era17.md`](./pilot-metrics-baseline-era17.md) | KPI capture gate |
| [`investor-narrative-onepager-era17.md`](./investor-narrative-onepager-era17.md) | Investor metrics narrative |
| [`competitor-feature-gap-matrix.md`](./competitor-feature-gap-matrix.md) | Honest gap framing |
| [`templates/CASE_STUDY_TEMPLATE.md`](./templates/CASE_STUDY_TEMPLATE.md) | Legacy template — superseded for Era 17 proof |

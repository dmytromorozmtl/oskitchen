# Product Hunt launch — defer until 3 pilots

**Task:** MKT-30  
**Status:** **DEFERRED** — do not submit to Product Hunt until launch gates pass  
**Updated:** 2026-06-03  
**Parent:** [`series-a-hold-notice.md`](./series-a-hold-notice.md) · [`press-release-first-design-partner.md`](./press-release-first-design-partner.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`trust`](/trust)

Product Hunt amplifies **first impressions at scale**. OS Kitchen is **not ready** for a PH launch while we have **0 signed LOIs**, **0 paid pilots**, and **0 LIVE integrations** in production proof. This doc records the **explicit defer decision** and the gates required before submission.

---

## Decision summary

| Field | Value |
|-------|-------|
| **Decision** | **DEFER** Product Hunt launch |
| **Minimum pilots required** | **3** active design-partner or paid pilots |
| **Current pilots (June 2026)** | **0** |
| **Earliest reconsider date** | After pilot #3 Week-4 review ([`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) R3) |
| **Owner** | Founder + Marketing |

**Rationale:** PH traffic expects a polished onboarding path, social proof, and stable demo. Launching with BETA-heavy modules and SKIPPED integration smokes creates support debt and forbidden-claim risk on a public thread we cannot retract.

---

## Launch gates (all required before PH submit)

| # | Gate | Threshold | Evidence |
|---|------|-----------|----------|
| **LG1** | Active pilots | **≥3** | Three countersigned LOIs or paid SOWs in CRM |
| **LG2** | Pilot metrics baseline | ≥2 pilots with `overall: PASSED` on Week 2+ | `artifacts/pilot-metrics-baseline-summary.json` |
| **LG3** | Case study draft | ≥1 partner-approved short form | [`case-study-template.md`](./case-study-template.md) sign-off |
| **LG4** | Staging golden path | Tier-2 operator checklist PASS | `pilot-operator-golden-path-summary` artifact |
| **LG5** | P0 orchestrator | PASS in CI | `.github/workflows/p0-orchestrator.yml` |
| **LG6** | Demo stability | 15-min demo script without engineer shadow | [`demo-script-15min.md`](./demo-script-15min.md) dry-run log ×3 |
| **LG7** | Forbidden claims | 0 violations in PH draft | `lintProductHuntLaunchDeferCopy()` |
| **LG8** | `/trust` linked | BETA/PREVIEW/SKIPPED explained in listing | [`/trust`](/trust) |

**Hard block:** Do not launch PH the same week as first press release ([`press-release-first-design-partner.md`](./press-release-first-design-partner.md)) — stagger by ≥14 days to avoid conflicting narratives.

---

## Why defer now (internal talking points)

1. **No install-base proof** — PH comments will ask “who uses this?”; we have no named customers to cite.
2. **Integration honesty** — WooCommerce/Shopify smokes are SKIPPED; PH copy cannot imply LIVE channel sync.
3. **Support capacity** — single-contributor bus factor; PH spike breaks onboarding SLA for real pilots.
4. **Series A hold** — PH is not a fundraising channel until [`series-a-hold-notice.md`](./series-a-hold-notice.md) lifts.
5. **NPS unknown** — defer until baseline NPS from pilot #1–#3 (target ≥40 before broad consumer-style launch).

---

## Pre-submit checklist (when gates pass)

1. Confirm **LG1–LG8** with PM sign-off row in launch tracker.
2. Draft PH tagline + first comment using template below; run forbidden-claims lint.
3. Schedule launch for **Tuesday 00:01 PT** — avoid holidays and major competitor launches.
4. Prepare maker comment: honest BETA scope, link `/trust`, link `/book-demo` for ICP-only onboarding.
5. Assign **comment responder** for 24h — founder or designated GTM, not engineering.
6. Disable paid ads pointing to PH URL until Day 7 review (avoid junk signups outside ICP).
7. Archive listing copy + screenshot set in `artifacts/product-hunt-launch/`.

---

## Product Hunt listing template (draft — do not publish)

### Tagline (≤60 chars)

> Kitchen ops for commissaries — honest BETA, pilot onboarding

### Description (short)

> OS Kitchen unifies preorder storefront, production board, KDS, and owner briefing for ghost kitchens and meal-prep operators — **software-first**, no proprietary terminal lock-in. We are in **qualified beta** with design-partner pilots; book a fit call if you match our ICP ([`/trust`](/trust) for module maturity labels).

### Maker first comment (template)

> Hi PH — we're building a kitchen operations platform for commissary and ghost-kitchen operators. **Honest scope:** several modules are BETA or PREVIEW; integrations show SKIPPED until staging smokes PASS. We're not claiming to replace Toast hardware stacks — we're proving production workflows with pilot partners first. Happy to answer questions about what's live vs in progress. ICP: [`icp-definition-final.md`](./icp-definition-final.md) · Trust labels: /trust

### Screenshots (when ready)

| # | Screen | Label honesty |
|---|--------|---------------|
| 1 | Today command center | pilot_ready |
| 2 | Integration Health strip | pilot_ready — explain SKIPPED rows |
| 3 | KDS queue | BETA — no rush-hour SLO claim |
| 4 | Storefront checkout | BETA |
| 5 | Owner briefing | BETA |

---

## Forbidden Product Hunt claims

Do not use in tagline, description, gallery text, or maker comment:

- “#1 product” / “best POS” / “Toast killer”
- “Thousands of restaurants” or implied customer count
- “All integrations live” / “production-certified”
- “Enterprise-ready” / SOC 2 / SCIM in production
- “Free forever” without pilot SKU context ([`pilot-pricing-skus.ts`](../lib/marketing/pilot-pricing-skus.ts))
- “Series A” / investor metrics / ARR
- “Guaranteed ROI” or fabricated order-volume stats
- “Product Hunt exclusive” pricing not on `/pricing`

Run: `lintProductHuntLaunchDeferCopy(draft)` before any public draft is shared.

---

## Alternatives while deferred

| Channel | Status | Notes |
|---------|--------|-------|
| LOI outreach | Active | [`loi-outreach-email.md`](./loi-outreach-email.md) |
| First design-partner PR | Gated | MKT-29 after LOI signed |
| Webinar ghost kitchens | BETA | [`webinar-ghost-kitchens.md`](./webinar-ghost-kitchens.md) |
| SEO ICP keywords | Active | [`seo-10-icp-keywords.md`](./seo-10-icp-keywords.md) |
| Product Hunt | **DEFER** | Revisit at 3 pilots |

---

## Reconsideration trigger

Schedule a **30-min GO/NO-GO review** when pilot count reaches **3**:

```bash
# Internal only — do not run PH submit from CI
npm run smoke:pilot-gono-go  # must not be NO-GO for commercial narrative
```

If decision remains **NO-GO**, extend defer and document blockers in execution log.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`press-release-first-design-partner.md`](./press-release-first-design-partner.md) | First public partner story (MKT-29) |
| [`case-study-template.md`](./case-study-template.md) | Social proof before PH |
| [`demo-script-15min.md`](./demo-script-15min.md) | Live demo readiness (MKT-22) |
| [`series-a-hold-notice.md`](./series-a-hold-notice.md) | Investor narrative hold (MKT-10) |

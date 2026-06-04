# Analyst briefing deck — enterprise & industry analysts

**Task:** MKT-35  
**Status:** **INTERNAL DRAFT** — distribute only after documented **enterprise interest** + founder approval  
**Updated:** 2026-06-03  
**Format:** 12-slide outline (AB1–AB12) · ~25 min briefing + Q&A  
**Parent:** [`enterprise-mvp-spec.md`](./enterprise-mvp-spec.md) · [`series-a-hold-notice.md`](./series-a-hold-notice.md) · [`integration-health-sales-deck-v2.md`](./integration-health-sales-deck-v2.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md)

This deck is for **industry analysts, enterprise procurement reviewers, and strategic partners** — not a Series A fundraise pitch. It explains category, honest product maturity, and enterprise path without inflating SKIPPED integrations.

**Honest baseline (June 2026):** **0 enterprise contracts**, **0 signed LOI**, P0 **NO-GO**. Hold external distribution until enterprise interest gates pass.

---

## Enterprise interest gate (required before send)

| # | Gate | Evidence |
|---|------|----------|
| **EG1** | Qualified enterprise inbound | ≥1 logged signal in CRM |
| **EG2** | Inbound type (one of) | RFP · security questionnaire · 3+ location operator demo · franchise/commissary LOI |
| **EG3** | Founder approval row | Named approver + date |
| **EG4** | Series A hold respected | No fundraise narrative ([`series-a-hold-notice.md`](./series-a-hold-notice.md)) |
| **EG5** | `lintAnalystBriefingDeckCopy()` PASS | Forbidden claims clean |
| **EG6** | Attach `/trust` + Integration Health screenshot | SKIPPED rows visible |

Run: `isAnalystBriefingDeckDistributable(enterpriseInterestCount)` — returns `true` when `enterpriseInterestCount >= 1` and EG3–EG6 satisfied.

**Not enterprise interest:** generic press inquiry, student research, competitor fishing without NDA, seed VC labeled "diligence" (route to [`series-a-narrative.md`](./series-a-narrative.md) internal draft only).

---

## Slide outline (AB1–AB12)

| ID | Title | Talk track (60–90s) | Honesty label |
|----|-------|---------------------|---------------|
| **AB1** | OS Kitchen — kitchen operations platform | Meal prep, ghost kitchen, commissary ICP; software-first | Category |
| **AB2** | Market problem | Fragmented channels, production truth, margin blind spots | No TAM $ claims without source |
| **AB3** | Product scope today | POS, storefront, KDS, production, marketplace scaffold | **BETA / pilot_ready** mix |
| **AB4** | Integration Health moat | PASS / BETA / SKIPPED governance | **0 LIVE** integrations June 2026 |
| **AB5** | Enterprise MVP pillars | Multi-location, RBAC, SSO foundation, API | Per [`enterprise-mvp-spec.md`](./enterprise-mvp-spec.md) |
| **AB6** | Security & compliance posture | Tenant isolation, audit hooks, DPA template | **Not SOC 2 certified** |
| **AB7** | Competitive frame | vs Toast/Square/Lightspeed — acknowledge hardware gap | [`toast-gap-analysis.md`](./toast-gap-analysis.md) public summary |
| **AB8** | Pilot proof model | Design partner LOI → metrics baseline → LIVE promotion | 0 customers today |
| **AB9** | 12-month roadmap | Woo/Shopify LIVE, SSO smoke, marketplace pilot | [`beta-to-live-roadmap.md`](./beta-to-live-roadmap.md) |
| **AB10** | Risks & mitigations | Single contributor, 9-day codebase, smoke SKIPPED | Transparent |
| **AB11** | Analyst Q&A guardrails | What we will not claim in writing | Forbidden list below |
| **AB12** | Next steps | NDA · data room slice · follow-up demo | No ARR slides |

**Deck build:** Export from [`sales-deck-slides.ts`](../lib/marketing/sales-deck-slides.ts) subset + enterprise slides — archive PDF in `artifacts/analyst-briefing-deck/`.

---

## Enterprise interest qualification (CRM)

| Signal type | Qualifies EG1? | Notes |
|-------------|:--------------:|-------|
| Security questionnaire (SIG Lite / custom) | ✅ | Attach honesty pack |
| RFP / RFI from 3+ location operator | ✅ | Scope to Enterprise MVP |
| Inbound "enterprise SSO required" | ✅ | Show SSO pilot foundation only |
| Analyst firm briefing request (Gartner, etc.) | ✅ | NDA + AB deck |
| Seed VC "market map" call | ❌ for this deck | Use internal narrative hold |
| Press blogger | ❌ | [`press-release-first-design-partner.md`](./press-release-first-design-partner.md) path |

---

## Forbidden analyst briefing claims

- Fabricated TAM/SAM/CAGR without cited source
- "Thousands of customers" or logo wall without permission
- SOC 2 Type II certified / "enterprise-ready day one"
- All integrations LIVE / production-certified
- Series A fundraising narrative while hold active
- "Beat Toast/Square on everything"
- Rush-hour KDS certified / offline card production-ready
- ARR, NRR, or pilot KPIs without `pilot-metrics-baseline` PASS

Run `lintAnalystBriefingDeckCopy(draft)` on speaker notes and leave-behind PDF.

---

## Distribution checklist

1. Log enterprise interest type + company in CRM.
2. Founder approves send (EG3).
3. Run forbidden-claims lint on all 12 slides.
4. Include `/trust` link and Integration Health screenshot with SKIPPED visible.
5. Attach [`enterprise-procurement-pack.md`](./enterprise-procurement-pack.md) if security questionnaire.
6. **Do not** attach full data room or Series A deck.
7. Archive sent PDF + date in `artifacts/analyst-briefing-deck/`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`enterprise-mvp-spec.md`](./enterprise-mvp-spec.md) | AB5 scope |
| [`soc2-readiness-assessment.md`](./soc2-readiness-assessment.md) | AB6 depth |
| [`competitive-battle-cards.md`](./competitive-battle-cards.md) | AB7 talk tracks |
| [`state-of-ghost-kitchen-ops-report.md`](./state-of-ghost-kitchen-ops-report.md) | Future analyst cite (MKT-33) |

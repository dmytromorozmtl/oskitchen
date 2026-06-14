# Product Hunt launch prep — OS Kitchen

**Policy:** `product-hunt-launch-prep-absolute-final-v1` · **Gap P2-60:** [`product-hunt-launch-prep-p2-60.md`](./product-hunt-launch-prep-p2-60.md) · **Blueprint P3-65:** [`product-hunt-launch-prep-p3-65.md`](./product-hunt-launch-prep-p3-65.md)  
**Task:** Absolute Final #85  
**Date:** 2026-06-06  
**Status:** **PREP ONLY** — do not submit until [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) gates **LG1–LG8** pass  
**Parent:** [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) · [`press-release-first-design-partner.md`](./press-release-first-design-partner.md) · [`case-study-template.md`](./case-study-template.md) · [`demo-script-15min.md`](./demo-script-15min.md) · [`/trust`](/trust)

This document is the **operational launch prep playbook** for Product Hunt: timeline, assets, listing copy, hunter outreach, launch-day runbook, and post-launch follow-up. It complements the **defer policy** — prep work may begin before gates pass, but **Do not submit** publicly until ≥3 pilots and LG1–LG8 evidence exist.

**Honesty rule:** Product Hunt amplifies first impressions. Every public surface must carry **BETA / SKIPPED / pilot** labels where applicable. Run `lintProductHuntLaunchDeferCopy()` on all drafts before sharing externally.

---

## Prep summary

| Field | Value |
|-------|-------|
| **Current decision** | **DEFER** — see defer doc |
| **Minimum pilots to submit** | **3** active design-partner or paid pilots |
| **Target launch window** | Tuesday 00:01 PT (after gates + ≥14 days from first partner PR) |
| **Archive folder** | `artifacts/product-hunt-launch/` |
| **Listing owner** | Founder + Marketing |
| **Comment responder (24h)** | Founder or designated GTM — not engineering |

---

## T-minus timeline

### T-30 days (prep kickoff — allowed while deferred)

| Action | Owner | Done |
|--------|-------|------|
| Confirm defer gates still tracked in CRM / LOI pipeline | Founder | ☐ |
| Draft tagline + short description (template below) | Marketing | ☐ |
| Run forbidden-claims lint on draft copy | Marketing | ☐ |
| Capture 5 screenshot candidates with maturity labels | Product | ☐ |
| Record 60s demo GIF (no rush-hour SLO claims) | Founder | ☐ |
| Identify 10 hunter candidates (ICP-adjacent, not spam lists) | GTM | ☐ |
| Link `/trust`, `/pricing`, `/book-demo` in internal preview | Marketing | ☐ |

### T-14 days (gates review)

| Action | Owner | Done |
|--------|-------|------|
| Re-run **LG1–LG8** gate checklist from defer doc | PM | ☐ |
| If pilots < 3 → **extend defer**, do not schedule submit | Founder | ☐ |
| Partner-approved case study excerpt (≥1) | GTM | ☐ |
| 15-min demo dry-run ×3 without engineer shadow | Founder | ☐ |
| P0 orchestrator PASS in CI | Engineering | ☐ |
| Archive draft listing in `artifacts/product-hunt-launch/listing-draft.md` | Marketing | ☐ |

### T-7 days (asset lock)

| Action | Owner | Done |
|--------|-------|------|
| Finalize gallery: 5 screenshots + 1 hero GIF | Product | ☐ |
| Maker first comment drafted + linted | Founder | ☐ |
| Supporter outreach email (≤50 ICP contacts, no blast) | GTM | ☐ |
| `/book-demo` calendar capacity for PH week (+50% buffer) | Founder | ☐ |
| Disable conflicting paid ads for launch week | Marketing | ☐ |
| Assign 24h comment responder + backup | GTM | ☐ |

### T-1 day (pre-flight)

| Action | Owner | Done |
|--------|-------|------|
| PH account + maker profile updated (logo, links) | Founder | ☐ |
| Listing pasted in PH draft (unpublished) | Marketing | ☐ |
| `lintProductHuntLaunchDeferCopy(listing)` → **0 hits** | Marketing | ☐ |
| Staging signup + demo path smoke PASS | Engineering | ☐ |
| Internal Slack/Discord alert: launch tomorrow 00:01 PT | Founder | ☐ |
| Sleep schedule — responder on for first 6h | Founder | ☐ |

### Launch day (T-0)

| Time (PT) | Action |
|-----------|--------|
| **00:01** | Publish listing |
| **00:05** | Post maker first comment (template below) |
| **00:15–06:00** | Respond to every comment ≤15 min; link `/trust` for maturity questions |
| **06:00–12:00** | Second responder shift; route ICP to `/book-demo`, others to `/kb` |
| **12:00–18:00** | Screenshot wins to social (no forbidden claims) |
| **18:00–24:00** | Thank supporters; log objections for product backlog |
| **EOD** | Export PH metrics → `artifacts/product-hunt-launch/launch-day-metrics.json` |

### T+7 days (retrospective)

| Action | Owner | Done |
|--------|-------|------|
| Signups vs ICP fit review | GTM | ☐ |
| Support ticket volume vs baseline | Ops | ☐ |
| Forbidden-claim incidents in thread (must be 0) | Marketing | ☐ |
| Pilot conversion from PH traffic | Founder | ☐ |
| GO/NO-GO on paid ads pointing to PH URL | Marketing | ☐ |
| Retro doc in execution log | PM | ☐ |

---

## Asset checklist

Store finalized assets in `artifacts/product-hunt-launch/`:

| Asset | Spec | Honesty label on image |
|-------|------|------------------------|
| **Logo** | 240×240 PNG, transparent | — |
| **Gallery 1** | Today command center | pilot_ready |
| **Gallery 2** | Integration Health strip | Explain SKIPPED rows in caption |
| **Gallery 3** | KDS queue | BETA — no rush-hour SLO |
| **Gallery 4** | Storefront checkout | BETA |
| **Gallery 5** | Owner briefing | BETA |
| **Hero GIF** | 60s: menu → order → KDS | No "all integrations live" |
| **Maker avatar** | Founder headshot | — |
| **First comment** | `listing-maker-comment.md` | Link `/trust` |

**Do not publish** gallery text implying LIVE marketplace ops when smokes are SKIPPED.

---

## Listing copy (draft — lint before publish)

### Tagline (≤60 chars)

> Kitchen ops for commissaries — honest BETA, pilot onboarding

### Short description

> OS Kitchen unifies preorder storefront, production board, KDS, and owner briefing for ghost kitchens and meal-prep operators — **software-first**, no proprietary terminal lock-in. Qualified beta with design-partner pilots; book a fit call if you match our ICP. Module maturity: [/trust](/trust).

### Topics / categories

- Primary: **SaaS** · **Productivity**
- Secondary: **Developer Tools** (only if API docs linked — otherwise omit)
- Do **not** tag as "POS hardware" — wrong wedge

### Maker first comment (template)

> Hi Product Hunt — we're OS Kitchen, a kitchen operations platform for commissary and ghost-kitchen operators.
>
> **Honest scope:** several modules are BETA or PREVIEW; integrations show SKIPPED until staging smokes PASS. We're not claiming to replace Toast hardware stacks — we're proving production workflows with pilot partners first.
>
> - ICP: commissary / meal-prep / multi-concept (≤5 locations)  
> - Trust labels: https://os-kitchen.com/trust  
> - Book a fit call: https://os-kitchen.com/book-demo  
> - Pricing (real SKUs): https://os-kitchen.com/pricing  
>
> Happy to answer what's live vs in progress. Thanks for reading!

Run: `lintProductHuntLaunchDeferCopy(draft)` — must return **0 forbidden hits**.

---

## Hunter & supporter outreach

### Hunter criteria (quality over volume)

- Prior PH launches in **SaaS / restaurant tech / ops** with substantive comments
- No paid "guaranteed #1" hunter services
- Prefer operators or agency founders in ghost-kitchen / meal-prep adjacency

### Outreach template (internal — personalize)

> Subject: OS Kitchen launching on PH [date] — kitchen ops for commissaries  
>
> Hi [Name] — we're launching OS Kitchen on Product Hunt [date]. It's a software-first kitchen OS for commissary/meal-prep operators (honest BETA labels, pilot onboarding). Would value your upvote if it fits your audience — not asking for a blind boost. Listing draft: [internal link]. Trust page: /trust.

**Cap:** ≤50 personalized messages. No purchased upvote lists.

### Supporter timing

- Ask core network **after** publish (00:01 PT), not before leak
- Design partners may comment with **approved** quotes only ([`case-study-template.md`](./case-study-template.md))

---

## Launch day runbook

1. **Publish** at 00:01 PT Tuesday (avoid US holidays + major competitor launches same day).
2. **Maker comment** within 5 minutes — sets honest tone before speculation.
3. **Respond** to every question; defer engineering deep-dives to `/kb` or follow-up call.
4. **Route ICP** (commissary, meal-prep, ≤5 locations) to `/book-demo`.
5. **Route non-ICP** politely to `/kb` — do not force unqualified pilots.
6. **Escalate** forbidden-claim questions to founder before answering.
7. **Do not** offer "Product Hunt exclusive" pricing unless identical offer exists on `/pricing`.
8. **Log** top 10 objections → product backlog same day.

---

## Metrics to track

| Metric | Target (directional) | Notes |
|--------|----------------------|-------|
| PH upvotes | Baseline only — not a success KPI | Vanity; track ICP signups instead |
| Qualified demo requests | ≥5 in launch week | From `/book-demo` UTM `utm_campaign=product_hunt` |
| Signups | Monitor support load | Single-contributor bus factor — cap ads if spike breaks SLA |
| Comment response time | ≤15 min (first 6h) | Founder/GTM on rotation |
| Forbidden-claim incidents | **0** | Any hit → edit comment + retro |
| Pilot conversion (30d) | ≥1 from PH traffic | Real success metric |

Export EOD metrics to `artifacts/product-hunt-launch/launch-day-metrics.json`.

---

## Human gate checklist (submit blocker)

All must be **checked** before PH publish button:

| # | Gate | Evidence |
|---|------|----------|
| **HG1** | ≥3 active pilots | CRM / LOI countersign |
| **HG2** | LG1–LG8 from defer doc | PM sign-off row |
| **HG3** | Listing lint PASS | `lintProductHuntLaunchDeferCopy()` |
| **HG4** | `/trust` linked in listing | URL live |
| **HG5** | Case study ≥1 approved | Partner sign-off |
| **HG6** | Demo dry-run ×3 PASS | [`demo-script-15min.md`](./demo-script-15min.md) log |
| **HG7** | ≥14 days since first partner PR | Calendar check |
| **HG8** | Comment responder assigned 24h | Name in launch tracker |
| **HG9** | Assets archived | `artifacts/product-hunt-launch/` |
| **HG10** | Series A hold still respected | [`series-a-hold-notice.md`](./series-a-hold-notice.md) |

**If any HG fails → NO-GO.** Extend defer and document in execution log.

---

## Forbidden Product Hunt claims

Do not use in tagline, description, gallery, or comments:

- “#1 product” / “best POS” / “Toast killer”
- “Thousands of restaurants” or implied customer count
- “All integrations live” / “production-certified”
- “Enterprise-ready” / SOC 2 / SCIM in production
- “Free forever” without pilot SKU context
- “Series A” / investor metrics / ARR
- “Guaranteed ROI” or fabricated order-volume stats
- “Product Hunt exclusive” pricing not on `/pricing`

Reuse lint: `lintProductHuntLaunchDeferCopy()` from [`product-hunt-launch-defer-policy.ts`](../lib/marketing/product-hunt-launch-defer-policy.ts).

---

## Post-launch follow-up

1. **Day 1–3:** Personal thank-you to meaningful commenters; no mass DM spam.
2. **Day 7:** Retro — signups, ICP fit, support load, pilot conversion.
3. **Day 14:** Decide on paid ads to PH URL; default **off** until ICP review PASS.
4. **Day 30:** Update [`case-study-template.md`](./case-study-template.md) if PH-sourced pilot closes.
5. **Archive** final listing copy + metrics in `artifacts/product-hunt-launch/`.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`product-hunt-launch-defer.md`](./product-hunt-launch-defer.md) | Defer decision + LG1–LG8 gates |
| [`press-release-first-design-partner.md`](./press-release-first-design-partner.md) | Stagger ≥14 days from first PR |
| [`case-study-template.md`](./case-study-template.md) | Social proof before launch |
| [`demo-script-15min.md`](./demo-script-15min.md) | Demo readiness |
| [`forbidden-claims-training.md`](./forbidden-claims-training.md) | Sales-safe language |
| [`free-pilot-tier-program.md`](./free-pilot-tier-program.md) | Pilot SKU context for pricing questions |
| [`referral-program.md`](./referral-program.md) | Do not combine referral blast same week |

---

## Reconsideration command

When pilot count reaches 3, run internal GO/NO-GO before any PH submit:

```bash
npm run smoke:pilot-gono-go   # must not be NO-GO
npm run test:ci:product-hunt-launch-prep:cert
```

If **NO-GO** — extend defer, update execution log, do not publish.

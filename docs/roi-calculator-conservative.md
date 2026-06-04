# ROI calculator — conservative methodology & sales guide

**Policy:** `roi-calculator-conservative-mkt25-v1`  
**Updated:** 2026-06-03  
**Audience:** Founder, AE, CS — live calls, proposals, and `/roi-calculator` walkthroughs  
**Live tool:** [`/roi-calculator`](../app/roi-calculator/page.tsx) · [`components/marketing/roi-calculator.tsx`](../components/marketing/roi-calculator.tsx)  
**Honesty:** [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) · [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md)

OS Kitchen has **no signed founding customers** as of June 2026. The ROI calculator produces **illustrative estimates** — not audited savings, not contractual guarantees, not investor-grade KPIs.

Use this guide when sharing the calculator on calls, in proposals ([`pilot-proposal-template.md`](./pilot-proposal-template.md)), or in objection handling (O3 Square pricing · O12 spreadsheets).

---

## When to use

| Moment | Action |
|--------|--------|
| Discovery call — quantified pain | Open `/roi-calculator` with prospect inputs |
| Post-demo follow-up | Attach screenshot + disclaimer in email |
| Proposal (MKT-24) | Reference estimate as **illustrative only** — not SOW commitment |
| Objection O3 (Square free) | Compare admin hours + mistake cost vs subscription sticker price |

**Do not** use calculator output as guaranteed payback in LOI, SOW, or deck without "estimate" labeling.

---

## Conservative assumptions

Source of truth: [`roi-calculator-conservative-policy.ts`](../lib/marketing/roi-calculator-conservative-policy.ts).

| Assumption | Value | Rationale |
|------------|------:|-----------|
| Labor hours reducible | **35%** | Manual coordination (spreadsheets, copy-paste, phone tag) — not full headcount elimination |
| Mistake/refund loss reducible | **40%** | Mis-picks, wrong labels, refund friction — not zero-defect guarantee |
| Growth contribution proxy | **8%** | Capacity unlocked by better planning — **not** revenue guarantee |
| Weeks per month | **4.33** | Standard labor value conversion |

**Why conservative:** Pre-revenue product — we under-promise vs aggressive SaaS ROI decks. If prospect asks "can it be higher?" — say "possibly after pilot baseline, but we quote these caps in sales."

---

## Input definitions

| Input | Field label (UI) | Sales probe |
|-------|------------------|-------------|
| `weeklyOrders` | Weekly orders | "Orders across all channels last week?" |
| `averageOrderValue` | Average order value | "Blended AOV — pickup, delivery, catering?" |
| `manualCoordinationHoursPerWeek` | Manual coordination hours/week | "Hours copying orders, fixing mistakes, chasing status?" |
| `hourlyAdminCost` | Hourly admin/kitchen cost | "Loaded cost — owner time counts at $25–50/hr" |
| `monthlyMistakesOrRefunds` | Monthly mistakes/refunds | "Mis-picks, wrong items, refunds per month?" |
| `expectedGrowthPct` | Expected growth % | "Capacity you'd add if ops were smoother — be conservative" |

Default demo inputs: 250 orders · $18 AOV · 12 hrs/week · $25/hr · 8 mistakes · 10% growth.

---

## Output definitions

| Output | Meaning | Sales wording |
|--------|---------|---------------|
| `hoursSavedPerWeek` | 35% × manual hours (rounded) | "Roughly X hours back — validate in pilot Week 2" |
| `laborValueMonthly` | Hours saved × hourly cost × 4.33 | "Labor **value** — not guaranteed cash" |
| `mistakeReductionMonthly` | 40% × mistakes × AOV | "Fewer mis-picks and refunds — pilot will measure" |
| `growthContributionMonthly` | Growth % × orders × AOV × 4.33 × 8% | "Capacity proxy — not promised revenue" |
| `totalMonthly` | Sum of three lines | "**Conservative estimate, not a guarantee.**" |
| `recommendedPlan` | Starter ≤100 · Pro ≤1000 · Team >1000 weekly orders | Tie to [`/pricing`](../app/pricing/page.tsx) — pilot SKUs separate |

Always show the three line items — never quote total alone.

---

## Worked examples by segment

### Ghost kitchen (250 orders/week)

| Input | Value |
|-------|------:|
| Weekly orders | 250 |
| AOV | $18 |
| Manual hours/week | 12 |
| Hourly cost | $25 |
| Monthly mistakes | 8 |
| Growth % | 10 |

**Output (approx.):** ~$646/mo total · 4 hrs/week saved · **Pro** plan fit.

**Talk track:** "Four hours back on brand routing and aggregator copy-paste — we validate in staging golden path, not on this call."

### Meal prep (600 orders/week)

| Input | Value |
|-------|------:|
| Weekly orders | 600 |
| AOV | $42 |
| Manual hours/week | 18 |
| Hourly cost | $28 |
| Monthly mistakes | 12 |
| Growth % | 8 |

**Output (approx.):** ~$1,500/mo total · 6 hrs/week saved · **Pro** plan fit.

**Talk track:** "Cutoff chaos and label mistakes — 40% reduction is our cap until your Week-2 baseline."

### Commissary (1,200 orders/week)

| Input | Value |
|-------|------:|
| Weekly orders | 1,200 |
| AOV | $24 |
| Manual hours/week | 25 |
| Hourly cost | $30 |
| Monthly mistakes | 15 |
| Growth % | 5 |

**Output (approx.):** ~$2,400/mo total · 9 hrs/week saved · **Team** plan fit.

**Talk track:** "Multi-brand routing — Team tier for volume; pilot SOW scopes honest beta modules only."

---

## Sales presentation script

### Open (30 sec)

> "I'll use our **conservative** ROI calculator — caps at 35% labor reduction and 40% mistake reduction. It's an **estimate**, not a guarantee. We'll validate real numbers in a 90-day pilot if we're a fit."

### Live walkthrough (3 min)

1. Enter prospect numbers — use **their** words from discovery.
2. Read each output line aloud — labor, mistakes, growth proxy.
3. State disclaimer: **"Conservative estimate, not a guarantee."**
4. Compare total to plan price on `/pricing` — subscription is separate from mistake/labor value.
5. CTA: book demo or send [`pilot-proposal-template.md`](./pilot-proposal-template.md).

### Close (30 sec)

> "If these illustrative numbers are directionally interesting, next step is a scoped pilot — design partner LOI or paid SOW — with Week-2 baseline metrics. We don't sign savings guarantees we can't audit."

**Primary CTA:** [`/book-demo?utm_source=roi&utm_medium=calculator&utm_campaign=roi-conservative-mkt25`](/book-demo?utm_source=roi&utm_medium=calculator&utm_campaign=roi-conservative-mkt25)

---

## Forbidden ROI claims

**Never** say or write:

- Guaranteed savings / guaranteed ROI / payback in 30 or 60 days
- "You will save $X" — use "estimated" or "illustrative"
- Proven ROI without pilot baseline artifact
- 100% accurate food cost or margin from calculator
- Calculator output as contractual KPI in SOW

Lint helper: `lintRoiCalculatorCopy` in [`roi-calculator-conservative-policy.ts`](../lib/marketing/roi-calculator-conservative-policy.ts).

Run `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` before attaching calculator screenshots to proposals.

---

## Pre-demo checklist

- [ ] Discovery captured weekly orders, AOV, pain quote verbatim
- [ ] Prospect understands **estimate, not guarantee**
- [ ] Default multipliers (35% / 40% / 8%) explained if asked
- [ ] Three output lines shown — not total alone
- [ ] Recommended plan matches `/pricing` — pilot SKU if design partner path
- [ ] Forbidden claims scan PASS on follow-up email
- [ ] No calculator total in LOI/SOW as committed savings

---

## CRM fields

| Field | Example |
|-------|---------|
| `roi_calculator_used` | yes |
| `roi_total_monthly_estimate` | 647 |
| `roi_recommended_plan` | Pro |
| `roi_disclaimer_acknowledged` | yes |
| `roi_follow_up` | proposal_sent · demo_booked · nurture |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`ROI_CALCULATOR_LOGIC.md`](./ROI_CALCULATOR_LOGIC.md) | Engineering summary |
| [`objection-handling.md`](./objection-handling.md) | O3 Square · O12 spreadsheets |
| [`pilot-proposal-template.md`](./pilot-proposal-template.md) | Post-calculator proposal |
| [`profit-engine-owner-margin-story.md`](./profit-engine-owner-margin-story.md) | In-app margin — separate from marketing ROI |
| [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md) | Plan price vs value estimate |

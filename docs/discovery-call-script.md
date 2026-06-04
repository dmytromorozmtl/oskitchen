# Discovery call script — 30 minutes

**Policy:** `discovery-call-script-mkt21-v1`  
**Updated:** 2026-06-03  
**Audience:** Founder, AE, CS — first live conversation with qualified inbound or outbound lead  
**Duration:** **30 minutes** (20 discovery + 10 Q&A / next steps)  
**Goal:** Qualify ICP fit, capture pain in operator words, decide demo vs nurture vs disqualify — **not** close paid pilot on call one  
**Honesty:** [`icp-definition-final.md`](./icp-definition-final.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

No signed founding customers as of June 2026. This script recruits **design partners** with honest BETA posture — not enterprise RFP wins.

---

## One-line opener

**"Before I show you anything — I want to understand how orders move from your channels to the kitchen today, and whether our honest beta scope matches what you actually need."**

---

## Call structure (30 minutes)

| Block | Time | Purpose |
|-------|------|---------|
| **1 — Frame + agenda** | 0:00–3:00 | Set expectations, pre-revenue honesty |
| **2 — Current state** | 3:00–13:00 | Their workflow, tools, pain in their words |
| **3 — ICP qualification** | 13:00–23:00 | Score rubric questions — advance or disqualify |
| **4 — Honest scope check** | 23:00–27:00 | BETA labels, integration maturity, pilot offer |
| **5 — Next step** | 27:00–30:00 | Demo book, LOI path, nurture, or polite pass |

**Do not demo** until block 3 scores ≥8/10 unless prospect demands — offer product demo as separate session ([`demo-script-15min.md`](./demo-script-15min.md) · MKT-22).

---

## Block 1 — Frame + agenda (3 min)

### Script

> "Thanks for making time. I'm [NAME] from OS Kitchen. Quick framing: we're **pre-revenue**, recruiting **design partners** for a staged pilot — not claiming thousands of customers or every integration LIVE.
>
> This call is **discovery**, not a pitch deck. I'll ask about your kitchen, channels, and tools for about twenty minutes. Then we'll decide together if a demo or design-partner LOI makes sense — or if we're the wrong fit. Sound good?"

### Say explicitly

- 0 signed founding customers today
- Integrations show BETA / SKIPPED in Integration Health
- Software-first — not Toast hardware replacement

### Do not say

- "We're the market leader"
- "Fully integrated with all delivery apps"
- "Guaranteed ROI in 90 days"

---

## Block 2 — Current state (10 min)

Capture answers in CRM. Use **their vocabulary** — mirror back before moving on.

### Opening question

> "Walk me through **yesterday** — from first order arriving to last ticket out the door. Where did the data live?"

### Probe questions (pick 5–7)

| # | Question | Listen for |
|---|----------|------------|
| 1 | How many **locations / brands** run from this kitchen? | ≤5 = fit · 20+ = enterprise defer |
| 2 | What **channels** feed orders today? (Shopify, Woo, phone, walk-in, aggregators) | Multi-channel = fit · aggregator-only = weak |
| 3 | Where do orders **land** before the kitchen sees them? | Spreadsheet chaos = strong fit |
| 4 | How does the **line** get tickets — KDS, printer, verbal? | KDS need = fit |
| 5 | **Weekly volume** band — orders per week across channels? | 50–2k/week sweet spot |
| 6 | Biggest **mistake cost** last month — mis-pick, late cutoff, wrong label? | Quantified pain |
| 7 | Who **owns** ops decisions — owner on call? | Owner engaged = fit |
| 8 | What tools did you **evaluate or leave**? (Toast, Square, spreadsheet) | Positioning intel |

### Segment hooks

| Segment | Extra probe |
|---------|-------------|
| **Ghost kitchen** | How many virtual brands share one line? Per-brand P&L? |
| **Meal prep** | Weekly menu cutoffs? Subscription vs à la carte mix? |
| **Commissary** | Tenants or owned brands? B2B supply ordering today? |

**Note verbatim quote** for LOI / pilot notes — e.g. "We copy Shopify into a Google Sheet every morning."

---

## Block 3 — ICP qualification (10 min)

Use [`icp-definition-final.md`](./icp-definition-final.md) scoring rubric. Score 0–2 per dimension.

### Qualification script

> "I'm going to ask a few direct questions so we don't waste your time if we're misaligned."

| # | Question | Disqualify if |
|---|----------|---------------|
| 1 | Do you **own fulfillment** in a licensed kitchen? | Pure marketplace dropship |
| 2 | **Locations in pilot scope** — how many? | >5 without enterprise track |
| 3 | Can the **owner or ops lead** join a 30-min weekly sync during a 90-day pilot? | No engaged sponsor |
| 4 | Core need: **order hub + kitchen path** (KDS/production)? | Needs table service / floor plan only |
| 5 | OK with **BETA / SKIPPED** labels on integrations until smoke PASS? | Demands "production certified all tenants" |
| 6 | Any requirement for **SSO, SOC 2, or SCIM** in the first 90 days? | Hard enterprise gate |
| 7 | Expectation for **live DoorDash / Uber Eats** ops day one? | Partner-gated — set SKIPPED expectation |

### Scorecard (internal — do not read aloud)

| Score | Action |
|-------|--------|
| **≥12/14** | Strong LOI candidate after demo |
| **8–11/14** | Book 15-min demo · nurture |
| **<8/14** | Polite pass · send `/demo` link optional |

Export qualified leads: `PILOT_GONOGO_ICP_INPUT_JSON` when advancing to LOI track.

---

## Block 4 — Honest scope check (4 min)

Only if score ≥8. Tailor to their segment.

### Script

> "Based on what you shared, here's what OS Kitchen **is** today: one workspace for **Order Hub**, **KDS**, production, packing, and **Today Command Center** — with **seven AI modules** at qualified maturity, not magic AGI.
>
> **Integrations:** WooCommerce and Shopify paths are **BETA** when you configure credentials. Aggregators are **partner-gated** — we show SKIPPED honestly, not fake green tiles.
>
> **Marketplace B2B supply** is a scaffold — useful when vendors are seeded, not Sysco parity.
>
> Does that scope match what you're trying to solve — or is there a hard requirement I haven't addressed?"

### If they ask about competitors

Use [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) — factual only, no parity claims.

### If they ask about pricing

> "Pilot pricing is on [`/pricing`](/pricing) — transparent SKUs with 50% subscription discount during qualified design-partner window. No hidden fees on buyer marketplace access."

---

## Block 5 — Next steps (3 min)

| Outcome | Script | CRM |
|---------|--------|-----|
| **Qualified → demo** | "Let's book 15 minutes on staging — I'll screen-share Today and Integration Health with badges visible." | `stage=discovery_complete` · book demo |
| **Qualified → LOI** | "I'll send the non-binding design-partner LOI for legal review — staging after countersign." | `loi_status=sent` |
| **Nurture** | "Timing isn't right — I'll send our honest demo link and check back in 60 days." | `stage=nurture` · [`email-nurture-5-sequence.md`](./email-nurture-5-sequence.md) |
| **Disqualify** | "We're likely the wrong tool for [reason]. I'd suggest [alternative type]." | `stage=disqualified` |

### Closing line

> "Either way — appreciate the honesty on your side. We'd rather disqualify early than oversell SKIPPED integrations."

---

## Approved talk track (60 seconds — elevator)

> "OS Kitchen is a software-first operating system for operators who **own the kitchen** — meal prep, ghost kitchen, and commissary teams juggling Shopify, phone orders, and the line. One order hub, KDS, production, and an owner Today view with deterministic briefing — not hype. We're pre-revenue, recruiting design partners, and we label every integration BETA or SKIPPED until proven. If that matches your world, let's talk about your workflow before any demo."

---

## Forbidden claims

| Forbidden | Use instead |
|-----------|-------------|
| thousands of customers | design partner program open |
| all integrations live | BETA / SKIPPED per Integration Health |
| guaranteed savings / ROI | pilot metrics TBD |
| replace Toast overnight | software-first ops layer |
| uber eats / doordash official partner | partner-gated; staging smoke |
| soc 2 / hipaa certified | roadmap; not pilot term |
| untouchable AI moat | 7 proprietary AI modules (qualified) |

Run: `lintDiscoveryCallScriptCopy()` before updating slides or call notes.

---

## Pre-call checklist

| # | Item |
|---|------|
| 1 | Review prospect CRM — segment, source, prior emails |
| 2 | [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) on second monitor |
| 3 | ICP scoring sheet ready (paper or CRM fields) |
| 4 | Calendar link for demo follow-up |
| 5 | LOI PDF legal-approved if LOI path likely |
| 6 | Completed [`forbidden-claims-training.md`](./forbidden-claims-training.md) certification |

---

## Post-call checklist (within 24h)

| # | Action |
|---|--------|
| 1 | Log score + verbatim pain quote in CRM |
| 2 | Send follow-up email per outcome (demo link / LOI / nurture) |
| 3 | If demo booked — prep [`sales-demo-environment.md`](./sales-demo-environment.md) |
| 4 | Update `PILOT_GONOGO_ICP_INPUT_JSON` if LOI track |
| 5 | Retro: any forbidden-claim questions? Update limitation sheet |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) | 10-min product demo shorthand |
| [`demo-script-15min.md`](./demo-script-15min.md) | 15-min live demo after discovery (MKT-22) |
| [`objection-handling.md`](./objection-handling.md) | Twelve core objections LAER (MKT-23) |
| [`loi-outreach-email.md`](./loi-outreach-email.md) | Pre-call outbound |
| [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) | Post-discovery outbound |
| [`pilot-proposal-template.md`](./pilot-proposal-template.md) | Post-demo proposal email/PDF (MKT-24) |
| [`loi-template-walkthrough.md`](./loi-template-walkthrough.md) | Live LOI review after demo (MKT-28) |
| [`roi-calculator-conservative.md`](./roi-calculator-conservative.md) | Illustrative ROI on calls (MKT-25) |
| [`competitive-battle-cards.md`](./competitive-battle-cards.md) | BC1–BC7 when prospect names incumbent (MKT-26) |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | Post-LOI |

**Book demo CTA:** [`/book-demo?utm_source=discovery&utm_medium=call&utm_campaign=discovery-script-mkt21`](/book-demo?utm_source=discovery&utm_medium=call&utm_campaign=discovery-script-mkt21)

# Design partner email sequence (P2-58)

**Policy:** `design-partner-email-sequence-p2-58-v1`  
**Updated:** 2026-06-16  
**Owner:** Founder-led outbound  
**Gap:** 5-step sequence — problem → solution → demo → offer → follow-up

Supersedes the legacy 3-email draft in [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) for gap closure. Use after warm intro, event lead, or P0-7 meal prep outreach — not cold spam at scale.

## 5-step overview

| Step | ID | Day | Goal | Primary CTA |
|------|-----|-----|------|-------------|
| 1 | `problem` | 0 | Name operator pain + co-build invite | Reply "interested" or book fit call |
| 2 | `solution` | +3 | How OS Kitchen solves it — honest limits | Reply with top 2 pain points |
| 3 | `demo` | +6 | Interactive demo or live walkthrough | `/book-demo` or `/demo` sandbox |
| 4 | `offer` | +9 | Design Partner Program — 90 days free + LOI | Review LOI + pricing tier |
| 5 | `follow_up` | +14 | Respectful close + opt-out | Book, "later", or "pass" |

**Stop sequence** on: reply (any sentiment), booked call, unsubscribe, or disqualifier confirmed.

## Personalization tokens

| Token | Example |
|-------|---------|
| `[FIRST_NAME]` | Jane |
| `[OPERATOR_NAME]` | Example Kitchen LLC |
| `[SEGMENT]` | meal prep / ghost kitchen / commissary |
| `[PAIN_HOOK]` | Thursday preorder cutoff → Friday production list |
| `[FOUNDER_NAME]` | Dmytro |
| `[COHORT_SIZE]` | 5 |
| `[BOOK_DEMO_URL]` | `https://os-kitchen.com/book-demo?utm_campaign=dp_seq_p2_58` |
| `[DEMO_URL]` | `https://os-kitchen.com/demo?utm_campaign=dp_seq_p2_58_demo` |
| `[PRICING_URL]` | `https://os-kitchen.com/pricing?utm_campaign=dp_seq_p2_58_offer` |
| `[UNSUBSCRIBE_URL]` | CRM unsubscribe link |

Canonical templates live in `lib/marketing/design-partner-email-sequence-p2-58-content.ts`.

## Step 1 — Problem (Day 0)

**Subject A/B:** Co-build the ops layer for [SEGMENT] operators? · [PAIN_HOOK] — still manual?

Founder names the workflow pain ([PAIN_HOOK]), invites ≤[COHORT_SIZE] design partners, states **0 signed founding customers today** and honest BETA labels.

## Step 2 — Solution (Day +3)

**Subject:** Re: Co-build… · What OS Kitchen actually includes (honest scope)

Explains order hub → KDS → production spine, Today Command Center, integration health honesty. Explicit **not a fit** boundaries (hardware POS, SOC 2 in pilot, fake LIVE badges).

## Step 3 — Demo (Day +6)

**Subject:** 15-min walkthrough · Try the interactive demo?

Two paths: fit call at [`/book-demo`](./book-demo) or self-serve sandbox at [`/demo`](./demo) with test credentials.

## Step 4 — Offer (Day +9)

**Subject:** Design Partner Program — 90 days free · LOI outline

Presents **Design Partner Program — free for 90 days** ([`pricing-pilot-sku-p0-8.md`](./pricing-pilot-sku-p0-8.md)). Attach LOI from [`loi-design-partner-template.md`](./loi-design-partner-template.md) (legal-approved PDF only).

## Step 5 — Follow-up (Day +14)

**Subject:** Last note — [COHORT_SIZE] slots · Close the loop?

Final touch: cohort scarcity, opt-out ("later" / "pass"), disqualifiers spelled out. CAN-SPAM unsubscribe footer required.

## Honesty rules

- **0 signed founding customers** — do not imply logos or KPIs
- **BETA** / **SKIPPED** on integrations — match Integration Health Center truth
- **Design partner program** — not "thousands of operators"
- **Honest** scope on AI-assisted (not AI-powered) briefing
- **Not a fit** for enterprise SSO-first RFPs, offline POS guarantees, hardware bundles

Run before bulk send:

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

## CRM stages

| Field | Values |
|-------|--------|
| `design_partner_sequence_stage` | `dp_seq_p2_58_problem_sent` · `solution_sent` · `demo_sent` · `offer_sent` · `follow_up_sent` · `complete` · `converted` · `disqualified` |

## Related docs

| Doc | Use |
|-----|-----|
| [`design-partner-outreach-meal-prep-p0-7.md`](./design-partner-outreach-meal-prep-p0-7.md) | Step 1 personalization source |
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Step 4 attachment |
| [`pricing-pilot-sku-p0-8.md`](./pricing-pilot-sku-p0-8.md) | Step 4 offer terms |
| [`case-study-template-pipeline-p2-56.md`](./case-study-template-pipeline-p2-56.md) | Post-LOI publish pipeline |
| [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) | Forbidden copy |

## CI

```bash
npm run check:design-partner-email-sequence-p2-58
```

## Artifact

`artifacts/design-partner-email-sequence-p2-58.json`

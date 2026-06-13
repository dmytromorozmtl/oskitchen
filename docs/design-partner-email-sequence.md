# Design partner email sequence — 3 emails

**Policy:** `design-partner-email-sequence-v1`  
**Updated:** 2026-06-02  
**Owner:** Founder + Sales  
**Status:** ready to send after legal review of LOI attachment  
**Related:** [`loi-design-partner-template.md`](./loi-design-partner-template.md) · [`design-partner-outreach.md`](./design-partner-outreach.md) · [`founding-customer-story.md`](./founding-customer-story.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`pilot-execution-checklist.md`](./pilot-execution-checklist.md)

Three-email outbound sequence for **qualified ICP operators** (commissary, ghost kitchen, meal-prep, small multi-unit ≤5 locations). Use after a warm intro, event lead, or inbound `/book-demo` no-show — not cold spam at scale.

**Inbound nurture (5 emails):** [`email-nurture-5-sequence.md`](./email-nurture-5-sequence.md) — trial signup, demo no-show, webinar registrant. Hand off to this outbound sequence after email 5 if ICP ≥75 and no booking.

**Honesty rule:** No customer logos, KPIs, or “thousands of operators” claims. Say **design partner program open**, **0 signed founding customers**, **BETA** on integrations and marketplace.

---

## Sequence overview

| # | Send timing | Goal | Primary CTA |
|---|-------------|------|-------------|
| **1** | Day 0 | Problem + invite to co-build | Reply “interested” or book 15-min fit call |
| **2** | Day +4 (if no reply) | Product depth + honest scope | Book demo + review LOI outline |
| **3** | Day +10 (if no reply) | Cohort scarcity + clear next step | Book demo or “not now” opt-out |

**Stop sequence** on: reply (any sentiment), booked call, unsubscribe, or disqualifier confirmed.

---

## Personalization tokens

Replace before send:

| Token | Example |
|-------|---------|
| `[FIRST_NAME]` | Jane |
| `[OPERATOR_NAME]` | Example Kitchen LLC |
| `[SEGMENT]` | commissary / ghost kitchen / meal prep |
| `[PAIN_HOOK]` | weekly preorder cutoffs / multi-brand KDS / channel order chaos |
| `[BOOK_DEMO_URL]` | `https://kitchenos.com/book-demo?utm_source=email&utm_medium=design_partner&utm_campaign=dp_seq_1` |
| `[FOUNDER_NAME]` | Alex |
| `[COHORT_SIZE]` | 5 (keep small and true) |

---

## Email 1 — Problem + design partner invite

**Send:** Day 0  
**Audience:** Qualified operator who matches ICP but has not booked

### Subject lines (A/B)

- A: `Co-build the ops layer for [SEGMENT] operators?`
- B: `Spreadsheets between Shopify and the kitchen — familiar?`

### Preview text

Small cohort. Honest BETA labels. No fake LIVE integration badges.

### Body

```
Hi [FIRST_NAME],

I'm [FOUNDER_NAME], founder of OS Kitchen. We built a web-based operating system for [SEGMENT] teams who outgrow copying orders between Shopify, DMs, and the kitchen whiteboard.

We're not looking for logo buyers yet — we're recruiting **founding design partners** (≤[COHORT_SIZE] slots this quarter) who will:

• Run a staging workspace and give weekly 30–45 min feedback
• Tell us where order hub, production, and Today Command Center break in real ops
• Accept honest **BETA** / **pilot_ready** labels — no overpromised marketplace or delivery integrations

What you get: dedicated staging workspace, prioritized roadmap input, and optional pilot credit toward year-1 subscription if we convert after a successful evaluation.

**Honest scope:** seven proprietary AI modules in production at qualified maturity; B2B marketplace is a BETA scaffold; **0 signed founding customers today**. We show integration health honestly — not fake green badges.

If [PAIN_HOOK] sounds familiar, reply with “interested” or grab 15 minutes here:
[BOOK_DEMO_URL]

Thanks,
[FOUNDER_NAME]
Founder, OS Kitchen

P.S. Not a fit for enterprise SSO-first RFPs or operators who need Toast-class hardware bundles — we're software-first and pre-scale on partner proof.
```

### Attachments / links

- None on email 1 (keep friction low)

### Internal notes

- Log in CRM: `design_partner_seq_1_sent`
- Disqualify if reply mentions: 50+ locations, mandatory offline POS, SOC 2 attestation in pilot term

---

## Email 2 — Product depth + LOI path

**Send:** Day +4 if no reply and no unsubscribe  
**Audience:** Same thread — reply-all to email 1

### Subject lines

- `Re: Co-build the ops layer for [SEGMENT] operators?`
- Or: `What OS Kitchen actually includes (honest scope)`

### Preview text

Today Command Center, 7 AI modules, marketplace scaffold — with limits spelled out.

### Body

```
Hi [FIRST_NAME],

Quick follow-up — in case timing was off last week.

OS Kitchen is one spine from order → KDS → production → packing, with an owner **Today Command Center** at /dashboard/today (daily briefing from your real hub signals — deterministic, not magic AGI).

**Seven AI modules** (each at qualified maturity):
1. AI Restaurant Brain — daily briefing on Today
2. Digital Twin — station load simulation (BETA)
3. Universal Menu Engine — cross-channel menu structure (BETA)
4. Food Cost AI — recipe costing + margin alerts
5. AI Purchasing — reorder suggestions + buyer approval gate (BETA)
6. Kitchen Camera AI — camera-ready; synthetic preview by default
7. Benchmark Network — cohort comparisons when N grows (BETA)

**B2B HoReCa marketplace (BETA):** buyer catalog → cart → checkout → PO path — engineering shipped; vendor seeding in progress. Not Sysco parity.

**Integrations:** WooCommerce and Shopify imports are **BETA** when you configure credentials. DoorDash / Uber Eats / Grubhub are partner-gated — we do not claim LIVE marketplace ops.

If this matches how [OPERATOR_NAME] runs ops, the next step is a **non-binding design partner LOI** (3-month default engagement, weekly sync). Template attached for your legal review — countersigned copy before we provision staging.

Book a fit call: [BOOK_DEMO_URL]
Or reply with your top 2 workflow pain points — I'll tell you honestly if we're the wrong tool.

[FOUNDER_NAME]
```

### Attachments / links

- PDF: LOI from [`loi-design-partner-template.md`](./loi-design-partner-template.md) (legal-approved version only)
- Link: [`demo-video-script-today.md`](./demo-video-script-today.md) — internal; send Loom only if recorded

### Internal notes

- CRM: `design_partner_seq_2_sent`
- If call booked → skip email 3; move to [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) step 1

---

## Email 3 — Cohort close + respectful opt-out

**Send:** Day +10 if still no reply  
**Audience:** Final touch — same thread

### Subject lines

- `Last note — [COHORT_SIZE] design partner slots`
- Or: `Close the loop?`

### Preview text

Happy to pause outreach — or one call before we fill the cohort.

### Body

```
Hi [FIRST_NAME],

Last email from me on this thread.

We're keeping the design partner cohort small ([COHORT_SIZE] operators) so feedback actually shapes the product — not a vanity beta list. Two slots are in conversation; I'm checking once more with operators running [SEGMENT] workflows.

**If yes:** 15-minute fit call → LOI → staging workspace → golden path before any production traffic.
[BOOK_DEMO_URL]

**If not now:** reply “later” or “pass” — I'll stop the sequence and won't assume interest.

**If wrong tool:** we likely aren't a fit if you need proprietary POS hardware, offline mode, unified cross-channel inventory depletion as a sales guarantee, or production SSO in the pilot term. Happy to point you to alternatives.

Either way — thanks for reading. Building in public with honest labels beats fake LIVE badges.

[FOUNDER_NAME]

---
OS Kitchen · Design partner program · Pre-scale, pilot-ready engineering
Unsubscribe: [UNSUBSCRIBE_URL]
```

### Attachments / links

- None

### Internal notes

- CRM: `design_partner_seq_3_sent` → `sequence_complete`
- No fourth email without new inbound trigger

---

## Forbidden copy (never use)

From [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) — even in subject lines:

| Forbidden | Use instead |
|-----------|-------------|
| untouchable / unbreakable moat | seven proprietary AI modules in production |
| unified cross-channel inventory depletion | POS-scoped depletion when configured |
| live DoorDash / Uber Eats sync | partner-gated; BETA |
| production-certified hardware POS | in-browser software POS |
| SOC 2 Type II certified | roadmap / not in pilot term |
| guaranteed revenue / margin lift | deterministic briefing; pilot metrics TBD |
| our customer X (no LOI) | design partner program open |

Run before bulk send:

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

---

## CRM tracking fields

| Field | Values |
|-------|--------|
| `design_partner_sequence_stage` | `seq_1` · `seq_2` · `seq_3` · `complete` · `converted` · `disqualified` |
| `icp_segment` | commissary · ghost_kitchen · meal_prep · weekly_preorder |
| `loi_status` | none · sent · countersigned |
| `disqualifier` | enterprise_sso · offline_pos · location_count · other |

---

## Success metrics (internal — not for email copy)

| Metric | Target (first cohort) |
|--------|----------------------|
| Reply rate (seq 1→2) | ≥15% on warm list |
| Booked demos from sequence | ≥3 per cohort |
| Countersigned LOIs | ≥1 before claiming “design partner signed” |
| Time to staging provision | ≤7 days after LOI |

Update [`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json) only when LOI is countersigned — not when email 1 is sent.

---

## Checklist before first send

- [ ] Legal reviewed LOI PDF attached in email 2
- [ ] `[BOOK_DEMO_URL]` UTM params set per campaign
- [ ] Unsubscribe / CAN-SPAM footer on email 3
- [ ] CRM automation stops on reply or booking
- [ ] Founder calendar has capacity for weekly sync if LOI signs
- [ ] Staging workspace slug pattern reserved (`design-partner-*`)

---

## Related docs

| Doc | Use |
|-----|-----|
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Email 2 attachment |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | Post-LOI execution |
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Disqualifiers |
| [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) | Call prep |
| [`demo-video-script-today.md`](./demo-video-script-today.md) | Demo follow-up |

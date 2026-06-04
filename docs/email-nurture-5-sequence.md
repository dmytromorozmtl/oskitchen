# Email nurture — 5-sequence (inbound)

**Policy:** `email-nurture-5-sequence-mkt19-v1`  
**Updated:** 2026-06-03  
**Owner:** Marketing + Founder  
**Audience:** Inbound leads — trial signup, `/get-started`, demo no-show, webinar registrant, content download  
**Status:** ready to wire in CRM/automation · **0 sequences delivered at scale** · pilot **NO-GO**  
**Related:** [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) (outbound 3-touch) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`marketing-analytics-setup.md`](./marketing-analytics-setup.md)

Five-email **inbound nurture** for operators who raised a hand but have not booked a fit call. Distinct from the **3-email design partner outbound** sequence (warm intro / event follow-up).

**Honesty rule:** No customer logos, fabricated social proof, or LIVE integration claims. Say **BETA**, **pilot_ready**, **0 signed founding customers**, and link [`/trust`](/trust) + [`/ai`](/ai) for label explanations.

---

## Sequence overview

| # | Send timing | Theme | Primary CTA |
|---|-------------|-------|-------------|
| **1** | Day 0 (trigger) | Welcome + honest scope | Start trial or open `/demo` |
| **2** | Day +2 | Today Command Center | Explore `/dashboard/today` (trial) |
| **3** | Day +5 | Integration Health moat | `/integrations` + trust labels |
| **4** | Day +9 | AI modules (qualified) | `/ai` honest positioning |
| **5** | Day +14 | Design partner invite | `/book-demo` or handoff to outbound seq |

**Stop sequence** on: booked demo, reply, unsubscribe, LOI sent, or CRM stage `converted` / `disqualified`.

**Handoff:** Qualified ICP (score ≥75) after email 5 with no booking → start [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) Email 1 (do not double-send welcome).

---

## Trigger sources

| Source | CRM tag | Notes |
|--------|---------|-------|
| Trial signup | `nurture_inbound_trial` | Highest intent |
| `/get-started` form | `nurture_inbound_get_started` | Segment field required |
| Demo no-show | `nurture_demo_noshow` | Skip email 1 welcome — start email 2 |
| Webinar registrant (no-show) | `nurture_webinar_reg` | Link recording in email 1 variant |
| Beta waitlist approved | `nurture_beta_approved` | Pair with [`BETA_EMAIL_AUTOMATION.md`](./BETA_EMAIL_AUTOMATION.md) |

---

## Personalization tokens

| Token | Example |
|-------|---------|
| `[FIRST_NAME]` | Jane |
| `[SEGMENT]` | ghost kitchen / meal prep / commissary |
| `[TRIAL_URL]` | `https://kitchenos.com/signup?utm_source=email&utm_medium=nurture&utm_campaign=nurture_mkt19_e1` |
| `[DEMO_URL]` | `https://kitchenos.com/demo?utm_source=email&utm_medium=nurture&utm_campaign=nurture_mkt19_e1` |
| `[BOOK_DEMO_URL]` | `https://kitchenos.com/book-demo?utm_source=email&utm_medium=nurture&utm_campaign=nurture_mkt19_e5` |
| `[TRUST_URL]` | `https://kitchenos.com/trust` |
| `[AI_URL]` | `https://kitchenos.com/ai` |

---

## Email 1 — Welcome + honest scope

**Send:** Day 0 (within 1 hour of trigger)  
**Skip if:** demo no-show trigger (use variant below)

### Subject lines (A/B)

- A: `Welcome to OS Kitchen — honest scope upfront`
- B: `One workspace for orders, kitchen, and channels (BETA labels included)`

### Preview text

Pre-revenue. Design partner slots open. Integrations labeled honestly.

### Body

```
Hi [FIRST_NAME],

Thanks for exploring OS Kitchen — the operations layer for [SEGMENT] teams who outgrow spreadsheets between storefront, POS, and the kitchen line.

**What we are:** order hub, KDS, production, packing, Today Command Center, and seven proprietary AI modules — each at **qualified maturity**, not magic for every workflow.

**What we're not (yet):** a national B2B marketplace network, certified aggregator partner, or "trusted by thousands" story. **0 signed founding customers today.** Integrations show PASS, BETA, or SKIPPED in Integration Health — we don't hide SKIPPED rows.

**Your next step:**
• Start a 14-day trial: [TRIAL_URL]
• Or walk the interactive demo first: [DEMO_URL]

Questions? Reply to this email — a human reads it.

— OS Kitchen team

P.S. BETA / SKIPPED explained: [TRUST_URL]
```

### Demo no-show variant (Day 0)

**Subject:** `Sorry we missed you — 5-min Today replay`

**Body:** Link to demo + offer reschedule `[BOOK_DEMO_URL]`. Skip full welcome — they already know the brand.

---

## Email 2 — Today Command Center

**Send:** Day +2  
**Goal:** Show owner rhythm without overclaiming AI

### Subject

- `Does your day start with one screen or five tabs?`

### Preview text

Daily briefing from real hub signals — deterministic, not hype.

### Body

```
Hi [FIRST_NAME],

Most [SEGMENT] operators we talk to open Shopify, a spreadsheet, and a kitchen tablet before the first ticket prints.

**Today Command Center** (`/dashboard/today`) is designed as the owner start page:

• **Daily briefing** — priorities from orders, KDS backlog, and integration risk (deterministic rules + your data)
• **Attention strip** — blockers before rush hour
• **Quick jumps** — orders, kitchen, integration health

We're **pilot_ready** on Today — not claiming autonomous AI management. Review the briefing before acting.

**Try it in trial:** [TRIAL_URL]
**2-min script we use in demos:** reply "today" and we'll send the internal walkthrough link.

— OS Kitchen team
```

---

## Email 3 — Integration Health moat

**Send:** Day +5  
**Goal:** Differentiate with honesty — sales-safe moat

### Subject

- `Why we show SKIPPED integrations (on purpose)`

### Preview text

Green configured ≠ smoke-certified PASS. See the matrix.

### Body

```
Hi [FIRST_NAME],

Channel software often shows every tile green. We don't.

**Integration Health** scores WooCommerce, Shopify, webhooks, and marketplace paths with honest labels:

• **PASS** — staging smoke certified where configured
• **BETA** — engineering shipped; live proof in progress
• **SKIPPED** — not run yet — we say so in demos

That posture is our sales moat: operators and buyers see maturity before week three surprises.

Browse the public matrix: https://kitchenos.com/integrations
Label glossary: [TRUST_URL]

**Book a screen-share walkthrough:** [BOOK_DEMO_URL]

— OS Kitchen team
```

---

## Email 4 — AI modules (qualified)

**Send:** Day +9  
**Goal:** Seven modules without AGI hype

### Subject

- `7 AI modules — what each one actually does`

### Preview text

Restaurant Brain, Food Cost AI, Digital Twin… with BETA labels.

### Body

```
Hi [FIRST_NAME],

You may have seen "AI-powered" on our site. Here's the honest breakdown:

1. **AI Restaurant Brain** — daily briefing on Today (pilot_ready, deterministic)
2. **Digital Twin** — station simulation (BETA)
3. **Universal Menu Engine** — cross-channel menu (BETA)
4. **Food Cost AI** — recipe margins + alerts (pilot_ready)
5. **AI Purchasing** — reorder suggestions + approval gate (BETA)
6. **Kitchen Camera AI** — camera-ready; synthetic preview default (BETA)
7. **Benchmark Network** — cohort comparisons when N grows (BETA)

Full public positioning (for your security reviewer too): [AI_URL]

Not autonomous AGI. Not guaranteed margin lift. Human-in-the-loop on purchasing and copilot drafts.

**See it in trial:** [TRIAL_URL]

— OS Kitchen team
```

---

## Email 5 — Design partner invite + close

**Send:** Day +14  
**Goal:** Convert to fit call or respectful archive

### Subject

- `Design partner slots — fit call this week?`
- Or: `Close the loop on OS Kitchen?`

### Preview text

Small cohort. LOI optional. Or reply "pass."

### Body

```
Hi [FIRST_NAME],

Last scheduled note in this nurture series.

We're recruiting a **small design partner cohort** for [SEGMENT] operators who want to shape order hub, production, and Today Command Center in real service — with weekly feedback and honest BETA labels throughout.

**If that's you:** 15-minute fit call → optional LOI → staging workspace.
[BOOK_DEMO_URL]

**If not now:** reply "later" — we'll pause nurture.

**If wrong tool:** we likely aren't a fit if you need proprietary POS hardware bundles, offline card as day-one requirement, or production SSO in the pilot term. We'll say so on the call.

Thanks for reading — building in public beats fake LIVE badges.

— OS Kitchen team

Unsubscribe: [UNSUBSCRIBE_URL]
```

### Post-sequence

| Outcome | Action |
|---------|--------|
| Booked demo | Cancel automation · prep [`sales-demo-environment.md`](./sales-demo-environment.md) |
| Reply "interested" | Founder reply · LOI path |
| No action + ICP ≥75 | Start design partner outbound Email 1 |
| No action + ICP <75 | Archive · quarterly newsletter only |

---

## Forbidden claims

| Forbidden | Use instead |
|-----------|-------------|
| trusted by thousands | design partner program open |
| guaranteed roi / margin lift | operational estimates; pilot metrics TBD |
| all integrations live | BETA / SKIPPED per Integration Health |
| untouchable ai moat | 7 proprietary AI modules in production (qualified) |
| sysco / faire marketplace parity | HoReCa marketplace BETA scaffold |
| soc 2 certified | roadmap; not in pilot term |

Run: `lintEmailNurture5SequenceCopy()` or `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`

---

## CRM tracking fields

| Field | Values |
|-------|--------|
| `inbound_nurture_stage` | `e1` · `e2` · `e3` · `e4` · `e5` · `complete` · `converted` |
| `nurture_trigger` | trial · get_started · demo_noshow · webinar · beta |
| `icp_score` | 0–100 |
| `handoff_outbound_seq` | true · false |

---

## Success metrics (internal)

| Metric | Directional target |
|--------|-------------------|
| Open rate (e1) | ≥45% inbound |
| Click rate (e2–e4) | ≥8% any CTA |
| Demo bookings from sequence | ≥5% of enrolled |
| Unsubscribe (e5) | <2% |

---

## Automation wiring notes

| Step | Implementation |
|------|----------------|
| Trigger | CRM workflow or `lifecycle_email` pattern ([`BETA_EMAIL_AUTOMATION.md`](./BETA_EMAIL_AUTOMATION.md)) |
| UTM | `utm_source=email&utm_medium=nurture&utm_campaign=nurture_mkt19_e{N}` |
| Stop rules | Webhook on `/book-demo` Cal.com booking |
| Claims gate | CI `verify-claims` on template changes |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) | Post-nurture outbound 3-touch |
| [`webinar-ghost-kitchens.md`](./webinar-ghost-kitchens.md) | Webinar registrant variant |
| [`loi-outreach-email.md`](./loi-outreach-email.md) | Cold LOI template |
| [`customer-success-playbook.md`](./customer-success-playbook.md) | Post-conversion |

**Primary CTA (email 5):** [`/book-demo?utm_source=email&utm_medium=nurture&utm_campaign=nurture_mkt19_e5`](/book-demo?utm_source=email&utm_medium=nurture&utm_campaign=nurture_mkt19_e5)

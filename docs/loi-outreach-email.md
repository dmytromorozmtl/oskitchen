# LOI outreach email — design partner template

**Task:** MKT-03  
**Status:** Sales-ready template — **not** a signed LOI  
**Updated:** 2026-06-03  
**Parent:** [`icp-definition-final.md`](./icp-definition-final.md) · [`loi-design-partner-template.md`](./loi-design-partner-template.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md)

Use this doc for **cold and warm outreach** to qualified operators. Goal: secure a **discovery call**, then a countersigned design-partner LOI — not a paid contract on first email.

**Honest baseline (June 2026):** OS Kitchen is in **qualified beta / pilot_ready** for core kitchen workflows. We have **0 signed LOIs** and **0 paid pilots** on file. Do not imply existing customers, LIVE integrations, or production certification.

---

## 10 target criteria (prospect must meet before send)

Score **≥8/10** before sending. All **10 required** before attaching LOI PDF.

| # | Criterion | How to verify (5 min) |
|---|-----------|------------------------|
| **T1** | **ICP segment fit** — ghost kitchen, commissary, or meal-prep (primary) | LinkedIn / website mentions delivery-first, shared kitchen, weekly menu, or commissary production |
| **T2** | **Owns fulfillment** — operates or controls a licensed kitchen (not pure dropship) | Google Maps, health dept listing, or “our kitchen” on About page |
| **T3** | **≤5 locations** in plausible pilot scope | Website location count, single “Order” CTA, no 50-location chain signals |
| **T4** | **Owner or ops lead reachable** — named founder/operator on site or LinkedIn | Not buried behind franchise corporate portal |
| **T5** | **Order volume pain** — 50+ orders/week or visible scale (menu tiers, multiple brands, weekly cutoff) | Social proof, menu complexity, multi-brand ghost kitchen pages |
| **T6** | **Spreadsheet / tool fragmentation signal** — Shopify/Woo + manual DMs, or “order via Instagram” | Channel mix suggests order-hub need |
| **T7** | **No hard enterprise blockers** — no public RFP requiring SSO/SOC2/SCIM in pilot term | Careers page, security page, or prior RFP language |
| **T8** | **Geography** — US/Canada English-first ops (pilot support timezone) | Address, phone, menu currency |
| **T9** | **Engagement capacity** — can commit to **weekly 30–45 min** feedback (owner or ops lead) | Ask in first reply; disqualify if “no time until Q4” |
| **T10** | **Accepts honest beta framing** — will not demand “Toast replacement” or rush-hour SLA day one | Discovery call screen; see disqualifiers in [`icp-definition-final.md`](./icp-definition-final.md) |

**Disqualify immediately if:** pure marketplace dropship, QSR hardware-POS-only ask, requires live DoorDash/Uber Eats ops as go-live blocker, refuses BETA/PREVIEW labels.

**Internal gate before LOI attach:** export `PILOT_GONOGO_ICP_INPUT_JSON` → `evaluatePilotIcpQualification` = QUALIFIED.

---

## Personalization tokens

Replace before send:

| Token | Source |
|-------|--------|
| `[FIRST_NAME]` | Signer / ops lead |
| `[COMPANY]` | Legal or brand name |
| `[SEGMENT_HOOK]` | One line from segment table below |
| `[PAIN_SIGNAL]` | Something specific from their site (brand count, weekly menu, commissary tenants) |
| `[LANDING_LINK]` | Segment landing URL + UTM |
| `[CALENDAR_LINK]` | Founder or sales calendar |
| `[SENDER_NAME]` | Your name |
| `[SENDER_TITLE]` | Founder / Head of Product |

### Segment hooks (pick one)

| Segment | `[SEGMENT_HOOK]` |
|---------|------------------|
| Ghost kitchen | “Running multiple virtual brands from one kitchen usually means reconciling tablets instead of one production queue.” |
| Commissary | “Shared-facility operators often schedule batch waves in spreadsheets while tenants order through separate channels.” |
| Meal prep | “Weekly menu + cutoff cycles break spreadsheets right when volume jumps from hundreds to thousands of meals.” |

### Landing links (UTM)

| Segment | URL |
|---------|-----|
| Ghost kitchen | `https://os.kitchen/landing/ghost-kitchen?utm_source=email&utm_medium=outreach&utm_campaign=loi-design-partner` |
| Meal prep | `https://os.kitchen/landing/meal-prep?utm_source=email&utm_medium=outreach&utm_campaign=loi-design-partner` |
| Weekly preorder | `https://os.kitchen/landing/weekly-preorder?utm_source=email&utm_medium=outreach&utm_campaign=loi-design-partner` |

---

## Email A — cold outreach (initial)

**Subject options (A/B test one):**

- `Design partner invite — [COMPANY] + kitchen ops feedback`
- `[FIRST_NAME], quick question about [PAIN_SIGNAL]`
- `Weekly sync partner for restaurant ops software (qualified beta)`

**Body:**

```
Hi [FIRST_NAME],

I'm [SENDER_NAME], [SENDER_TITLE] at OS Kitchen. We're building a software-first
operating system for operators who own fulfillment — order hub, production, KDS,
and storefront/POS in the browser (no proprietary terminal lease).

[SEGMENT_HOOK]

I noticed [PAIN_SIGNAL] at [COMPANY]. We're opening a small **design partner**
program: 3-month LOI, weekly 30–45 min feedback, dedicated staging workspace,
and early influence on the roadmap. This is **qualified beta** — we're honest
about what's pilot_ready vs BETA (see our trust page), not a "production
certified for everyone" pitch.

Included in scope for design partners:
• Today command center + order hub
• Production board, KDS bump/recall, packing verification
• Storefront checkout + in-browser POS software
• Launch wizard + integration health (honest PASS/SKIPPED states)

Out of scope for the LOI term: enterprise SSO/SOC2, offline POS hardware parity,
live DoorDash/Uber Eats marketplace ops, and rush-hour SLA guarantees.

If that's aligned, I'd love 20 minutes to see if you match our ICP and walk
through a staging demo. Overview: [LANDING_LINK]

Open to a call this week or next?
[CALENDAR_LINK]

Best,
[SENDER_NAME]
[SENDER_TITLE], OS Kitchen
```

**Do not include in Email A:** pricing, ROI guarantees, customer logos, "LIVE integrations," or competitor trash-talk.

---

## Email B — warm follow-up (no reply, +5 business days)

**Subject:** `Re: design partner — [COMPANY]`

```
Hi [FIRST_NAME],

Bumping my note in case timing was off.

We're keeping the design partner cohort small (ghost kitchen, commissary, and
meal-prep operators only) so weekly feedback actually ships into the product.

If a 20-min fit call isn't useful now, a one-line "not now" is perfect — I'll
close the loop.

Otherwise: [CALENDAR_LINK]

Thanks,
[SENDER_NAME]
```

---

## Email C — post-discovery (send LOI PDF)

**Send only after:** T1–T10 confirmed, discovery call complete, ICP JSON qualifies, legal-reviewed LOI filled from [`loi-design-partner-template.md`](./loi-design-partner-template.md).

**Subject:** `OS Kitchen design partner LOI — [COMPANY]`

```
Hi [FIRST_NAME],

Great speaking with you. As discussed, attached is our **non-binding Letter of
Intent** for the design partner program ([ENGAGEMENT_TERM_MONTHS] months,
weekly sync on [WEEKLY_SYNC_DAY]).

Key reminders:
• Staging golden path before production customer traffic
• Exhibit A modules at current BETA / pilot_ready maturity
• Confidentiality in §5; optional exclusivity in §6 (your choice)

Please review with your counsel. Happy to walk through Exhibit A on a 15-min
call before signature.

Next after countersign:
1. Week 0 kickoff + staging workspace `[STAGING_WORKSPACE_SLUG]`
2. Launch wizard onboarding
3. First weekly sync on [WEEKLY_SYNC_DAY]

Let me know if you have edits for legal.

Best,
[SENDER_NAME]
```

Attach: countersigned-ready PDF from `loi-design-partner-template.md` (legal review required).

---

## Email D — polite decline template (internal / if asked)

Use when prospect fails T7, T10, or ICP disqualifiers:

```
Hi [FIRST_NAME],

Thanks for the conversation. Based on [SSO requirement / hardware POS parity /
live marketplace ops timeline], we're not the right fit for a design partner
engagement right now — we'd risk overpromising.

If your constraints change (e.g. software-first kitchen path, qualified beta
labels acceptable), happy to reconnect.

Wishing you a strong [season/quarter],
[SENDER_NAME]
```

---

## Pre-send checklist

| Step | Command / doc |
|------|----------------|
| Forbidden claims training complete | [`forbidden-claims-training.md`](./forbidden-claims-training.md) |
| Strict claims verify | `MARKETING_CLAIMS_STRICT=1 npm run verify-claims` |
| ICP segment doc | [`icp-definition-final.md`](./icp-definition-final.md) |
| LOI template ready | [`loi-design-partner-template.md`](./loi-design-partner-template.md) |
| CRM stage | `prospect` → `outreach_sent` → `discovery` → `loi_sent` |

---

## CRM tracking fields

| Field | Example |
|-------|---------|
| `outreach_segment` | `ghost_kitchen` |
| `target_criteria_score` | `9/10` |
| `icp_qualified` | `true` / `false` |
| `email_variant` | `A` / `B` / `C` |
| `loi_sent_date` | `2026-06-15` |
| `loi_signed_date` | `null` until countersigned |

After signature: update GO/NO-GO evidence per [`loi-design-partner-template.md#after-signature--internal-updates`](./loi-design-partner-template.md#after-signature--internal-updates).

---

## Metrics (honest — not investor KPIs)

Track internally; do not publish until approved case study exists.

| Metric | Target (Wave 1) |
|--------|-----------------|
| Emails sent (qualified T1–T8) | 30 |
| Discovery calls booked | 8 |
| ICP-qualified after call | 5 |
| LOIs sent | 3 |
| LOIs signed | **1** (first pilot gate) |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`icp-definition-final.md`](./icp-definition-final.md) | Segment definitions + scoring |
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Countersigned LOI body |
| [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md) | Post-LOI paid pilot SOW |
| [`forbidden-claims-training.md`](./forbidden-claims-training.md) | Sales certification |
| [`era20-first-paid-pilot-package-2026-05-28.md`](./era20-first-paid-pilot-package-2026-05-28.md) | Scope + exclusions |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | MKT-03 — LOI outreach email template + 10 target criteria |

# Webinar strategy — OS Kitchen

**Policy:** `webinar-strategy-v1`  
**Date:** 2026-06-02  
**Owner:** Marketing + Founder  
**Scope:** Live and recorded webinars for **design-partner recruitment**, **product education**, and **association co-marketing**  
**Status:** **Strategy only** — **0 webinars delivered · 0 signed LOI from webinar leads · pilot NO-GO**  
**Related:** [`restaurant-partnerships-strategy.md`](./restaurant-partnerships-strategy.md) · [`linkedin-content-plan.md`](./linkedin-content-plan.md) · [`demo-video-script-today.md`](./demo-video-script-today.md) · [`marketing-analytics-setup.md`](./marketing-analytics-setup.md)

This document defines **when, why, and how** OS Kitchen runs webinars — formats, run-of-show, promotion, follow-up, and honest claims — without inventing audience size or customer proof.

**Honesty rule:** Do **not** title webinars “Customer success stories” until a signed LOI operator approves participation. Label sessions **“Product preview”** or **“Design partner program”** until pilot proof exists.

---

## Goals (Q3–Q4 2026)

| Goal | Target | Measured by |
|------|--------|-------------|
| **First live webinar** | 1 session delivered | Registration + attendance log |
| **Qualified leads** | ≥5 post-webinar discovery calls | CRM / founder tracker |
| **Design-partner pipeline** | ≥1 LOI influenced by webinar | LOI source field |
| **Association co-host** | 1 co-branded session (optional) | MOU + joint promotion |
| **Repurpose content** | Recording → 3 LinkedIn clips | [`linkedin-content-plan.md`](./linkedin-content-plan.md) |

**Not a goal (yet):** 500+ registrants, paid webinar ads at scale, certification-style “OS Kitchen Academy.”

---

## Webinar types (priority order)

| # | Type | Audience | CTA | When |
|---|------|----------|-----|------|
| **W1** | **Today Command Center preview** | Owners, GMs, COO (1–5 loc) | `/contact-sales` · LOI | Q3 Week 1–4 |
| **W2** | **Honest AI for restaurant ops** | Ops + kitchen managers | `/demo` · advisory board | After W1 baseline |
| **W3** | **HoReCa marketplace BETA** | Buyers + suppliers split session | `/pricing` · `/vendor` | After vendor seed E1 |
| **W4** | **Association co-host** | Member newsletter list | Design partner LOI | After MOU signed |
| **W5** | **Shopify / Woo operator path** | E-com F&B | `/shopify` | ICP campaign tie-in |
| **W6** | **Ghost kitchen command center** | Multi-brand operators | `/solutions/ghost-kitchens` · LOI | Q3 — see [`webinar-ghost-kitchens.md`](./webinar-ghost-kitchens.md) |

**Avoid until pilot GO:** “Enterprise SSO deep dive,” “LIVE integration masterclass,” competitor teardown webinars.

---

## Format options

| Format | Duration | Platform | Best for |
|--------|----------|----------|----------|
| **Live demo + Q&A** | 45 min (30 demo + 15 Q&A) | Zoom / Google Meet | W1, W2 — founder-led |
| **Panel (2–3 speakers)** | 60 min | Zoom + LinkedIn event | W4 association co-host |
| **Recorded evergreen** | 20–30 min | YouTube unlisted + `/demo` embed | Nurture email sequence |
| **LinkedIn Live** | 30 min | LinkedIn | Low-friction W1 repeat |

**Recording policy:** Notify registrants; obtain speaker consent; no attendee faces without permission.

---

## W1 run-of-show — Today Command Center (template)

Based on [`demo-video-script-today.md`](./demo-video-script-today.md) — expand 90s script to 30 min live walkthrough.

| Time | Segment | Content | Speaker |
|------|---------|---------|---------|
| 0:00–5:00 | Welcome + honesty framing | Who we are, pre-revenue, design partner ask, BETA integration labels | Founder |
| 5:00–20:00 | Live demo | `/dashboard/today` → order hub → KDS glance; show briefing hero + BETA badges | Founder |
| 20:00–25:00 | Marketplace + pricing (2 min) | `/pricing` marketplace section — buyer no-fee, vendor tiers, BETA | Founder |
| 25:00–35:00 | Q&A | Pre-seed 3 FAQ from [`pricing-faq.ts`](../lib/marketing/pricing-faq.ts) | Founder |
| 35:00–40:00 | CTA | LOI template, `/contact-sales`, next office hours | Founder |
| 40:00–45:00 | Buffer / overflow Q&A | — | — |

**Demo environment:** [`sales-demo-environment.md`](./sales-demo-environment.md) staging workspace — never prod customer data.

**Forbidden on slide/deck:** “Trusted by X restaurants,” “SOC 2 certified,” “all integrations LIVE,” Uber Direct as shipped.

---

## Promotion playbook

### Timeline (2 weeks pre-event)

| Day | Action | Owner |
|-----|--------|-------|
| **−14** | Finalize title, abstract, landing copy (claims review) | Marketing |
| **−12** | Registration page live (Typeform / Cal.com / simple `/contact-sales` block) | Marketing |
| **−10** | LinkedIn event + company post (Template A/C) | Marketing |
| **−7** | Email to warm list + design-partner prospects | Founder |
| **−3** | Reminder post + speaker prep | Founder |
| **−1** | Tech check, demo reset, slide PDF | Founder |
| **0** | Live session + attendance export | Founder |
| **+1** | Thank-you email + recording link + LOI CTA | Marketing |
| **+7** | Clip 3 moments → LinkedIn | Marketing |

### UTM discipline

```
?utm_source=webinar&utm_medium=live&utm_campaign={webinar_id}_{yyyy-mm}
```

Landing targets: `/contact-sales`, `/demo`, `/shopify`, `/vendor` — per webinar type.

Track registrations in GA4 / PostHog when keys live ([`marketing-analytics-setup.md`](./marketing-analytics-setup.md)).

---

## Registration page copy (safe template)

**Title:** *Today Command Center — honest preview for restaurant operators (design partner session)*

**Abstract:**

> See how OS Kitchen unifies orders, kitchen production, and daily priorities in one workspace — including our deterministic AI briefing (not hype). We’re pre-revenue and recruiting **3 design partners** for a staged pilot. Integrations and marketplace are **BETA** until verified. No sales pressure — 45 minutes, live Q&A.

**Fields:** Name · Email · Role · Locations count · Primary channel (Shopify/Woo/manual/other)

---

## Speaker & slide guidelines

| Rule | Detail |
|------|--------|
| **Claims gate** | Every slide through [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) |
| **BETA visible** | Screenshot must show BETA/PLACEHOLDER badges where applicable |
| **No customer logos** | Until written release |
| **AI wording** | “7 proprietary AI modules in production — qualified maturity per module” |
| **Competitive** | Factual only — [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) |
| **Q&A** | Defer unknowns; link limitation sheet |

**Deck skeleton (8 slides max):** Problem → Today CC → AI briefing (honest) → Order hub/KDS → Integrations BETA → Marketplace BETA → Design partner offer → CTA + limitations.

---

## Post-webinar follow-up

| Segment | Action | Timing |
|---------|--------|--------|
| **Attended + qualified ICP** | Personal founder email + LOI PDF | +24h |
| **Attended + not ICP** | Thank you + `/demo` link | +24h |
| **Registered, no-show** | Recording + reschedule offer | +48h |
| **All** | Add to CRM with `source=webinar_{id}` | +24h |

Use [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) Email 1 for hot leads. Inbound registrants enter [`email-nurture-5-sequence.md`](./email-nurture-5-sequence.md) first.

**Discovery call booking:** Cal.com or `/book-demo` — founder calendar only until hire #2.

---

## Metrics & success criteria

| Metric | W1 target (directional) | Tool |
|--------|:-------------------------:|------|
| Registrations | 25–40 | Registration export |
| Live attendance | ≥40% of registered | Zoom report |
| Avg watch time (recording) | ≥50% | YouTube / Vimeo |
| `/contact-sales` clicks (UTM) | ≥10 | GA4 |
| Discovery calls booked | ≥3 | Calendar |
| LOIs within 60 days | ≥1 (stretch) | CRM |

**Review:** 30-min retro within 1 week — what claims questions came up, demo failures, slide fixes.

Export summary to [`mvp-marketing-dashboard.md`](./mvp-marketing-dashboard.md) (Task 111) when dashboard doc exists.

---

## Q3 2026 suggested calendar

| Month | Webinar | Co-host | Status |
|-------|---------|---------|:------:|
| **July** | W1 — Today Command Center preview | Solo (founder) | Planned |
| **August** | W2 — Honest AI for ops | Solo or advisory guest (no logo) | Planned |
| **September** | W4 — Association co-host **or** W3 marketplace | TBD MOU | Optional |

**Gate W3:** Vendor seeding Phase 1 sign-off ([`vendor-seeding-execution.md`](./vendor-seeding-execution.md)).

**Gate W4:** Association MOU ([`restaurant-partnerships-strategy.md`](./restaurant-partnerships-strategy.md)).

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Over-promising in Q&A | Limitation sheet cheat sheet on second monitor |
| Demo failure live | Pre-recorded backup clip (90s Today script) |
| Low registration | LinkedIn boost $200 test — pause if CPL high |
| Association wants exclusivity | Decline; offer member discount only |
| Recording leaks early features | Unlisted link; password optional |

**Incident:** If a forbidden claim slips live → follow [`ai-crisis-communication-template.md`](./ai-crisis-communication-template.md) (Task 112) for correction post.

---

## Related documents

| Doc | Use |
|-----|-----|
| [`demo-video-script-today.md`](./demo-video-script-today.md) | Core demo narrative |
| [`webinar-ghost-kitchens.md`](./webinar-ghost-kitchens.md) | W6 ghost kitchen run-of-show (MKT-18) |
| [`sales-demo-environment.md`](./sales-demo-environment.md) | Staging workspace setup |
| [`feature-announcement-template.md`](./feature-announcement-template.md) | Post-webinar product email |
| [`case-study-template.md`](./case-study-template.md) | After first permissioned pilot |
| [`q3-2026-okrs.md`](./q3-2026-okrs.md) | Objective alignment |

---

## Revision history

| Version | Date | Change |
|---------|------|--------|
| `webinar-strategy-v1` | 2026-06-02 | Initial strategy — Task 110 |

**Next action:** Schedule W1 for July — draft registration copy → LinkedIn event → founder prep using demo script.

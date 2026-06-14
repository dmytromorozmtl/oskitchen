# LinkedIn content plan — OS Kitchen (legacy)

> **Superseded by P2-59:** Canonical **3 posts/week founder-led** cadence lives in [`linkedin-content-plan-p2-59.md`](./linkedin-content-plan-p2-59.md).

**Policy:** `linkedin-content-plan-v1`  
**Date:** 2026-06-02  
**Owner:** Marketing + Founder  
**Scope:** Organic LinkedIn + optional Sponsored Content for B2B restaurant operators  
**Status:** **Pre-launch content calendar** — no customer logos or case studies until signed LOI  
**Related:** [`marketing-analytics-setup.md`](./marketing-analytics-setup.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) · [`demo-video-script-today.md`](./demo-video-script-today.md)

This plan defines **what to post on LinkedIn**, **how often**, **which claims are safe**, and **how to measure** — without inventing traction OS Kitchen does not have yet.

**Honesty rule:** **0 signed customers · pilot NO-GO** ([`artifacts/pilot-gono-go-summary.json`](../artifacts/pilot-gono-go-summary.json)). Use *“building in public”* and *“design partner program”* — not *“trusted by hundreds of restaurants.”*

---

## Goals (Q3 2026)

| Goal | Metric | Target (directional) |
|------|--------|:--------------------:|
| **Awareness** | Impressions / week (company + founder) | Baseline → +20% MoM |
| **Consideration** | Profile + `/shopify` clicks (UTM) | 50+ qualified clicks/month |
| **Pipeline** | Design-partner DM / form fills | 3 conversations/month |
| **Recruitment** | Vendor + operator inbound | 2 `/vendor` visits/week from LinkedIn |

**Not a goal (yet):** Viral reach, competitor dunking, revenue claims from social.

---

## Audience & ICP

| Segment | LinkedIn titles | Content angle |
|---------|-----------------|---------------|
| **Primary** | Owner, GM, COO — 1–5 location F&B | Today Command Center, order hub, honest AI briefing |
| **Secondary** | Ops director, kitchen manager | KDS, kitchen camera (preview honesty), food cost |
| **Channel** | Shopify / Woo operator | `/shopify` ICP — marketplace + integrations BETA |
| **Supply side** | HoReCa distributor, packaging supplier | `/vendor` recruitment — B2B marketplace pilot |
| **Investor-adjacent** | Angels, restaurant-tech peers | Building in public — no Series A hype |

**Exclude from targeting:** Enterprise 100+ units (until Enterprise MVP proof), claims requiring LIVE integrations.

---

## Content pillars (4 rotating themes)

| Pillar | % of posts | Safe headline examples | Link / CTA |
|--------|:----------:|------------------------|------------|
| **1 — Operator clarity** | 35% | “One screen for what needs attention today” | `/demo` · Today script |
| **2 — Honest AI** | 25% | “7 proprietary AI modules in production — each qualified, not magic” | [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) |
| **3 — Integration reality** | 20% | “BETA badges mean we prove before we promise LIVE” | `/integrations` |
| **4 — Build in public** | 20% | “What we shipped this week” · design partner ask | `/contact-sales` · LOI template |

**Never post:** “Untouchable moat,” “SOC 2 certified,” “all integrations LIVE,” fake customer quotes, Uber Direct as shipped.

---

## Posting cadence

| Channel | Frequency | Owner |
|---------|-----------|-------|
| **Company page** | 2× / week (Tue, Thu 10:00 local) | Marketing |
| **Founder profile** | 1× / week (Wed) + comment on company posts | Founder |
| **Employee advocacy** | Optional 1× / month | Team |

**Batching:** Draft 4 weeks in one sitting; schedule via LinkedIn native scheduler or Buffer (no tool lock-in).

---

## UTM discipline

All LinkedIn links use consistent UTMs for GA4 / PostHog ([`marketing-analytics-setup.md`](./marketing-analytics-setup.md)):

```
?utm_source=linkedin&utm_medium=organic&utm_campaign={pillar}_{yyyy-mm}
```

| `utm_campaign` example | Landing |
|------------------------|---------|
| `operator_clarity_2026-06` | `/demo` |
| `honest_ai_2026-06` | `/` or blog |
| `shopify_icp_2026-06` | `/shopify` |
| `vendor_recruit_2026-06` | `/vendor` |
| `design_partner_2026-06` | `/contact-sales` |

**Paid:** Add `utm_medium=paid` + LinkedIn Campaign Manager + `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` for Insight tag.

---

## Post formats & templates

### Format mix

| Format | Share | Notes |
|--------|:-----:|-------|
| Single image + caption | 40% | Product screenshot with BETA badge visible |
| Carousel (3–5 slides) | 25% | AI modules 1–7 one slide each |
| Short video (60–90s) | 15% | Today Command Center — [`demo-video-script-today.md`](./demo-video-script-today.md) |
| Text-only build log | 15% | No asset dependency |
| Document PDF | 5% | One-pager / honest compare excerpt |

### Template A — Operator clarity

```text
Rush hour isn’t a dashboard problem — it’s an attention problem.

We built Today Command Center so owners see:
→ Orders that need action
→ Kitchen + integration signals in one place
→ An AI briefing that’s deterministic (not hype)

Pilot-ready modules · BETA integrations labeled honestly.

Try the demo (no signup wall): [link + UTM]

#RestaurantTech #HoReCa #Operations
```

### Template B — Honest AI (module spotlight)

```text
Module {N}/7: {Module name}

What it does: {one sentence from ai-moats doc}
What it doesn’t: {honest limit}

Camera-ready ≠ live CV unless you connect hardware.
BETA ≠ LIVE until smoke + credentials pass.

Full honest map: [blog or /ai link + UTM]

#RestaurantAI #KitchenOps
```

### Template C — Design partner ask

```text
We’re looking for 3 design partners (1–5 locations):
→ Weekly check-in with founder
→ Influence roadmap
→ LOI — not a paid case study fiction

If you run Shopify or Woo + a real kitchen ops pain, DM or:
[contact-sales + UTM]

0 customers today. That’s the honest baseline.
```

### Template D — Build in public

```text
Shipped this week @ OS Kitchen:
• {bullet from changelog}
• {bullet — include BETA/LIVE label}

Next: {one honest upcoming item}

Follow for weekly ops + AI honesty threads.
```

---

## 4-week starter calendar (June 2026)

| Week | Tue (company) | Thu (company) | Wed (founder) |
|:----:|---------------|---------------|---------------|
| **1** | Template A — Today CC | Carousel: 7 AI modules (honest limits) | Design partner ask (Template C) |
| **2** | Screenshot: order hub + BETA integration badge | Template B — AI Restaurant Brain | Comment thread on industry pain (no product pitch) |
| **3** | `/shopify` ICP — marketplace + channels | Template D — weekly ship log | Founder story — why honest AI |
| **4** | `/vendor` supplier recruitment | Video clip — 90s Today demo | Poll: “Biggest ops bottleneck?” → DM follow-up |

**After week 4:** Rotate pillars; insert [`feature-announcement-template.md`](./feature-announcement-template.md) for major releases.

---

## Engagement playbook

| Action | Rule |
|--------|------|
| Reply to comments | < 4h business hours; no arguable claims |
| DM inbound | Route to design-partner sequence or `/contact-sales` |
| Competitor mentions | Factual compare only — [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) |
| Negative feedback | Acknowledge · link limitation sheet if scope question |
| Reshare employee posts | Company page max 1× / week |

**Forbidden in comments:** Discount codes not on `/pricing`, custom SLA promises, LIVE integration claims.

---

## Paid LinkedIn (optional Phase 2)

Start paid only after:

1. Organic baseline 4 weeks captured in GA4  
2. `NEXT_PUBLIC_LINKEDIN_PARTNER_ID` + consent banner verified  
3. [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) reviewed for ad copy  

| Campaign | Objective | Audience | Landing |
|----------|-----------|----------|---------|
| Design partner | Lead gen | Owner/COO, 1–50 employees, F&B | `/contact-sales` |
| Shopify ICP | Website visits | E-commerce + restaurant interest | `/shopify` |
| Vendor supply | Website visits | Wholesale, packaging, cleaning | `/vendor` |

**Budget (indicative):** $500–1,500/mo test — pause if CPL > 2× target without qualified DM.

---

## Measurement & review

| Cadence | Review | Source |
|---------|--------|--------|
| Weekly | Top post, clicks, DMs | LinkedIn analytics + GA4 `linkedin` source |
| Monthly | Pillar performance, UTM campaigns | GA4 + PostHog |
| Quarterly | Align with Q3 OKRs | [`q3-2026-okrs.md`](./q3-2026-okrs.md) |

**KPI dashboard:** Export to [`mvp-marketing-dashboard.md`](./mvp-marketing-dashboard.md) (Task 111) when analytics env live.

---

## Pre-publish checklist

| # | Check |
|---|-------|
| 1 | Claim in [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)? |
| 2 | BETA / PLACEHOLDER labeled if screenshot shows integrations? |
| 3 | UTM on every link? |
| 4 | No customer logo / quote without signed LOI? |
| 5 | No forbidden phrases (CI blocklist)? |
| 6 | CTA matches landing page honesty (no Uber Direct as live)? |

---

## Related documents

| Doc | Use |
|-----|-----|
| [`marketing-analytics-setup.md`](./marketing-analytics-setup.md) | LinkedIn Insight tag + UTMs |
| [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) | DM → email nurture |
| [`founding-customer-story.md`](./founding-customer-story.md) | Founder narrative (when ready) |
| [`ai-honesty-policy.md`](./ai-honesty-policy.md) | Public AI claims |
| [`webinar-strategy.md`](./webinar-strategy.md) | Task 110 — live event promotion |

---

## Revision history

| Version | Date | Change |
|---------|------|--------|
| `linkedin-content-plan-v1` | 2026-06-02 | Initial 4-week plan — Task 107 |

**Next action:** Schedule Week 1 posts · set LinkedIn Insight env if running paid in Q3.

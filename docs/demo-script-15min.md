# OS Kitchen — 15-minute live demo script

**Policy:** `demo-script-15min-mkt22-v1`  
**Updated:** 2026-06-03  
**Duration:** **15:00** (±2 min) · **12 min demo + 3 min Q&A buffer**  
**Format:** Live screen-share (Zoom / Google Meet) — post-discovery call  
**Workspace:** Staging golden scenario (`/demo/meal-prep`, `/demo/ghost-kitchen`) or qualified prospect staging  
**Audience:** ICP-qualified owner/GM (score ≥8 from [`discovery-call-script.md`](./discovery-call-script.md))  
**Honesty:** [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`forbidden-claims-training.md`](./forbidden-claims-training.md) · [`sales-demo-environment.md`](./sales-demo-environment.md)

Live demo after discovery — **not** a substitute for qualification. Do not imply signed customers, LIVE marketplace network, or audited ROI.

**Companions:** [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) (10-min shorthand) · [`demo-video-script-5min.md`](./demo-video-script-5min.md) (recorded cut-down · MKT-12)

---

## Pre-demo checklist

| # | Item |
|---|------|
| 1 | Discovery call complete · ICP score logged · pain quote captured |
| 2 | Staging workspace seeded — ≥3 orders, KDS tickets, 1 briefing blocker |
| 3 | `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot` — nav readable |
| 4 | Integration Health shows **BETA/SKIPPED** rows — do not hide before screen-share |
| 5 | [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) on second monitor |
| 6 | Segment-matched demo: meal prep / ghost kitchen / weekly preorder |
| 7 | Browser 100% zoom · DND · test screen-share audio |

---

## Segment structure (15 minutes)

| # | Segment | Time | Route(s) | Theme |
|---|---------|------|----------|-------|
| 1 | Frame + pain recap | 0:00–1:00 | Verbal | Mirror discovery pain |
| 2 | Today Command Center | 1:00–3:30 | `/dashboard/today` | Owner rhythm + briefing |
| 3 | Order Hub | 3:30–5:30 | `/dashboard/orders` | Unified spine |
| 4 | Integration Health | 5:30–7:30 | `/dashboard/integration-health` | Honesty moat |
| 5 | KDS + production | 7:30–9:30 | `/dashboard/kitchen` | Line execution |
| 6 | POS + packing | 9:30–11:00 | `/dashboard/pos` · packing | Software-first checkout |
| 7 | Channels + storefront | 11:00–12:30 | Sales channels · storefront | BETA paths |
| 8 | AI / profit glance | 12:30–13:30 | `/dashboard/today/profit` or `/ai` | Qualified maturity |
| 9 | Pricing + CTA | 13:30–15:00 | `/pricing` · verbal | Design partner next step |

**Q&A:** If questions run long, defer deep dives to follow-up — never skip Integration Health honesty segment.

---

## Segment scripts

### 1 — Frame + pain recap (1:00)

**Say:**

> "Thanks for the discovery call — you mentioned [PAIN_QUOTE from CRM]. This demo is **15 minutes on staging** — I'll show order → kitchen → honest integration labels. Interrupt anytime. We're **pre-revenue**; badges mean what they say."

**Do not say:** customer logos · "fully integrated" · guaranteed outcomes

---

### 2 — Today Command Center (2:30)

**Route:** `/dashboard/today`

**Say:**

> "Every owner day starts on **Today**. The **daily briefing** pulls from your real hub signals — deterministic rules, not magic AGI. **Attention** surfaces blockers before rush hour. KPI tiles deep-link to fixes."

**Show:**

1. Owner Daily Briefing hero — 2 priority lines  
2. Attention strip or calm card  
3. One KPI hover → quick jump preview  
4. Business-mode badge visible  

**Segment hook (ghost kitchen):** cross-brand attention row  
**Segment hook (meal prep):** cutoff / production due language  

**Honesty:** Point to BETA badge on briefing or integration lane if visible.

---

### 3 — Order Hub (2:00)

**Route:** `/dashboard/orders`

**Say:**

> "**Order Hub** is the spine — Shopify, Woo, walk-in, storefront in one queue. Filter by channel, status, fulfillment date. Drill into one order: customer, lines, production state — same object the kitchen sees."

**Show:**

1. Unified queue with channel badges  
2. Open one order detail  
3. Filter by channel once  

---

### 4 — Integration Health (2:00)

**Route:** `/dashboard/integration-health`

**Say:**

> "This is our sales moat: **PASS**, **BETA**, and **SKIPPED** mean what they say. Green configured is not the same as smoke-certified LIVE. We'd rather you see SKIPPED in minute seven than week seven."

**Show:**

1. Full strip or matrix  
2. Pause on one **BETA** row  
3. Pause on one **SKIPPED** row — recovery link  
4. Optional: `/integrations` marketing matrix if security reviewer on call  

**Do not say:** all channels live · Uber/DoorDash official partner

---

### 5 — KDS + production (2:00)

**Route:** `/dashboard/kitchen`

**Say:**

> "Tickets hit **KDS** from the same spine — bump, recall, filter by source when multi-brand. **Production board** handles batch prep waves for meal prep and catering."

**Show:**

1. Active ticket — bump once (staging)  
2. Source/channel badge on ticket if present  
3. Quick glance production checkpoint  

---

### 6 — POS + packing (1:30)

**Routes:** `/dashboard/pos` · packing module

**Say:**

> "**Software-first POS** on hardware you already own — browser checkout, not proprietary terminal lock-in. **Packing** generates label-oriented PDFs from order data."

**Show:**

1. POS terminal view — touch-friendly  
2. Packing label PDF preview (lazy load OK)  

**Honesty:** Offline card queue is roadmap — say so if asked.

---

### 7 — Channels + storefront (1:30)

**Routes:** `/dashboard/sales-channels` · `/dashboard/storefront`

**Say:**

> "**Storefront** and **QR guest ordering** are BETA design-partner surfaces. **Shopify/Woo** import paths exist — maturity follows Integration Health, not marketing tiles."

**Show:**

1. One channel setup page — BETA labels  
2. Storefront publish state or QR generate screen (5s)  

---

### 8 — AI / profit glance (1:00)

**Routes:** `/dashboard/today/profit` or link [`/ai`](/ai)

**Say:**

> "Seven proprietary **AI modules** at qualified maturity — **Food Cost AI** and **Today profit** show operational estimates, not GAAP. Full honesty breakdown lives on our public `/ai` page."

**Show:**

1. One profit or food-cost surface — **AiHonestyBanner** visible  
2. Optional: open `/ai` in new tab for security reviewer  

**Do not say:** guaranteed margin lift · replaces accountant

---

### 9 — Pricing + CTA (1:30)

**Routes:** `/pricing` · verbal LOI path

**Say:**

> "Pilot pricing is transparent on **Pricing** — 50% subscription discount during qualified design-partner window. Next step: **non-binding LOI**, staging workspace, weekly 30-minute feedback. Or start **14-day trial** if you prefer self-serve first."

**Show:**

1. Pilot SKU row on `/pricing`  
2. Marketplace section — BETA scaffold honesty  

**CTA:** [`/book-demo?utm_source=demo&utm_medium=live&utm_campaign=demo-15min-mkt22`](/book-demo?utm_source=demo&utm_medium=live&utm_campaign=demo-15min-mkt22) for follow-up · LOI PDF if ≥12 ICP score

---

## Timing map

| Segment | Start | End | Duration |
|---------|-------|-----|----------|
| Frame | 0:00 | 1:00 | 60s |
| Today | 1:00 | 3:30 | 150s |
| Orders | 3:30 | 5:30 | 120s |
| Integration Health | 5:30 | 7:30 | 120s |
| KDS | 7:30 | 9:30 | 120s |
| POS + packing | 9:30 | 11:00 | 90s |
| Channels | 11:00 | 12:30 | 90s |
| AI / profit | 12:30 | 13:30 | 60s |
| Close | 13:30 | 15:00 | 90s |
| **Total** | | | **900s** |

---

## Forbidden on-call claims

| Forbidden | Use instead |
|-----------|-------------|
| replace Toast overnight | software-first ops layer |
| fully integrated | BETA / SKIPPED per channel |
| proven ROI / guaranteed savings | pilot metrics TBD |
| live DoorDash / Uber Eats | partner-gated; staging smoke |
| thousands of customers | design partner program |
| national marketplace network | HoReCa marketplace BETA scaffold |
| SOC 2 / HIPAA certified | roadmap; not pilot term |
| untouchable AI | 7 modules at qualified maturity |

Run: `lintDemoScript15MinCopy()` before updating talk tracks.

---

## Post-demo checklist (24h)

| # | Action |
|---|--------|
| 1 | CRM: `demo_15min_complete` + objections noted |
| 2 | Follow-up email — recording link if recorded · LOI if ≥12 score |
| 3 | Log Integration Health questions for product |
| 4 | If no LOI in 7 days → [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`discovery-call-script.md`](./discovery-call-script.md) | Pre-demo qualification (MKT-21) |
| [`demo-video-script-5min.md`](./demo-video-script-5min.md) | Recorded marketing cut |
| [`sales-demo-environment.md`](./sales-demo-environment.md) | Staging setup |
| [`integration-honesty-screen-share-guide.md`](./integration-honesty-screen-share-guide.md) | Segment 4 deep dive (MKT-27) |
| [`loi-design-partner-template.md`](./loi-design-partner-template.md) | Post-demo LOI |

**Primary CTA:** [`/book-demo?utm_source=demo&utm_medium=live&utm_campaign=demo-15min-mkt22`](/book-demo?utm_source=demo&utm_medium=live&utm_campaign=demo-15min-mkt22)

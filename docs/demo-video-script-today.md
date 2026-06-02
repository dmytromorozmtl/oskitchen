# Today Command Center — 90-second demo video script

**Policy:** `demo-video-script-today-v1`  
**Updated:** 2026-06-02  
**Duration:** **90 seconds** (±5s)  
**Route:** `/dashboard/today`  
**UI:** `app/dashboard/today/page.tsx` · `components/dashboard/today-command-center.tsx` · `OwnerDailyBriefingHero`  
**Audience:** Prospects, investors, design-partner outreach  
**Honesty:** [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md)

Record in **owner workspace** with sample orders/tasks for visual density, or use `/demo` workspace. Do not imply customer proof or LIVE integrations.

---

## Pre-recording checklist

| # | Item |
|---|------|
| 1 | Log in as **workspace owner** — briefing hero visible |
| 2 | Business mode badge set (e.g. Ghost Kitchen / Meal Prep) |
| 3 | At least 1–2 blockers or KPIs non-zero (staging seed) **or** use quiet-state script variant below |
| 4 | Browser zoom 100%; hide personal bookmarks bar |
| 5 | Optional: `?metrics=all` if KPI wall should appear expanded |
| 6 | Close unrelated tabs; DND on |

**Capture:** 1920×1080 screen record + lapel mic. Pace: ~150 words/min → **~225 words** total.

---

## Script (90 seconds)

### 0:00–0:08 — Hook

**VO:**  
Most operators start the day in five tabs — orders, kitchen, channels, spreadsheets, and a chat thread. OS Kitchen starts here: **Today**.

**On screen:**  
Fade in `/dashboard/today`. Mouse rests on **Today** heading + business-mode badge. Slow scroll — do not rush.

---

### 0:08–0:22 — Daily briefing (AI Restaurant Brain)

**VO:**  
Your **daily briefing** is deterministic — built from real workspace signals, not generic AI fluff. Priorities, integration health, and next actions in one hero strip. Seven proprietary AI modules sit behind this; the briefing is module one — **AI Restaurant Brain** — at qualified pilot maturity.

**On screen:**  
Highlight **Owner Daily Briefing** hero (top of page). Point cursor to 1–2 priority lines / action chips. If Integration Health lane visible, pause on **BETA** or **SKIPPED** badge — nod to honesty UI.

**Do not say:** “AGI manager,” “guaranteed savings,” “always correct.”

---

### 0:22–0:38 — Attention + readiness

**VO:**  
Below that, **attention** surfaces what needs you now — blockers, webhook risk, orders due. **Workspace readiness** shows setup gaps with deep links — no mystery percent without a fix path.

**On screen:**  
Scroll to **TodayAttentionStrip** (amber card if present). Then **Workspace readiness** progress + one category link hover. Click **Open go-live** or category — quick cut back to Today.

**Alt (quiet workspace):**  
**VO:** When the shift is calm, Today stays quiet — no fake KPI noise. Operators jump straight to create order or connect a channel.

**On screen:** **Everything is calm today** card → **Create order** button.

---

### 0:38–0:55 — Ops snapshot

**VO:**  
When work is live, the **KPI wall** opens — orders, production, packing, routes, webhooks, revenue — each tile jumps to the module that fixes it. **Blockers and integration risk** stay honest: if a channel is BETA, you see it here before your team does.

**On screen:**  
If collapsed: click **Show all metrics** / expand link. Pan across 4–6 KPI tiles (orders, production, packing, webhooks). Open **Blockers & integration risk** card — show one row or “No surfaced blockers.”

**Skip if:** `collapseKpiWall` — use compact metrics card + expand click only (~3s).

---

### 0:55–1:08 — Act, don’t hunt

**VO:**  
Three queues — **orders needing attention**, **open tasks**, **routes today** — plus **quick jumps** to kitchen, packing, and sales channels. One screen, workspace-scoped, refresh to update.

**On screen:**  
Scroll through orders/tasks/routes row (one link hover each). Snap to **Quick jumps** grid — hover **Kitchen screen**, **Packing**, **Sales channels**.

**Optional cutaway (2s):** Click **Kitchen screen** → KDS flash → back to Today.

---

### 1:08–1:30 — Close (honest)

**VO:**  
Today Command Center is our owner operating rhythm — briefing first, blockers visible, integrations labeled honestly. We’re recruiting **founding design partners** to prove it in real kitchens; integrations are **BETA** until smoke-certified. Book a pilot — link below.

**On screen:**  
Return to top — briefing hero full frame. End card: **os-kitchen.com/book-demo** or **/beta** + logo. Text overlay: *“7 AI modules in production · BETA integrations · Pilot program open”*

---

## Full voiceover (single block — ~225 words)

> Most operators start the day in five tabs — orders, kitchen, channels, spreadsheets, and a chat thread. OS Kitchen starts here: **Today**.  
>  
> Your **daily briefing** is deterministic — built from real workspace signals, not generic AI fluff. Priorities, integration health, and next actions in one hero strip. Seven proprietary AI modules sit behind this; the briefing is module one — **AI Restaurant Brain** — at qualified pilot maturity.  
>  
> Below that, **attention** surfaces what needs you now — blockers, webhook risk, orders due. **Workspace readiness** shows setup gaps with deep links — no mystery percent without a fix path.  
>  
> When work is live, the **KPI wall** opens — orders, production, packing, routes, webhooks, revenue — each tile jumps to the module that fixes it. **Blockers and integration risk** stay honest: if a channel is BETA, you see it here before your team does.  
>  
> Three queues — orders, tasks, routes — plus **quick jumps** to kitchen, packing, and sales channels. One screen, workspace-scoped.  
>  
> Today Command Center is our owner operating rhythm — briefing first, blockers visible, integrations labeled honestly. We’re recruiting **founding design partners**; integrations are **BETA** until smoke-certified. Book a pilot at os-kitchen.com.

---

## Timing map

| Segment | Start | End | Sec |
|---------|------:|----:|----:|
| Hook | 0:00 | 0:08 | 8 |
| Daily briefing | 0:08 | 0:22 | 14 |
| Attention + readiness | 0:22 | 0:38 | 16 |
| KPI + blockers | 0:38 | 0:55 | 17 |
| Queues + quick jumps | 0:55 | 1:08 | 13 |
| Close | 1:08 | 1:30 | 22 |
| **Total** | | | **90** |

---

## On-screen elements reference

| UI block | Component | Demo note |
|----------|-----------|-----------|
| Daily briefing hero | `OwnerDailyBriefingHero` | Lead feature — top of page |
| AI briefing panel | `AiBriefingPanel` | May stack above hero — show if visible |
| Integration health | Today page strip | Point at BETA/SKIPPED if shown |
| Attention strip | `TodayAttentionStrip` | Skip if hidden in briefing mode |
| Readiness | Progress + categories | Compact mode in briefing |
| KPI wall | `Kpi` grid | Collapsed unless busy or `?metrics=all` |
| Blockers | Amber card | Empty state OK |
| Quick jumps | Kitchen, Packing, Channels | Strong visual close before CTA |
| Live activity | `LiveActivityFeed` | **Do not claim live websocket** — refresh on load |
| Changelog banner | `ChangelogBanner` | Optional — cut for time |

---

## Forbidden on-camera claims

| Avoid | Say instead |
|-------|-------------|
| “Live DoorDash / Uber sync” | “Integration health shows BETA status” |
| “AI replaces your manager” | “Deterministic daily briefing” |
| “Proven ROI” | “Pilot program open” |
| “Thousands of customers” | “Founding design partners welcome” |
| “Real-time everything” | “Refresh to update counts” |

---

## Variants

| Variant | When | Change |
|---------|------|--------|
| **Busy kitchen** | Staging with orders/KPIs | Use full KPI + blockers segment |
| **Quiet / greenfield** | Empty demo tenant | Use “calm today” alt lines; shorten KPI segment |
| **Mobile (9:16)** | LinkedIn Reels | Record iPhone on `/dashboard/today`; briefing mode only (~60s cut) |
| **Investor** | Deck embed | Keep close honest; add “0 LIVE integrations June 2026” lower third |

---

## Post-production

| Item | Spec |
|------|------|
| Lower third (last 5s) | `os-kitchen.com` · Pilot program open |
| Captions | Required — burned-in or YouTube auto + review |
| Music | Light ambient; duck under VO |
| Export | MP4 H.264 · 1080p · <50 MB for email attach |

Upload target: website `/demo`, LinkedIn, [`founding-customer-story.md`](./founding-customer-story.md) outreach — Task 74 bus-factor “record 90s demo”.

---

## Related docs

| Doc | Use |
|-----|-----|
| [`today-command-center-mobile-audit.md`](./today-command-center-mobile-audit.md) | Mobile Reels variant |
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | Briefing module wording |
| [`founding-customer-story.md`](./founding-customer-story.md) | CTA alignment |
| [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) | Send with video link |

---

## Review log

| Date | Version |
|------|---------|
| 2026-06-02 | 1.0 — initial 90s script |

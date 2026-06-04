# Profit engine — owner margin story (sales & GTM)

**Policy:** `profit-engine-owner-margin-story-mkt15-v1`  
**Updated:** 2026-06-03  
**Audience:** Owners, GMs, sales, CS, investor demos  
**Product status:** Profit engine + food cost AI **pilot_ready** · executive profitability **BETA** · COGS accuracy **±1% when recipes seeded** (unit tests)  
**Honesty:** [`EXECUTIVE_PROFITABILITY.md`](./EXECUTIVE_PROFITABILITY.md) · [`RECIPE_COSTING.md`](./RECIPE_COSTING.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`ai-honesty-policy.md`](./ai-honesty-policy.md)

Margins shown in OS Kitchen are **operational estimates** — not tax, audit, or GAAP statements. No paying customer case study exists yet; this is the approved owner narrative for pilot recruitment.

---

## One-line pitch

**See today's margin by channel, table, and menu item — recipe COGS when configured, honest defaults when not — with alerts before food cost erodes your week.**

---

## Who this story is for

| Segment | Hook | Disqualify |
|---------|------|------------|
| **Owner-operator (1–3 sites)** | Daily margin pulse without exporting to Excel | Needs full ERP / GL replacement day one |
| **Meal prep / catering** | Batch COGS + recurring revenue estimate | Requires audited financial statements from app |
| **Ghost kitchen multi-brand** | Margin by channel in one workspace | No recipe or ingredient data at all |
| **Fast casual with recipes** | Item-level margin warnings | Zero interest in costing setup |

---

## Story arc (2 minutes)

### 1 — The pain (25s)

Owners learn food cost moved **after** the week closes — spreadsheet exports, accountant lag, surprise vendor invoices. POS shows revenue; it does not show **which menu items lost margin yesterday**. Kitchen fixes tickets; finance fixes margins — too late.

### 2 — The wedge (30s)

OS Kitchen links **recipe costing** to **live orders** when product COGS is configured. The **profit engine** refreshes on a 30-second cadence: revenue, estimated cost, margin by order, channel, table, and server. **Food Cost AI** (pilot_ready, deterministic — not magic AGI) flags items drifting above target. **Executive profitability** summarizes median margin and at-risk SKUs — always labelled estimate.

### 3 — What owners see today (35s)

| Surface | Route | What it shows |
|---------|-------|---------------|
| **Today profit** | `/dashboard/today/profit` | Real-time profit dashboard + engine breakdown |
| **Food cost AI** | `/dashboard/analytics/food-cost` | Item analysis, alerts, trend — honesty banner |
| **Executive view** | `/dashboard/executive/profitability` | Margin median, at-risk count, purchasing signals |

**Demo path:** Open Today profit → expand channel row → jump to food cost alert → show AiHonestyBanner on food-cost-ai.

**Say explicitly:** Without recipes, engine uses **default food-cost ratio (32%)** — show the label; do not imply SKU-level accuracy until COGS is seeded.

### 4 — Pilot proof path (20s)

Unit tests validate **±1% margin** when ingredients, labor, and packaging are seeded (`tests/unit/profit-margin-accuracy.test.ts`). Staging E2E covers margin alert policy (`e2e/profit-dashboard-margin-alert.spec.ts`). Pilot operators configure 10–20 hero SKUs in week one — CS captures before/after food cost % in pilot notes.

### 5 — Honest close (10s)

We are recruiting design partners to prove owner margin visibility in real service — not claiming QuickBooks replacement or guaranteed savings. Book a fit call; we screen-share profit surfaces with BETA badges visible.

---

## Approved demo script (30 seconds)

> "Open **Today profit** — you see margin refreshing from today's orders. When recipes are configured, COGS comes from your ingredient costs; otherwise we show a labelled default ratio. **Food cost AI** flags items crossing your target — deterministic math, not black-box AI. Executive profitability rolls up median margin and at-risk SKUs. These are operational estimates for daily decisions — your accountant still owns GAAP."

---

## Owner outcomes (pilot targets — not verified)

| Metric | Pilot target | Source |
|--------|--------------|--------|
| Hero SKUs with recipe COGS | ≥ 10 in week 1 | Costing module |
| Owner opens profit view | ≥ 3× / week | Product analytics |
| Food cost alert acknowledged | ≥ 1 action / week | Alert log |
| Median margin delta vs baseline | Track — no claim | Pilot notes artifact |
| Margin accuracy vs hand calc | ±1% on seeded SKUs | Unit test contract |

---

## Outbound snippets

### Email subject

**Which menu items lost margin yesterday?**

### Email body (Touch 1)

> Hi {{first_name}},
>
> Most {{segment}} owners see revenue in POS but food cost in a spreadsheet a week later.
>
> OS Kitchen ties **recipe costing** to live orders when configured — **Today profit** shows margin by channel and item with honest BETA labels. Food Cost AI flags drift; executive view summarizes at-risk SKUs. Operational estimates — not tax advice.
>
> Worth a 15-minute owner walkthrough? Reply **margin** or book: {{base_url}}/book-demo
>
> — {{sender}}

### LinkedIn DM

> {{first_name}} — quick owner question: do you know yesterday's margin by menu item without exporting to Excel?
>
> We built profit engine + food cost alerts on recipe COGS when configured — honest defaults when not. Happy to show a 5-min staging demo with BETA badges visible.

---

## Forbidden claims

| Never say | Say instead |
|-----------|-------------|
| Guaranteed ROI / savings | Operational margin estimates |
| 100% accurate margins | ±1% when COGS seeded; default ratio otherwise |
| AI predicts perfect food cost | Food Cost AI — deterministic, pilot_ready |
| Replaces QuickBooks / accountant | Links to costing; not GAAP |
| Real-time guaranteed (legal SLA) | ~30s refresh cadence |
| Magic AGI manager | Recipe math + alerts |
| Audited financial statements | Executive estimate labels |

Enforced via `npm run verify-claims` and [`forbidden-claims-training.md`](./forbidden-claims-training.md).

---

## Demo flow (8 minutes)

1. **`/dashboard/today/profit`** — summary cards, channel breakdown (3 min).  
2. **`/dashboard/analytics/food-cost`** — item table, alert row, honesty banner (3 min).  
3. **`/dashboard/executive/profitability`** — margin median, at-risk count (1 min).  
4. **Close** — pilot LOI, recipe setup in week 1 (1 min).

**Fallback:** If demo workspace lacks recipes, state default ratio explicitly — credibility beats fake precision.

---

## Related assets

| Asset | Use |
|-------|-----|
| [`lib/marketing/profit-engine-owner-margin-story-policy.ts`](../lib/marketing/profit-engine-owner-margin-story-policy.ts) | Policy + lint |
| [`services/analytics/profit-engine-service.ts`](../services/analytics/profit-engine-service.ts) | Engine snapshot |
| [`components/analytics/real-time-profit-dashboard.tsx`](../components/analytics/real-time-profit-dashboard.tsx) | Today profit UI |
| [`lib/analytics/profit-dashboard-margin-visualization-policy.ts`](../lib/analytics/profit-dashboard-margin-visualization-policy.ts) | DES-19 viz |
| [`demo-video-script-5min.md`](./demo-video-script-5min.md) | Act 7 profit segment |

---

## Review log

| Date | Version |
|------|---------|
| 2026-06-03 | 1.0 — MKT-15 initial owner margin story |

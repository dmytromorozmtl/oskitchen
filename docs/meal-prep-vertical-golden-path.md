# Meal prep vertical golden path — OS Kitchen

**Policy:** `meal-prep-vertical-golden-path-absolute-final-v1`  
**Date:** 2026-06-06  
**Audience:** Sales, product, founder demos, design-partner onboarding  
**Status:** **Canonical GTM + operator path** — pre-revenue baseline, 0 signed LOIs  
**Related:** [`icp-definition-final.md`](./icp-definition-final.md) · [`meal-prep-os-era189-setup.md`](./meal-prep-os-era189-setup.md) · [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md)

This document is the **single golden path** for the meal-prep vertical: product brief, ICP fit, demo script, and pricing guidance. Use it before outbound, discovery calls, and pilot Week 1 kickoff.

**Honesty rule:** Meal prep is **Wave 1 outreach priority** — not “production certified for all tenants.” Label BETA modules, SKIPPED integrations, and pilot scope in every conversation.

---

## Product brief

### Problem

Weekly meal-prep operators run **menu → cutoff → production → packing → handoff** across Shopify/Woo, spreadsheets, and paper tickets. Scaling from ~200 to ~800 meals/week breaks spreadsheet versioning, causes mis-picks, and hides true committed demand until it is too late to adjust batch sizes.

### OS Kitchen wedge

Software-first **kitchen OS** for operators who **own fulfillment** — not a Toast/Square hardware replacement.

| Capability | Meal-prep value | Maturity label |
|------------|-----------------|----------------|
| Weekly menu + preorder storefront | Publish menu, enforce cutoff before production day | **LIVE** when Stripe Connect configured |
| Order hub | Single queue for storefront, manual, and channel imports | **LIVE** |
| Production board | Batch quantities from confirmed orders | **LIVE** — yield-aware when recipes configured |
| Packing + labels | Lane sheets, verification before handoff | **LIVE** — printer workflow varies by pilot |
| Meal Prep OS dashboard | Menus, cutoffs, forecasting, subscription KPIs | **BETA** — four module cards |
| Counter POS add-ons | Same-day sales alongside weekly preorders | **BETA** — in-browser, network-dependent |
| Native subscription billing | Blue Apron-style recurring engine | **SKIPPED** — Woo Subscriptions bridge read-only |
| Marketplace delivery live ops | DoorDash/Uber dispatch | **SKIPPED** — partner-gated |

### Product promise (sales-safe)

> “One order hub and production queue from weekly menu cutoff through packed handoff — with honest BETA labels on subscription bridge and channel depth.”

### Anti-promise (do not claim)

- Native meal-plan subscription parity with Woo/Stripe billing on day one  
- Rush-hour KDS SLA or offline card capture  
- “Thousands of operators” or production-certified for all integrations  

---

## ICP

**Canonical segment:** [`icp-definition-final.md` § Segment 3 — Meal prep](./icp-definition-final.md#segment-3--meal-prep)

### Ideal operator profile

| Attribute | Range |
|-----------|-------|
| Model | Weekly menu or subscription-oriented; cutoff → production → pickup/delivery |
| Volume | 100–5,000 meals/week |
| Locations | ≤5 (pilot scope) |
| Channels | Owned Shopify/Woo, Instagram/WhatsApp manual, optional walk-in counter |
| Staff | 2–15 kitchen + 1 ops owner |
| Tech today | Spreadsheets + channel storefront + separate label workflow |

### Qualification gates (Era 17)

**Must pass all:**

1. Single-location or small multi-unit (≤5).  
2. Owner or ops lead engaged — weekly pilot check-ins.  
3. Needs order hub + production + packing path.  
4. Accepts **BETA / SKIPPED** badges on subscription bridge and live marketplace ops.

**Hard disqualifiers:**

- Pure dropship meal kit (no owned kitchen).  
- Demands native subscription billing parity day one.  
- QSR replacing Toast hardware — wrong wedge.

### Discovery questions

1. Weekly menu + cutoff, or rolling subscription?  
2. Shopify, Woo, or manual-only today?  
3. Pickup-only, delivery, or both?  
4. Will you accept **BETA** on subscription bridge features?

### Landing alignment

| Surface | URL |
|---------|-----|
| Primary landing | `/meal-prep-software` |
| ICP landing | `/landing/meal-prep` |
| Preorder variant | `/landing/weekly-preorder` |
| Compare page | `/compare/meal-prep-software` |
| Dashboard | `/dashboard/meal-prep` |

---

## Demo

### Golden demo scenario

**Scenario id:** `meal-prep-weekly`  
**Title:** Meal prep weekly operations  
**Seed plan:** [`lib/demo/golden-demo-scenarios.ts`](../lib/demo/golden-demo-scenarios.ts)

| Step | Demo artifact | Narrative |
|------|---------------|-----------|
| 1 | Workspace preset | Meal prep mode, weekly menus, demo flag |
| 2 | Menu + SKUs | Two menu windows — portioned mains and sides |
| 3 | Preorder orders | Pickup + delivery mix with realistic totals |
| 4 | Production workload | Batch prep sized for committed demand |
| 5 | Packing labels | Outbound bags when vertical emits packing tasks |
| 6 | Delivery route | Stops when delivery path exists in fixture |
| 7 | Today counters | Order volume on Today after refresh |

**Safety notes:** Ingredient demand and AvT HIGH confidence require real receiving and recipes beyond the fixture.

### 20-minute founder demo script

| Min | Screen | Talk track |
|-----|--------|------------|
| 0–2 | `/landing/meal-prep` | Problem: spreadsheet breakage at weekly menu scale |
| 2–5 | Seed `meal-prep-weekly` | “This is fixture data — your pilot uses real menus” |
| 5–8 | `/dashboard/meal-prep` | Four modules: weekly menu, cutoffs, forecasting, subscriptions |
| 8–12 | Order hub + production | Confirmed demand → batch board; no guessing quantities |
| 12–15 | Packing + pickup windows | Lane sheets; verification before handoff |
| 15–18 | `/dashboard/today` | Owner briefing — GO/NO-GO chip, integration honesty |
| 18–20 | Pilot scope + LOI | 90-day design partner, staging → production, BETA labels |

### Demo activation checklist

- [ ] Staging workspace with `DEMO_MODE_ENABLED`  
- [ ] Run golden seed: scenario `meal-prep-weekly`  
- [ ] Open `/dashboard/meal-prep` — verify four module cards  
- [ ] Walk order hub → production → packing  
- [ ] Run `npm run smoke:meal-prep-os-era189` — artifact **PASSED**  
- [ ] Record time-to-first-order for pilot metrics baseline  

### Certification scripts

| Script | Purpose |
|--------|---------|
| `npm run smoke:meal-prep-os-era189` | Era189 wiring + module cert |
| `npm run test:ci:meal-prep-os-era189:cert` | CI gate (meal prep OS) |
| `npm run smoke:pilot-operator-golden-path` | Tier 2 operator checklist (cross-vertical) |

---

## Pricing

**Source of truth:** [`transparent-pricing-sales-guide.md`](./transparent-pricing-sales-guide.md) · [`/pricing`](../app/pricing/page.tsx)

### Recommended plan for meal prep

| Plan | Monthly | Fit |
|------|---------|-----|
| **Pro** | **$79/mo** | **Default recommendation** — meal prep, catering, Shopify/Woo |
| Starter | $49/mo | Single-location ≤100 orders/mo, counter-light |
| Team | $199/mo | Multi-channel, forecasting modules, Uber integrations |
| Enterprise | $499/mo list | Multi-location, API, SLA — scoped SOW only |

**Trial:** 14 days on Pro/Team — no card at signup on published tiers.

### Pilot pricing (design partners)

| Offer | Terms | Gate |
|-------|-------|------|
| **90-day design partner** | Staging → production, weekly feedback | Signed LOI — see [`loi-design-partner-template.md`](./loi-design-partner-template.md) |
| **Free pilot tier (first 5)** | 90-day Pro/Team waiver with signed LOI | [`free-pilot-tier-program.md`](./free-pilot-tier-program.md) |

**Do not quote** custom MRR or “free forever” without founder approval and LOI appendix.

### Competitor framing (honest)

| Competitor | Their wedge | Our counter |
|------------|-------------|-------------|
| Toast / Square | In-store POS + hardware | Software-first weekly production + packing — no terminal lease |
| Meal prep point solutions | Subscription UX only | Full kitchen OS — order hub through handoff |
| Spreadsheets + Shopify | Low cost | Cutoff enforcement + production quantities from confirmed orders |

See [`competitive-battle-cards.md`](./competitive-battle-cards.md) BC rows for Square and meal-prep compare paths.

---

## Operator golden path (post-sale)

```mermaid
flowchart LR
  A[T-0 Kickoff] --> B[Weekly menu]
  B --> C[Cutoff lock]
  C --> D[Storefront preorders]
  D --> E[Production board]
  E --> F[Packing + labels]
  F --> G[Pickup / delivery]
  G --> H[Today briefing]
```

| Day | Milestone | Dashboard path |
|-----|-----------|----------------|
| T-0 | Workspace + meal prep mode | Launch wizard / settings |
| T+1 | First weekly menu published | `/dashboard/menus` |
| T+2 | Cutoff + storefront live | `/dashboard/meal-prep` |
| T+3 | First production run from confirmed orders | Production board |
| T+5 | Packing verification drill | Packing module |
| T+7 | Owner Week 1 briefing | `/dashboard/today` |

**Pilot Week 1 detail:** [`pilot-week1-roadmap.md`](./pilot-week1-roadmap.md)

---

## Wiring index

| Asset | Path |
|-------|------|
| Policy | `lib/marketing/meal-prep-vertical-golden-path-absolute-final-policy.ts` |
| Audit | `lib/marketing/meal-prep-vertical-golden-path-audit.ts` |
| Meal Prep OS service | `services/meal-prep/meal-prep-os-service.ts` |
| Golden demo | `lib/demo/golden-demo-scenarios.ts` → `meal-prep-weekly` |
| Landing | `app/meal-prep-software/page.tsx` · `app/landing/meal-prep/page.tsx` |
| CI cert | `npm run test:ci:meal-prep-vertical-golden-path:cert` |

---

## Changelog

| Version | Date | Notes |
|---------|------|-------|
| `meal-prep-vertical-golden-path-absolute-final-v1` | 2026-06-06 | Task 69 — product brief, ICP, demo, pricing golden path |

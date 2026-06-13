# Design partner outreach — 20 operators (Montreal + Canada)

**Policy:** `design-partner-outreach-p1-25-v1`  
**Updated:** 2026-06-13  
**Owner:** Founder + Sales  
**Status:** internal research list — **not contacted** unless CRM status changes  
**Related:** [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) · [`loi-design-partner-template.md`](./loi-design-partner-template.md) · [`pilot-icp-contract-template-era17.md`](./pilot-icp-contract-template-era17.md)

---

## Honesty rule

This is an **internal research target list** for the founding design partner cohort.

> Internal research list only — not contacted unless status changes in CRM. No customer logos or KPI claims until a countersigned LOI is on file.

Do **not**:

- Claim these operators as customers, logos, or case studies
- Send cold spam at scale without qualification
- Mark a row **contacted** until a human logs first outreach in CRM

**Design partner program:** ≤5 founding slots this quarter — see [`loi-design-partner-template.md`](./loi-design-partner-template.md).

**Today:** **0 signed founding customers** · all rows **`research_target`** · integrations and marketplace remain **BETA** until pilot proof.

Canonical machine-readable list: `lib/marketing/design-partner-outreach-content.ts` (20 operators).

---

## Qualification before outreach

| Gate | Required |
|------|:--------:|
| ICP segment (meal prep, ghost kitchen, commissary, ≤5 locations in pilot scope) | **Y** |
| Owner/ops lead available for weekly 30–45 min feedback | **Y** |
| Accepts honest **BETA** / **SKIPPED** integration labels | **Y** |
| Completed forbidden claims training (when P1-26 ships) | **Y** |
| LOI template reviewed with operator before production traffic | **Y** |

Use [`design-partner-email-sequence.md`](./design-partner-email-sequence.md) after warm intro or inbound `/book-demo` — not unsolicited bulk email.

---

## Segment mix (20 operators)

| Segment | Count | Primary pain hook |
|---------|------:|-------------------|
| Meal prep | 6 | Weekly cutoff → production list → packing |
| Ghost kitchen | 4 | Multi-brand ingest → one KDS + marketplace honesty |
| Commissary / incubator | 3 | Tenant routing + per-brand Integration Health |
| Multi-unit QSR | 4 | Location rollup without fake green tiles |
| Catering | 1 | Quote-to-production for event day |
| **Montreal / QC total** | **13** | Founder timezone overlap — prioritize first |

---

## Outreach list

| # | ID | Operator | City | Prov | Segment | ICP | Status | Outreach hook |
|---|-----|----------|------|------|---------|-----|--------|---------------|
| 1 | `goodfood-mtl` | Goodfood Market Corp | Montreal | QC | meal_prep | medium | research_target | Weekly menu + subscription cutoffs — order hub + Integration Health |
| 2 | `oatbox-mtl` | Oatbox | Montreal | QC | multi_unit | high | research_target | Multi-location prep + retail SKU sync — Today Command Center |
| 3 | `mandys-mtl` | Mandy's Gourmet Salads | Montreal | QC | multi_unit | high | research_target | Salad prep scaling — KDS + par-level signals |
| 4 | `copper-branch-mtl` | Copper Branch | Montreal | QC | multi_unit | medium | research_target | Franchise ops truth — honest Integration Health |
| 5 | `lov-mtl` | LOV Restaurants | Montreal | QC | multi_unit | high | research_target | Plant-based multi-unit — channel orders into one kitchen screen |
| 6 | `dynamite-cuisine-mtl` | Dynamite Cuisine | Montreal | QC | meal_prep | high | research_target | Weekly meal prep volume — preorder cutoff → production list |
| 7 | `les-plats-du-chef-mtl` | Les Plats du Chef | Montreal | QC | meal_prep | high | research_target | Subscription meal prep — webhook → KDS without spreadsheet bridge |
| 8 | `cuisine-municipale-mtl` | Cuisine Collective (Montreal shared kitchen) | Montreal | QC | commissary | high | research_target | Commissary tenant routing — multi-brand KDS |
| 9 | `foodlab-mtl` | FoodLab Montreal | Montreal | QC | commissary | high | research_target | Incubator cohort pilot — one OS for member order hub |
| 10 | `ghost-kitchen-mtl-archetype` | Montreal virtual-brand operator | Montreal | QC | ghost_kitchen | high | research_target | DoorDash/Uber SKIPPED honesty — see exactly why ingest failed |
| 11 | `mtl-meal-prep-archetype` | Montreal Sunday-batch meal prep operator | Montreal | QC | meal_prep | high | research_target | Sunday cutoff chaos — weekly menu publish + tray packing |
| 12 | `mtl-catering-archetype` | Montreal corporate catering operator | Montreal | QC | catering | high | research_target | Quote-to-production — catering quotes + KDS bump |
| 13 | `quebec-city-catering` | Québec City catering / commissary operator | Québec City | QC | commissary | high | research_target | French-first ops UI — commissary landing + production routing |
| 14 | `fresh-city-tor` | Fresh City | Toronto | ON | meal_prep | medium | research_target | Organic meal prep subscription — integration health for storefront |
| 15 | `chef-on-call-can` | Chef On Call | Toronto | ON | meal_prep | high | research_target | Multi-city prep routing — workspace-per-hub rollup |
| 16 | `ghost-kitchen-brands-can` | Ghost Kitchen Brands (Canada) | Toronto | ON | ghost_kitchen | medium | research_target | Multi-brand order hub — Integration Health Center moat |
| 17 | `kitchen-hub-tor` | Kitchen Hub | Toronto | ON | ghost_kitchen | high | research_target | Aggregator ingest → one KDS — webhook signature visibility |
| 18 | `ottawa-meal-prep-archetype` | Ottawa-Gatineau meal prep operator | Ottawa | ON | meal_prep | high | research_target | Bilingual storefront + weekly prep — honest BETA labels |
| 19 | `vancouver-meal-prep-archetype` | Vancouver BC meal prep operator | Vancouver | BC | meal_prep | high | research_target | Pacific timezone pilot — Shopify ingest + KDS |
| 20 | `calgary-multi-brand` | Calgary multi-brand cloud kitchen operator | Calgary | AB | ghost_kitchen | high | research_target | Alberta delivery mix — profit engine + commission comparison |

Rows **10, 11, 12, 18, 19, 20** are **archetype placeholders** — replace with named operators after event/LinkedIn research. Never present archetypes as signed partners.

---

## Recommended outreach order

1. **High ICP + Montreal QC** — rows 6–9, 11 (single-location meal prep / commissary)
2. **Multi-unit Montreal ≤5 pilot scope** — rows 3, 5 (qualify location count first)
3. **Canada expansion** — rows 14–17 after first Montreal LOI progress
4. **Archetype rows** — fill names from MTL Food Entrepreneurs, FoodLab alumni, IFEQ

---

## CRM status workflow

| Status | Meaning | Next action |
|--------|---------|-------------|
| `research_target` | Listed here only | Qualify against ICP gates |
| `contacted` | First email or call logged | Send email sequence Day 0 |
| `declined` | Not now / bad fit | Archive with reason |

Update `lib/marketing/design-partner-outreach-content.ts` when status changes — doc table mirrors content file.

---

## CI

```bash
npm run audit:design-partner-outreach
npm run check:design-partner-outreach
```

Policy: `design-partner-outreach-p1-25-v1`

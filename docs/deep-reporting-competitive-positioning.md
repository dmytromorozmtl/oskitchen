# Deep Reporting — Competitive Positioning & Sales Guide

**Status:** Production-ready — 100+ report catalog, search, filters, custom builder  
**Audience:** Sales, operators comparing SpotOn / Toast / legacy POS reporting  
**Technical:** [`report-catalog-service.ts`](../services/analytics/report-catalog-service.ts) · [`/dashboard/reports/catalog`](../app/dashboard/reports/catalog/page.tsx)

---

## One-line pitch

**SpotOn gives you 12 canned reports. We catalogue 100+ — search, filter, build your own.**

---

## Positioning headline

> **Your GM shouldn't need a data analyst to answer "how did Tuesday compare to last Tuesday?"**

---

## Competitor comparison

| Platform | Report count (marketing) | Custom builder | Searchable catalog | Export |
|----------|-------------------------|----------------|-------------------|--------|
| SpotOn | ~12 standard | ❌ | ❌ | CSV |
| Toast | ~20 (tier-gated) | ⚠️ Enterprise | Partial | CSV / PDF addon |
| Square | ~8 | ❌ | ❌ | CSV |
| **OS Kitchen** | **100+ catalogued** | **✅ Builder UI** | **✅ Full-text search** | **CSV / PDF / XLSX** |

| Capability | SpotOn | Toast Enterprise | **OS Kitchen** |
|------------|--------|------------------|----------------|
| Sales by hour / daypart | Partial | ✅ | **✅ Catalog + builder** |
| Labor % by role / location | Addon | ✅ | **✅ 20 labor reports** |
| Inventory variance / 86 history | ❌ | Partial | **✅ 15 inventory reports** |
| Executive weekly / monthly | ❌ | ✅ | **✅ Wired + catalog** |
| Recommended by role | ❌ | ❌ | **✅ Owner / manager / ops** |
| Recently run shortcuts | ❌ | Partial | **✅ From registry** |
| Custom metrics + group-by | ❌ | ⚠️ Paid | **✅ `/catalog/builder`** |

---

## What ships today (evidence)

| Capability | Evidence |
|------------|----------|
| 100+ report catalog | `reportCatalogCount()` ≥ 100 in `report-catalog-service.ts` |
| Category filters | Sales (28), Labor (20), Inventory (15), Finance (17), Customers (15), Operations (12) |
| Full-text search | `searchReportCatalog()` + `ReportCatalogClient` |
| Recommended for role | `getRecommendedReportsForRole()` on catalog page |
| Recently run | `getRecentlyRunReportKeys()` + registry fallback |
| Wired reports (19) | Linked via title match to `REPORT_REGISTRY` |
| Custom report builder | `/dashboard/reports/catalog/builder` |
| Classic library | `/dashboard/reports/library` (existing 19 wired runners) |
| Unit tests | `tests/unit/report-catalog-service.test.ts` |

**Honesty:** Catalog templates beyond the 19 wired registry reports are honest previews — they appear in search with `catalog_template` status until a runner ships. Sales should say "100+ reports in catalog; 19 export-ready today, rest on roadmap or via custom builder preview."

---

## Sales pitch (30 seconds)

> "SpotOn ships about a dozen standard reports — if you want labor by role and sales by daypart in one view, you're exporting CSVs and merging in Excel. OS Kitchen catalogues over a hundred reports across sales, labor, inventory, finance, customers, and operations. Search by keyword, filter by category, get recommendations based on whether you're the owner or floor manager, and use the custom builder to pick metrics, date range, locations, and export format. Nineteen reports export today; the rest are catalogued with clear paths so you're never guessing what's available."

---

## Safe sales wording

**Allowed:**

- "100+ reports catalogued across six categories"
- "Searchable report catalog with role-based recommendations"
- "Custom report builder for metrics, group-by, and export format"
- "19 wired reports export CSV/PDF today via the classic library"
- "Executive weekly and monthly summaries included"

**Not allowed:**

- "Every catalog report exports live data today"
- "SpotOn parity on all 100 reports"
- "Real-time BI / Looker replacement"
- "Unlimited custom SQL reports"

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "SpotOn reports are enough" | "For a single location with simple needs, maybe. Multi-channel kitchens need labor, inventory, and channel mix in one place — that's why we catalogue 100+ instead of 12." |
| "Toast has reporting" | "Toast gates deeper reporting behind enterprise tiers. Our catalog is included — search 'overtime' or '86 history' and see what's available before you upgrade elsewhere." |
| "Can I get any report I want?" | "Custom builder lets you combine metrics and dimensions; wired exports cover the 19 most common operational and financial reports today. New runners ship from catalog demand." |

---

## Next steps for sales

1. Demo `/dashboard/reports/catalog` — search "labor", show category filter, open recommended section.
2. Show one wired report from catalog (e.g. Sales by channel) → classic generator.
3. Open custom builder — pick revenue + orders, group by day, export PDF preview.
4. Contrast with SpotOn's fixed report list (12) using the comparison table above.

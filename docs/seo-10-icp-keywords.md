# SEO — 10 ICP keywords

**Policy:** `seo-10-icp-keywords-mkt20-v1`  
**Updated:** 2026-06-03  
**Owner:** Marketing + Engineering  
**Scope:** Primary organic keyword targets for P0 ICP segments (ghost kitchen, commissary, meal prep) + cross-ICP ops terms  
**Code source of truth:** `lib/marketing/seo-10-icp-keywords-policy.ts`  
**Related:** [`icp-definition-final.md`](./icp-definition-final.md) · [`seo-audit.md`](./seo-audit.md) · [`SEO_CONTENT_PLAN.md`](./SEO_CONTENT_PLAN.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

Ten **canonical primary keywords** for pilot-era SEO — not a 200-keyword enterprise program. Each maps to one landing URL, honest meta copy, and claims-safe secondary terms.

**Honesty rule:** Do not optimize title tags or H1s for forbidden phrases. No fake rankings, customer counts, or LIVE integration claims in meta descriptions.

---

## Ten canonical ICP keywords

| # | Primary keyword | ICP segment | Target URL | Intent |
|---|-----------------|-------------|------------|--------|
| 1 | ghost kitchen software | Ghost kitchen | `/solutions/ghost-kitchens` | Commercial |
| 2 | meal prep software | Meal prep | `/meal-prep-software` | Commercial |
| 3 | commissary kitchen software | Commissary | `/commissary-kitchen-software` | Commercial |
| 4 | weekly meal prep software | Meal prep | `/landing/weekly-preorder` | Commercial |
| 5 | virtual brand kitchen software | Ghost kitchen | `/landing/ghost-kitchen` | Commercial |
| 6 | shopify meal prep software | Meal prep | `/shopify` | Commercial |
| 7 | kitchen display system software | Cross-ICP | `/product` | Commercial |
| 8 | restaurant order management software | Cross-ICP | `/product` | Commercial |
| 9 | food production planning software | Cross-ICP | `/resources/kitchen-production-planning` | Informational |
| 10 | catering production software | Secondary ICP | `/solutions/catering` | Commercial |

**P0 coverage:** keywords 1–6 map directly to [`icp-definition-final.md`](./icp-definition-final.md) ghost kitchen, commissary, and meal prep segments. Keywords 7–10 support discovery without diluting ICP focus.

---

## Keyword matrix

### 1 — ghost kitchen software

| Field | Value |
|-------|-------|
| **Primary** | ghost kitchen software |
| **Secondary** | virtual brand management · multi brand restaurant software · cloud kitchen operations |
| **Title pattern** | Ghost Kitchen Software — Multi-Brand Command Center \| OS Kitchen |
| **Meta pattern** | Operate virtual brands from one kitchen. Order hub, KDS, and production with honest BETA integration labels. |
| **H1 alignment** | Match `/solutions/ghost-kitchens` — do not claim Deliverect or aggregator parity |
| **Internal links** | `/landing/ghost-kitchen` · `/compare` · `/ai` |

### 2 — meal prep software

| Field | Value |
|-------|-------|
| **Primary** | meal prep software |
| **Secondary** | meal prep order management · meal delivery software · weekly meal prep platform |
| **Title pattern** | Meal Prep Software — Weekly Menus, Production & Packing |
| **Meta pattern** | Weekly menus, preorder cutoffs, production quantities, and packing — without spreadsheet chaos. |
| **Existing config** | `lib/marketing/solution-seo.ts` → `meal-prep` |

### 3 — commissary kitchen software

| Field | Value |
|-------|-------|
| **Primary** | commissary kitchen software |
| **Secondary** | shared kitchen software · commissary production management · multi-tenant kitchen ops |
| **Title pattern** | Commissary Kitchen Software — Shared Production & Order Hub |
| **Meta pattern** | Batch prep, packing, and multi-brand production for commissary operators — software-first, no hardware lease. |
| **Note** | Dedicated landing at [`/commissary-kitchen-software`](/commissary-kitchen-software) — multi-tenant production and B2B marketplace (BETA) |

### 4 — weekly meal prep software

| Field | Value |
|-------|-------|
| **Primary** | weekly meal prep software |
| **Secondary** | weekly menu software · preorder cutoff software · subscription meal prep |
| **Target** | `/landing/weekly-preorder` |
| **CTA** | `/book-demo?utm_source=seo&utm_medium=organic&utm_campaign=weekly_meal_prep_mkt20` |

### 5 — virtual brand kitchen software

| Field | Value |
|-------|-------|
| **Primary** | virtual brand kitchen software |
| **Target** | `/landing/ghost-kitchen` |
| **Differentiator** | Multi-brand P&L + shared KDS — honest channel maturity |

### 6 — shopify meal prep software

| Field | Value |
|-------|-------|
| **Primary** | shopify meal prep software |
| **Target** | `/shopify` |
| **Honesty** | Custom app (beta) — not App Store OAuth parity in meta copy |

### 7 — kitchen display system software

| Field | Value |
|-------|-------|
| **Primary** | kitchen display system software |
| **Target** | `/product` — KDS section |
| **Honesty** | Software KDS on existing screens — not proprietary hardware bundle |

### 8 — restaurant order management software

| Field | Value |
|-------|-------|
| **Primary** | restaurant order management software |
| **Target** | `/product` — Order Hub section |
| **Honesty** | Unified hub — channel LIVE status varies per Integration Health |

### 9 — food production planning software

| Field | Value |
|-------|-------|
| **Primary** | food production planning software |
| **Target** | `/resources/kitchen-production-planning` |
| **Intent** | Informational — link to trial/demo in CTA, not fake case studies |

### 10 — catering production software

| Field | Value |
|-------|-------|
| **Primary** | catering production software |
| **Target** | `/solutions/catering` |
| **Existing config** | `lib/marketing/solution-seo.ts` → `catering` |

---

## On-page checklist (per keyword)

| Step | Action |
|------|--------|
| 1 | Primary keyword in `<title>` (≤60 chars) and meta description (≤155 chars) |
| 2 | One H1 on target page — natural, not stuffed |
| 3 | Secondary keyword in first paragraph or feature card |
| 4 | Internal link to `/trust` when mentioning BETA integrations |
| 5 | JSON-LD via existing `marketingPageMetadata` / FAQ schema where present |
| 6 | Run `lintSeo10IcpKeywordsCopy()` on new meta drafts |
| 7 | Submit URL in sitemap via `lib/marketing/sitemap-urls.ts` |
| 8 | UTM on CTAs: `utm_source=seo&utm_medium=organic&utm_campaign={keyword_id}_mkt20` |

---

## Forbidden SEO phrases

Never use in titles, meta descriptions, or H1s:

| Forbidden | Why |
|-----------|-----|
| #1 restaurant software | Unverifiable superlative |
| best POS in America | Unverifiable superlative |
| replace Toast guaranteed | Competitor + guarantee |
| trusted by thousands | No customer proof |
| SOC 2 certified POS | Not attested |
| Uber Eats official partner | Partner-gated |
| fully integrated DoorDash | LIVE overclaim |
| guaranteed ROI | Financial guarantee |

Also avoid keyword stuffing (repeat primary >3× in body). Pass all copy through `MARKETING_CLAIMS_STRICT=1 npm run verify-claims`.

---

## Measurement (post-deploy)

| Metric | Tool | Target (directional) |
|--------|------|----------------------|
| Impressions per primary keyword | Google Search Console | Baseline month 1 |
| CTR from ICP landing URLs | GSC + GA4 | ≥2% branded + non-branded |
| Organic demo bookings | UTM `utm_source=seo` | ≥3/month after index |
| Index coverage | GSC sitemap | 10/10 target URLs indexed |

No ranking guarantees in internal OKRs until 90 days of GSC data.

---

## Implementation map

| Keyword ID | Metadata file to update |
|------------|-------------------------|
| `ghost-kitchen-software` | `lib/marketing/solution-seo.ts` → `ghost-kitchens` |
| `meal-prep-software` | `solution-seo.ts` → `meal-prep` |
| `commissary-kitchen-software` | `app/commissary-kitchen-software/page.tsx` |
| `weekly-meal-prep-software` | `icp-landing-content.ts` → `weekly-preorder` |
| `virtual-brand-kitchen-software` | `icp-landing-content.ts` → `ghost-kitchen` |
| `shopify-meal-prep-software` | `shopify-bundle-content.ts` |
| `kitchen-display-system-software` | `/product` page metadata |
| `restaurant-order-management-software` | `/product` page metadata |
| `food-production-planning-software` | resource page metadata |
| `catering-production-software` | `solution-seo.ts` → `catering` |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`seo-audit.md`](./seo-audit.md) | Technical SEO gaps |
| [`linkedin-content-plan.md`](./linkedin-content-plan.md) | Social distribution of resource pages |
| [`geo-cities.ts`](../lib/marketing/geo-cities.ts) | Local keyword variants |
| [`google-ads-landings.ts`](../lib/marketing/google-ads-landings.ts) | Paid counterpart — do not duplicate forbidden copy |

**Policy export:** `SEO_10_ICP_KEYWORDS` in `lib/marketing/seo-10-icp-keywords-policy.ts`

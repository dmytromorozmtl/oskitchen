# SEO audit — OS Kitchen public marketing

**Policy:** `seo-audit-v1`  
**Date:** 2026-06-02  
**Owner:** Marketing + Engineering  
**Scope:** Organic discoverability for public marketing, ICP, integrations, blog, and geo pages  
**Related:** [`SEO_CONTENT_PLAN.md`](./SEO_CONTENT_PLAN.md) · [`seo-10-icp-keywords.md`](./seo-10-icp-keywords.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`navigation-audit.md`](./navigation-audit.md) · [`accessibility-audit.md`](./accessibility-audit.md)

This audit inventories **technical SEO**, **on-page metadata**, **sitemap coverage**, and **content/claims alignment** — not paid search or Search Console history (no GSC export on file as of June 2026).

**Honesty rule:** SEO copy must pass the same claims gate as sales materials. Do not optimize for forbidden phrases or fake customer proof.

---

## Executive summary

| Area | Grade | Notes |
|------|:-----:|-------|
| **Technical foundation** | B | Next.js `sitemap.ts` + `robots.ts`; canonical via `marketingPageMetadata` |
| **Structured data** | B+ | Organization, SoftwareApplication, WebSite globally; FAQ/Breadcrumb on key landings |
| **Sitemap completeness** | C+ | ~90+ URLs; **gaps** on new `/shopify`, `/vendor`, 2 blog posts, `/changelog` |
| **Metadata consistency** | B− | Most marketing routes use helper; homepage + changelog use root/minimal metadata |
| **Index hygiene** | B | Paid `/lp/*` noindex ✓; vendor cabinet/register **indexable** — should noindex |
| **Content / claims SEO** | B | ICP pages updated (Task 64); geo pages need delivery-integration qualifier review |
| **Performance / CWV** | Not measured | Task 79 — bundle regression CI pending |

**Top 5 actions (P0):**

1. Add `/shopify`, `/vendor`, missing blog slugs, `/changelog` to `lib/marketing/sitemap-urls.ts`
2. `noIndex: true` on `/vendor/register`, `/vendor/(cabinet)/*`, `/vendor/register/status`
3. Align homepage root metadata with honest positioning (remove “Launch in 15 minutes” if unverified)
4. Add `marketingPageMetadata` to `/changelog` with canonical
5. Run Search Console + sitemap submit after deploy (ops checklist below)

---

## Inventory

| Surface | Count | Sitemap? | Primary metadata source |
|---------|------:|:--------:|-------------------------|
| Marketing + ICP pages | ~24 | Partial | `marketingPageMetadata()` |
| Solution segments | 8+ | Yes | `solution-landing-content.ts` |
| ICP landings | 3 | Yes | `icp-landing-content.ts` |
| Compare pages | 7+ | Yes | `compare-content.ts` |
| Integration pages | 15+ | Yes | `integrationPageMetadata()` |
| Blog posts | 6 | 4/6 | Per-page `marketingPageMetadata` |
| Geo `/locations/*` | 6 | Yes | `geo-cities.ts` |
| Google Ads landings | 4 | Yes | `google-ads-landings.ts` |
| Case studies | 2+ | Yes | `case-studies.ts` |
| **New (Task 64–65)** | `/shopify`, `/vendor` | **No** | `shopify-bundle-content.ts`, `vendor-recruitment-content.ts` |

Full route census: [`navigation-audit.md`](./navigation-audit.md) — **24** public marketing & ICP routes in category matrix.

---

## Technical SEO

### Sitemap (`app/sitemap.ts`)

- **Source:** `marketingSitemapPaths()` + `GOOGLE_ADS_LANDINGS`
- **Base URL:** `PRODUCTION_APP_URL` from `lib/auth/public-site-url.ts`
- **Revalidation:** Static at build; all entries share `lastModified: new Date()` (no per-route freshness — acceptable for MVP)

**Verified in sitemap:**

| Priority band | Examples |
|---------------|----------|
| 1.0 | `/` |
| 0.9 | `/product`, `/pricing`, `/solutions` |
| 0.84–0.88 | `/landing/*`, `/solutions/*` |
| 0.75–0.8 | `/compare/*`, `/demo`, `/integrations` |
| 0.3 | Legal pages |

### Sitemap gaps (add to `lib/marketing/sitemap-urls.ts`)

| Route | Priority (suggested) | Rationale |
|-------|---------------------:|-----------|
| `/shopify` | 0.86 | ICP channel landing — Task 64 |
| `/vendor` | 0.82 | Vendor recruitment — Task 65 |
| `/blog/ghost-kitchen-setup-complete-guide` | 0.70 | Published blog, missing |
| `/blog/how-to-choose-restaurant-pos-2026` | 0.70 | Published blog, missing |
| `/changelog` | 0.55 | Freshness signal for product updates |

### Robots (`app/robots.ts`)

**Disallowed (correct):** `/api/`, `/dashboard/`, `/platform/`, `/auth/`, `/onboarding/`, `/_next/` (except Googlebot)

**Should disallow or noindex (gap):**

| Path | Issue | Fix |
|------|-------|-----|
| `/vendor/dashboard`, `/vendor/orders`, … | Authenticated vendor cabinet — thin/duplicate if crawled | Layout `robots: { index: false }` |
| `/vendor/register`, `/vendor/register/status` | App flow, not landing SEO | `noIndex: true` |
| `/signup` | Already `noIndex: true` ✓ | — |
| `/deck` | Already `noIndex: true` ✓ | — |
| `/lp/*` | Paid landings `noIndex: true` ✓ | — |

### Canonical & Open Graph

**Helper:** `lib/marketing/page-metadata.ts`

| Feature | Status |
|---------|--------|
| Canonical via `alternates.canonical` | ✓ |
| Open Graph title/description/url/images | ✓ |
| Twitter `summary_large_image` | ✓ |
| `metadataBase` in root layout | ✓ (`SITE_URL`) |
| Per-route OG image override | Optional param — rarely used |
| `noIndex` for campaign pages | ✓ |

**Pages not using `marketingPageMetadata`:**

| Route | Current metadata | Recommendation |
|-------|------------------|----------------|
| `/` | Root `app/layout.tsx` defaults | Dedicated homepage title/description aligned with honest positioning |
| `/changelog` | Minimal static title | Add canonical + description via helper |
| `/markets/europe` | `{ title: "OS Kitchen Europe" }` | Full metadata or noindex until localized |
| Integration sub-routes | `integrationPageMetadata()` | OK — verify BETA in descriptions |

---

## Structured data (JSON-LD)

| Schema | Location | Pages |
|--------|----------|-------|
| `Organization` | `app/layout.tsx` | Global |
| `SoftwareApplication` | `app/layout.tsx` | Global |
| `WebSite` | `app/layout.tsx` | Global |
| `FAQPage` | `FAQSchema` component | `/shopify`, ICP landings, vendor landing |
| `BreadcrumbList` | `BreadcrumbSchema` | Marketing landings with breadcrumbs |
| `LocalBusiness` / geo | `local-seo-schema.tsx` | `/locations/[city]` — verify per city page |

**Gaps:**

- No `Product` schema on `/pricing` (optional — use `SoftwareApplication` offers carefully, no fake reviews)
- No `Article` schema on blog posts — add `BlogPosting` for rich results eligibility
- Vendor landing FAQ schema ✓ (via component)

---

## On-page audit — priority URLs

| URL | Title pattern | Meta description | H1 | Claims risk | SEO score |
|-----|---------------|------------------|-----|-------------|:---------:|
| `/` | Root default | “Launch in 15 minutes” | Home hero | Medium — verify timing claim | B− |
| `/pricing` | marketingPageMetadata | Tier copy | Pricing headline | Low if marketplace BETA labeled | A− |
| `/shopify` | Shopify + OS Kitchen | POS-scoped inventory hooks | One OS headline | Low post-Task 64 | A− |
| `/vendor` | Become a Marketplace Vendor | BETA marketplace | Sell to restaurants | Low — honest limitations | A− |
| `/landing/meal-prep` | ICP config | Segment-specific | meal-prep h1 | Low | A− |
| `/landing/ghost-kitchen` | ICP config | Multi-brand ops | ghost kitchen h1 | Review geo “DoorDash” mentions in city pages | B+ |
| `/solutions/meal-prep` | Rich solution | Feature bullets | Segment h1 | Low | A− |
| `/compare/toast` | Compare metadata | Directional comparison | Compare title | Low — disclaimer present | B+ |
| `/integrations/shopify` | Integration SEO | BETA labels | Integration name | Low | A− |
| `/blog/*` | Per-post | Operational content | Article h1 | Low — no fake outcomes | B+ |
| `/locations/los-angeles` | Geo template | Local keywords | City headline | **Medium** — “unify DoorDash, Uber Eats” needs BETA qualifier | B− |
| `/customers/*` | Customer stories | Pilot/composite labels? | Story headline | **High if presented as signed customers** | Review |
| `/changelog` | “Changelog” only | Generic | Changelog | Low | C |

---

## Content & keyword strategy

### Primary keyword clusters (aligned with ICP)

| Cluster | Target URLs | Status |
|---------|-------------|--------|
| Meal prep software | `/landing/meal-prep`, `/solutions/meal-prep`, blog posts | Strong |
| Ghost kitchen software | `/landing/ghost-kitchen`, `/solutions/ghost-kitchens`, geo pages | Strong |
| Weekly preorder | `/landing/weekly-preorder` | Good — newer URL |
| Shopify + kitchen ops | `/shopify`, `/integrations/shopify` | Good — sitemap gap |
| HoReCa B2B marketplace vendor | `/vendor` | Good — sitemap gap |
| Restaurant POS comparison | `/compare/*`, blog POS posts | Good |
| AI restaurant ops | Homepage, Today demo script | Use “7 AI modules” + maturity caveats |

### Planned content (`SEO_CONTENT_PLAN.md`)

Six `/resources/*` guides listed in plan — **not all implemented**. Prioritize:

1. `/resources/shopify-meal-prep-store` — links `/shopify`
2. `/resources/catering-production-workflow` — links catering solution
3. Add each to sitemap when published

### Forbidden / risky SEO phrases

Do not optimize title tags or H1s for:

- “untouchable”, “#1 POS”, “live DoorDash integration”
- “unified cross-channel inventory”
- Fake review stars in schema

Run before metadata bulk edits:

```bash
MARKETING_CLAIMS_STRICT=1 npm run verify-claims
```

---

## Internal linking

| From | Should link to | Status |
|------|----------------|--------|
| `/` hero / footer | `/shopify`, `/vendor`, ICP landings | Partial — verify footer sitemap links |
| ICP landings | `/book-demo`, `/demo`, limitations | ✓ |
| `/shopify` | `/integrations/shopify`, `/book-demo` | ✓ |
| `/vendor` | `/vendor/register`, `/dashboard/marketplace` | ✓ |
| Blog posts | Related solutions + `/book-demo` | Per-post — audit individually |
| `/pricing` | Marketplace tier copy (Task 109) | Pending |

**Recommendation:** Add “Become a vendor” to site footer alongside Shopify bundle link.

---

## Analytics & Search Console (ops)

| Step | Owner | Status |
|------|-------|--------|
| Google Search Console property verified | Ops | `googleSiteVerificationMetadata()` in layout — env-gated |
| Submit `https://<prod>/sitemap.xml` | Marketing | Manual — post-deploy |
| GA4 + conversion events | Marketing | `GoogleAnalytics` component in layout |
| LinkedIn Insight / Meta Pixel | Marketing | Present — cookie consent gated |
| UTM discipline on ICP CTAs | Marketing | ✓ `icpLandingCtaHref` |

See Task 106 `docs/marketing-analytics-setup.md` for full dashboard spec.

---

## Accessibility overlap (SEO impact)

axe-core violations on `/`, `/pricing`, `/book-demo` (color contrast, button names) affect UX signals — see [`accessibility-audit.md`](./accessibility-audit.md). Fix serious/critical before expecting strong engagement metrics.

---

## Priority backlog

### P0 — this sprint

| # | Action | File(s) | Effort |
|---|--------|---------|--------|
| 1 | Add sitemap entries: `/shopify`, `/vendor`, 2 blogs, `/changelog` | `lib/marketing/sitemap-urls.ts` | S |
| 2 | noindex vendor app routes | `app/vendor/(cabinet)/layout.tsx`, register layout | S |
| 3 | Homepage metadata honesty pass | `app/layout.tsx` or `app/page.tsx` | S |
| 4 | Submit sitemap in GSC | Ops runbook | S |
| 5 | Geo page delivery qualifier | `lib/marketing/geo-cities.ts` | S |

### P1 — next 2 weeks

| # | Action | Effort |
|---|--------|--------|
| 6 | `BlogPosting` JSON-LD on all `/blog/*` | M |
| 7 | Publish 2 `/resources/*` guides from content plan | M |
| 8 | Footer internal links to `/shopify`, `/vendor` | S |
| 9 | `/changelog` metadata + optional `CollectionPage` schema | S |
| 10 | Audit `/customers/*` for pre-customer honesty labels | S |

### P2 — backlog

| # | Action | Task ref |
|---|--------|----------|
| 11 | Marketing page audit (full public surface) | Task 90 |
| 12 | Marketplace pricing page SEO (Task 109) | Task 109 |
| 13 | Performance / CWV CI | Task 79 |
| 14 | hreflang if `/markets/europe` expands | — |

---

## Verification checklist

After P0 fixes:

- [ ] `curl -s https://<prod>/sitemap.xml | grep -E 'shopify|vendor|changelog'`
- [ ] `curl -sI https://<prod>/vendor/dashboard` → `X-Robots-Tag: noindex` or meta robots
- [ ] Rich Results Test on `/shopify`, `/landing/meal-prep`, one blog post
- [ ] `npm run verify-claims` PASS on updated metadata strings
- [ ] Lighthouse SEO score ≥ 90 on `/`, `/pricing`, `/shopify` (manual spot check)

---

## Related docs

| Doc | Topic |
|-----|-------|
| [`SEO_CONTENT_PLAN.md`](./SEO_CONTENT_PLAN.md) | Resource hub roadmap |
| [`icp-landing-pages-updated.md`](./icp-landing-pages-updated.md) | Task 64 SEO surfaces |
| [`feature-announcement-template.md`](./feature-announcement-template.md) | Changelog → social SEO loop |
| [`marketing/cta-map.md`](./marketing/cta-map.md) | Conversion paths |
| [`navigation-audit.md`](./navigation-audit.md) | Full route census |

---

## Audit metadata

| Field | Value |
|-------|-------|
| Auditor | 122-task cycle #68 |
| Code refs scanned | `app/sitemap.ts`, `app/robots.ts`, `lib/marketing/sitemap-urls.ts`, `lib/marketing/page-metadata.ts`, `app/layout.tsx` |
| Search Console export | Not attached — run post-deploy |
| Next review | After P0 sitemap + noindex PR merged |

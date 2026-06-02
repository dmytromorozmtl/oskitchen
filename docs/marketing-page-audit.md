# Marketing page audit — OS Kitchen public surface

**Policy:** `marketing-page-audit-v1`  
**Date:** 2026-06-02  
**Owner:** Marketing + Design + Engineering  
**Scope:** All public, unauthenticated marketing, ICP, trust, and conversion pages — not dashboard, vendor cabinet, or storefront guest flows  
**Related:** [`seo-audit.md`](./seo-audit.md) · [`navigation-audit.md`](./navigation-audit.md) · [`accessibility-audit.md`](./accessibility-audit.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) · [`typography-audit.md`](./typography-audit.md)

This audit evaluates **content honesty**, **conversion coherence**, **visual consistency**, and **metadata coverage** across the public marketing surface. SEO mechanics are covered in [`seo-audit.md`](./seo-audit.md); this doc focuses on what visitors see and whether it is safe to sell.

**Honesty rule:** Every headline, stat, testimonial, and integration badge must map to `config/marketing/claims-registry.json` or be labeled illustrative. Engineering shipped ≠ sales-safe.

---

## Executive summary

| Area | Grade | Notes |
|------|:-----:|-------|
| **Claims honesty (integrations)** | A− | BETA / partner-gated labels on integration pages; Uber Direct explicitly roadmap-only on `/pricing` |
| **Claims honesty (social proof)** | C | Homepage stats (`1,200+ venues`, `94%`) and named testimonials are illustrative — not labeled |
| **Metadata consistency** | B− | Most routes use `marketingPageMetadata()`; homepage inherits root layout; `/changelog` minimal |
| **CTA funnel** | B+ | Consistent Sign up / Demo / Book demo; `/get-started` hub present; vendor path added (Task 65) |
| **Visual system** | B− | Homepage uses inline CSS + dark hero; other pages use Tailwind/shadcn — drift |
| **Marketplace GTM** | B | `/vendor` recruitment live; no public buyer catalog (dashboard-only — correct for MVP) |
| **Accessibility** | B | Task 89 fixes on auth + pricing toggle; axe sweep still flags contrast on marketing (see a11y audit) |
| **Sitemap / index hygiene** | C+ | `/shopify`, `/vendor`, 2 blog posts, `/changelog` missing from sitemap (see SEO audit P0) |

**Top 5 actions (P0):**

1. Label homepage stats and testimonials as **illustrative** or replace with verified pilot metrics
2. Align root `app/layout.tsx` description — remove unverified “Launch in 15 minutes” from global metadata
3. Add `/shopify`, `/vendor`, missing blog slugs, `/changelog` to `lib/marketing/sitemap-urls.ts`
4. `noIndex: true` on `/vendor/register`, `/vendor/(cabinet)/*`, `/vendor/register/status`
5. Replace homepage dashboard preview placeholder with honest screenshot or “Interactive demo” embed link

---

## Inventory — 52 public marketing routes

Source: [`navigation-audit.md`](./navigation-audit.md) category **Public marketing & ICP** (24) plus adjacent conversion/trust surfaces in sitemap.

| Category | Routes | Primary content source | Metadata helper |
|----------|-------:|------------------------|-----------------|
| Core conversion | 6 | `home-landing.tsx`, `pricing-page.tsx`, `get-started-content.ts` | Partial — `/` uses root layout |
| Product | 4+ | `product-marketing`, `pos-terminal` page | `marketingPageMetadata` ✓ |
| Solutions & ICP | 11 | `solution-landing-content.ts`, `icp-landing-content.ts`, `/shopify`, `/vendor` | ✓ |
| Compare | 8 | `compare-content.ts` (7 slugs + hub) | ✓ |
| Demo | 5+ | `demo-verticals`, `/demo` hub | ✓ |
| Integrations | 12+ | `lib/public-copy.ts` (11 integration pages) | `integrationPageMetadata` ✓ |
| Blog | 7 | `blog-posts.ts` (6 posts + index) | Per-page ✓ |
| Resources & trust | 12+ | `resources/*`, `/trust`, `/capabilities`, `/support/*` | Mostly ✓ |
| Geo & customers | 14+ | `geo-cities.ts`, `case-studies.ts`, `/customers/*` | ✓ |
| Auth shell | 3 | `login`, `signup`, `forgot-password` | Minimal (acceptable) |
| Legal | 6 | Static legal pages | ✓ |
| Other | 4 | `/deck`, `/roi-calculator`, `/book-demo`, `/contact-sales`, `/changelog` | Mixed |

**Not in scope (documented elsewhere):** storefront `/s/[storeSlug]/*`, dashboard `/dashboard/*`, vendor cabinet `/vendor/(cabinet)/*`, platform admin, developers portal.

---

## Page-by-page findings

### Core conversion

| Route | CTA primary | Claims risk | Design | Action |
|-------|-------------|-------------|--------|--------|
| `/` | `/signup`, `/demo` | **High** — stats + testimonials unlabeled | Inline styles; placeholder preview box | P0: illustrative labels; real demo asset |
| `/pricing` | `/signup`, `/book-demo` | **Low** — tiers match code; Uber Direct FAQ honest | Tailwind; a11y toggle fixed (Task 89) | P2: marketplace tier copy (Task 109) |
| `/get-started` | Workflow chooser | Low | Consistent | OK |
| `/book-demo` | Form submit | Medium — calendar button a11y (see a11y audit) | Consistent | P1: aria-label on icon buttons |
| `/roi-calculator` | Email capture | **Medium** — outputs are estimates | Labels fixed (Task 89) | Keep ILLUSTRATIVE footnote visible |
| `/signup` / `/login` | Auth | Low | Auth shell a11y improved | OK |

**Homepage detail (`components/marketing/home-landing.tsx`):**

- Hero copy is honest and aligned with positioning.
- Feature grid correctly states Uber Eats / DoorDash are partner-gated, not live.
- FAQ “15 minutes setup” matches onboarding goal but is **not verified** at scale — use “typical pilot setup” language or cite pilot data.
- Stats row (`1,200+`, `94%`, `15 Min`) and three named testimonials read as customer proof — **must be labeled illustrative** per [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md).
- Dashboard preview is a gray placeholder — undermines trust; link to `/demo` or embed screenshot from `executive-demo`.

**Root metadata (`app/layout.tsx`):**

- Global description includes “Launch in 15 minutes” — conflicts with honest positioning docs and is not evidence-backed. Override on `/` or soften globally.

### Product & solutions

| Route | Status | Notes |
|-------|--------|-------|
| `/product`, `/product/[slug]` | Pass | Capability-level honesty; links to maturity matrix |
| `/product/pos-terminal` | Pass | Explicit “no fake card capture” |
| `/solutions`, `/solutions/[slug]` | Pass | Segment-specific; no forbidden claims found |
| `/landing/meal-prep`, `/landing/ghost-kitchen`, `/landing/weekly-preorder` | Pass | Paid-ad aligned; check noindex on `/lp/*` paid variants |
| `/shopify` | Pass (Task 64) | BETA Shopify + kitchen ops; marketplace mention honest |
| `/vendor` | Pass (Task 65) | Vendor recruitment; Stripe Connect test mode disclosed |

### Compare & competitive

| Route | Status | Notes |
|-------|--------|-------|
| `/compare`, `/compare/[slug]` | Pass | “Honest comparisons” framing; matrices cite capability not parity |
| `/compare/toast`, `/compare/square`, etc. | Pass | No “untouchable” language (Task 17) |

### Integrations (public)

All 11 pages under `/integrations/*` sourced from `lib/public-copy.ts`:

| Integration | Public status label | Sales-safe? |
|-------------|---------------------|-------------|
| WooCommerce | BETA — test shop certification | ONLY_WITH_CAVEAT |
| Shopify | BETA — test shop certification | ONLY_WITH_CAVEAT |
| Uber Eats | Partner access required | NO (live) |
| DoorDash | Partner access required | NO (live) |
| Grubhub | Partner access required | NO (live) |
| QuickBooks, Xero, 7shifts, Homebase | BETA / partial | ONLY_WITH_CAVEAT |
| Uber Direct | Roadmap / placeholder | NO — correctly not sold |

**Verdict:** Integration pages are the strongest honesty surface. Ensure dashboard integration cards mirror the same BETA badges (Task 10 ✓).

### Blog & resources

| Surface | Count | Gap |
|---------|------:|-----|
| Blog posts | 6 published | 2 slugs missing from sitemap (`ghost-kitchen-setup-complete-guide`, `how-to-choose-restaurant-pos-2026`) |
| Resource guides | 7+ | Content plan backlog in `SEO_CONTENT_PLAN.md` |
| Case studies / customers | 5+ | Pre-customer pages need “pilot illustrative” badge review |

### Trust, legal, support

| Route | Status |
|-------|--------|
| `/trust`, `/legal/*` | Pass — no over-claims on SOC2 |
| `/support`, `/support/contact` | Pass |
| `/capabilities` | Pass — aligns with capability sheet |
| `/changelog` | Needs metadata + sitemap entry |

### Auth shell (marketing-adjacent)

Included because linked from every header. Task 89 added underlined inline links and improved contrast tokens. Remaining axe findings: see [`accessibility-audit.md`](./accessibility-audit.md).

---

## Cross-cutting themes

### 1. Two visual systems

- **Homepage:** CSS variables, inline styles, `.dark-section`, `.btn` classes in `globals.css`.
- **Rest of marketing:** Tailwind + shadcn components (`SiteHeader`, `PricingPage`, etc.).

**Risk:** Typography scale and button styles diverge. **Action (P2):** migrate homepage to shared marketing layout primitives (`docs/component-library.md`).

### 2. CTA map coherence

| Funnel stage | Primary routes | Tracking |
|--------------|----------------|----------|
| Awareness | `/`, `/blog/*`, `/solutions/*` | GA + Meta pixel in root layout |
| Consideration | `/compare/*`, `/pricing`, `/roi-calculator` | `PricingViewTracker` on pricing |
| Decision | `/book-demo`, `/demo`, `/signup` | Demo vertical slugs |
| Marketplace supply | `/vendor`, `/vendor/register` | No public analytics doc yet (Task 106) |
| Marketplace demand | Dashboard-only `/dashboard/marketplace` | Correct — not a public catalog yet |

### 3. Forbidden / risky phrases scan

| Phrase | Found? | Location | Verdict |
|--------|--------|----------|---------|
| `untouchable` | No | Removed Task 17 | ✓ |
| Uber Direct as live feature | No | Pricing FAQ denies inclusion | ✓ |
| SOC2 certified | No | Trust page | ✓ |
| Fake LIVE badges | No | Integration pages use honest status | ✓ |
| Unverified customer counts | **Yes** | Homepage stats | Fix P0 |

Run `npm run verify-claims` before each marketing deploy.

### 4. Marketplace on public pages

- **Buyer side:** No public marketplace catalog — procurement happens post-login. Empty state component exists for dashboard (Task 11).
- **Seller side:** `/vendor` recruitment landing with honest Stripe Connect test-mode path.
- **Pricing:** Marketplace fees not yet on `/pricing` — tracked in Task 109.

---

## Remediation backlog

### P0 — before next sales demo

| # | Action | Owner | Task ref |
|---|--------|-------|----------|
| 1 | Add “Illustrative” badge to homepage stats + testimonials | Marketing | — |
| 2 | Remove or qualify “Launch in 15 minutes” in root metadata | Engineering | SEO audit #3 |
| 3 | Sitemap: `/shopify`, `/vendor`, 2 blog posts, `/changelog` | Engineering | SEO audit #1 |
| 4 | `noIndex` vendor register + cabinet routes | Engineering | SEO audit #2 |
| 5 | Replace homepage preview placeholder | Design | — |

### P1 — pilot-ready polish

| # | Action | Owner |
|---|--------|-------|
| 6 | Homepage → shared Tailwind marketing shell | Design |
| 7 | `/book-demo` icon button accessible names | Engineering |
| 8 | Footer links to `/shopify`, `/vendor` | Marketing |
| 9 | `/customers/*` illustrative labels | Marketing |
| 10 | `/changelog` metadata + schema | Engineering |

### P2 — growth

| # | Action | Task ref |
|---|--------|----------|
| 11 | Marketplace pricing copy on `/pricing` | Task 109 |
| 12 | Dark mode audit across marketing | Task 91 |
| 13 | Public marketing analytics setup | Task 106 |
| 14 | ICP landing refresh cadence | Task 64 ✓ |

---

## Verification checklist

Before marking this audit closed:

- [ ] `npm run verify-claims` PASS
- [ ] `npm run test:e2e:a11y` PASS on production build
- [ ] Homepage stats/testimonials labeled or replaced
- [ ] `curl -s <prod>/sitemap.xml | grep -E 'shopify|vendor|ghost-kitchen-setup'`
- [ ] Spot-check `/pricing`, `/shopify`, `/vendor`, `/compare/toast` for BETA honesty
- [ ] Sales deck (`/deck`) matches registry — no drift from web copy

---

## Related docs

| Doc | Topic |
|-----|-------|
| [`seo-audit.md`](./seo-audit.md) | Sitemap, metadata, structured data |
| [`accessibility-audit.md`](./accessibility-audit.md) | axe-core sweep + CI gate |
| [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md) | Seven AI modules wording |
| [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) | Competitive posture |
| [`icp-landing-pages-updated.md`](./icp-landing-pages-updated.md) | Task 64 Shopify/meal-prep updates |
| [`marketing/cta-map.md`](./marketing/cta-map.md) | Conversion path owners |

---

*Generated as Task 90 — P2 Design. Next: [`dark-mode-audit.md`](./dark-mode-audit.md) (Task 91).*

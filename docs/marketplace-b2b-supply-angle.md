# Marketplace — B2B supply angle (sales & GTM)

**Policy:** `marketplace-b2b-supply-angle-mkt16-v1`  
**Updated:** 2026-06-03  
**Audience:** Sales, CS, vendor recruitment, founder demos, commissary / multi-site buyers  
**Product status:** HoReCa B2B marketplace **BETA scaffold** — catalog empty until vendor seed · Stripe Connect checkout **env-gated**  
**Honesty:** [`marketplace-pricing-strategy.md`](./marketplace-pricing-strategy.md) · [`vendor-seeding-strategy.md`](./vendor-seeding-strategy.md) · [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) · [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md)

No live GMV or national supplier network exists as of June 2026. This document is the **approved B2B supply narrative** for recruiting buyer and vendor design partners — not proof of marketplace scale.

---

## One-line pitch

**Order packaging, cleaning, and kitchen supplies inside the same workspace where you run production and margin — HoReCa B2B catalog with honest BETA labels until seeded vendors and staging checkout PASS.**

---

## Who this angle is for

| Persona | Hook | Disqualify |
|---------|------|------------|
| **Commissary / ghost kitchen operator** | Consolidate ops + supply POs in one login | Needs Amazon Business parity day one |
| **Multi-brand meal prep** | Reorder disposables beside weekly menu planning | Zero interest in supplier consolidation |
| **Independent restaurant (2–5 sites)** | Category browse, compare, wishlist — no buyer fees | Wants Toast/Square in-restaurant marketplace |
| **Regional HoReCa supplier (vendor)** | Stripe Connect payout + featured placement path | Unwilling to onboard Connect for pilot |

**Pilot size (buyer):** 1 workspace · 3–5 supply categories · 2–4 POs/month target.  
**Pilot size (vendor):** 8–15 SKUs · Express Connect · 24h PO response SLA.

---

## Story arc (2 minutes)

### 1 — The pain (25s)

Operators buy gloves, containers, and sanitizer from five vendor portals while production runs in OS Kitchen. Purchase orders live in email; receiving does not tie to inventory lite. Finance sees margin in one tool and supply spend in another spreadsheet. Toast and Square marketplaces target **in-restaurant apps**, not commissary-scale B2B supply.

### 2 — The wedge (30s)

OS Kitchen adds a **HoReCa B2B marketplace** inside the operator dashboard — same auth, same workspace, same Integration Health honesty culture. Buyers browse eight parent categories (packaging, cleaning, kitchenware, dry goods, and more). Vendors onboard via verification queue + Stripe Connect. Checkout, vendor notification, and payout paths exist in code — **BETA until seed + smoke PASS**.

### 3 — What works today (35s)

| Surface | Route | What it shows |
|---------|-------|---------------|
| **Marketplace hub** | `/dashboard/marketplace` | Category browse, search, recommendations scaffold |
| **Catalog** | `/dashboard/marketplace/catalog` | Filter, compare, wishlist UX — empty until vendor seed |
| **Vendor directory** | `/dashboard/marketplace/vendors` | Approved supplier list |
| **Vendor cabinet** | `/vendor/*` | Supplier order fulfillment, payouts (edge-gated) |

**Demo path:** Hub → catalog filter → product detail → checkout trust strip → vendor order notification (staging with seeded vendors).

**Say explicitly:** Catalog is **empty until** category seed + 3–5 approved vendors per [`vendor-seeding-strategy.md`](./vendor-seeding-strategy.md). We do **not** claim Faire-scale network or Toast marketplace parity.

### 4 — Pilot offer (20s)

**Buyer design partner:** 50% subscription discount during qualified pilot window · dedicated CS for first 5 POs · influence on auto-vendor savings roadmap.  
**Vendor design partner:** Founding vendor tier — reduced commission during pilot · featured placement slot on staging · co-marketing case study template when first external PO completes.

### 5 — Honest close (10s)

We are recruiting **founding buyers and suppliers** to prove browse→checkout→fulfill→payout on staging — not claiming a live national marketplace. Book a fit call; we screen-share empty-state honesty and seeded staging when vendors are onboarded.

---

## Approved demo script (30 seconds)

> "Your team runs production and margin in OS Kitchen. The **B2B marketplace** lets you order packaging and cleaning supplies in the same workspace — browse by HoReCa category, compare SKUs, checkout when vendors are seeded. Suppliers get a vendor cabinet with Stripe Connect payouts. We're in **qualified beta** — catalog fills as we onboard founding vendors, not a fake full network on day one."

---

## Buyer vs vendor talk tracks

| Side | Lead with | Avoid |
|------|-----------|-------|
| **Buyer (restaurant)** | One login for ops + supply · no buyer subscription fee · compare/wishlist UX | "Replace Sysco tomorrow" · "Thousands of vendors live" |
| **Vendor (supplier)** | HoReCa-only audience · SaaS + commission model · featured placement | "Guaranteed GMV" · "National rollout complete" |

**Competitive frame:** Faire and Amazon Business own broad B2B retail. OS Kitchen targets **operators already on our ops spine** — supply as a wedge, not a standalone marketplace IPO story.

---

## Pilot week 1 checklist (buyer operator)

| Day | Milestone | Owner |
|-----|-----------|-------|
| 0 | Categories seeded · 3+ vendors approved on staging | PM + Ops |
| 1 | Buyer workspace granted marketplace access | CS |
| 2 | Browse catalog · save wishlist · compare 2 SKUs | Operator |
| 3 | First test PO (staging card) · confirm vendor notification | CS |
| 4 | Receiving noted in pilot notes · tie to inventory lite if configured | Operator |
| 5 | Retrospective → category gaps + reorder UX feedback | GTM |

**Evidence path:** `e2e/marketplace-catalog-checkout-vendor-order.spec.ts` · `e2e/marketplace-checkout-fulfill-payout.spec.ts` (staging credentials required).

---

## Outbound snippets

**LinkedIn (buyer):**  
> Commissary operators shouldn't juggle five supplier portals beside their kitchen OS. OS Kitchen marketplace — HoReCa B2B inside your workspace. Qualified beta; founding buyer slots open.

**Email subject (vendor):**  
> Founding HoReCa supplier slot — OS Kitchen B2B marketplace (beta)

**Discovery question:**  
> "Where do you buy gloves, containers, and sanitizer today — and does that talk to your production or margin tools?"

---

## Forbidden claims

Do **not** say in sales copy, decks, or outbound:

- national marketplace network live
- thousands of vendors
- faire parity
- amazon business parity
- toast marketplace parity
- square marketplace parity
- guaranteed gmv
- zero commission forever
- sysco replacement
- instant nationwide delivery

Run copy through `lintMarketplaceB2bSupplyAngleCopy()` before publishing.

---

## Demo flow (8 minutes)

| Min | Step | Screen |
|-----|------|--------|
| 0–1 | Frame B2B wedge vs in-restaurant app stores | Slide or verbal |
| 1–2 | Marketplace hub + category grid | `/dashboard/marketplace` |
| 2–4 | Catalog filter · compare · wishlist | `/dashboard/marketplace/catalog` |
| 4–5 | Product detail + checkout trust strip | Product page |
| 5–6 | Place staging PO · vendor notification | Checkout → vendor order |
| 6–7 | Vendor cabinet fulfill path (if vendor demo) | `/vendor/orders` |
| 7–8 | Honest close — BETA badge · seeding status · LOI CTA | `/trust` link |

---

## Related docs

| Doc | Use |
|-----|-----|
| [`marketplace-pricing-strategy.md`](./marketplace-pricing-strategy.md) | Vendor SaaS + commission |
| [`vendor-seeding-strategy.md`](./vendor-seeding-strategy.md) | Supply onboarding |
| [`vendor-seeding-execution.md`](./vendor-seeding-execution.md) | E0–E3 runbook |
| [`stripe-connect-vendor-test-plan.md`](./stripe-connect-vendor-test-plan.md) | Payout smoke |
| [`competitor-comparison-honest.md`](./competitor-comparison-honest.md) | Toast/Square scope |

**Primary CTA:** [`/book-demo?utm_source=marketplace-b2b&utm_medium=sales&utm_campaign=supply-angle-mkt16`](/book-demo?utm_source=marketplace-b2b&utm_medium=sales&utm_campaign=supply-angle-mkt16)

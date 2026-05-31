# OS Kitchen — Competitive Analysis 2026

**Version:** 1.0 · **Date:** 19 May 2026  
**Authors:** Product Strategy / Competitive Intelligence  
**Related:** [PRODUCT_ROADMAP_2026.md](PRODUCT_ROADMAP_2026.md) · [CAPABILITY_SIGNOFF_SALES.md](CAPABILITY_SIGNOFF_SALES.md) · `lib/capabilities/capability-matrix.ts`

---

## Strategic position

OS Kitchen competes as **the operating system for weekly preorder kitchens** — not as a restaurant POS (Toast/Square) or a pure inventory tool (MarketMan). The win condition is **one stack**: storefront → orders → production → packing → margin/costing → purchasing, with honest channel consolidation (Woo/Shopify BETA, no native Uber/DoorDash in 2026).

**ICP priority:** Meal prep (primary) → Catering / Bakery (secondary) → Ghost / multi-brand (tertiary, data model ready).

---

## 1. Competitive landscape

### Group 1 — Direct competitors (meal prep / food ops)

| Competitor | Strengths | Weakness vs OS Kitchen | Lesson for OS Kitchen |
|------------|-----------|------------------------|----------------------|
| **MarketMan** | Invoice OCR, supplier catalogs (US Foods, Sysco), A vs T costing, POS integrations | No production/packing, no native storefront, $200+/mo | Ship **A vs T + supplier price discipline**; skip invoice OCR in 2026 |
| **xtraCHEF (Toast)** | Invoice PDF/email extraction, PO approvals, QuickBooks/Xero | Back-office only; no kitchen workflow | **PO approval workflow** + accounting export (Q3–Q4) |
| **Galley** | Recipes, scaling, allergens, production planning | No storefront/POS/channels | **Recipe scaling in production** + nutrition auto-calc |
| **FoodStorm (CaterTrax)** | Quote → event → fulfillment, rentals, event calendar | Catering-only, legacy UI | **Catering deposits + event calendar** (convert bridge exists) |
| **UpMenu** | Branded site, delivery apps, email/SMS marketing | No production/packing | **Meal-plan subscriptions** via email/in-app (not SMS) |

### Group 2 — Indirect competitors

| Competitor | Strengths | Lesson for OS Kitchen |
|------------|-----------|----------------------|
| **Toast** | Hardware POS, integration marketplace, labor | **Integration health** visibility; no hardware POS |
| **Square** | Free POS tier, payments, Square Online | **Stripe-native** checkout + Starter tier already aligned |
| **Shopify** | Themes, app ecosystem, shipping | **Storefront GA** + routes; Woo/Shopify as channel hub |

### Group 3 — Market trends (2026)

| Trend | Who leads | OS Kitchen response |
|-------|-----------|-------------------|
| AI in kitchen | Galley, MarketMan | Copilot BETA → **demand forecasting** on order history (Q3) |
| Sustainability | Galley, startups | **Food waste tracking** in production (Q3–Q4) |
| Ghost / virtual brands | Toast, Square | **Multi-brand dashboard** (brands in schema; UI Q4) |
| DTC / subscriptions | Shopify apps | **Meal plans** auto-cycle + customer portal (Q3) |

### Explicitly not chasing (2026)

| Area | Rationale |
|------|-----------|
| SMS | NOT_AVAILABLE — TCPA, cost |
| Offline POS / Stripe Terminal | NOT_AVAILABLE / ROADMAP — online-first pilot |
| Uber Eats / DoorDash native | PARTNER_ACCESS_REQUIRED — Woo/Shopify + manual |
| Invoice OCR | High build; low pilot ROI vs receiving discipline |

---

## 2. TIER 1 features (Q2–Q3 2026) — maximum ROI

Prioritized after **3–5 pilot operators** validate pain (weeks 3–4). Code audit 19 May 2026.

| # | Feature | Why win | Competitor source | Code status | Effort (eng) |
|---|---------|---------|-------------------|---------------|--------------|
| 1 | **Costing A vs T — variance alerts & sales story** | MarketMan/xtraCHEF table stakes for margin | MarketMan, xtraCHEF | **PARTIAL+** — `/dashboard/costing/avt`, `avt-report-service`, confidence model | 2–4d (alerts, period UX, pilot docs) |
| 2 | **PO approval workflow (actions + notify)** | Spend control without ERP | xtraCHEF | **PARTIAL** — statuses + `purchase_approval_events`; read-only timeline | 3–5d |
| 3 | **Recipe scaling in production batches** | Galley parity on batch prep | Galley | **PARTIAL** — batches exist; no yield multiplier on ingredients | 2–4d |
| 4 | **Catering quote → order GA + deposits** | FoodStorm; bridge already in product | FoodStorm | **PARTIAL** — `quote-conversion-service` + UI on quote detail; deposits Q3 | 2–3d (deposits/Stripe link) |
| 5 | **Supplier price history — charts & compare** | MarketMan price memory | MarketMan | **PARTIAL** — `supplier_price_history` + table UI | 2–3d |
| 6 | **Integration health command center** | Toast-style “all green” | Toast | **PARTIAL** — `integration-health-service`, `/dashboard/developer/integrations` | 2–3d |
| 7 | **Meal plans — auto-renew cron + skip/pause UX** | UpMenu recurring | UpMenu | **PARTIAL** — `meal_plan_cycles`, `skipCycle`, draft generator; no prod cron | 3–5d |

**Pilot weeks 1–2:** No new Tier 1 builds — collect feedback via [PILOT_FEEDBACK_TEMPLATE.md](PILOT_FEEDBACK_TEMPLATE.md).

**Expected top-2 from pilots (hypothesis):** #1 Costing A vs T, #2 PO approval.

---

## 3. TIER 2 features (Q3–Q4 2026) — differentiation

| # | Feature | Why | Competitor / trend | Target quarter |
|---|---------|-----|-------------------|----------------|
| 8 | AI demand forecasting | Reduce waste, menu planning | Galley, MarketMan, Copilot BETA | Q3 |
| 9 | Multi-brand executive dashboard | Ghost kitchens | Trend, Toast | Q4 |
| 10 | Food waste tracking (production) | Sustainability narrative | Galley, trend | Q3–Q4 |
| 11 | QuickBooks / Xero export | AP closure | xtraCHEF | Q4 |
| 12 | Customer self-service portal | Subscriptions, order history | UpMenu | Q3 |
| 13 | Nutritional analysis auto-calc per recipe | Label compliance | Galley | Q3 |
| 14 | Barcode scanning in packing | Speed, accuracy | Trend | Q4 |

---

## 4. TIER 3 features (Q4 2026+) — scale

| # | Feature | Why |
|---|---------|-----|
| 15 | White-label storefront per brand | Multi-brand GTM |
| 16 | Marketplace order sync (Uber/DoorDash) | Partner-gated only |
| 17 | Carbon footprint per SKU | Enterprise / compliance |
| 18 | Franchise templates (menu, purchasing) | Chain operators |
| 19 | Driver mobile app | Routes at scale |
| 20 | Public Open API + partner apps | Toast-style ecosystem |

---

## 5. Technical assessment (TIER 1 — code → ship)

| Feature | What exists | Gap to “competitive parity” | Paths |
|---------|-------------|----------------------------|-------|
| A vs T | `services/costing/actual-vs-theoretical-service.ts`, `avt-report-service.ts`, `app/dashboard/costing/avt/` | Threshold alerts, executive export tie-in, sales one-pager | `components/costing/*` |
| PO approval | `PurchaseOrderStatus` incl. `READY_FOR_REVIEW`, `purchase_approval_events` | Server actions: submit / approve / reject; Resend on pending | `app/dashboard/purchasing/actions.ts` |
| Recipe scaling | `production_batches`, `generate-production.ts` | `scaleFactor` on batch → multiply recipe lines in work items | `services/production/` |
| Catering convert | `quote-conversion-service.ts`, quote detail UI | Deposit %, Stripe payment link, matrix LIVE claim | `services/catering/` |
| Price history | `supplier_price_history`, `price-history/page.tsx` | Chart by ingredient/supplier, side-by-side suppliers | `app/dashboard/purchasing/price-history/` |
| Integration health | `integration-health-service.ts`, developer integrations page | Single dashboard: Woo + Shopify + Stripe + email; webhook lag | `app/dashboard/developer/integrations` |
| Meal plans | `meal-plan-service.ts` (pause/skip), `meal-plan-order-generator.ts` | Cron: due cycles → draft orders; operator “auto-renew” toggle | `app/api/cron/`, meal-plans routes |

---

## 6. Action plan

### Weeks 1–2 (pilot)

1. No Tier 1 feature development.
2. Complete pilot feedback template per operator.
3. Tag blockers: costing, purchasing, catering, integrations, meal plans.

### Weeks 3–4 (after 3–5 operators)

4. Rank Tier 1 by frequency × revenue impact.
5. Ship **top 2** (estimated 1–2 eng-weeks total).
6. Update capability matrix + sales sign-off before demoing new claims.

### Q3 2026

7. Complete remaining Tier 1 (7 items).
8. Start Tier 2: AI forecasting (#8), customer portal (#12), catering reporting.

### Q4 2026

9. Multi-brand dashboard, QBO/Xero eval with enterprise pipeline.
10. Revisit partner gates (Uber) only if contract signed.

---

## 7. Win themes (messaging)

| Theme | Proof in product |
|-------|------------------|
| **Kitchen-first** | Orders → production → packing → routes (LIVE pilot path) |
| **Honest margins** | A vs T with confidence banner (no fake inventory precision) |
| **Own your channel** | Native storefront + Woo/Shopify BETA |
| **Not a POS tax** | No hardware lock-in; Stripe Checkout |
| **Catering without FoodStorm UI debt** | Quotes + convert + event metadata |

---

## Decision log

| Date | Decision |
|------|----------|
| 2026-05-19 | Tier 1 locked; pilot feedback gates engineering |
| 2026-05-19 | Catering convert treated as PARTIAL until deposits + sign-off |
| 2026-05-19 | A vs T repositioned: foundation shipped; alerts = Tier 1 finish |

---

*Review when pilot feedback or `PRODUCT_ROADMAP_2026.md` changes.*

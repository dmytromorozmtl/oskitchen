# OS Kitchen — Final ICP Definition (Pilot Era)

**Status:** Sales + GTM canonical reference  
**Decision date:** 2026-06-03  
**Supersedes:** `docs/ICP.md` (summary only — this doc is authoritative for pilot outreach)  
**Related policies:** `era17-pilot-icp-contract-v1`, `era20-first-paid-pilot-package-v1`, `docs/forbidden-claims-training.md`

---

## Executive summary

OS Kitchen’s **first paid pilot** targets owner-operated food businesses that **own fulfillment** and need a **software-first kitchen + order hub** — not a Toast/Square hardware replacement.

**Primary ICP segments (this document):**

| Segment | Priority | Landing / demo |
|---------|----------|----------------|
| **Ghost kitchen** | P0 — primary | `/ghost-kitchen-software`, demo `ghost-kitchen` |
| **Commissary** | P0 — primary | `/dashboard/commissary/*`, marketplace B2B angle |
| **Meal prep** | P0 — primary | `/landing/meal-prep`, `/landing/weekly-preorder` |

**Secondary (qualified, not headline ICP):** catering ([`/catering-management`](/catering-management)), small fast-casual, single-location café with owned kitchen.

**Non-target:** pure marketplace dropship, QSR needing in-store POS parity, enterprise requiring SSO/SOC2/SCIM in pilot term.

---

## Universal qualification criteria (all segments)

Every prospect must pass **Era 17 ICP gates** before LOI or paid pilot. Export real answers via `PILOT_GONOGO_ICP_INPUT_JSON` — the example template is **not** a signed customer.

### Required (all must be true)

1. **Single-location or small multi-unit** — ≤5 locations in pilot scope.
2. **Owner or ops lead engaged** — weekly check-ins during 90-day pilot.
3. **Needs core kitchen + order path** — order hub, storefront and/or in-browser POS software, KDS bump/recall.
4. **Accepts qualified beta labels** — BETA, PREVIEW, SKIPPED badges; no “production certified for all tenants” demand.

### Optional (nice-to-have, not disqualifiers)

- WooCommerce or Shopify test shop connected (not full marketplace live ops).
- Willing to run staging golden path before production traffic.

### Hard disqualifiers (do not pursue paid pilot)

| Trigger | Why |
|---------|-----|
| Production SSO/SAML for all staff | Not pilot-certified — staging smoke only |
| SOC 2 Type II or SCIM in pilot term | Enterprise gate — post-pilot roadmap |
| Unified cross-channel inventory depletion or rewards ledger | POS-scoped today — overpromise risk |
| Rush-hour KDS SLA or live DoorDash/Uber Eats ops | Partner-gated — SKIPPED smokes |
| Offline POS or Toast/Square hardware parity | Software-first positioning — not hardware lock-in |
| Public API production SLA | Developer tier not pilot scope |
| Refuses qualified wording | Violates honest GTM — see forbidden claims training |

**Qualification tooling:** `lib/commercial/pilot-icp-contract-era17.ts`, `npm run smoke:pilot-gono-go`

**SEO keywords:** [`seo-10-icp-keywords.md`](./seo-10-icp-keywords.md) — ten canonical organic targets (MKT-20)

---

## Segment 1 — Ghost kitchen

### Profile

Multi-brand or single-brand **delivery-first kitchen** operating from shared or dedicated commissary-style space. Orders arrive from owned storefront, manual phone/email, and optionally Woo/Shopify — **not** primarily in-store dine-in.

### Firmographics

| Attribute | Typical range |
|-----------|---------------|
| Locations | 1–5 ghost brands or pods under one operator |
| Order volume | 50–2,000 orders/week across channels |
| Staff | 3–25 kitchen + dispatch |
| Tech stack | Spreadsheets + generic POS or channel tablets; fragmented KDS |
| Revenue model | Delivery + pickup; multiple virtual brands optional |

### Jobs to be done

- Consolidate **order hub** — manual, storefront, integration webhooks into one production queue.
- Run **KDS bump/recall** across brands without separate tablets per channel.
- **Production board** — batch prep by wave, not by app silo.
- **Packing verification** — reduce wrong-bag refunds on multi-brand handoffs.
- **Owner daily briefing** — blockers (integration health, low stock signals) without BI team.

### OS Kitchen pilot fit (included modules)

Order hub, manual orders, storefront checkout, in-browser POS software checkout, KDS bump/recall, production board, packing verification, launch wizard, owner daily briefing, integration health center.

### Pilot exclusions (set expectations in SOW)

Live DoorDash/Uber Eats marketplace ops, rush-hour KDS SLA certification, unified cross-channel inventory, production SSO, offline card terminal parity.

### Buying triggers

- Refund spike from mis-picks across virtual brands.
- Menu versioning breaks spreadsheets when scaling brands.
- Owner spends >5 hrs/week reconciling channel tablets vs kitchen reality.

### Discovery questions

1. How many brands/locations share one physical kitchen?
2. What % of orders are owned storefront vs aggregator vs manual?
3. Who owns the KDS today — one screen or per-channel?
4. Will owner join weekly 30-min pilot check-ins?

### Anti-ICP (ghost kitchen)

- Aggregator-only operator with **no owned kitchen** (pure virtual brand reseller).
- Demands **in-store dine-in POS** as primary workflow.
- Requires **live Uber Eats/DoorDash menu sync** as go-live blocker.

### Landing alignment

- **Page:** `/ghost-kitchen-software`
- **Claims:** Software-first order hub + KDS; honest BETA labels on marketplace and delivery integrations.
- **UTM:** `utm_campaign=ghost-kitchen-icp`

---

## Segment 2 — Commissary

### Profile

**Shared kitchen operator** producing for internal brands, tenant kitchens, catering clients, or B2B buyers. Needs production scheduling, batch yield, and optionally **B2B marketplace catalog** for ingredient/supply ordering between commissary and tenant operators.

### Firmographics

| Attribute | Typical range |
|-----------|---------------|
| Facility type | Licensed commissary, cloud kitchen hub, central prep for multi-unit group |
| Tenants / clients | 2–30 production clients or internal brands |
| Order volume | Batch production waves; 100–10k units/week |
| Staff | Central kitchen manager + per-line cooks |
| Tech stack | ERP-lite spreadsheets, separate ordering for tenants, manual invoicing |

### Jobs to be done

- **Production calendar** — waves, yields, commissary batch sheets.
- **Multi-tenant order routing** — tenant orders → correct production lane without cross-contamination of tickets.
- **B2B marketplace catalog/checkout (BETA)** — commissary-as-vendor supply to tenant kitchens when vendors onboarded in pilot.
- **CRM + segments** — tenant/client communication without separate Mailchimp.
- **Billing** — pilot-scope invoicing; not full QuickBooks replacement in v1.

### OS Kitchen pilot fit

Production board/calendar, order hub, packing verification, CRM customers/segments, billing (pilot scope), marketplace catalog/checkout (**BETA** — requires vendor onboarding in pilot), integration health for Woo/Shopify tenant shops.

### Pilot exclusions

Full ERP/MRP, automated tenant rent accounting, SOC2 multi-tenant attestation, live marketplace payout ops at scale.

### Buying triggers

- Tenant onboarding takes weeks because ordering/production is manual.
- Wrong-batch incidents from shared facility scheduling gaps.
- Owner wants **one ops surface** instead of commissary spreadsheet + tenant POS islands.

### Discovery questions

1. Internal brands only, external tenants, or both?
2. Do tenants need **their own storefront**, or commissary-driven B2B ordering?
3. Is B2B supply (marketplace) in scope for pilot, or phase 2?
4. Single facility or hub-and-spoke commissary network (≤5 for pilot)?

### Anti-ICP (commissary)

- Pure **real estate / kitchen rental** with no production ops engagement.
- Requires **full MRP + USDA traceability certification** in 90-day pilot.
- Tenants refuse shared qualified-beta labels on customer-facing surfaces.

### Product surface alignment

- **Routes:** `/dashboard/commissary/*` (production, scheduling, tenant views)
- **SEO landing:** `/commissary-kitchen-software`
- **Marketplace angle:** B2B catalog — label **BETA** in all sales materials
- **Legacy:** `/landing/ghost-kitchen` → `/ghost-kitchen-software` + commissary demo narrative for multi-brand overlap

---

## Segment 3 — Meal prep

### Profile

**Weekly or subscription-oriented meal prep brand** with owned kitchen. Customers preorder menus with cutoffs; kitchen cooks to confirmed demand; pickup or local delivery handoff.

### Firmographics

| Attribute | Typical range |
|-----------|---------------|
| Order model | Weekly menu, cutoff Sunday → production Monday → pickup/delivery |
| Volume | 100–5,000 meals/week |
| Channels | Owned Shopify/Woo storefront, Instagram/WhatsApp (manual), optional walk-in counter |
| Staff | 2–15 kitchen + 1 ops owner |
| Tech stack | Spreadsheets + Shopify/Woo + separate label printer workflow |

### Jobs to be done

- **Preorder cutoff enforcement** — lock menu before production day.
- **Production quantities from confirmed orders** — yield-aware when recipes configured.
- **Pickup window capacity** — slot-based handoffs when configured.
- **Packing by customer/route** — lane sheets, verification before handoff.
- **Counter POS** — same-day add-ons alongside weekly preorders (software POS, no terminal lease).

### OS Kitchen pilot fit

Storefront checkout, production board, packing verification, manual orders, in-browser POS, CRM segments, launch wizard, owner briefing.

### Pilot exclusions

Native meal-plan subscription engine (Woo Subscriptions bridge read-only), unified rewards ledger, marketplace delivery live ops.

### Buying triggers

- Spreadsheet breakage at menu versioning every week.
- Mis-picks / refund spikes after scaling from 200 → 800 meals/week.
- Branded packing artifacts (labels, lane sheets) done manually.

### Discovery questions

1. Weekly menu + cutoff, or rolling subscription?
2. Shopify, Woo, or manual-only today?
3. Pickup-only, delivery, or both?
4. Accept **BETA** label on subscription bridge features?

### Anti-ICP (meal prep)

- **Pure dropship meal kit** — no owned fulfillment kitchen.
- Demands **native subscription billing parity** with Blue Apron-style UX on day one.
- Single-location QSR replacing Toast — wrong wedge (see non-target).

### Landing alignment

- **Primary:** `/landing/meal-prep`
- **Variant:** `/landing/weekly-preorder` (same segment, preorder-cutoff emphasis)
- **Demo slug:** `meal-prep`
- **Golden path (GTM + operator):** [`meal-prep-vertical-golden-path.md`](./meal-prep-vertical-golden-path.md)

---

## Segment prioritization matrix (pilot outreach)

| Criterion | Ghost kitchen | Commissary | Meal prep |
|-----------|:-------------:|:----------:|:---------:|
| Product-market fit (current build) | High | Medium–High | High |
| Sales cycle length | Medium | Longer | Shorter |
| LOI template fit | Strong | Strong (B2B angle) | Strong |
| P0 proof dependencies | Integration health, KDS | Multi-tenant RBAC, marketplace BETA | Storefront, production board |
| Recommended pilot wave | Wave 1 | Wave 1–2 | Wave 1 |

**Wave 1 outreach order:** meal prep → ghost kitchen → commissary (fastest time-to-value → highest complexity).

---

## ICP scoring rubric (sales quick screen)

Score each dimension 0–2 (0 = no, 1 = partial, 2 = yes). **≥8/10** → advance to discovery call; **≥12/14** → LOI candidate after ICP JSON export qualifies.

| # | Question | GK | Comm | MP |
|---|----------|:--:|:----:|:--:|
| 1 | Owns fulfillment kitchen | 2 | 2 | 2 |
| 2 | ≤5 locations in scope | 2 | 2 | 2 |
| 3 | Owner ops engaged | 2 | 2 | 2 |
| 4 | Needs order hub + KDS path | 2 | 2 | 1 |
| 5 | Accepts beta/pilot labels | 2 | 2 | 2 |
| 6 | No SSO/SOC2 blocker | 2 | 2 | 2 |
| 7 | No rush-hour SLA demand | 2 | 2 | 2 |
| **Max** | | **14** | **14** | **13** |

---

## Non-target summary (all segments)

Do **not** spend LOI cycles on:

- Single-location QSR needing **hardware POS replacement** as primary ask.
- Brands **without owned fulfillment** (marketplace dropship, virtual brand reseller).
- Prospects requiring **production SSO, SOC2, SCIM, or Public API SLA** in 90-day pilot.
- Operators who **refuse** BETA/PREVIEW/SKIPPED honest labeling.

---

## GTM asset map

| Asset | Path | Use |
|-------|------|-----|
| This ICP definition | `docs/icp-definition-final.md` | Sales onboarding, LOI prep |
| Forbidden claims training | `docs/forbidden-claims-training.md` | Certification before customer calls |
| Discovery call script | `docs/discovery-call-script.md` | 30-min qualification (MKT-21) |
| Pilot ICP contract template | `docs/pilot-icp-contract-template-era17.md` | Legal/SOW |
| ICP qualification JSON | `PILOT_GONOGO_ICP_INPUT_JSON` | GO/NO-GO gate |
| Ghost kitchen landing | `/ghost-kitchen-software` | Outbound + ads |
| Commissary landing | `/commissary-kitchen-software` | Outbound + ads |
| Catering landing (secondary ICP) | `/catering-management` | Outbound + SEO |
| Vertical messaging hub | `/solutions` — "Built for multi-concept operators" | GTM + SEO |
| Integration Health marketing | `/integration-health-center` | Outbound + moat positioning |
| Integration Health product | `/product/integration-health-center` | Product deep-dive |
| Meal prep landing | `/landing/meal-prep` | Outbound + ads |
| Weekly preorder landing | `/landing/weekly-preorder` | Meal prep variant |
| First paid pilot package | `docs/era20-first-paid-pilot-package-2026-05-28.md` | Scope + checklists |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-03 | MKT-02 — Final ICP: ghost kitchen, commissary, meal prep; aligns Era 17/20 policies |

# Vendor seeding strategy — initial marketplace supply

**Version:** 1.0 · **June 2026**  
**Scope:** First **3–5 approved vendors** to make the HoReCa B2B marketplace demo- and pilot-ready  
**Status:** Marketplace scaffold **BETA** — catalog empty until categories + vendors are seeded  
**Related:** [`vendor-registration-flow-design.md`](./vendor-registration-flow-design.md) · [`marketplace-b2b-supply-angle.md`](./marketplace-b2b-supply-angle.md) · [`stripe-connect-vendor-test-plan.md`](./stripe-connect-vendor-test-plan.md) · Task 105 `vendor-seeding-execution.md`

---

## Executive summary

| Goal | Target |
|------|--------|
| **Minimum viable catalog** | 3 vendors live in staging within 2 weeks of category seed |
| **Recommended pilot breadth** | 5 vendors across 5 parent categories |
| **SKUs per vendor (MVP)** | 8–15 ACTIVE products each |
| **Buyer path unlocked** | Catalog browse → cart → checkout → PO (`e2e/marketplace-checkout.spec.ts`) |
| **Honesty rule** | Seed vendors are **real or design-partner suppliers** in staging — not fictional “LIVE network” claims |

Without vendor seeding, buyers see empty catalog copy (“Approved vendor catalogs will appear here once marketplace categories and products are seeded”). Category taxonomy exists in code (`prisma/seed-marketplace-categories.ts`); **vendor and product rows do not auto-seed today**.

---

## Prerequisites (do first)

| Step | Command / path | Owner |
|------|----------------|-------|
| 1. Apply marketplace migration | `prisma/migrations/20260602133000_marketplace_core/` | DevOps |
| 2. Seed 8 HoReCa parent + child categories | `npm run db:seed:marketplace-categories` | Dev |
| 3. Staging env + Stripe test keys | [`staging-environment-checklist.md`](./staging-environment-checklist.md) | DevOps |
| 4. Connect flag for payout tests | `MARKETPLACE_VENDOR_STRIPE_CONNECT=1` (staging only) | Dev |

**Category tree (8 parents):** Packaging & Disposables · Cleaning & Sanitation · Kitchenware & Tools · Equipment · Dry Goods & Ingredients · Services · Uniforms & Workwear · Training & Certification — see `HORECA_CATEGORIES` in `prisma/seed-marketplace-categories.ts`.

---

## Selection criteria

Use these when picking the **3–5 initial vendors** (design partners, friendly suppliers, or internal demo accounts):

| Criterion | Why it matters |
|-----------|----------------|
| **Category coverage** | At least one vendor per high-frequency parent category (packaging, cleaning, kitchenware) |
| **Real compliance docs** | Platform verification queue needs plausible uploads — not placeholder PDFs in production |
| **Stripe Connect willingness** | Express onboarding required for checkout + payout path ([`stripe-connect-vendor-test-plan.md`](./stripe-connect-vendor-test-plan.md)) |
| **SKU depth** | Minimum 8 listable products with price, MOQ, and category mapping |
| **Geography / delivery** | Match pilot restaurant region (delivery zones, currency) |
| **Response SLA** | Design partner can approve test POs within 24h for pilot metrics |

**Deprioritize for v1 seed:** Equipment-only vendors (long sales cycles, heavy logistics) unless one is a committed design partner.

---

## Recommended initial vendor roster (5)

Start with **3 must-have** (rows 1–3), add **2 stretch** (rows 4–5) before first external demo.

| # | Vendor persona | Primary category | Subcategories (examples) | MVP SKUs | Role in pilot |
|---|----------------|------------------|--------------------------|----------|---------------|
| **1** | **EcoPack Supplies** | Packaging & Disposables | Cups & Lids, Containers, Napkins | 12 | High-frequency reorders; proves cart + repeat PO |
| **2** | **CleanPro HoReCa** | Cleaning & Sanitation | Detergents, Sanitizer, Degreasers | 10 | Compliance-adjacent; tests doc verification UX |
| **3** | **ChefTools Direct** | Kitchenware & Tools | GN Containers, Knives, Thermoses | 10 | Mid-ticket mix; category filter + comparison demos |
| **4** | **DryPantry Wholesale** | Dry Goods & Ingredients | Oils, Spices, Coffee & Tea | 8 | Ingredient catalog; variant/unit pricing checks |
| **5** | **UniformCo Workwear** | Uniforms & Workwear | Aprons, Non-Slip Shoes, Gloves | 8 | Second vertical; wishlist / approval-gate scenarios |

**Demo-only alternative (staging):** One internal workspace vendor (`KitchenOS Demo Supply Co.`) spanning packaging + cleaning with synthetic products — label clearly in vendor description: *“Staging demo catalog — not a live supplier.”*

---

## Per-vendor onboarding playbook

Repeat for each seed vendor:

```text
1. Create or assign workspace (supplier-side)
2. Submit application at /vendor/register (company, tax ID, 1+ compliance doc)
3. Platform review → APPROVED at /platform/marketplace/vendor-verification
4. Stripe Connect Express at /vendor/finance (staging: sk_test_…)
5. Add 8–15 products at /vendor/products/new → ACTIVE after moderation
6. Smoke: buyer workspace browses /dashboard/marketplace/catalog → checkout → PO
7. Vendor confirms PO at /vendor/orders; payout path per Connect test plan
```

| Stage | SLA | Blocker if missed |
|-------|-----|-------------------|
| Application submitted | Day 0 | No queue entry |
| Platform approval | ≤ 2 business days | Catalog stays empty |
| Connect onboarded | ≤ 3 days after approval | Checkout may fail on payment |
| First ACTIVE SKU | ≤ 1 day after approval | E2E checkout skips |
| First test PO | ≤ 5 days from kickoff | Pilot metrics R1 blocked |

---

## Seeding phases

### Phase 0 — Taxonomy (Day 0)

- Run category seed on staging DB.
- Verify 8 parent categories visible in vendor product form category picker.

### Phase 1 — Core three (Days 1–7)

- Onboard EcoPack, CleanPro, ChefTools (real or design-partner accounts).
- Target: **30+ ACTIVE SKUs** aggregate.
- Run `e2e/marketplace-checkout.spec.ts` and `e2e/vendor-registration.spec.ts` unskipped.

### Phase 2 — Breadth (Days 8–14)

- Add DryPantry + UniformCo (or substitute regional suppliers).
- Target: **50+ SKUs**, ≥ 5 parent categories represented.
- First design-partner buyer runs 3 POs across 2 vendors ([`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) R1).

### Phase 3 — Production pilot (Week 3+)

- Replace demo vendor with signed LOI supplier ([`loi-design-partner-template.md`](./loi-design-partner-template.md)).
- Connect live keys only after finance sign-off — never mix test vendors with production Connect.

---

## Product data minimum (per SKU)

| Field | Requirement |
|-------|-------------|
| Name | Clear HoReCa naming (no lorem ipsum in external demos) |
| Category | Level-2 slug under assigned parent |
| Unit price | Staging: USD/EUR test amounts |
| MOQ / pack size | Required for B2B credibility |
| Image | 1 product photo or category placeholder |
| Status | `ACTIVE` after moderation |

**Suggested SKU mix per vendor:** 60% fast movers (low price, high volume), 30% mid-tier, 10% hero SKU (featured on catalog landing).

---

## Environment matrix

| Environment | Vendor type | Connect | Claim safe? |
|-------------|-------------|---------|-------------|
| **Local dev** | Synthetic demo vendor | Off or test | “Local demo catalog” |
| **Staging** | Design partners + 1 demo vendor | Test mode | “Pilot marketplace — limited suppliers” |
| **Production** | LOI-signed suppliers only | Live after DoD | Per [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) |

---

## Roles & RACI

| Activity | PM | Ops | Dev | Design partner |
|----------|:--:|:---:|:---:|:--------------:|
| Select 3–5 vendors | A | C | I | C |
| Category seed on staging | I | C | R | — |
| Application + docs | C | R | I | A |
| Platform approval | I | R | I | C |
| Connect onboarding | C | C | R | A |
| Product upload | I | C | I | A |
| E2E / smoke validation | C | I | R | I |

R = responsible · A = accountable · C = consulted · I = informed

---

## Success metrics (seed complete)

| Metric | Target | Verified by |
|--------|--------|-------------|
| Approved vendors | ≥ 3 (goal 5) | Platform verification queue empty |
| ACTIVE SKUs | ≥ 30 (goal 50+) | Catalog API / admin count |
| Categories with ≥ 1 vendor | ≥ 3 parents | Catalog filter smoke |
| Checkout E2E | Pass | `e2e/marketplace-checkout.spec.ts` |
| Cross-tenant isolation | Pass | `e2e/cross-tenant-isolation.spec.ts` |
| First real PO (pilot) | ≥ 1 within 14 days | Pilot metrics R1 |

---

## Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Vendor drops before pilot | Maintain 2 backup suppliers per category; keep demo vendor in staging only |
| Connect onboarding stall | Pre-schedule Stripe onboarding call; document in [`stripe-connect-vendor-test-plan.md`](./stripe-connect-vendor-test-plan.md) |
| Empty catalog in sales demo | Block external demos until Phase 1 complete; use [`sales-limitation-sheet.md`](./sales-limitation-sheet.md) |
| Fake “national network” narrative | Enforce [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md) — name actual pilot vendors only |

---

## Related docs & tasks

| Resource | Topic |
|----------|-------|
| [`vendor-registration-flow-design.md`](./vendor-registration-flow-design.md) | UX + status machine |
| [`stripe-connect-vendor-test-plan.md`](./stripe-connect-vendor-test-plan.md) | Connect L0–L4 |
| [`pilot-execution-checklist.md`](./pilot-execution-checklist.md) | Pilot gate sequence |
| [`pilot-metrics-review-process.md`](./pilot-metrics-review-process.md) | R0–R5 KPI reviews |
| Task 32 | `e2e/vendor-registration.spec.ts` |
| Task 65 | `/vendor` recruitment landing |
| Task 105 | `docs/vendor-seeding-execution.md` (operational runbook) |

---

## Next action (owner: PM + Ops)

1. Confirm **3 design-partner LOIs** for EcoPack / CleanPro / ChefTools (or regional equivalents).  
2. Schedule staging category seed + vendor kickoff call.  
3. Track onboarding in pilot checklist — target **Phase 1 complete** before first paid pilot demo.

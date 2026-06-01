# WooCommerce Subscriptions — Go / No-Go Decision

**Status:** **NO-GO** for production bridge through pilot · **GO** to keep Phase 1 read-only as PLACEHOLDER  
**Decision date:** 2026-06-01  
**Audience:** Product, Commercial, Integrations, Founder  
**Technical RFC:** [`woocommerce-subscriptions-rfc.md`](./woocommerce-subscriptions-rfc.md)

---

## Executive decision

| Scope | Verdict | Rationale |
|-------|---------|-----------|
| **Phase 1** — read-only Woo REST list in dashboard | **GO (maintain)** | Low risk visibility; already shipped (`woocommerce-subscriptions-service.ts`, `/dashboard/integrations/woocommerce-subscriptions`) |
| **Phase 2** — renewal order ingest → Order Hub | **NO-GO until post-pilot** | Requires vault live Woo smoke + product mapping at scale; duplicates native meal-plan cron risk |
| **Phase 3** — link Woo sub ↔ `CustomerSubscription` | **NO-GO until post-pilot** | Schema + CRM linking not pilot-critical |
| **Phase 4** — bidirectional billing sync | **NO-GO (defer 2026 H2+)** | High billing/PCI risk; partner SOW only |
| **Sales claim “Woo Subscriptions sync”** | **NO-GO** | Registry + competitor tracker remain **PLACEHOLDER** |

**One-line:** Meal-prep pilots use **native OS Kitchen meal plans**; Woo-primary merchants get **read-only subscription visibility** — not recurring billing parity.

---

## Context (June 2026)

| Signal | State |
|--------|-------|
| Woo one-time channel | BETA — custom app pattern; live smoke **SKIPPED** (vault 0/11) |
| Native recurring | `CustomerSubscription`, `MealPlan`, `meal-plan-auto-renew` cron — **shipped** |
| Woo Subs service | Read-only REST fetch — **shipped** |
| Woo Subs UI | `/dashboard/integrations/woocommerce-subscriptions` — **shipped** |
| Persistence / webhooks | **Not shipped** — no `ExternalSubscription` table, no renewal ingest |
| Pilot GO/NO-GO | **NO-GO** — no signed LOI, no live channel proof |
| Competitor tracker | `woocommerce-subscriptions-rfc` → **placeholder**, salesClaim **NO** |

---

## Options considered

### A — Full bridge before pilot (Phase 2+ now)

**Rejected.** Engineering bandwidth better spent on vault P0, cross-channel live proof, and native meal-plan pilot path. Renewal ingest without live Woo smoke would produce fake PASS artifacts.

### B — Native meal plans only; hide Woo Subs UI

**Rejected.** Merchants on WordPress ask about Woo Subscriptions in discovery calls; hiding the page increases support friction. Read-only panel sets honest expectations.

### C — Maintain Phase 1 PLACEHOLDER; defer Phase 2+ (selected)

**Accepted.** Aligns with [`page-maturity-honesty.ts`](../lib/navigation/page-maturity-honesty.ts): *“Meal subscriptions BETA — native meal plans only; WooCommerce Subscriptions bridge not implemented.”*

---

## ICP guidance

| Merchant profile | Recommended path |
|------------------|------------------|
| Greenfield meal prep on OS Kitchen | **Native meal plans** + storefront Stripe |
| Woo store + existing subscription base | Woo one-time orders + **native meal plans for kitchen ops**; Woo Subs stay in Woo for billing |
| Woo-primary, refuses native billing | **Disqualify for pilot** or services SOW for Phase 2 post-LOI |
| Shopify subscription brands | Shopify checkout + native meal plans — **not** Woo Subs scope |

---

## What ships today (evidence)

| Capability | Evidence | Sales safe? |
|------------|----------|-------------|
| Read-only Woo subscription list | `fetchWooSubscriptionsReadOnly()` | **ONLY_WITH_CAVEAT** — requires Woo Subs plugin + REST keys |
| Normalization unit test | `tests/unit/woocommerce-subscriptions-service.test.ts` | Internal only |
| Dashboard page | `app/dashboard/integrations/woocommerce-subscriptions/page.tsx` | Label **Phase 1 / read-only** |
| Native meal plans | `/dashboard/meal-subscriptions`, `/dashboard/meal-plans` | **YES (BETA)** with pilot scope |
| Renewal → production | — | **NO** |

---

## Revisit triggers (when to reopen Phase 2)

All required before changing NO-GO:

1. **Vault 11/11** + `npm run smoke:woo-live` → **PASSED**
2. **Signed pilot LOI** with explicit Woo-primary subscription ICP (≥ 2 design partners queued)
3. **Product mapping** stable for subscription SKUs (unmapped queue &lt; 5% on pilot catalog)
4. **Native meal-plan pilot** Week 1 metrics captured ([`pilot-week1-checklist.md`](./pilot-week1-checklist.md))
5. **Engineering capacity** — no active P0 staging proof or cross-channel live blockers

**Target revisit:** Q3 2026 steering review or first Woo-primary LOI signed.

---

## Phase 2 scope preview (if reopened)

When triggers met, promote to **CONDITIONAL GO** for Phase 2 only:

| Deliverable | Exit |
|-------------|------|
| Webhook: subscription renewal → `ExternalOrder` | Idempotent renewal in Order Hub |
| `sourceMetadataJson.wooSubscriptionId` on orders | Production queue linkage |
| Staging proof artifact | `artifacts/woo-subs-renewal-ingest-summary.json` PASS |

Phase 3–4 remain **NO-GO** until Phase 2 artifact PASS + 30-day pilot burn-in.

---

## Safe sales wording

**Allowed:**

- “Native meal plan subscriptions for kitchen production (BETA)”
- “Read-only visibility into WooCommerce Subscriptions when the official extension is installed”
- “WooCommerce one-time order ingest (BETA, custom app)”

**Not allowed:**

- “WooCommerce Subscriptions sync”
- “Renewals automatically drive your production queue from Woo”
- “Replace Woo Subscriptions with OS Kitchen billing”
- “Full recurring commerce parity with WordPress”

---

## Registry & tracker updates

| Artifact | Value |
|----------|-------|
| `artifacts/competitor-feature-tracker.json` → `woocommerce-subscriptions-rfc` | `placeholder` / `salesClaim: NO` — **unchanged** |
| Integration registry capability | `subscriptions_sync: preview` — not `live` |
| Nav maturity | Keep preview/hidden from default sidebar if not pilot-critical |

---

## Decision log

| Date | Decision | Approver |
|------|----------|----------|
| 2026-05-31 | RFC Phase 0 accepted; Option B then C recommended | Engineering |
| 2026-06-01 | **NO-GO Phase 2+ through pilot**; maintain Phase 1 PLACEHOLDER | 30-action executor / Product |

---

## References

- RFC: [`woocommerce-subscriptions-rfc.md`](./woocommerce-subscriptions-rfc.md)
- Service: `services/integrations/woocommerce-subscriptions-service.ts`
- Native meal plans: `/dashboard/meal-subscriptions`
- Woo credentials: [`woocommerce-credentials-guide.md`](./woocommerce-credentials-guide.md)
- Storefront honesty: [`STOREFRONT_COMMERCE_EVOLUTION.md`](./STOREFRONT_COMMERCE_EVOLUTION.md)

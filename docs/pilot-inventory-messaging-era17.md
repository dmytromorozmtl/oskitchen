# Era 17 — Pilot inventory messaging (sales training)

**Policy:** `era17-pilot-inventory-messaging-v1`  
**Status:** **pilot_inventory_messaging_ready**  
**Storefront hook:** **deferred_locked** (unchanged)  
**Parent:** [`pos-only-inventory-lock-era17.md`](./pos-only-inventory-lock-era17.md) · [`commercial-pilot-runbook.md`](./commercial-pilot-runbook.md)

Use this guide before demo calls, discovery decks, and pilot contracts. Inventory is a common source of overclaim — KitchenOS depletes stock on **POS sales only** during pilot.

---

## Purpose and honest scope

KitchenOS supports **qualified pilot inventory** with:

- Recipe-linked ingredient depletion on **POS checkout** (when products have active recipes)
- Inventory counts, waste, and variance workflows (**beta**)
- Honest separation from storefront / online / API order channels

**Not in pilot scope:** unified cross-channel stock, storefront checkout depletion, or real-time inventory sync across ecommerce and POS.

Policies: `era4-pos-only-v1`, `era5-pos-only-gtm-lock-v1`, `era17-pos-only-inventory-lock-v1`.

---

## What depletes in pilot

| Channel | Depletes on-hand? | Evidence |
|---------|-------------------|----------|
| POS register checkout | **Yes** — when product has active recipe | `pos-inventory-depletion.integration.test.ts` |
| Manual dashboard order | **No** | `actions/order-creation.ts` — no depletion hook |
| Storefront checkout | **No** | `actions/storefront-order.ts` — no depletion hook |
| Public API order create | **No** | `app/api/public/v1/orders/route.ts` |
| Woo / Shopify webhook order | **No** | webhook handlers — no depletion hook |

---

## What does not deplete

- Storefront and online orders (even when payment succeeds)
- Marketplace-import orders (Woo, Shopify webhooks)
- Manual order creation from dashboard
- Public API v1 POST orders

**Why:** Payment timing, refunds, and idempotency for non-POS channels are not certified. Storefront hook status: **deferred_locked**.

---

## Safe sales phrases

Use verbatim or close paraphrase in decks and contracts:

1. "POS register sales deplete recipe ingredients when products have active recipes configured."
2. "Storefront and online orders do **not** reduce on-hand inventory in pilot scope."
3. "Inventory counts and waste workflows are **beta** — qualified pilot path."
4. "Cross-channel stock sync is **not** included in pilot — POS-only depletion."

---

## Forbidden sales phrases

Never use in sales materials, demos, or pilot contracts:

- "Unified inventory across POS and ecommerce"
- "Storefront checkout depletes stock automatically"
- "Online orders reduce on-hand inventory in real time"
- "All channels deplete" / "every sale updates stock"
- "Toast/Lightspeed-class unified inventory"

Enforcement: `npm run smoke:pilot-forbidden-claims-enforcement` blocks contracts with forbidden claims.

---

## Demo and discovery script

**When prospect asks about inventory:**

1. Confirm they care about **kitchen/ingredient tracking** vs **multi-location ERP**.
2. Show POS sale → inventory impact (if recipes configured on demo menu).
3. State explicitly: "Online orders appear in order hub but do **not** deplete stock in pilot."
4. Point to inventory counts page for manual reconciliation if they run ecommerce + POS.
5. Do not demo storefront depletion — it is not implemented.

**If they need unified stock:** document as **post-pilot roadmap item**, not pilot commitment.

---

## Objection handling

| Objection | Honest response |
|-----------|-----------------|
| "Does Shopify reduce my stock?" | "Not in pilot — Woo/Shopify orders import to order hub; depletion is POS-only today." |
| "We need one inventory number everywhere" | "Pilot covers POS depletion + counts; unified cross-channel depletion requires a future certified hook." |
| "Competitor X does unified inventory" | "We certify honestly per channel — POS is proven in CI; ecommerce depletion is deferred until payment/idempotency design is scoped." |
| "Can you turn on storefront depletion for us?" | "Not without explicit era unlock, integration tests, and contract amendment — default is deferred_locked." |

---

## Pre-contract checklist

| # | Item | Owner | Pass |
|---|------|-------|------|
| 1 | Contract uses **POS-only depletion** wording (Exhibit / limitations) | Sales + legal | ☐ |
| 2 | Deck/demo script reviewed — no forbidden phrases | Sales | ☐ |
| 3 | `npm run smoke:pilot-forbidden-claims-enforcement` PASS on release branch | GTM + eng | ☐ |
| 4 | `npm run smoke:pos-only-inventory-lock` — `lockProofStatus: proof_passed` | Eng | ☐ |
| 5 | Prospect told storefront/API orders do not deplete | AE / founder | ☐ |
| 6 | Optional: record training attestation via smoke env | Sales ops | ☐ |

Record attestation:

```bash
export PILOT_INVENTORY_MESSAGING_ATTESTATION_EMAIL="sales-lead@example.com"
npm run smoke:pilot-inventory-messaging
```

---

## Validation

```bash
npm run test:ci:pilot-inventory-messaging-era17:cert
npm run test:ci:inventory-depletion:cert
npm run smoke:pos-only-inventory-lock
npm run smoke:pilot-forbidden-claims-enforcement
```

Review **`artifacts/pilot-inventory-messaging-summary.json`**.

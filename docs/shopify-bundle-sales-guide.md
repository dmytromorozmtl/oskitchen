# Shopify Bundle — Competitive Positioning & Sales Guide

**Status:** Production-ready integration (custom app beta) + dedicated landing  
**Audience:** Sales, Shopify-first operators, meal prep / catering / ghost kitchen brands  
**Technical:** [`/dashboard/integrations/shopify`](../app/dashboard/integrations/shopify/page.tsx) · [`/shopify`](../app/shopify/page.tsx) · [`cross-channel-inventory-sync.ts`](../services/inventory/cross-channel-inventory-sync.ts)

---

## One-line pitch

**Keep Shopify for checkout. Run production, inventory, POS, and optional B2B AR on one kitchen operating system.**

---

## Positioning headline

> **Shopify sells it. OS Kitchen makes it.**

Subheading: **Your Shopify store. Your kitchen. One operating system.**

---

## Target audience

| Segment | Why they care | Entry hook |
|---------|---------------|------------|
| **Meal prep / subscription brands** | Shopify checkout + weekly production batches | "Stop copying Shopify orders into spreadsheets" |
| **Catering + ecommerce** | Mixed pickup, delivery, and wholesale | "One Order Hub for Shopify and counter sales" |
| **Ghost kitchen / multi-brand** | Multiple Shopify stores, one kitchen | "Cross-channel inventory with conflict alerts" |
| **Shopify B2B wholesale** | Net terms, aging, credit limits | "Optional AR command center — same spine as KDS" |
| **Retail + food hybrid** | POS counter + Shopify online | "Inventory sync between POS master and Shopify" |

---

## Competitor comparison

| Capability | Shopify POS alone | Shopify + ERP bridge | **OS Kitchen bundle** |
|------------|-------------------|----------------------|------------------------|
| Kitchen display / production | ❌ | ❌ | **✅ KDS + production queues** |
| Order Hub (all channels) | Shopify-only | Partial | **✅ Shopify + POS + catering** |
| Cross-channel inventory | Shopify catalog only | Add-on cost | **✅ Included with health dashboard** |
| B2B AR / collections | Shopify Plus | Separate finance tool | **✅ Optional AR dashboard (flagged)** |
| Catering / meal prep workflows | Limited | Custom | **✅ Native order spine** |
| Setup | Native | Integration project | **Custom app (beta) — ~30 min** |

---

## Competitive moat

1. **Kitchen-native spine** — Not a generic ERP connector. Orders flow into production, packing, KDS, and costing — the same path as POS and storefront.
2. **Cross-channel inventory included** — Shopify pull/push with conflict queue, health dashboard, and daily reconciliation email (see cross-channel positioning doc).
3. **Optional B2B AR** — Shopify Markets wholesale operators get aging, credit limits, and dunning without leaving the ops workspace.
4. **Honest beta posture** — Custom app today; App Store listing when audit passes. Sales credibility beats overclaiming marketplace approval.

---

## What ships today (evidence)

| Capability | Evidence |
|------------|----------|
| Shopify integration dashboard | `/dashboard/integrations/shopify` |
| Signed order webhooks | `/api/webhooks/shopify/*` |
| Product mapping | `/dashboard/product-mapping` |
| Cross-channel inventory | `/dashboard/inventory/cross-channel` |
| Order Hub | `/dashboard/order-hub` |
| Shopify Markets panels | `ShopifyMarketsPanel`, webhook registry |
| B2B AR (optional) | `/dashboard/receivables`, `SHOPIFY_MARKETS_B2B_AR_DASHBOARD` |
| Public landing | `/shopify` |
| Credentials guide | `docs/shopify-credentials-guide.md` |
| Live smoke (ops) | `npm run smoke:shopify-live` |

**Honesty:** Custom app pattern — not Shopify App Store listed until audit passes. B2B AR is feature-flagged. DoorDash inventory compare is BETA.

---

## Sales pitch (30 seconds)

> "You built your brand on Shopify — keep it. But Shopify doesn't run your kitchen: production batches, KDS tickets, pickup desk, and inventory across counter and online still live elsewhere. OS Kitchen connects via a custom app: orders promote into the same Order Hub as POS, inventory syncs with conflict alerts, and optional B2B AR handles wholesale collections. One operating system behind your Shopify storefront — no rip-and-replace."

---

## Safe sales wording

**Allowed:**

- "Shopify order ingest via signed webhooks"
- "Same Order Hub as POS and catering"
- "Cross-channel inventory sync with Shopify"
- "Custom app integration (beta)"
- "Optional B2B AR for Shopify Markets wholesale"
- "Product mapping between Shopify SKUs and kitchen products"

**Not allowed:**

- "Shopify App Store approved"
- "One-click OAuth install" (until shipped)
- "Real-time guaranteed sync"
- "Replaces Shopify POS entirely"
- "Certified Shopify Plus partner" (unless contract exists)

---

## Objection handling

| Objection | Response |
|-----------|----------|
| "We already use Shopify POS" | Keep it for simple retail if it works. OS Kitchen wins when you need kitchen production, catering, cross-channel inventory, or B2B AR — not a forced POS swap. |
| "Why not a Shopify app from the store?" | We're on custom app today for faster iteration and honest scope. App Store submission is planned — we don't claim listing until audit passes. |
| "Inventory sync scary" | Health dashboard shows last synced per channel. Conflicts land in a queue with email alerts — staff pick Kitchen wins or Channel wins. Daily reconciliation email included. |
| "Wholesale is Shopify Plus" | Plus handles checkout. OS Kitchen adds operator-grade aging, credit utilization, and dunning in the same workspace as kitchen ops — optional flag. |

---

## Demo flow (10 minutes)

1. **`/shopify`** — hero, pain/solution, comparison table.
2. **`/dashboard/integrations/shopify`** — connect custom app, webhook URLs, test connection.
3. **Order Hub** — show promoted Shopify order beside a POS order.
4. **Cross-channel inventory** — health dashboard, conflict queue.
5. **Product mapping** — map one SKU, show unmapped queue.
6. **Optional:** Receivables if B2B flag enabled.

---

## Proof path

```bash
npm test -- tests/unit/shopify-bundle-landing.test.ts
npm test -- tests/unit/cross-channel-inventory-sync.test.ts
npm run smoke:shopify-live   # requires staging credentials
```

Landing: [https://kitchenos.app/shopify](https://kitchenos.app/shopify)

# OS Kitchen — Core Operational Flow Audit

**Date:** 2026-05-15  
**Scope:** End-to-end operational narratives for Commerce OS + Operations OS.

Legend: **OK** = architecture supports flow; **Gap** = product/engineering follow-up.

---

## 1. POS ready-now sale

**Path:** POS terminal → checkout → receipt → order detail → CRM → analytics.

| Step | Status | Notes |
|------|--------|-------|
| POS checkout | **OK** | `pos-checkout-service`, terminal UI. |
| Receipt | **OK** | `pos-receipt-service`, receipts page. |
| Order detail | **OK** | Dashboard orders / order detail routes. |
| CRM link | **Gap** | Depends on customer capture rules at checkout — verify POS CRM search rate limits + linking UX. |
| Analytics | **OK** | POS analytics service; confirm events emitted on same code path as web orders (**P2** parity). |

---

## 2. POS made-to-order sale

**Path:** POS → order → production → packing (optional) → complete.

| Step | Status | Notes |
|------|--------|-------|
| Order creation | **OK** | Workflow services. |
| Production | **OK** | Production command center + generation services. |
| Packing | **OK** | When enabled for workspace. |
| Status transitions | **Gap** | Validate blockers in `order-lifecycle-service` for each vertical preset (**P2** matrix test). |

---

## 3. Storefront order / request

**Path:** Storefront → Order Hub → Order Detail → production / packing / pickup.

| Step | Status | Notes |
|------|--------|-------|
| Checkout | **OK** | `store-checkout-client`, `submitPublicStorefrontOrder`. |
| Pay later vs online | **OK** | Gated by `onlineCheckoutAllowed` + Stripe mode. |
| Hub visibility | **Gap** | Ensure channel labels consistent with import orders (**P2** UX). |

---

## 4. Imported Woo / Shopify order

**Path:** Webhook → async job → Order Hub → product mapping → production.

| Step | Status | Notes |
|------|--------|-------|
| Webhook ingest | **OK** | Routes under `app/api/webhooks/*` + async jobs. |
| Error recovery | **OK** | `FAILED_WEBHOOK_TO_ERROR_RECOVERY` doc + services. |
| Mapping | **Gap** | Operator must approve mappings — by design; strengthen empty states (**UX audit**). |

---

## 5. Manual order

**Path:** Create order → fulfillment → production / packing / route.

| Step | Status | Notes |
|------|--------|-------|
| Creation center | **OK** | `app/dashboard` order creation + actions. |
| Fulfillment | **OK** | Fulfillment requirement service. |

---

## 6. Catering quote

**Path:** Quote → approved event/order → production → loadout → follow-up.

| Step | Status | Notes |
|------|--------|-------|
| Quote services | **OK** | `services/catering/*`. |
| Conversion | **OK** | `quote-conversion-service` — verify CRM follow-up templates (**P2**). |

---

## 7. Meal prep weekly loop

**Path:** Menu → preorder window → production → packing labels → routes.

| Step | Status | Notes |
|------|--------|-------|
| Meal plans module | **OK** | Routes + services exist. |
| Notifications | **Gap** | Depends on Resend env + templates — classify as ops dependency (**P1** ops). |

---

## 8. Delivery

**Path:** Order → address → route → driver → complete.

| Step | Status | Notes |
|------|--------|-------|
| Uber Direct integration | **Partial** | Provider-specific; verify env + sandbox vs prod claims (**integrations audit**). |
| Driver UI | **OK** | `/driver` surface — confirm role guard (**security audit**). |

---

## 9. Cross-cutting gaps

| Gap | Priority |
|-----|----------|
| Unified “next best action” on order detail for stuck states | **P2** |
| Activity + audit parity for automation-driven transitions | **P2** |
| Analytics event completeness across POS vs web | **P2** |

---

## 10. Fixes applied this pass

- Storefront cart memoization clarity supports reliable checkout line computation (**indirect** operational reliability).

No lifecycle enum migrations in this pass.

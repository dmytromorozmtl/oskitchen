# Performance Fixes Applied (Audit Pass 2026-05-15)

This document lists **safe, low-risk** performance-related changes applied during the full-system audit.

---

## 1. Storefront image loading

**Change:** Added `loading="lazy"` and `decoding="async"` to storefront `<img>` elements that render product imagery and header logo.

**Files:**

- `components/storefront/store-menu-client.tsx`
- `components/storefront/StorefrontNavigation.tsx`
- `components/storefront/store-product-detail-client.tsx`

**Why:** Reduces initial network contention on mobile storefronts and improves LCP/CLS behavior for below-the-fold imagery.

**Risk:** Low. Standard HTML attributes; no behavior change to cart/checkout logic.

---

## 2. React `useMemo` dependency clarity (storefront cart)

**Change:** Used `void tick` / `void cartTick` inside `useMemo` callbacks so dependency arrays correctly express “bust memo when storage-driven events fire” without ESLint suppressions.

**Files:**

- `components/storefront/store-cart-client.tsx`
- `components/storefront/store-checkout-client.tsx`

**Why:** Keeps cart lines in sync with `sessionStorage` updates while satisfying `react-hooks/exhaustive-deps`.

**Risk:** Low.

---

## 3. Not applied (documented for follow-up)

| Item | Reason |
|------|--------|
| New Prisma composite indexes | Requires staging `EXPLAIN` + migration review. |
| Table virtualization | UI-wide change; needs product decision + perf baseline. |
| Route-level Suspense boundaries | Valuable but broader UX change than this pass. |

See `docs/PERFORMANCE_QUERY_OPTIMIZATION_AUDIT.md` for the backlog.

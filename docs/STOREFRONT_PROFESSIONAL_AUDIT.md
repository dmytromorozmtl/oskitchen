# KitchenOS — Storefront Professional Audit (`/s/[storeSlug]`)

**Date:** 2026-05-15

---

## 1. Architecture

- **Layout:** `app/s/[storeSlug]/layout.tsx` resolves storefront context (theme, nav, policies).
- **Pages:** Home, menu, product detail, cart, checkout, static-ish pages (about, faq, contact, catering), dynamic custom pages `p/[pageSlug]`, policies, order status/confirmation.
- **SEO:** `sitemap.xml` route per store.

---

## 2. Draft vs published

- Publishing flows live in `services/storefront-builder/publish-service.ts` and related theme publish services.
- **Risk:** Preview token exposure — verify server-side token validation on preview routes (**P1** — confirm `preview-token` API + RSC loaders).

---

## 3. Checkout protection

- Client: `StoreCheckoutClient` enforces `orderingPaused`, minimum order, terms, `onlineCheckoutAllowed`, `payLaterOnly`.
- Server: `submitPublicStorefrontOrder` must re-validate (**P0** if mismatch) — periodic diff client vs server rules.

---

## 4. Security / sanitization

- Rich HTML sections (if any) must sanitize on render — audit section renderer components (**P2**).
- Forms: rate limiting on public POST (**documented** in `docs/PUBLIC_POST_RATE_LIMITING.md`).

---

## 5. UX & content

| Topic | Assessment |
|-------|------------|
| Navigation / footer | Builder-driven — verify empty nav fallback. |
| Pay later clarity | Copy should state when Stripe is unavailable — **P2** microcopy. |
| i18n EN/FR | Infrastructure readiness varies; treat as **P3** unless `next-intl` wired globally. |
| Alt text | Several storefront images used `alt=""` — **P2** accessibility: prefer product title alt. |

---

## 6. Performance

- **Applied this pass:** Lazy-load/decoding attributes on key images (see `PERFORMANCE_FIXES_APPLIED.md`).
- **Next:** Hero LCP image should opt `fetchpriority="high"` selectively (**P2**).

---

## 7. Fixes applied

- Image lazy-loading on menu, nav logo, product detail.
- Cart/checkout memoization fix for consistent totals.

---

## 8. Builder-level gaps (document)

- Section-level scheduling / A/B — not required for MVP honesty.
- Native mobile app — out of scope; web-first.

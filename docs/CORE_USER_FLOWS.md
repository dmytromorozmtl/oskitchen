# Core user flows

Canonical flows for beta QA and CS. Each flow should have **clear CTAs**, **empty states with next steps**, and **visible success/error feedback**.

---

## Flow 1 — New user from zero

1. **Signup** → verify email per Supabase.
2. **Onboarding** → business profile, timezone, fulfillment defaults.
3. **Weekly menu** → `/dashboard/menus` — create menu, set preorder deadline.
4. **Products** → `/dashboard/products` — add SKUs, prices, prepared dates.
5. **First order** → `/dashboard/orders/new` or storefront / manual entry.
6. **Production** → `/dashboard/production` — advance cook/pack/label.
7. **Packing** → `/dashboard/packing` — labels / printable grouping.

**Exit criteria:** Order visible end-to-end; production tasks reflect menu items.

---

## Flow 2 — WooCommerce business

1. **Sales channels** → WooCommerce integration page — connect + store URL + keys (server-side).
2. **Test connection** → use provided test action / webhook status.
3. **Sync products** → map catalog to menu items where applicable.
4. **Orders** → Order Hub — incoming rows; fix **unmatched products** via mapping UI.
5. **Production** → confirm normalized order hits kitchen views.

**Exit criteria:** At least one external order normalized without FAILED sync.

---

## Flow 3 — Shopify business

Same as Flow 2 with Shopify-specific OAuth/App credentials — **no simulated “live” success** without real store; use demo workspace for storytelling.

---

## Flow 4 — Meal prep weekly cycle

1. Duplicate or create menu week → products carry prepared dates.
2. Set **deadline** on menu; publish channels / storefront as needed.
3. Receive orders (channels + storefront).
4. **Forecast** → `/dashboard/forecast` — review deterministic outlook.
5. **Purchasing / demand** → shopping list from recipes + orders.
6. **Production → Packing → Routes** (if delivery).

**Exit criteria:** Demand sheet non-empty when recipes + orders exist.

---

## Flow 5 — Catering quote

1. `/dashboard/catering` — create quote (+ optional first line).
2. Share **`/quote/[token]`** link (email integration placeholder).
3. Customer views quote; operator **converts to order** manually (guided UI pending).
4. Schedule production via calendar / production.

---

## Flow 6 — Delivery day

1. Ensure delivery orders share **pickup date** on orders.
2. `/dashboard/routes` — build route for date.
3. Open Maps links / future manifest PDF.
4. Mark stops delivered (future driver UI); packing verify for handoff.

---

## QA checklist (manual)

- [ ] Each step has a visible **primary CTA**.
- [ ] Empty lists explain **what to do next** with link.
- [ ] Errors never expose Prisma stacks to end users (`safeError`).
- [ ] Demo workspace shows **Demo** banner when enabled.

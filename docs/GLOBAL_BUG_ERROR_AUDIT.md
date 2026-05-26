# KitchenOS — Global Bug & Error Audit

**Date:** 2026-05-15  
**Verification:** `npm run typecheck`, `npm run build`, `npm run lint`, `npm test` (see `docs/FULL_SYSTEM_AUDIT_FINAL_REPORT.md`).

---

## 1. Automated signals (current branch)

| Check | Result | Notes |
|-------|--------|--------|
| TypeScript (`tsc --noEmit`) | **Pass** | Strict mode preserved. |
| Next build | **Pass** | Includes `prisma generate`. |
| ESLint | **Pass** (0 warnings after this audit pass) | Previously: unused imports, storefront `useMemo` deps — **fixed** (P2). |
| Vitest | **Pass** (110 tests + 1 skipped) | New: audit reason sanitization tests. |
| Playwright | Not run in this pass | CI scripts: `test:e2e:public-smoke`, `test:e2e:dashboard` per `package.json`. |

---

## 2. Runtime error-prone areas (manual / heuristic)

| Area | File / pattern | Current behavior | Expected | Risk | Priority | Recommendation |
|------|----------------|------------------|----------|------|----------|------------------|
| Platform access | `lib/platform/platform-guards.ts` | Non-platform users redirected to `/dashboard` | No workspace user on `/platform` | Misconfiguration of `PlatformUserRole` could widen access | **P1** if mis-seeded | Keep bootstrap limited to founder email; audit role inserts. |
| Storefront cart | `store-cart-client.tsx` / `store-checkout-client.tsx` | SessionStorage + event bus | Consistent cart across tabs | Edge: storage blocked | **P2** | `void tick` / `void cartTick` pattern documents intentional memo busting. |
| Cron webhook drain | `app/api/cron/webhook-jobs/route.ts` | 503 if `CRON_SECRET` missing | Cron disabled safely | Jobs backlog in prod if cron not scheduled | **P1** ops | Document in runbooks; alert on queue depth. |
| DB unavailable | Various `prisma.*` in RSC | Throws → error boundary / 500 | Graceful degradation where possible | UX | **P2** | Changelog already try/catches; extend pattern selectively. |

---

## 3. Specific flow checks (spot audit)

### 3.1 Order lifecycle

- Primary logic: `services/workflows/order-lifecycle-service.ts` and order actions in `actions/orders.ts`.
- **Risk:** Enum mismatch between `OrderStatus` (legacy) and `NormalizedOrderStatus` — **P2:** maintain single mapping table in `lib/` and test matrix.

### 3.2 POS checkout

- `services/pos/pos-checkout-service.ts`, `actions/pos.ts`, terminal UI `app/dashboard/pos/terminal/page.tsx`.
- **Risk:** Double-submit / race — mitigated by patterns in actions (verify per mutation).

### 3.3 Storefront publish/preview

- Publish/theme services under `services/storefront-builder/` and `services/storefront/`.
- **Risk:** Preview token leakage — verify `preview-token` route and server-side checks (**security audit**).

### 3.4 Webhook queue / cron

- Documented architecture: `docs/WEBHOOK_QUEUE_RETRY_ARCHITECTURE.md`.
- **Risk:** Stuck `PROCESSING` rows — **P2** monitoring + job age alerts.

### 3.5 Integration health

- Workspace + platform surfaces; services under `services/developer/integration-health-service.ts` and platform variants.
- **Risk:** Stale “green” if last success old — **P2** show last success timestamp prominently.

### 3.6 Rate limiting

- `services/security/rate-limit-service.ts`, policies `lib/rate-limit/rate-limit-policies.ts`, tests `tests/unit/rate-limit.test.ts`.
- **Status:** Memory adapter in tests; production may use Redis/Upstash per env — **P1** verify env in staging.

### 3.7 Support replies

- `actions/support-tickets.ts`, `services/support/ticket-service.ts`.
- **Risk:** Internal vs customer-visible conflation — **P1** UX/legal; verify field separation in DB model + UI labels.

### 3.8 Billing disabled states

- `BillingMode`, entitlement checks in dashboard layout (`app/dashboard/layout.tsx` uses `billingAccess`).
- **Risk:** Owner confusion when `DEV_DISABLED` — **P2** copy improvements.

### 3.9 Demo seed/reset

- `services/demo/*`, `actions/demo.ts`.
- **Risk:** Destructive reset without audit — verify audit hooks (**security audit**).

### 3.10 Product mapping approval

- `services/product-mapping/product-mapping-service.ts`, dashboard mapping pages.
- **Risk:** Approved mapping edits — pages warn operator; enforce server-side **P1**.

### 3.11 Packing verification

- `actions/packing-verify.ts`, `actions/packing-verification.ts`.
- **Risk:** Scanner edge cases — **P2** hardware QA.

### 3.12 Route generation

- `services/routes/route-service.ts`, `actions/delivery-route.ts`.
- **Risk:** Partial routes on bad addresses — **P2** validation messages.

### 3.13 CRM customer linking

- `services/crm/*`, `actions/customers.ts`.
- **Risk:** Duplicate profiles — dedupe pages exist under `app/dashboard/customers/dedup*`.

---

## 4. P0 / P1 fixes applied in this audit pass

| Issue | Fix |
|-------|-----|
| ESLint noise / minor hygiene | Removed unused imports; fixed `useMemo` dependency lint via `void tick` / `void cartTick`; small import trims across settings and product-mapping pages. |
| Storefront image performance | Added `loading="lazy"` and `decoding="async"` to key storefront `<img>` tags (`store-menu-client`, `StorefrontNavigation`, `store-product-detail-client`). |
| Audit reason hygiene test gap | Added `tests/unit/audit-reason-sanitization.test.ts` for secret stripping + default retention metadata. |

---

## 5. P2 / P3 backlog (document only)

- Migrate from deprecated `next lint` to ESLint CLI (Next 16 prep).
- Introduce `knip`/`ts-prune` for dead exports.
- Expand Playwright coverage beyond smoke for POS + storefront checkout.
- Standardize status strings via shared `formatOrderStatus` helper for all UI surfaces.

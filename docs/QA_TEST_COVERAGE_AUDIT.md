# OS Kitchen — QA & Test Coverage Audit

**Date:** 2026-05-15

---

## 1. Current inventory

| Layer | Tooling | Location | Status |
|-------|-----------|----------|--------|
| Unit / integration | Vitest | `tests/unit`, `tests/integration` | **110 passing** (+1 skipped) in this pass |
| E2E | Playwright | `tests/e2e`, `e2e/` | Scripts in `package.json`; not executed in this audit shell pass |
| POS / production E2E | Playwright | `tests/e2e/pos-production.spec.ts` | Exists |

---

## 2. Notable tests (security / ops)

- `tests/e2e/platform-access-denial.spec.ts` — unauthenticated `/platform` → `/login`.
- `tests/unit/rate-limit.test.ts` — memory adapter + policy smoke.
- `tests/unit/rate-limit-production-warning.test.ts` — production warning behavior.
- `tests/unit/audit-reason-sanitization.test.ts` — **added this pass** for secret stripping + audit metadata defaults.

---

## 3. Gaps vs requested coverage

| Desired coverage | Gap | Priority |
|------------------|-----|----------|
| Order lifecycle blockers | Partial unit; needs workflow fixture tests | **P1** |
| POS ready-now vs made-to-order | E2E exists but not run here | **P1** |
| Webhook job retry/fail | Integration tests exist (`error-recovery-item.integration.test.ts`); expand cases | **P2** |
| Platform denial (authenticated non-platform) | Add Vitest with mocked prisma OR extend Playwright | **P2** |
| Support reply vs internal note | Need assertion on field separation | **P1** |
| Storefront checkout protection | Add unit tests around server action validation (pure functions extracted if needed) | **P1** |
| Capability matrix statuses | Snapshot test for registry labels | **P3** |
| AvT confidence | Add tests on `actual-vs-theoretical-service` pure math helpers | **P2** |
| Inventory shortage “real data only” | Clarify fixtures vs production flags in tests | **P2** |

---

## 4. CI assumptions

- Tests must **not** require live Shopify/Woo/Stripe keys — continue mocking HTTP + using prisma test doubles / sqlite if introduced later.
- Current suite uses memory rate limiter — OK.

---

## 5. Recommended next tests (additive)

1. **Authenticated** user **without** `PlatformUserRole` cannot POST `webhook-replay` (integration).
2. Extract `submitPublicStorefrontOrder` validation prelude into `lib/storefront/checkout-validation.ts` and unit-test matrix.
3. Support ticket: internal note field never returned to non-staff API consumer.

---

## 6. Fixes applied

- New audit sanitization tests (see above).

# Negative test suite (P3-54)

**Policy:** `negative-test-suite-p3-54-v1`  
**Department:** QA  
**Registry:** [`artifacts/negative-test-suite-p3-54-registry.json`](../artifacts/negative-test-suite-p3-54-registry.json)

---

## Scope

Five negative-path modules that must fail closed:

| Module | Spec | Expected denial |
|--------|------|-----------------|
| **Invalid signature** | `tests/unit/webhook-signature-regression.test.ts` | HTTP 401 on webhook ingress |
| **Replay webhook** | `e2e/webhook-replay-idempotency.spec.ts` | Idempotent duplicate ingest |
| **Wrong tenant** | `e2e/cross-tenant-e2e.spec.ts` | HTTP 403/404 on foreign workspace |
| **Expired session** | `e2e/expired-session-e2e.spec.ts` | Login redirect / HTTP 401 |
| **No permission** | `e2e/role-permissions-matrix.spec.ts` | Permission-denied surface |

---

## Run

```bash
npm run check:negative-test-suite-p3-54
npm run audit:negative-test-suite-p3-54
npm run test:e2e:negative-test-suite-p3-54
E2E_NEGATIVE_TEST_SUITE=true npx playwright test e2e/negative-test-suite-p3-54.spec.ts
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

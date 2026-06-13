# Integration test pack (P3-53)

**Policy:** `integration-test-pack-p3-53-v1`  
**Department:** QA  
**Registry:** [`artifacts/integration-test-pack-p3-53-registry.json`](../artifacts/integration-test-pack-p3-53-registry.json)

---

## Scope

Orchestrated integration test pack covering seven money-path modules:

| Module | Spec | Flow |
|--------|------|------|
| **Shopify webhook** | `e2e/shopify-webhook-order-hub.spec.ts` | HMAC ingest → order hub row |
| **WooCommerce webhook** | `e2e/woocommerce-webhook-order-hub.spec.ts` | HMAC ingest → order hub row |
| **KDS** | `e2e/kds-playwright.spec.ts` | ticket → bump → expo → complete |
| **POS** | `e2e/pos-checkout-e2e.spec.ts` | shift → item → discount → checkout → receipt |
| **Refund** | `e2e/pos-checkout-e2e.spec.ts` | full refund step |
| **Void** | `e2e/pos-checkout-e2e.spec.ts` | void sale step |
| **Shift** | `e2e/pos-checkout-e2e.spec.ts` | open + close shift |

---

## Credentials (staging / CI)

| Env | Purpose |
|-----|---------|
| `E2E_LOGIN_EMAIL` / `E2E_LOGIN_PASSWORD` | Owner dashboard auth |
| `SHOPIFY_SMOKE_CONNECTION_ID` | Shopify webhook connection |
| `CHANNEL_SMOKE_CONNECTION_ID` | WooCommerce webhook connection |
| `E2E_INTEGRATION_TEST_PACK=true` | Enable live Playwright orchestrator |

Module-specific gates still apply: `E2E_POS_CHECKOUT`, `E2E_KDS_PLAYWRIGHT`, etc.

---

## Run

```bash
npm run check:integration-test-pack-p3-53
npm run audit:integration-test-pack-p3-53
npm run test:e2e:integration-test-pack-p3-53
```

Deploy gate: `.github/workflows/deploy-prod-gate.yml`

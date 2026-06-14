# POS shift open→close E2E (P2-50)

**Policy:** `pos-shift-open-close-p2-50-v1`  
**E2E:** `e2e/pos-checkout-e2e.spec.ts`

Gap P2-50 closes the full POS shift lifecycle: open shift → cash transactions → refund → void → close → reconcile balanced totals in shift history.

## Flow steps

| Step | Implementation |
|------|----------------|
| `open_shift` | `ensureOpenShift` in `e2e/helpers/pos-checkout-shift-flow.ts` |
| `transactions` | Add item, discount, checkout, receipt |
| `refund` | `refundPosTransaction` — full refund on discounted sale |
| `void` | `voidPosTransaction` — void second sale |
| `close_shift` | `closeShiftWithExpectedCash` |
| `reconcile_totals` | `assertClosedShiftTotalsBalanced` — history row shows **Balanced** |

## Run (staging / authed)

```bash
E2E_POS_CHECKOUT=true npm run test:e2e:pos-checkout-e2e
```

Requires `E2E_LOGIN_EMAIL`, `E2E_LOGIN_PASSWORD`, and `DATABASE_URL`.

## CI wiring check

```bash
npm run check:pos-shift-open-close-p2-50
```

## Artifact

`artifacts/pos-shift-open-close-p2-50.json`

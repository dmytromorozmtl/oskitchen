# POS receipt / shift closeout spot check (Era 17)

**Policy:** `era17-pos-receipt-shift-spotcheck-v1`  
**Status:** `closeout_math_spotcheck_documented` — math unit-tested; manual spot check on staging optional

## Closeout formula (test-backed)

```
expectedCash = openingCash + sum(CASH COMPLETED transaction totals on shift)
variance     = closingCashCounted - expectedCash
```

Source: `lib/pos/pos-shift-closeout-math.ts` · `services/pos/pos-shift-service.ts`

**Important:** Only **`paymentMode = CASH`** and **`status = COMPLETED`** transactions count toward expected drawer cash. Card, terminal placeholder, and comped sales do **not** affect cash closeout math.

## Receipt spot check

On **`/dashboard/pos/receipts`**, verify for a sample sale:

| Check | Rule |
|-------|------|
| Line totals | Sum of line items ≈ subtotal |
| Total | `subtotal - discount + tax ≈ total` |
| Payment mode | Matches transaction row |
| Receipt number | Matches `/dashboard/pos/transactions` |

Helper: `receiptTotalsConsistent()` in `pos-shift-closeout-math.ts`.

## Operator spot check (staging)

1. Open shift with known opening float (e.g. $50.00).
2. Complete **two cash sales** ($20 + $10) and one **card/placeholder** sale (must not change expected cash).
3. Expected cash before close: **$80.00** (50 + 30).
4. Count drawer; enter closing cash; note variance if ≠ 0.
5. Open receipts for cash sales — totals match transaction list.

## Limitations

- No automated manager approval when `|variance|` exceeds threshold (future).
- Refunds after close are not re-modeled in this spot check — use transactions/refunds runbook.
- Software-only — no hardware drawer certification claim.

## Validation

```bash
npm run test:ci:pos-receipt-shift-spotcheck-era17:cert
npm run test:ci:pos-money-path:cert
npm run smoke:pos-receipt-shift-spotcheck
```

Optional staging attestation env vars: `POS_RECEIPT_SHIFT_SPOTCHECK_OPERATOR_EMAIL`, `POS_RECEIPT_SHIFT_SPOTCHECK_STAGING_URL`.

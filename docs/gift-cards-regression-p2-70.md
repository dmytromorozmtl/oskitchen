# Gift cards issue/redeem regression (P2-70)

**Policy:** `gift-cards-regression-p2-70-v1`  
**Updated:** 2026-06-16  
**Flow:** issue → balance → redeem partial → balance → redeem remaining

Gap closure for QA task P2-70: deterministic regression suite for gift card lifecycle without live DB in CI.

## Flow chain

| Step | Assertion |
|------|-----------|
| issue | `ACTIVE`, balance = initial amount |
| balance_check | balance unchanged |
| redeem_partial | `PARTIALLY_REDEEMED`, balance reduced |
| balance_after_partial | remaining balance correct |
| redeem_remaining | `REDEEMED`, balance = 0 |

Pure simulator: `lib/gift-cards/gift-cards-regression-p2-70-flow.ts` mirrors `services/gift-cards/gift-card-service.ts` math.

Production wiring:
- Issue: `actions/gift-cards.ts` → `createGiftCard`
- Redeem at POS: `services/pos/pos-checkout-service.ts` → `redeemGiftCard`
- Dashboard: `/dashboard/gift-cards`

## Corpus

8 scenarios (`buildGiftCardRegressionCorpusP270`):

1. Partial then remaining (golden path)
2. Single full redeem
3. Over-redeem clamped to balance
4. Triple partial drain
5. Small denomination partial chain
6. Redeemed card blocks further redemption
7. Partial then over-request remaining
8. Custom code preserved through chain

## CI

```bash
npm run check:gift-cards-regression-p2-70
```

## Artifact

`artifacts/gift-cards-regression-p2-70.json`

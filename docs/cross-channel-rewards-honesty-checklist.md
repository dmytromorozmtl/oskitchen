# Cross-channel rewards — honesty checklist (pilot / GTM)

**Policy:** `era14-cross-channel-rewards-recert-v1` (`lib/rewards/cross-channel-rewards-era14-policy.ts`)

**Extends:** `era4-cross-channel-rewards-v1`, `era6-dual-ledger-gtm-lock-v1`, `era10-cross-channel-rewards-recert-v1`

**Posture:** **dual ledger** — kitchen (POS) and storefront rewards are not interchangeable.

## Certified today

| Channel | Capability | Evidence |
|---------|------------|----------|
| POS (kitchen ledger) | Gift card + loyalty redeem at checkout | `services/pos/pos-checkout-service.ts`; `test:ci:cross-channel-rewards` |
| Storefront | Separate gift/loyalty tables + APIs | `services/storefront/gift-card-service.ts`, `services/storefront/loyalty-service.ts` |

## Not certified (honest gaps)

| Claim | Status |
|-------|--------|
| Unified gift card / loyalty balance across POS and storefront | **deferred_locked** — separate Prisma models |
| Storefront checkout redeems kitchen-ledger codes | **Not wired** — `giftCardCheckoutRedeemWired: false` |
| POS accepts storefront-issued codes | **Not certified** |
| Cross-channel Playwright E2E in default CI | **None** — no unified browser proof |
| Interchangeable codes in sales/GTM copy | **Forbidden** — GTM lock scan in `test:ci:cross-channel-rewards:cert` |

## Automated certification smoke (local / pre-pilot)

```bash
npm run smoke:cross-channel-rewards
```

Runs `test:ci:cross-channel-rewards:cert` (era4 + era6 GTM lock + era10 + era14 recert). Does **not** run browser E2E.

## Manual pilot / sales checklist

1. POS demo — show gift card / loyalty redeem on a kitchen order only.
2. Storefront demo — describe online gift/loyalty as a **separate** ledger unless/until unification era ships.
3. Never claim “redeem the same code on POS and online.”
4. Reference `docs/feature-maturity-matrix.md` Loyalty + Gift cards rows before customer commitments.

## CI certification

- `npm run test:ci:cross-channel-rewards-era14:cert` (chained in `test:ci:cross-channel-rewards:cert`)
- Governance: `test:ci:governance-bundles:partition-money-path`

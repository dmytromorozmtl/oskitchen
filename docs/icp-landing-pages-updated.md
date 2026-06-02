# ICP landing pages — marketplace + AI moats update

**Updated:** 2026-06-02  
**Task:** 122-cycle #64 — P1 Marketing  
**Policy refs:** [`sales-safe-claims-registry.md`](./sales-safe-claims-registry.md), [`ai-moats-honest-positioning.md`](./ai-moats-honest-positioning.md)

## Routes updated

| Route | Component | Changes |
|-------|-----------|---------|
| `/shopify` | `ShopifyBundleLanding` | Softened inventory/sync claims; added AI moats + B2B marketplace sections |
| `/landing/ghost-kitchen` | `IcpLandingPage` | AI moats + marketplace sections; limitations extended |
| `/landing/meal-prep` | `IcpLandingPage` | AI moats + marketplace sections; limitations extended |
| `/landing/weekly-preorder` | `IcpLandingPage` | AI moats + marketplace sections; limitations extended |

## Honesty fixes (Shopify)

- Removed “production-ready” inventory sync FAQ claim — replaced with BETA + POS-scoped depletion wording.
- Cross-channel inventory feature cards now labeled BETA; no unified depletion sales claim.
- Comparison table inventory row uses BETA qualifier.

## New shared content

- `lib/marketing/platform-differentiators-content.ts` — `MARKETING_AI_MOATS_BLOCK`, `MARKETING_B2B_MARKETPLACE_BLOCK`

## Safe headline retained

**7 proprietary AI modules in production** — with per-module maturity badges and footnotes on every ICP surface.

## Marketplace positioning

**HoReCa buyer marketplace (BETA scaffold)** — catalog/cart/checkout/PO path; vendor seeding required; not live vendor network parity.

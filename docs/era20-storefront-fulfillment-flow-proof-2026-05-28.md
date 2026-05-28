# Era 20 — Storefront fulfillment flow proof

**Policy:** `era20-storefront-fulfillment-flow-proof-v1` (`KOS-E20-011`)  
**Parent workflow:** `storefront_to_packing` (`era20-operator-golden-path-proof-v1`)

## Five hops

| # | Hop | UI | Proof state (pre-P0) |
|---|-----|-----|----------------------|
| 1 | Storefront published | `/dashboard/storefront` | CI backed |
| 2 | Order ingested | `/dashboard/order-hub` | **P0 blocked** (channel smoke) |
| 3 | Order hub triage | `/dashboard/order-hub` | CI backed |
| 4 | KDS bump | `/dashboard/kitchen` | Staging manual |
| 5 | Packing verify | `/dashboard/packing` | Staging manual |

## UI

Order hub shows **Fulfillment flow proof** panel (`order-hub-fulfillment-flow-proof`) with hop-level blockers and deep links.

## Tier 2

Execute Era 17 operator golden path **orders** + **kds** phases after P0 PASS:

```bash
npm run smoke:pilot-operator-golden-path
```

## Code

- `lib/commercial/era20-storefront-fulfillment-flow-proof-era20.ts`
- `components/dashboard/order-hub/order-hub-fulfillment-flow-proof-panel.tsx`

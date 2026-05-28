# Era 20 — POS money path flow proof

**Policy:** `era20-pos-money-path-flow-proof-v1` (`KOS-E20-012`)  
**Parent workflow:** `pos_to_inventory`

## Five hops

| # | Hop | UI | Proof |
|---|-----|-----|-------|
| 1 | Shift open | `/dashboard/pos/shifts` | Staging manual |
| 2 | POS checkout | `/dashboard/pos/terminal` | CI (`test:ci:pos-money-path:cert`) |
| 3 | Receipt / Order hub | `/dashboard/order-hub?tab=pos` | CI |
| 4 | POS-only depletion | `/dashboard/inventory/pos-impacts` | Pilot scope — **not** unified inventory |
| 5 | Shift closeout | `/dashboard/pos/shifts` | Staging manual |

## Forbidden pilot claims

- Unified inventory across channels
- Storefront auto-depletion (deferred_locked)
- Offline POS / hardware parity

## UI

POS hub (`/dashboard/pos`) — **POS money path proof** panel.

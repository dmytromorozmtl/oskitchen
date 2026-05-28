# Era 20 — Shift closeout flow proof

**Policy:** `era20-shift-closeout-flow-proof-v1` (`KOS-E20-016`)

## Hops

1. Shift open  
2. Terminal sales during open shift  
3. Closeout checklist at `#pos-shift-close`  
4. Variance acknowledged on close  
5. Closeout history review  

## Forbidden claims

- Hardware drawer / Toast closeout parity  
- Automated variance approval without manager review  

## UI

`/dashboard/pos/shifts` — **Shift closeout proof** panel (RBAC + open-shift aware).

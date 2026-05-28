# Era 20 — Manager discount audit flow proof

**Policy:** `era20-manager-discount-audit-flow-proof-v1` (`KOS-E20-013`)

## Hops

1. Shift open  
2. `pos.discount.apply` permission  
3. Override checklist at `#pos-manager-override`  
4. Discount on completed sale (staging manual)  
5. Audit trail review  

## Forbidden claims

- Toast/Square PIN parity  
- Offline override without audit  

## UI

`/dashboard/pos/terminal` — compact **Manager override proof** panel (RBAC-aware).

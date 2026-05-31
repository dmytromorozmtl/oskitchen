# Purchasing module audit (OS Kitchen)

## Current state (after command center pass)

| Area | State | Limitation | Affected | Fix | Pri |
|------|-------|------------|----------|-----|-----|
| `/dashboard/purchasing` | Overview + KPIs + demand rollups + nav | Date/brand filters not on overview yet | Multi-site | Pass filters via searchParams | P1 |
| Supplier rollups | Still from ingredient `supplier` string on demand rows | Duplicates “Unassigned” until Supplier records match by name | All | Match + merge UI | P1 |
| Shortages | Demand shortage + reorder queue OPEN | No production task linkage yet | Production | FK to work item / batch | P1 |
| Ingredient Demand | Shared `loadDemandCommandCenterPayload` | PO lines not auto-created from run | Buyers | “Generate PO from run” action | P1 |
| Supplier model | First-class `Supplier` + create form | No supplier detail tabs yet | Enterprise | `/suppliers/[id]` expand | P2 |
| PO workflow | Draft create + detail + approval event stub | No line editor, approve/send buttons | Ops | PO line mutations + status transitions | P0 |
| Receiving | Read-only event list | No receive form → no stock write (by design) | Inventory | Confirmed receive flow + stock tx | P0 |
| Price history | Table when rows exist | No auto-log on supplier item save | Finance | Hook on item update | P1 |
| Exports | Honest placeholders | No PDF/email | Commissary | Template + clipboard | P2 |
| Permissions | Same as dashboard auth | No purchasing role split | RBAC | Policy map | P2 |
| Audit | `PurchaseApprovalEvent` on draft create | Incomplete coverage | Compliance | Log all transitions | P1 |

## Data model

Additive tables: `suppliers`, `supplier_items`, `purchase_orders`, `purchase_order_lines`, `reorder_queue_items`, `receiving_events`, `supplier_price_history`, `purchase_approval_events`. Migration: `20260507203000_purchasing_command_center`.

## Rules respected

- No fake ERP/email.
- No silent stock updates (receiving UI not wired to `Ingredient.currentStock`).
- Ingredient demand route and math unchanged.

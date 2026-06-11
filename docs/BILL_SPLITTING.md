# Bill splitting

Complete POS tab bill splitting for restaurant table service.

## Modes

| Mode | Behavior |
|------|----------|
| **Equal** | Divide subtotal, tax, and tip evenly across guest count |
| **Percentage** | Custom percentage per guest (normalized to 100%) |
| **Seat** | Assign line items to seat 1..N via `paidById` on tab items |
| **Item** | Assign each line item to a guest |

## Implementation

- Pure math: `lib/pos/bill-splitting.ts`
- Persistence: `PosTabItem.paidById` stores seat/guest assignment
- UI: `components/pos/bill-split-panel.tsx` embedded in Bar & table tabs
- Actions: `actions/pos/bill-split.ts`

## Operator flow

1. Open **POS → Tabs** and select a tab with items.
2. Use **Split bill** to choose mode and review per-guest totals.
3. For seat/item modes, assign lines from the dropdown; assignments persist on the tab.
4. Close the tab when ready — split breakdown is for checkout guidance today.

## Limitations

- Partial per-share checkout (multiple payments against one tab) is not automated yet.
- Split totals include the tab tip field entered above the panel.

See `components/pos/tab-panel.tsx` and `tests/unit/bill-splitting.test.ts`.

**Table service depth (P2-89):** [`table-service-depth.md`](./table-service-depth.md) — merge tables, transfer seats, bar mode, server banking at [`/dashboard/pos/table-service`](/dashboard/pos/table-service).

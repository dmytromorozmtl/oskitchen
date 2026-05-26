# POS Terminal — UI

## Routes

| Path | Role |
| --- | --- |
| `/dashboard/pos` | KPI strip + shortcuts. |
| `/dashboard/pos/terminal` | Touch-first selling (`PosTerminalClient`). |
| `/dashboard/pos/registers` | Create/list registers (native `<form>` + server actions). |
| `/dashboard/pos/shifts` | Open/close shift forms (Team `pos_shifts` gate). |
| `/dashboard/pos/transactions` | Recent `POSTransaction` rows + deep link to `Order`. |
| `/dashboard/pos/receipts` | Receipt list + text preview. |
| `/dashboard/pos/reports` | 30-day aggregates when `pos_reports` allowed. |
| `/dashboard/pos/settings` | Bridge to Control Center POS + hardware. |
| `/dashboard/pos/settings/hardware` | Honest hardware matrix from `lib/pos/pos-hardware.ts`. |

## Terminal layout (`PosTerminalClient`)

- **Left**: Online/offline strip, search + barcode (Enter commits scan), responsive product grid (large tap targets).
- **Right**: Sticky cart card — register, staff, shift summary, fulfillment, payment mode, line qty controls, checkout CTA.
- **Hardware**: Link to hardware checklist.

## Gating

- **Plan**: `pos_terminal` in `app/dashboard/pos/layout.tsx` (upgrade card if denied).
- **Module**: `/dashboard/pos` paths are in `pos_terminal` module registry entry; disabled modules hide nav + block routes via `ModuleRouteGate`.

## Planned UX (not all shipped)

- Dedicated fullscreen shell hiding main sidebar.
- Category rail + favorites/top sellers.
- Customer side panel with PII-scoped CRM fields.
- Hold / recall / void reason modals wired to `pos-cart-service`.

Document gaps are called out in `docs/POS_TERMINAL_READY_REPORT.md`.

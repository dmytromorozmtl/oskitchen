# POS — Registers & Shifts

## Registers (`pos-register-service`)

- `listPosRegisters` — active registers with optional `Location` include.
- `createPosRegister` — name + optional `locationId`, `cashTrackingEnabled` default true.

## Shifts (`pos-shift-service`)

- `getOpenPosShift` — latest `OPEN` row for `(userId, registerId)`.
- `openPosShift` — rejects double-open; writes `POSAuditEvent` `pos.shift.opened`.
- `closePosShift` — sums **cash** `POSTransaction` rows for the shift via `computeShiftCloseout` (`lib/pos/pos-shift-closeout-math.ts`), computes `expected = opening + cashSales`, `variance = closing - expected`, writes `pos.shift.closed` audit. See **`docs/pos-receipt-shift-spotcheck-era17.md`** (`era17-pos-receipt-shift-spotcheck-v1`).

## UI

- `/dashboard/pos/shifts` hosts native HTML forms calling `posOpenShiftFormAction` / `posCloseShiftFormAction`.
- **Entitlement**: `pos_shifts` feature (Team+) enforced inside actions — UI copy explains upgrade path.

## Future

- Manager approval when `|variance|` exceeds configurable threshold.
- Per-staff performance rollups in POS reports.

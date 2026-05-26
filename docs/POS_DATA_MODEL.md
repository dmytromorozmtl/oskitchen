# POS Terminal — Data Model

Prisma models live in `prisma/schema.prisma` (mapped tables `pos_*`). Workspace scoping uses `userId` on `UserProfile` (same pattern as `Order`).

## Core entities

| Model | Purpose |
| --- | --- |
| `POSTerminal` | Optional device / lane metadata (registers may attach via `posTerminalId`). |
| `POSRegister` | Named lane; `locationId`, `cashTrackingEnabled`, printer labels (metadata). |
| `POSShift` | Open/close lifecycle, cash open/close, variance fields, staff open/close FKs. |
| `POSCart` | Serialized cart JSON (`ACTIVE` / `HELD` / …) for hold/recall flows. |
| `POSTransaction` | One row per completed checkout; **unique** `orderId`; monetary totals + `receiptNumber`. |
| `POSPayment` | Line per tender on the transaction (`PAID` / `PENDING` aligned with order payment truth). |
| `POSReceipt` | `receiptText` (+ optional HTML); no email provider required to persist. |
| `POSHeldOrder` | Label + optional customer name; points at `POSCart`. |
| `POSAuditEvent` | Structured `action` + `metadataJson` for shift/transaction events. |
| `PosInventoryImpactEvent` | Per-line impact placeholder until full stock consumption exists. |

## Product extensions

- `Product.posVisible` — hide SKU from POS pickers without removing from menus.
- `Product.barcode` — keyboard-wedge scanner match in terminal search.

## Order linkage

- `Order.creationSource = "POS"` when `orderType === "POS_SALE"` (see `order-creation-service`).
- `Order.sourceMetadataJson` may include `{ pos: { registerId, shiftId, staffMemberId } }` from checkout input.

## Indexes

Implemented in migration: `userId` + `locationId`, `registerId` + status/time, `shiftId`, `staffId`, `receiptNumber`, `orderId` (unique on transaction).

## Migration

Apply `prisma/migrations/*_pos_terminal_module/migration.sql` (or `prisma migrate deploy`) before enabling POS in production.

# POS — Permissions

## App-level keys (`lib/permissions.ts`)

Added to `PERMISSION_KEYS`:

- `pos_access` — open POS surfaces (terminal, registers, transactions).
- `pos_comp` — authorize comped payment mode at checkout.

### Role matrix (workspace `UserRole` + `normalizeRole` mapping)

| AppRole | `pos_access` | `pos_comp` |
| --- | --- | --- |
| OWNER / ADMIN | yes | yes |
| MANAGER | yes | yes |
| KITCHEN_LEAD | yes | no |
| KITCHEN_STAFF | yes | no |
| Others | no | no |

`checkoutPosSale` checks `pos_comp` when `paymentMode === "COMPED"`.

## Future fine-grained keys

`lib/pos/pos-permissions.ts` defines stable strings (`pos:void`, `pos:refund`, …) for future `StaffRole.permissionsJson` or custom roles — not yet wired to runtime checks beyond the comp guard.

## Platform

`/platform` remains restricted to platform operators; client workspaces never receive platform nav (`lib/module-visibility` + platform layout guards).

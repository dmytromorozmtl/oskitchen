# Brand assignment tools

**Route:** `/dashboard/brands/assignment`

## Current

- Read-only **snapshot** counts for records with `brandId IS NULL` (menus excluding catalog-only, products via menu ownership, orders, storefront row, integration connections).
- Deep links into Menus, Products, Orders, Storefront, Sales Channels for manual assignment.

## Planned (safe bulk)

- Filter + preview (how many rows change).  
- Batch update with audit log entries (`brand.assigned_to_record`).  
- Optional **undo** if no dependent publishes occurred (time-boxed).  
- Never auto-run on deploy; operator-initiated only.

## Rules

- Nullable `brandId` must continue to mean “workspace-level / not classified”.  
- Order reassignment should recompute aggregates idempotently.

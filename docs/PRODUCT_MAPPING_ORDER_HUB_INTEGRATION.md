# Product mapping ↔ Order Hub integration

The Order Hub (`/dashboard/order-hub`) and the workbench cooperate
through the channel import pipeline.

## Detection

`lib/channels/import-staging.ts` runs after a channel webhook or
sync. For each `ChannelImportRecord` it evaluates lines and writes
`validationStatus = NEEDS_MAPPING` when at least one line lacks an
SKU. The pipeline then opens a `ChannelConflict` row with
`conflictType = "missing_product_mapping"` and `status = OPEN`.

## Surfaces

- **Order Hub banner.** When there is at least one open
  `missing_product_mapping` conflict, the hub displays a banner
  linking to `/dashboard/product-mapping/unmapped` ("Open mapping
  workbench").
- **Workbench KPI tile.** "Blocked order lines" mirrors the conflict
  count.
- **Conflicts tab.** Open conflicts are listed with a jump-to-hub
  link.

## Resolution flow

1. Operator opens the workbench unmapped queue.
2. Picks a OS Kitchen candidate and approves the mapping.
3. Returns to the Order Hub (link provided on the conflict card).
4. Reprocesses the order via the Sales Channels imports view, which
   re-runs validation — the channel pipeline now finds the mapping
   and clears `NEEDS_MAPPING`.

The workbench does **not** auto-reprocess orders to keep the rule
"do not break Order Hub imports" intact and to let operators decide
when the queue is safe to flush.

## Safety contract

- Approving a mapping never mutates a `ChannelImportRecord` or
  `Order` directly.
- The workbench never deletes a `ChannelConflict`; resolution lives
  in the channel pipeline.
- All workbench writes are inside a `prisma.$transaction`, paired
  with a `ProductMappingEvent` row.

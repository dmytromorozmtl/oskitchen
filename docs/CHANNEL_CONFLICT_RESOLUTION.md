# Channel conflict resolution

`ChannelConflict` rows attach to `ChannelImportRecord` + batch. Types are free-form strings (e.g. `missing_product_mapping`, `duplicate_external_order`) with severities `INFO`–`BLOCKER`.

## UI
`/dashboard/sales-channels/conflicts` lists OPEN items with resolve/ignore actions (metadata only — no partner API calls).

## Next steps
Add merge helpers for true duplicate merging when internal `Order` promotion exists.

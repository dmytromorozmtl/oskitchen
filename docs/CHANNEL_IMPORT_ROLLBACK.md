# Channel import rollback

`ChannelImportRollback` records who rolled back a batch. Safe rollback clears `importedEntityId` / `importedAt` on records and forces batch `CANCELLED` after stats recompute.

## Blocks
If an external order is linked to an internal `Order` whose production tasks are already cooked, rollback aborts with an error (no silent production data loss).

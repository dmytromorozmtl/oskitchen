# Mapping conflicts

The Conflicts tab surfaces four categories of conflict.

## 1. Explicit conflicts

Mappings whose `status === "CONFLICT"`. The status can be set
manually (`changeMappingStatus`) or by a future automatic detector.

## 2. Duplicate OS Kitchen target

`detectConflicts` groups approved mappings by `internalProductId` and
returns any group with more than one external row. For marketplaces
this is expected (the same product appears on Uber Eats and Shopify),
but the workbench surfaces it for confirmation.

## 3. Duplicate external product

Two approved rows with the same `externalProductId` indicate a sync
bug or a manual mistake. The conflict view lists the duplicates so
the operator can archive the older row.

## 4. Order Hub blocks

`ChannelConflict.conflictType === "missing_product_mapping"` with
status `OPEN`. These are produced by
`lib/channels/import-staging.ts` whenever a channel order arrives
with a SKU that is not yet mapped. The conflict card jumps to the
Order Hub, where the operator can reprocess after approving the
mapping.

## Resolution actions (today)

- Reject the duplicate mapping (`rejectMappingAction`).
- Archive (`bulkArchiveAction`).
- Approve with an alternate target after editing.
- Open the Order Hub to reprocess the order.

## Resolution actions (planned)

- "Split mapping" wizard to demote one of the duplicates to a
  variant-only mapping.
- "Merge mapping" wizard to pull two internal products into one and
  re-attach the mapping.
- Auto-archive when an internal product is soft-deleted.

## Safety

Conflict resolution actions always write a `ProductMappingEvent`
(`CONFLICT_OPENED` / `CONFLICT_RESOLVED`) so the activity log shows
the resolution path.

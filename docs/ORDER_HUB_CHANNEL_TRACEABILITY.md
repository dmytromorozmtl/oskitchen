# Order Hub channel traceability

## Internal `Order`
Fields: `channelImportBatchId`, `channelTraceJson`, `isChannelTestOrder`. Order Hub surfaces batch link + optional `channelTraceJson.source` + TEST badge.

## External `ExternalOrder`
Field: `channelImportBatchId` (set when webhook/sync staging runs). Order Hub shows link to import batch review.

## Approvals
`ChannelImportRecord.importedEntityId` points to `ExternalOrder.id` after approval — auditable path without deleting raw payloads.

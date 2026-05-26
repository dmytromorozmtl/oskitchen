# Support ticket data model

## `SupportTicket`

Core request: `email`, `subject`, `message`, `category`, `priority`, `severity`, `status`, `source`.

Context: `workspaceId`, `userId` (submitter), `requesterName`, `assignedToId`, `partnerAccountId`, `moduleKey`, `relatedEntityType`, `relatedEntityId`.

Operational: `slaDueAt`, `firstResponseAt`, `resolutionSummary`, `resolvedAt`, `closedAt`, `escalatedAt`, `lastCustomerReplyAt`, `lastStaffReplyAt`.

JSON: `browserInfoJson` (redacted), `attachmentsJson`, `tagsJson`, `diagnosticsConsent`.

## `SupportTicketComment`

Thread + internal notes: `visibility` (`INTERNAL` | `CUSTOMER` | `PARTNER`), `authorType`, optional `authorUserId` / `authorStaffId`.

## `SupportTicketEvent`

Append-only lifecycle: `eventType`, `performedById`, `metadataJson`.

## `SupportSlaPolicy`

Per workspace (optional) + optional category/priority match; `firstResponseMinutes`, `resolutionMinutes`.

## `SupportSavedView` / `SupportMacro`

User/workspace saved filters and canned responses (seeded macros in migration).

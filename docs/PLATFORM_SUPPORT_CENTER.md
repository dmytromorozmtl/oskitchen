# Platform support center

## Inbox

- `/platform/support` — all tickets, linked to detail.
- `/platform/support/queue` — statuses in `PLATFORM_OPEN_TICKET_STATUSES` (`services/platform/platform-service.ts`).
- `/platform/support/escalations` — `status === ESCALATED`.

## Ticket detail (`/platform/support/[ticketId]`)

- Original message and metadata.
- Comment thread with visibility (internal vs customer).
- **Customer reply** — `addPlatformSupportCustomerReplyAction` (`SupportCommentVisibility.CUSTOMER`) updates `lastStaffReplyAt` and may flip `WAITING_ON_CUSTOMER` → `WAITING_ON_SUPPORT`.
- **Internal note** — `addPlatformSupportInternalCommentAction`.
- **Status** — `platformUpdateSupportTicketStatusAction` (audited).
- **Assignment** — `platformAssignSupportTicketAction` (audited); currently expects assignee UUID.

## Permissions

- Read: `platform:support:read`
- Reply / status: `platform:support:reply`
- Assign: `platform:support:assign`

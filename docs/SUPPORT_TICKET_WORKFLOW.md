# Support ticket workflow

## Status model

Statuses include: `NEW`, `TRIAGED`, `WAITING_ON_SUPPORT`, `WAITING_ON_CUSTOMER`, `IN_PROGRESS`, `ESCALATED`, `RESOLVED`, `CLOSED`, `DUPLICATE`, `CANCELLED`, plus legacy `OPEN` / `WAITING` (mapped on migration).

## Rules (implemented / partial)

- New tickets default to **`NEW`**.
- **Assign** (triage) moves `NEW` → **`TRIAGED`**.
- **Customer-visible comment** from staff can flip `WAITING_ON_CUSTOMER` → **`WAITING_ON_SUPPORT`** (when staff replies).
- **Status change** allowed for triage **or** assignee (`updateSupportTicketStatus`).
- **Resolve/close** should carry `resolutionSummary` in UI over time (field exists).

## Detail page

`/dashboard/support/[ticketId]` — thread, triage controls, timeline + workspace-scoped audit slice.

# Support inbox

## Routes

- **Center:** `/dashboard/support` — tabs include Inbox for triage users.
- **Shortcut:** `/dashboard/support/inbox` → redirects to `?tab=inbox`.

## Behavior

- Table shows tickets in the caller’s **visibility scope** (`visibleTicketsWhere`).
- Triage users get **bulk assign** via platform-role assignee list.
- Filters per tab (critical, integrations, billing, …) are client-side slices on the loaded page set (server loads up to 150 rows). **Server pagination** is the next scaling step.

## SLA column

Derived from `slaDueAt` vs wall clock; badge shows overdue vs due time.

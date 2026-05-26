# Support ready report

**Status:** Support & Issue Resolution Center v1 shipped (2026-05-13).

## Delivered

- Extended ticket model with workspace, SLA, severity, module/entity links, partner link.  
- Comments, events, SLA policies, macros (seeded), saved views table.  
- Services + permissions + actions.  
- `/dashboard/support` KPI dashboard, tabs, inbox slices, new ticket form, bulk assign.  
- `/dashboard/support/[ticketId]` detail with triage, thread, timeline, audit slice.  
- `/dashboard/support/kb` and `/dashboard/support/reports`.  
- Email: real send only when configured; growth inbound unchanged.

## Limitations

- Client-side tab filtering on a capped ticket list — needs **server pagination** + search.  
- Attachment upload not wired.  
- Business-hour SLA not modeled.  
- Partner-facing consolidated queue not built (field ready).

## Next recommendations

1. Server-side inbox query + cursor pagination.  
2. NotificationLog + assignee email on assignment.  
3. Attachment pipeline with AV scan.  
4. KB CMS + suggested articles in form.  
5. Correlate audit + ticket entities automatically.

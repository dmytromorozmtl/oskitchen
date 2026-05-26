# Support QA checklist

- [ ] Create ticket (dashboard form) — appears in list with SLA badge.  
- [ ] Legacy `submitSupportTicket` path still works.  
- [ ] Non-triage user cannot open another workspace’s ticket URL (`notFound`).  
- [ ] Internal comment not visible to non-triage on detail page.  
- [ ] Triage can assign + change status + escalate.  
- [ ] Email confirmation **skipped** when provider not configured (no fake success).  
- [ ] `npm run typecheck` && `npm run build` succeed.  
- [ ] After `prisma migrate deploy`, comments/events/policies/macros tables exist.

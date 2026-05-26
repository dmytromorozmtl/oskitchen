# Growth QA Checklist

- [ ] Non-owner, non-platform user cannot open `/dashboard/growth` (redirect).
- [ ] `workspace.moroz@gmail.com` (or superadmin row) can open all Growth routes.
- [ ] `GROWTH_ADMIN` platform role can open Growth.
- [ ] Command center charts render with non-empty DB fixtures.
- [ ] Leads Kanban maps statuses to lanes; empty state shows CTAs.
- [ ] Demo status includes `QUALIFIED` / `NURTURE` after migration.
- [ ] Outreach campaigns list + seed row appears once.
- [ ] Usage page shows telemetry empty state when no events.
- [ ] `npm run typecheck` / `npm run build` succeed.

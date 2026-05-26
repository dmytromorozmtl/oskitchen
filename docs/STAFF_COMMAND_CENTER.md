# Staff Command Center

Route: `/dashboard/staff` — replaces the legacy single-page roster while
preserving the existing add-teammate form.

## Header

- Title: **Staff**
- Subtitle: "Manage teammates, roles, permissions, training, availability,
  assignments, and operational readiness. SSO logins per teammate remain on
  the roadmap."
- Primary CTA: **Roster** → `/dashboard/staff/roster`
- Secondary CTA: **Manage roles** → `/dashboard/staff/roles`

## KPIs (`StaffKpiGrid`)

Sourced from `services/staff/staff-service#staffKpis`:

- Active staff
- Invited
- Training incomplete
- Certs expiring (30d)
- Active certifications
- Drivers available
- Assigned today
- Unavailable today
- Open tasks
- Custom roles
- Archived

## Subnav (`StaffSubnav`)

- Command Center · Roster · Roles & permissions · Availability · Shifts ·
  Certifications · Drivers · Reports

## Roster preview

The Command Center always shows up to 8 teammates, plus a quick-add form
that uses the original `createStaffMemberFormAction`. The richer
`StaffForm` is on the Roster tab.

## Empty state

If no staff exist the page renders the empty state with the rich
`StaffForm` and three CTAs: Add teammate · Import staff · Create roles.

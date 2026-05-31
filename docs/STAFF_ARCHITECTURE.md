# Staff architecture

The Staff Workforce Management Center is organized in four layers, mirroring
the rest of OS Kitchen:

```
lib/staff/*           pure helpers, no I/O
services/staff/*      Prisma + business logic
actions/staff.ts      Next.js Server Actions with auth + Zod
app/dashboard/staff   Route group with subnav + tabs
components/dashboard/staff  UI primitives + forms
```

## Modules

| Layer | File | Purpose |
|-------|------|---------|
| lib | `staff-types.ts` | Enum lists, labels for role/status/employment |
| lib | `staff-status.ts` | Tone maps, helpers for active/archived/shift today |
| lib | `staff-roles.ts` | System role catalog + permission matrix (13 areas) |
| lib | `staff-permissions.ts` | Capability checks (`canManageStaff`) and PII shape |
| lib | `staff-availability.ts` | Weekly windows, validation, summarisation |
| lib | `staff-certifications.ts` | Active / expiring / derived status helpers |
| services | `staff-service.ts` | CRUD, events, KPIs, lookup, transitions |
| services | `staff-readiness-service.ts` | Go-live workforce snapshot |
| actions | `staff.ts` | Server Actions, all gated + Zod-validated |
| app | `staff/page.tsx` | Command Center overview |
| app | `staff/roster/page.tsx` | Filterable roster + add teammate |
| app | `staff/[staffId]/page.tsx` | Per-teammate detail tabs |
| app | `staff/roles/page.tsx` | System + custom roles |
| app | `staff/availability/page.tsx` | Weekly availability matrix |
| app | `staff/shifts/page.tsx` | Schedule + status transitions |
| app | `staff/certifications/page.tsx` | All staff certifications |
| app | `staff/drivers/page.tsx` | Driver readiness for routes |
| app | `staff/reports/page.tsx` | KPIs, training completion, role coverage, audit |

## Permissions

- Server-side: every action calls `gate()` which loads the actor profile and
  asks `canManageStaff(scope, capability)`. Owners pass automatically.
  Superadmin (`workspace.moroz@gmail.com`) is granted every capability.
- UI: pages still render for viewers but PII fields and edit forms are hidden.

## Workspace scoping

Every Prisma query filters by `userId` (workspace id). New tables include
`@@index([userId, …])` for the most common access paths.

## Audit

`StaffEvent` rows are written by the service layer on every mutation
(create / update / archive / role upsert / availability save / shift create /
shift status transition / cert upsert / cert revoke). Existing
`actions/staff-member.ts` (the 3-field form) now also writes a best-effort
`STAFF_CREATED` event so legacy quick-adds are still audited.

## Integration points

- **Tasks**: `KitchenTask.assignedToId → StaffMember.id` already in place;
  detail page renders the most recent 30 tasks per staff member.
- **Training**: Staff detail shows assigned `TrainingAssignment` rows linked
  via `assignedToStaffId`; existing TrainingCertifications surface alongside
  the new `StaffCertification` table.
- **Production / Packing**: Existing relations (`ProductionBatch.assigneeId`,
  `PackingTask.assigneeId`, etc.) are preserved; their counts appear in the
  roster badges (`_count`).
- **Routes**: Drivers tab counts staff with `roleType = DRIVER` and links to
  the Delivery Route planner.
- **Go-live**: `services/go-live/go-live-service.ts` pulls
  `loadStaffReadinessSnapshot(userId)` and supplies 6 new fields
  (`staffHasOwner`, `staffHasManager`, `staffKitchen`, `staffPackers`,
  `staffDrivers`, `staffShiftsToday`) to the readiness engine. Five new
  workforce signals (`staff_owner_present`, `staff_manager_present`,
  `staff_kitchen_present`, `staff_packing_present`, `staff_drivers_present`)
  and three new blockers (`staff_no_owner`, `staff_no_driver`,
  `staff_no_kitchen`) are emitted.

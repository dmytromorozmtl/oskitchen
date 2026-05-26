# Staff Workforce Management Center — ready report

**Date:** 2026-05-11
**Module:** Staff / Workforce
**Status:** Complete and merged into the dashboard.

## What changed

The Staff page evolved from a single-page roster with a 3-field form into a
**Workforce Management Center** with eight sub-routes, full-stack
permissions, audit logging, and tight Go-live integration. No existing
record was deleted, no existing route was broken.

## Data model

Additive Prisma migration `20260524100000_staff_workforce_center`:

- 5 new enums: `StaffRoleType`, `StaffStatus`, `StaffEmploymentType`,
  `StaffShiftStatus`, `StaffCertificationStatus`.
- `staff_members` extended with 15 nullable / default columns (role type,
  status, employment type, brand, location, custom role, departments JSON,
  permissions JSON, availability JSON, emergency contact JSON, notes,
  invited/archived/last-active timestamps, linked user FK).
- 5 new tables: `staff_roles`, `staff_availability`, `staff_shifts`,
  `staff_certifications`, `staff_events`.
- Indexes for `(userId, status)`, `(userId, role_type)`,
  `(userId, location_id)`, `(userId, brand_id)`, `(userId, shift_date)`,
  `(userId, expires_at)` and more.

## Architecture

```
lib/staff/         types, status, roles, permissions, availability, certs (6 files)
services/staff/    staff-service, staff-readiness-service
actions/staff.ts   13 Server Actions, Zod + capability gates
app/dashboard/staff
  page.tsx        Command Center
  layout.tsx      Subnav
  roster/         Roster + add teammate
  [staffId]/      Detail page with Tasks/Training/Certs/Availability/Shifts/Activity
  roles/          System matrix + custom roles
  availability/   Weekly grid
  shifts/         14-day schedule + transitions
  certifications/ All HR certs
  drivers/        Driver roster
  reports/        KPIs + role coverage + readiness + audit
components/dashboard/staff/ 11 UI components
```

## Command Center

KPIs: active, invited, training incomplete, certs expiring, active certs,
drivers, assigned today, unavailable today, open tasks, custom roles,
archived. Subnav across 8 sub-routes.

## Roster

Filterable by role, status, search. The legacy 3-field form continues to
work on the Command Center. The rich form on `/dashboard/staff/roster`
captures role type, role label, status, employment type, brand,
location, custom role, and notes.

## Roles & permissions

13 system roles with a 13-area permission matrix
(`orders, production, kitchen_screen, packing, routes, tasks, crm,
costing, analytics, billing, settings, staff, training`).
Custom roles per workspace through `/dashboard/staff/roles`.
13 capabilities enforced server-side in `actions/staff.ts`.
Superadmin (`workspace.moroz@gmail.com`) bypasses every gate.

## Availability & shifts

Per-staff weekly availability windows (7 days, normalized HH:MM, validated
end > start). Shift scheduling with five statuses
(`SCHEDULED → CHECKED_IN → COMPLETED`, plus `NO_SHOW` and `CANCELLED`).
Status transitions write timestamps and audit events automatically.

## Training integration

Read-only on the staff detail page. Pulls `TrainingAssignment` rows
linked via `assignedToStaffId` and `TrainingCertification` rows linked via
`TrainingCertStaffRecipient`. New HR-style `StaffCertification` can
optionally reference a Training program through `sourceTrainingId`.

## Task integration

Preserved. The existing `KitchenTask.assignedToId` continues to point at
`StaffMember.id`. The staff detail page shows the most recent 30 tasks per
member; the KPI counts open tasks assigned to staff.

## Production / Packing / Routes

Existing relations to `StaffMember` preserved; counts surface in roster
badges and KPIs. Drivers tab links to the Delivery Route planner.

## Go-live readiness

`services/go-live/go-live-service` now imports
`loadStaffReadinessSnapshot(userId)` and supplies 6 new fields to the
readiness engine. The engine emits 5 new signals
(`staff_owner_present`, `staff_manager_present`, `staff_kitchen_present`,
`staff_packing_present`, `staff_drivers_present`), and the blocker engine
adds 3 new blockers (`staff_no_owner`, `staff_no_driver`,
`staff_no_kitchen`). Existing training and certification signals continue
to fire.

## Privacy / security

PII (email, phone, notes, emergency contact) is gated by
`staff.view.pii`. Permissions JSON is gated by `staff.audit.view`. SSO is
explicitly not implemented; `linked_user_id` is reserved but never
populated automatically. The legacy quick-add form now writes a best-
effort `STAFF_CREATED` event so even the simplest path is audited.

## Audit

`StaffEvent` rows are written for: create, update, archive, role upsert,
role deactivate, availability update, shift create, shift status
transition, certification add, certification revoke.

## Compatibility

- `/dashboard/staff` continues to render and shows the legacy quick-add.
- `createStaffMemberFormAction` continues to work unchanged for callers.
- All existing `StaffMember.role`, `StaffMember.active`, and
  `StaffMember.userId` accessors are untouched.
- No row was deleted; new columns are nullable or have defaults.

## Remaining limitations

1. SSO / invite-with-login is not wired up. `linked_user_id` is reserved
   but unused.
2. Per-location dashboards aggregate at the global level; filters on the
   roster page work but Reports do not yet filter by `locationId`.
3. Driver assignment on `DeliveryRoute` still uses
   `driverProfileId / driverUserId / driverName`; a future migration could
   add `driverStaffId` and backfill from the existing columns.
4. The custom role permission editor uses a JSON string field; a richer
   matrix editor is a UX nice-to-have.
5. Shift conflicts (overlapping shifts per staff member) are not yet
   prevented at write time.

## Next recommendations

- Add `DeliveryRoute.driverStaffId` and a backfill action to formally link
  drivers to staff members.
- Build a tablet "Who is on today" page combining shifts + availability
  for the kitchen tablet, mirroring `app/dashboard/training/tablet`.
- Expose per-location filters on the Reports page.
- Push staff events into the existing notification pipeline (re-use the
  `TrainingEvent` notification wire-up).
- Wire a future SSO invite flow into `linked_user_id` with an explicit
  "Invite to login" CTA on the staff detail page.

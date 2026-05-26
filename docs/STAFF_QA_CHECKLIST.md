# Staff QA checklist

## Smoke

- [ ] `/dashboard/staff` loads for an empty workspace, shows empty state
      with rich `StaffForm`.
- [ ] `/dashboard/staff` loads for a workspace with staff, KPIs visible.
- [ ] Legacy add-teammate form (3 fields) still saves; row appears in roster.
- [ ] Rich `StaffForm` saves: role type, status, employment type, brand,
      location, notes round-trip.

## Roster

- [ ] Role filter narrows the list.
- [ ] Status filter narrows the list.
- [ ] Search filter matches name and email substrings.
- [ ] Archive button transitions status to ARCHIVED and removes from active counts.

## Detail

- [ ] `/dashboard/staff/[staffId]` shows contact only for managers.
- [ ] Edit form updates teammate fields.
- [ ] Availability editor saves 7 days at once; reloading shows the value.
- [ ] Adding a staff certification appears in the list with derived status.
- [ ] Revoking a cert moves it to REVOKED.
- [ ] Recent activity contains `STAFF_CREATED`, `STAFF_UPDATED`, etc.

## Roles & permissions

- [ ] System roles matrix renders.
- [ ] Custom role upsert with permissions JSON saves.
- [ ] Deactivate marks role inactive.

## Availability

- [ ] Page lists active staff with summarised availability.
- [ ] Per-day grid renders 7 cells.

## Shifts

- [ ] Create shift form saves.
- [ ] Shift appears under the correct date.
- [ ] Check-in transitions status, sets `checkedInAt`.
- [ ] Complete transitions status, sets `completedAt`.
- [ ] Cancel transitions status, button hidden after.

## Certifications

- [ ] `/dashboard/staff/certifications` lists all certs with badges.
- [ ] Expiring entries (within 30 days) display the badge.
- [ ] Revoke works.

## Drivers

- [ ] `/dashboard/staff/drivers` lists drivers + today shift count.
- [ ] Empty state explains how to add drivers.

## Reports

- [ ] KPI grid matches Command Center.
- [ ] Training completion bar reflects current state.
- [ ] Role coverage table lists groupBy results.
- [ ] Recent activity shows the latest 30 events.

## Permissions

- [ ] Superadmin (`workspace.moroz@gmail.com`) accesses every page.
- [ ] Non-owner / non-manager actors are denied write actions; the gate
      throws a friendly error.
- [ ] PII fields are hidden for actors without `staff.view.pii`.

## Go-live integration

- [ ] Adding the first OWNER role removes the `staff_no_owner` blocker.
- [ ] Adding a DRIVER role with a route present clears `staff_no_driver`.
- [ ] Adding kitchen staff with productionRuns > 0 clears `staff_no_kitchen`.

## Backwards compatibility

- [ ] Existing `StaffMember` rows still load.
- [ ] Existing `KitchenTask.assignedToId` referencing those rows still works.
- [ ] No `StaffMember` rows have been deleted by migrations.

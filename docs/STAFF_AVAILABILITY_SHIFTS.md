# Availability & shifts

## Availability

Each `StaffMember` has zero or many `StaffAvailability` windows
(day-of-week, start, end, available). The detail page renders a
`AvailabilityEditor` allowing a manager to set every weekday in one save.
The action `saveAvailabilityAction` deletes and replaces the staff
member's windows transactionally, then writes an
`AVAILABILITY_UPDATED` event.

Helpers in `lib/staff/staff-availability.ts`:

- `normalizeTime(s)` — clamps to `HH:MM`
- `isWindowValid(w)` — ensures end > start
- `isAvailableNow(windows, now)` — UTC day + minute lookup
- `summarizeAvailability(windows)` — printable summary

## Shifts

`StaffShift` rows are workspace-scoped (`userId`) and indexed by date.
Statuses: `SCHEDULED → CHECKED_IN → COMPLETED`, with `NO_SHOW` and
`CANCELLED` for exceptions.

- Page `/dashboard/staff/shifts` groups upcoming 14 days by date.
- `CreateShiftForm` writes a shift via `createShiftAction`.
- `ShiftStatusButtons` calls `updateShiftStatusAction` which sets
  `checkedInAt` or `completedAt` automatically.

Shifts feed:

- **Today board / Production**: shifts of `KITCHEN_LEAD / PREP_COOK /
  LINE_COOK` indicate kitchen coverage.
- **Routes**: `DRIVER` shifts indicate available drivers.
- **Go-live**: the readiness service reads `shiftsToday`.

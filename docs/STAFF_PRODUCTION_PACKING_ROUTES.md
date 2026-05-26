# Staff ↔ Production / Packing / Routes

## Production

`ProductionBatch` and `ProductionWorkItem` already reference
`StaffMember` (relations `ProductionBatchAssignee` and
`ProductionWorkAssignee`). The Staff Command Center reads counts via
`_count.assignedProductionBatches` and
`_count.assignedProductionWorkItems`.

## Packing

`PackingBatch` and `PackingTask` reference `StaffMember`
(`PackingBatchAssignee`, `PackingTaskAssignee`). Counts surface in the
roster.

## Routes / drivers

The Delivery Route domain currently stores driver assignment via three
non-staff columns on `DeliveryRoute`:
`driverProfileId`, `driverUserId`, `driverName`. To avoid a
schema-breaking change, the Staff module surfaces drivers by
`roleType = DRIVER` and links to the existing route planner; matching
between `StaffMember` and `DeliveryRoute` continues to use the existing
columns. A future migration can add an optional
`DeliveryRoute.driverStaffId` and backfill from `driverProfileId`.

## Go-live blockers introduced

- `staff_no_kitchen` (HIGH_RISK): production runs exist but no kitchen
  staff are on the roster.
- `staff_no_driver` (HIGH_RISK): delivery routes exist but no DRIVER
  staff are on the roster.
- `staff_no_owner` (CRITICAL): no OWNER staff member at all.

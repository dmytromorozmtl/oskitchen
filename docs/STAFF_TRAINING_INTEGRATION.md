# Staff ↔ Training integration

## Read direction

`Staff detail` (`/dashboard/staff/[staffId]`) shows:

1. `TrainingAssignment` rows linked to the staff via `assignedToStaffId`
   (existing relation `TrainingAssignmentStaffTrainee`).
2. `TrainingCertification` rows linked to the staff via the existing
   `TrainingCertStaffRecipient` relation.
3. The HR-style `StaffCertification` table, which can optionally reference
   a Training program through `sourceTrainingId`.

## Write direction

- New `StaffCertification` rows can be added directly from the staff
  detail page (manager+ capability) without touching Training records.
- Training assignments and Training certifications continue to be created
  from the Training Command Center; they continue to write the same
  `TrainingEvent` audit rows.

## Go-live readiness

The readiness engine considers both:

- `trainingAssignmentsCompleted / trainingAssignmentsTotal` (Training)
- `certificationsActive`, `certificationsExpiringSoon` (Training)
- New `staffHasOwner`, `staffHasManager`, `staffKitchen`, `staffPackers`,
  `staffDrivers` (Staff)

This double-signal model lets us distinguish between "no programs assigned
to staff" and "no staff exist at all".

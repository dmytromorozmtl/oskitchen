# Training analytics

## KPI grid

`trainingKpis(userId)` aggregates the Command Center tiles:

- `activePrograms`
- `totalAssignments`
- `activeTrainees` (distinct profile/staff with an open assignment)
- `completedAssignments`
- `overdueAssignments`
- `failedQuizzes`
- `simulationsCompleted`
- `certificationsActive` (`isCertificationActive` per row)
- `certificationsExpiringSoon` (within 30 days)
- `onboardingInFlight` (open assignments on `isOnboardingPath` programs)
- `averageCompletionPercent`
- `sopActive`
- `sopPendingAcks`

## Role breakdown

`/dashboard/training/analytics` groups assignments by `roleType` and computes
completion percentage per role with an inline horizontal bar.

## Activity log

The page lists the last 30 `TrainingEvent` rows:

- `PROGRAM_CREATED`
- `ASSIGNMENT_CREATED`
- `PROGRESS_RECORDED`
- `QUIZ_PASSED` / `QUIZ_FAILED`
- `CERTIFICATION_ISSUED` / `CERTIFICATION_REVOKED`
- `SIMULATION_CREATED` / `SIMULATION_PASSED` / `SIMULATION_FAILED`
- `SOP_CREATED` / `SOP_PUBLISHED` / `SOP_ARCHIVED` / `SOP_ACKNOWLEDGED`

## Future hooks

- Chart visualization (e.g. recharts) on top of the existing KPI tiles is
  straightforward — all data is already aggregated server-side.
- Per-location and per-brand comparisons read from `TrainingProgram.brandId`
  and `TrainingProgram.locationId`.

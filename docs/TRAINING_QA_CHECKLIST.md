# Training QA checklist

Run this checklist before promoting Training changes.

## Onboarding flows

- [ ] Create a program with `seedFromTemplate = KITCHEN_STAFF`; verify the
      5-module curriculum is created.
- [ ] Assign the program to a staff member with `practiceMode = true`.
- [ ] Mark progress 25 / 50 / 100 on lessons; verify assignment status
      transitions `ASSIGNED → IN_PROGRESS → COMPLETED`.

## Quizzes

- [ ] Submit a passing quiz; verify a `TrainingQuizAttempt` row is written
      with `passed = true` and the linked lesson is marked complete.
- [ ] Submit a failing quiz; verify `QUIZ_FAILED` is recorded and assignment
      flips to `FAILED`.

## Certifications

- [ ] Issue a `KITCHEN_CERTIFIED` certification; verify default expiry is
      365 days out.
- [ ] Revoke a certification with a reason; verify `isCertificationActive`
      returns false.

## Simulations

- [ ] Create a `LUNCH_RUSH` simulation; run all steps as `correct`; verify
      score = 100, result = `COMPLETED`.
- [ ] Run with some steps incorrect; verify score reflects point values and
      result is `FAILED` if below passing score.

## SOPs

- [ ] Create an SOP draft; publish; acknowledge.
- [ ] Verify acknowledgement is rejected for `DRAFT` or `ARCHIVED` SOPs.

## Analytics

- [ ] KPI grid renders without errors with zero data.
- [ ] KPI grid renders with sample data and percentages are accurate.

## Permissions

- [ ] A user with role `trainee` cannot create programs.
- [ ] A user with role `manager` can issue but not revoke certifications.
- [ ] Superadmin (`workspace.moroz@gmail.com`) can perform every action.

## Multi-location

- [ ] Create a program with a `brandId`; verify it lists under that brand.
- [ ] Create a program with a `locationId`; verify it lists under that location.

## Mobile / kitchen tablet

- [ ] `/dashboard/training/tablet` shows large CTAs (h-14 size lg) and works
      with gloves-on tap targets.
- [ ] Practice mode page (`/dashboard/training/practice`) reachable from the
      subnav.

## Practice isolation

- [ ] A `practiceMode = true` assignment creates `practiceMode = true`
      progress rows.
- [ ] No production orders, kitchen tasks, packing tasks, labels, or
      inventory writes occur from any training run.

## Go-live integration

- [ ] With training programs + no completions: Go-live readiness flags
      `training_outstanding` blocker.
- [ ] With no active certifications: Go-live readiness flags
      `no_active_certifications` (CRITICAL).
- [ ] With certifications expiring in <30 days: `certifications_expiring`
      WARNING is raised.

## Build

- [ ] `npm run typecheck` clean.
- [ ] `npm run build` clean.

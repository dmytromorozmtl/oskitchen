# Training × Go-live integration

The Go-live Command Center now consumes training data through the
`trainingReadinessSnapshot(userId)` helper exposed by
`services/training/training-service.ts`.

## Shape

```ts
{
  activePrograms: number;
  totalAssignments: number;
  completedAssignments: number;
  activeCertifications: number;
  expiringCertifications: number;
  coveragePercent: number;
}
```

## Wired into readiness inputs

`services/go-live/go-live-service.ts → loadReadinessInputs` populates the
new optional fields on `ReadinessInputs`:

- `trainingProgramsActive`
- `trainingAssignmentsTotal`
- `trainingAssignmentsCompleted`
- `certificationsActive`
- `certificationsExpiringSoon`

It also overwrites the existing `trainingCompletions` value with
`completedAssignments` from the training snapshot.

## Readiness signals

Two new signals contribute to the Go-live score:

- `training_coverage` — required when there are open assignments. Satisfied
  when `completed >= total`.
- `certifications_active` — required when there are active programs.
  Satisfied when at least one certification is active.

Both fall in the `staffing` category, so they inherit the per-business-type
multipliers (e.g. RESTAURANT × 1.0, MULTI_BRAND × 1.0; CATERING × 1.0;
adjust the multipliers in `readiness-engine.ts` if you want stronger
weighting per business type).

## Blockers

`lib/go-live/blocker-engine.ts` now raises three training blockers:

- `training_outstanding` — `HIGH_RISK`. Fires when `completed < total`.
- `no_active_certifications` — `CRITICAL`. Fires when programs exist but no
  active certifications.
- `certifications_expiring` — `WARNING`. Fires when any certification is
  within 30 days of expiry.

Any `CRITICAL` blocker prevents `APPROVED` and `LIVE` transitions in
`services/go-live/go-live-service.ts` (existing guardrail).

## Result

A workspace cannot be marked `READY` (and certainly not `APPROVED` or
`LIVE`) without:

- training assignments completed across the workspace,
- at least one active certification,
- no critical training blockers,

unless the user is a Cursor superadmin and explicitly overrides.

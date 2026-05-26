# Training Command Center — ready report

## Summary

The `/dashboard/training` surface was upgraded from a 4-page static walkthrough
into a full Training Command Center + Restaurant LMS spanning:

- 13 new Prisma tables and 12 new enums.
- 7 deterministic engines in `lib/training/*`.
- 1 central service in `services/training/training-service.ts`.
- 13 server actions in `actions/training.ts`.
- 9 UI routes under `/dashboard/training/*` plus a tablet-kiosk view.
- Full integration with the Go-live Command Center readiness engine.

The original three legacy walkthrough pages — `/kitchen`, `/packing`,
`/manager` — remain functional and are surfaced both in the new Command
Center and in the subnav as "(legacy)" links. Practice mode is preserved as
a dedicated `/practice` route plus a `practiceMode` flag on assignments and
progress rows.

## Onboarding system

`TrainingProgram.isOnboardingPath = true` marks a program as an onboarding
path. Each of the 14 role templates in `ROLE_PROGRAM_TEMPLATES` seeds the
10-stage onboarding curriculum (welcome → certification) when used as a
template seed.

Open onboarding assignments are surfaced in the KPI tile `onboardingInFlight`.

## Certifications

`TrainingCertification` records:

- 9 certification types (kitchen, packing, route, manager, safety, catering,
  customer service, allergen, custom).
- Default validity windows per type (365–730 days).
- `expiresAt` / `revokedAt` / `revokedReason` for the full lifecycle.
- Active / expiring-soon helpers in `lib/training/certification-engine.ts`.

## Simulations

13 scenarios with deterministic grading via `gradeSimulation`. Runs write
`TrainingSimulationRun` rows. Practice-safe: no production writes.

## SOP management

`SOPDocument` supports versioning, status (`DRAFT` / `ACTIVE` / `ARCHIVED`),
14 categories, multilingual content, attachments, and acknowledgements.
`SOPAcknowledgement` records the staff member and timestamp.

## Analytics

`trainingKpis(userId)` returns 13 KPIs covering trainees, completion,
certifications, simulations, onboarding, SOPs, and quizzes. The analytics
page draws a role-by-role completion bar chart and lists the last 30
`TrainingEvent` rows.

## Automations

Hooks are in place via `TrainingEvent` to power notifications and reminders:

- Overdue training (detect via `isAssignmentOverdue`).
- Expiry alerts (detect via `isCertificationExpiringSoon`).
- Failed quiz alerts (`QUIZ_FAILED` event).
- Retraining triggers (revoked or expired certifications).

These are deterministic; a future workflow runner can subscribe to events.

## Permissions

`canUseTraining(scope, capability)` covers 12 capabilities:

- `training.view`
- `training.program.create` / `.edit`
- `training.assign`
- `training.progress.write`
- `training.quiz.attempt`
- `training.cert.issue` / `.revoke`
- `training.sim.run`
- `training.sop.create` / `.publish` / `.acknowledge`
- `training.audit`

`workspace.moroz@gmail.com` bypasses all gates via `isSuperAdminTraining`.

## Mobile UX

`/dashboard/training/tablet` offers a large-tap, gloves-friendly view with
four primary CTAs. The Command Center is responsive across phone, tablet,
and desktop with grid breakpoints at `sm`, `md`, `lg`, `xl`.

## Go-live integration

Go-live now reads `trainingReadinessSnapshot` and emits two new readiness
signals (`training_coverage`, `certifications_active`) plus three new
blockers (`training_outstanding` HIGH_RISK, `no_active_certifications`
CRITICAL, `certifications_expiring` WARNING). A workspace cannot reach
`APPROVED` or `LIVE` without:

- All training assignments completed.
- At least one active certification.
- No critical training blockers.

## Implementation summary

| Layer | Lines (approx) | Files |
|-------|-----:|-------|
| `lib/training/*` | 700 | 7 |
| `services/training/training-service.ts` | 600 | 1 |
| `actions/training.ts` | 350 | 1 |
| `components/dashboard/training/*` | 800 | 9 |
| `app/dashboard/training/*` | 700 | 10 |
| `prisma/schema.prisma` | +500 | 1 |
| `prisma/migrations/20260523100000_training_command_center` | 450 | 1 |
| `docs/TRAINING_*.md` | 800 | 10 |

## Remaining recommendations

1. **Notifications.** Wire `TrainingEvent` into the existing notification
   pipeline so trainees receive emails for assignments, quizzes, and
   certifications. Hook points are deterministic.
2. **Recharts visualizations.** The analytics page renders inline bars
   today; a chart library can plug in over the existing aggregates.
3. **Offline caching.** The mobile/tablet pages are responsive but do not
   yet ship an offline cache; consider service-worker registration scoped
   to `/dashboard/training`.
4. **AI-assisted quiz authoring.** The quiz model is JSON-shaped and ready
   for AI generation; add a Server Action that drafts questions from a
   lesson body.
5. **Per-location dashboards.** `TrainingProgram.brandId` and `locationId`
   are already filterable in service queries — a UI filter is the only
   missing piece.

## Verification

- `npm run typecheck` — clean.
- `npm run build` — clean.
- Legacy `/kitchen` / `/packing` / `/manager` routes still resolve.
- Practice mode preserved at `/dashboard/training/practice`.
- Go-live readiness honours the new training/certification gates.

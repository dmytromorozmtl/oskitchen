# Training architecture

## Layered design

```
app/dashboard/training/**            UI (RSC) + minimal client islands
components/dashboard/training/**     Client widgets (forms, runners, badges)
actions/training.ts                  Server Actions: auth + Zod validation
services/training/training-service   Business logic, Prisma I/O, audit events
lib/training/**                      Pure deterministic engines (no I/O)
prisma/schema.prisma                 Data model
```

### `lib/training`

Pure helpers, no Prisma access:

- `training-engine.ts` — role labels, status labels, slugifier, status derivation, overdue helper.
- `progress-engine.ts` — derive status + clamp percent.
- `certification-engine.ts` — active/expiring helpers, default validity windows.
- `quiz-engine.ts` — `QuizDefinition` + `gradeQuiz` (multi-question-type scoring).
- `simulation-engine.ts` — 13 simulation templates + `gradeSimulation`.
- `sop-engine.ts` — SOP labels + a plain-text rendering helper.
- `assignment-engine.ts` — `ROLE_PROGRAM_TEMPLATES` for 14 roles (used as seed templates).
- `training-permissions.ts` — `canUseTraining(scope, capability)` with superadmin bypass.

### `services/training/training-service.ts`

- `listPrograms` / `getProgram` / `createProgram` (with optional role-template seed)
- `assignProgram` / `recordProgress` / `submitQuizAttempt`
- `issueCertification` / `revokeCertification`
- `createSimulation` / `runSimulation`
- `createSop` / `publishSop` / `archiveSop` / `acknowledgeSop`
- `listAssignments` / `listCertifications` / `listSimulations` / `listSops` / `listEvents`
- `trainingKpis` (Command Center tiles)
- `trainingReadinessSnapshot` (consumed by `services/go-live`)

Every state-changing call writes a `TrainingEvent` row.

### `actions/training.ts`

Server Actions used by client islands. Each calls `requireSessionUser` +
`requireUserProfile`, builds a `TrainingActorScope`, and gates with
`canUseTraining`. Inputs are validated with Zod. After success, all relevant
`/dashboard/training/...` paths are revalidated.

### Data model

12 enums + 13 tables (see `prisma/migrations/20260523100000_training_command_center/migration.sql`).

- `TrainingProgram` 1—* `TrainingModule` 1—* `TrainingLesson` 1—* `TrainingQuiz`
- `TrainingAssignment` ↔ `TrainingProgress` per lesson
- `TrainingCertification` references program + assignment + recipient
- `TrainingSimulation` ↔ `TrainingSimulationRun`
- `TrainingIncidentDrill` (drill library)
- `SOPDocument` 1—* `SOPAcknowledgement`
- `TrainingEvent` audit trail

All tables are workspace-scoped (`userId`).

## Safety contract

1. Practice-mode assignments propagate `practiceMode = true` into progress
   rows so the UI can hide certifications until a manager promotes.
2. Programs flagged `practiceModeOnly` force `practiceMode` on every
   assignment.
3. Quiz/simulation grading is deterministic — same inputs always yield the
   same outputs.
4. Certification expiry windows are deterministic too (per-type defaults).

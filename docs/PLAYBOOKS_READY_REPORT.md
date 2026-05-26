# Operations Playbooks — Ready report

## What changed

`/dashboard/playbooks` is no longer a static template list. It is a
full Operations Playbooks command center with persistent runs,
deterministic task generation, role-aware step transitions, an
audit log, and Today-board integration. The original library
(`lib/operations-playbooks.ts`) and the 7 reference templates are
preserved — system templates are now seeded into a new
`playbooks` table so each workspace can customize and run them.

## Highlights

### Data model
- New tables: `playbooks`, `playbook_steps`, `playbook_runs`,
  `playbook_run_steps`, `playbook_events`.
- New enums: `PlaybookType`, `PlaybookStatus`,
  `PlaybookRunStepStatus`, `PlaybookTriggerType`.
- `KitchenTask` already supports `sourceType = PLAYBOOK`; we now
  back-link via `playbookRunSteps`.

### Library
- `lib/playbooks/playbook-types.ts` — shared types.
- `lib/playbooks/playbook-status.ts` — labels + helpers.
- `lib/playbooks/playbook-permissions.ts` — capability matrix.
- `lib/playbooks/playbook-templates.ts` — 7 seeded templates.
- `lib/playbooks/playbook-runner.ts` — `progressForRun`, `isOverdue`.

### Services
- `services/playbooks/playbook-service.ts` — listing,
  recommendations, KPIs, start/transition/complete/cancel,
  audit, idempotent template seeding.
- `services/playbooks/playbook-task-generator.ts` — task
  generation with strict idempotency.

### Server actions
All in `actions/playbooks.ts`:
- `ensureSystemPlaybooksAction`
- `startRunAction`
- `transitionStepAction`
- `generateTasksAction`
- `completeRunAction`, `cancelRunAction`
- `createCustomPlaybookAction`, `archivePlaybookAction`
- `updatePlaybookSettingsAction`

### UI (11 routes)
- `/dashboard/playbooks` (Recommended)
- `/dashboard/playbooks/all`
- `/dashboard/playbooks/active`
- `/dashboard/playbooks/templates`
- `/dashboard/playbooks/custom`
- `/dashboard/playbooks/schedule`
- `/dashboard/playbooks/reports`
- `/dashboard/playbooks/settings`
- `/dashboard/playbooks/[playbookId]`
- `/dashboard/playbooks/runs/[runId]`
- `/dashboard/playbooks/new`

### Today board
- New `<PlaybookTodayStrip />` between the "Next best action" card
  and the KPI grid, showing the top recommended playbook and any
  active runs.

### Audit
- Every state change creates a `PlaybookEvent` (`run_started`,
  `step_completed`, `step_blocked`, `tasks_generated`,
  `run_completed`, `run_cancelled`, `playbook_created`,
  `playbook_archived`, `playbook_updated`).

## Build & types

- `npm run typecheck` — green.
- `npm run build` — green; the 11 new routes are listed in the
  Next.js manifest.

## Remaining limitations / not done

These are intentionally deferred so this PR stays focused:

- **No automatic recurrence engine.** `recurrenceRule` is stored
  but no scheduler creates runs. Today board recommends, owners
  click.
- **No drag-and-drop step reordering** in the custom builder
  (steps render in input order).
- **No PDF export of a playbook.**
- **No staff member picker.** Roles only — staff assignment is
  done after task creation in `/dashboard/tasks`.
- **No dependency enforcement** between steps. The model supports
  `dependencyStepIdsJson` but UI doesn't yet block downstream
  steps.

## Next recommendations

1. Add a small "Run" modal that previews the tasks (via
   `previewTasksForRun`) before commit.
2. Background job to roll `recurrenceRule` into "upcoming run
   suggestions" rows (read-only — owners still confirm).
3. Wire `playbookRunSteps.taskId` back into the kitchen task
   detail UI so completing the task auto-completes the step.

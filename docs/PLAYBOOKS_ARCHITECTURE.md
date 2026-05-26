# Operations Playbooks — Architecture

## Layers

| Layer | Files | Responsibility |
|-------|-------|----------------|
| Types | `lib/playbooks/playbook-types.ts` | Public TS types and seed shapes |
| Status helpers | `lib/playbooks/playbook-status.ts` | Enum labels + terminal-state helpers |
| Permissions | `lib/playbooks/playbook-permissions.ts` | `canUsePlaybooks(scope, cap)` |
| System templates | `lib/playbooks/playbook-templates.ts` | The 7 seeded SOPs |
| Run math | `lib/playbooks/playbook-runner.ts` | `progressForRun`, `isOverdue` |
| Service | `services/playbooks/playbook-service.ts` | CRUD, run lifecycle, audit writes |
| Task generator | `services/playbooks/playbook-task-generator.ts` | Idempotent task creation |
| Server actions | `actions/playbooks.ts` | All mutations (zod-validated) |
| UI (RSC) | `app/dashboard/playbooks/**` | 11 routes |
| UI (client) | `components/dashboard/playbooks/**` | Buttons, forms, status badges |

## State machine

```
Run:    READY → RUNNING → (BLOCKED ↔ RUNNING) → COMPLETED | CANCELLED → ARCHIVED
Step:   NOT_STARTED → IN_PROGRESS → (BLOCKED ↔ IN_PROGRESS) → COMPLETED | SKIPPED
```

`maybeAutoTransitionRun` is called after every step transition. It
recomputes the run status from the children:

- Any step blocked → run blocked.
- Every required step terminal (completed/skipped) → run completed.
- Otherwise → run running.

## Idempotency

Generated tasks always have:

- `sourceType = "PLAYBOOK"`
- `sourceId = playbookRunStepId` (UUID)

The task generator skips run steps that already have `taskId` set,
so calling it twice never duplicates tasks. The run row is flagged
`tasksGenerated = true` after the first successful generation.

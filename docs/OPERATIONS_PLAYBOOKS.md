# Operations playbooks

**Route:** `/dashboard/playbooks`

## Current implementation

Static reference playbooks in `lib/operations-playbooks.ts` (checklists, suggested modules, timelines). **No automatic task generation** until `OperationsPlaybook` Prisma models and actions are added.

## Future database shape (Phase 7)

- `OperationsPlaybook`: workspace, `businessMode`, title, `stepsJson`, `active`.
- Optional normalized `PlaybookStep` if reporting per-step.

## Actions (future)

- Activate / duplicate / edit / “generate tasks” into `Task` rows with links back to modules.

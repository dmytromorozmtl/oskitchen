# Playbook QA checklist

Run through this when shipping any change to the Playbooks module.

## Smoke

- [ ] `/dashboard/playbooks` loads without crashing.
- [ ] System templates are present (7 rows after first visit).
- [ ] Switching the workspace's business mode changes the recommended
      template on the Recommended tab.

## Detail / run lifecycle

- [ ] Open a system template detail page — steps render in order.
- [ ] Click "Run" — a new `PlaybookRun` is created and the user
      lands on `/dashboard/playbooks/runs/[runId]`.
- [ ] Move the first step to `IN_PROGRESS`, then `COMPLETED`.
- [ ] Block a step with a reason; run status flips to `BLOCKED`.
- [ ] Unblock the step; run status returns to `RUNNING`.
- [ ] Complete all required steps; run auto-completes.

## Task generation

- [ ] Click "Generate tasks" — `KitchenTask` rows are created with
      `sourceType = "PLAYBOOK"` and `sourceId` set to a run step id.
- [ ] Click "Generate tasks" again — no duplicates.
- [ ] Open `/dashboard/tasks` and confirm tasks show with role and
      due dates.

## Custom builder

- [ ] `/dashboard/playbooks/new` saves a new playbook with at least
      one required step.
- [ ] Running the custom playbook works end-to-end.

## Permissions

- [ ] As a non-owner viewer, `playbooks.run` returns Forbidden.
- [ ] Super-admin (`workspace.moroz@gmail.com`) can do everything.

## Today board

- [ ] `/dashboard/today` shows the Playbook strip *only* when there
      is a recommended playbook or at least one active run.
- [ ] Continue button on the strip jumps to the right run.

## Build

- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.

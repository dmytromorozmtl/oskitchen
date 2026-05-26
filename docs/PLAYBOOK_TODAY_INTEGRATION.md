# Today board integration

`/dashboard/today` now renders `<PlaybookTodayStrip />` between the
"Next best action" card and the KPI grid.

Behaviour:

- Loads `recommendedPlaybooksForMode(scope, businessMode)` and
  highlights the top pick.
- Loads up to 4 active runs (`RUNNING` or `BLOCKED`).
- Surfaces KPI counts (active / blocked / overdue) inline.
- Falls back to *nothing* if there are no recommendations *and* no
  active runs — the Today board stays unchanged for first-time
  workspaces.

CTAs link to:
- `/dashboard/playbooks/[playbookId]` for opening a recommended
  playbook.
- `/dashboard/playbooks/runs/[runId]` to continue an in-flight run.
- `/dashboard/playbooks` to jump to the command center.

The legacy "Open a playbook" link inside the quiet-day card on
Today still works (now lands on the new command center).

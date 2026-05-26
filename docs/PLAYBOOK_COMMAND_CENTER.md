# Playbooks Command Center

Routes under `/dashboard/playbooks`:

| Route | Purpose |
|-------|---------|
| `/dashboard/playbooks` | Recommended for current business mode + active runs + KPIs |
| `/dashboard/playbooks/all` | Every playbook in the workspace |
| `/dashboard/playbooks/active` | RUNNING / BLOCKED / COMPLETED / CANCELLED runs |
| `/dashboard/playbooks/templates` | Read-only system templates |
| `/dashboard/playbooks/custom` | Workspace-owned custom playbooks |
| `/dashboard/playbooks/schedule` | Anything with a non-`MANUAL` trigger |
| `/dashboard/playbooks/reports` | Completion / blockers / business mode usage |
| `/dashboard/playbooks/settings` | Safety defaults + audit log |
| `/dashboard/playbooks/[playbookId]` | Detail (overview, steps, runs) |
| `/dashboard/playbooks/runs/[runId]` | Live run view with step controls |
| `/dashboard/playbooks/new` | Custom builder form |

## KPIs

The strip on the recommended page shows:

- Active runs (RUNNING + BLOCKED)
- Completed today
- Blocked steps (run-step level)
- Overdue runs (RUNNING/BLOCKED with `dueAt < now`)
- Templates available
- Tasks generated (lifetime)

Computed in `getPlaybookKpis(scope)`.

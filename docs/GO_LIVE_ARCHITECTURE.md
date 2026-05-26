# Go-live Command Center — architecture

## Layers

```
app/dashboard/go-live/...               (UI)
  ├── page.tsx                           Command Center overview
  ├── projects/[projectId]/page.tsx     Per-project launch console
  └── test-run/page.tsx                  Legacy simulation (preserved)

components/dashboard/go-live/...         (Client components)
  ├── subnav.tsx
  ├── kpi-grid.tsx
  ├── status-badges.tsx
  ├── stage-strip.tsx
  ├── create-project-form.tsx
  ├── checklist-row.tsx
  ├── simulation-launcher.tsx
  ├── approval-buttons.tsx
  ├── incident-form.tsx
  ├── rollback-form.tsx
  └── status-transition.tsx

actions/go-live.ts                       (Server Actions, Zod-validated)

services/go-live/go-live-service.ts      (Business logic, Prisma I/O,
                                          audit events, validation refresh)

lib/go-live/                             (Pure helpers, no I/O)
  ├── launch-stages.ts                   Stage list, labels, tones
  ├── readiness-engine.ts                Signals + weighted scoring
  ├── blocker-engine.ts                  Deterministic launch blockers
  ├── launch-score.ts                    Risk + approval eligibility
  ├── simulation-engine.ts               Deterministic simulations
  ├── launch-validator.ts                Wraps readiness + blockers
  ├── rollback-engine.ts                 Default rollback plans
  ├── go-live-permissions.ts             Role-based capabilities
  └── checklist-templates.ts             Per-business-type checklist
```

## Key design rules

1. **`lib/` is pure** — no Prisma, no auth, no I/O. Every function is
   deterministic given an input snapshot.
2. **`services/` owns I/O** — Prisma reads, writes, and the audit log
   live here.
3. **`actions/` is the trust boundary** — authentication + permission
   check + Zod parse + delegate to a service.
4. **`app/` is composition** — pages fetch state via services and
   render React Server Components.
5. **`components/` is rendering** — client components handle user
   interaction and call server actions.

## Data flow

```
                ┌─────────────────────┐
                │  Workspace data     │
                │  (Menu, Product,    │
                │   Order, Subscription, │
                │   Connection, …)    │
                └──────────┬──────────┘
                           │
                           ▼ Prisma reads
              ┌─────────────────────────────┐
              │ loadReadinessInputs()       │
              │ services/go-live/...        │
              └─────────────┬───────────────┘
                            ▼
              ┌─────────────────────────────┐
              │ buildReadinessSignals       │
              │ → calculateReadiness        │
              │ → detectBlockers            │
              │ → riskFromInputs            │
              │ → validateLaunch            │
              │ (all lib/go-live/*)         │
              └─────────────┬───────────────┘
                            ▼
              ┌─────────────────────────────┐
              │ refreshAutoValidation:      │
              │  • updates checklist rows   │
              │  • updates project status,  │
              │    risk, readiness          │
              │  • records audit event      │
              └─────────────┬───────────────┘
                            ▼
                  UI renders the snapshot
```

## Status transitions

```
NOT_STARTED → IN_PROGRESS → NEEDS_REVIEW → READY → APPROVED → LIVE
                       ↘ BLOCKED ↗                    ↓
                                              POST_LAUNCH_MONITORING
                                                       ↓
                                                  COMPLETED
                       (any) → ROLLBACK_MODE → IN_PROGRESS
```

`transitionStatus` re-runs the validator before allowing APPROVED or
LIVE. Critical blockers always force `BLOCKED` unless `override=true`
is set by a user with `go-live.unlock` (superadmin only).

## Audit trail

Every meaningful operation writes a row to `GoLiveProjectEvent` with
`eventType` like `PROJECT_CREATED`, `CHECKLIST_UPDATED`, `SIMULATION_RAN`,
`APPROVAL_RECORDED`, `INCIDENT_OPENED`, `INCIDENT_UPDATED`,
`ROLLBACK_PLAN_CREATED`, `STATUS_TRANSITION`, `AUTO_VALIDATION`.

## Coexistence with legacy module

The original `/dashboard/go-live` checklist + `/dashboard/go-live/test-run`
form remain reachable. When no `GoLiveProject` exists, the new Command
Center renders the legacy 13-item checklist read-only as a smooth
transition while encouraging the user to spin up a project.

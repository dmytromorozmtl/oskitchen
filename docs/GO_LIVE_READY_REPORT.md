# Go-live Command Center — ready report

## Summary

`/dashboard/go-live` has been transformed from a passive 13-item
checklist into a full **Launch Command Center**. The new system orchestrates
discovery → data migration → catalog → channels → production → packing →
delivery → staffing → finance → simulation → soft launch → full launch →
post-launch monitoring, with deterministic readiness scoring, structured
blockers, approvals, rollback plans, and incident management.

## Schema additions (additive only)

New enums: `GoLiveLaunchStatus`, `GoLiveLaunchStage`, `GoLiveLaunchMode`,
`GoLiveRiskLevel`, `GoLiveBlockerSeverity`, `GoLiveChecklistStatus`,
`GoLiveSimulationType`, `GoLiveSimulationResult`, `GoLiveApprovalType`,
`GoLiveIncidentSeverity`, `GoLiveIncidentStatus`, `GoLiveIncidentCategory`.

New models:

- `GoLiveProject` (stage + status + risk + readiness + brand/location scope)
- `GoLiveChecklistItem` (stage-aware, weighted, auto-validated)
- `GoLiveSimulation` (type, result, output JSON)
- `GoLiveApproval` (one row per `(projectId, approvalType)`)
- `GoLiveIncident` (severity, category, status, lifecycle stamps)
- `GoLiveRollbackPlan` (steps JSON, trigger condition, owner)
- `GoLiveProjectEvent` (audit log)

The legacy `GoLiveTestRun` table is untouched; the legacy
`/dashboard/go-live/test-run` page still functions.

## lib/go-live

| File | Purpose |
|------|---------|
| `launch-stages.ts` | Stage ordering, labels, tones, helpers |
| `readiness-engine.ts` | Signals + weighted scoring + business-type multipliers |
| `blocker-engine.ts` | Deterministic launch blockers (13 rules) |
| `launch-score.ts` | Risk classification and approval eligibility |
| `simulation-engine.ts` | 7+ scenarios with deterministic findings |
| `launch-validator.ts` | Glue: readiness + blockers → recommended status |
| `rollback-engine.ts` | Default rollback plans seeded by mode |
| `go-live-permissions.ts` | Role-based capability matrix |
| `checklist-templates.ts` | Stage-aware template list + business extras |

## services/go-live/go-live-service.ts

- `loadReadinessInputs` — single Prisma snapshot
- `listProjects`, `getProject`
- `createProject` (seeds checklist + rollback plans + event)
- `refreshAutoValidation` (recompute checklist + project state)
- `updateChecklistItem`, `runSimulationForProject`,
  `recordApproval`, `createIncident`, `updateIncident`,
  `createRollbackPlan`, `transitionStatus`, `workbenchSnapshot`

Every state-mutating function records a `GoLiveProjectEvent`.

## actions/go-live.ts

Server Actions: project create, refresh, checklist update,
simulation, approval, incident create/update, rollback plan create,
status transition. All Zod-validated, all gated by
`canUseGoLive(scope, capability)`.

## UI

- `/dashboard/go-live` — Command Center overview with KPI grid and
  project list, plus a legacy-checklist fallback for workspaces
  without a project.
- `/dashboard/go-live/projects/[projectId]` — full launch console:
  KPI tiles, stage strip, validation report, stage-grouped checklist,
  simulation launcher with history, approval matrix, incident log,
  rollback plans, audit timeline.
- `/dashboard/go-live/test-run` — legacy simulation form preserved.

## Operational features implemented

- ✅ Validate operational readiness (weighted, business-type aware)
- ✅ Detect launch risks (5 levels, deterministic)
- ✅ Simulate production day (7 scenarios + custom)
- ✅ Orchestrate onboarding (13-stage pipeline)
- ✅ Verify integrations (broken-channel blocker + healthy count)
- ✅ Verify menu/catalog integrity (menu + product + mapping blockers)
- ✅ Verify packing/production flow (packing verification + production batch)
- ✅ Verify routing/delivery flow (delivery routes signal)
- ✅ Verify staffing readiness (active staff + training count)
- ✅ Verify analytics/tracking (UsageEvent signal)
- ✅ Verify payment/billing (Subscription signal + blocker)
- ✅ Verify backups (signal placeholder; non-blocking)
- ✅ Manage approvals (5 required + 1 optional, immutable audit)
- ✅ Support phased / multi-brand / multi-location launches (scoped projects)
- ✅ Support rollback procedures (4 seeded + custom)
- ✅ Monitor first live days (post-launch monitoring window)

## Safety guarantees

1. The `/dashboard/go-live` route still renders for existing
   workspaces. The legacy 13-item checklist is preserved as a
   read-only summary when no `GoLiveProject` exists.
2. The legacy `/dashboard/go-live/test-run` page and
   `runGoLiveTestRunVoid` action are untouched.
3. No existing Prisma model is changed. No enum value is removed.
4. No silent overrides — APPROVED / LIVE require either green
   validation (`readiness >= 80`, no CRITICAL blockers, all required
   approvals) or an explicit `override=true` from a
   `go-live.unlock`-capable actor, which writes the override flag into
   the audit event.
5. The deterministic engine never produces randomness; the same
   workspace snapshot always produces the same readiness score and
   the same blockers.
6. `workspace.moroz@gmail.com` retains full superadmin access via
   `isSuperAdminGoLive`.

## Build status

- `npm run typecheck` — passes.
- `npm run build` — passes.
- `npx prisma migrate deploy` — `20260522100000_go_live_command_center`
  applied cleanly.

## Remaining recommendations (P2 / future)

- Persist explicit `LaunchMode` view filters on the overview page
  (pilot vs. soft vs. full).
- Add a "Compare locations" board when 3+ projects exist.
- Wire SSE/notifications so post-launch monitoring alerts surface in
  the bell tray.
- Add a `DataExport` table to satisfy the `hasBackup` signal more
  precisely than the current placeholder.
- Add formal training-completion model so `trainingCompletions` is
  not a placeholder zero.
- Add PDF export of the validation report + audit log for compliance
  archives.
- Allow operators to mark a rollback plan as "rehearsed" with a
  timestamped acknowledgement.

## Files added

- `prisma/migrations/20260522100000_go_live_command_center/migration.sql`
- `lib/go-live/launch-stages.ts`
- `lib/go-live/readiness-engine.ts`
- `lib/go-live/blocker-engine.ts`
- `lib/go-live/launch-score.ts`
- `lib/go-live/simulation-engine.ts`
- `lib/go-live/launch-validator.ts`
- `lib/go-live/rollback-engine.ts`
- `lib/go-live/go-live-permissions.ts`
- `lib/go-live/checklist-templates.ts`
- `services/go-live/go-live-service.ts`
- `actions/go-live.ts`
- `components/dashboard/go-live/subnav.tsx`
- `components/dashboard/go-live/kpi-grid.tsx`
- `components/dashboard/go-live/status-badges.tsx`
- `components/dashboard/go-live/stage-strip.tsx`
- `components/dashboard/go-live/create-project-form.tsx`
- `components/dashboard/go-live/checklist-row.tsx`
- `components/dashboard/go-live/simulation-launcher.tsx`
- `components/dashboard/go-live/approval-buttons.tsx`
- `components/dashboard/go-live/incident-form.tsx`
- `components/dashboard/go-live/rollback-form.tsx`
- `components/dashboard/go-live/status-transition.tsx`
- `app/dashboard/go-live/layout.tsx`
- `app/dashboard/go-live/projects/[projectId]/page.tsx`
- `docs/GO_LIVE_*.md` (10 files + this final report)

## Files modified

- `prisma/schema.prisma` — additive enums, new models, back-relations
  on `UserProfile`, `Brand`, `Location`.
- `app/dashboard/go-live/page.tsx` — transformed into Command Center;
  legacy checklist preserved as the empty-state.

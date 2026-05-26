# Implementation & Go-Live Center — ready report

## What changed

`/dashboard/implementation` is no longer a single project intake form.
It is a full **Implementation & Go-Live Center** with:

- A 9-step wizard.
- A project Command Center (KPIs + active project view).
- A project-detail multi-tab page (Overview / Timeline / Checklist /
  Migration / Integrations / Training / UAT / Go-Live / Risks /
  Activity).
- A deterministic Go-Live Readiness engine that scores every
  workspace 0–100, persists per-check results, and refuses to flip
  status to LIVE if required checks fail.
- A preview-first task generator that creates `KitchenTask` rows
  (`sourceType = IMPLEMENTATION`) only after explicit confirmation.
- A full audit log via `ImplementationEvent`.

## Implementation project model

Additive Prisma migration
`20260521000000_implementation_center`:

- Extends `ImplementationStatus` (adds SETUP, MIGRATION, TRAINING,
  TESTING, READY_FOR_GO_LIVE, LIVE, POST_LAUNCH, CANCELLED).
- Adds enums: `ImplementationPhaseKey`,
  `ImplementationPhaseStatus`, `ImplementationChecklistStatus`,
  `ImplementationChecklistPriority`, `GoLiveReadinessStatus`.
- Adds columns to `implementation_projects`: `readiness_score`,
  `readiness_snapshot_json`, `created_by` + go-live / owner indexes.
- Adds tables: `implementation_phases`,
  `implementation_checklist_items`, `implementation_events`,
  `go_live_readiness_checks`.

## Wizard

`/dashboard/implementation/new` — 9 steps: profile → business mode →
current systems → migration scope → module scope → integrations →
training → go-live target → review. Nothing is persisted until the
review step submits.

## Checklist templates

Phase-aware seeds per business type
(`Restaurant / Café / Bar / Bakery / Catering / Meal Prep /
Ghost Kitchen / Multi-Brand`) with shared discovery / setup / training
/ UAT / go-live / post-launch items and a business-specific block in
the Operations or Storefront phase.

## Readiness engine

Categories: workspace setup, business mode, locations, brands, menus /
items, staff, sales channels, imports, reports, billing settings (via
the required-for-go-live checklist roll-up). Scoring is pure and
honest; required failing checks block the status transition to LIVE.

## Migration planning

Datasets surface with links to the Import Center. Recent import job
history is mirrored in the migration tab so the implementation owner
has a single screen.

## Integration tracking

Reads real `IntegrationConnection` rows; mirrors `CONNECTED /
NEEDS_AUTH / DISABLED / ERROR`. Placeholders (Uber Eats, Uber Direct,
Email) are labelled honestly.

## Training / UAT / Go-Live / Risks / Activity

Each lives on its own sub-tab inside the project detail page.

## Task generation

Preview-first: the Implementation Center never silently creates tasks.
`previewImplementationTasksAction` lists what *would* be created, and
`generateImplementationTasksAction` creates only the checked items.
Already-linked items are skipped.

## Permissions

`canUseImplementation(scope, capability)` matrix with
`implementation.view / create / edit / assign / complete_checklist /
generate_tasks / run_readiness / go_live / reports`. Owner / admin /
superadmin retain full access.

## Remaining limitations

- Training completion still lives in `/dashboard/training`; the
  Implementation Center surfaces planning, not LMS state.
- Uber Eats / Uber Direct / Email integrations stay as honest
  placeholders until their real adapters land.
- Stakeholder + waves UI is not yet rebuilt; legacy
  `ImplementationStakeholder` / `ImplementationWave` rows continue
  to exist and can be surfaced in a later iteration.

## Next recommendations

1. Wire `ImplementationStakeholder` + `ImplementationWave` into the
   project detail page once the customer-success team confirms the
   workflow.
2. Optional notification on phase transitions (email / Slack).
3. Add a per-business-mode launch-day script generator that produces
   a printable PDF rollback plan.
4. Add a `/dashboard/implementation/playbooks` link card once the
   Playbooks module exposes per-implementation runs.

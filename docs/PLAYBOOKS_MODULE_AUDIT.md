# Operations Playbooks module audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/playbooks`, `lib/operations-playbooks.ts`,
adjacent modules consulted: Today, Orders, Production, Packing,
Routes, Tasks, Catering, Meal Plans, Forecast, Ingredient Demand,
Purchasing, Costing, CRM, Channels.

## TL;DR

`/dashboard/playbooks` today is a server component that renders a
hard-coded `OPERATIONS_PLAYBOOKS` array. Each entry has a slug, a
title, a description, a `businessType`, a string list of steps, and a
comma-separated `modules` string. There is **no**:

- task generation,
- per-step state,
- run history,
- assignment to staff or roles,
- recurrence,
- integration with the Today board beyond the "Open a playbook"
  button,
- permission gating beyond `requireSessionUser`,
- audit log.

The existing seven templates (Restaurant daily prep, Meal prep weekly
cycle, Catering event workflow, Bakery preorder day, Café morning
setup, Bar event night, Ghost kitchen rush) are valuable copy and
must be preserved.

This project turns each template into an executable workflow with a
data model, deterministic task generation, run tracking, and a small
Today-board strip — without breaking the legacy static page.

## Findings

| #  | Area | Current state | Why it is limiting | Affected business | Recommended fix | Pri |
|----|------|---------------|--------------------|-------------------|-----------------|-----|
| 1  | Persistence | Templates are TS constants | Can't store custom playbooks; can't track runs | All | Add `Playbook`, `PlaybookStep`, `PlaybookRun`, `PlaybookRunStep`, `PlaybookEvent` tables and import the 7 templates as `systemTemplate = true` rows | P0 |
| 2  | Task generation | None — copy says "planned" | Owner can't turn a SOP into work for staff | All | `PlaybookTaskGenerator` builds `KitchenTask` rows linked back to the run / step (idempotent) | P0 |
| 3  | Run lifecycle | None | Cannot tell what is in progress / blocked / completed | All | `PlaybookRun.status` enum + per-step status; only an explicit action moves states | P0 |
| 4  | Step state | None | Steps shown as a list, no tick | All | `PlaybookRunStep` with `NOT_STARTED / IN_PROGRESS / BLOCKED / COMPLETED / SKIPPED` | P1 |
| 5  | Assignments | None | Steps don't know who owns them | All | `assignedRole`, `assignedToId` on `PlaybookRunStep` (carried to the generated task) | P1 |
| 6  | Dependencies | None | Step ordering is fixed; can't "blocks step #3" | All | `dependencyStepIdsJson` on `PlaybookStep` | P2 |
| 7  | Recurrence | None | Same SOP must be reopened manually each day | Restaurant / Café / Bar / Meal Prep | `triggerType` + `recurrenceRule` on `Playbook` with deterministic "next run" preview (no auto-execute) | P1 |
| 8  | Module links | Comma string | Can't deep-link a step into the module that owns it | All | `moduleKey` + `actionRoute` on each step | P1 |
| 9  | Business-mode mapping | Single `businessType` per template | Some SOPs apply to 2+ modes (e.g. Restaurant + Café opening) | Multi-brand / Café | `businessModesJson` array | P2 |
| 10 | Permissions | `requireSessionUser` | Any signed-in user can see / edit | Compliance | `canUsePlaybook(scope, capability)` matrix | P0 |
| 11 | Today integration | Just a link | Owners can't see which playbook to run *now* | All | Compact "recommended / active runs" strip on `/dashboard/today` | P1 |
| 12 | Custom builder | None | Owners can't write their own SOPs | All | `/dashboard/playbooks/new` with a form-driven step builder | P1 |
| 13 | Reports | None | Owners don't know completion / compliance | Manager | `/dashboard/playbooks/reports` with completion + blocked metrics | P2 |
| 14 | Audit | None | Compliance can't reconstruct who did what | Compliance | `PlaybookEvent` rows on every state transition | P1 |
| 15 | Empty states | n/a (always shows the same 7) | If we delete templates the page goes blank | All | Add explicit empty state + "Use system template" CTA | P2 |
| 16 | Safety | n/a | Could accidentally double-generate tasks | All | Idempotency: `KitchenTask.sourceType = "PLAYBOOK"` + `sourceId = runStepId` plus a check inside the generator | P0 |

## Priority legend

- **P0** — Workflow correctness / safety.
- **P1** — High operational value.
- **P2** — UX improvements.
- **P3** — Future (cross-workspace SOP sharing, voice walkthrough).

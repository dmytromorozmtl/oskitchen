# Implementation / Onboarding module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/implementation`, `actions/implementation.ts`,
`ImplementationProject` + `ImplementationTask` Prisma models, and
relationships with Templates, Import Center, Go-Live, Training,
Storefront, Sales Channels, Staff, Reports.

## TL;DR

The current `/dashboard/implementation` page is a single
project-creation form bound to `createImplementationProjectVoid`.
After creation it seeds 9 hard-coded `ImplementationTask` rows
across the `DISCOVERY / DATA / INTEGRATIONS / MENU / PRODUCTION /
PACKING / STAFF / BILLING / LAUNCH` categories and renders them
inline with a `<select>` status toggle.

What's missing for a real Implementation & Go-Live Center:

- No phase model (Discovery → Setup → Migration → … → Post-launch).
- No checklist beyond a flat task list (no `requiredForGoLive`,
  no `moduleKey`, no `actionRoute`, no rich blockers, no per-item
  ownership).
- No readiness score that's traceable to actual workspace state.
- No risks UI surface (the model exists; not rendered).
- No migration planner (Import Center is linked, not orchestrated).
- No integration tracking sub-view.
- No training plan.
- No UAT scenarios.
- No launch-day plan.
- No audit log of who did what.
- No wizard for guided project creation.
- No multi-tab project detail page.
- No reports beyond `/dashboard/implementation/reports`.

## Findings

| #  | Area | Current state | Why it is limiting | Stage affected | Recommended fix | Pri |
|----|------|---------------|--------------------|----------------|-----------------|-----|
| 1  | Phases | None | Cannot model Discovery → Setup → Migration → Training → UAT → Go-Live → Post-launch | All | New `ImplementationPhase` model | P0 |
| 2  | Rich checklist | None — only flat `ImplementationTask` rows | No `requiredForGoLive`, `moduleKey`, `actionRoute`, `blockerReason` | All | New `ImplementationChecklistItem` model alongside existing tasks (additive) | P0 |
| 3  | Readiness engine | None | Owners don't know if they're truly ready | Go-live | New `GoLiveReadinessCheck` table + deterministic scoring | P0 |
| 4  | Wizard | One form | Hard to capture multi-step project scope | Discovery | `/dashboard/implementation/new` 9-step wizard | P1 |
| 5  | Risks | Model exists, not rendered | Owners can't see what's blocking them | All | Render risks panel on project detail; reuse `ImplementationRisk` | P1 |
| 6  | Audit | None | Compliance / customer success can't reconstruct history | All | New `ImplementationEvent` rows for every state change | P1 |
| 7  | Migration planning | Direct link to Import Center | Owners must guess which datasets | Migration | New "Data Migration" project tab listing required datasets and Import Center links | P1 |
| 8  | Integration tracking | None | Setup blockers invisible | Integrations | New "Integrations" tab tied to `IntegrationConnection` status | P1 |
| 9  | Training plan | None | No way to track who's been trained | Training | New "Training" tab — role-by-module matrix | P1 |
| 10 | UAT scenarios | None | Owners skip testing | Testing | New "UAT" tab with seeded test scenarios per business mode | P1 |
| 11 | Go-live plan | A single `goLiveTestRun` check | Lacks launch-day plan + rollback | Go-live | New "Go-Live" tab with date / time / owner / rollback plan / monitoring | P0 |
| 12 | Status taxonomy | `ImplementationStatus` enum missing `SETUP / MIGRATION / TRAINING / TESTING / READY_FOR_GO_LIVE / LIVE / POST_LAUNCH / CANCELLED` | Cannot represent the full lifecycle | All | Extend enum additively | P0 |
| 13 | Task generation | Tasks created silently at project creation | Sometimes desired, but no preview / no idempotency | Setup | Keep legacy seeding for backward compat; add explicit "Generate setup tasks" action with preview | P1 |
| 14 | Templates integration | None | Templates can pin modules, but no auto-checklist | Setup | Recommend templates on project overview; never apply silently | P1 |
| 15 | Permissions | `requireUserProfile` only | Anyone signed in can land here | Compliance | `canUseImplementation(scope, cap)` matrix; `templates.apply`-style gating for state changes | P0 |
| 16 | Empty states | Plain form | Doesn't recommend a path | Discovery | Add explicit empty state with three CTAs (start, use template, open go-live) | P2 |
| 17 | Reports | Existing `/dashboard/implementation/reports` page | Not connected to readiness / blockers / training | All | Wire reports to new readiness + checklist rollups | P2 |
| 18 | Data safety | n/a | Importing happens elsewhere, but nothing prevents accidental silent runs | Migration | The Implementation Center only links to Import Center; it never invokes import actions directly | P0 |

## Priority legend

- **P0** — Launch / data safety correctness.
- **P1** — High onboarding value.
- **P2** — UX.
- **P3** — Future.

## Safety contract

1. Implementation actions **never** touch live orders, customers,
   menus, or invoices.
2. Implementation actions **never** call Import Center routes that
   commit data — they only link out.
3. Implementation actions **never** apply Templates — they
   recommend them.
4. Integration tracking shows real `IntegrationConnection` status;
   it never reports "Connected" for credentials that aren't.
5. Readiness score is honest: required failing checks block the
   `READY_FOR_GO_LIVE` transition.
6. Super-admin (`workspace.moroz@gmail.com`) bypasses role checks
   but is still bound by 1–5.

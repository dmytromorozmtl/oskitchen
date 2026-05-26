# Go-live module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/go-live`, `/dashboard/go-live/test-run`,
`actions/implementation.ts::runGoLiveTestRunVoid`, `GoLiveTestRun`,
`ImplementationProject` + `ImplementationChecklistItem` + `ImplementationPhase`
+ `GoLiveReadinessCheck`, and related downstream modules (Sales
Channels, Production, Packing, Storefront, Billing, Import Center,
Product Mapping Workbench).

## TL;DR

`/dashboard/go-live` is currently a **passive checklist of 13 hard-coded
labels**. Each label has a hardcoded route and a hand-written
predicate that toggles "Ready" vs "Open" against `KitchenSettings`,
`Product`, `KitchenCustomer`, `IntegrationConnection`, `Order`,
`StaffMember`, `Subscription`, and `ImplementationTask`. A separate
`/dashboard/go-live/test-run` page lets the operator stash a
`GoLiveTestRun` row with a free-text note.

The page does **not** answer most of the operational questions a real
launch requires: dependencies between checks, ownership, due dates,
weighted readiness, dynamic blockers, simulation results, approvals,
rollback procedures, multi-location/brand rollout, post-launch
monitoring, or incident management. The page is stateless — refreshing
the URL is the only way to "validate".

## Findings

| #  | Area | Current behaviour | Operational risk | Affected workflow | Recommended architecture | Pri |
|----|------|--------------------|-------------------|--------------------|---------------------------|-----|
| 1  | Readiness scoring | Linear: 13 fixed boolean checks, % = count/13 | Cannot weight launch-critical checks; cannot adapt to business type | Owners think they are 100% ready when packing is untested | Weighted, category-based readiness engine (`lib/go-live/readiness-engine.ts`) | P0 |
| 2  | Blockers | Counted from `ImplementationTask.status === "BLOCKED"` | No connection to the actual cause; cannot detect missing payment, broken sync, unmapped products | Hidden blockers reach production | Deterministic `lib/go-live/blocker-engine.ts` with module links | P0 |
| 3  | Checklist | 13 hard-coded labels in code | No persistence, no ownership, no due date, no escalation | Cannot delegate or audit | Persist as `GoLiveChecklistItem` rows tied to a `GoLiveProject` | P0 |
| 4  | Launch stages | None (the implementation phases exist on `ImplementationPhase` but aren't shown here) | Operators don't know what to do next | Onboarding | `lib/go-live/launch-stages.ts` + visual pipeline | P1 |
| 5  | Simulation | `/test-run` stores a JSON blob with no validation | "Test day" is unverifiable | Production readiness | `lib/go-live/simulation-engine.ts` with typed scenarios + result schema | P0 |
| 6  | Approvals | None | Anyone can declare a launch | Compliance, finance | `GoLiveApproval` rows; status cannot move to APPROVED without required approvals | P0 |
| 7  | Rollback plans | None | First incident is improvised | First 24h | `GoLiveRollbackPlan` + printable checklist | P1 |
| 8  | Incidents | None | Operators have no place to log launch problems | Post-launch | `GoLiveIncident` table + severity/category | P1 |
| 9  | Multi-location | None | Single readiness number for a multi-brand workspace | Ghost kitchens | `brandId`, `locationId` on `GoLiveProject` + filter UI | P1 |
| 10 | Soft launch mode | None | Operators can't capture "limited launch" state | Launch safety | `LaunchMode` enum on `GoLiveProject` (`SOFT`, `FULL`) | P1 |
| 11 | Post-launch monitoring | None | First 24h / 7d issues are invisible | Reliability | Timeline view + KPI deltas | P1 |
| 12 | Business-type awareness | None | Restaurant readiness scored the same as meal-prep | Misaligned launch gates | Per-business-type weights | P1 |
| 13 | Approvals matrix | None | No record of who said go | Audit | `GoLiveApproval` with type & approver | P0 |
| 14 | Status machine | None | Cannot tell if the project is BLOCKED vs IN_PROGRESS | Onboarding | `LaunchStatus` enum with state transitions | P0 |
| 15 | Integration health | Counted from `IntegrationConnection.status === "CONNECTED"` only | Doesn't reflect last sync, last error | Order intake | Health check derived from `lastSyncAt` + `lastError` | P1 |
| 16 | Validation surface | None | "Validate before launch" has no entry point | Launch | `lib/go-live/launch-validator.ts` returns deterministic report | P0 |
| 17 | Empty states | None | First-time users see a blank checklist | UX | Explicit "Start go-live project" empty state | P2 |
| 18 | Permissions | `requireSessionUser` only | Anyone signed in can mark a launch | Compliance | `canUseGoLive(scope, capability)` matrix; superadmin bypass | P0 |
| 19 | Reporting | None | Cannot export a launch audit | Compliance | PDF-friendly summary pages | P2 |
| 20 | Automations | None | Owners forget about overdue tasks | Onboarding | Stored automations (reminders, alerts on critical blockers) | P2 |

## Priority legend

- **P0** — Launch correctness / data safety. Must ship in this round.
- **P1** — High operational value.
- **P2** — UX or future automation hook.

## Safety contract

1. **No silent overrides.** A launch cannot move into `APPROVED` while
   any `CRITICAL` blocker is open, regardless of role (except the
   superadmin email, who can override with an explicit confirm flag).
2. **No fake validation.** Every readiness check reads real Prisma
   data — no hard-coded checkmarks.
3. **No legacy regression.** `/dashboard/go-live` keeps rendering for
   workspaces that never created a `GoLiveProject`, and continues to
   show the 13 historical checklist labels with the same readiness
   percent calculation.
4. **Stable Prisma.** Schema changes are strictly additive; the
   `GoLiveTestRun` model stays untouched; no enum values removed.
5. **Audit trail.** Every checklist transition, approval, simulation,
   incident, and rollback rehearsal writes a tracked record so the
   audit page can reconstruct who did what.
6. **Workspace scoping.** All queries filter by `userId` of the
   session user. Multi-brand / location filters narrow further but
   never widen.
7. **No secrets exposure.** Integration tokens are never read by the
   Go-live engine — only `status`, `lastSyncAt`, `lastError` snapshot
   fields.
8. **Superadmin.** `workspace.moroz@gmail.com` retains full access
   across all capabilities, including approvals and rollback writes.

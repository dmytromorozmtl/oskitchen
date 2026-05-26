# Training module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/training` and the three sub-pages
(`/dashboard/training/kitchen`, `/packing`, `/manager`), plus their
interaction (or absence of interaction) with `StaffMember`,
`UserProfile`, `GoLiveProject` and the implementation/go-live
readiness engines.

## TL;DR

The training surface is currently a **4-page static walkthrough**.
Each page hard-codes 3–5 bullet points and a button that links into
the live module. There is no LMS data layer: no programs, no
lessons, no quizzes, no certifications, no assignments, no progress.
The "Practice mode" badge is decorative — there is no sandbox.

The audit identifies 24 issues spanning curriculum, data model,
permissions, simulations, mobile UX, and go-live integration.

## Findings

| #  | Area | Current behaviour | Operational risk | Affected teams | Recommended solution | Priority |
|----|------|--------------------|------------------|----------------|----------------------|----------|
| 1  | Curriculum data model | None — bullet lists only | Cannot track who completed what | All | New `TrainingProgram` / `TrainingModule` / `TrainingLesson` | P0 |
| 2  | Assignments | None | Cannot tell a trainee "do this" | Managers, HR | `TrainingAssignment` with status, due date | P0 |
| 3  | Progress tracking | None | Cannot prove a staff member finished a lesson | Compliance | `TrainingProgress` rows per lesson | P0 |
| 4  | Quizzes | None | No knowledge checks | Kitchen, Packing | `TrainingQuiz` with question types, scoring | P0 |
| 5  | Certifications | None | No expiry tracking; cannot enforce "must be certified before…" | Compliance, Go-live | `TrainingCertification` with `expiresAt` | P0 |
| 6  | Simulations | None (Practice mode is decorative) | Cannot rehearse safely | Kitchen, Packing | `TrainingSimulation` rows + run engine | P0 |
| 7  | Incident drills | None | Allergens, POS outages never rehearsed | All | `TrainingIncidentDrill` library | P1 |
| 8  | SOPs | Not represented in the system | Standard procedures live in Notion / Docs | Compliance | `SOPDocument` with versions & acknowledgements | P0 |
| 9  | SOP acknowledgement | None | Cannot prove staff read the food-safety SOP | Compliance | `SOPAcknowledgement` rows | P0 |
| 10 | Role-based paths | Three hardcoded roles | Cannot onboard a delivery driver or catering coordinator | Multi-role teams | `TrainingProgram.roleType` + path templates | P1 |
| 11 | Onboarding | None as a workflow | Operators DIY in chat | New hires | Onboarding sequence: welcome → setup → SOP → sim → quiz → cert | P0 |
| 12 | Manager approvals | None | Practice mode never converts to "live" | Kitchen, Managers | Manager approval step on critical certifications | P1 |
| 13 | Analytics | None | No visibility into completion or pass rates | Operations | Aggregated KPI grid + per-employee scorecards | P1 |
| 14 | Mobile / tablet UX | Default desktop layout | Hard to use on kitchen tablets with gloves on | Kitchen | Kiosk mode + large buttons + fullscreen lessons | P1 |
| 15 | Multilingual | None | Spanish/French staff cannot read SOPs | Multi-language teams | `language` field on SOPs and lessons | P2 |
| 16 | Practice mode isolation | No data sandbox | Risk of accidental writes | Kitchen, Packing | `practiceMode` flag on assignments; service refuses writes | P0 |
| 17 | Go-live integration | No link | Workspace can launch with zero training | Implementation | Block APPROVED if required certifications missing | P0 |
| 18 | Implementation integration | No link to checklist items | Training never tied to onboarding plan | Implementation | Surface required training on go-live checklist | P1 |
| 19 | Permissions | Only `requireSessionUser` | Any signed-in user can mark themselves trained | Compliance | Role-based capability matrix; superadmin bypass | P0 |
| 20 | Audit trail | None | Cannot reconstruct who signed off | Compliance | `TrainingEvent` table | P1 |
| 21 | Empty states | None | New workspaces stare at three blank role tiles | All | Explicit "No training programs yet" CTA | P2 |
| 22 | Reporting | None | Cannot export training transcripts | HR, audits | PDF-friendly summary | P2 |
| 23 | Automations | None | Nobody is reminded about overdue training | Managers | Reminder/notifications hooks | P2 |
| 24 | Multi-location | None | Cannot tag a program "Brooklyn only" | Multi-location | `brandId` / `locationId` scoping | P1 |

## Priority legend

- **P0** — Operational safety / compliance correctness. Ships in this round.
- **P1** — High operational value.
- **P2** — UX or future automation hook.

## Safety contract

1. **Preserve existing routes.** `/dashboard/training` and the three
   sub-pages keep functioning. The Command Center renders above the
   old role tiles for workspaces with no training programs yet.
2. **No fake production data.** Practice-mode assignments never write
   into live orders, inventory, kitchen tasks, or labels.
3. **Audit everything.** Every progress write, quiz attempt,
   certification issuance, and SOP acknowledgement is recorded.
4. **Strict TypeScript and stable Prisma.** Schema changes are
   additive; no enum values removed; no existing model altered.
5. **Workspace scoping.** All queries filter by `userId` of the
   session user. Optional brand/location filters narrow but never
   widen.
6. **Superadmin.** `workspace.moroz@gmail.com` retains full access
   across every capability, including overrides.

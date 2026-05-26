# Staff module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/staff`, the `StaffMember` Prisma model, and the
existing integration points to Tasks, Production, Packing, Routes,
Training, Reports, and Go-live.

## TL;DR

The Staff surface is a **single-page roster**:
- A 3-field "Add teammate" form (name, email, role label).
- A vertical list of staff cards.
- One badge that mirrors the free-form `role` string.

The `StaffMember` schema is minimal: 8 columns, no role enum, no location,
no brand, no status, no employment type, no availability, no shifts, no
certifications, no audit log.

Despite this, the workspace already relies on `StaffMember` to assign
`KitchenTask`, `ProductionBatch`, `ProductionWorkItem`, `PackingBatch`,
`PackingTask`, and to receive Training assignments / progress /
certifications / SOP acknowledgements. Breaking the existing record set is
not acceptable.

## Findings

| # | Area | Current state | Why it is limiting | Affected workflow | Recommended fix | Priority |
|---|------|---------------|---------------------|--------------------|------------------|----------|
| 1 | Schema scope | 8 columns, no enums | No status, no role taxonomy, no location, no shifts | Every downstream module | Additive schema extension (status, role enum, employment type, FKs) | P1 |
| 2 | Role taxonomy | Free-text `role` string | Permissions cannot be enforced | Permissions, Reports | `StaffRoleType` enum + custom-role table | P0 |
| 3 | Permissions | None on `StaffMember` | Any signed-in user reads/writes all staff | Security | Capability-based `canManageStaff` helper | P0 |
| 4 | Status lifecycle | Only `active` boolean | Cannot model invited/training/paused/archived | HR workflows | `StaffStatus` enum (6 states) | P1 |
| 5 | Employment type | Missing | Cannot tell full-time vs contractor | Labor reports | `EmploymentType` enum | P1 |
| 6 | Location/brand | Missing | Multi-location/multi-brand impossible | Reports, scheduling | FK `locationId` + `brandId` on `StaffMember` | P1 |
| 7 | Availability | Missing | Cannot schedule shifts | Scheduling, Go-live | `StaffAvailability` table | P1 |
| 8 | Shifts | Missing | Cannot tell who is on today | Production, Routes | `StaffShift` table | P1 |
| 9 | Certifications | Only via TrainingCertification | No HR-style certification registry | Compliance | `StaffCertification` table joined to Training | P1 |
| 10 | Audit | None | Cannot prove role/permission changes | Compliance | `StaffEvent` table | P1 |
| 11 | Detail page | Missing | Operators cannot drill into one teammate | Day-to-day ops | `/dashboard/staff/[staffId]` with tabs | P1 |
| 12 | Roles UI | Missing | Cannot define custom roles | Permissions | `/dashboard/staff/roles` | P1 |
| 13 | Availability/shifts UI | Missing | Cannot view who is available today | Today board | Dedicated tab | P1 |
| 14 | Training integration | Read-only via Training | Cannot launch assignments from Staff | Onboarding | Server actions that proxy training | P1 |
| 15 | Tasks integration | Already wired (`KitchenTask`) | Cannot view tasks per staff in Staff UI | Day-to-day | Staff detail Tasks tab | P2 |
| 16 | Driver integration | `DeliveryRoute.driverProfileId/driverUserId/driverName` only | Driver staff record not linked | Routes | Add optional FK `driverStaffId` later (out of scope; expose by name match for now) | P3 |
| 17 | Go-live integration | None | Workspace can launch with zero staffing structure | Implementation | `staff-readiness-service` consumed by Go-live readiness | P0 |
| 18 | Reports | None for staff | Cannot show role coverage or shift coverage | HR / Ops | `/dashboard/staff/reports` | P2 |
| 19 | Privacy | All fields exposed to all signed-in users | PII exposure | Security | Server-side filter by role; mask sensitive fields | P0 |
| 20 | SSO/login | Subtitle promises future login | Confusing | Onboarding | Honest "no SSO yet" placeholder | P3 |
| 21 | Empty state | Just a form | New users miss CTAs | UX | Empty state with Add / Import / Roles | P2 |
| 22 | Roster filters | None | Cannot filter by role, status, location | Day-to-day | Filter bar | P2 |
| 23 | Existing form | Works | OK but minimal | Onboarding | Keep working; add upgraded form alongside | P0 |
| 24 | linkedUserId | Missing | Cannot tie staff record to an auth user when SSO ships | Future | Add nullable FK; do not populate without explicit invite flow | P3 |

## Priority legend

- **P0** — Permissions / security / non-regression.
- **P1** — High operational value.
- **P2** — UX or future automation hook.
- **P3** — Future / nice-to-have.

## Safety contract

1. **Preserve the existing route.** `/dashboard/staff` continues to render,
   the original add-teammate form continues to work, and existing
   `StaffMember` rows continue to function (role defaults to `staff`, status
   defaults to `ACTIVE`).
2. **No record deletion.** Archive replaces delete. The `active` boolean is
   kept so existing queries (e.g. tasks filtering by `active = true`) keep
   working; new code uses both `active` and `status`.
3. **Additive schema only.** No existing column or enum is removed. All new
   columns are nullable or have safe defaults.
4. **No fake auth.** `linkedUserId` stays null until SSO ships. The form
   never silently provisions an auth account.
5. **PII protection.** Phone and emergency contact JSON are gated by
   capability checks server-side.
6. **Strict TypeScript.** No `any` in services or actions.
7. **Workspace scoping.** Every query filters by the session `userId`.
8. **Superadmin.** `workspace.moroz@gmail.com` bypasses every gate.

# Packing & labels — ready report

## What changed

1. **Prisma** — additive packing command-center models + migration (see `docs/PACKING_DATA_MODEL.md`).
2. **Libraries** — `lib/packing/*` for modes, terminology, grouping, KPIs, dates, validation, label constants.
3. **Services** — `generate-packing-queue`, `load-packing-page-data`.
4. **Actions** — `actions/packing.ts` for queue generation, task updates, verification events, waves, label placeholder.
5. **UI** — `PackingCommandCenter` replaces passive page; **exports** preserved in tab via `PackingExportsPanel`.
6. **Reports** — `/dashboard/packing/reports` stub with rolling metrics.

## Packing modes supported

All `PackingCommandMode` enum values selectable in UI; generator uses selected mode for label defaults.

## Label system

Template + printed label schema ready; UI uses template count + task-level “log printed” until template-backed print ships.

## Verification integration

`PackingVerificationEvent` rows on verify; deep links to legacy verify UI.

## Route handoff

Grouping + schema support; auto-route assignment not implemented.

## Exports

Unchanged client PDF/CSV.

## Business modes

Titles + empty states adapt via `KitchenSettings.businessType`.

## Model changes

See migration `prisma/migrations/20260517140000_packing_command_center/migration.sql`.

## Remaining limitations

- No catering/event-only generator path.
- No wave ↔ task assignment UI.
- No export history table.
- No per-role packing ACL.
- `PrintedLabel` creation blocked without templates.

## Next recommendations

1. Seed default `LabelTemplate` per user (or relax FK for audit-only rows).
2. Wire `DeliveryStop` → `routeId` on generation.
3. Role-guard packing mutations using `StaffMember.role`.
4. Expand reports with time-series + packer attribution.

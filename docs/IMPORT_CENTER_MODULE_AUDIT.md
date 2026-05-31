# Import Center module audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/import-center`, `actions/implementation.ts`
(commit/upload), `lib/import-center.ts` (legacy validator),
`lib/import-export/*` + `services/import-export/*` (new pipeline),
the existing `ImportJob` / `ImportJobPreviewRow` / `ImportRollback`
Prisma models, and the legacy `/api/import-templates/[type]` route.

## TL;DR

`/dashboard/import-center` is a single-card upload form bound to
`createImportJobFromCsvVoid`. Validation happens through the legacy
`lib/import-center.ts → validateImport()` helper for seven CSV types
(`PRODUCTS / CUSTOMERS / ORDERS / INGREDIENTS / RECIPES / STAFF /
SUPPLIERS`). On a clean preview, the same form action `commit`s the
rows directly into `KitchenCustomer / StaffMember / Ingredient /
Product` tables.

Two parallel implementations exist:

1. **Import Center (legacy form):** `app/dashboard/import-center/page.tsx`
   ↔ `actions/implementation.ts` ↔ `lib/import-center.ts`.
2. **Import / Export Center (wizard scaffold):** `app/dashboard/import-export/*`
   ↔ `services/import-export/*` ↔ `lib/import-export/*`. The Prisma
   side is rich: `ImportJob`, `ImportJobPreviewRow`,
   `ImportRollback`, `DataTemplate`, plus `ImportPreviewRowStatus`,
   `ImportPreviewRowAction`, `ImportRollbackRecordStatus`. So far the
   pipeline only implements ingredients end-to-end and uses a stub
   for rollback.

The Import Center page must become a complete workflow center on
top of the modern primitives, while the legacy commit path stays
working for the seven supported types (no behavior regression for
ongoing implementations).

## Findings

| #  | Area | Current state | Why it is limiting | Data-safety risk | Recommended fix | Pri |
|----|------|---------------|--------------------|------------------|-----------------|-----|
| 1  | Upload UX | Single combobox + file input + immediate parse | No mapping, no preview gate, no mode selection | LOW | Multi-step UI: type → file → mapping → preview → commit | P1 |
| 2  | Validation persistence | `validateImport` returns ephemeral rows; ORDERS gets staged in `StagedOrderImport` only | Other types' previews vanish on refresh | MED | Persist preview rows in `ImportJobPreviewRow` for every type | P1 |
| 3  | Commit safety | `commitImportJobVoid` commits as soon as `errorRows === 0` | Commits warning rows silently; no explicit user confirmation | **HIGH** | New action requires explicit `confirmMode` + `acceptWarnings` flags | P0 |
| 4  | Duplicate detection | Only `customers.upsert` by email; products/ingredients always create | Repeated imports duplicate data | **HIGH** | Per-type duplicate matchers with `create / update / skip / reject` modes | P0 |
| 5  | Update mode | None; existing records are never updated, only created | Customers see partial overwrites or duplicate rows | **HIGH** | `ImportMode` enum (`CREATE_ONLY / UPDATE_EXISTING / UPSERT / SKIP_DUPLICATES`) | P1 |
| 6  | Rollback | `ImportRollback` model exists; logic is a stub | Bad imports leave permanent data | **HIGH** | Capture rollback plan at commit; implement safe deletes for create-only rows | P1 |
| 7  | Supported types | Seven (`PRODUCTS / CUSTOMERS / ORDERS / INGREDIENTS / RECIPES / STAFF / SUPPLIERS`) | Spec needs 13 (brands / locations / nutrition / mappings / menu assignments / purchase items) | LOW | Add validator+template stubs; commit may stay preview-only initially | P1 |
| 8  | Template route | `/api/import-templates/[type]` ships six hard-coded CSV strings | New types absent; column hints absent | LOW | New `/dashboard/import-center/templates` lists every type with required/optional columns | P2 |
| 9  | Templates UI | `/dashboard/import-center/templates/page.tsx` shows six cards | No optional/required columns, no sample preview | LOW | Rich card with required, optional, sample rows, validation notes | P2 |
| 10 | Error report | Inline row-error list per job; no CSV download | Owners can't fix in spreadsheet | MED | "Download error CSV" + "Download warning CSV" actions | P1 |
| 11 | Permissions | `requireSessionUser` only | Anyone signed-in can commit | MED | `canUseImportCenter(scope, capability)` matrix | P0 |
| 12 | Security: file size | `lib/import-export/limits.ts` has caps but legacy path ignores them | OOM risk on legacy upload | MED | Apply `MAX_IMPORT_BYTES / MAX_IMPORT_ROWS` in the new upload action | P0 |
| 13 | Security: formula injection | None on error CSV exports | Spreadsheet RCE risk | **HIGH** | Use `csvEscapeCell` from `services/reports/report-service.ts` | P0 |
| 14 | Column mapping | Hard alias map in `lib/import-center.ts` | Owners can't rename columns or save presets | MED | UI mapping step + reusable `column-mapping` helpers | P1 |
| 15 | History | `/dashboard/import-export/imports` lists jobs; Import Center has only the most recent 12 | Hard to find old jobs from Import Center | LOW | `/dashboard/import-center/history` mirroring the wizard list | P2 |
| 16 | Implementation integration | None — implementation links *to* Import Center | Owners don't see which datasets are still pending | LOW | Implementation project's migration tab reads `ImportJob` history (already done in Implementation Center work) | P3 |
| 17 | Audit log | `resultJson` only | No who / when / what diffs for compliance | LOW | Optional: write `KitchenAuditEvent` rows on commit + rollback | P3 |
| 18 | Empty state | Form only, no CTAs | Owners don't know what to do with no imports | LOW | Add explicit empty state to overview | P2 |

## Priority legend

- **P0** — Data safety correctness.
- **P1** — Core import workflow value.
- **P2** — UX.
- **P3** — Future.

## Safety contract

1. **No commit without preview.** Every commit reads
   `ImportJobPreviewRow` rows and applies only those marked
   `VALID` (and optionally `WARNING` rows when the user explicitly
   opts in).
2. **No commit without confirmation.** Server actions require an
   explicit `confirm: true` flag and a `mode` selection.
3. **No silent overwrite.** Each per-type committer maps `CREATE`,
   `UPDATE`, `SKIP`, `REJECT` from the preview row, never the
   action's discretion.
4. **No fake commits.** Types that aren't fully committable
   (brands, locations, nutrition, mappings, menu assignments,
   purchase items) finish the preview pipeline but the commit
   server action returns an explicit "Preview-only for this type"
   message rather than fudging the row counts.
5. **Rollback plan recorded.** Every successful commit writes a
   `rollbackJson` describing what can be safely undone.
6. **CSV exports sanitised.** Error / warning CSV downloads pass
   each cell through formula-injection sanitisation.
7. **Workspace scoping enforced.** Every read and write checks
   `userId === requireSessionUser().id`.
8. **Superadmin bypass.** `workspace.moroz@gmail.com` retains full
   access via `canUseImportCenter`.

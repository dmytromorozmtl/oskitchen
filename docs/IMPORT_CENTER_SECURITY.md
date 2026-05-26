# Import Center security

The Import Center handles user-uploaded CSV files; data safety and
input handling are first-class concerns.

## Authentication & authorisation

- Every server action and API route calls `requireSessionUser`.
- The Import Center adds `requireUserProfile` so that role-based
  access control runs against a normalised profile.
- `canUseImportCenter(scope, capability)` evaluates:
  - `import.view`, `import.upload`, `import.commit`,
    `import.rollback`, `import.history`, `import.templates`.
  - Workspace owners always have access.
  - `workspace.moroz@gmail.com` (`isSuperAdminEmail`) keeps full
    access via the superadmin bypass.

## Workspace scoping

Every read and write checks `userId === requireSessionUser().id`:

- `prisma.importJob.findFirst({ where: { id, userId }})`
- `prisma.importJob.findMany({ where: { userId }})`
- `prisma.importJobPreviewRow` is selected via `importJobId` whose
  parent job is already scoped.

There is no cross-workspace API surface in the Import Center.

## File handling

- File size limit: `MAX_IMPORT_BYTES` = **8 MB**.
- Row cap (after parsing): `MAX_IMPORT_ROWS` = **10 000**.
- Preview rows persisted: `MAX_PREVIEW_ROWS_PERSISTED` = **800**.
- File contents are parsed in memory; the raw file is **not stored**
  on disk or in the database. Only the parsed `raw` and `normalized`
  values for the first 800 rows are persisted in
  `import_job_preview_rows`.

## CSV formula injection

All exported CSVs (template downloads, error CSV) pass every cell
through `csvEscapeCell` (from `lib/import-export/csv-format.ts`),
which prefixes leading `=`, `+`, `-`, `@`, and tab characters so
spreadsheet engines cannot evaluate them as formulas.

## Permissions matrix

| Capability             | Owner | Admin | Manager | Accountant | Kitchen | Staff | Viewer | Superadmin |
|------------------------|-------|-------|---------|------------|---------|-------|--------|------------|
| `import.view`          | ✅    | ✅    | ✅      | ✅         | ✅      | ✅    | ✅     | ✅         |
| `import.upload`        | ✅    | ✅    | ✅      | —          | —       | —     | —      | ✅         |
| `import.commit`        | ✅    | ✅    | —       | —          | —       | —     | —      | ✅         |
| `import.rollback`      | ✅    | ✅    | —       | —          | —       | —     | —      | ✅         |
| `import.history`       | ✅    | ✅    | ✅      | ✅         | —       | —     | —      | ✅         |
| `import.templates`     | ✅    | ✅    | ✅      | ✅         | ✅      | ✅    | —      | ✅         |

Role names are matched case-insensitively against the user's
`UserProfile.role` field (combined with custom workspace roles where
they exist).

## Secrets handling

- No environment variables or third-party API tokens are read from
  CSV files.
- The Import Center does not call out to external systems during
  upload or preview; commit only touches in-tenant Prisma tables.

## Audit trail

- `ImportJob` rows are the authoritative audit log:
  `createdAt`, `validatedAt`, `committedAt`, `rolledBackAt`,
  `createdById`, `resultJson`, `rollbackJson`.
- `ImportRollback` rows include the actor, reason, count, and
  outcome status.
- The legacy `import_row_errors` table preserves errors from the
  older form-based path.

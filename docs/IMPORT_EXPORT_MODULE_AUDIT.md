# Import / Export module audit (KitchenOS)

Date: 2026-05-07. Scope: `/dashboard/import-export`, `/api/export`, `/api/import-export/template`, Prisma `ImportJob` / `ExportJob` / preview rows, services under `services/import-export/`, `lib/import-export/`.

## Summary

The module evolved from static CSV links to a **Data Operations Center** shell: sub-routes, KPIs, template downloads, ingredient CSV **validation preview** (no production inserts), export job logging, and extended export types. Legacy query URLs remain the contract for backwards compatibility.

---

## `/dashboard/import-export`

| Area | Current state | Limitation | Workflows affected | Recommended fix | Priority |
|------|----------------|-------------|---------------------|-----------------|----------|
| Overview | KPIs + CTAs + legacy link list | KPIs are coarse until plan-tier limits and filters exist | Ops visibility | Tie KPIs to org/workspace and filter chips | P2 |
| Tabs | Subnav via layout | No deep-link tab state in URL beyond paths | Bookmarking | Keep path-based tabs (done) | P3 |
| Import wizard | 8 steps documented; ingredients preview live | Other types not wired to preview | Onboarding | Add validators + preview per `ImportType` | P1 |
| Export center | All `ALL_EXPORT_TYPES` cards | No UI filters/date range yet | Reporting | POST export job + `filtersJson` + async job | P1 |
| Templates | Static CSV via API | Not yet backed by `DataTemplate` rows | Custom columns | Optional DB-backed templates | P2 |
| History | Import/export tables | No CSV download of error rows from UI | QA | `GET` error CSV from job id | P1 |
| Rollback | UI copy + schema ready | Execution not wired | Safety | Transactional import + snapshot + rollback service | P0 |
| Business mode hints | Not in UI | Users pick wrong template | Ghost kitchen / multi-brand | Recommend types by `BusinessType` / brand | P2 |

---

## `/api/export`

| Area | Current state | Limitation | Workflows | Fix | Pri |
|------|---------------|------------|-----------|-----|-----|
| Auth | Supabase session (`createClient`) | Same as before — cookie session | All exports | Keep | — |
| Types | `type` query + `isExportType` | Invalid type → 400 | Automation | Keep strict allowlist | P0 |
| Legacy types | `orders`, `customers`, `products`, `production`, `inventory` | Row caps (e.g. 5k orders) | Large tenants | Background export + email link | P1 |
| Formula injection | `toCsv` / `csvEscapeCell` sanitizes strings | Numbers pass through as numbers (safe) | Finance CSV in Excel | Keep; document | P2 |
| Audit export | `audit_logs` + superadmin gate | Non-superadmin 403 | Compliance | Add org-scoped audit for owners later | P1 |
| Job record | `recordExportJob` best-effort | Failure silent | Audit completeness | Retry queue / log | P2 |

---

## CSV format

- UTF-8 CSV, comma-separated, RFC-style quoting via `lib/import-export/csv-format.ts`.
- Headers are explicit per export kind; imports accept flexible headers then mapping (ingredients preview uses parser + validator).

---

## Import flow

| Area | Current state | Limitation | Fix | Pri |
|------|---------------|------------|-----|-----|
| Preview | `createIngredientCsvPreviewJob` writes `ImportJob` + `ImportJobPreviewRow` | Only ingredients | Extend `import-service` per type | P1 |
| Direct insert | Blocked for preview path | — | — | P0 (maintain) |
| Column mapping | Lib `column-mapping.ts` | Not exposed in UI for all types | Mapping step in wizard | P1 |
| Jobs | `ImportStatus` differs from aspirational enum in spec | Align naming in migration or doc | Doc + optional rename | P2 |

---

## Validation previews

- Persisted capped rows (`MAX_PREVIEW_ROWS_PERSISTED`).
- UI: job detail + validation-errors tab.

---

## Templates

- Served at `/api/import-export/template?kind=…` (session required).
- Definitions in `lib/import-export/template-definitions.ts`.

---

## Rollback / audit

- `ImportRollback` model exists; execution + UI action pending.
- Export/import jobs give a basic audit trail; enrich with `AuditLog` events on confirm import (future).

---

## Brand / location / workspace scoping

- Most exports: `userId` on domain entities.
- Brands: `workspace.ownerUserId = userId`.
- Next: explicit `workspaceId` on `ImportJob` / `ExportJob` when multi-user workspaces ship widely.

---

## Business mode

- Recommended import sets per mode (spec Phase 15) — document in UI as chips/tooltips (not implemented in v1 shell).

---

## Permissions

- Today: session gate + user-owned data in queries.
- Next: map `UserRole` / workspace roles to import/export capabilities; keep `isSuperAdminEmail` for platform audit export.

---

## Security

- No secrets in CSV or templates.
- File size / row caps: `lib/import-export/limits.ts`.
- Sanitize CSV parsing (parser); reject absurd widths where implemented.

---

## Large files

- Hard caps prevent OOM; background worker placeholder for large jobs (not implemented).

---

## Error handling

- API: JSON errors for auth/invalid type/forbidden audit.
- Import preview: structured row errors in DB + UI tables.

---

## Priority legend

- **P0** — Data safety / tenancy.
- **P1** — High value product gaps.
- **P2** — Polish and scale.
- **P3** — Future enhancements.

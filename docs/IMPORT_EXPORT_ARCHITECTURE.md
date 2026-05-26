# Import / export architecture

## Layers

1. **UI** — `app/dashboard/import-export/**` — RSC pages + client upload for ingredient preview.
2. **Actions** — `actions/import-export.ts` — Server Actions (session user, revalidate).
3. **HTTP** — `app/api/export/route.ts`, `app/api/import-export/template/route.ts` — CSV downloads with cookie auth.
4. **Services** — `services/import-export/*` — Orchestration, Prisma transactions, export builders.
5. **Domain libs** — `lib/import-export/*` — CSV format, parse, validate, map, preview, limits, export/import type unions.

## Data model (Prisma)

- **`ImportJob`** — One uploaded file / logical import; counts, JSON blobs, status.
- **`ImportJobPreviewRow`** — Capped normalized preview + errors + suggested action.
- **`ExportJob`** — Each successful export download (legacy route included).
- **`ImportRollback`** — Rollback request metadata (execution TBD).
- **`DataTemplate`** — Future DB-backed templates.

## Invariants

- No production writes from preview-only paths.
- Legacy `/api/export?type=*` URLs remain valid.
- CSV exports pass through formula-mitigation helpers for string cells.

## Flow (ingredients preview)

`multipart` / `FormData` → `parseCsv` → `buildIngredientImportPreview` → Prisma transaction: create `ImportJob` + `createMany` preview rows → redirect to job detail.

## Flow (export)

`GET /api/export` → `buildExportCsv` → stream CSV → `recordExportJob` (non-blocking on failure).

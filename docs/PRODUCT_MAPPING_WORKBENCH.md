# Product Mapping Workbench — UI

Route prefix: `/dashboard/product-mapping`.

The legacy single-page form is preserved at the same route, but now
lives inside a Workbench shell with twelve tabs.

## Layout

`app/dashboard/product-mapping/layout.tsx` renders the sub-nav
(`components/dashboard/product-mapping/workbench-subnav.tsx`).

## Tabs

| Tab | Route | Purpose |
|-----|-------|---------|
| Overview | `/` | KPI grid, the legacy "Add unmatched product" form, recent rows in review. |
| Unmapped queue | `/unmapped` | UNMAPPED + NEEDS_REVIEW rows. |
| Suggestions | `/suggestions` | SUGGESTED rows with match-reason chips. |
| Approved | `/approved` | APPROVED + CONFIRMED rows in table form. |
| Conflicts | `/conflicts` | Explicit + derived conflicts, plus Order Hub blocks. |
| Bulk | `/bulk` | Multi-select table for bulk approve / ignore / archive. |
| Modifiers | `/modifiers` | External modifiers ↔ canonical OS Kitchen keys. |
| Rules / aliases | `/aliases` | Alias dictionary with provider scoping. |
| Import batches | `/batches` | Provider sync summaries. |
| Sync health | `/health` | Per-provider mapping coverage + connection state. |
| Activity | `/activity` | Audit log. |
| Settings | `/settings` | Providers, bulk approval policy, permissions matrix, links. |

## KPI grid

Tiles: Unmapped products, Suggested, Needs review, Approved, Conflicts,
Blocked order lines, Providers connected, Last sync.

Blocked order lines is a join with `ChannelConflict` rows of type
`missing_product_mapping` and status `OPEN`.

## Empty states

Three primary empty states (per the brief):

- **No mappings yet** — overview when there are zero suggested /
  needs review / unmapped / conflict rows.
- **All external products are mapped** — unmapped queue when there
  are no pending rows.
- **No suggestions yet** — suggestions tab when nothing has been
  surfaced.

## Row-level actions

`MappingRowActions` is a client component used on Overview, Unmapped,
and Suggestions. It exposes:

- Pick a OS Kitchen target.
- Change status (drop-down).
- Approve (requires a target).
- Reject with a reason.

All actions flow through `actions/product-mapping.ts`, which writes a
`ProductMappingEvent` for every change.

## Bulk safety

The bulk table is the only place bulk approve is offered. It is
gated by `isBulkApprovable(confidenceLabel)`, so the checkboxes for
`MEDIUM`, `LOW`, or `NONE` rows are disabled. The service additionally
rejects any non-eligible row at the API layer, even if the UI is
bypassed.

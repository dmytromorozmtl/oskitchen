# Reports module audit (KitchenOS)

**Date:** 2026-05-11
**Scope:** `/dashboard/reports`, `/dashboard/reports/enterprise`,
`/api/export/route.ts`, `services/import-export/export-service.ts`,
the existing `ExportJob` table, and adjacent surfaces (Analytics,
Import/Export, Order Hub, Packing, Routes, Costing, Ingredient Demand).

## TL;DR

`/dashboard/reports` is a static eight-card grid linking to legacy
`/api/export?type=…` endpoints or sibling dashboards. There is no
report registry, no date filters, no preview, no saved reports, no
visible export history (`ExportJob` is written but never surfaced),
no business-mode tailoring, no permission gating beyond the page
visit, and no PDF flow beyond browser print. The "Enterprise" page
(`/dashboard/reports/enterprise`) is a parallel placeholder.

This project ships a real **Reports Center** built on the live data
already in the workspace. The eight legacy cards keep working — the
new registry treats them as first-class entries. We never fake PDF
generation, never fake scheduled emails, and re-use the existing
`ExportJob` table for history (with a small additive
`SavedReport` table for named filter views).

## Findings

| #  | Area | Current state | Limitation | Recommended fix | Pri |
|----|------|---------------|------------|-----------------|-----|
| 1  | Page | Static grid of 8 hand-coded cards | No filters, no preview, no history, no registry | Replace with a Reports Center reading a `report-registry.ts` catalogue | P1 |
| 2  | Date filters | Absent | Owners can't scope to a window | URL-driven `from` / `to` (+ brand, location, channel, fulfillment, status) parsed in `lib/reports/report-filters.ts` | P1 |
| 3  | Preview | None | Owners can't see what an export will contain before downloading | Each `report-key` has a `/dashboard/reports/[reportKey]` page with KPIs + preview table | P1 |
| 4  | Export endpoints | Legacy `/api/export?type=…` works | Doesn't support filter parameters (date / brand / location) | Add `/api/export/report?key=…&filtersQuery=…` that runs the registry-driven report. Legacy links untouched. | P1 |
| 5  | Formula injection | Existing exports neutralise `=`, `+`, `-`, `@` | Must hold the line in new export endpoints | New CSV builder reuses the same escape strategy | P0 |
| 6  | Permissions | `requireSessionUser` only | Same reports visible to every role | `lib/reports/report-permissions.ts:canDoReport` — owner/admin/manager/accountant/kitchen_lead/packer/driver/viewer + superadmin override | P0 |
| 7  | Financial visibility | Margin / revenue reports visible to any signed-in user | PII / financials need role gating | Each registry entry carries a `permission` flag enforced before rendering | P0 |
| 8  | Customer PII | Customer report exposes emails | No masking | Mask emails in preview (`re***@domain`); CSV retains masked variant in the new reports | P0 |
| 9  | Saved reports | None | Owners re-enter filters every time | `SavedReport` table — userId, reportKey, name, filtersJson | P1 |
| 10 | Export history | `ExportJob` rows written but never surfaced | Owners don't know who exported what | "Recent exports" tab reads `ExportJob` rows | P1 |
| 11 | Business-mode packs | None | Restaurant / Café / Bar / Bakery / Catering / Meal Prep / Ghost all see the same cards | Registry tags each report with `businessModes`, and the library applies the active mode | P2 |
| 12 | Executive pack | One "weekly production" card; no exec summary | Owners want a curated weekly digest | `EXECUTIVE_WEEKLY_SUMMARY` + `EXECUTIVE_MONTHLY_SUMMARY` registry entries powered by the analytics service | P1 |
| 13 | PDF | "Reuses browser print" copy at bottom of page | Mixing browser print and server-side PDF is confusing | Print-friendly route per report (browser PDF). No fake server-side PDF promised. | P2 |
| 14 | Scheduled reports | Not implemented | n/a | Out of scope — reserved data fields stay null. No fake email scheduling. | P3 |
| 15 | Empty states | Single description line | UX | Per-tab empty states (no data / no saved reports / no exports) | P2 |
| 16 | Enterprise page | Parallel placeholder | Confusing IA | Keep route; link to the new Reports Center | P2 |
| 17 | Performance | Each card opens a synchronous CSV stream | OK for current volume | Bound row count per report registry entry (`maxRows`); current legacy default 5,000 retained | P2 |

## Priority legend

- **P0** — Data / security / privacy correctness.
- **P1** — Core reporting value (registry, filters, preview, exports).
- **P2** — Polish (empty states, business-mode packs, print).
- **P3** — Future (scheduled reports, server-side PDF).

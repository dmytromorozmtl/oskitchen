# Production module audit

**Scope:** `/dashboard/production`, command-center work items, legacy `ProductionTask` (cook/pack/label), data model, integrations, UX, performance, permissions.

**Date:** 2026-05-07 (engineering snapshot).

---

## 1. Route: `/dashboard/production`

| Aspect | Current state | Why limiting | Affected business types | Recommended fix | Priority |
|--------|---------------|--------------|-------------------------|-----------------|----------|
| Page composition | Server page loads `ProductionWorkItem` / `ProductionBatch` for selected day, `ProductionCommandCenter` + embedded `ProductionTable` (legacy products). | Previously table-only; now split planning vs execution clarity. | All | Keep command center as planning hub; document dual layer. | P2 |
| Date / view | `?date=` and `?view=` drive filtering and tabs. | No persisted brand/location filter yet. | Multi-brand, ghost kitchen | Add query params + DB filters when brand list is wired. | P1 |
| CTAs | Server actions: menu prep generation, orders generation, redirect back with date. | Catering/forecast/manual paths not in UI yet. | Catering, bakery | Extend actions + forms per source. | P1 |

---

## 2. Production data model

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Dual models | `ProductionTask` (1:1 product, cook/pack/label) unchanged; `ProductionWorkItem` + `ProductionBatch` for command center. | Two mental models until merged or linked explicitly. | All | Optional `productionTaskId` link later; docs + UI labels today. | P2 |
| Batches | `ProductionBatch` ties work items to `productionDate`, mode, source. | Templates not yet applied from UI. | Meal prep, bakery | Templates route + CRUD on `ProductionTemplate`. | P1 |
| Events | `ProductionWorkEvent` exists for audit trail. | Not surfaced in reports UI. | Compliance-heavy | Reports page: event timeline export. | P2 |

---

## 3. Empty state

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Copy | `productionEmptyStateForBusiness()` drives title/description per `BusinessType`. | Manual-task-only flows still rely on generation CTAs. | Restaurant, bar | Add dedicated “manual task” action when schema supports quick create. | P2 |
| CTAs | Primary slot: generate from menu + from orders; secondary link to products; demo link. | No inline “manual batch” without navigation. | Catering | Manual batch modal. | P1 |

---

## 4. Relation: menu items / products

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Menu prep gen | `generateProductionFromMenuProducts` uses `preparedDate` on calendar day. | Items without prepared date invisible to generator. | Restaurant, meal prep | Planner nudges + bulk set prepared date. | P1 |

---

## 5. Relation: orders

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Order gen | `generateProductionFromOrdersForDate` creates ORDER-sourced lines; dedupes open items. | Channel-specific metadata not shown in UI. | Ghost kitchen | Orders source view: list contributing orders. | P1 |

---

## 6. Relation: menus

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Menu linkage | Work items store `productId`; batch can store `menuId` when extended. | Batch `menuId` not set in generator yet. | Multi-menu | Pass menuId into batch create when single-menu day. | P2 |

---

## 7. Packing / labels

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Flags | `requiresPacking`, `requiresLabel`, `allergenWarning` on work items. | No auto-creation of packing tasks in packing module. | Meal prep | Packing handoff service + webhook to packing queue. | P0 |
| Legacy | `ProductionTask.packed/labeled` unchanged. | Two systems | All | Keep until unified; kitchen shows both sections. | P2 |

---

## 8. Kitchen Screen (`/dashboard/kitchen`)

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Execution | Open `ProductionWorkItem` cards with server-action buttons (start, complete, pack handoff) + legacy product cards. | No timer, scan, or full-screen toggle yet. | Line | Timer component + optional `?fullscreen=1` layout. | P1 |

---

## 9. Ingredient demand

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| UI | Ingredients tab placeholder. | No MRP view from recipes. | Restaurant, catering | Join work items → products → recipes → ingredients. | P1 |

---

## 10. Tasks / staff

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Assignment | `assignedToId` on batch/work item (StaffMember). | No assign UI in command center. | Large kitchens | Assign dropdown + station lead. | P1 |

---

## 11. Business-mode terminology

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Titles | `productionPageTitle` / `productionEmptyStateForBusiness` aligned to Phase 18. | Nav sidebar may still say “Production” only. | All | Align nav label with terminology helper. | P2 |

---

## 12. Mobile / tablet

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Command center | Responsive grid; date input native. | Dense KPI grid on small phones. | Manager phone | Collapse KPIs to carousel. | P3 |
| Kitchen | Larger buttons on work items. | Legacy cards unchanged. | Line | Match button sizing on legacy block. | P2 |

---

## 13. Performance

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Queries | `take: 500` work items per day. | Very large ghost kitchens may exceed. | Ghost | Cursor pagination + virtualized board. | P1 |
| KPIs | Computed in memory from single query. | OK for now. | All | Optional Redis daily rollup later. | P3 |

---

## 14. Permissions

| Aspect | Current state | Why limiting | Affected | Fix | Pri |
|--------|---------------|--------------|----------|-----|-----|
| Actions | `requireSessionUser` + row-level `userId` checks on mutations. | No role matrix (owner vs kitchen staff). | Enterprise | Gate server actions by `UserRole` + workspace policy. | P0 |
| Superadmin | Platform superadmin behavior unchanged (existing app convention). | — | Ops | Keep centralized in auth helper; never log secrets. | P2 |

---

## Summary

**P0:** Packing auto-handoff from production work items; role-based production permissions.

**P1:** Brand/location filters, orders source view, ingredient bridge, assign UI, kitchen timers/fullscreen, large-board performance.

**P2:** Nav terminology, legacy/kitchen parity, batch `menuId`, event-based reports.

**P3:** KPI mobile polish, cached rollups.

# Tasks module audit (OS Kitchen)

**Date:** 2026-05-11
**Scope:** `/dashboard/tasks`, `actions/kitchen-task.ts`, Prisma `KitchenTask`, `KitchenTaskType`, `KitchenTaskStatus`, `KitchenTaskPriority`, references in `app/dashboard/calendar`, `app/dashboard/executive`, `app/dashboard/reports/enterprise`.

## TL;DR

A single page with a "new task" form and a flat list. No tabs, no Kanban, no detail page, no comments, no checklist, no recurrence, no source linking beyond `relatedOrderId` / `relatedProductId`, no role assignment, no Today / My Tasks views. Existing data and the two server actions are preserved; everything else is additive.

## Findings

| # | Area | Current state | Limitation | Affected modes | Recommended fix | Pri |
|---|------|---------------|-------------|-----------------|------------------|-----|
| 1 | UI | One screen at `/dashboard/tasks` (form + list) | No Kanban, list filters, today view, my tasks, calendar, detail page | All | Command Center with subnav + detail page | P1 |
| 2 | Task types | 6 values: PREP, COOK, PACK, CLEAN, DELIVERY, ADMIN | Missing PURCHASING, INVENTORY, CUSTOMER, CATERING, EVENT, BAR_PREP, CAFE_PREP, BAKERY_BATCH, MAINTENANCE, TRAINING, IMPLEMENTATION, SUPPORT, FOLLOW_UP, QUALITY_CHECK, LABELING | All | Extend enum additively | P0 |
| 3 | Task statuses | OPEN / IN_PROGRESS / DONE / CANCELLED | Missing BLOCKED / WAITING; no overdue derivation; spec calls for TODO synonym | All | Extend enum + add `OVERDUE` (derived in lib, not stored) | P0 |
| 4 | Task priorities | LOW / MEDIUM / HIGH / URGENT | Missing NORMAL alias + CRITICAL | All | Extend enum additively | P1 |
| 5 | Task source | Only `relatedOrderId` / `relatedProductId` | Cannot link production task, packing task, route stop, playbook, alert, catering quote, etc. | All | Generic `sourceType` (enum) + `sourceId` (uuid); preserve `relatedOrderId` / `relatedProductId` | P0 |
| 6 | Assignee | `assignedToId` → `StaffMember` only | No role-based assignment, no createdBy, no completedBy | All | Add `assignedRole`, `createdById`, `completedById` | P1 |
| 7 | Scoping | `userId` only | No brand/location filters for multi-brand workspaces | Multi-brand, ghost kitchens | Add nullable `brandId`, `locationId` | P1 |
| 8 | Time tracking | `dueAt` only | No `startedAt`, `completedAt`, `estimatedMinutes`, `actualMinutes` | All | Additive columns | P1 |
| 9 | Checklist | None | Cleaning/opening/closing/loadout require multi-step items | All | `checklistJson` on task | P1 |
| 10 | Comments | None | No collaboration thread | All | New `kitchen_task_comments` table | P1 |
| 11 | Activity log | None | No audit for assign, start, block, complete, reschedule | All | New `kitchen_task_events` table | P1 |
| 12 | Templates | None | Manual recreation of cleaning/opening lists every time | All | New `kitchen_task_templates` table + seed list per business mode | P1 |
| 13 | Recurrence | None | Daily/weekly checklists not supported | All | New `kitchen_task_recurrences` table + `recurrenceRule` column | P1 |
| 14 | Dependencies | None | Cannot model "do X before Y" | Catering, meal prep | New `kitchen_task_dependencies` table | P2 |
| 15 | Production / Packing / Routes integration | None | Failed delivery, missing pack item, production blocker have no follow-up surface | All | Helper functions create tasks with proper `sourceType` + `sourceId` | P1 |
| 16 | Calendar integration | Calendar reads `kitchenTask.findMany` already | No reschedule action from calendar | All | Calendar view inside Tasks; calendar page already wired | P2 |
| 17 | Today Board integration | None | Today board has no task tile | All | Re-export overview KPIs + group-by-role helpers | P2 |
| 18 | Playbooks | No surface | Playbooks cannot generate tasks | All | `sourceType=PLAYBOOK`, `sourceId=playbookSlug` (string→uuid? store in metadataJson) | P1 |
| 19 | Permissions | `requireSessionUser` only | No role gates for staff/driver/packer | All | `task-permissions.ts` + filtering in services | P1 |
| 20 | Empty states | "No tasks — enjoy the calm" | Generic | All | Business-mode-aware empty states | P2 |
| 21 | Mobile | Card stack works but not optimised for thumbs | Drivers / line staff need bigger targets | All | "My Tasks" view + larger buttons | P1 |
| 22 | Reports | None | No completion-rate or by-assignee insight | All | Reports page | P2 |

## Priority legend

- **P0** — Data safety / model gaps
- **P1** — High-value functional gap
- **P2** — Polish / scale
- **P3** — Future

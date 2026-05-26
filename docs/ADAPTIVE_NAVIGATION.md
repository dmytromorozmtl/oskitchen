# Adaptive navigation

## Layout

Navigation groups are defined in `lib/nav-config.ts` and filtered by:

1. **Business mode** — `getFilteredNavGroups` in `lib/business-modes.ts` (mode-specific link sets).
2. **Module preferences** — disabled keys from `lib/module-visibility.ts` / dashboard layout.

## Groups (high level)

- **Core** — Dashboard, **Today**, Orders, Calendar, Order hub.
- **Menu & sales** — Menus, planner, items, brands, storefront, sales channels (integrations hub).
- **Kitchen** — Production, kitchen screen, packing, verify, nutrition labels.
- **Inventory & cost** — Demand, purchasing, costing.
- **Customers** — CRM, meal plans, catering quotes.
- **Operations** — Tasks, staff, routes, locations, implementation cluster, **Playbooks**, **Templates**.
- **Insights** — Analytics, forecast, reports, executive, copilot.
- **Admin** — Billing, notifications (+ rules), import/export, security audit, settings.
- **Internal** — Growth, partner, support, developer, platform, beta (owner / superadmin visibility).

## UX features

- **Command palette (⌘K)** — `components/dashboard/command-palette.tsx`; includes Today, Playbooks, Templates, and major routes.
- **Mobile** — Collapsible groups in `dashboard-nav` / shell drawer pattern.
- **Pinned modules** — Supported in schema; UI may use local ordering first.

## Empty state

If every optional module is disabled, Core + locked modules still appear; **Today** remains the primary operational home.

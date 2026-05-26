# FoodOps product — ready report

**Audience:** Internal product / engineering / CS.

## What was finalized (this iteration)

### Product clarity

- [`docs/PRODUCT_CLARITY_AUDIT.md`](PRODUCT_CLARITY_AUDIT.md) — module purpose matrix, classification buckets, empty-state / CTA expectations, honest gaps.

### Business modes & registry

- Typed experience per mode: `lib/business-mode-registry.ts` (modules, widgets, playbooks, menu strategy, storefront template, maturity score).
- **`moduleRecommendationBlurb`** — surfaces in **Settings → Modules** so owners see *why* a module is core, recommended, advanced, or focused-hidden.

### Module visibility

- Canonical metadata: `lib/modules/module-registry.ts` → `lib/module-visibility.ts`.
- `/dashboard/settings/modules` loads workspace `businessType` and shows recommendation copy per module.

### Navigation (simplified IA)

- `lib/nav-config.ts` regrouped to match operational mental model:
  - **Today** — Today, Dashboard, Calendar  
  - **Orders & sales** — Orders, Order hub, Storefront, Sales channels  
  - **Menus** — Weekly menus, Menu items, Menu planner, Brands  
  - **Kitchen** — Production, Kitchen screen, Packing, Packing verify, Nutrition  
  - **Inventory & cost** — Ingredient demand, Purchasing, Costing, Import/export  
  - **Fulfillment** — Routes, Tasks, Locations  
  - **Customers & events** — CRM, Meal plans, Catering quotes  
  - **Insights** — Analytics, Forecast, Reports, Executive, Copilot  
  - **Setup & rollout** — Playbooks, Templates, Implementation, Import center, Product mapping, Go-live, Training  
  - **Admin** — Staff, Billing, Notifications, Alert rules, Settings, Audit logs  
  - **Internal** — Growth, Beta apps, Partner, Support, Developer  
- Sidebar default-open groups updated (`dashboard-nav.tsx`).
- Command palette routes aligned with kitchen/production paths.

### Today Board

- Human-readable focus widget labels: `lib/today-widget-copy.ts`.
- **Quiet shift** empty state + **Next best action** card on `/dashboard/today`.

### Terminology

- `lib/terminology.ts` — storefront nav labels per mode (e.g. meal prep “Weekly menu site”, restaurant “Online menu”, bar “Events & drinks site”); bakery preorders.

### Roles

- `lib/role-navigation.ts` — documented target role mapping; runtime unchanged (`STAFF` → kitchen, `OWNER` → Today).

### Consolidation & QA docs

- [`docs/MODULE_CONSOLIDATION_FINAL_PLAN.md`](MODULE_CONSOLIDATION_FINAL_PLAN.md)
- [`docs/FOODOPS_SYSTEM_QA_MATRIX.md`](FOODOPS_SYSTEM_QA_MATRIX.md)

## Super-admin

Unchanged: platform bypass for canonical super-admin email; full module access; `/platform` extra link.

## Remaining risks (next sprints)

1. Uniform **page chrome** (title, subtitle, primary CTA, empty, error, help) across all major routes — Today and Settings modules started; extend top traffic pages first.
2. **Organization-level roles** beyond `OWNER | STAFF` — spec in `role-navigation.ts`; implement when auth model supports it.
3. **Playbook → persisted generated tasks** and Today linkage.
4. **Storefront / menu strategy** apply-to-settings with preview + rollback (registry is source of truth today).

## Next sprint recommendation

Pick one: **(A)** playbook task persistence, **(B)** storefront template apply + preview, **(C)** page-level UX chrome pass for Orders + Production + Menus only.

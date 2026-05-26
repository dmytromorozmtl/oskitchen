# Business mode platform — ready report

## Finalized in this release

- **Central registry:** `lib/business-mode-registry.ts` for all nine operating modes + maturity scores.
- **Module registry:** `lib/modules/module-registry.ts` drives `MODULE_KEYS` / `MODULE_REGISTRY` via `lib/module-visibility.ts`.
- **Focused navigation:** Hidden routes derive from registry `hiddenByDefaultModuleKeys`; “Show all modules (advanced)” restores full tree.
- **Sidebar IA:** `lib/nav-config.ts` regrouped (Today, Orders & calendar, Menu & sales, Kitchen ops, Inventory & cost, Fulfillment & team, Customers & events, Insights, Rollout & playbooks, Admin, Internal).
- **Nav UX:** Pinned + **recently opened** (localStorage), footer shortcuts to **module settings** / **business mode** / **reset recommended**.
- **Onboarding:** Operating workflow saved to `kitchen_settings.kitchenWorkflowDefault`; finish redirects to **`/dashboard/today`**.
- **Auth landing:** `signInAction` returns `redirectTo` from `lib/role-navigation.ts` (staff → kitchen screen).
- **Today:** Mode-specific “Today board focus” card from registry widget ids.
- **Playbooks:** Added café / bar / ghost rush; server page prioritizes mode-specific playbooks.
- **Templates page:** Uses `QUICK_START_TEMPLATES` from `lib/business-templates.ts`.
- **Supporting libs:** `lib/business-kpis.ts`, `lib/business-workflows.ts`, `lib/menu-strategies.ts`, `lib/storefront-templates.ts`, `lib/role-navigation.ts`.
- **Terminology:** Bar mode maps **Catering quotes → Event requests** (`nav.catering`).
- **Module settings:** Shows registry **description** per module.

## Super-admin

Unchanged guarantees: `workspace.moroz@gmail.com` / `PlatformUserRole` SUPER_ADMIN → `platformBypass`, full navigation, module gate bypass.

## Remaining risks (next sprints)

1. Persist playbook runs + generated tasks (Prisma models).
2. Apply `defaultStorefrontTemplate` / `defaultMenuStrategy` to live storefront settings with preview + rollback.
3. Map `OrganizationMemberRole` to session + nav when multi-user workspaces ship.
4. KPI widgets: bind `defaultDashboardWidgets` ids to real queries / empty states.
5. Performance: dynamic-import heavy chart modules where profiling shows benefit.

## Docs

- `docs/FINAL_BUSINESS_MODE_AUDIT.md`
- `docs/FINAL_MODULE_CONSOLIDATION_REPORT.md`
- `docs/FINAL_BUSINESS_MODE_QA_MATRIX.md`

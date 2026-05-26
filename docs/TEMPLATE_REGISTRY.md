# Template registry

The 7 system starter templates live in
`lib/templates/template-registry.ts` and are upserted into the
`workspace_templates` table by `ensureWorkspaceTemplates()` on every
visit to `/dashboard/templates`. The legacy reference list at
`lib/business-templates.ts` is left intact for landing pages and
backward compatibility.

| Key | Title | Primary mode | Modules pinned | Playbook seeded |
|-----|-------|--------------|----------------|-----------------|
| `restaurant-starter` | Restaurant starter | RESTAURANT | orders, menus, production, tasks, purchasing, costing, analytics | `restaurant-daily-prep` |
| `cafe-starter` | Café starter | CAFE | menus, storefront, production, tasks, purchasing, customers | `cafe-morning-setup` |
| `bar-starter` | Bar starter | BAR | menus, catering-quotes, costing, tasks, calendar | `bar-event-night` |
| `bakery-starter` | Bakery starter | BAKERY | menus, storefront, production, packing, nutrition-labels, routes | `bakery-preorder-day` |
| `catering-starter` | Catering starter | CATERING | catering-quotes, customers, calendar, production, packing, routes, reports | `catering-event-workflow` |
| `meal-prep-starter` | Meal prep starter | MEAL_PREP | menus, meal-plans, production, packing, nutrition-labels, routes, customers | `meal-prep-weekly-cycle` |
| `ghost-kitchen-starter` | Ghost kitchen starter | GHOST_KITCHEN / CLOUD_KITCHEN / MULTI_BRAND | brands, order-hub, sales-channels, production, packing-verify, analytics | `ghost-kitchen-rush` |

Each entry declares:

- `setupTimeMinutes`: shown in the card and detail page.
- `whatItConfigures`: bullet list (UI only).
- `whatItDoesNot`: explicit safety boundaries.
- `warnings`: yellow-banner copy.
- `sections.modulePins`: which `KitchenModulePreference` rows to pin.
- `sections.playbookSlugs`: which playbook templates to seed.
- `sections.setupTasks`: which `KitchenTask` rows to create.
- `sections.sampleMenuCategories`: hint only; templates do **not**
  write menu rows (use Demo Hub / Import Center).

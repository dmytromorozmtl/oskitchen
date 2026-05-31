# Implementation wizard

Route: `/dashboard/implementation/new`

Component: `components/dashboard/implementation/new-project-wizard.tsx`
Server action: `actions/implementation-center.ts → createImplementationProjectAction`

## 9 steps

1. **Business profile** — name, weekly volume, current platform, notes.
2. **Business mode** — Restaurant / Café / Bar / Bakery / Catering /
   Meal Prep / Ghost Kitchen / Multi-Brand.
3. **Current systems** — Shopify, WooCommerce, Spreadsheets, POS,
   Manual, DoorDash, Uber, Other.
4. **Migration scope** — customers, orders, menu items, ingredients,
   recipes, suppliers, nutrition, product mappings, brands, locations.
5. **Module scope** — Storefront, Orders, Menus, Production, Packing,
   Routes, CRM, Purchasing, Analytics, Costing, Catering, Meal Plans.
6. **Integrations** — Shopify, WooCommerce, Uber Eats, Uber Direct,
   OS Kitchen Storefront, Webhooks, Email/notifications.
7. **Training needs** — owner/admin, manager, kitchen lead, packer,
   driver, customer service, purchasing, sales/catering.
8. **Go-live** — target date, owner, fulfillment types.
9. **Review** — read-only summary; only the **Create project** button
   on this step persists state.

## Result

`createImplementationProjectAction` calls
`createImplementationProjectV2` which:

1. Creates a single `ImplementationProject` row.
2. Seeds one `ImplementationPhase` per `PHASE_DEFINITIONS` entry.
3. Seeds the checklist template for the chosen `BusinessType`.
4. Writes an `ImplementationEvent` with `eventType=project_created`.

No data is imported, no templates are applied, and no integrations are
connected. The wizard hint reinforces this on every step.

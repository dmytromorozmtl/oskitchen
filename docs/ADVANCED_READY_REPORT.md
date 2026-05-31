# Advanced readiness report — OS Kitchen

Generated alongside the advanced vertical expansion (May 2026).

## Features added (high level)

- Public storefront (`/s/...`) with checkout → internal order linkage (existing actions preserved).
- Ops surfaces: menu planner snapshot page, costing table + recipe snapshots, purchasing rollup + ingredient demand CSV, forecast UI, routes planner, packing verification + `/dashboard/scan`, nutrition profiles, staff/tasks, locations, subscriptions, catering admin + public quote view, calendar agenda, notification rule CRUD seeds, import/export hub, AI copilot + deterministic forecasting service.
- Command palette coverage expanded; dashboard margin alert hook on home overview.

## Models added / touched

See `prisma/schema.prisma` migration `20260510180000_advanced_vertical_features` for enums/tables (`storefront_*`, `locations`, recipes/ingredients/cost snapshots, nutrition, tasks/staff/subscriptions, catering, routes/stops, packing events, notification rules, etc.). `Menu`/`Order` gained optional `locationId`.

## Routes added

- Public: `/s/[storeSlug]`, `/s/[storeSlug]/menu`, `/s/[storeSlug]/checkout`, `/s/[storeSlug]/order-confirmation/[token]`, `/quote/[token]`.
- Dashboard: `/dashboard/storefront`, `/dashboard/menu-planner`, `/dashboard/costing`, `/dashboard/purchasing`, `/dashboard/inventory/demand`, `/dashboard/forecast`, `/dashboard/routes`, `/dashboard/packing/verify`, `/dashboard/scan`, `/dashboard/nutrition-labels`, `/dashboard/tasks`, `/dashboard/staff`, `/dashboard/locations`, `/dashboard/meal-subscriptions`, `/dashboard/catering`, `/dashboard/calendar`, `/dashboard/copilot`, `/dashboard/notifications/rules`, `/dashboard/import-export`.

## Fully working

- Storefront browse/checkout flow on migrated DBs.
- Cost snapshot regeneration from recipes.
- Ingredient demand computation + CSV download client button.
- Forecast deterministic grid + copilot deterministic insights + optional OpenAI narrative when keyed.
- Routes creation + Maps search deeplinks (no optimization API).
- Packing verification lookup + event logging + QR helper for staff URLs.
- Catering quote creation + public quote display.
- Staff/tasks/locations/subscriptions/notification rule toggles + seeds.
- Authenticated CSV exports via `/api/export` including ingredient inventory rows.

## Placeholder / partial

- Drag-and-drop menu planner, automated preorder cutoff execution, structured delivery addresses on orders, camera QR scanning, catering multi-line editor & email sends, subscription auto-order generation, notification rule dispatch wiring per trigger, calendar month/week views, global location switcher UX.
- Ingredient demand persistence (`IngredientDemandLine`) not yet auto-written from orders.

## External APIs (optional)

- `OPENAI_API_KEY` — Copilot narrative + optional enhancements around forecast explanations.
- `GOOGLE_MAPS_API_KEY` — reserved for future optimized routing/embeds (consumer Maps links work without it).
- Existing Stripe/Resend integrations remain optional per prior OS Kitchen behavior.

## Recommended next 30 days

1. Wire notification rules to existing cron/email infrastructure with deduping keys.
2. Auto-sync ingredient demand lines post-order mutations for auditing.
3. Add catering multi-line UI + Resend template for quote sending.
4. Promote location switcher + default migration script for legacy tenants.
5. Layer html5-qrcode for packing verification parity with spec’d scanning.

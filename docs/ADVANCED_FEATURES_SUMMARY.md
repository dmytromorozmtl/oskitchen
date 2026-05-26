# Advanced features summary

## What it does

KitchenOS now layers **vertical operations** on top of the existing dashboard: a public preorder storefront, menu planning surface, recipe-based costing and margin snapshots, ingredient demand for purchasing, deterministic production forecasting (optional OpenAI narrative in Copilot), delivery route grouping, packing verification with audit events, nutrition/allergen label fields, staff and task management, multi-location records, meal subscriptions, catering quotes with a public read-only view, an operations calendar, notification rule rows, a broader command palette (⌘K), and an import/export hub wired to CSV exports.

## Setup

1. Run database migrations so new Prisma models exist: `npm run db:deploy` (or `prisma migrate dev` locally).
2. Optional: set `OPENAI_API_KEY` and `GOOGLE_MAPS_API_KEY` in server env (see `.env.example`).
3. Enable the storefront under **Dashboard → Storefront** and pick an active menu.

## Limitations

- Many modules are **MVP surfaces**: they read/write real Prisma data but lack full drag-and-drop, map optimization, payment capture on public flows, automated quote emails, and per-line catering editors.
- Ingredient demand assumes **consistent recipe units**; cross-unit conversion is not modeled.
- Notification **rules are stored**; wiring each trigger to Resend/SMS/cron still evolves alongside existing notification jobs.

## Future improvements

- Persist ingredient demand lines automatically on order changes.
- Embed optimized routing when Maps APIs are configured.
- Full calendar month/week views with drag resizing.
- Bulk CSV import with validation previews.

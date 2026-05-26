# Data migration plan

The Implementation Center **plans** migrations; it does not import.

## Datasets surfaced

`IMPLEMENTATION_DATASETS` in `lib/implementation/implementation-types.ts`:

- customers (`CUSTOMERS` import type)
- orders (`ORDERS`)
- menu items (`PRODUCTS`)
- ingredients (`INGREDIENTS`)
- recipes (no CSV — links to `/dashboard/recipes`)
- suppliers (links to `/dashboard/purchasing`)
- nutrition / allergens (`/dashboard/nutrition`)
- product mappings (`/dashboard/product-mapping`)
- brands (`/dashboard/brands`)
- locations (`/dashboard/locations`)

## UI

`app/dashboard/implementation/[projectId]/migration/page.tsx`

- Renders each dataset card with an **Open** link to the relevant
  module.
- Lists the last eight `ImportJob` rows for the workspace so the
  implementation owner can see validation / commit history without
  leaving the page.

## Safety

- The Implementation Center never invokes the actual import commit
  endpoints.
- All commits happen in the Import Center where the user is required
  to validate first.

# Multi-location foundation

## What it does

Introduces **`Location`** records plus optional `Menu.locationId` / `Order.locationId` foreign keys so expanding brands can segment data without rewriting core flows.

## Setup

Dashboard → **Locations** → create kitchens as you open them. Attach menus/orders through upcoming editors or Prisma Studio until bulk tooling lands.

## Limitations

- Dashboard-wide **location switcher** UI is still lightweight — existing rows remain `NULL` location until migrated deliberately.

## Future improvements

- Scoped analytics & purchasing per site.
- Inventory isolation rules.

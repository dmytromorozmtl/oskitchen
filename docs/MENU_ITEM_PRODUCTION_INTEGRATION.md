# Menu item ↔ production integration

Reference: `docs/MENU_PRODUCTION_HANDOFF.md`.

## Current behavior

- `createProduct` still creates a `ProductionTask` for every new product (including catalog). This keeps production lists consistent but may create noise for pure-library SKUs.

## Next

- Optional `productionSettingsJson` on `Product` to defer task creation until the item is placed on an active service menu or marked `PRODUCTION_ONLY`.

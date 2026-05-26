# Multi-location & multi-brand architecture

## Data model (Prisma)

- `Organization` → `Workspace` → `Brand` (optional `locationId`) → `Location` (per `userId` profile scope).
- Many operational tables already expose `brandId` / `locationId` (e.g. `Order`, `PurchaseOrder`, `ForecastRun`).

## New helpers (code)

- Types: `lib/organization/org-types.ts`
- Query scope: `lib/location/location-scope.ts`, `lib/brand/brand-scope.ts`
- Services: `services/organization/organization-service.ts`, `services/location/location-service.ts`, `services/brand/brand-service.ts`

## UI work remaining

- Global **location switcher** + **brand switcher** components in dashboard shell (if not already unified).
- Cross-location analytics pages: filter propagation + CSV export.

## Priority

**P1** for multi-unit operators; **P2** for single-site.

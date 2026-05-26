# Storefront action import regression guard

## Problem

Server actions that call `revalidateStorefrontDashboardAndPublic` without importing it throw at **runtime** (`ReferenceError`) even when `tsc` passes (e.g. incomplete edit).

## Guards

1. **Unit test:** `tests/unit/storefront-pillar-settings-import.test.ts` — ensures import path appears before first call in `actions/storefront-pillar-settings.ts`.
2. **Script:** `npm run verify:storefront-actions` → `scripts/check-storefront-action-imports.ts` scans common storefront action files for `revalidateStorefrontDashboardAndPublic(` and requires an import from `@/lib/storefront/revalidate-storefront-dashboard`.

## CI

`.github/workflows/ci.yml` runs `verify:storefront-actions` on every PR.

## Extending

When adding new storefront actions that call the helper, add the file path to `FILES` in `scripts/check-storefront-action-imports.ts`.

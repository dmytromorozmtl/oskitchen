# Changelog & Release Notes (Final)

## Public route

- `/changelog` — reads `ReleaseNote` rows when DB available.  
- **Fallback:** when no published rows, shows **“KitchenOS Commercial MVP Foundation”** static summary (honest, not overstated).

## Suggested `ReleaseNote` format

```text
## New
- …

## Improved
- …

## Fixed
- …

## Security
- …

## Known limitations
- …
```

## Initial seed (optional)

Insert via admin “Developer → Releases” when UI exists, or Prisma Studio — do **not** hard-code secrets.

## Commercial MVP Foundation (template)

Use title **KitchenOS Commercial MVP Foundation** with summary referencing: grouped navigation, setup hints, orders empty state, demo investor badge, status language primitives, design-system building blocks.

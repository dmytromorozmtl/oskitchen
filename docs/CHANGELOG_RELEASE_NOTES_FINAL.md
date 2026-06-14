# Changelog & Release Notes (Final)

## Public route

- `/changelog` — reads `ReleaseNote` rows when DB available.  
- **Fallback:** curated `PUBLIC_CHANGELOG_RELEASES` with LIVE / BETA / PREVIEW labels ([`public-changelog-updates-p3-87.md`](./public-changelog-updates-p3-87.md)).

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

Use title **OS Kitchen Commercial MVP Foundation** with summary referencing: grouped navigation, setup hints, orders empty state, demo investor badge, status language primitives, design-system building blocks.

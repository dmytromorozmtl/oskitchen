# Versioning

KitchenOS uses [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`).

- **MAJOR**: Breaking API or data migrations that require coordinated customer action.
- **MINOR**: New features, backward-compatible schema additions, meaningful UX changes.
- **PATCH**: Bug fixes, security patches, copy tweaks.

## Source of truth

- **Released version label**: `lib/version.ts` → `APP_VERSION` (shown in Developer settings).
- **Package manifest**: `package.json` `version` should stay aligned with releases (may lag during rapid iteration).

## Pre-release labels

- `-beta`, `-rc.N` suffixes indicate pre-production builds. Beta customers should expect occasional breaking changes between minors until `1.0.0`.

## Changelog

Release notes are maintained in the repository root [`CHANGELOG.md`](../CHANGELOG.md).

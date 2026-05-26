# Dev environment consistency

## Resolution
- **Node 22** is canonical per `package.json` `engines`, `.nvmrc`, CI (`.github/workflows/ci.yml`), and README prerequisites (updated from 20+).

## Optional
- `engines-strict` enforcement via npm config — not enabled to avoid breaking edge contributors.

## Preinstall warning
- Not added; rely on CI + README.

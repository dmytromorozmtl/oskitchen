# Archive era npm scripts (P3-76)

**Policy:** `archive-era-scripts-p3-76-v1`  
**Status:** **DONE** — active scripts <500, era sprawl archived  
**Updated:** 2026-06-16

Gap closure: consolidate 1902+ npm script sprawl → **336 active** scripts via archive + routers.

## Before / after

| Metric | Before | After |
|--------|--------|-------|
| Active `package.json` scripts | 536 | 336 |
| Archived scripts | 1,885 | 1,974 |
| Era scripts in archive | 795 | 795+ |
| Era scripts in active surface | 0 | 0 |

## How it works

1. **Archive:** `config/npm-scripts/archive-v1.json` — all sprawl-prefix scripts (`test:ci:*`, `audit:*`, `smoke:*`, etc.)
2. **Routers:** 12 router entries in `package.json` invoke `scripts/npm-script-router.ts`
3. **Run archived script:** `npm run test:ci -- webhook-security-era16`

## Consolidate

```bash
npx tsx scripts/consolidate-npm-scripts.ts --write --max-scripts=500
```

## CI

```bash
npm run check:archive-era-scripts-p3-76
```

## Artifact

`artifacts/archive-era-scripts-p3-76.json`

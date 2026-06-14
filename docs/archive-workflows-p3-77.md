# Archive GitHub workflows (P3-77)

**Policy:** `archive-workflows-p3-77-v1`  
**Status:** **DONE** — 121 total → 34 canonical active (≤40)  
**Updated:** 2026-06-16

Gap closure: archive era25 ops theater workflows; keep canonical pilot + engineering gates.

## Before / after

| Metric | Before (P1-17) | After |
|--------|----------------|-------|
| Active `.github/workflows/` | 121 | 34 |
| Archived `.github/archive/workflows/inactive/` | 0 | 88 |
| Era25 ops in active | many | 0 |

## Canonical active workflows

34 files in allowlist — `ci.yml`, `deploy-prod-gate.yml`, staging smokes, e2e gates, pilot gates, etc.

## Archive location

`.github/archive/workflows/inactive/` — era25 validate/integrity theater, duplicate execution-check wrappers.

Restore: move file back to `.github/workflows/`.

## Commands

```bash
# Dry-run archive
npx tsx scripts/archive-inactive-github-workflows.ts

# Audit active surface
npm run check:github-workflow-surface

# P3-77 CI gate
npm run check:archive-workflows-p3-77
```

## Artifact

`artifacts/archive-workflows-p3-77.json`

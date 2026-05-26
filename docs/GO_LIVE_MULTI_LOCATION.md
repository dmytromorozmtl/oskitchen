# Multi-location & multi-brand rollouts

## Project scoping

Each `GoLiveProject` has optional `brandId` and `locationId`. A
workspace can therefore host:

- One workspace-wide launch project (brandId/locationId both null).
- One project per brand (locationId null).
- One project per (brand, location) pair.

The Command Center shows all projects on the overview, ordered by
`updatedAt`.

## Filters

The brand and location selectors on the project creation form pull
from the workspace's `Brand` and `Location` lists. Each project can
adopt a `BusinessType` that overrides the workspace default; the
readiness engine uses this to apply per-business-type weights.

## Phased rollout pattern

For a franchise or chain rollout, create projects in batches:

1. **Pilot brand / pilot location** — `launchMode = PILOT`. Smaller
   seeded rollback set, dedicated owner.
2. **First wave** — `launchMode = PHASED`. Full simulation suite,
   independent approval matrix.
3. **General availability** — `launchMode = FULL`.

The KPI grid on the overview aggregates the most recent project's
score; the per-project cards expose each location/brand individually.

## Comparing readiness

Operators can scan the project cards on the Command Center to see:

- Readiness % per location/brand
- Current status badge
- Risk level badge
- Owner attribution
- Launch ETA

Drill in via "Open" to see the full validation report, checklist,
simulations, approvals, incidents, and rollback plans for that
specific scope.

## Approvals are scoped

Approvals live on the project, not the workspace. A multi-location
launch requires its own approval matrix per project — preventing one
brand's sign-off from accidentally unlocking another.

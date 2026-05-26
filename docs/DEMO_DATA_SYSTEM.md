# Demo Data System

## Status

`services/demo/demo-seed-service.ts` currently returns **`available: false`** with an explicit reason string.

## Principles (when implemented)

- Demo workspaces flagged (`KitchenSettings.demoMode` already exists)
- No silent mutation of production workspaces
- Reset = explicit destructive confirmation + audit trail
- Import templates preferred over hard-coded SQL

See onboarding demo flows + import-center templates for interim paths.

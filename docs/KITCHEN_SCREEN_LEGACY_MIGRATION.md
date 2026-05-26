# Kitchen Screen legacy migration

## Current

Two lanes coexist:

1. **Command-center work items** — `ProductionWorkItem` (prep/batch/order-sourced lines).
2. **Legacy product tasks** — `ProductionTask` cook/pack/label per menu product.

## Policy

- **Do not remove** legacy lane until all tenants migrate workflows to work items.
- UI labels legacy section explicitly.

## Migration path (future)

- When a product has a linked open work item, optionally hide duplicate legacy card (feature-flagged).
- Map legacy completion to work item stage transitions where 1:1 product linkage exists.

## Data

No destructive migration; documentation-only until product strategy confirms cutover.

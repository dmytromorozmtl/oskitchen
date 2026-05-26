# Brand-scoped orders & Order Hub

## Goals

- Brand filter + badge in Order Hub.  
- Unassigned queue for orders lacking `brandId`.  
- Bulk assign with guardrails (preview, audit).  
- KPIs per brand (revenue, SLA, channel mix).

## Inference order (import)

1. Explicit mapping rule (connection + external store id).  
2. Storefront order linkage → storefront `brandId`.  
3. Fallback: manual review.

## Current state

- `Order.brandId` nullable; reports route aggregates when set.  
- Header brand switcher persists operator focus but list queries still workspace-wide until wired.

## Safeguards

- Changing brand on settled financial periods should warn (future confirmation modal).

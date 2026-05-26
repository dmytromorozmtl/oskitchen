# Production timeline view

**Route:** `/dashboard/production?view=timeline`

## Goal

Visualize `dueAt`, pickup/delivery windows, catering event deadlines, and station concurrency.

## Current

Placeholder card describing Gantt-style next steps.

## Implementation notes

- Data: `ProductionWorkItem.dueAt`, related `Order` windows when joined, `ProductionBatch.productionDate`.
- Chart: consider lightweight SVG or existing chart lib with virtualization for 7-day windows.
- Overlays: station capacity lines from `production_stations.capacityUnits`.

# Production / packing / delivery metrics

## Production

- **Items planned**: `SUM(production_batches.totalItems)` in window.
- **Items completed**: `SUM(production_batches.completedItems)` in window.
- **Completion rate**: completed / planned (returns null when planned == 0).
- **Delayed batches**: batches with `productionDate < now()` and status not in `COMPLETED` / `ARCHIVED`.
- **Load by station**: aggregated `assignedStation` rollup, with `(unassigned)` bucket for null station IDs.

## Packing

- **Items packed**: `SUM(packing_batches.packedItems)` in window.
- **Items total**: `SUM(packing_batches.totalItems)` in window.
- **Completion rate**: packed / total.

## Delivery

- **Routes in window**: count of `delivery_routes` whose `routeDate` falls in the window.
- **Stops by status**: grouped count of `delivery_stops` rows that belong to those routes.
- **On-time delivery**: stops with status DELIVERED / total stops in window.
- **Failed stops**: stops with status FAILED.

## Caveats

- We only count stops belonging to routes in the window — that's the operator's mental model.
- Status semantics: `PENDING`, `PACKED`, `READY`, `LOADED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `FAILED`, `RETURNED`, `SKIPPED`.
- We never invent timings (drive durations, route distances) — those come from real route rows when present.

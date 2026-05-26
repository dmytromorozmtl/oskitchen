# Kitchen Screen stations

## URL

`/dashboard/kitchen?station=bar` (slug list in `KITCHEN_STATION_SLUGS`).

## Matching

Heuristic substring/regex on `ProductionWorkItem.station` free text until `production_stations` drives canonical names.

## Counts

Each tab shows count of **all** open items matching that tab’s matcher (independent of other filters except station tab selection drives filter pipeline).

## Next

- Replace matchers with FK to `ProductionStation`.
- Station workload/late counts split by open vs done today.

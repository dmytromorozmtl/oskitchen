# Digital Twin Engine

Cycle 5 — kitchen discrete-event simulation for what-if scenarios.

## Service

- `services/ai/digital-twin.ts` — `createDigitalTwin(workspaceId)`, `runKitchenSimulation`
- `lib/ai/digital-twin-simulation.ts` — pure simulation math (testable without DB)
- `lib/ai/digital-twin-types.ts` — `KitchenSimulation`, `SimulationResult`

## Data sources

| Config | Source |
|--------|--------|
| Stations | `production_stations` table, else Settings Center `operations.stations`, else defaults |
| Staff | Today's `staff_shifts`, else active `staff_members` |
| Equipment | Inferred from station names (grill, fryer, expo) |

## Simulation

`simulate({ orderCount, timeWindow, menuMix })` models each order through a prep → hot → pack route:

- Service time scales with station capacity, assigned staff efficiency, and equipment throughput
- Station `currentLoad` seeds initial backlog (used by real-time twin from live KDS queue)
- Returns bottleneck station, wait times, utilization gauges, AI-assisted recommendations
- `confidence` reflects order volume and staffing data quality

## Real-time twin (Cycle 7)

- `services/ai/real-time-twin.ts` — `getCurrentKDSState`, `getCurrentPOSOrders`, `updateRealTimeTwin`, `getKDSPredictions`
- Seeds simulation from live KDS queue depth + last-hour POS order rate and menu mix
- Persists predictions to `settingsCenterJson.realTimeTwin` for KDS clients
- Sends in-app alert (notification log) when projected bottleneck delay exceeds **15 minutes** (30-min dedupe)

## Limitations

- Deterministic model — menu items map to stations via hash, not recipe routing rules yet
- No equipment failure modeling in v1
- Camera feed integration planned in Cycle 19

## Tests

- `tests/unit/digital-twin-simulation.test.ts`
- `tests/integration/digital-twin.integration.test.ts`
- `tests/unit/real-time-twin-builders.test.ts`
- `tests/integration/real-time-twin.integration.test.ts`

## Next cycle

~~Cycle 6 — Digital Twin UI~~ — done  
~~Cycle 7 — Real-time Digital Twin~~ — done

Cycle 8 — Universal Menu Engine (`services/menu/universal-menu-engine.ts`)

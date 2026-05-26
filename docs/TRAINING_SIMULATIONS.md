# Training simulations

Simulations are sandboxed, deterministic rehearsals.

## Scenarios

`TrainingSimulationType` covers 13 scenarios:

- `LUNCH_RUSH`, `DINNER_RUSH`
- `CATERING_PREP`, `GHOST_KITCHEN_SPIKE`
- `FAILED_DELIVERY`, `INVENTORY_SHORTAGE`
- `ALLERGY_INCIDENT`, `PACKING_MISMATCH`
- `ROUTE_DELAY`, `POS_OUTAGE`, `INTEGRATION_FAILURE`, `KITCHEN_BOTTLENECK`
- `CUSTOM`

Each scenario in `SIMULATION_TEMPLATES` defines:

- description
- step list (`id`, `title`, `description`, `expectedAction`, optional timer, point value)
- passing score (0–100)

## Run engine

`gradeSimulation(type, responses, config?)`:

1. Sum point values across all steps to compute `totalPoints`.
2. For each user response, award points iff `correct === true`.
3. Score = round(achieved / total × 100).
4. Passed = score ≥ passingScore.

`runSimulation` in the service creates a `TrainingSimulationRun` and writes
`SIMULATION_PASSED` / `SIMULATION_FAILED` to `TrainingEvent`.

## Practice safety

Simulations never write production data. They only create
`TrainingSimulationRun` rows for analytics.

## UI

`/dashboard/training/simulations` exposes:

- `CreateSimulationForm` (pick scenario)
- `SimulationRunner` (toggle each step as correct/incorrect, submit)
- Per-simulation history of recent runs

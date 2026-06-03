# AI Co-Pilot 2.0 (Autonomous)

Fully autonomous restaurant Co-Pilot layer: **daily digest**, **exception log**, and **safe auto-execution** on top of the manual Co-Pilot (v1).

## Routes

| Path | Description |
|------|-------------|
| `/dashboard/ai/co-pilot` | Manual recommendations + owner approval |
| `/dashboard/ai/co-pilot/autonomous` | Co-Pilot 2.0 digest & exceptions |

## Autonomous behavior

- **Daily digest** — procurement, scheduling, pricing, and autonomous action summary
- **Exception log** — critical/warning recommendations persisted in `settingsCenterJson.coPilotAutonomous`
- **Safe auto-run** — when enabled, promotes + approves + executes **info** items with action types:
  - `suggest_report_export`
  - `suggest_ingredient_demand_run`

Critical and warning items never auto-execute — they appear in the exception log.

## Services

```
services/ai/co-pilot-autonomous-service.ts
services/ai/co-pilot-service.ts           — scans & drafts
lib/ai/co-pilot-autonomous-builders.ts
```

## Actions

- `runCoPilotAutonomousCycleAction`
- `updateCoPilotAutonomousSettingsAction`
- `resolveCoPilotExceptionAction`

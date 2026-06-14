# Labor forecasting AI — 7shifts parity (P2-66)

**Policy:** `labor-forecasting-ai-p2-66-v1`  
**Route:** `/dashboard/staff/ai-scheduling`  
**Gap:** P2-66 — deep scheduling AI from demand signals

## Overview

OS Kitchen ships **labor forecasting AI** that predicts staffing from day-of-week order demand, recommends headcount, projects labor cost vs revenue, and drafts shift suggestions — comparable to 7shifts labor forecasting, without claiming certified parity.

## Flow

1. **Demand by DOW** — aggregate recent order revenue and volume by day of week
2. **Headcount recommendation** — orders-per-staff + labor % budget constraints
3. **Labor cost projection** — hourly rates × shift hours × headcount
4. **Shift suggestions** — split windows (lunch/dinner) with role labels; apply to weekly schedule

## Forecasting capabilities

| Capability | Surface |
|------------|---------|
| `demand_by_dow` | Order history aggregation |
| `headcount_recommendation` | Per-day recommended headcount |
| `labor_cost_projection` | Projected labor $ and hours |
| `shift_window_suggestion` | Start/end times per shift |
| `labor_pct_target` | Target vs blended labor % |
| `confidence_scoring` | low / medium / high from sample weeks |
| `apply_to_schedule` | Apply all shifts to weekly board |

## Benchmark corpus

**12 scenarios** covering 100% of forecasting capabilities.

Run: `npm run check:labor-forecasting-ai-p2-66`

## Honesty

- Demand-based deterministic model — not a generative LLM
- Review suggestions before publishing; overtime and availability rules are approximate
- Does not replace compliant payroll systems

## Wiring

- `lib/labor/labor-forecasting-ai-p2-66-builder.ts`
- `services/forecast/labor-forecast-service.ts`
- `services/labor/ai-scheduling-service.ts`
- `components/dashboard/staff/ai-schedule-panel.tsx`
- `actions/labor/ai-scheduling.ts`

# Forecast confidence

Confidence is a label that summarises how much we trust a number.

| Label | When |
|-------|------|
| `LOW` | <14 historical data points and no committed sources, **or** any other input that doesn't qualify above. |
| `MEDIUM` | ≥14 historical data points. |
| `HIGH` | ≥21 historical data points **and** at least one committed source (meal plans or accepted catering). |
| `MANUAL` | Operator applied an OVERRIDE adjustment. |

## Implementation

`lib/forecast/forecast-confidence.ts:deriveConfidence`. Inputs:

- `historyDataPoints`: count of days summed in the projection.
- `hasMealPlanContribution`: any `MEAL_PLANS` contribution > 0.
- `hasCateringContribution`: any `ACCEPTED_CATERING_EVENTS` contribution > 0.
- `hasManualOverride`: set by adjustments.

Run confidence (`deriveRunConfidence`) returns the most frequent line
confidence so the run summary is grounded in the actual distribution of
its lines, not the best line or the worst.

## UI policy

Every page and KPI card carries an "Estimate only" disclaimer. The
confidence label appears next to the run title, on KPI badges, and on
each line. We never imply ML/AI accuracy.

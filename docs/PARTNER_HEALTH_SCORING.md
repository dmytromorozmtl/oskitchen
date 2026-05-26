# Partner health scoring

## Stored vs computed

`PartnerClient.healthScore` is an optional persisted integer (0–100 style). The dashboard may backfill or refresh it via `partner-health-service` heuristics (workspace activity, onboarding, integrations, orders — subject to available signals).

## Signals (conceptual)

| Signal | Why it matters |
|--------|----------------|
| Login / staff activity | Adoption |
| Onboarding completion | Time-to-value |
| Integrations connected / sync health | Operational dependency |
| Order volume | Revenue activation |
| Notifications configured | Alerting resilience |
| Open support / failed syncs | Reliability |

## Outputs

- **Health score** — single 0–100 style number for sorting and “at-risk” KPIs.  
- **Risk level** — derive bands from score + `PartnerClientStatus` (e.g. `PAUSED`).  
- **Expansion score** — reuse `expansionPotential` field or compute from usage growth + NPS placeholders.

## Partner dashboard usage

KPIs **at-risk workspaces**, **churn risk**, and **average health** read stored scores first; heuristics can populate scores on a scheduled job later.

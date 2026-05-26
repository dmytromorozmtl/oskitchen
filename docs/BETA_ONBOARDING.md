# Beta onboarding readiness

## Dimensions

`services/beta/beta-onboarding-service.ts` derives six 0–100 dimensions from application text/JSON:

- data import readiness  
- integrations readiness  
- staff readiness  
- operational maturity  
- production readiness  
- CRM readiness  

## Usage

Displayed in the detail drawer (readiness card can be extended). `estimatedOnboardingDays` is persisted on the lead from the scoring engine.

## Next steps

- Pull live signals from `usage_events` / onboarding checklist completion.
- Replace heuristics with weighted rubric configurable per vertical.

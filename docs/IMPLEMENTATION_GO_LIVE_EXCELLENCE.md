# Implementation & Go-Live Excellence

## Existing engines

- `services/go-live/go-live-service.ts` — approvals, simulations, readiness inputs, blockers.  
- `services/readiness/workspace-readiness-service.ts` — lightweight workspace readiness scoring.

## This pass (facades)

- `services/implementation/implementation-plan-service.ts` — exports `computeWorkspaceReadiness`.  
- `services/implementation/go-live-readiness-service.ts` — re-exports `loadReadinessInputs`.  
- `services/training/training-progress-service.ts` — wraps partner training counters.  
- `services/templates/workspace-template-service.ts` — lists active `WorkspaceTemplate` rows.

## Enterprise checklist categories

Map directly to go-live categories already modeled: profile, staff, products, menus, POS, channels, production, packing, routes, notifications, billing, support, permissions, data integrity.

## Next

- Implementation project UI should attach **owners + due dates** per task (partially present in go-live models — extend UI).

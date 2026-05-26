# Partner implementation pipeline

## Canonical stages

Ordered array `IMPLEMENTATION_PIPELINE_ORDER` in `services/partner/partner-implementation-service.ts`:

1. Discovery  
2. Contract signed  
3. Data migration  
4. Menu setup  
5. Integrations  
6. Staff setup  
7. Training  
8. QA  
9. Soft launch  
10. Go-live  
11. Stabilization  
12. Expansion  

`PartnerClient.implementationStage` stores the current enum value. Labels for UI live in `lib/partner/partner-status.ts` (`PARTNER_IMPLEMENTATION_STAGE_LABEL`).

## KPI: implementation success %

Snapshot treats **Go-live, Stabilization, Expansion** as post-cutover success states for a simple portfolio metric. Tune if your commercial definition differs (e.g. require `LIVE` client status).

## Roadmap: tasks, blockers, notes

Recommended extensions (not all implemented in UI):

- Structured **blockers** JSON or child table with severity + owner.  
- **Checklist** items per stage (boolean + completedAt).  
- **Risk register** (probability × impact) for enterprise deployments.  
- Timeline visualization fed from audit events on stage transitions.

Server actions should validate **only adjacent** or explicitly allowed jumps to keep analytics trustworthy.

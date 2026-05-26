# Customer CRM & retention engine

## Existing services

- `services/crm/customer-service.ts` — upsert + profile fetch + orders by email.
- `services/crm/customer-metrics-service.ts` — recompute metrics.

## New facades

- `services/crm/customer-profile-service.ts` — profile + recent orders bundle.
- `services/crm/customer-segmentation-service.ts` — heuristic segment labels (VIP, at-risk, etc.).
- `services/crm/customer-retention-service.ts` — playbook suggestions (tasks vs marketing).
- `services/crm/lifecycle-automation-service.ts` — **catalog only**; sends require consent checks in notification engines.

## Compliance

**No marketing sends** without `marketingConsent` + channel consent flags.

## Priority

**P1** for retention-led ICPs (meal prep, catering).

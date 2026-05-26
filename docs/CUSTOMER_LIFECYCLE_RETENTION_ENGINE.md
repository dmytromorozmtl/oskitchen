# Customer Lifecycle & Retention Engine

## CRM primitives (existing)

- `KitchenCustomer` with LTV, orders, consent flags, dietary JSON.  
- Segments (`CustomerSegment`), timeline events, follow-ups, health snapshots (workspace-level snapshot table).

## This pass

- `services/crm/customer-lifecycle-service.ts` — `loadKitchenCustomerSummary`.  
- `services/crm/customer-health-service.ts` — latest workspace `CustomerHealthSnapshot`.  
- `services/crm/retention-signal-service.ts` — wraps `suggestRetentionPlaybooks` + churn placeholder.  
- `services/crm/customer-segment-service.ts` — list segments.

## Compliance

- **No marketing sends** without `marketingConsent` + provider configuration — retention playbooks flag consent requirements.

## Next

- Per-customer health timeline joins (requires schema extension or snapshot linkage).  
- Catering / meal-plan histories surfaced on profile via existing relations.

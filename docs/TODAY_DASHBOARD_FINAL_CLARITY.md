# Today vs dashboard — Final clarity

## Separation of concerns

| Surface | Job |
|---------|-----|
| **Dashboard** | Owner overview: readiness, revenue, health, trends, alerts, **non-blocking** exploration |
| **Today** | Execution: urgent blockers, due-today orders, POS kitchen queue, production/packing/routes, integration/mapping fires |

## Card contract (target UX)

Every actionable card should show:

1. **Priority** — P0–P3 or operational equivalent  
2. **Owner** — role or team  
3. **Blocker code** (if any) — link to glossary  
4. **Due time** — explicit timezone-aware  
5. **Next action** — verb + object  
6. **Route** — absolute internal path

## Implementation direction

- Prefer reusing `resolveOrderNextActionBundle` and blocker lists over duplicating business rules in UI-only code.
- **Implemented:** Today / Home “missing pickup” counts use `orderMissingRequiredServiceDate` (same rules as `requiresScheduledServiceDate` + Order Hub “Missing fulfillment info”). Delivery attention counts orders with **no `deliveryStops`** while in-flight. Webhooks split **queue total** vs **needing attention** (error or invalid signature while still unprocessed).

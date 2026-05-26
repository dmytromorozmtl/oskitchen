# Order hub + product mapping — Finalization

## Order hub

**Tabs** (`lib/order-hub/order-hub-status.ts` + `services/order-hub/order-triage-service.ts`):

| Tab | Intent |
|-----|--------|
| All | Full pipeline |
| Needs review | `PENDING` internal |
| Needs mapping | Channel batch present + `PENDING` |
| Missing customer info | Heuristic aligned with customer blockers; excludes POS walk-in placeholder |
| Missing fulfillment info | Delivery address + scheduled service date rules |
| Ready for production | `CONFIRMED` |
| In production | `PREPARING` |
| Packing | `READY` |
| Fulfillment | Delivery + active statuses |
| Completed | `COMPLETED` |
| Failed / errors | Import batch failed **or** linked external sync failed |
| POS | POS-shaped internal orders |

**Channel table visibility** — Shown for tabs where external rows add signal (including mapping/customer/fulfillment triage).

## Product mapping

- **Never auto-map low confidence** — approvals are authoritative; silent overwrite is forbidden.
- **On approval** — recompute blockers; refresh Order hub, Today, and order detail surfaces.
- **Conflicts** — visible in mapping UI + integration health; failed imports link to recovery.

## Priority

- P1: Tab correctness + blocker alignment (this pass advanced triage).  
- P0: Any silent mapping overwrite bug if discovered — treat as release blocker.

# Packing verification handoff

## Intended status story

After QC **passes** (and not overridden incorrectly):

| Concept | Direction |
|---------|-----------|
| Packing tasks | Moved toward `VERIFIED` when order session completes successfully (see `completeVerificationSession` in `verification-service.ts`). |
| Order Hub | Order status / readiness fields updated in the same transaction where business rules apply — keep in sync with existing Order Hub enums. |
| Pickup / delivery | Fulfillment type drives copy in UI; “ready” messaging should match your existing customer comms gates. |
| Route | When route verification ships, route manifest status should flip only after route session pass. |

## Partial and fail

- **Partial** — session closed with explicit partial outcome; handoff to “customer ready” should **not** auto-fire unless product policy says so.
- **Fail** — blocks ready handoff; send-back actions reopen packing work.

## Audit

Every transition should have a matching `PackingQcEvent` (`SESSION_COMPLETED`, `ORDER_STATUS_UPDATED`, `PACKING_TASKS_UPDATED`, etc.) for downstream reporting.

## Customer tracking

If tracking is feature-flagged, hook from the same completion transaction **after** internal consistency checks — do not leak PII to guest endpoints from QC tables.

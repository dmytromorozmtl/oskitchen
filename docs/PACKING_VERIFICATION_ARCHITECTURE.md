# Packing verification architecture

## Layers

1. **UI** — `components/dashboard/packing-verify-console.tsx`, `packing-verify-qr-region.tsx`, page `app/dashboard/packing/verify/page.tsx`.
2. **Server actions** — `actions/packing-verify.ts` (legacy token + `PackingEvent`), `actions/packing-verification.ts` (QC session lifecycle).
3. **Domain lib** — `lib/packing-verification/` (`verification-types`, `verification-status`, `verification-actions`, `verification-validation`, `verification-terminology`).
4. **Service** — `services/packing-verification/verification-service.ts` (Prisma transactions, session detail, timeline).
5. **Persistence** — Prisma models on `UserProfile`, `Order`, `OrderItem`, `PackingTask`, `PackingBatch`, `PackingWave`, `DeliveryRoute`, plus new QC tables.

## Verification modes (`PackingVerificationSessionMode`)

Declared in Prisma and reused in types: `ORDER_VERIFY`, `BAG_VERIFY`, `ITEM_VERIFY`, `WAVE_VERIFY`, `ROUTE_VERIFY`, `EVENT_LOADOUT_VERIFY`, `PICKUP_HANDOFF_VERIFY`, `DELIVERY_HANDOFF_VERIFY`. **Primary implemented path:** `ORDER_VERIFY` (session tied to `orderId`).

## Verification sources

| Source | Mechanism |
|--------|-----------|
| QR / manual token | `lookupOrderByPackTokenAction` + optional `parseEmbeddedTokenFromQr` for URLs. |
| Order id | Same lookup accepts UUID when it matches tenant order id. |
| Customer name | `searchOrdersByCustomer` / `searchOrdersByCustomerAction`. |
| Packing task / wave / route / event | Schema-ready; expand service to start sessions from those foreign keys. |

## Session status (`PackingVerificationSessionStatus`)

`OPEN`, `IN_PROGRESS`, `PASSED`, `FAILED`, `PARTIAL`, `OVERRIDDEN`, `CANCELLED`.

## Item status (`PackingVerificationItemStatus`)

`PENDING`, `VERIFIED`, `MISSING`, `EXTRA`, `WRONG_ITEM`, `DAMAGED`, `SUBSTITUTED`.

## Audit: two channels

| Channel | Table | Purpose |
|---------|--------|---------|
| Legacy packing narrative | `PackingEvent` (+ forms on verify for quick logs) | Operational packing story, existing integrations. |
| QC session audit | `packing_qc_events` | Structured QC timeline (`QC_EVENT` in `verification-actions.ts`). |
| Task verification tab | `packing_verification_events` | Unchanged; command center task verify. |

## Scan telemetry

`packing_scan_events` stores token attempts (`PackingScanEvent`) for reconcile and security review without mutating QC sessions.

## Handoff

On **pass**, service updates order readiness signals and packing tasks where applicable (see `verification-service` `completeVerificationSession`). Partial/fail paths set session status without forcing “ready” handoff.

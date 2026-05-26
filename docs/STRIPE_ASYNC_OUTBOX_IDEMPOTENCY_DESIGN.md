# Stripe async billing — outbox & idempotency (design only)

**Status:** *Design / roadmap — no async billing ingestion was implemented in this pass.*  
Capability matrix row: `stripe_async_billing` → **DESIGN_READY**.

## Current behavior (as of this pass)

- Stripe webhooks and billing flows remain on the **existing synchronous** handling paths.
- Capability matrix + health pages must not claim async Stripe billing.

## Risks of naive async billing

- **Double application** of the same invoice/payment event across workers.
- **Out-of-order** subscription lifecycle transitions (cancel vs renew).
- **Partial failure** after side effects (ledger written, webhook ack lost).

## Required model (future implementation)

1. **Idempotency keys** per Stripe `event.id` (and per internal billing command).
2. **Outbox table** for “billing commands to execute” with status + attempt log.
3. **Inbox dedupe** table or unique constraint on `(provider, external_event_id)` for processed Stripe events.
4. **Ordering strategy** — partition by `customerId` / `subscriptionId` to serialize conflicting events.
5. **Billing state machine** explicit transitions with guards.
6. **Replay safety** — replays must reference stored normalized event, not raw mutable payloads in logs.
7. **Rollback** — compensating entries + manual ops runbook (no silent auto rollback of money movement).
8. **Audit** — who acknowledged / replayed / forced settlement.

## Test & migration plan (when approved)

- Shadow mode: write outbox rows without executing.
- Canary tenant with synthetic events.
- Migration ordering: outbox table → worker → flip feature flag per workspace.

## Go / no-go checklist

- [ ] Legal + finance sign-off on async money movement.
- [ ] Idempotency proofs in code review.
- [ ] Load test on webhook burst.
- [ ] Observability: Sentry + structured logs without PAN/PII.

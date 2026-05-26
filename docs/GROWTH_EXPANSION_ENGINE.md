# Growth — Expansion Engine

Implementation: `services/growth/expansion-service.ts` + `lib/growth/growth-scoring.ts` (`scoreExpansionHeuristic`).

## Signals

- Order volume delta (30d vs previous 30d window)
- Staff count (`StaffMember`)
- Integration connection count (proxy for surface area)

## Output

Active subscribers (`Subscription.status = ACTIVE`) with composite score ≥ threshold.

## Limitations

Does not read Stripe quantity/ARR — extend with invoice line items or usage meters when available.

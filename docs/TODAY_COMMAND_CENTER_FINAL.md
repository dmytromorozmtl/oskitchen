# Today Command Center — Final (MVP)

## Intent

`/dashboard/today` is the **execution hub**: blockers first, then dated work, POS attention, production/packing/routes, tasks, integrations, integrity.

## Implementation

- **Payload:** `services/today/today-command-center-service.ts`  
- **UI:** `components/dashboard/today-command-center.tsx`  
- **Operational sub-counts:** `services/today/today-query-service.ts` (`loadTodayOperationalCounts`)

## KPIs (current)

Includes: blocked orders (approx), confirmed pipeline, packing/production queues, orders due today / today created, **POS transactions today**, **POS kitchen queue today**, **revenue today** + revenue 7d, webhooks, integration errors, channel failures, unmapped SKUs, support tickets, integrity flags.

## Next increments (P1/P2)

- Feed “urgent blockers” cards from the same ordered list as Order Hub triage.  
- Business-mode-specific section ordering (meal prep vs restaurant vs catering).  
- Deeper POS queue: orders in `PREPARING` with station breakdown when data exists.

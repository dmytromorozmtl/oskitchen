# Channel rules engine

`ChannelRule` stores `trigger`, `conditionsJson`, `actionsJson`, `active`. Triggers cover import lifecycle events (`ORDER_IMPORTED`, `WEBHOOK_RECEIVED`, …).

## Current state
Authoring + toggle UI at `/dashboard/sales-channels/rules`. **Execution** (notifications, tasks, catering quotes) is intentionally not faked — wire to automation engine in a follow-up PR.

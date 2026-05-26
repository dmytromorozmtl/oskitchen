# Sales channels — deep audit

| Area | Current state | Issue | Business impact | Fix | Priority |
| --- | --- | --- | --- | --- | --- |
| Hub UI | Was static cards on `/dashboard/integrations` | Limited diagnostics & channel breadth | Operators could not see roadmap vs live | **Channel operations center** at `/dashboard/sales-channels` + registry | P0 |
| `IntegrationConnection` | Encrypted fields, status enum, health checks | No per-channel display metadata | Fine for MVP | Use **channel registry** for labels; keep DB model | P1 |
| Webhook routes | `/api/webhooks/*` unchanged | — | — | No change | — |
| Order normalization | `NormalizedKitchenOrder` + persist layer | Not all providers mapped | Failed rows need visibility | External orders + mapping queue | P1 |
| Product mapping | `/dashboard/product-mapping` | Not linked from hub | Slow setup | Link from hub + attention KPIs | P1 |
| Order hub | Unified queue | — | — | Deep links from hub | P2 |
| Webhook log | `WebhookEvent` + PlanGate | Two URLs | Confusion | `/dashboard/sales-channels/webhooks` + legacy | P2 |
| Security | Encryption, no echo of secrets | Payload viewer risk | Leakage | Redact in any future payload UI; never return secrets to client | P0 |
| Missing channels | Only enum providers in DB | Marketplaces expect more | Expectation gap | Registry placeholders + honest copy | P1 |
| Sync observability | None | Blind retries | Ops fatigue | **`ChannelSyncJob`** model + `/sync-jobs` | P1 |
| Diagnostics | Health check manual | No auto score in DB | Subjective | Derive from health checks in UI (future column optional) | P3 |

## Security snapshot

- Credentials: encrypted at rest; forms never re-populate secrets.
- Webhooks: signature verification per handler; failures logged on `WebhookEvent`.
- Multi-tenant: all queries scoped by `userId` / connection ownership.

## Migrations

- `20260515120000_channel_operations_center` — adds `channel_sync_jobs` only (additive).

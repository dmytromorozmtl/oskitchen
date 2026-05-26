# Channel health (final)

- **Workspace score:** `lib/channels/channel-health-score.ts` + `loadSalesChannelMetrics`
- **Heuristic inputs:** integration errors, webhook backlog (`processed=false`), failed external imports, unmatched products, channels needing credentials
- **Per-connection probes:** `/dashboard/sales-channels/health` uses `runIntegrationHealthCheckVoid` + `IntegrationHealthCheck`

Scores are **estimates**, not vendor SLAs — copy reflects that in the UI.

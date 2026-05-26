# Channel sync jobs (final)

- **Ledger model:** `ChannelSyncJob` (user scoped, optional `connectionId`, `provider`, `type`, counters, `status`, `errorMessage`)
- **Orchestrator:** `services/channels/sync-orchestrator.ts` — `beginChannelSyncJob` / `finishChannelSyncJob`
- **Wired today:** WooCommerce `/api/integrations/woocommerce/sync-orders` and `sync-products`
- **UI:** `/dashboard/sales-channels/sync-jobs`

Next: mirror job wrapping for Shopify sync routes and surface “retry failed” once partial statuses are written.

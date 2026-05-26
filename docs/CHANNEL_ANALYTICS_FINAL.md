# Channel analytics (final)

- **Route:** `/dashboard/sales-channels/analytics`
- **Data:** `loadSalesChannelMetrics` for Order hub slices; `externalOrder.groupBy` for ingest; `channelSyncJob.groupBy` for job outcomes
- **Heuristic slices:** Storefront-linked orders, Woo/Shopify imports, Uber Eats imports, manual/other remainder

Trend charts remain future work (P2) — current page is honest tabular analytics.

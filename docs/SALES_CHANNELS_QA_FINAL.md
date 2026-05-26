# Sales channels — QA (final)

## Smoke

- [ ] `/dashboard/sales-channels` overview loads; KPIs non-empty strings where applicable
- [ ] Connected / Available / Needs attention tabs render without throw
- [ ] `/dashboard/sales-channels/webhooks` shows endpoint list + log (plan gate for log)
- [ ] `/dashboard/sales-channels/mapping` shows counts + link to workbench
- [ ] `/dashboard/sales-channels/analytics` aggregates load with zero data gracefully
- [ ] `/dashboard/sales-channels/health` shows workspace score + connection cards
- [ ] WooCommerce save still succeeds with encryption configured; disconnect writes audit row
- [ ] Woo sync creates `ChannelSyncJob` rows (RUNNING→SUCCESS/FAILED)

## Security

- [ ] No secret fields in HTML source after save
- [ ] Webhook URLs copy without embedding tokens

## Regression

- [ ] `/dashboard/order-hub` still lists orders from storefront + imports + manual
- [ ] `/api/webhooks/woocommerce` and Shopify routes unchanged paths

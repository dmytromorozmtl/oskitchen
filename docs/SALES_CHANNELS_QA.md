# Sales channels QA (smoke)

- [ ] `/dashboard/sales-channels` loads KPIs and channel grid.
- [ ] `/dashboard/integrations` redirects to sales channels hub.
- [ ] WooCommerce + Shopify setup pages still load; save masks secrets.
- [ ] Webhook center at `/dashboard/sales-channels/webhooks` lists events (PlanGate).
- [ ] Health at `/dashboard/sales-channels/health` runs manual check.
- [ ] Mapping tab redirects to `/dashboard/product-mapping`.
- [ ] Placeholder setup e.g. `/dashboard/sales-channels/doordash/setup` shows honest copy + CTA.
- [ ] `/dashboard/orders/quick` loads manual order form.
- [ ] API webhook routes unchanged (smoke POST with bad signature → 401).

Run `npm run typecheck` and `npm run build` before release.

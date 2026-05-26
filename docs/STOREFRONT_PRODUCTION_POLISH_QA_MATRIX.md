# Storefront production polish QA matrix

| # | Check | How |
|---|--------|-----|
| 1 | Docs match code | Spot-check paths in `docs/STOREFRONT_*` against repo |
| 2 | Redirect stored-only honest | Unset `STOREFRONT_REDIRECTS_ENABLED` → Advanced shows stored-only |
| 3 | Redirect enabled works | Set env true + secret → `/s/{slug}{from}` redirects |
| 4 | hitCount only when active | Disable env → hits flat; enable → increments |
| 5 | Unsafe redirect blocked | Try `toPath` https external → save error |
| 6 | Rule summaries | Advanced list shows summary + enforcement hint |
| 7 | Rules in checkout | Place order violating closure → blocked |
| 8 | Missing-data rules warn | zone_minimum + zoneName without match → warning not fake hard block |
| 9 | verify script | `npm run verify:storefront-migration` exit 0 |
| 10 | verify script no secrets | Output contains no `postgres://` / keys |
| 11 | FP ALWAYS_ON | Mode ALWAYS_ON → page_view stored without marketing consent |
| 12 | FP CONSENT_REQUIRED | No cookie → no beacon POST success |
| 13 | FP DISABLED | API 404 ingest |
| 14 | Marketing gated | GA/GTM still behind marketing consent mode |
| 15 | Service extraction | Smoke: forms/redirects/test orders still work |
| 16 | Theme preview | Theme page renders previews, bad URL rejected |
| 17 | Pay-later checkout | End-to-end submit pay_later |
| 18 | Stripe checkout | With Stripe configured, online path returns session |
| 19 | Test orders excluded | Analytics rollup respects `analyticsExcludeTestOrders` |
| 20–23 | CI | `npm run typecheck && npm run build && npm run lint && npm test` |

# Storefront completion QA matrix

| # | Check | Status |
| --- | --- | --- |
| 1 | Pay-later checkout | Covered by existing flow + payment radio default |
| 2 | Online payment disabled without Stripe | Admin save blocked; checkout hides card option |
| 3 | Online payment with Stripe | Requires env + webhook; code path implemented |
| 4 | Delivery zone blocks bad address | When zones define postal/region matchers |
| 5 | Delivery fee / free threshold | Unchanged server math |
| 6 | SEO metadata | `buildStorefrontMetadata` + exports |
| 7 | GA/GTM/Meta | GTM exclusive with GA script helper |
| 8–11 | Forms / Resend / domains | **Not completed** — see completion report |
| 12–14 | Advanced redirects/rules/test order | **Not completed** |
| 15 | Discount admin | Implemented |
| 16 | Discount server checkout | Implemented |
| 17 | Analytics funnel | Partial — events exist; rich dashboard not finished |
| 18 | Theme URL validation | **Not completed** |
| 19 | Signed preview | Implemented (cookie) |
| 20 | Draft without token | Blocked for strangers |
| 21 | Multi-brand doc | See `STOREFRONT_MULTI_BRAND_STRATEGY.md` |
| 22 | typecheck/build/lint/test | Run in CI locally |

Commands:

`npm run typecheck && npm run build && npm run lint && npm test`

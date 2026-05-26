# Storefront final reliability QA matrix

| # | Check | How |
| --- | --- | --- |
| 1 | Signed token generated | Layout JSON contains `fpToken` when secret + non-disabled mode. |
| 2 | Valid token accepted | Unit: `tests/unit/storefront-analytics-token.test.ts` + manual POST with header. |
| 3 | Expired rejected | Unit test decode. |
| 4 | Wrong storefront rejected | Unit verify slug/id mismatch. |
| 5 | Consent required blocks beacon | Cookie absent → client `ingest` returns early; API 403 without header. |
| 6 | Disabled sends nothing | `ingestDisabled` / mode DISABLED. |
| 7 | GA/GTM/Meta consent | Manual: banner mode + network panel. |
| 8 | Pay-later checkout | Manual regression (not automated here). |
| 9 | Stripe online | Manual / Stripe test mode only. |
| 10 | Redirect loop blocked | Unit redirect edge + manual rule pair. |
| 11 | Sensitive path protected | Unit `isSensitiveStorefrontRedirectPath` + service null. |
| 12 | hitCount when active | Middleware + resolve API path (integration manual). |
| 13 | Custom domain doc | Advanced admin copy + this matrix note. |
| 14 | Migration verify | `npm run verify:storefront-migration`. |
| 15 | Column probe | `npm run verify:storefront-db` with DATABASE_URL. |
| 16 | Action import guard | `npm run verify:storefront-actions` + unit import test. |
| 17 | CI gates | GitHub workflow file matches `docs/CI_STOREFRONT_HARDENING.md`. |
| 18 | Playwright | `npm run test:e2e:storefront` (skips if no slug). |
| 19 | typecheck | `npm run typecheck`. |
| 20 | lint | `npm run lint`. |
| 21 | unit tests | `npm test`. |
| 22 | build | `npm run build`. |

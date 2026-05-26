# Storefront production polish audit

Scope: remaining gaps after the storefront follow-up pass (no rebuild of `/s/[storeSlug]`).

| Area | Current behavior | Why it matters | Risk | Approach | Defer | Affected | Priority |
|------|------------------|----------------|------|-----------|--------|----------|----------|
| Detailed docs | Split per feature; this audit lists gaps only | Ops / handover | P2 drift | Add `*_FINAL.md` + engine/redirect/prisma docs | Long-form marketing copy | `docs/` | P2 |
| Redirect `hitCount` | Increments only when `STOREFRONT_REDIRECTS_ENABLED=true`, secret set, and middleware resolves a match | Honest analytics | P1 misleading counts | Internal `resolve-redirect` + middleware fetch | Multi-hop redirect chains beyond single row | `middleware.ts`, `app/api/storefront/resolve-redirect`, `services/storefront/storefront-redirect-service.ts` | P1 |
| Redirect middleware | Optional; off by default | Safety / perf | P0 loops if misconfigured | Same as above; validate paths, block external | Per-host CDN redirect tables | `lib/storefront/storefront-redirects.ts` | P0 |
| Fulfillment engine | JSON types with legacy + UPPER aliases; some rules warn if data missing | Order correctness | P0 if faked | Pure evaluation + checkout server truth | Auto surcharges not priced | `lib/storefront/fulfillment-rules.ts`, engine, `actions/storefront-order.ts` | P0/P1 |
| Prisma deploy | Shadow DB issues possible in some hosts | Broken deploys | P1 | `verify:storefront-migration` + repair SQL + docs | Auto-migrate in CI | `scripts/verify-storefront-migration.ts`, `prisma/sql/ensure-storefront-followup-columns.sql` | P1 |
| First-party beacon | Gated by `firstPartyAnalyticsMode` + header; marketing still uses consent mode | Privacy expectations | P1 | API 403/404 + client ingest helper | Server cannot fully prevent forged POSTs | `app/api/storefront/analytics`, `lib/storefront/storefront-first-party-ingest.ts`, SEO form | P1 |
| Actions vs services | Forms, redirects, test orders, theme URL assert, fulfillment JSON shape moved to services | Maintainability | P2 | Thin actions call services | Full DDD | `services/storefront/*`, `actions/*` | P2 |
| Theme preview | Split components under `components/storefront/theme/` | Admin UX | P2 | Asset / preset / layout / contrast | Full WYSIWYG page builder | Theme admin page | P2 |
| QA matrix | Manual + unit tests for helpers | Release confidence | P1 | `STOREFRONT_PRODUCTION_POLISH_QA_MATRIX.md` + vitest | Browser E2E for consent | `tests/unit/storefront-production-polish.test.ts` | P1 |

**Deferred (honest):** multi-leg redirect resolution, geofenced delivery enforcement, automatic zone surcharges in checkout, legal interpretation of consent strings, forged first-party POST hardening beyond headers.

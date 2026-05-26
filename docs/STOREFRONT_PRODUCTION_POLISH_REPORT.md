# Storefront production polish report

**Completed (this pass)**

- Audit: `docs/STOREFRONT_PRODUCTION_POLISH_AUDIT.md`
- Docs split: forms, domain, advanced, fulfillment engine, analytics dashboard, analytics consent, theme preview, checkout UX, redirect tracking, Prisma notes, service layer, QA matrix (this file set)
- Redirects: `STOREFRONT_REDIRECTS_ENABLED` + middleware → `resolve-redirect` + `hitCount` increment; `lib/storefront/storefront-redirects.ts`, `services/storefront/storefront-redirect-service.ts`, admin honesty + test link
- Fulfillment: expanded types/aliases, zone-aware minimums, window cap, method restrictions, product cutoffs, surcharge warning-only; delivery validated before rules in `actions/storefront-order.ts`
- Prisma: `firstPartyAnalyticsMode` column + migration; repair SQL updated; `scripts/verify-storefront-migration.ts` + `npm run verify:storefront-migration`
- First-party analytics: SEO select + API gating + `storefront-first-party-ingest` + layout JSON + consent banner copy
- Services: forms, submissions, redirects, test orders, theme assert, fulfillment JSON guard
- Theme: `components/storefront/theme/*` + dashboard page wired
- Tests: `tests/unit/storefront-production-polish.test.ts`

**Commands run:** `npx prisma generate`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run verify:storefront-migration`, `npm run build`

**Honest limitations**

- First-party POST consent uses client header (best-effort, not tamper-proof).
- Redirect engine resolves one hop only.
- `DELIVERY_ZONE_SURCHARGE` does not change totals.
- Product same-day cutoff uses “today” in storefront TZ vs fulfillment date — documented in engine doc.

**Next PR suggestion:** E2E Playwright for consent + checkout smoke on staging; optional rate limit on `/api/storefront/analytics`.

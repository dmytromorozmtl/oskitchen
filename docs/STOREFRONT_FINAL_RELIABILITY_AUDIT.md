# Storefront final reliability audit

Scope: security, analytics consent, redirects, migrations, CI/E2E maturity. **No legal advice.**

| Topic | Current state | Risk | Required fix | Defer | Affected areas | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| First-party ingest | HMAC token when secret set; `STOREFRONT_ANALYTICS_STRICT_INGEST` requires token + secret. Non-strict allows header-only consent. | Forged events in non-strict mode if attacker bypasses browser | Enable strict in production; rotate signing secret | Rate limiting / edge WAF | `app/api/storefront/analytics/route.ts`, signing libs, layout JSON | P0 |
| Consent | Marketing tags gated in `StorefrontConsentAndMarketingScripts`; FP mode via `firstPartyAnalyticsMode` + cookie. | Misconfiguration leaks tags | Admin SEO settings + QA matrix | Full legal review | `components/storefront/storefront-consent-banner.tsx`, layout | P0 |
| Analytics abuse | No server-side rate limit; small JSON body. | DB noise / cost | Add proxy rate limits or queue later | Advanced bot mitigation | API route | P1 |
| Playwright | `e2e/storefront.spec.ts` probes slug or uses `E2E_STOREFRONT_SLUG`; skips if no storefront. | Regressions on public routes | Run against staging with slug var | Full checkout + Stripe live | `e2e/`, `playwright.config.ts` | P2 |
| Redirect middleware | One internal fetch per request; optional chain max 3 via env; sensitive paths blocked by default. | Wrong redirect on pay flows | Keep sensitive guard; test | Multi-tenant custom-domain unified resolver | `middleware.ts`, `services/storefront/storefront-redirect-service.ts` | P0 |
| Custom domain + redirects | Vanity rewrite uses `resolve-host`; redirects use `/s/{slug}` matcher first. | Operator confusion | Advanced UI + docs | Single unified middleware graph | `middleware.ts`, Advanced page | P2 |
| Redirect chain | `STOREFRONT_REDIRECT_FOLLOW_CHAIN=true` enables depth cap. | Loop / over-redirect | `visited` set + loop helper | Arbitrary depth | `storefront-redirect-service.ts` | P2 |
| Migration `firstPartyAnalyticsMode` | Migrations + repair SQL + verify scripts; Prisma compat extension for lagging DBs. | Drift | `verify:storefront-db` before deploy | Auto-heal | `scripts/verify-storefront-migration.ts`, `prisma/sql/*` | P1 |
| Import regression | Static test + `verify:storefront-actions` script. | TS runtime ReferenceError in actions | CI step | Broader AST lint | `actions/storefront-pillar-settings.ts`, tests | P2 |
| CI | `prisma generate`, verify migration, verify action imports, typecheck, lint, test, demo scenarios, build. | Broken deploy | Keep order | Default CI E2E against live server (needs DB) | `.github/workflows/ci.yml` | P1 |
| Staging smoke | Documented commands + QA matrix. | Human error | Run matrix before release | Automated nightly | `docs/STOREFRONT_FINAL_RELIABILITY_QA_MATRIX.md` | P2 |

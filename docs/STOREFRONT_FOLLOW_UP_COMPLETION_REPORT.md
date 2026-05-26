# Storefront follow-up completion report

## Summary

Implemented the storefront follow-up backlog: structured forms (admin + public wiring), domain verification service and UI, advanced management (redirects, fulfillment rules JSON, test orders), analytics reporting dashboard, analytics ingest normalization, fulfillment rule `active` column + checkout filtering, Stripe currency alignment surfacing on Ordering, SEO consent fields, theme URL/contrast checks, checkout UX additions (terms/privacy, checkout_submit beacon), cart/order confirmation beacons, multi-brand scope copy on Overview, and supporting documentation.

## Commands run

```
npm run typecheck
npm run lint
npm run test
npm run build
```

## Key files

- Forms: `actions/storefront-forms.ts`, `app/dashboard/storefront/forms/**`, `components/storefront/forms/*`, `app/api/storefront/form-submissions-export/[formId]/route.ts`
- Domains: `services/storefront/storefront-domain-verification-service.ts`, `actions/storefront-domains.ts`, `components/storefront/domains/*`
- Advanced: `actions/storefront-advanced.ts`, `app/dashboard/storefront/advanced/page.tsx`
- Analytics: `services/storefront/storefront-analytics-report-service.ts`, `app/dashboard/storefront/analytics/page.tsx`, `app/api/storefront/analytics/route.ts`
- Fulfillment: `prisma/schema.prisma` (`StorefrontFulfillmentRule.active`), `lib/storefront/fulfillment-rules.ts`, migration append
- Theme: `lib/storefront/theme-validation.ts`, `components/storefront/theme-*.tsx`

## Remaining limitations

- Edge redirect middleware for `StorefrontRedirect` not enabled globally (latency/product choice).
- Fulfillment engine does not yet cover every speculative rule type from the product brief; unknown types surface warnings.
- Theme image probe does not `HEAD` remote URLs (browser `<img>` preview only).
- Prisma migrate shadow issues may still require manual `migrate deploy` in some dev DBs.

## Recommended next PR

- Hardened migration path for existing databases (`prisma migrate`) and optional `HEAD` checks for theme URLs.
- Rich form builder (non-JSON) if merchants reject raw JSON.

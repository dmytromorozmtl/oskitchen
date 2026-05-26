# Storefront QA checklist

## Smoke (every release)

- [ ] `/s/{slug}` loads when `enabled` + `published`.
- [ ] Draft: unpublished visible to owner only with session.
- [ ] Menu shows only `storefrontVisible` products.
- [ ] Product resolves by UUID **and** by `publicSlug` when configured.
- [ ] Add to cart → checkout → submit pay-later order.
- [ ] Confirmation page shows notes when provided.
- [ ] Disabled storefront → 404.
- [ ] Unpublished (guest) → 404.
- [ ] Policies `/policies/privacy` + `/policies/terms` render.
- [ ] Sitemap returns 200 with product URLs.
- [ ] Promo: valid code reduces total or waives delivery; invalid code errors.
- [ ] Blackout date blocks checkout for that calendar day.
- [ ] Honeypot: filling `companyUrl` does not create submission.

## Automated

- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `npm test` (unit: resolver, blackout, middleware paths)

## E2E (when CI stable)

- Playwright: full guest checkout path on seed tenant.

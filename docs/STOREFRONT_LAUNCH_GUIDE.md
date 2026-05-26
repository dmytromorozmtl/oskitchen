# Storefront launch guide

1. **Menus** — create and activate a weekly menu with sellable products.
2. **Storefront → Overview** — set `publicName`, `storeSlug`, branding, toggles, `activeMenuId`, publish when ready.
3. **Products tab** — set optional URL slugs, hide items not meant for web, set max quantities if needed.
4. **Fulfillment** — confirm pickup/delivery, fees, cutoff, closures; add blackout rows via SQL/admin UI when available.
5. **SEO** — fill `seoTitle` / `seoDescription`; verify `/s/{slug}/sitemap.xml`.
6. **Domains** — choose mode; complete Vercel + DNS manually; use recheck tools when implemented.
7. **Test order** — place a preorder as a guest; verify Order Hub + email (if Resend on).
8. **Go live** — enable storefront, publish, share `/s/{slug}` or vanity URL.

Rollback: disable storefront toggle → public 404 immediately.

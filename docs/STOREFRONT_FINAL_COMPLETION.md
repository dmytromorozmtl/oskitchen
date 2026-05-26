# Storefront — Final completion

## Scope

- `app/s/[storeSlug]/layout.tsx` — navigation, footer, checkout path handling, optional design tokens behind feature flag.
- `StorefrontNavigation` / `StorefrontFooter` — validated links, fallbacks, safe href handling.
- Theme — **draft vs published** JSON; checkout must consume **published** snapshot only.
- Sections — schema-driven content (e.g. slider with a11y); avoid raw JSON in merchant-facing editor over time.
- Assets — real provider only when env configured; otherwise honest “setup required” state.
- **i18n** — EN/FR foundation for nav/footer strings (incremental).
- **Security** — strong HTML sanitizer for rich content; never trust merchant HTML unchecked.
- **SEO** — metadata from published pages and business context.

## Rules

- Do not break checkout routes.
- Do not fake storage uploads.
- Staff **publish** gated by storefront builder permissions (server + UI).

## Related tests

- `tests/unit/storefront-next-pass.test.ts` (and successors) for checkout protection and link validation.

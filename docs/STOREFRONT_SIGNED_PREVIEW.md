# Storefront signed preview

## Behavior

- `POST /api/storefront/preview-token` (authenticated owner) mints a signed token and sets HttpOnly cookie `kos_sf_preview`.
- `getStorefrontForPublicFromRequest` reads the cookie and allows **unpublished** storefronts when the token matches the slug and owner.
- Admin **Preview** tab uses `StorefrontPreviewFrame` to call the API before loading the iframe.

## Secrets

- Prefer `STOREFRONT_PREVIEW_SECRET` (≥16 chars). Falls back to `AUTH_SECRET` if long enough.
- Never expose secrets to the client; token is opaque base64url.

## Limits

- Cookie TTL ~15 minutes.
- Query-string `previewToken` from the original mega-spec is **not** implemented; cookie-based same-origin preview is the supported MVP.

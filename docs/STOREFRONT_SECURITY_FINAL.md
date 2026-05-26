# Storefront security — final reference

## Guarantees targeted

- **Disabled storefront** → public loader returns 404 (`getStorefrontForPublic`).
- **Unpublished** → 404 for guests; owner preview when session `userId` matches `StorefrontSettings.userId`.
- **Checkout** — all business rules re-validated server-side in `submitPublicStorefrontOrder` (never trust client totals).
- **Tenant scope** — admin mutations must use `requireSessionUser` + `updateMany`/`findFirst` with `userId` / `menu.userId` guards.
- **Domain middleware secret** — `STOREFRONT_MIDDLEWARE_SECRET` header on resolve-host API.

## Placeholders / next work

- Rate limiting on public POST endpoints (contact, checkout, analytics).
- CAPTCHA / Turnstile for high-risk tenants.
- `StorefrontRedirect` enforcement to avoid open redirects (validate `toPath`).

## Honeypot

- Contact/catering forms include hidden `companyUrl` honeypot; bots that fill it get a silent success without DB write.

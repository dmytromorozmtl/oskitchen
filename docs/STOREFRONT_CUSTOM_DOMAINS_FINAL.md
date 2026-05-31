# Storefront custom domains — final checklist

OS Kitchen records desired domains in `StorefrontSettings` and `StorefrontDomain`. **You must still attach the hostname in your hosting provider (e.g. Vercel) and configure DNS at the registrar.**

## Path mode (default)

- Public URLs: `https://{APP}/s/{storeSlug}/…`
- No DNS work beyond your main app domain.

## Subdomain mode

- Set `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN` to your apex (e.g. `kitchenos.com`).
- DNS: wildcard `*.kitchenos.com` → Vercel (or provider-specific target).
- Vercel: add wildcard domain to the project.
- OS Kitchen: set `subdomain` + `primaryDomainMode=SUBDOMAIN`.

## Custom apex / www

- Add `customDomain` in admin; follow DNS instructions shown (CNAME for `www`, apex A/ALIAS notes).
- Vercel: add both apex and `www` if needed; wait for certificate issuance.
- Verification tokens are stored for manual TXT-style checks — **no automatic propagation**.

## Security

- Middleware secret `STOREFRONT_MIDDLEWARE_SECRET` must match API route header.
- Never expose that secret to the browser.

See also: `docs/STOREFRONT_CUSTOM_DOMAINS.md` (longer narrative).

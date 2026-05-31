# Storefront custom domains

OS Kitchen **does not** automatically provision DNS or TLS. You must:

1. Add the hostname to your deployment (e.g. Vercel **Project → Domains**).
2. At your DNS provider, create the records your host instructs (commonly `CNAME` to `cname.vercel-dns.com` for subdomains, or `A`/`ALIAS` for apex).
3. Store the hostname in `StorefrontSettings.customDomain` (and/or `StorefrontDomain` rows when you use the verification workflow UI later).
4. Set `STOREFRONT_MIDDLEWARE_SECRET` in the deployment environment.
5. Set `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN` for `*.root` subdomain routing.

Middleware maps allowed paths on the custom host to `/s/[slug]/...`. Admin routes (`/dashboard`, `/login`, etc.) are **not** rewritten on custom hosts.

## Wildcard subdomains

Point `*.yourdomain.com` to your hosting, add the wildcard domain in Vercel, and set `NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN=yourdomain.com`. The first DNS label becomes the store slug candidate.

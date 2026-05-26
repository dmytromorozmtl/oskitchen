# Storefront wildcard DNS (Phase 6)

## Vercel setup

1. Add apex domain in Vercel project → **Domains**.
2. Add wildcard: `*.your-root-domain.com` (same project).
3. DNS at registrar:
   - `A` / `CNAME` apex → Vercel
   - `CNAME` `*` → `cname.vercel-dns.com` (or Vercel instructions)

## App env

```bash
NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN=your-root-domain.com
NEXT_PUBLIC_APP_URL=https://your-root-domain.com
STOREFRONT_MIDDLEWARE_SECRET=<32+ chars>
```

## Market hosts

| Pattern | Example | Resolution |
|---------|---------|------------|
| Composite | `hello-weekday.root.com` | `storeSlug=hello`, `marketId=weekday`, cookie `kos_market` |
| Custom `hostSubdomain` | `weekday.root.com` | Set on market in dashboard |

Middleware calls `resolveMarketFromHostLabel` and sets `kos_market` cookie on rewrite.

## Lighthouse (staging)

```bash
LHCI_VANITY_HOSTS=hello-weekday.staging.your-root-domain.com npm run lighthouse:storefront
```

## Pilot QA

```bash
npm run storefront:seed-phase2-hello
# Expect: https://hello-weekday.<ROOT>/menu shows weekday market
```

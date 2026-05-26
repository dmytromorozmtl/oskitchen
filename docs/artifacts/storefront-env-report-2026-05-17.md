# Storefront environment report

| Field | Value |
|-------|-------|
| Generated (UTC) | 2026-05-17T14:09:32.055Z |
| Target | production |
| Loaded files | .env, .env.local, .env.production.local |
| Critical | FAIL (1) |
| Warnings | 1 |

## Checks

| Status | Level | Variable | Detail |
|--------|-------|----------|--------|
| ✓ | critical | DATABASE_URL | Set |
| ✓ | warning | DIRECT_URL | Set (migrations) |
| ✓ | critical | NEXT_PUBLIC_APP_URL | xn---production-xijza32a.vercel.app |
| ✓ | critical | STOREFRONT_MIDDLEWARE_SECRET | ≥32 chars |
| ✓ | critical | CRON_SECRET | Set |
| ✓ | critical | AUTH_SECRET / NEXTAUTH_SECRET | Set |
| ✗ | critical | RESEND_API_KEY | Required for team invites and order emails |
| ✓ | critical | RESEND_FROM_EMAIL | Set |
| ✓ | warning | Supabase public keys | Set |
| ⚠ | info | Turnstile (checkout + contact) | Optional — rate limits still apply; set keys for prod hardening |
| ⚠ | warning | NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN | Set for brand/market vanity hosts (e.g. kitchenos.com) — required before wildcard DNS |
| ✓ | info | STOREFRONT_REDIRECTS_ENABLED | true — middleware uses redirect table |
| ✓ | info | Storefront media bucket | Storage provider configured |
| ✓ | warning | Preview signing | STOREFRONT_PREVIEW_SECRET or AUTH_SECRET usable |

> Secret values are never printed. Set variables in Vercel → Settings → Environment Variables.

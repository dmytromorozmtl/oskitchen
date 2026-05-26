# Storefront environment report

| Field | Value |
|-------|-------|
| Generated (UTC) | 2026-05-17T12:57:29.733Z |
| Target | production |
| Loaded files | .env, .env.local, .env.production.local |
| Critical | FAIL (1) |
| Warnings | 0 |

## Checks

| Status | Level | Variable | Detail |
|--------|-------|----------|--------|
| ✓ | critical | DATABASE_URL | Set |
| ✓ | warning | DIRECT_URL | Set (migrations) |
| ✗ | critical | NEXT_PUBLIC_APP_URL | Use https:// for production (not http://localhost) |
| ✓ | critical | STOREFRONT_MIDDLEWARE_SECRET | ≥32 chars |
| ✓ | critical | CRON_SECRET | Set |
| ✓ | critical | AUTH_SECRET / NEXTAUTH_SECRET | Set |
| ✓ | warning | Supabase public keys | Set |
| ⚠ | info | Turnstile (checkout + contact) | Optional — rate limits still apply; set keys for prod hardening |
| ✓ | info | STOREFRONT_REDIRECTS_ENABLED | true — middleware uses redirect table |
| ✓ | info | Storefront media bucket | Storage provider configured |
| ✓ | warning | Preview signing | STOREFRONT_PREVIEW_SECRET or AUTH_SECRET usable |

> Secret values are never printed. Set variables in Vercel → Settings → Environment Variables.

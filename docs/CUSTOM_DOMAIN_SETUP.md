# Custom domain setup

> Do **not** hardcode a customer domain in code — always use `NEXT_PUBLIC_APP_URL` and Supabase/Stripe dashboards.

## Recommended domain patterns (examples only)

- `app.yourbrand.com` — dashboard host
- `yourbrand.com` — marketing + redirects

Illustrative names (pick your own registrar):

- `kitchenos.app`, `getkitchenos.com`, `kitchenflow.app`, `prepflow.io`

## Vercel

1. Project → **Domains** → add apex and/or `www`.
2. DNS:
   - Apex: A/ALIAS per Vercel instructions
   - Subdomain: CNAME to `cname.vercel-dns.com`
3. Enable **HTTPS** (automatic).
4. Configure **www** redirect to canonical host (or vice versa) in Vercel.

## Application env

- Set `NEXT_PUBLIC_APP_URL=https://YOUR_CANONICAL_HOST` for **Production**.

## Supabase Auth

- Update **Site URL** + **Redirect URLs** to include the new domain.

## Stripe

- Add production webhook endpoint using the new domain.
- Update Checkout `success_url` / `cancel_url` implicitly via `SITE_URL` derived from env.

## Resend

- Verify DNS for the **sending** domain used in `RESEND_FROM_EMAIL`.

## Canonical & OG

- Marketing pages should use `metadataBase` + `alternates.canonical` driven from env (`SITE_URL` / page-level URLs).
- OG images: host under `/public` or absolute URLs on the same canonical domain.

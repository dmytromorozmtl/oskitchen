# Storefront limitations (current iteration)

Last updated: Phase 9 hardening pass.

## Shipped (no longer limitations)

- Visual page/section builder, theme publish snapshots, and navigation/footer editor.
- Hosted Stripe Checkout for guests when Stripe Connect is configured (`storefront-stripe-connect`).
- Server-authoritative cart API (`/api/storefront/cart`) — on by default; set `STOREFRONT_SERVER_CART=0` to disable.
- Brand vanity hosts + `kos_brand` cookie (Phase 9) for theme/SEO without repeat DB on every RSC.
- Multi-store admin switcher + team invite audit CSV + 90-day retention cron.
- Domain recheck cron: `/api/cron/storefront-domain-recheck` (weekly in `vercel.json`).
- Launch publish gates: navigation + theme snapshot + valid sections block theme publish and public "Published" toggle.

## Active limitations

| Area | Status |
|------|--------|
| Custom domain automation | Cron rechecks DNS/HTTP; no full SSL provisioning UI |
| Form file uploads | Not implemented — text fields only |
| Markets in DB | Markets live in `settingsCenterJson` (not a Prisma table); `?market=` + cookie routing |
| Market on order row | Market context stored in cart/session; order `source` is `storefront` (market id in cart flow via catalog API) |
| Theme A/B experiments | Off unless `STOREFRONT_EXPERIMENTS_ENABLED=1` |
| Rate limiting | Checkout, contact, cart, analytics — not every admin route |
| Middleware vanity paths | Whitelist in `middleware-paths.ts`; unknown paths on vanity hosts may 404 |
| Turnstile | Optional — rate limits still apply without keys |

## Ops (not code)

- Vercel deploy + `STOREFRONT_SMOKE_BASE_URL` for prod sign-off artifact
- Wildcard DNS `*.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN`
- `RESEND_API_KEY` + verified sender for invites and order email

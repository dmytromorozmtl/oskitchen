# Launch-ready report

_Generated template — update after QA._

## What is ready

- Next.js app with dashboard modules (orders, production, packing, analytics, billing shell, settings).
- Environment validation (`lib/env.ts`) + Developer env health (Owner).
- Prisma migrations including **Beta applications**.
- Marketing surfaces: homepage, pricing, solutions, integrations hub, legal templates, beta form.
- Webhook routes for Stripe/Shopify/Woo/Uber paths (verify signatures per provider).
- CSV exports API + Settings entry point.
- Documentation pack in `/docs/*` for deploy + billing + email + webhooks.

## What is not ready / varies by tenant

- Live Uber Eats / Uber Direct without partner credentials (**Partner access required**).
- Full transactional email suite — depends on Resend templates wired per event.
- Advanced observability (Sentry) — optional placeholder documented.

## Real integrations status

| Integration | Status |
|-------------|--------|
| WooCommerce | Ready when merchant credentials + secret configured |
| Shopify | Ready when app + secret configured |
| Uber Eats | Requires partner-approved credentials |
| Uber Direct | Requires Uber Direct approval |

## Simulated features

- Demo workspaces and synthetic orders — always labeled in UI when demo flag enabled.

## Environment variables required

See **`docs/ENVIRONMENT_VARIABLES.md`** — minimum prod blockers include DB URLs, Supabase keys, `NEXT_PUBLIC_APP_URL`, `ENCRYPTION_KEY`.

## Deployment steps

1. Merge to production branch.
2. `npm run db:deploy` against production `DIRECT_URL`.
3. Set Vercel env vars (`docs/VERCEL_DEPLOYMENT.md`).
4. `npm run build` green in CI.
5. Configure Stripe webhook + domain DNS.

## Launch blockers

- Missing encryption key in prod.
- Incorrect DB URLs (pooler vs migrate).
- Stripe webhook secret mismatch.

## Beta launch checklist

See **`docs/PRODUCTION_CHECKLIST.md`**.

## First 7 days action plan

1. Onboard 3–5 beta kitchens with weekly check-ins.
2. Monitor webhook failures daily.
3. Fix top UX papercuts from feedback.
4. Ship one email template (welcome or order confirmation).

## First 30 days roadmap

1. Harden integration retries + alerting.
2. Complete transactional email coverage.
3. Add Sentry + uptime probes.
4. Publish case study from best beta customer.

# Production deployment audit

KitchenOS inventory for GitHub + Vercel + Supabase + Stripe + Resend. Priorities: **blocker** · **high** · **medium** · **low**.

| Area | Current status | Production risk | Recommended fix | Priority |
|------|----------------|-----------------|-----------------|----------|
| **package.json scripts** | `build` runs `prisma generate && next build`; `db:*`, `check`, `production-check` present | Drift between CI and local | Run `npm run production-check` in CI | medium |
| **Next.js config** | `next.config.ts`: images remotePatterns, serverActions 4mb | Misconfigured asset hosts | Add domains when using external CDN logos | low |
| **Prisma config** | Single datasource with `url` + `directUrl` | Migration/runtime mismatch | Keep pooler on `DATABASE_URL`, direct on `DIRECT_URL` | blocker |
| **Supabase config** | Middleware + server clients use public keys | Session fixation if redirects wrong | Configure Site URL + redirect allowlist | high |
| **Env validation** | `lib/env.ts` Zod; prod throws on invalid core env | Boot failures opaque | Keep `.env.example` synced | high |
| **Middleware** | Session refresh; prod 503 if Supabase unset on `/dashboard` | Misconfigured deploy | Set `NEXT_PUBLIC_SUPABASE_*` in Vercel | blocker |
| **Auth redirects** | Login/signup redirect logged-in users to dashboard | Onboarding skip edge cases | Test `/onboarding` with partial profiles | medium |
| **Stripe routes** | `/api/checkout`, `/api/billing-portal` gated when Stripe missing | Revenue blocked | Set keys + price IDs; UX banners added on billing page | high |
| **Webhook routes** | Stripe signature verified; others provider-specific | Forged payloads | Audit each handler; log failures | high |
| **Cron routes** | GET+POST `/api/cron/reminders`; Bearer `CRON_SECRET` | Open cron if secret missing | Set `CRON_SECRET` in Vercel (auto Bearer) | high |
| **Resend** | Emails skip when key missing | Silent no-email | Domain verify + monitor | medium |
| **Integrations** | WooCommerce/Shopify/Uber adapters | Misleading “live” UI | Honest launch labels + Developer health | high |
| **Logging** | `lib/logger` redaction | Secret leakage | Never log raw bodies | medium |
| **Demo mode** | `DEMO_MODE_ENABLED` gates demo **import/reset** in production | Accidental prod wipe | Keep flag off unless supervised beta | blocker |
| **Public pages** | Marketing + legal + beta form | Compliance copy | Legal review before claims | medium |
| **Security pages** | `/legal/*` templates | Over-claiming | Mark as templates | low |
| **Seed scripts** | CLI only (`prisma/seed.ts`) | N/A if no public route | Do not add unauthenticated seed APIs | low |
| **Local-only values** | Fallbacks in `lib/env.ts` / `SITE_URL` default localhost | Wrong URLs in prod build | Set `NEXT_PUBLIC_APP_URL` on Vercel | blocker |
| **Hardcoded localhost** | Defaults only in `lib/env.ts`, `lib/constants.ts` | Client bundles show localhost if env unset | Enforce env on Vercel Production | high |
| **Hardcoded secrets** | Policy: none in repo; `production-check` scans `sk_live` | Key exposure | Rotate if leaked — `docs/SECRET_ROTATION_PLAN.md` | blocker |
| **DATABASE_URL** | Must be Supabase pooler in prod | Connection exhaustion / prepared stmt issues | Follow `docs/PRISMA_SUPABASE_PRODUCTION.md` | blocker |
| **DIRECT_URL** | Must be direct Postgres for migrate | Failed migrations | Run `db:deploy` with direct URL | blocker |

See also: `docs/PRODUCTION_READY_REPORT.md`, `docs/SECRET_ROTATION_PLAN.md`.

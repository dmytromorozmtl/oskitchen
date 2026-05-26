# KitchenOS — Launch readiness audit

Snapshot for production deployment (Vercel + Supabase + Stripe + Resend). Status reflects **codebase intent**; verify against your live project before launch.

Legenda: **Blocker** · **High** · **Medium** · **Low**

| Area | Status | Launch risk | Required action | Priority |
|------|--------|-------------|-----------------|----------|
| Environment variables | Validated in `lib/env.ts` (Zod); prod throws on invalid core DB/Supabase | Misconfiguration breaks deploy or billing | Set all vars in Vercel; use `.env.example`; review `docs/ENVIRONMENT_VARIABLES.md` | Blocker |
| Prisma schema | Present; Beta applications added | Schema drift vs DB | Run `npm run db:deploy` on prod after merge | Blocker |
| Migrations | Multiple migrations in repo | Failed migrate blocks prod | Use pooled `DATABASE_URL` + direct `DIRECT_URL`; see `docs/DATABASE_DEPLOYMENT.md` | Blocker |
| Supabase Auth | Integrated via `@supabase/ssr` | Weak redirect/session handling | Confirm email templates, redirect URLs, site URL | High |
| Supabase database | Postgres via Prisma | Pooler vs migrate mismatch | Documented URLs; avoid running migrate against pooler-only URL | Blocker |
| RLS / server-side access | App uses server checks + Prisma (verify policies in Supabase for any direct client usage) | Data leaks if RLS misapplied | Audit tables exposed to anon key; prefer service role only on server | High |
| Stripe billing | Checkout + portal routes; webhook route | Revenue + entitlement drift | Configure products/prices/webhook; see `docs/STRIPE_LAUNCH_SETUP.md` | High |
| Resend emails | Helpers gated when API key missing | Silent email failures | Domain verify + sender; see `docs/EMAIL_SETUP.md` | Medium |
| Vercel deployment | `vercel.json` + Next 15 | Cold starts, timeouts | Set env, branch, domain; see `docs/VERCEL_DEPLOYMENT.md` | Blocker |
| Cron jobs | `/api/cron/reminders` pattern | Unauthorized triggers | Set `CRON_SECRET`; restrict Vercel cron | High |
| Webhooks | Stripe, Shopify, WooCommerce, Uber paths | Replay/forgery | Verify signatures; log failures; see `docs/WEBHOOKS_PRODUCTION.md` | High |
| Integrations | Architecture + demo/simulated paths | Misleading “connected” UI | Use launch labels + Developer page; see `docs/INTEGRATION_LAUNCH_STATUS.md` | High |
| Secrets | Never log raw secrets | Compliance incident | Use `lib/logger.ts` redaction; rotate on leak | Blocker |
| Logging | `lib/logger.ts` wrapper | Blind prod debugging | Add correlation IDs incrementally; optional Sentry | Medium |
| Error handling | Route-level + toast patterns vary | Poor UX on failures | Normalize API errors; avoid leaking stack to clients | Medium |
| Onboarding | Flow exists | Drop-off / stuck users | Test signup → onboarding → dashboard; document email confirm | High |
| Demo mode | Flags + demo routes | Confusion vs production | Banner + simulated labels; no secret deps | Medium |
| Performance | PDF lazy-loaded in packing | Large bundles elsewhere | Charts lazy load where heavy; pagination on tables | Medium |
| Mobile UX | Dashboard `pb-24` etc. | Kitchen iPad friction | Spot-check Order Hub, production board, packing | Medium |
| Landing page | Homepage + pricing + solutions | Conversion | SEO + CTAs; integrations hub linked | Medium |
| Sales demo flow | `/demo/*`, solutions | Weak narrative | Follow `docs/DEMO_SCRIPT.md` | Low |

---

## Consolidated priorities

1. **Blockers:** Production env + DB URLs + migrations + encryption key + canonical `NEXT_PUBLIC_APP_URL`.
2. **High:** Stripe webhook + price IDs, webhook secrets, cron auth, integration honesty in UI.
3. **Medium:** Email domain, observability, mobile polish, analytics/query limits.
4. **Low:** Sales collateral refinements, optional Sentry.

See **`docs/LAUNCH_READY_REPORT.md`** for a go/no-go summary after deployment testing.

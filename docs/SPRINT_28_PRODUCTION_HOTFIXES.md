# Sprint 28 — Production hotfixes (billing + POS + deploy)

**Date:** 2026-05-25

## Symptoms (production)

1. **Billing** — `prisma.billingEvent.create()` → `Null constraint violation on workspace_id`
2. **POS Terminal** — RSC error “POS terminal unavailable” (same root cause on auto-provision writes)
3. **Login** — `workspace.moroz@gmail.com` password reset via E2E bootstrap (see below)

## Root cause

After `workspace_id NOT NULL` on production, several write paths still created rows **without** `workspaceId`:

- `recordBillingEvent` / `ensureBillingCustomer`
- POS auto-setup (`ensurePosTerminalReady` → register/staff create)
- POS checkout audit events (missing `workspaceId`)
- `activationState.upsert()` on dashboard / activation checklist
- `subscription.upsert()` / related billing cache rows (`trialState`, `usageCounter`, `invoiceRecord`)

Some owner accounts could also lack a `Workspace` row (orphan from incomplete onboarding).

## Fixes (code)

| Area | Change |
|------|--------|
| `lib/scope/ensure-owner-workspace.ts` | Auto-create workspace for owner if missing |
| `services/billing/billing-service.ts` | Set `workspaceId` on billing events + customers |
| `services/billing/subscription-service.ts` | Set `workspaceId` on subscription + invoice upserts |
| `lib/activation.ts`, `actions/growth.ts` | Set `workspaceId` on activation checklist state |
| `lib/billing/access.ts`, `services/billing/usage-service.ts` | Set `workspaceId` on trial / usage cache writes |
| `services/pos/*` | `ensureOwnerWorkspaceId` on register, session bootstrap, checkout, shifts |
| `services/staff/staff-service.ts` | `ensureOwnerWorkspaceId` on staff writes |
| `lib/auth.ts` | Fix legacy `ensureAppUser()` bootstrap path to write `workspaceId` on subscription, kitchen settings, activation state |
| `app/dashboard/layout.tsx` | Mark dashboard as `force-dynamic` to prevent build-time Prisma pool exhaustion on private growth pages |
| `app/api/health/route.ts` | Make observability status honest: report `NONE` / `not_configured` when Sentry DSN is absent |
| `e2e/dashboard-auth.spec.ts` | Extend production auth smoke to cover dashboard, billing, menus, and POS without RSC fallback text |
| `lib/marketing/case-studies.ts` | Unified type for `/customers/[id]` + `/case-studies/[slug]` |
| `actions/integrations.ts` + `integration-client-form.tsx` | `ActionResult` (`ok` / `fail`) for deploy typecheck |
| `scripts/deploy-prebuilt-prod.sh`, `vercel.json` | Fast cleanup + faster prebuilt Vercel packaging |

## Password for `workspace.moroz@gmail.com`

Bootstrap script sets a **new** password in `.env.e2e.local` (gitignored):

```bash
npm run e2e:bootstrap
# or
E2E_BOOTSTRAP_EMAIL=workspace.moroz@gmail.com npx tsx scripts/bootstrap-e2e-credentials.ts
```

Then read:

```bash
grep E2E_LOGIN_PASSWORD .env.e2e.local
```

**Current bootstrap password:** always read `.env.e2e.local` — re-run bootstrap if login fails (Supabase Admin rotates password).

## Deploy

```bash
npm run deploy:prod
```

Post-deploy:

```bash
npm run smoke:production-tenant
PLAYWRIGHT_BASE_URL=https://os-kitchen.com npm run test:e2e:workspace-smoke
```

## Final outcome

- Production redeployed successfully to [https://os-kitchen.com](https://os-kitchen.com)
- `/api/health` → `status: ok`
- `/api/health` now honestly reports observability as `backend: NONE`, `sentryServer.status: not_configured` until DSN is configured
- `npm run smoke:production-tenant` → green
- `PLAYWRIGHT_BASE_URL=https://os-kitchen.com npm run test:e2e:workspace-smoke` → **7/7 passed**
- Fresh production error logs after redeploy → no new `workspace_id` null-constraint errors
- Additional 2026-05-25 follow-up fixed residual dashboard bootstrap error from `ensureAppUser()` and unblocked production deploy by making dashboard routes explicit dynamic SSR
- Additional 2026-05-25 follow-up added authenticated production smoke for `/dashboard`, `/dashboard/billing`, `/dashboard/menus`, `/dashboard/pos/terminal`

## Current next steps

1. Manual visual sign-off on `/dashboard`, `/dashboard/billing`, `/dashboard/pos/terminal`, `/dashboard/menus`
2. Configure real Sentry DSN in Vercel Production, redeploy, verify `sentryServer.status = live`
3. 24–48h monitoring window on Vercel logs / Sentry / health
4. Move priority from hotfixing to GTM: pilots, case studies, deck, GSC

## Manual verify (5 min)

- [ ] Login `workspace.moroz@gmail.com`
- [ ] `/dashboard` — no RSC error / no activation crash
- [ ] `/dashboard/billing` — no RSC error; portal/checkout if Stripe configured
- [ ] `/dashboard/pos/terminal` — loads catalog (not “unavailable”)
- [ ] `/dashboard/menus` — no Prisma P2011

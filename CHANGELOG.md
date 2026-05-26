# Changelog

All notable changes for KitchenOS pilot hardening are documented here.

## [Pilot-19May-Deploy] — 2026-05-19 (Session 16)

### Deployed

- Production `dpl_CSE1mTbAzjDzuyLvtJcwSryYjzKg` → https://os-kitchen.com
- Env audit: `docs/OPS_FINAL_ACTIONS_19MAY.md`
- Verification: health ok, E2E HTTP 5/5, CSP present

### Ops pending (external)

- `UPSTASH_REDIS_REST_TOKEN`, `RESEND_API_KEY` — not in local/Vercel
- Supabase Site URL, GSC, auth E2E, golden path

## [Pilot-19May-Final] — 2026-05-19

### Added

- Dashboard-wide `loading.tsx` / `error.tsx` on all 450 dashboard routes (~453 loading, ~452 error total)
- `docs/OPS_MANUAL_ACTIONS_19MAY.md` — Supabase, Upstash, Resend, Stripe, GSC, E2E, golden path
- Lighthouse baseline (homepage): Performance 81, A11y 100, Best Practices 100, SEO 92

### Deployed

- Production: `dpl_BRJshTUoV5gvWY4SXzayquajEU4Z` → https://os-kitchen.com

## [Pilot-19May] — 2026-05-19

### Added

- Supabase auth health probe with anon key (`lib/observability/supabase-health.ts`)
- Global error boundary (`app/global-error.tsx`) and dashboard `error.tsx`
- Pilot final audit script (`scripts/pilot-final-audit.mjs`)
- GSC setup guide (`docs/GSC_SETUP.md`)
- Final state report (`docs/FINAL_STATE_19MAY2026.md`, `docs/PILOT_KNOWN_ISSUES.md`)

### Fixed

- Production `/api/health` Supabase sub-check (was 401 without apikey)
- Apple touch / PWA manifest icon entries

### Security (sessions 12–13, deployed)

- Auth redirect `?next=` / open redirect hardening, CSP headers, checkout/upload rate limits
- Experiment approve GET→POST confirm flow

## [Pilot-18May] — 2026-05-18

### Added

- Production cron manifest (10 allowed slugs; experimental gated in `runCronRoute`)
- `withWorkspaceScope` / `withOwnerWorkspaceAnd` for tenant-safe Prisma filters
- DSR manual export API (`POST /api/internal/dsr/export`, superadmin + MFA)
- CSRF origin guard (`lib/security/mutation-origin-guard.ts`)
- Pilot release route notice banner on hidden nav URLs
- Ops preflight script (`scripts/ops/pilot-preflight.sh`)
- Pilot ops docs: staging runbook, known issues, monitoring, executive summary

### Changed

- ESLint: `_experiments` imports allowed only under `app/api/cron/**`
- ESLint: `dataUserId` identifier banned in `services/**` (exemptions for `lib/auth`, `lib/supabase`, `lib/scope`)
- CI: blocking `verify-claims`, `prisma validate`, production cron manifest validation
- Executive dashboard, report service, analytics service: aggregation query caps
- Cron gate: experimental routes return 404 in production without `ENABLE_EXPERIMENTAL_CRONS`

### Fixed

- Build blocked by ESLint cron vs `_experiments` import conflict
- Hybrid tenancy helpers unified via `getTenantActor` / `buildOwnerScopedWhere`
- ESLint `dataUserId` rule incorrectly scoped to `actions/**`
- Staging env placeholder test vs Upstash URL validation alignment

### Known issues (pilot)

- `workspaceId` null until staging backfill (ops)
- ~120 experimental cron files on disk but runtime-gated
- Upstash optional until ops configures `RATE_LIMIT_ADAPTER=upstash`
- See `docs/PILOT_KNOWN_ISSUES.md`

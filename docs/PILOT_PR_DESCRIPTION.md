# PR: Pilot Readiness — 18 May 2026

## Summary

Finalizes paid pilot hardening: CI/CD unblock, cron isolation, tenancy helpers, performance caps, security additions (DSR, CSRF), pilot navigation UX, and ops handoff artifacts.

## Changes

- **Security:** CSRF origin guard, DSR export (superadmin + MFA), ESLint tenancy enforcement, cron production gate
- **Stability:** Query aggregation caps, production cron allowlist (10)
- **Pilot UX:** Hidden sidebar modules via `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot`; banner on direct URLs to hidden routes
- **Ops:** `pilot-preflight.sh`, staging runbook, monitoring guide, executive summary

## Testing

- [x] `npm run typecheck` — PASS
- [x] `npm run lint` — PASS (warnings in storefront `_experiments` only)
- [x] `npm test` — 604 passed, 1 skipped
- [x] `npx prisma validate` — PASS
- [x] `npm run build` — PASS (after `npm ci`, Node 22)
- [x] `bash scripts/ops/pilot-preflight.sh` — PASS (with build; use `SKIP_BUILD=1` on low-RAM machines)

## Ops dependencies (post-merge, pre-pilot revenue)

- [ ] Staging: `workspace:backfill:all` after DBA sign-off
- [ ] Staging/production: `RATE_LIMIT_ADAPTER=upstash`
- [ ] Vercel Cron: only `ALLOWED_PRODUCTION_CRON_PATHS`
- [ ] `NEXT_PUBLIC_NAV_RELEASE_PROFILE=pilot`
- [ ] `ENABLE_EXPERIMENTAL_CRONS` **unset**
- [ ] `npm run test:e2e:pilot` on staging

## Rollback

1. Revert Vercel deployment
2. Do not revert DB migrations without DBA
3. See `docs/PILOT_STAGING_RUNBOOK.md`

## Related docs

- `docs/PILOT_READINESS_18MAY.md`
- `docs/PILOT_STAGING_RUNBOOK.md`
- `docs/PILOT_KNOWN_ISSUES.md`
- `docs/PILOT_EXECUTIVE_SUMMARY_18MAY.md`
- `docs/CTO_FIXES_APPLIED.md`
- `CHANGELOG.md`

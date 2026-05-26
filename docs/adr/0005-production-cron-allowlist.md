# ADR 0005: Production cron allowlist

**Status:** Accepted  
**Date:** 2026-05-24

## Context

135 cron route folders exist; only 14 are product-critical in production. Leaked `CRON_SECRET` could trigger experimental jobs.

## Decision

- `services/cron/production-manifest.ts` — single allowlist (`ALLOWED_PRODUCTION_CRON_SLUGS`)
- `vercel.json` schedules only allowlisted paths
- CI: `validate-production-crons.ts`, `validate:cron-inventory`
- Non-allowlisted routes require `ENABLE_EXPERIMENTAL_CRONS=true`

## Consequences

**Positive:** Fail-closed production surface.  
**Negative:** Experimental crons remain in repo — periodic cleanup recommended; never log `CRON_SECRET`.

## Related

`docs/GTM_EXECUTION_PLAN_24MAY2026.md` SEC-02

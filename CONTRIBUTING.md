# Contributing

KitchenOS is a private product codebase. This guide supports the solo founder and future hires.

## Local setup

1. Node **22** LTS (see `.nvmrc`).
2. Copy `.env.example` → `.env.local` and fill Supabase + database URLs.
3. `npm install`
4. `npm run db:migrate` or `npm run db:deploy`
5. `npm run dev`

## Checks before pushing

```bash
npm run lint
npm run typecheck
npm test
npm run workspace:audit          # human-readable migration status
npm run workspace:audit:gate     # CI: fail if migration regresses
npm run test:coverage            # coverage thresholds in vitest.config.ts
```

For production parity: `npm run production-check` (or `npm run build`).

## Architecture

- **ADRs:** `docs/adr/` — read before large structural changes.
- **GTM / pilots:** `docs/GTM_EXECUTION_PLAN_24MAY2026.md`, `docs/PILOT_ONBOARDING_RUNBOOK.md`.
- **Tenant scope:** use `requireTenantActor()`; never add Prisma queries without `workspaceId` or `userId` in `where` (ESLint `kitchenos/require-owner-scope`).

## Server Actions

Prefer the shared result type:

```typescript
import { success, failure, type ActionResult } from "@/lib/action-result";
```

## Workspace migration

~180 models still need `workspaceId`. Before touching tenant data:

```bash
npm run workspace:audit
npm run workspace:preflight
# Staging only:
npm run workspace:backfill:phase1
```

Lower `scripts/workspace-migration-baseline.json` after each completed phase.

## Style

- Match existing formatting and TypeScript strictness.
- One focused change per PR.
- No secrets in git.

## Observability (optional env)

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Errors + performance traces |
| `SENTRY_TRACES_SAMPLE_RATE` | e.g. `0.1` in production |
| `NEXT_PUBLIC_POSTHOG_KEY` | Product analytics |
| `NEXT_PUBLIC_NPS_SURVEY_URL` | Full NPS Typeform link |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | GSC HTML tag |

See `docs/GSC_SETUP.md` for Search Console.

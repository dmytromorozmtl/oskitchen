# Engineering onboarding — KitchenOS

## Quick start (~5 minutes)

```bash
cp .env.example .env.local   # fill Supabase + DATABASE_URL (no secrets in git)
npx prisma migrate dev
npm run dev
npm test
```

Node **22.x** per `package.json` engines.

## Architecture (10 minutes)

| Layer | Path |
|-------|------|
| Pages / API | `app/` |
| Server actions | `actions/` |
| Domain logic | `services/` |
| Shared libs | `lib/` |
| DB | `prisma/schema.prisma` |

Entry: `middleware.ts` → `lib/supabase/middleware.ts` (auth), storefront vanity host logic.

## Key concepts

- **Tenant scope:** `userId` (owner data) + `requireTenantActor()` → `dataUserId`. Emerging: `workspaceId` — see `docs/WORKSPACE_MIGRATION_PLAN.md`.
- **Permissions:** POS/legacy → `@/lib/permissions`. Workspace matrix → `@/lib/permissions/index`. See `docs/RBAC_MIGRATION_PLAN.md`.
- **Integrations truth:** `lib/capabilities/capability-matrix.ts` — never market above this matrix.
- **IDOR:** Before new mutations, read `docs/IDOR_MUTATION_INVENTORY.md` — use `userId` / `workspaceId` in every `findUnique`.

## Required reading

1. `docs/audit17may.md` — system audit
2. `docs/IDOR_MUTATION_INVENTORY.md` — security mutations
3. `docs/REMEDIATION_STATUS.md` — remediation crosswalk
4. `docs/TESTING.md` — QA

## Forbidden

- Committing `.env` or secrets
- `findUnique({ id })` without tenant scope in tenant actions
- Raising integration status in capability matrix without code proof
- `prisma migrate deploy` to production without runbook approval

## CI

`.github/workflows/ci.yml` — typecheck, lint, unit tests, build, platform-access Playwright smoke.

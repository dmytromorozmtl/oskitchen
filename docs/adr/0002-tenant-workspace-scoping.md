# ADR 0002: Tenant isolation via workspaceId

**Status:** In progress  
**Date:** 2026-05-24

## Context

Early models used `userId` as tenant key. Multi-user workspaces (managers, staff) require `workspaceId` on all business data.

## Decision

- Migrate tenant-scoped models to `workspaceId` with phased Prisma migrations and backfill scripts.
- Enforce via `requireTenantActor()` + `buildOwnerScopedWhere` in actions/services.
- ESLint `kitchenos/require-owner-scope` warns on Prisma queries missing `userId` or `workspaceId`.

## Current state (2026-05-24)

Run `npm run workspace:audit`:

- ~39 models with `workspaceId`
- ~180 models `userId` only (need migration)

## Consequences

Until complete: potential IDOR if new code queries legacy `userId` only. **No new features on unmigrated models without workspaceId.**

## Commands

```bash
npm run workspace:audit
npm run workspace:preflight
npm run workspace:backfill:phase1  # … phase7, phase11 per scripts/
```

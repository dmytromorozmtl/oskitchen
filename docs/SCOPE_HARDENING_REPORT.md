# Scope hardening report

## Added
- `lib/scope/{workspace-scope,org-scope,user-scope}.ts` — assertion helpers + intent comments.
- `services/scope/scope-validation-service.ts` — `userOwnsWorkspace` starter.

## Rules (ongoing)
- Every Prisma query must include tenant predicates; helpers do not replace explicit `where`.
- `/platform/*` remains `requirePlatformAccess` gated.
- Founder email `workspace.moroz@gmail.com` unchanged in `lib/platform-owner.ts`.

## Tests
- `tests/unit/scope-validation-service.test.ts` (mocked prisma).

## Next
- Systematic audit of server actions for `workspaceId` vs `userId` fallback — phased.

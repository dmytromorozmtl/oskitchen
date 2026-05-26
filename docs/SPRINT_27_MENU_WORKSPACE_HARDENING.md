# Sprint 27 — Menu workspace hardening + pre-deploy gate

**Date:** 2026-05-24 · **Status:** ✅ code complete

## Unified menu create helper

`lib/products/menu-create-base.ts` — `menuCreateBaseForOwner()` ensures every `Menu.create` has `workspaceId` after NOT NULL.

| Call site | Updated |
|-----------|---------|
| `ensure-catalog-menu.ts` | ✅ |
| `onboarding-service.ensureServiceMenu` | ✅ |
| `actions/onboarding.ts` step 3 | ✅ |
| `services/demo-data.ts` | ✅ |
| `scripts/seed-e2e-pos-fixture.ts` | ✅ |
| `actions/menus.ts` | already had `workspaceId` |

## Pre-deploy orchestrator

```bash
npm run predeploy:verify
```

Runs: typecheck → unit → scope audit → `smoke:production-tenant` → optional authed E2E → `build`.

## Production verification (2026-05-24)

- `smoke:production-tenant` — ✅
- Workspace Playwright on https://os-kitchen.com — **7/7** ✅
- **755** unit tests

## Syntax fixes (CI blockers)

- `actions/pos/tabs.ts` — `ok()` import + bracket fix
- `actions/restaurant/tables.ts` — same

## Deploy

```bash
git push   # Vercel auto-deploy
npm run predeploy:verify
```

## Next (Sprint 28+)

1. Fix remaining `typecheck` errors (if any outside CI paths)
2. Visual smoke sign-off (15 min)
3. Coverage ramp → 60% (phased)
4. GTM: GSC, 3 pilots, legal

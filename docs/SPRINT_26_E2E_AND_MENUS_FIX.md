# Sprint 26 — E2E bootstrap + Menus RSC fix

**Date:** 2026-05-24 · **Status:** ✅ complete

## Critical fix: `/dashboard/menus` crash

**Root cause:** `ensureCatalogMenu()` created `Menu` rows without `workspaceId` after NOT NULL migration → Prisma `P2011`.

**Fix:** `lib/products/ensure-catalog-menu.ts` — resolve workspace, scope lookup, set `workspaceId` on create.

**Verify:**

```bash
npx tsx scripts/debug-menus-page.ts workspace.moroz@gmail.com
PLAYWRIGHT_BASE_URL=https://os-kitchen.com npm run test:e2e:workspace-smoke
```

Deploy this fix to Vercel so new catalog menus work without manual DB seed.

## E2E credentials (no manual password typing)

```bash
npm run e2e:bootstrap          # writes .env.e2e.local (gitignored)
npm run e2e:bootstrap:seed     # + POS fixture
npm run test:e2e:workspace-smoke
```

Uses Supabase Admin to set password on `E2E_BOOTSTRAP_EMAIL` (default: `workspace.moroz@gmail.com`).

## Production E2E results (2026-05-24)

| Spec | Result |
|------|--------|
| Auth setup | ✅ |
| Today | ✅ |
| Orders list + detail | ✅ |
| Menus | ✅ (after catalog menu + code fix) |
| POS terminal | ✅ |
| Storefront `/s/demo` | ✅ |

**753** unit tests.

## Next (Sprint 27+)

1. **Deploy** `ensure-catalog-menu` fix to production
2. Visual sign-off checklist (15 min)
3. Coverage ramp plan → 60%
4. GTM: GSC verify, 3 pilots, legal

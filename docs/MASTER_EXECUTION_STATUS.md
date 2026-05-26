# Master Execution — status

**Updated:** 2026-05-24 · Sprint 27

---

## Sprint 27 ✅

- `menuCreateBaseForOwner` — all Menu.create paths
- `predeploy:verify` script
- POS/tables action syntax fix
- Prod E2E 7/7 · **755** tests

---

## Sprint 26 ✅

- `ensureCatalogMenu` workspaceId fix (menus page crash)
- `e2e:bootstrap` + production workspace E2E 7/7
- **753** unit tests

---

## Sprint 25 ✅

- `smoke:production-tenant` (os-kitchen.com + optional preflight)
- CI a11y auth shell, E2E_LOGIN_PASSWORD fix
- Remote E2E includes workspace-post-not-null-smoke

---

## Sprint 24 ✅

- `smoke:workspace-post-not-null` + `test:e2e:workspace-smoke`
- `workspace:reconcile:duplicates` (+ execute on linked DB)
- Strict owner spot-check fails on foreign orders
- E2E health + platform denial fixes

---

## Sprint 23 ✅

- Workspace-only scope (legacy OR off by default)
- `WORKSPACE_SCOPE_LEGACY_OR=1` emergency rollback
- **748** unit tests · scope audit **0**
- `docs/SMOKE_POST_NOT_NULL_CHECKLIST.md`

---

## Sprint 22

- Full data backfill pipeline (phases 1–11, orphan provision, SQL owner, 12–29)
- NOT NULL migration **applied** on linked DB
- Verify script: tables without `user_id` (Brand, Product, SupportMacro)
- `kitchen-ai` historical orders scoped by `workspace_id`

---

## Sprint 21

- Service scope audit **137 → 0**
- `workspace:audit:services:strict` green
- **747** unit tests

---

## Sprint 20

- P3 scope: **accounting** (7 services), **playbooks**, **onboarding**, **demo audit/seed**
- `lib/scope/workspace-accounting-scope.ts`
- Prod deploy: NOT NULL step → `npx prisma migrate deploy`
- Audit **137** (−42 from 179)
- **747** unit tests green

---

## Sprint 19

- Fixed migration **P3006** (guarded storefront_orders ALTER)
- `prisma:migrate:deploy` + prod deploy script uses deploy (not dev)
- P3 scope: training, templates, platform
- Audit **179** (−25 from 204)
- DB: phases 12–29 migrations applied; NOT NULL blocked until backfill

---

## Next (Sprint 28+)

1. `git push` + `npm run predeploy:verify`
2. Visual smoke sign-off
3. Typecheck debt (ActionResult return types) if CI red
4. GTM: GSC, pilots, legal

See [`NEXT_STEPS_TO_100.md`](NEXT_STEPS_TO_100.md)

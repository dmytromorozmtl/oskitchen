# KitchenOS — план до 100/100

**Обновлено:** 2026-05-25 (Sprint 28 complete)  
**Код / tenant:** **100%** · **Prod hotfix + redeploy:** complete · **Prod smoke:** health OK + tenant smoke OK + workspace smoke **7/7**

---

## Sprint 28 — сделано ✅

- **`ensureOwnerWorkspaceId`** — auto-provision workspace для orphan owners
- **Billing writes** — `billingEvent`, `billingCustomer`, `subscription`, `invoiceRecord`, `trialState`, `usageCounter` теперь пишут `workspaceId`
- **Dashboard activation** — `activationState.upsert()` фикс для `/dashboard`
- **Auth bootstrap hardening** — `ensureAppUser()` больше не создаёт `subscription` / `activationState` без `workspaceId`
- **POS** — register, staff, checkout audit, session bootstrap, shifts
- **Login:** `npm run e2e:bootstrap` → пароль в `.env.e2e.local`
- **Deploy blockers:** case-studies types, integrations/auth/client `ActionResult`, Prisma where-input typing
- **Deploy pipeline hardening:** fast cleanup для `.next.trash.*`, быстрый `vercel build` install command, dashboard marked `force-dynamic` to avoid build-time Prisma pool exhaustion, successful prebuilt production deploy
- **Observability honesty:** `/api/health` now reports real Sentry state (`backend: NONE`, `sentryServer.status: not_configured` when DSN is absent)
- **Smoke honesty:** `smoke:production-tenant` now surfaces `demoMode=true` as `⚠️`, and `smoke:production-tenant:strict` fails on it as a real readiness blocker
- **Targeting honesty:** strict tenant readiness now requires explicit `SMOKE_PREFLIGHT_EMAIL` and ignores `E2E_LOGIN_EMAIL`, so default E2E bootstrap tenants are no longer treated as pilot targets by accident
- **Single truth gate:** `npm run final:100` now consolidates live health, Sentry env presence, tenant smoke, strict pilot target, and manual completion flags into one final readiness verdict
- **Sentry activation helper:** `npm run sentry:production:activate` now prepares/pushes production Sentry envs with dry-run by default
- **Pilot readiness helper:** `npm run pilot:readiness -- --email=owner@pilot.com` now runs DB preflight + hosted strict smoke for one explicit pilot tenant
- **Production result:** [https://os-kitchen.com](https://os-kitchen.com) live, health OK, production tenant smoke green, Playwright workspace smoke **7/7**, auth dashboard smoke green (`dashboard`, `billing`, `menus`, `POS`), fresh prod error logs clear after follow-up redeploy
- Детали: [`SPRINT_28_PRODUCTION_HOTFIXES.md`](SPRINT_28_PRODUCTION_HOTFIXES.md)

---

## Sprint 27 — сделано ✅

- **`menuCreateBaseForOwner`** — единый helper для всех `Menu.create` (onboarding, demo, catalog, POS seed)
- **`npm run predeploy:verify`** — typecheck, unit, audit, prod smoke, E2E, build
- Fix syntax: `actions/pos/tabs.ts`, `actions/restaurant/tables.ts`
- Детали: [`SPRINT_27_MENU_WORKSPACE_HARDENING.md`](SPRINT_27_MENU_WORKSPACE_HARDENING.md)

---

## Sprint 26 — сделано ✅

- **`ensureCatalogMenu`** — `workspaceId` on create (fixes `/dashboard/menus` RSC crash post NOT NULL)
- **`npm run e2e:bootstrap`** — auto `.env.e2e.local` via Supabase Admin
- **Production Playwright** — 7/7 workspace smoke green on https://os-kitchen.com
- **753** unit tests · `tests/unit/ensure-catalog-menu.test.ts`
- Детали: [`SPRINT_26_E2E_AND_MENUS_FIX.md`](SPRINT_26_E2E_AND_MENUS_FIX.md)

---

## Sprint 25 — сделано ✅

- `npm run smoke:production-tenant` — https://os-kitchen.com health, storefront, auth gate, DB preflight
- CI: `a11y-auth-shell`, `E2E_LOGIN_PASSWORD` fix, remote E2E + workspace smoke spec
- Playwright loads `.env.beta.local`
- Детали: [`SPRINT_25_PRODUCTION_QA.md`](SPRINT_25_PRODUCTION_QA.md)

---

## Sprint 24 — сделано ✅

- `npm run smoke:workspace-post-not-null` — оркестратор всех DB + unit + E2E гейтов
- `e2e/workspace-post-not-null-smoke.spec.ts` — Today, Orders, Menus, POS, Storefront
- `scripts/reconcile-duplicate-owner-workspaces.ts` — merge duplicate owner workspaces
- Strict verify: **fail** на `foreign` orders у duplicate workspace
- Исправлены E2E: health contract (`sentryServer` object), `E2E_LOGIN_PASSWORD` в platform denial
- Prod data: 1 duplicate workspace reconciled (`workspace.moroz@gmail.com`)

---

## Sprint 23 — сделано ✅

- **Legacy OR удалён** из default scope (`buildOwnerScopedWhere` → `workspaceId` only)
- Rollback: `WORKSPACE_SCOPE_LEGACY_OR=1` (emergency; БД уже NOT NULL)
- Products scope: `workspaceId` only
- **748** unit tests green (все expectations обновлены под workspace-only)
- `workspace:audit:services:strict` green
- Smoke checklist: [`SMOKE_POST_NOT_NULL_CHECKLIST.md`](SMOKE_POST_NOT_NULL_CHECKLIST.md)
- Детали: [`SPRINT_23_SCOPE_CLEANUP.md`](SPRINT_23_SCOPE_CLEANUP.md)

---

## Sprint 22 — сделано (prod data на linked DB)

| Шаг | Результат |
|-----|-----------|
| `workspace:backfill:all` + phases 12–29 | ✅ core + phase rows |
| `provision-workspace-for-orphan-owners` | ✅ 52 workspace для incomplete signups |
| `backfill-workspace-sql-owner` | ✅ 612+ owner rows |
| Products via menus SQL | ✅ 7 rows |
| `20260525000000_workspace_id_not_null` | ✅ **applied** |
| `workspace:post-backfill:verify` | ✅ 0 NULL (207 tables) |

Новые скрипты: `backfill-workspace-sql-owner.ts`, `provision-workspace-for-orphan-owners.ts`, `workspace-backfill-full.sh`, `backfill-workspace-only-tables.ts`

`workspace-prod-deploy.sh` — полный pipeline (phases 1–11 + orphans + SQL + 12–29 + NOT NULL)

---

## Sprint 21 — сделано

### Scope baseline → **0**

- **137 → 0** suspicious `where: { userId` в `services/`
- `npm run workspace:audit:services:strict` — **green**
- Baseline `scripts/service-userid-scope-baseline.json` → **maxHits: 0**
- Audit: multiline allow для 1:1 (`kitchenSettings`, `subscription`, `billingCustomer`, `copilotSettings`, `storefrontSettings`)
- **48+** service files + новые scope helpers в `workspace-resource-scope.ts`
- **748** unit tests (после Sprint 23)

### CI

`workspace:audit:services:strict` — в `.github/workflows/ci.yml`

---

## Sprint 20 — сделано

### P3 scope wave (accounting · playbooks · onboarding · demo)

| Модуль | Файлы |
|--------|--------|
| **Accounting** | `ap-service`, `ocr-service`, `bank-reconciliation`, `restaurant-pnl`, `pnl-snapshot`, `cash-management`, `vendor-payment` |
| **Playbooks** | `playbook-service.ts` (full KPIs + runs) |
| **Onboarding** | `ensureServiceMenu` scoped |
| **Demo** | `demo-scenario-db-audit-service`, `commercial-demo-seed` |

Новый scope: `lib/scope/workspace-accounting-scope.ts`

**Audit:** 179 → **~135** (−44) · baseline **144** (консервативно)

### Prod deploy fix

- `workspace-prod-deploy.sh` — NOT NULL шаг через `npx prisma migrate deploy` (не shadow `migrate:safe`)

---

## Sprint 19 — сделано

### Migration repair (P3006 shadow)

- `20260207140000_storefront_production_layer` — guarded `ALTER` для `storefront_orders` / `storefront_domains` (IF EXISTS)
- Prod deploy использует **`npx prisma migrate deploy`** (не shadow `migrate dev`)
- `npm run prisma:migrate:deploy`

### P3 scope wave

| Модуль | Статус |
|--------|--------|
| **Training** (full service) | ✅ `workspace-training-scope.ts` |
| **Templates** | ✅ playbooks, applications, module prefs, tasks |
| **Platform** | ✅ integration + webhook health |

**Audit:** 204 → **179** (−25) · **747** tests

### Prod DB (прогресс)

| Шаг | Результат |
|-----|-----------|
| `migrate deploy` phases 12–29 | ✅ применены |
| `20260525000000_workspace_id_not_null` | ❌ **ожидаемо** — есть NULL rows до backfill |
| Следующее | `backfill --execute` → `strict:all` → NOT NULL |

---

## Prod sequence (выполнить сейчас на staging)

```bash
# 1. Миграции (deploy, не dev)
npm run prisma:migrate:deploy

# 2. Backfill
npm run workspace:backfill:phases-12-29 -- --dry-run
npm run workspace:backfill:phases-12-29 -- --execute

# 3. Verify
npm run workspace:strict:all
npm run verify:staff-scope

# 4. NOT NULL только после green verify
npm run workspace:generate:not-null   # если SQL менялся
npm run prisma:migrate:deploy

# Or orchestrator:
npm run workspace:prod:deploy:execute
APPLY_NOT_NULL=1 npm run workspace:prod:deploy:execute   # только если strict:all green
```

---

## Sprint 29+ — следующие шаги (приоритет)

### 1. Manual production sign-off

- Login под owner/superadmin
- `/dashboard` — без RSC error
- `/dashboard/billing` — checkout / portal guards OK
- `/dashboard/pos/terminal` — экран загружается, staff/register present
- `/dashboard/menus` — без Prisma P2011 / пустых fallback-ошибок

Чеклист: [`SMOKE_POST_NOT_NULL_CHECKLIST.md`](SMOKE_POST_NOT_NULL_CHECKLIST.md) + visual 15 min

Unified gate:

```bash
npm run final:100
SMOKE_PREFLIGHT_EMAIL=owner@pilot.com npm run final:100
VISUAL_SIGNOFF_DONE=1 MONITORING_WINDOW_DONE=1 SMOKE_PREFLIGHT_EMAIL=owner@pilot.com npm run final:100
```

### 2. Monitoring window (24–48h)

- `vercel logs --environment production --level error --since 1h`
- `GET https://os-kitchen.com/api/health`
- Sentry / health review каждые 2–4 часа после hotfix deploy
- Приоритетные сигналы: billing, dashboard RSC, POS, onboarding / activation writes

### 3. Real Sentry activation (still open)

- Add `SENTRY_DSN` to Vercel Production
- Optional: add `NEXT_PUBLIC_SENTRY_DSN` for browser events
- Recommended: add `SENTRY_TRACES_SAMPLE_RATE=0.1`
- Dry-run helper: `npm run sentry:production:activate`
- Apply helper: `SENTRY_DSN=https://... npm run sentry:production:activate -- --apply --deploy`
- Redeploy and confirm:
  - `/api/health` → `observability.backend = "SENTRY"`
  - `/api/health` → `sentryServer.status = "live"`
  - Sentry receives a real test event

### 4. Disable demo mode for real pilot tenant

- First choose a real pilot email and pass it explicitly: `SMOKE_PREFLIGHT_EMAIL=owner@kitchen.com npm run smoke:production-tenant:strict`
- Default E2E bootstrap user `workspace.moroz@gmail.com` is demo-oriented and should not be treated as implicit pilot readiness target
- If the chosen real pilot still fails on `Demo mode off`, preview reset with `npm run tenant:demo:reset -- --email=owner@kitchen.com`
- Only if that tenant is intentionally transitioning from demo to pilot: execute approved reset path under supervised flag, then rerun strict smoke

### 5. Полный smoke regression

```bash
npm run smoke:workspace-post-not-null
```

### 6. Prod deploy (если linked DB ≠ production)

```bash
npm run workspace:prod:deploy:execute          # dry-run сначала
APPLY_NOT_NULL=1 npm run workspace:prod:deploy:execute   # только после strict:all green
```

**Orphan workspaces (52 incomplete signups):** решение продукта — удалить / merge / onboarding gate перед prod.

### 7. Prisma schema hardening (опционально, P2)

После NOT NULL в БД — сделать `workspaceId` **required** в `schema.prisma` для core models (отдельная миграция, не блокер).

### 8. QA (next pass)

| # | Действие | Команда / артефакт |
|---|----------|-------------------|
| 1 | E2E verticals (order, POS, storefront) | Playwright |
| 2 | a11y pass (dashboard + storefront) | axe / manual |
| 3 | Coverage ≥ 60% | `npm run test:coverage` |
| 4 | Sentry errors + performance | dashboard |
| 5 | PostHog funnels | `NEXT_PUBLIC_POSTHOG_KEY` |

### 9. GTM (manual — блокирует 100/100 коммерции)

| # | Действие | Документ |
|---|----------|----------|
| 1 | **3 платных пилота** | `docs/pilot-program.md`, `PILOT_ONBOARDING_RUNBOOK.md` |
| 2 | 2 case studies (письменное разрешение) | `docs/sales-deck.md` |
| 3 | GSC verify + 2 blog posts | `docs/GSC_SETUP.md` |
| 4 | Legal (ToS, Privacy, DPA) — юрист | `docs/legal/` |
| 5 | Week 1 gate | `npm run gtm:week1` |

См. также: [`GTM_EXECUTION_PLAN_24MAY2026.md`](GTM_EXECUTION_PLAN_24MAY2026.md), [`WEEK_1_LAUNCH_CHECKLIST.md`](WEEK_1_LAUNCH_CHECKLIST.md)

---

## Definition of Done (100/100)

- [x] Schema 219/219
- [x] P0–P3 priority runtime scoped
- [x] Migration shadow fix + `migrate deploy` path
- [x] Backfill + verify green (linked DB)
- [x] NOT NULL applied (linked DB)
- [x] Audit baseline **0**
- [x] Legacy OR removed (default; env rollback)
- [x] Unit tests aligned with workspace-only scope (**748**)
- [x] Automated smoke orchestrator + Playwright spec (Sprint 24)
- [x] Production HTTP tenant smoke (Sprint 25)
- [x] Duplicate owner workspace reconcile script
- [x] Authed Playwright on production (`e2e:bootstrap` + workspace smoke 7/7)
- [x] Menus RSC fix (`ensureCatalogMenu` + workspaceId)
- [x] Menu workspace hardening (all create paths)
- [x] `predeploy:verify` orchestrator
- [x] Vercel production deploy (`os-kitchen.com`)
- [x] Production tenant smoke after deploy
- [x] Production workspace smoke after deploy (**7/7**)
- [x] Authenticated dashboard smoke after deploy (`dashboard`, `billing`, `menus`, `POS`)
- [x] Honest health reporting for Sentry state
- [x] Honest tenant smoke reporting for demo-mode readiness
- [x] Honest strict smoke targeting (explicit pilot email required)
- [x] Final 100 gate (`npm run final:100`)
- [ ] Visual smoke sign-off (15 min)
- [ ] Real Sentry DSN live in production
- [ ] Real pilot tenant chosen and green in strict smoke
- [ ] 24–48h monitoring window complete
- [ ] QA coverage 60% (phased) · vertical E2E · GTM pilots

---

## Оценка

| Область | Статус |
|---------|--------|
| Tenant schema + NOT NULL (linked DB) | **100%** |
| Runtime scope (services audit) | **100%** (0 hits) |
| Default query scope | **100%** (workspace-only) |
| Prod parity (live deploy + smoke) | **100%** |
| Manual/visual smoke | ⏳ финальный sign-off |
| Observability honesty | **100%** |
| Real Sentry integration | ⏳ missing production DSN |
| Pilot tenant readiness semantics | **100%** |
| Real pilot tenant readiness | ⏳ requires explicit pilot email + strict smoke pass |
| GTM | ~52% |
| QA (coverage, E2E) | ~43% |

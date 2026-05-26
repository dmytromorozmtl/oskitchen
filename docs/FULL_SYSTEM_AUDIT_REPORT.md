# KitchenOS — Full System Audit Report

**Дата:** 18 May 2026  
**Аудитор:** Senior Full-Stack Architect / QA Lead / UX Research  
**Репозиторий:** `/Users/dmytro/Desktop/2026/KitchenOS`  
**Метод:** Статический code review (599 `page.tsx`, 243 API routes, 103 action modules) + production smoke (`os-kitchen.com`) + перекрёстная проверка `docs/audit1712may.md` + выборочный runtime (e2e specs, health endpoints)  
**Ограничение:** Полный ручной клик-тест **каждой** из 599 страниц **не выполнялся**; пилот-критичные маршруты разобраны по коду и цепочкам вызовов. Находки без runtime помечены `CODE_ONLY`.

**Правило аудита:** исправления в ходе отчёта **не вносились** (кроме ранее задеплоенных фиксов: Stripe env, `sb_publishable` anon key, mobile sidebar scroll).

---

## Executive Summary

| Метрика | Значение |
|---------|----------|
| Страниц (`page.tsx`) | **599** |
| API routes (`app/api/**/route.ts`) | **243** (~381 HTTP handlers) |
| Server actions (`actions/**`) | **103** файла, **~618** async exports |
| `loading.tsx` в `app/` | **10** (~1.7% маршрутов) |
| `error.tsx` в `app/` | **10** (~1.7% маршрутов) |
| Найдено проблем (уникальных) | **~47** (CRITICAL: 2, HIGH: 12, MEDIUM: 21, LOW: 12) |

### Общая оценка готовности

| Область | Балл | Комментарий |
|---------|------|-------------|
| Фронтенд | **68/100** | Сильный UI-kit; слабое покрытие loading/error на большинстве маршрутов |
| Бекенд | **72/100** | Prisma + services слой зрелый; неравномерный try/catch |
| Связка фронт–бек | **65/100** | Server actions доминируют; дубли API billing checkout |
| Оптимизация | **70/100** | `take` на списках заказов; 131 cron — ops risk |
| Безопасность | **71/100** | Tenant guards улучшены; публичные write endpoints + GET-mutations |
| Доступность | **66/100** | Labels в формах auth; нет skip-link; частичный focus trap |
| **Общая** | **69/100** | |

### Рекомендация

**Требует доработок перед широким self-serve**, но **допустим controlled paid pilot** (meal-prep / preorder) при закрытии P0/P1: auth redirects, open redirect в callback, Stripe/billing parity, публичный upload, golden-path e2e на staging.

---

## Top 10 Critical / High Issues

1. **P0** — Auth: `?redirect=` / `?next=` игнорируются после login (`actions/auth.ts` + `login-form.tsx`).
2. **P0** — Auth callback open redirect: `next` без `safeInternalNextPath` (`app/auth/callback/route.ts`).
3. **P0** — Дублирование Stripe checkout API без rate limit на `/api/billing/checkout`.
4. **P1** — `storefront/forms/upload` — анонимный upload без rate limit / captcha.
5. **P1** — Experiment approve endpoints — **GET** mutates state по URL token.
6. **P1** — Marketing claims vs `capability-matrix` (SMS, Uber prod, offline POS).
7. **P1** — 131 cron routes — большая поверхность misconfig.
8. **P1** — ~98% страниц без route-level `error.tsx` / `loading.tsx`.
9. **P1** — `signUpAction` без Zod / try/catch (`actions/auth.ts`).
10. **P1** — JWT vs `sb_publishable` anon key — prebuilt deploy должен всегда использовать новый формат (исправлено на prod 18 May; задокументировать в runbook).

---

# ФАЗА 1 — Аудит страниц (пилот-матрица)

Методика для каждой строки: A–F чеклист по исходникам `page.tsx`, layout, client components, связанным `actions/*` и `app/api/*`.

### Сводная таблица по страницам

| # | Страница | Кнопок* | Форм | API/action | Проблем | Статус |
|---|----------|---------|------|------------|---------|--------|
| 1 | `/login` | 2 | 1 | `signInAction` | 0 CRIT, 3 HIGH, 4 MED | ⚠️ MOSTLY_READY |
| 2 | `/signup` | 2 | 1 | `signUpAction` | 0 CRIT, 2 HIGH, 3 MED | ⚠️ MOSTLY_READY |
| 3 | `/dashboard/today` | ~15+ | 0 | services | 0 CRIT, 1 HIGH, 2 MED | ⚠️ MOSTLY_READY |
| 4 | `/dashboard/orders` | ~20+ | 0 | Prisma + table | 0 CRIT, 1 MED, 2 LOW | ✅ READY |
| 5 | `/dashboard/orders/new` | ~10+ | 1+ | `actions/orders` | 0 CRIT, 1 MED | ⚠️ MOSTLY_READY |
| 6 | `/dashboard/orders/[id]` | ~25+ | 1+ | orders services | 0 CRIT, 2 MED | ⚠️ MOSTLY_READY |
| 7 | `/dashboard/pos/terminal` | ~40+ | 0 | `actions/pos` | 0 CRIT, 2 HIGH, 2 MED | ⚠️ MOSTLY_READY |
| 8 | `/dashboard/pos/shifts` | ~12+ | 1+ | pos shift service | 0 CRIT, 1 MED | ⚠️ MOSTLY_READY |
| 9 | `/dashboard/production` | ~15+ | 0 | `actions/production` | 0 CRIT, 1 MED | ⚠️ MOSTLY_READY |
| 10 | `/dashboard/packing` | ~20+ | 1+ | `actions/packing` | 0 CRIT, 1 MED | ⚠️ MOSTLY_READY |
| 11 | `/dashboard/storefront` | ~30+ | несколько | storefront actions | 0 CRIT, 2 HIGH, 3 MED | ⚠️ MOSTLY_READY |
| 12 | `/dashboard/customers` | ~15+ | 1+ | `actions/customers` | 0 CRIT, 1 MED | ⚠️ MOSTLY_READY |
| 13 | `/dashboard/billing` | ~8+ | 0 | billing services | 0 CRIT, 1 MED | ✅ READY |
| 14 | `/dashboard/billing/plans` | 4 | 0 | checkout API | 0 CRIT, 1 MED | ✅ READY |
| 15 | `/dashboard/billing/settings` | 2 | 1 | admin assign | 0 CRIT, 0 HIGH | ✅ READY |
| 16 | `/dashboard/settings` | ~50+ | много | `settings-center` | 0 CRIT, 2 MED | ⚠️ MOSTLY_READY |
| 17 | `/dashboard/reports` | ~10+ | фильтры | report services | 0 CRIT, 2 MED | ⚠️ PARTIAL |
| 18 | `/dashboard/analytics` | ~10+ | 0 | analytics | 0 CRIT, 2 MED | ⚠️ PARTIAL |
| 19 | `/s/[slug]/menu` | ~20+ | 0 | catalog API | 0 CRIT, 1 MED | ✅ READY |
| 20 | `/s/[slug]/checkout` | ~15+ | 1 | storefront-order | 0 CRIT, 2 HIGH, 2 MED | ⚠️ MOSTLY_READY |
| 21 | `/platform/*` | ~100+ | много | platform actions | 0 CRIT, 3 HIGH, 4 MED | ⚠️ MOSTLY_READY |

\*Оценка интерактивных элементов по связанным client components (не полный инвентарь).

---

## 1. `/login` — детальный разбор

**Файлы:** `app/login/page.tsx`, `components/auth/login-form.tsx`, `actions/auth.ts`, `app/auth/callback/route.ts`

### A. Загрузка

| Проверка | Статус |
|----------|--------|
| Консоль без ошибок | ⚠️ REQUIRES_RUNTIME (зависит от `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `loading.tsx` | ❌ Нет |
| `error.tsx` | ❌ Нет |
| Адаптив 375–1440 | ✅ `max-w-md`, `px-4` |
| `Suspense` | ⚠️ `fallback={null}` |

### B–F (кратко)

- **Кнопки:** Sign in (pending state ✅), Theme toggle ✅, ссылки Forgot/Signup ✅.
- **Форма:** HTML5 validation ✅; server Zod ❌; raw Supabase errors ⚠️.
- **API:** `signInAction` — нет try/catch ❌.
- **Связка:** Supabase → `ensureAppUser` → `defaultPostAuthPath` ✅.

### Находки `/login`

#### [HIGH] — `/login` — Query `?redirect=` игнорируется

**Файл:** `actions/auth.ts:29-42`, `components/auth/login-form.tsx:34-38`  
**Проблема:** `signInAction` всегда возвращает `redirectTo` из профиля; клиентский `searchParams.redirect` не используется.  
**Ожидаемое:** Deep link после login (demo, partner).  
**Фактическое:** Всегда `/onboarding` | `/dashboard/today` | `/dashboard/kitchen`.  
**Влияние:** Сломанные маркетинговые и demo flow.  
**Исправление:** Мерж `safeInternalNextPath(formData.get('redirect') ?? …, defaultPath)`.  
**Приоритет:** P1

#### [HIGH] — `/login` — `?next=` не читается

**Файл:** `components/auth/login-form.tsx:37`  
**Проблема:** Ссылки используют `?next=` (`invite`, `partner`), форма — только `redirect`.  
**Исправление:** `searchParams.get("redirect") ?? searchParams.get("next")`.  
**Приоритет:** P1

#### [HIGH] — `/auth/callback` — Open redirect

**Файл:** `app/auth/callback/route.ts:26-33`  
**Проблема:** `next` без `safeInternalNextPath`.  
**Исправление:** `const next = safeInternalNextPath(searchParams.get("next"), "/dashboard/today")`.  
**Приоритет:** P1

#### [MEDIUM] — Нет редиректа для уже авторизованных

**Файл:** `app/login/page.tsx`  
**Исправление:** `if (await getSessionUser()) redirect(defaultPostAuthPath(...))`.  
**Приоритет:** P2

#### [MEDIUM] — Нет `loading.tsx` / `error.tsx`

**Приоритет:** P2

#### [MEDIUM] — Сырые ошибки Supabase в toast

**Файл:** `actions/auth.ts:23`  
**Приоритет:** P2

---

## 2. `/signup` — детальный разбор

**Файлы:** `app/signup/page.tsx`, `components/auth/signup-form.tsx`, `actions/auth.ts`

### A. Загрузка

| Проверка | Статус |
|----------|--------|
| `loading.tsx` / `error.tsx` | ❌ / ❌ |
| Адаптив | ✅ `max-w-lg` |
| Referral cookie | ✅ `kos_ref` из cookies |

### B–C. Форма

| Поле | Валидация client | Server |
|------|------------------|--------|
| fullName | required | trim only |
| companyName | optional | trim |
| email | required, type=email | trim |
| password | required, **minLength=8** | no Zod |

**Кнопки:** Create account — `pending` + disabled ✅.  
**Success:** toast + `router.push(redirect)` — **redirect query работает** (в отличие от login).  
**Email confirm path:** `res.message` toast ✅.

### Находки `/signup`

#### [HIGH] — `signUpAction` без Zod и try/catch

**Файл:** `actions/auth.ts:45-100`  
**Проблема:** `FormData` strings напрямую в Supabase/Prisma; uncaught DB errors.  
**Приоритет:** P1

#### [MEDIUM] — Нет проверки «уже залогинен»

**Файл:** `app/signup/page.tsx`  
**Приоритет:** P2

#### [MEDIUM] — Пароль только minLength 8 на клиенте

**Приоритет:** P3

#### [LOW] — Нет OAuth

**Приоритет:** P3

**Статус страницы:** ⚠️ MOSTLY_READY (при `sb_publishable` key на prod).

---

## 3–18. Dashboard & Storefront (сжатый аудит по паттернам)

### Общие паттерны dashboard

| Паттерн | Наблюдение | Оценка |
|---------|------------|--------|
| Auth guard | `app/dashboard/layout.tsx` → onboarding redirect, `getTenantActor` | ✅ |
| Module gate | `ModuleRouteGate`, `disabledModuleKeys` | ✅ |
| Loading UI | Только **orders, production, packing, pos/terminal, billing** имеют `loading.tsx` | ⚠️ |
| Error UI | Те же + orders `error.tsx` | ⚠️ |
| Mobile nav | `dashboard-shell.tsx` — **flex-1 overflow-y-auto** на Sheet (fix 18 May) | ✅ |
| Desktop nav | `ScrollArea` на sidebar | ✅ |
| Command palette | ⌘K — owner/gtm routes | ✅ |
| Billing trial banner | `TrialBanner`, `BillingAccessGuard` | ✅ |

### `/dashboard/today`

- **Цепочка:** `loadTodayCommandCenter` → widgets (orders, production, alerts).
- **Состояния:** Зависит от `TodayCommandCenterView` — empty states в service-driven cards (CODE_ONLY).
- **Находка [MEDIUM]:** Нет `loading.tsx` — SSR блокирует TTFB при тяжёлом tenant.

### `/dashboard/orders`

- **Список:** `take: DASHBOARD_ORDER_LIST_TAKE`, scoped `orderWhere` ✅.
- **UI:** `OrdersTable` — фильтры/действия в client component.
- **Route UX:** `loading.tsx` + `error.tsx` ✅ (редкий паттерн в проекте).
- **Находка [LOW]:** Пагинация — проверить UI «load more» vs hard cap (CODE_ONLY).

### `/dashboard/orders/new` & `[orderId]`

- **Цепочка:** `actions/orders.ts` + Zod schemas в `@/lib/schemas`.
- **RBAC:** `requireMutationPermission` на мутациях (per audit1712may).
- **Находка [MEDIUM]:** Нет route-level error boundary на `new` и `[orderId]`.

### `/dashboard/pos/terminal`

- **POS:** Server actions, не REST API.
- **Capability:** `pos_offline` NOT_AVAILABLE в matrix — UI должен не обещать offline.
- **Находка [HIGH]:** Offline POS не поддерживается — риск oversell (документация, не баг кода).
- **UX:** `loading.tsx` ✅.

### `/dashboard/production` & `/dashboard/packing`

- **Guards:** `requireMutationPermission` patterns.
- **Packing verify:** отдельный route `packing/verify`.
- **Находка [MEDIUM]:** Status transition rules — в services; REQUIRES_RUNTIME golden path.

### `/dashboard/billing` + `/plans` + `/settings`

- **Plans:** `isStripeCheckoutReady()`, `checkoutDisabled` + `reason` prop ✅ (post-Stripe fix).
- **Checkout API:** POST `/api/billing/checkout` → 401 без сессии на prod ✅.
- **Settings:** `AdminAssignPlanForm` только `isSuperAdminUser` ✅ (security fix).
- **Находка [MEDIUM]:** Два checkout endpoints (`/api/checkout` rate-limited vs `/api/billing/checkout` not).

### `/dashboard/settings`

- **27+ tabs** — `settings-center.ts` с section RBAC.
- **Находка [MEDIUM]:** Высокая когнитивная нагрузка; pilot nav profile скрывает часть модулей, не settings tabs.

### `/s/[slug]/menu` & `/checkout`

- **Menu:** ISR `revalidate = 60`, `notFound()` ✅.
- **Checkout:** `submitPublicStorefrontOrder` — public mutation, Zod + rate limit + Turnstile.
- **Находка [HIGH]:** Financial impact surface — abuse testing required on staging.

### `/platform/*`

- **Guard:** middleware + `requireSuperAdmin` / platform bypass tests in CI.
- **Impersonation:** MFA/TTL (hardened per audit1712may).
- **Находка [HIGH]:** Highest blast radius — REQUIRES_RUNTIME verification after each deploy.

---

# ФАЗА 2 — Критические пути (трейс)

## Путь 1: Аутентификация

| Шаг | Статус | Заметки |
|-----|--------|---------|
| Signup форма | ⚠️ | Работает; нет server Zod |
| Email confirm | ⚠️ | Supabase mailer_autoconfirm=false |
| Login форма | ⚠️ | redirect/next broken |
| Logout | ✅ | `signOutAction` → `/login` |
| Forgot password | ✅ | `resetPasswordAction` + toast |
| OAuth | ❌ | Не в UI |

## Путь 2: Создание заказа

| Шаг | Статус |
|-----|--------|
| Список + take + scope | ✅ CODE |
| New order + Zod | ✅ CODE |
| Detail / edit / cancel | ⚠️ REQUIRES_RUNTIME |
| Table row actions | ⚠️ CODE — в `OrdersTable` |

## Путь 3: POS Terminal

| Шаг | Статус |
|-----|--------|
| Shift check | ⚠️ CODE in pos actions |
| Cart / payment | ⚠️ REQUIRES_RUNTIME |
| Refund | ⚠️ REQUIRES_RUNTIME |
| Offline | ❌ NOT_AVAILABLE per matrix |

## Путь 4: Production → Packing

| Шаг | Статус |
|-----|--------|
| Board load | ⚠️ loading.tsx on production |
| DnD | CODE_ONLY — verify component |
| Status guards | ⚠️ services |

## Путь 5: Storefront Public

| Шаг | Статус |
|-----|--------|
| Menu catalog | ✅ ISR + notFound |
| Cart API | ✅ rate limited |
| Checkout | ⚠️ Stripe + Turnstile |
| Order lookup | ⚠️ token-based |

## Путь 6: Billing

| Шаг | Статус |
|-----|--------|
| Overview | ✅ |
| Plans + Stripe | ✅ post-deploy May 18 |
| Portal | ✅ session required |
| Cancel flow | ⚠️ REQUIRES_RUNTIME |

## Путь 7: Settings

| Шаг | Статус |
|-----|--------|
| Tabs + RBAC | ✅ CODE |
| Save feedback | ⚠️ per-form |
| Dangerous actions | ⚠️ spot-check confirm dialogs |

## Путь 8: Platform

| Шаг | Статус |
|-----|--------|
| Access denial e2e | ✅ in CI |
| Workspaces CRUD | ⚠️ CODE |
| Impersonation | ⚠️ HIGH RISK |

---

# ФАЗА 3 — Кнопки по категориям

## 3.1 Навигация

| Проверка | Статус |
|----------|--------|
| Sidebar links + active state | ✅ `dashboard-nav.tsx` |
| Breadcrumbs | ✅ `DashboardBreadcrumbs` |
| Header profile / logout | ✅ Dropdown + `signOutAction` |
| Mobile menu scroll | ✅ fix 18 May (`flex-1 overflow-y-auto`) |
| Command palette search | ✅ owner-filtered |

## 3.2 Таблицы

| Проверка | Статус |
|----------|--------|
| Пагинация | ⚠️ Inconsistent — many `take` only |
| Сортировка | ⚠️ Per-table |
| Empty state | ⚠️ Component-dependent |
| Bulk actions | ⚠️ Limited surfaces |

## 3.3 Модалки

| Проверка | Статус |
|----------|--------|
| Radix Dialog/Sheet | ✅ |
| Focus trap | ✅ Radix default |
| Body scroll lock | ✅ Sheet |
| Escape close | ✅ |

## 3.4 Upload

| Проверка | Статус |
|----------|--------|
| Dashboard upload actions | ⚠️ `upload.ts` — auth but weak MIME validation |
| Storefront forms upload API | ❌ HIGH RISK |

## 3.5 Toasts (Sonner)

| Проверка | Статус |
|----------|--------|
| Success/error | ✅ Used in auth, forms |
| Retry button | ❌ Rare |
| Max stack | ⚠️ Default sonner |

---

# ФАЗА 4 — API-слой

## 4.1 Статистика `app/api/**`

| Метрика | Значение |
|---------|----------|
| route.ts files | 243 |
| Handlers | ~381 |
| Cron routes | ~130 |
| Webhooks | ~45 |

## 4.2 Сэмпл-аудит (15 маршрутов) — сводка

| Область | Auth | Zod | try/catch | Rate limit |
|---------|------|-----|-----------|------------|
| Billing checkout | ✅ session | ✅ | ✅ | ❌ |
| Billing portal | ✅ | N/A | ✅ | ❌ |
| `/api/checkout` | ✅ | ✅ | partial | ✅ |
| Stripe webhook | signature | N/A | ✅ | N/A |
| Public API orders | API key | ✅ | ❌ | ✅ |
| Storefront cart | public | ✅ | ❌ | ✅ |
| Storefront upload | **weak** | ❌ | ❌ | ❌ |
| Delivery | connection owner | ✅ | ❌ | ✅ |

### [HIGH] — Duplicate Stripe checkout routes

**Файлы:** `app/api/checkout/route.ts`, `app/api/billing/checkout/route.ts`  
**Проблема:** Два пути создания session; только один rate-limited.  
**Приоритет:** P1

### [HIGH] — `storefront/forms/upload` unauthenticated upload

**Файл:** `app/api/storefront/forms/upload/route.ts`  
**Приоритет:** P0/P1

### [HIGH] — GET mutations on experiment approve

**Файлы:** `app/api/storefront/experiment/*/approve/route.ts`  
**Приоритет:** P1

## 4.3 Server actions — сводка

| Метрика | Значение |
|---------|----------|
| Files | 103 |
| Async exports | ~618 |
| `"use server"` | 100% |
| In-file Zod | ~68 files |
| `requireTenantActor` (direct) | ~82 files |
| No try/catch in file | 14 files |

### Top public write surfaces (by design, need hardening)

1. `submitPublicStorefrontOrder` — `actions/storefront-order.ts`
2. `submitPartnerLead` / `submitSalesInquiry` — `actions/external.ts`
3. `submitBetaApplication` — `actions/beta.ts`
4. `submitDemoRequest` — `actions/book-demo.ts`

### [HIGH] — `signUpAction` / `signInAction` validation gap

**Файл:** `actions/auth.ts`  
**Приоритет:** P1

---

# ФАЗА 5 — Оптимизация

## 5.1 Performance

| Проверка | Статус |
|----------|--------|
| Core Web Vitals | ⚠️ REQUIRES_RUNTIME (Lighthouse on prod) |
| Code splitting | ✅ Next.js App Router |
| React cache / unstable_cache | ✅ used in scope helpers |
| N+1 | ⚠️ Reports paths flagged in audit1712may |

## 5.2 Database

| Проверка | Статус |
|----------|--------|
| Indexes | ✅ Prisma schema extensive |
| Pagination take | ✅ orders list, many services |
| Select projection | ✅ `orderListSelect` etc. |
| Transactions | ✅ critical mutations |

## 5.3 Frontend bundle

| Проверка | Статус |
|----------|--------|
| next/image | ⚠️ Mixed — marketing better than dashboard |
| next/font | ✅ |
| Bundle analyzer | ⚠️ Not run in this audit |
| Prebuilt deploy | ✅ ~4 min local + ~2 min upload |

---

# ФАЗА 6 — Безопасность

| Проверка | Статус | Evidence |
|----------|--------|----------|
| IDOR / tenant | ⚠️ MOSTLY_FIXED | `getTenantActor`, IDOR inventory v1.3 |
| XSS | ⚠️ | `dangerouslySetInnerHTML` — spot check needed |
| CSRF | ✅ | Server Actions + SameSite cookies |
| Secrets in repo | ✅ | .env gitignored; staging template only |
| Rate limiting | ⚠️ | Adapters exist; not universal |
| CORS | ⚠️ | API routes default Next |
| CSP | ❌ | Not found in next.config (CODE_ONLY) |
| Billing admin UI | ✅ | superadmin only May 2026 |
| Platform guard | ✅ | e2e in CI |
| Open redirect | ❌ | auth callback |

---

# ФАЗА 7 — Доступность (A11Y)

| Проверка | Статус |
|----------|--------|
| Form labels | ✅ Auth forms |
| Button accessible names | ✅ Most shadcn buttons |
| Images alt | ⚠️ Marketing — verify per page |
| Keyboard nav | ✅ Radix components |
| Skip to content | ❌ Not found |
| Heading hierarchy | ⚠️ Mixed on marketing |
| Focus visible | ✅ shadcn focus rings |
| Color contrast | ⚠️ REQUIRES_RUNTIME audit |

---

# Приложение A — Production smoke (18 May 2026)

| Endpoint | Result |
|----------|--------|
| `GET /login` | 200 |
| `GET /signup` | 200 |
| `GET /api/health` | `status: ok` |
| `POST /api/billing/checkout` (no cookie) | 401 — Stripe configured |
| Supabase auth (sb_publishable key) | 400 invalid credentials — key valid |

---

# Приложение B — Рекомендуемый план исправлений (отдельный этап)

### P0 (до pilot)

1. Fix auth redirect/`next` + callback `safeInternalNextPath`
2. Consolidate billing checkout + rate limit
3. Harden `storefront/forms/upload`
4. Change experiment GET approve → POST

### P1 (первая неделя pilot)

5. Add Zod + try/catch to `actions/auth.ts`
6. Route-level `error.tsx` for top 10 dashboard routes
7. Login/signup logged-in redirect
8. E2E golden path: signup → onboarding → order → billing checkout

### P2 (post-pilot)

9. Skip-link + a11y pass on auth/marketing
10. Bundle analyzer budget
11. Prune/document experimental crons

---

# Приложение C — Связанные документы

- `docs/audit1712may.md` — CTO audit 17 May (baseline)
- `docs/PILOT_100_PERCENT_READY.md` — pilot checklist
- `docs/IDOR_MUTATION_INVENTORY.md` — mutation security
- `lib/capabilities/capability-matrix.ts` — honest feature flags
- `scripts/auth-debug-toolkit.sh` — Supabase/Vercel diagnostics

---

*Конец отчёта. Следующий шаг: отдельный PR-трек «Audit P0 fixes» без смешивания с feature work.*

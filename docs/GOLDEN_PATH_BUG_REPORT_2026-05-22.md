# Golden Path — Production Bug Report

**Дата:** 2026-05-22  
**Production:** https://os-kitchen.com  
**Метод:** Playwright E2E + HTTP smoke на production (без исправлений в коде)  
**Тестовые аккаунты:** `golden-path-*@kitchenos-test.com` (созданы в ходе прогона)

---

## Сводка

| Шаг | Статус | Критичных багов |
|-----|--------|-----------------|
| 1 Signup | ⚠️ | 1 |
| 2 Email confirm | ⚠️ | 1 |
| 3 Onboarding | ❌ | 2 |
| 4 Dashboard Today | ✅ | 0 |
| 5 Create product | ⚠️ | 1 |
| 6 POS order | ❌ | 1 |
| 7 Production | ⚠️ | 1 |
| 8 KDS | ⚠️ | 0 (не проверено bump — нет заказов) |
| 9 Billing | ⚠️ | 1 |
| 10 Storefront | ✅ | 0 |

**Всего задокументировано:** 8 багов / несоответствий спецификации

---

## Баги

### 1. Step 1 — Регистрация

- **URL:** https://os-kitchen.com/signup  
- **Описание:** После «Create account» показывается toast «Welcome to KitchenOS», через ~8 с редирект на `/onboarding`. Сообщения **«Check your email»** нет — email-подтверждение в production, похоже, отключено (мгновенная сессия Supabase).  
- **Ожидание:** Сообщение «Check your email» и подтвержение адреса до первого входа (как в golden path spec).  
- **Скриншот:** не требуется  

---

### 2. Step 2 — Подтверждение email

- **URL:** https://os-kitchen.com/login (обходной вход после admin `email_confirm`)  
- **Описание:** Письмо с ссылкой в golden path **не проверялось** (нет доступа к `kitchenos-test.com` inbox). При регистрации пользователь сразу попадает в onboarding без шага confirm. Для аккаунтов с обязательным confirm: ссылка из Supabase Admin `generateLink` ведёт на `https://<project>.supabase.co/auth/v1/verify?...&redirect_to=https://os-kitchen.com/auth/callback` — redirect host корректный (не localhost).  
- **Ожидание:** Письмо с ссылкой на `https://os-kitchen.com/auth/callback?code=...`, после клика — `/dashboard` или `/onboarding`, пользователь залогинен.  
- **Примечание:** Требуется ручная проверка реального письма в production.  

---

### 3. Step 3 — Onboarding (критично)

#### 3a. Continue не переключает шаг

- **URL:** https://os-kitchen.com/onboarding  
- **Описание:** На шаге **Business profile** после выбора страны (US), Restaurant и нажатия **Continue** появляется toast **«Saved»**, но экран **остаётся на Business profile**. Переход на **Operating model** возможен только вручную по pill «Operating model» в прогресс-баре.  
- **Ожидание:** После Continue автоматический переход на следующий шаг без клика по pills.  

#### 3b. Country — не `<select>`

- **URL:** https://os-kitchen.com/onboarding (Business profile)  
- **Описание:** **Country** реализован как searchable combobox (`type="search"` + hidden input), а не нативный `<select>`. **Currency** и **Timezone** — нативные `<select>` (OK). Без выбора страны hidden `country` пустой — сохранение может не продвинуть flow.  
- **Ожидание:** Country / Currency / Timezone — выпадающие списки (select), как в чеклисте golden path.  

---

### 4. Step 4 — Dashboard Today

- **URL:** https://os-kitchen.com/dashboard/today  
- **Описание:** Страница загружается, заголовок **«Today»**, sidebar с 13 ссылками на `/dashboard/*`. Ошибок блокирующих нет.  
- **Ожидание:** OK  

---

### 5. Step 5 — Создание продукта

- **URL:** https://os-kitchen.com/dashboard/products  
- **Описание:** При пропуске onboarding (или без выбора Restaurant + country) workspace остаётся в режиме **MEAL_PREP**: кнопка **«Add menu item»**, диалог **«New meal»**, toast **«Meal created»** (не «Product created»). После создания «Test Burger» ($12, MAINS) товар **отображается** в каталоге, но с полем **«Prep May 21»** (meal-prep UX на пути Restaurant/Daily).  
- **Ожидание:** Для Restaurant + Daily: заголовок **«New product»**, toast **«Product created»**, без Prepared date / Pickup date / Portion / Reheating.  
- **Связь:** Блокируется багом 3a (onboarding не завершается нормально без ручных pills + выбор country).  

---

### 6. Step 6 — POS (критично для golden path)

- **URL:** https://os-kitchen.com/dashboard/pos/terminal  
- **Описание:** Новый trial-аккаунт на плане **Starter** видит paywall: *«Counter sales… available on Pro plans and above (or while trialing with billing access)»* — **терминал недоступен**, тайлов продуктов 0. Checkout через POS **невозможен** без апгрейда до Pro.  
- **Ожидание:** На trial оператор может открыть POS, добавить «Test Burger», оплатить Cash, заказ появляется в `/dashboard/orders`.  
- **Примечание:** Copy обещает доступ «while trialing», но `canUseFeature(..., "pos_terminal")` требует план **PRO** даже при активном local trial (`lib/plans/feature-registry.ts`).  

---

### 7. Step 7 — Production

- **URL:** https://os-kitchen.com/dashboard/production  
- **Описание:** Заголовок **«Prep List & Production»**, нет секции **«Today's Queue»** (режим не `DAILY_SERVICE` / `WALK_IN_DAILY` из-за незавершённого onboarding). Заказов в очереди нет (POS заблокирован).  
- **Ожидание:** Для Daily Service — **Today's Queue**, заказ Test Burger в очереди, bump → Ready.  

---

### 8. Step 8 — Kitchen Display (KDS)

- **URL:** https://os-kitchen.com/dashboard/kitchen  
- **Описание:** Страница **«Kitchen Display»** загружается. Bump / звук **не проверялись** — нет активных заказов из-за блокировки POS.  
- **Ожидание:** Заказы в KDS, BUMP, звуковое оповещение.  

---

### 9. Step 9 — Billing

- **URL:** https://os-kitchen.com/dashboard/billing  
- **Описание:** План **Starter**, статус **Trialing**, Stripe configured. Поля **«Trial days remaining»** и **«Trial ends»** показывают **«—»** при активном trial.  
- **Ожидание:** Отображаются оставшиеся дни trial (14) и дата окончания.  

- **URL:** https://os-kitchen.com/dashboard/billing/plans  
- **Описание:** 4 плана (Starter, Pro, Team, Enterprise), кнопки **Choose Pro** активны, редирект на **Stripe Checkout** работает. Сообщений «Stripe price IDs missing» / «Stripe not configured» **нет**.  
- **Ожидание:** OK (кроме trial dates на overview).  

---

### 10. Step 10 — Storefront

- **URL:** https://os-kitchen.com/s/hello  
- **Описание:** HTTP 200, hero загружается, в футере **«Made with OS-Kitchen»**. Хардкода «Welcome» / «Tell guests what you offer» **не обнаружено**. На странице есть **2× `animate-pulse`** (возможные skeleton-элементы — не блокер).  
- **Ожидание:** OK  

- **URL:** https://os-kitchen.com/s/hello/menu  
- **Описание:** Продукты и цены видны (например **$12.00**).  
- **Ожидание:** OK  

- **URL:** https://os-kitchen.com/s/hello/checkout  
- **Описание:** Форма checkout загружается (HTTP 200).  
- **Ожидание:** OK  

---

## Что прошло без багов

- Health API: `ok`  
- Signup/login без `email rate limit` / `Invalid API key`  
- Stripe Checkout с `/dashboard/billing/plans`  
- Публичный storefront `/s/hello`, `/menu`, `/checkout`  
- Dashboard Today после onboarding skip  

---

## Рекомендуемый порядок исправлений (для команды, не выполнялось в QA)

1. **Onboarding auto-advance** после Continue (`router.refresh` + `stepIndex`)  
2. **POS на trial** или исправление copy + entitlements  
3. **Trial dates** на billing overview  
4. **Country UX** / defaults при signup  
5. Повторный прогон golden path после фиксов  

---

## Артефакты

- Скрипт автоматизации (только документирование): `scripts/run-golden-path-prod-qa.ts`  
- Запуск: `npx tsx scripts/run-golden-path-prod-qa.ts` (нужны `.env.local` Supabase keys для step 2)

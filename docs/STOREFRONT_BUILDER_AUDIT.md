# Storefront Builder — детальный аудит (состояние кода OS Kitchen)

Цель: зафиксировать **фактическое** поведение перед эволюцией в «конструктор витрины» (Shopify/Woo-уровень **по управляемости**, не по объёму кода). Источник истины — репозиторий `app/dashboard/storefront/*`, `app/s/[storeSlug]/*`, `prisma/schema.prisma`, `lib/storefront/*`.

---

## 1. Админ: Theme (`/dashboard/storefront/theme`)

| Аспект | Текущее поведение | Ограничение кастомизации | UX | Технический риск | Улучшение | Приоритет |
| --- | --- | --- | --- | --- | --- | --- |
| Поля | URL лого/favicon/hero/cover, hex цветов, `fontFamily`, строки `themePreset` / `layoutPreset` | Нет визуального «применить пресет» в одно нажатие (только ключ в поле) | Понятно для технарей; слабо для мерчанта | Небезопасные URL режутся на сервере (`assertStorefrontThemeUrlsSafe`) | Галерея пресетов + «Применить к черновику» + токены в CSS vars на публичной витрине | P1 |
| Превью | `ThemeAssetPreview`, `ThemePresetPreview`, `ThemeLayoutPreview`, `ThemeContrastCheck` | Превью не = пиксель-перфект публичной страницы | Достаточно для sanity | Зависимость от загрузки CDN | Добавить mobile frame + сравнение с live | P2 |
| Токены | Цвета лежат в `StorefrontSettings`, не в отдельной таблице версий | Нет draft/publish темы | Любое Save = live (кроме draft storefront `published`) | Случайная поломка контраста checkout | Ввести `StorefrontThemeVersion` или JSON draft на settings | P1 |

**Файлы:** `app/dashboard/storefront/theme/page.tsx`, `actions/storefront-pillar-settings.ts`, `services/storefront/storefront-theme-service.ts`, `components/storefront/theme/*`.

---

## 2. Админ: Pages (`/dashboard/storefront/pages`, `/pages/[pageId]`)

| Аспект | Текущее поведение | Ограничение | UX | Риск | Улучшение | Приоритет |
| --- | --- | --- | --- | --- | --- | --- |
| Модель | `StorefrontPage` + `StorefrontSection` (enum `StorefrontSectionType`, JSON `contentJson`) | Редактор секций = **сырой JSON** + формы add/move/delete | Тяжело для не-разработчика | Ошибки JSON → redirect с `sectionError` | Визуальный редактор полей по `schemaForSectionType` | P1 |
| Типы секций | HERO, TEXT_BLOCK, FAQ, … (`lib/storefront/sections.ts`) | Нет IMAGE_SLIDER как отдельного типа | — | Дублирование с будущим слайдером | Новый enum + миграция + renderer | P2 |
| Публикация | `published` boolean на странице | Нет версионности контента | — | Откат вручную | Версии или history table | P3 |

**Файлы:** `app/dashboard/storefront/pages/*`, `actions/storefront-pages.ts`, `lib/storefront/sections.ts`.

---

## 3. Админ: Menu / Products / Ordering / Settings / SEO / Preview / Launch / Website

| Раздел | Назначение | Builder-зазор |
| --- | --- | --- |
| Menu | Привязка активного меню, каталог | Нет layout-опций сетки/карточки на публичной `/menu` (жёсткая вёрстка) | P2 |
| Products | Видимость, цены, изображения продукта | Нет «product page template» | P2 |
| Ordering | Pay-later / Stripe, валюта | Не трогать при builder-изменениях | P0 |
| Settings | Slug, контакты, публикация | Частично пересекается с «глобальными токенами» | P2 |
| SEO | Consent, пиксели, `firstPartyAnalyticsMode` | Per-page SEO частично на `StorefrontPage` | P2 |
| Preview | Админ превью + signed preview | Нет multi-viewport iframe | P2 |
| Launch | Чеклист готовности | Нет единого «quality score» | P2 |
| Website | Общие настройки сайта | — | P3 |

---

## 4. Публичная витрина `/s/[storeSlug]/*`

### 4.1 Главная (`app/s/[storeSlug]/page.tsx`)

- Жёсткая композиция: hero из `heroImageUrl`, блок «This week's picks» из `activeMenu.products`.
- **Нет** подключения `StorefrontPage` типа HOME или глобальных секций.
- **Ограничение:** нельзя переставить секции без изменения кода.
- **Приоритет:** P1 — ввести «home template» из секций или отдельной страницы-шаблона.

### 4.2 Layout (`app/s/[storeSlug]/layout.tsx`)

- Header: **захардкоженные** ссылки (Home, Menu, Cart, About, …).
- Модель `StorefrontNavigation` **существует в Prisma**, но **не читается** в публичном layout.
- **Ограничение:** «header builder» в БД без рендера = мёртвые данные.
- **Приоритет:** P1 — `getStorefrontNavigation` + fallback на дефолтные ссылки.

### 4.3 Footer (`StorefrontPublicFooter`)

- Нужно сверить с `StorefrontFooter.blocksJson` (скорее всего частично или не связано).
- **Приоритет:** P1 — единый источник правды.

### 4.4 Кастомные страницы `/p/[pageSlug]`

- Рендер контента из `contentJson` + секции (нужно подтвердить в `p/[pageSlug]/page.tsx` — в аудите зафиксировать как «проверить при реализации»).

### 4.5 Медиа

- `StorefrontAsset`: url + kind + label — **лёгкая** модель, мало метаданных (нет mime/size/storageKey).
- Загрузок нет без storage.
- **Приоритет:** P1 расширить модель + UI; P0 не ломать URL-тему.

---

## 5. Prisma: релевантные модели (уже есть)

- `StorefrontSettings` — основной «глобальный» слой.
- `StorefrontPage` / `StorefrontSection` — контент + секции.
- `StorefrontNavigation` — `itemsJson` (одна запись на storefront).
- `StorefrontFooter` — `blocksJson`.
- `StorefrontTheme` — `themeJson` (пользовательские сохранённые темы? не интегрировано в публичный рендер по умолчанию).
- `StorefrontAsset` — библиотека URL.

**Вывод по Phase 3 ТЗ:** не дублировать `StorefrontPageSection` — **расширять** существующее. Новые таблицы (`StorefrontThemeVersion`, `StorefrontMediaAsset`) оправданы только если JSON на settings упирается в лимиты/индексацию — иначе **JSON draft + версия в отдельной таблице**.

---

## 6. Доступность и контраст

- Есть `ThemeContrastCheck` в админке.
- Публично: переменные `--store-accent` и др.; систематической AA-проверки на всех блоках нет.
- **Приоритет:** P2 — quality checker + блокировка publish при критичных контрастах (опционально).

---

## 7. Мобильная адаптивность

- Tailwind responsive в публичных страницах; нет админского device preview.
- **Приоритет:** P2.

---

## 8. SEO per page

- `StorefrontPage.seoTitle`, `seoDescription`, slug, `published`.
- Нет OG image per page в модели (можно в `contentJson` — задокументировать).
- **Приоритет:** P2.

---

## 9. Риски P0 (не ломать при builder-работах)

1. Checkout + Stripe + pay-later.
2. Существующие маршруты `/s/[storeSlug]/*`.
3. Валидация URL темы и безопасность медиа.
4. Суперадмин `workspace.moroz@gmail.com` (не трогать логику доступа).

---

## 10. Рекомендованная последовательность внедрения (кратко)

1. Подключить `StorefrontNavigation` / `StorefrontFooter` к публичному layout (данные + fallback).
2. Ввести design tokens → CSS variables на layout витрины (без смены разметки секций сразу).
3. Расширить `StorefrontAsset` + Media admin + опциональная загрузка при bucket.
4. Визуальный редактор секций поверх существующих zod-схем.
5. Theme versioning / draft.
6. Слайдер как новый `StorefrontSectionType` + безопасный renderer.

---

## 11. Что сознательно отложено (честно)

- Полный drag-and-drop как Elementor без серьёзной архитектуры состояния.
- Произвольный HTML от мерчанта без sanitization pipeline.
- Загрузка видео без транскодинга/CDN политик.

---

## Связанные новые файлы (архитектурный задел)

- `lib/storefront-builder/*` — типы, токены, пресеты, реестр секций, safe URL/text.
- `services/storefront-builder/*` — тонкие сервисы (часть — заглушки с заметками для publish/preview).
- `app/dashboard/storefront/media`, `builder` — новые админ-страницы.

Дальнейшие детали по подсистемам — в тематических документах `docs/STOREFRONT_*` этого PR.

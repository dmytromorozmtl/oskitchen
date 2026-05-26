# Storefront Builder — модель данных (факт + целевое расширение)

## Уже в Prisma (использовать в приоритете)

| Модель | Назначение |
| --- | --- |
| `StorefrontSettings` | Глобальные поля витрины, палитра, пресеты-строки, SEO/marketing. |
| `StorefrontPage` | Кастомные страницы + `seoTitle` / `seoDescription` / `published`. |
| `StorefrontSection` | Секции страницы: `type` + `contentJson`. |
| `StorefrontNavigation` | `itemsJson` — задумано под меню шапки. |
| `StorefrontFooter` | `blocksJson` — задумано под колонтитул. |
| `StorefrontAsset` | Простая библиотека URL. |
| `StorefrontTheme` | JSON темы на уровне пользователя (интеграция с live — TBD). |

## Предложение из ТЗ (когда JSON недостаточен)

1. **`StorefrontThemeVersion`** — если нужны черновики/откат без копирования всего `StorefrontSettings`. Поля как в миссии (`designTokensJson`, `headerJson`, …). Связь: `storefrontSettingsId`, статус enum.
2. **`StorefrontMediaAsset`** — **или** расширить `StorefrontAsset` колонками `mimeType`, `sizeBytes`, `storageKey`, `source`, `status` (меньше таблиц = проще миграции).
3. **`StorefrontNavigationMenu`** — **или** хранить несколько меню в `itemsJson` как массив меню с `location` (без новой таблицы на первом этапе).
4. **`StorefrontPageSection`** — **не добавлять**, если достаточно `StorefrontSection` (избегаем дублирования).

## Правила миграций

- Только additive FK на `StorefrontSettings`.
- Публичный рендер: feature-flag или «если JSON пуст — legacy layout».
- Документировать откат: удаление колонок не автоматизировать.

## Связанный код

- `lib/storefront-builder/design-tokens.ts` — логический слой токенов поверх settings.
- `docs/STOREFRONT_BUILDER_AUDIT.md` — пробелы navigation/footer.

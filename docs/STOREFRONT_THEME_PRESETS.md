# Storefront Theme Presets

## Реализовано

- Константы: `lib/storefront-builder/theme-presets.ts` — **8** пресетов (Modern Minimal, Warm Bakery, Premium Catering, Fresh Meal Prep, Café Classic, Ghost Kitchen Dark, Organic Market, Bold Restaurant).
- Каждый пресет несёт полный `DesignTokens` (цвета, типографика, layout, components).
- Админ: карточки пресетов на `/dashboard/storefront/theme` с отображением id и градиента палитры.
- Сервис: `services/storefront-builder/theme-service.ts` — `listThemePresets`, `resolveDesignTokensForStorefront`.

## Применение

- Сохранить `themePreset` в `StorefrontSettings` (строковое поле уже есть).
- Публичный layout: следующий шаг — `designTokensToCssVars` на корневой wrapper витрины (не сломав checkout).

## Roadmap

- «Применить» в один клик + запись в draft-версии темы.
- Сравнение «текущие overrides vs пресет».

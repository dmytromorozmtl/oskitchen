# Page Builder & Sections

## Реализовано сейчас

- Enum `StorefrontSectionType` + `lib/storefront/sections.ts` (zod схемы, defaults, `normalizeSectionContent`).
- Реестр для админ UX: `lib/storefront-builder/section-registry.ts`.
- Валидация-обёртка: `lib/storefront-builder/section-validation.ts` / `services/storefront-builder/section-service.ts`.

## Gap

- Админ UX всё ещё JSON-ориентирован (`pages/[pageId]`).
- Публичный рендер секций на кастомных страницах нужно держать синхронным с админкой.

## План типов из ТЗ

Добавлять новые значения enum + `defaultSectionContent` + **публичный** `components/storefront/sections/<Type>.tsx` + регистрация в renderer.

Слайдер (`IMAGE_SLIDER`) — отдельный документ `docs/STOREFRONT_SLIDER_BUILDER.md`.

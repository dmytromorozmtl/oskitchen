# Storefront Builder — отчёт о выполнении (этот PR)

## Сделано

1. **Аудит:** `docs/STOREFRONT_BUILDER_AUDIT.md` — детальный разбор текущего кода и пробелов (RU/EN смешанный технический стиль по запросу).
2. **Архитектура:** `lib/storefront-builder/*` — типы, design tokens, 8 theme presets, layout presets, section registry, validation bridge, safe URL/text helpers, media-config.
3. **Сервисы:** `services/storefront-builder/*` — theme resolve/list, media list, page-builder registry export, section validate re-export, preview/publish заметки (без фейковой логики).
4. **Админ UI:** `/dashboard/storefront/media`, `/dashboard/storefront/builder`; обновлён `StorefrontSubnav`; на Theme добавлена **галерея пресетов**.
5. **Компоненты медиа:** библиотека, карточка, dropzone (честное сообщение без storage), picker placeholder.
6. **Документация:** data model, media, theme presets, roadmap-доки по секциям/header/footer/slider/… + UX + QA matrix.
7. **Тест:** `storefront-builder-safe-content.test.ts`.

## Не сделано (честно)

- Полноценные загрузки файлов, слайдер, визуальный page builder, подключение navigation/footer к публичному layout, versioning темы, quality checker UI, responsive preview frames, расширение Prisma под rich media — **следующие PR** по roadmap в аудите.

## Команды (нужно прогнать)

```bash
npm run typecheck
npm run build
npm run lint
npm test
```

## Следующий рекомендованный PR

1. Подключить `StorefrontNavigation` + `StorefrontFooter` к `app/s/[storeSlug]/layout.tsx` с безопасным парсером JSON.
2. Применить `designTokensToCssVars` на публичный root (фича-флаг).
3. Server action загрузки медиа при наличии bucket + расширение `StorefrontAsset`.

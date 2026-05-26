# Storefront Media Library

## Реализовано

- Админ-маршрут: `/dashboard/storefront/media`.
- Список `StorefrontAsset` для текущего пользователя и `storefrontId` витрины.
- Компоненты: `components/storefront/media/media-library.tsx`, `media-asset-card.tsx`, `media-upload-dropzone.tsx`, `media-picker-dialog.tsx` (заглушка выбора).

## Загрузка файлов

- Включение: серверная переменная `STOREFRONT_MEDIA_UPLOAD_BUCKET` (см. `lib/storefront-builder/media-config.ts`).
- Пока bucket не задан — **никаких фейковых upload**: только HTTPS URL как раньше (Theme / продукты).

## Следующие шаги

1. Server Action: multipart → провайдер (Supabase Storage / S3) → запись `StorefrontAsset`.
2. Расширить Prisma: `mimeType`, `sizeBytes`, `width`, `height`, `storageKey`, `altText`.
3. Picker в редакторе секций и в Theme inputs.

## Безопасность

- Повторно использовать `assertSafeHttpsUrl` / серверные проверки темы.
- SVG: по умолчанию отключить или прогон через sanitizer.

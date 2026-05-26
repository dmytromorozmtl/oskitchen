# Header Builder (roadmap)

## Сейчас

- Публичный header в `app/s/[storeSlug]/layout.tsx` статичен.
- Prisma `StorefrontNavigation.itemsJson` не используется на витрине.

## Цель

- Админ `/dashboard/storefront/header` (или вкладка): CRUD пунктов, target types (home/menu/page/external HTTPS), reorder.
- Рендер: merge сохранённого меню + fallback ссылок.

## Безопасность

- Валидация внутренних путей `/s/{slug}/…`, внешних только `https:`.

# Storefront Builder UX

## Навигация админки

Добавлены пункты: **Builder** (`/dashboard/storefront/builder`), **Media** (`/dashboard/storefront/media`) в `StorefrontSubnav`.

## Принципы

- Не дублировать длинные формы на Builder hub — только карточки-шорткаты.
- Состояние сохранения: позже — `unsaved` индикатор при визуальном редакторе.
- Drag-and-drop reorder секций: согласовать с server actions (`moveStorefrontSection` уже есть).

## Целевая структура (из ТЗ)

См. список в миссии пользователя — адаптировать под существующие табы KitchenOS, не плодить 20 дублей.

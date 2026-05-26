# Menu & Product Page Customization

## Сейчас

- `/menu` и `/products/[productRef]` — фиксированная вёрстка (см. `app/s/[storeSlug]/menu/page.tsx`, `products/...`).

## Цель

- Настройки layout (grid/list/tabs) хранить в JSON на `StorefrontSettings` **или** отдельной таблице `StorefrontLayoutPreferences`.
- Флаги show/hide для цены, бейджей, аллергенов и т.д.

## Риск

- Слишком много опций → сложность поддержки. Начать с 2–3 layout профилей.

# Draft / Publish Versioning

## Сейчас

- `StorefrontPage.published` + draft storefront через `published` flag + preview token.
- Тема: изменения в `StorefrontSettings` effectively **live** для опубликованной витрины.

## Цель

- `StorefrontThemeVersion` или `themeDraftJson` на settings + кнопка Publish.
- Аудит: кто опубликовал, когда (использовать существующий audit log если есть).

## Ограничение

- Checkout должен читать **операционные** опубликованные поля (валюта, Stripe) — не черновики.

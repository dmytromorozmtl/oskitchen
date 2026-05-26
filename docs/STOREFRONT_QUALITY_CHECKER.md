# Storefront Quality Checker

## Сейчас

- Разрозненные проверки (theme contrast, env readiness на Launch).

## Цель

- Единый score на Launch + Theme: лого, favicon, alt, контраст, активное меню, способы оплаты, fulfillment, политики.

## Реализация

- Сервис `services/storefront-builder/*` + UI badge; не блокировать сохранение, только предупреждать.

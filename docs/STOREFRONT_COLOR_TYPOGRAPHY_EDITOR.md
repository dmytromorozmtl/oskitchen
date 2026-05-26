# Color & Typography Editor (roadmap)

## Сейчас

- Поля hex + `fontFamily` в Theme форме; контраст в `ThemeContrastCheck`.

## Цель

- Раздельные контролы для палитры токенов (`design-tokens.ts`), весов, масштаба, радиусов.
- Безопасные шрифты: allowlist (system / Google Fonts с self-host или link с integrity).

## Риски

- Произвольные `@import` шрифтов → XSS/tracking — запретить.
- Плохой контраст на checkout — проверять отдельно для кнопок оплаты.

См. также `docs/STOREFRONT_BUILDER_AUDIT.md` §1.

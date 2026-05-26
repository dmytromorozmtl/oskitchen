# Storefront Builder — QA matrix

| # | Проверка | Статус |
| --- | --- | --- |
| 1 | Media: upload при bucket — | TODO (нет storage action) |
| 2 | Media: HTTPS URL — | Существующая тема |
| 3 | Unsafe URL blocked — | `assertStorefrontThemeUrlsSafe` / unit safe-content |
| 4 | Theme preset id отображается — | Theme страница |
| 5 | Color picker save — | Существующая форма |
| 6 | Contrast warning — | ThemeContrastCheck |
| 7 | Header menu render из JSON — | Существует (`app/s/[storeSlug]/layout.tsx` + `StorefrontNavigation`) |
| 8 | Footer из blocksJson — | Существует (`StorefrontFooter` + `parseStorefrontFooterBlocks`) |
| 9 | Slider section — | TODO |
| 10 | Slider a11y — | TODO |
| 11 | Section reorder — | `moveStorefrontSection` существует |
| 12 | Draft не ломает live — | Частично (страницы); тема — TODO |
| 13 | Signed preview — | Уже в layout |
| 14 | Publish — | `published` на странице |
| 15–17 | Menu/product layout — | TODO |
| 18 | Quality checker — | TODO |
| 19 | Mobile preview — | TODO |
| 20–23 | Checkout / analytics / Stripe / pay-later — | Регрессия вручную |
| 24–27 | typecheck / build / lint / test — | CI локально |

Автотест добавлен: `tests/unit/storefront-builder-safe-content.test.ts`.

# Storefront next pass — completion report

## Audited

See `docs/STOREFRONT_NEXT_PASS_GAP_AUDIT.md`.

## Delivered

| Workstream | Status |
|------------|--------|
| Navigation/footer live integration | **Done** — `StorefrontNavigation`, `StorefrontFooter`, validation libs, snapshot-aware selection |
| Design token CSS vars | **Done** — feature flag + scoped wrapper; checkout opt-out |
| Asset upload architecture | **Partial** — Prisma columns, provider detection, services, UI stub; no binary upload action (intentional until provider wired) |
| Section form editor | **Foundation** — validation helpers + config; dashboard still JSON for now |
| HOME strategy | **Done** — HOME page + `/s/[slug]` rendering + seed on storefront upsert |
| Slider section | **Done** — enum, Zod, client component, public renderer |
| Theme versioning | **Done** — JSON snapshot columns + publish action + theme page form |
| i18n foundation | **Done** — labels map resolution for nav/footer |
| Permissions | **Done** — coarse OWNER vs STAFF gating + superadmin bypass |
| Performance limits | **Done** — constants + section cap enforcement |
| Rich HTML sanitizer | **Done** — legal sanitizer + privacy save/render |
| Checkout boundary | **Done** — pathname header + tests + doc |
| QA checklist | **Done** — `STOREFRONT_NEXT_PASS_QA_CHECKLIST.md` |

## Commands

- `npm run typecheck` ✅  
- `npm run build` ✅  
- `npm run lint` ✅ (warnings remain outside storefront scope)  
- `npm test` ✅  

## Limitations / next roadmap

1. Full form-based section editor UI (replace JSON textarea) + reorder drag handle + duplicate/hide toggles.
2. Theme **rollback** UI + immutable version history table if compliance requires point-in-time restore.
3. Asset upload server action + signed URL flow + SVG policy (remain disabled until sanitizer).
4. Navigation/footer **dashboard** forms writing validated JSON + preview side-by-side.
5. Structured logging/audit rows for publish + legal edits (partially absent).
6. Domain / publication toggles wired to `storefront:manage-domain` / `storefront:toggle-publication` explicitly.
7. Expanded locale pack + translation management UI.
8. Public menu pagination caps inside FEATURED_MENU section implementation.
9. E2E Playwright coverage for publish + checkout regression.

---

## Что бы я ещё доделал в Storefront (максимально широкий взгляд)

Ниже — не обязательные задачи на «завтра», а дорожная карта зрелого commercе-билдера поверх уже сделанного слоя безопасности.

1. **Визуальный редактор секций** — полностью убрать JSON из ежедневной работы: формы по Zod, превью в iframe с тем же CSS, что публичный витринный root, локализация полей.
2. **Библиотека секций и пресеты страниц** — шаблоны «Grand Opening», «Catering landing», импорт/экспорт макета между брендами.
3. **A/B и scheduled publish** — отложенная публикация, слоты кампаний, сравнение конверсий между снапшотами темы.
4. **Глобальные блоки** — шапка/футер/промо-бар как независимые сущности с отдельным versioning, если HOME станет слишком перегруженным.
5. **CDN и image pipeline** — автоматический ресайз, `srcset`, blur placeholder, связка с `next/image` где возможно.
6. **SEO операционный слой** — автогенерация JSON-LD по секциям, hreflang, канониклы для vanity-доменов, отчёт по индексации.
7. **Сегментация аудитории** — разные HOME для returning vs new (cookie + edge config), осторожно с privacy.
8. **Интеграции маркетинга** — согласованный слой событий dataLayer с builder-событиями (без дублирования analytics beacon).
9. **Многоязычный контент секций** — не только nav/footer: хранение `localizedJson` для hero/FAQ с review-процессом перевода.
10. **Права на уровне workspace member** — отделить kitchen staff от marketing rôle без смешения с операционными правами.
11. **Webhooks на publish** — уведомить поисковики/edge cache, инвалидировать CDN.
12. **Доступность аудит** — полный WCAG pass на Slider + формы checkout + focus trap в модалках билдера.
13. **Согласование с OS Kitchen ops** — связка заказов, лимитов кухни и сообщений на витрине (например, sold-out badges из реального стока в реальном времени).

Этот список намеренно шире текущего MVP: он помогает приоритизировать следующие кварталы без потери фокуса на безопасности и стабильности checkout.

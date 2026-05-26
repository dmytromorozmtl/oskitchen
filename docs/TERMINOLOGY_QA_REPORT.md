# Business-mode terminology QA (BAR focus)

**Source of truth:** `lib/terminology.ts` + `navLabelForBusinessType(locale, businessType, key)`.

## BAR mode — expected mappings

| Message key | Expected flavor (BAR) | Notes |
|-------------|------------------------|--------|
| `nav.storefront` | Events & drinks site | Event-forward; do not use for non-public modules. |
| `nav.menus` | Drinks & events menu | |
| `nav.products` | Drinks & items | |
| `nav.production` | Bar prep | |
| `nav.orders` | Orders & requests | |
| `nav.catering` | Event requests | Quote-led language |

## Intentionally generic

- **Sales channels** — keep literal “Sales channels” unless a future mode needs POS-specific wording (avoid confusion for aggregator staff).

## QA checks

1. Set business type **BAR** in settings; walk sidebar groups **Orders & Sales**, **Menus**, **Kitchen**.  
2. Compare sidebar labels with ⌘K palette labels for the same href (palette uses terminology when href exists in `NAV_GROUPS`).  
3. Ensure **RESTAURANT** / **MEAL_PREP** strings are not shown when BAR is selected (`BUSINESS_TYPE_LABELS` badge in sidebar shows human mode only).

## Gaps / follow-ups

- Add `labelKey` to `MODULE_REGISTRY_ENTRIES` long-term to remove duplication between registry `label` and i18n keys.  
- French locale: verify BAR overrides exist where English does.

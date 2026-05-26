# i18n — navigation & footer foundation

## Supported locales (initial)

- English (`en`) default.
- French (`fr`) via optional `labels` maps on nav items / footer links.

## Resolution order

1. Exact locale key on `labels` (e.g. `fr` or `fr-CA` truncated to short code where applicable).
2. English `labels.en`.
3. Base `label` string.

## Storage

- Keep single `itemsJson` / `blocksJson` documents; embed `labels?: Record<string,string>` per entry (validated in navigation/footer parsers).

## Builder note

When `labels.fr` missing, UI should show “missing translation” hint (dashboard UI polish — follow-up).

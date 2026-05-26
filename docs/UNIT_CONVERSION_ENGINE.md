# Unit conversion engine

Implementation: `lib/ingredient-demand/unit-conversion.ts`.

## Supported without extra data

- **Mass:** `g`, `kg`, `oz`, `lb` (canonical names, aliases normalized).
- **Volume:** `ml`, `l`, `fl oz`.

## Explicit JSON on ingredient

`ingredient.conversionJson` may encode arbitrary ratios as `"from->to": number` (multiply quantity in `from` to reach `to`), or reverse key with reciprocal.

## Explicitly unsupported without JSON

- Mass ↔ volume (no density guessing).
- Count units (`each`, `case`, …) cross-family.

## UX contract

Failures return `CONVERSION_REQUIRED` / `UNSUPPORTED_PAIR` messages surfaced in the command center warnings list and line-level `conversionRequired` flag.

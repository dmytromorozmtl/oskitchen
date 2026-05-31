# Product modifier mapping

External marketplaces expose modifiers/options under different names.
OS Kitchen uses a canonical key set so that production, packaging,
costing, and storefront can rely on a stable contract.

## Canonical modifier keys

Defined in `lib/product-mapping/modifier-mapping.ts`:

```
size, protein, side, spice, addon, substitution, drink,
preparation, packaging, delivery_instruction
```

## Alias dictionary

`suggestModifierKey(name)` lowercases / normalises the external
modifier name and consults a small alias table:

| External name (normalised) | Canonical key |
|----------------------------|---------------|
| `size`, `portion`, `bowl`  | `size` |
| `protein`, `meat`          | `protein` |
| `side`, `sides`            | `side` |
| `spice`, `spice level`, `heat` | `spice` |
| `addon`, `add on`, `add-on`, `extras` | `addon` |
| `substitution`, `substitute`, `swap` | `substitution` |
| `drink`, `drinks`, `beverage` | `drink` |
| `prep`, `cooking`          | `preparation` |
| `packaging`, `pack`        | `packaging` |
| `delivery`, `notes`        | `delivery_instruction` |

If nothing matches, the suggestion falls back to a substring scan
("spice level for the next order" → `spice`). When still nothing
matches, `suggestModifierKey` returns `null` so the operator picks
manually.

## Provider examples

- **Shopify variants** — option `Size` / value `Large` →
  `internalModifierKey = "size"`, `internalOptionValue = "Large"`.
- **WooCommerce variations** — attribute `pa_size` /
  term `Large` → identical mapping.
- **Uber Eats modifiers** — modifier group `Spice level` /
  option `Medium` → `internalModifierKey = "spice"`,
  `internalOptionValue = "Medium"`.
- **CSV** — column `addon` / value `Extra protein` →
  `internalModifierKey = "addon"`,
  `internalOptionValue = "Extra protein"`.

## UI

`/dashboard/product-mapping/modifiers` lists every reviewable
mapping with its existing modifiers and an inline form to add
another. The form pre-fills `suggestedKey` when the operator types
an external modifier name (today the suggestion happens on save;
client-side suggestion is a P3 improvement).

## Storage

`ProductModifierMapping` is `1..*` per `ProductMapping`. Each row
records its own status (`UNMAPPED / SUGGESTED / APPROVED / REJECTED
/ IGNORED`) so the workbench can show partial progress and so the
production layer can ignore rejected/ignored modifiers safely.

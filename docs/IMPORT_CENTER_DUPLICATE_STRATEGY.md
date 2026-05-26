# Import Center duplicate strategy

Duplicate detection is type-specific and runs against both the
in-memory batch and the live workspace.

## Dedupe keys

`lib/import-center/duplicate-detection.ts → dedupeKey(type, normalized)`

| Type                | Key                                          |
|---------------------|----------------------------------------------|
| PRODUCTS            | `sku:<lower>` → `title:<lower>`              |
| CUSTOMERS           | `email:<lower>` → `phone:<digits>`           |
| ORDERS              | `order:<orderNumber lower>`                  |
| INGREDIENTS         | `ingredient:<name>|<unit>`                   |
| RECIPES             | `recipe:<recipeName lower>`                  |
| STAFF               | `staff_email:<lower>` → `staff_name:<lower>` |
| SUPPLIERS           | `supplier_email:<lower>` → `supplier_name:<lower>` |
| BRANDS / LOCATIONS  | `<type>_slug:<lower>` → `<type>_name:<lower>`|
| NUTRITION_ALLERGENS | `nutrition:<productId>`                      |
| PRODUCT_MAPPINGS    | `mapping:<provider>|<externalId>`            |
| MENU_ASSIGNMENTS    | `assignment:<productId>|<menuId>`            |
| PURCHASE_ITEMS      | `pi:<ingredientId>|<supplierId>`             |

A null dedupe key means the row cannot be considered a duplicate of
another row.

## Existing match lookup

`loadExistingMatches(userId, type)` builds a `Map<key, existingId>`
from the workspace tables. The Import Center loads dedupe data for
the four committable types today:

- `KitchenCustomer` → email & phone keys.
- `StaffMember` → email & name keys.
- `Ingredient` → `(name, unit)` keys.
- `Product` → title keys (sku is not stored in the schema).

Preview-only types start with an empty lookup; the batch still
detects duplicates among the rows of the same file.

## Commit modes

| Mode               | Match in DB         | Match in batch      | No match           |
|--------------------|---------------------|---------------------|--------------------|
| CREATE_ONLY        | DUPLICATE / SKIP    | DUPLICATE / SKIP    | VALID / CREATE     |
| UPDATE_EXISTING    | VALID / UPDATE      | DUPLICATE / SKIP    | SKIPPED / SKIP     |
| UPSERT             | VALID / UPDATE      | DUPLICATE / SKIP    | VALID / CREATE     |
| SKIP_DUPLICATES    | DUPLICATE / SKIP    | DUPLICATE / SKIP    | VALID / CREATE     |

If the validated row also has warnings, the status switches from
`VALID` to `WARNING` while the action remains the same. Commit only
considers `VALID` rows; warnings require an explicit user opt-in.

## What never happens silently

- Existing rows are never overwritten unless the user picked
  `UPDATE_EXISTING` or `UPSERT`.
- New rows are never inserted when the user picked
  `UPDATE_EXISTING`.
- Within the batch, duplicate rows always skip, regardless of mode.

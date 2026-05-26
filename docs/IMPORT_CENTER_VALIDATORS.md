# Import Center validators

Every supported `ImportType` has a pure validator in
`lib/import-center/validators.ts`. Validators receive the
post-mapping row (canonical-key → string) and return:

```ts
type ValidatorResult = {
  normalized: Record<string, unknown> | null;
  errors:   { code: string; message: string }[];
  warnings: { code: string; message: string }[];
};
```

If `errors.length > 0`, `normalized` is null and the row will reject.

## Type-by-type rules

### PRODUCTS
- `title` required.
- `price` required + numeric.
- `prepared_date` required + parseable date.
- Warning when `pickup_date` is present but unparseable (defaults to
  `prepared_date` on commit).

### CUSTOMERS
- `email` required + valid email.
- Phone normalised to digits/`+`.

### ORDERS (preview-only)
- `order_number`, `customer_email`, `fulfillment_date` required.
- `customer_email` must be valid.
- `fulfillment_date` must be a parseable date.
- `total` must be numeric when present.
- Warning if `fulfillment_type` is not one of `PICKUP / DELIVERY /
  SHIPPING / DINE_IN / CATERING`.

### INGREDIENTS
- `name`, `unit`, `cost_per_unit` required.
- `cost_per_unit` numeric.
- `current_stock`, `par_level` numeric when present.

### RECIPES (preview-only)
- `recipe_name`, `product_title` required.
- `quantity`, `yield_quantity` numeric when present.

### STAFF
- `name` required.
- `email` valid when present.

### SUPPLIERS (preview-only)
- `supplier_name` (or `name`) required.
- `email` valid when present.

### BRANDS (preview-only)
- `name` required. Slug auto-derived if missing.

### LOCATIONS (preview-only)
- `name` required. Timezone defaults to `UTC`. Slug auto-derived.

### NUTRITION_ALLERGENS (preview-only)
- `product_id` required.
- `calories`, `protein` numeric when present.
- Warning for allergen names outside the recognised set
  (`milk, wheat, gluten, soy, egg, peanut, tree nut, sesame,
  fish, shellfish, sulphite, mustard, …`).

### PRODUCT_MAPPINGS (preview-only)
- `provider`, `external_product_id`, `external_title` required.

### MENU_ASSIGNMENTS (preview-only)
- `product_id`, `menu_id` required.
- `sort_order` numeric when present.
- `visible` parsed from `1/yes/true/y`.

### PURCHASE_ITEMS (preview-only)
- `ingredient_id`, `supplier_id` required.
- `pack_size`, `pack_price` numeric when present.

## Helpers

The validator file owns shared helpers (`looksLikeEmail`,
`looksLikeNumber`, `looksLikeDate`, `normalisePhone`) so the rules
stay declarative.

## Adding a new validator

1. Add the canonical fields to `IMPORT_TEMPLATES`.
2. Add a `valid<Type>` function and register it in the
   `VALIDATORS` map at the bottom of `validators.ts`.
3. Add the dedupe key strategy in
   `lib/import-center/duplicate-detection.ts`.
4. If the type is committable, extend
   `services/import-center/import-center-service.ts → commitImportJob`
   with the upsert / create / update branch.

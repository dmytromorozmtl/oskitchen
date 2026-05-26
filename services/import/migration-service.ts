export type MigrationSource =
  | "restaurant365"
  | "marketman"
  | "toast"
  | "shopify"
  | "csv";

export const MIGRATION_SOURCES: Array<{
  id: MigrationSource;
  label: string;
  templatePath: string;
  fieldMap: Record<string, string>;
}> = [
  {
    id: "restaurant365",
    label: "Restaurant365",
    templatePath: "/lib/import/templates/restaurant365.csv",
    fieldMap: {
      external_id: "ingredient.externalId",
      ingredient_name: "ingredient.name",
      unit: "ingredient.unit",
      cost_per_unit: "ingredient.costPerUnit",
      par_level: "ingredient.parLevel",
    },
  },
  {
    id: "marketman",
    label: "MarketMan",
    templatePath: "/lib/import/templates/marketman.csv",
    fieldMap: {
      sku: "ingredient.sku",
      item_name: "ingredient.name",
      purchase_unit: "ingredient.purchaseUnit",
      unit_cost: "ingredient.costPerUnit",
      supplier: "supplier.name",
    },
  },
  {
    id: "toast",
    label: "Toast POS",
    templatePath: "/lib/import/templates/toast.csv",
    fieldMap: {
      menu_item: "product.title",
      price: "product.price",
      category: "product.category",
      allergens: "product.allergens",
    },
  },
  {
    id: "shopify",
    label: "Shopify",
    templatePath: "/lib/import/templates/shopify.csv",
    fieldMap: {
      handle: "product.slug",
      title: "product.title",
      variant_price: "product.price",
      inventory_qty: "inventory.quantity",
    },
  },
  {
    id: "csv",
    label: "Generic CSV",
    templatePath: "/dashboard/import-center/templates",
    fieldMap: {},
  },
];

export function getMigrationSource(id: MigrationSource) {
  return MIGRATION_SOURCES.find((s) => s.id === id);
}

export function previewMigrationMapping(
  source: MigrationSource,
  sampleRows: Record<string, string>[],
) {
  const def = getMigrationSource(source);
  if (!def) return { rows: [], fieldMap: {} };
  return {
    fieldMap: def.fieldMap,
    rows: sampleRows.slice(0, 5).map((row) => ({
      source: row,
      mapped: Object.fromEntries(
        Object.entries(def.fieldMap).map(([src, dest]) => [dest, row[src] ?? ""]),
      ),
    })),
  };
}

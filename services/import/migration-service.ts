import type {
  DataMigrationEntity,
  DataMigrationPosSource,
} from "@/lib/import/data-migration-wizard-absolute-final-policy";
import {
  getDataMigrationProfile,
  listProfilesForSource,
} from "@/lib/import/data-migration-profiles";

export type { DataMigrationEntity, DataMigrationPosSource };

export type LegacyMigrationSource =
  | "restaurant365"
  | "marketman"
  | "shopify"
  | "csv";

export type MigrationSource = DataMigrationPosSource | LegacyMigrationSource;

export const POS_MIGRATION_SOURCES: DataMigrationPosSource[] = ["toast", "square", "lightspeed"];

export const MIGRATION_ENTITIES: DataMigrationEntity[] = ["menu", "customers", "orders"];

/** Legacy flat sources for Import Center backward compatibility. */
export const MIGRATION_SOURCES: Array<{
  id: MigrationSource;
  label: string;
  templatePath: string;
  fieldMap: Record<string, string>;
}> = [
  {
    id: "toast",
    label: "Toast POS",
    templatePath: "/lib/import/templates/toast-menu.csv",
    fieldMap: getDataMigrationProfile("toast", "menu")!.fieldMap,
  },
  {
    id: "square",
    label: "Square",
    templatePath: "/lib/import/templates/square-menu.csv",
    fieldMap: getDataMigrationProfile("square", "menu")!.fieldMap,
  },
  {
    id: "lightspeed",
    label: "Lightspeed",
    templatePath: "/lib/import/templates/lightspeed-menu.csv",
    fieldMap: getDataMigrationProfile("lightspeed", "menu")!.fieldMap,
  },
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

export function isPosMigrationSource(source: MigrationSource): source is DataMigrationPosSource {
  return POS_MIGRATION_SOURCES.includes(source as DataMigrationPosSource);
}

export function getMigrationSource(id: MigrationSource) {
  return MIGRATION_SOURCES.find((s) => s.id === id);
}

export function previewPosMigrationMapping(
  source: DataMigrationPosSource,
  entity: DataMigrationEntity,
  sampleRows: Record<string, string>[],
) {
  const profile = getDataMigrationProfile(source, entity);
  if (!profile) return { rows: [], fieldMap: {}, unmappedColumns: [] as string[] };

  const sourceColumns =
    sampleRows.length > 0 ? Object.keys(sampleRows[0] ?? {}) : Object.keys(profile.fieldMap);
  const mappedSources = new Set(Object.keys(profile.fieldMap));
  const unmappedColumns = sourceColumns.filter((col) => !mappedSources.has(col));

  return {
    fieldMap: profile.fieldMap,
    exportHint: profile.exportHint,
    label: profile.label,
    unmappedColumns,
    rows: sampleRows.slice(0, 5).map((row) => ({
      source: row,
      mapped: Object.fromEntries(
        Object.entries(profile.fieldMap).map(([src, dest]) => [dest, row[src] ?? ""]),
      ),
    })),
  };
}

/** @deprecated Use previewPosMigrationMapping for POS sources with entity. */
export function previewMigrationMapping(
  source: MigrationSource,
  sampleRows: Record<string, string>[],
) {
  if (isPosMigrationSource(source)) {
    return previewPosMigrationMapping(source, "menu", sampleRows);
  }
  const def = getMigrationSource(source);
  if (!def) return { rows: [], fieldMap: {}, unmappedColumns: [] as string[] };
  return {
    fieldMap: def.fieldMap,
    unmappedColumns: [] as string[],
    rows: sampleRows.slice(0, 5).map((row) => ({
      source: row,
      mapped: Object.fromEntries(
        Object.entries(def.fieldMap).map(([src, dest]) => [dest, row[src] ?? ""]),
      ),
    })),
  };
}

export function buildMigrationUploadQuery(
  source: DataMigrationPosSource,
  entity: DataMigrationEntity,
): string {
  return `?source=${encodeURIComponent(source)}&entity=${encodeURIComponent(entity)}`;
}

export { getDataMigrationProfile, listProfilesForSource };

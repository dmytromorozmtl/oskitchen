/** Legacy + extended export kinds for `/api/export` and the export center. */
export const LEGACY_EXPORT_TYPES = [
  "orders",
  "customers",
  "products",
  "production",
  "inventory",
  "integrations_metadata",
] as const;

export const EXTENDED_EXPORT_TYPES = [
  "menus",
  "brands",
  "locations",
  "recipes",
  "suppliers",
  "purchase_orders",
  "costing_snapshots",
  "ingredient_demand",
  "nutrition_labels",
  "packing",
  "reports",
  "audit_logs",
] as const;

export const ALL_EXPORT_TYPES = [...LEGACY_EXPORT_TYPES, ...EXTENDED_EXPORT_TYPES] as const;

export type LegacyExportType = (typeof LEGACY_EXPORT_TYPES)[number];
export type ExtendedExportType = (typeof EXTENDED_EXPORT_TYPES)[number];
export type ExportType = (typeof ALL_EXPORT_TYPES)[number];

export function isExportType(v: string | null): v is ExportType {
  return v != null && (ALL_EXPORT_TYPES as readonly string[]).includes(v);
}

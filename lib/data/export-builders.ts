import type { ExportType } from "@/lib/import-export/export-types";
import {
  DATA_EXPORT_MANIFEST_ROUTE,
  DATA_EXPORT_PATH,
  DATA_EXPORT_POLICY_ID,
} from "@/lib/data/export-policy";
import type {
  DataExportDomain,
  DataExportLane,
  DataExportLaneId,
  DataPortabilitySnapshot,
} from "@/lib/data/export-types";

export const DATA_EXPORT_DOMAIN_META: Record<
  ExportType,
  { label: string; description: string }
> = {
  orders: { label: "Orders", description: "Order history with fulfillment metadata." },
  customers: { label: "Customers", description: "Guest profiles inferred from order history." },
  products: { label: "Menu items", description: "Catalog rows with menu linkage." },
  production: { label: "Production grid", description: "Cook, pack, and label flags per item." },
  inventory: { label: "Ingredients", description: "Ingredient catalog and stock snapshot." },
  integrations_metadata: {
    label: "Integrations metadata",
    description: "Connected channels without secrets.",
  },
  menus: { label: "Menus", description: "Menu headers, strategy, and publish windows." },
  brands: { label: "Brands", description: "Brand portfolio for the workspace." },
  locations: { label: "Locations", description: "Operational locations and timezones." },
  recipes: { label: "Recipes", description: "Recipe yields linked to menu items." },
  suppliers: { label: "Suppliers", description: "Purchasing vendor directory." },
  purchase_orders: { label: "Purchase orders", description: "PO headers with line counts." },
  costing_snapshots: {
    label: "Costing snapshots",
    description: "Historical cost and margin snapshots.",
  },
  ingredient_demand: {
    label: "Ingredient demand runs",
    description: "Demand run summaries for purchasing.",
  },
  nutrition_labels: { label: "Nutrition labels", description: "Macro snapshot per product." },
  packing: { label: "Packing batches", description: "Batch-oriented packing progress." },
  reports: { label: "Reports", description: "Operational reports placeholder export." },
  audit_logs: { label: "Audit logs", description: "Scoped audit trail (superadmin only)." },
};

export const DATA_EXPORT_LANE_DOMAINS: Record<DataExportLaneId, ExportType[]> = {
  operations: ["orders", "customers", "packing", "production"],
  catalog: ["menus", "products", "brands", "locations", "recipes", "nutrition_labels"],
  purchasing: [
    "inventory",
    "suppliers",
    "purchase_orders",
    "ingredient_demand",
    "costing_snapshots",
  ],
  integrations: ["integrations_metadata"],
  compliance: ["reports", "audit_logs"],
};

const LANE_LABELS: Record<DataExportLaneId, string> = {
  operations: "Operations",
  catalog: "Catalog",
  purchasing: "Purchasing",
  integrations: "Integrations",
  compliance: "Compliance",
};

export function buildDataExportDomain(input: {
  type: ExportType;
  rowCount: number;
  accessible: boolean;
}): DataExportDomain {
  const meta = DATA_EXPORT_DOMAIN_META[input.type];
  return {
    type: input.type,
    label: meta.label,
    description: meta.description,
    rowCount: input.rowCount,
    downloadHref: `/api/export?type=${encodeURIComponent(input.type)}`,
    format: "csv",
    accessible: input.accessible,
  };
}

export function buildDataExportLane(input: {
  id: DataExportLaneId;
  domains: DataExportDomain[];
}): DataExportLane {
  return {
    id: input.id,
    label: LANE_LABELS[input.id],
    domains: input.domains,
    rowCount: input.domains.reduce((sum, domain) => sum + domain.rowCount, 0),
  };
}

export function buildDataPortabilitySnapshot(input: {
  workspaceLabel: string;
  lanes: DataExportLane[];
  analyzedAt?: Date;
}): DataPortabilitySnapshot {
  const domains = input.lanes.flatMap((lane) => lane.domains);
  const accessibleDomains = domains.filter((domain) => domain.accessible);

  return {
    policyId: DATA_EXPORT_POLICY_ID,
    generatedAtIso: (input.analyzedAt ?? new Date()).toISOString(),
    workspaceLabel: input.workspaceLabel,
    lanes: input.lanes,
    summary: {
      laneCount: input.lanes.length,
      domainCount: domains.length,
      accessibleDomainCount: accessibleDomains.length,
      totalRows: accessibleDomains.reduce((sum, domain) => sum + domain.rowCount, 0),
      manifestHref: DATA_EXPORT_MANIFEST_ROUTE,
    },
    basePath: DATA_EXPORT_PATH,
  };
}

import { csvEscapeCell } from "@/lib/audit/audit-formatters";
import type {
  BuildMultiLocationRollupInput,
  MultiLocationRollup,
  MultiLocationRollupRow,
} from "@/lib/enterprise/multi-location-rollup-types";
import type { MultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function drilldownHref(basePath: string, locationId: string | null): string | null {
  if (!locationId) return null;
  return `${basePath}?locationId=${encodeURIComponent(locationId)}`;
}

export function buildMultiLocationRollup(
  input: BuildMultiLocationRollupInput,
): MultiLocationRollup {
  const { snapshot } = input;
  const basePath = input.basePath ?? "/dashboard/enterprise/multi-location";
  const generatedAt = (input.generatedAt ?? new Date()).toISOString();

  const locationRows: MultiLocationRollupRow[] = snapshot.locations.map((row) => ({
    kind: "location",
    locationId: row.locationId,
    label: row.locationName,
    orders: row.orders,
    revenue: row.revenue,
    revenueSharePct: row.revenueShare,
    laborPct: row.laborPct,
    foodCostPct: row.foodCostPct,
    avgOrderValue: row.avgOrderValue,
    vsAvgRevenue: row.vsAvgRevenue,
    vsAvgLaborPct: row.vsAvgLaborPct,
    drilldownHref: drilldownHref(basePath, row.locationId),
  }));

  const rows: MultiLocationRollupRow[] = [
    {
      kind: "network",
      locationId: null,
      label: "Network total",
      orders: snapshot.totalOrders,
      revenue: snapshot.totalRevenue,
      revenueSharePct: 100,
      laborPct: snapshot.networkAverages.laborPct,
      foodCostPct: snapshot.networkAverages.foodCostPct,
      avgOrderValue:
        snapshot.totalOrders > 0
          ? round2(snapshot.totalRevenue / snapshot.totalOrders)
          : null,
      vsAvgRevenue: null,
      vsAvgLaborPct: null,
      drilldownHref: basePath,
    },
    ...locationRows,
  ];

  if (snapshot.unassignedOrders > 0 || snapshot.unassignedRevenue > 0) {
    rows.push({
      kind: "unassigned",
      locationId: null,
      label: "Unassigned (no locationId)",
      orders: snapshot.unassignedOrders,
      revenue: snapshot.unassignedRevenue,
      revenueSharePct:
        snapshot.totalRevenue > 0
          ? round2((snapshot.unassignedRevenue / snapshot.totalRevenue) * 100)
          : null,
      laborPct: null,
      foodCostPct: null,
      avgOrderValue:
        snapshot.unassignedOrders > 0
          ? round2(snapshot.unassignedRevenue / snapshot.unassignedOrders)
          : null,
      vsAvgRevenue: null,
      vsAvgLaborPct: null,
      drilldownHref: null,
    });
  }

  return {
    rangeLabel: snapshot.rangeLabel,
    generatedAt,
    totalLocations: snapshot.totalLocations,
    activeLocations: snapshot.activeLocations,
    networkOrders: snapshot.totalOrders,
    networkRevenue: snapshot.totalRevenue,
    unassignedOrders: snapshot.unassignedOrders,
    unassignedRevenue: snapshot.unassignedRevenue,
    networkLaborPct: snapshot.networkAverages.laborPct,
    networkFoodCostPct: snapshot.networkAverages.foodCostPct,
    rows,
  };
}

export function buildMultiLocationRollupCsv(rollup: MultiLocationRollup): string {
  const headers = [
    "kind",
    "label",
    "locationId",
    "orders",
    "revenue",
    "revenueSharePct",
    "laborPct",
    "foodCostPct",
    "avgOrderValue",
    "vsAvgRevenue",
    "vsAvgLaborPct",
  ];
  const lines = [headers.join(",")];
  for (const row of rollup.rows) {
    lines.push(
      [
        csvEscapeCell(row.kind),
        csvEscapeCell(row.label),
        csvEscapeCell(row.locationId ?? ""),
        csvEscapeCell(String(row.orders)),
        csvEscapeCell(String(row.revenue)),
        csvEscapeCell(row.revenueSharePct == null ? "" : String(row.revenueSharePct)),
        csvEscapeCell(row.laborPct == null ? "" : String(row.laborPct)),
        csvEscapeCell(row.foodCostPct == null ? "" : String(row.foodCostPct)),
        csvEscapeCell(row.avgOrderValue == null ? "" : String(row.avgOrderValue)),
        csvEscapeCell(row.vsAvgRevenue ?? ""),
        csvEscapeCell(row.vsAvgLaborPct ?? ""),
      ].join(","),
    );
  }
  return lines.join("\n");
}

export function rollupFromSnapshot(
  snapshot: MultiLocationAnalyticsSnapshot,
  basePath?: string,
): MultiLocationRollup {
  return buildMultiLocationRollup({ snapshot, basePath });
}

export function buildMultiLocationRollupExportHref(filters: {
  from?: Date;
  to?: Date;
  tab?: string;
  locationId?: string;
  brandId?: string;
}): string {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from.toISOString());
  if (filters.to) params.set("to", filters.to.toISOString());
  if (filters.tab) params.set("tab", filters.tab);
  if (filters.locationId) params.set("locationId", filters.locationId);
  if (filters.brandId) params.set("brandId", filters.brandId);
  const q = params.toString();
  return q
    ? `/api/dashboard/multi-location/rollup-export?${q}`
    : "/api/dashboard/multi-location/rollup-export";
}

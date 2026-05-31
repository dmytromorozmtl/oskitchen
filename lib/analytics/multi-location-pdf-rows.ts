import type { MultiLocationAnalyticsSnapshot } from "@/services/analytics/multi-location-analytics";

/** Pure PDF row builder — safe for client bundles (no server/email imports). */
export function buildMultiLocationPdfRows(snapshot: MultiLocationAnalyticsSnapshot): {
  title: string;
  head: string[];
  body: (string | number)[][];
} {
  return {
    title: `Multi-location report · ${snapshot.rangeLabel}`,
    head: [
      "Location",
      "Orders",
      "Revenue",
      "Labor %",
      "Food cost %",
      "vs avg revenue",
      "vs avg labor",
    ],
    body: snapshot.locations.map((row) => [
      row.locationName,
      row.orders,
      row.revenue,
      row.laborPct ?? "—",
      row.foodCostPct ?? "—",
      row.vsAvgRevenue ?? "—",
      row.vsAvgLaborPct ?? "—",
    ]),
  };
}

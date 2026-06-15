"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { LOCATION_STATUS_BADGE, LOCATION_STATUS_LABEL, LOCATION_TYPE_LABEL } from "@/lib/locations/location-types";
import type {
  ComparisonVsAverage,
  LocationAnalyticsRow,
  MultiLocationAnalyticsSnapshot,
} from "@/services/analytics/multi-location-analytics";

type Props = {
  snapshot: MultiLocationAnalyticsSnapshot;
  /** Paginated subset for 100+ location networks (Dashboard 2.0). */
  rows?: LocationAnalyticsRow[];
};

function comparisonClass(
  metric: "revenue" | "cost",
  value: ComparisonVsAverage | null,
): string {
  if (!value || value === "at") return "text-muted-foreground";
  if (metric === "revenue") {
    return value === "above"
      ? "font-medium text-emerald-700 dark:text-emerald-400"
      : "font-medium text-red-700 dark:text-red-400";
  }
  return value === "above"
    ? "font-medium text-red-700 dark:text-red-400"
    : "font-medium text-emerald-700 dark:text-emerald-400";
}

function LocationRow({ row }: { row: LocationAnalyticsRow }) {
  return (
    <tr key={row.locationId} className="border-b border-border/40" data-testid={`location-row-${row.locationId}`}>
      <td className="py-2 pr-3">
        <Link href={`/dashboard/locations/${row.locationId}/reports`} className="font-medium hover:underline">
          {row.locationName}
        </Link>
        <p className="text-xs text-muted-foreground">{LOCATION_TYPE_LABEL[row.type]}</p>
      </td>
      <td className="py-2 pr-3">
        <Badge variant={LOCATION_STATUS_BADGE[row.status]} className="rounded-full text-[10px]">
          {LOCATION_STATUS_LABEL[row.status]}
        </Badge>
      </td>
      <td className={cn("py-2 pr-3 tabular-nums", comparisonClass("revenue", row.vsAvgOrders))}>
        {row.orders}
      </td>
      <td className={cn("py-2 pr-3 tabular-nums", comparisonClass("revenue", row.vsAvgRevenue))}>
        {formatCurrency(row.revenue)}
      </td>
      <td className="py-2 pr-3 tabular-nums">
        {row.avgOrderValue == null ? "—" : formatCurrency(row.avgOrderValue)}
      </td>
      <td className={cn("py-2 pr-3 tabular-nums", comparisonClass("cost", row.vsAvgLaborPct))}>
        {row.laborPct == null ? "—" : `${row.laborPct}%`}
      </td>
      <td className={cn("py-2 pr-3 tabular-nums", comparisonClass("cost", row.vsAvgFoodCostPct))}>
        {row.foodCostPct == null ? "—" : `${row.foodCostPct}%`}
      </td>
      <td className="py-2 pr-3 tabular-nums">
        {row.pickupOrders} / {row.deliveryOrders}
      </td>
      <td className="py-2 pr-3 tabular-nums">{row.routes}</td>
      <td className="py-2 tabular-nums">{row.tasks}</td>
    </tr>
  );
}

export function MultiLocationComparisonTable({ snapshot, rows }: Props) {
  const { networkAverages } = snapshot;
  const displayRows = rows ?? snapshot.locations;

  return (
    <div className="overflow-x-auto" data-testid="multi-location-comparison-table">
      <p className="mb-3 text-xs text-muted-foreground">
        Network averages — {networkAverages.orders} orders · {formatCurrency(networkAverages.revenue)} revenue
        {networkAverages.laborPct != null ? ` · ${networkAverages.laborPct}% labor` : ""}
        {networkAverages.foodCostPct != null ? ` · ${networkAverages.foodCostPct}% food cost` : ""}
        . Green above / red below average for revenue; inverted for cost %.
      </p>
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead>
          <tr className="border-b border-border/60 text-xs text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Location</th>
            <th className="py-2 pr-3 font-medium">Status</th>
            <th className="py-2 pr-3 font-medium">Orders</th>
            <th className="py-2 pr-3 font-medium">Revenue</th>
            <th className="py-2 pr-3 font-medium">AOV</th>
            <th className="py-2 pr-3 font-medium">Labor %</th>
            <th className="py-2 pr-3 font-medium">Food cost %</th>
            <th className="py-2 pr-3 font-medium">Pickup / Delivery</th>
            <th className="py-2 pr-3 font-medium">Routes</th>
            <th className="py-2 font-medium">Tasks</th>
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row) => (
            <LocationRow key={row.locationId} row={row} />
          ))}
          {(snapshot.unassignedOrders > 0 || snapshot.unassignedRevenue > 0) && (
            <tr className="bg-muted/30">
              <td className="py-2 pr-3 italic text-muted-foreground">Unassigned</td>
              <td className="py-2 pr-3">—</td>
              <td className="py-2 pr-3 tabular-nums">{snapshot.unassignedOrders}</td>
              <td className="py-2 pr-3 tabular-nums">{formatCurrency(snapshot.unassignedRevenue)}</td>
              <td className="py-2 pr-3" colSpan={6}>
                —
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

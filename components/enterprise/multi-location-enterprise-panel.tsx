"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronRight, MapPin } from "lucide-react";

import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { MultiLocationComparisonTable } from "@/components/dashboard/multi-location-comparison-table";
import { MultiLocationPdfExportButton } from "@/components/dashboard/multi-location-pdf-export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMultiLocationRollupExportHref } from "@/lib/enterprise/multi-location-rollup-builders";
import type { EnterpriseMultiLocationDashboard } from "@/lib/enterprise/multi-location-types";
import { LOCATION_STATUS_BADGE, LOCATION_STATUS_LABEL } from "@/lib/locations/location-types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  dashboard: EnterpriseMultiLocationDashboard;
};

function ComparisonHint({ value }: { value: "above" | "below" | "at" | null }) {
  if (!value || value === "at") return <span className="text-muted-foreground">at avg</span>;
  return (
    <span className={value === "above" ? "text-emerald-600" : "text-red-600"}>
      {value === "above" ? "↑ above" : "↓ below"} avg
    </span>
  );
}

export function MultiLocationEnterprisePanel({ dashboard }: Props) {
  const router = useRouter();
  const { snapshot, rollup, ranks, selectedLocation, alerts, basePath, filters } = dashboard;
  const rollupExportHref = buildMultiLocationRollupExportHref({
    from: filters.from,
    to: filters.to,
    locationId: filters.locationId ?? undefined,
    brandId: filters.brandId ?? undefined,
  });

  function selectLocation(locationId: string | null) {
    const params = new URLSearchParams(window.location.search);
    if (locationId) {
      params.set("locationId", locationId);
    } else {
      params.delete("locationId");
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div className="space-y-6" data-testid="enterprise-multi-location-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" aria-hidden />
            Multi-location enterprise
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            All locations on one screen — revenue, orders, labor, and food cost with network comparison and
            drill-down.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <MultiLocationPdfExportButton snapshot={snapshot} />
          <Button asChild variant="outline" size="sm" className="rounded-full" data-testid="multi-location-rollup-csv-export">
            <a href={rollupExportHref} download>
              Export rollup CSV
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/franchise">Franchise suite</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/locations/dashboard">Operations view</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Locations" value={snapshot.activeLocations} hint={`${snapshot.totalLocations} total`} />
        <Kpi label="Network orders" value={snapshot.totalOrders} hint={snapshot.rangeLabel} />
        <Kpi label="Network revenue" value={formatCurrency(snapshot.totalRevenue)} />
        <Kpi
          label="Unassigned"
          value={snapshot.unassignedOrders}
          hint={`${formatCurrency(snapshot.unassignedRevenue)} revenue`}
        />
      </div>

      <Card data-testid="multi-location-rollup-summary">
        <CardHeader>
          <CardTitle className="text-base">Consolidated rollup</CardTitle>
          <CardDescription>
            Network totals with per-location revenue share — unassigned orders shown separately when present.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <RollupStat label="Network labor" value={rollup.networkLaborPct != null ? `${rollup.networkLaborPct}%` : "—"} />
          <RollupStat label="Network food cost" value={rollup.networkFoodCostPct != null ? `${rollup.networkFoodCostPct}%` : "—"} />
          <RollupStat label="Location rows" value={rollup.rows.filter((r) => r.kind === "location").length} />
          <RollupStat
            label="Unassigned share"
            value={
              rollup.unassignedOrders > 0
                ? `${rollup.unassignedOrders} orders · ${formatCurrency(rollup.unassignedRevenue)}`
                : "None"
            }
          />
        </CardContent>
      </Card>

      {alerts.length > 0 ? (
        <Card className="border-amber-200/60 bg-amber-50/30 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Location alerts</CardTitle>
            <CardDescription>Vs network average for the selected period.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2 text-left text-sm hover:bg-muted/50"
                onClick={() => selectLocation(alert.locationId)}
              >
                <span>
                  <span className="font-medium">{alert.locationName}</span>
                  <span className="text-muted-foreground"> — {alert.message}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue ranking</CardTitle>
              <CardDescription>Tap a location to drill down.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {ranks.map((row) => (
                <button
                  key={row.locationId}
                  type="button"
                  data-testid={`enterprise-location-rank-${row.locationId}`}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-muted/50",
                    selectedLocation?.locationId === row.locationId && "border-primary bg-primary/5",
                  )}
                  onClick={() => selectLocation(row.locationId)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                      #{row.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{row.locationName}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.orders} orders · {row.revenueShare ?? 0}% share
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold tabular-nums">{formatCurrency(row.revenue)}</p>
                    <p className="text-xs">
                      <ComparisonHint value={row.vsAvgRevenue} />
                    </p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Side-by-side comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <MultiLocationComparisonTable snapshot={snapshot} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {selectedLocation ? (
            <Card data-testid="enterprise-location-drilldown">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {selectedLocation.locationName}
                </CardTitle>
                <CardDescription>Location drill-down</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Badge variant={LOCATION_STATUS_BADGE[selectedLocation.status]} className="rounded-full">
                  {LOCATION_STATUS_LABEL[selectedLocation.status]}
                </Badge>
                <dl className="grid grid-cols-2 gap-2">
                  <Metric label="Revenue" value={formatCurrency(selectedLocation.revenue)} />
                  <Metric label="Orders" value={String(selectedLocation.orders)} />
                  <Metric
                    label="Labor %"
                    value={selectedLocation.laborPct == null ? "—" : `${selectedLocation.laborPct}%`}
                  />
                  <Metric
                    label="Food cost %"
                    value={selectedLocation.foodCostPct == null ? "—" : `${selectedLocation.foodCostPct}%`}
                  />
                  <Metric
                    label="Avg ticket"
                    value={
                      selectedLocation.avgOrderValue == null
                        ? "—"
                        : formatCurrency(selectedLocation.avgOrderValue)
                    }
                  />
                  <Metric label="Routes / tasks" value={`${selectedLocation.routes} / ${selectedLocation.tasks}`} />
                </dl>
                <Button asChild size="sm" className="w-full rounded-full">
                  <Link href={`/dashboard/locations/${selectedLocation.locationId}/reports`}>
                    Full location reports
                  </Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => selectLocation(null)}
                >
                  Clear selection
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Select a location from the ranking or alerts to drill down.
              </CardContent>
            </Card>
          )}

          {snapshot.dailyTrend.length > 0 ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Network trend</CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsDailyArea
                  data={snapshot.dailyTrend.map((row) => ({ date: row.date, value: row.revenue }))}
                  formatValue={(n) => formatCurrency(n)}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {snapshot.locations.some((r) => r.revenue > 0) ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by location</CardTitle>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={snapshot.locations
                .filter((row) => row.revenue > 0)
                .map((row) => ({ label: row.locationName, value: row.revenue }))}
              formatValue={formatCurrency}
            />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

function RollupStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

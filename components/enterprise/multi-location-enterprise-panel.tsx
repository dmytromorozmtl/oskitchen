"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight, GitCompare, MapPin, Search } from "lucide-react";

import { MultiLocationMapView } from "@/components/enterprise/multi-location-map-view";
import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { MultiLocationComparisonTable } from "@/components/dashboard/multi-location-comparison-table";
import { MultiLocationPdfExportButton } from "@/components/dashboard/multi-location-pdf-export-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  const { snapshot, rollup, selectedLocation, alerts, basePath, filters, v2 } = dashboard;
  const tableRows = v2.paginatedTableRanks
    .map((rank) => snapshot.locations.find((row) => row.locationId === rank.locationId))
    .filter((row): row is NonNullable<typeof row> => row != null);
  const rollupExportHref = buildMultiLocationRollupExportHref({
    from: filters.from,
    to: filters.to,
    locationId: filters.locationId ?? undefined,
    brandId: filters.brandId ?? undefined,
  });

  function pushView(patch: Record<string, string | null | undefined>) {
    const params = new URLSearchParams(window.location.search);
    for (const [key, value] of Object.entries(patch)) {
      if (value == null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function selectLocation(locationId: string | null) {
    pushView({ locationId });
  }

  function setCompareSlot(slot: "compareA" | "compareB", locationId: string) {
    pushView({ [slot]: locationId });
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
            All locations on one screen — revenue, orders, labor, and food cost with network comparison,
            drill-down, and side-by-side pairing for 100+ site networks.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {v2.scaleTier === "enterprise" ? (
              <Badge variant="secondary" className="rounded-full" data-testid="multi-location-enterprise-scale-badge">
                Enterprise scale — {snapshot.totalLocations} locations
              </Badge>
            ) : null}
            <Badge variant="outline" className="rounded-full">
              Capacity {v2.locationCapacity}+ sites
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <MultiLocationPdfExportButton snapshot={snapshot} />
          <Button asChild variant="outline" size="sm" className="rounded-full" data-testid="multi-location-rollup-csv-export">
            <a href={rollupExportHref} download>
              Export rollup CSV
            </a>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/multi-brand">Multi-brand</Link>
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

      <MultiLocationMapView
        locations={snapshot.locations}
        selectedLocationId={filters.locationId}
        onSelectLocation={selectLocation}
      />

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

      {v2.comparisonPair ? (
        <Card data-testid="multi-location-comparison-pair">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompare className="h-4 w-4" aria-hidden />
              Side-by-side comparison
            </CardTitle>
            <CardDescription>
              {v2.comparisonPair.locationA.locationName} vs {v2.comparisonPair.locationB.locationName}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
            <CompareStat
              label="Revenue delta"
              value={`${v2.comparisonPair.revenueDelta >= 0 ? "+" : ""}${formatCurrency(v2.comparisonPair.revenueDelta)}`}
              hint={
                v2.comparisonPair.revenueDeltaPct != null
                  ? `${v2.comparisonPair.revenueDeltaPct >= 0 ? "+" : ""}${v2.comparisonPair.revenueDeltaPct}% vs B`
                  : undefined
              }
            />
            <CompareStat
              label="Orders delta"
              value={`${v2.comparisonPair.ordersDelta >= 0 ? "+" : ""}${v2.comparisonPair.ordersDelta}`}
            />
            <CompareStat
              label="Labor % delta"
              value={
                v2.comparisonPair.laborPctDelta == null
                  ? "—"
                  : `${v2.comparisonPair.laborPctDelta >= 0 ? "+" : ""}${v2.comparisonPair.laborPctDelta} pts`
              }
            />
            <CompareStat
              label="Food cost % delta"
              value={
                v2.comparisonPair.foodCostPctDelta == null
                  ? "—"
                  : `${v2.comparisonPair.foodCostPctDelta >= 0 ? "+" : ""}${v2.comparisonPair.foodCostPctDelta} pts`
              }
            />
          </CardContent>
        </Card>
      ) : null}

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
              <CardDescription>
                Tap to drill down · use A/B to pick comparison pair · {v2.filteredRankCount} locations
                {v2.rankPageCount > 1 ? ` · page ${v2.rankPage}/${v2.rankPageCount}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const form = event.currentTarget;
                  const q = new FormData(form).get("q")?.toString() ?? "";
                  pushView({ q, page: "1", tablePage: "1" });
                }}
              >
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    name="q"
                    defaultValue={v2.rankSearchQuery}
                    placeholder="Search locations…"
                    className="pl-9"
                    data-testid="multi-location-search-input"
                  />
                </div>
                <Button type="submit" variant="outline" size="sm" className="rounded-full">
                  Search
                </Button>
              </form>
              <div className="space-y-2">
              {v2.paginatedRanks.map((row) => (
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
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatCurrency(row.revenue)}</p>
                      <p className="text-xs">
                        <ComparisonHint value={row.vsAvgRevenue} />
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0 text-[10px]"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCompareSlot("compareA", row.locationId);
                        }}
                      >
                        A
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 rounded-full p-0 text-[10px]"
                        onClick={(event) => {
                          event.stopPropagation();
                          setCompareSlot("compareB", row.locationId);
                        }}
                      >
                        B
                      </Button>
                    </div>
                  </div>
                </button>
              ))}
              </div>
              {v2.rankPageCount > 1 ? (
                <PaginationBar
                  page={v2.rankPage}
                  pageCount={v2.rankPageCount}
                  onPage={(page) => pushView({ page: String(page) })}
                />
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Side-by-side comparison</CardTitle>
              <CardDescription>
                Network table{v2.tablePageCount > 1 ? ` · page ${v2.tablePage}/${v2.tablePageCount}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <MultiLocationComparisonTable snapshot={snapshot} rows={tableRows} />
              {v2.tablePageCount > 1 ? (
                <PaginationBar
                  page={v2.tablePage}
                  pageCount={v2.tablePageCount}
                  onPage={(page) => pushView({ tablePage: String(page) })}
                />
              ) : null}
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

function CompareStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold tabular-nums">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function PaginationBar({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm" data-testid="multi-location-pagination">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>
      <span className="text-muted-foreground">
        Page {page} of {pageCount}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

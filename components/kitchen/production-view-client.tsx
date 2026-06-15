"use client";

import Link from "next/link";
import { AlertTriangle, Clock3, Factory } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { KDS_PRODUCTION_VIEW_ROUTE } from "@/lib/kitchen/kds-production-view";
import type { ProductionViewSnapshot } from "@/lib/kitchen/kds-production-view";
import { KDS_MULTI_STATION_MIN_STATIONS } from "@/lib/kitchen/kds-multi-station-policy";
import { cn } from "@/lib/utils";

type ProductionViewClientProps = {
  snapshot: ProductionViewSnapshot;
};

function formatEta(minutes: number): string {
  if (minutes <= 1) return "~1 min";
  if (minutes < 60) return `~${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder > 0 ? `~${hours}h ${remainder}m` : `~${hours}h`;
}

export function ProductionViewClient({ snapshot }: ProductionViewClientProps) {
  return (
    <div className="space-y-6" data-testid="kds-production-view-root">
      {snapshot.stations.length >= KDS_MULTI_STATION_MIN_STATIONS ? (
        <p
          className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
          data-testid="kds-multi-station-count"
        >
          Multi-station routing · {snapshot.stations.length} stations
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Active tickets</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{snapshot.totalActive}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Kitchen ETA</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Clock3 className="h-5 w-5 text-primary" aria-hidden />
              {formatEta(snapshot.kitchenEtaMinutes)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card
          className={cn(
            "border-border/80 shadow-sm",
            snapshot.bottleneckStation ? "border-amber-500/40 bg-amber-500/5" : "",
          )}
        >
          <CardHeader className="pb-2">
            <CardDescription>Bottleneck</CardDescription>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {snapshot.bottleneckStation ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
                  {snapshot.bottleneckStation}
                </>
              ) : (
                "Clear"
              )}
            </CardTitle>
            {snapshot.bottleneckStation ? (
              <p className="text-xs text-muted-foreground">
                Avg wait {snapshot.bottleneckDelayMinutes} min · clear {formatEta(snapshot.kitchenEtaMinutes)}
              </p>
            ) : null}
          </CardHeader>
        </Card>
      </div>

      {snapshot.totalActive === 0 ? (
        <Card className="border-dashed border-border/80 shadow-sm" data-testid="kds-production-view-empty">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No active production tickets — new POS and channel orders will route across{" "}
            {snapshot.stations.length} kitchen stations here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {snapshot.stations
            .filter((station) => station.activeItems > 0)
            .map((station) => (
            <Card
              key={station.station}
              className={cn(
                "border-border/80 shadow-sm",
                station.isBottleneck && "ring-1 ring-amber-500/50",
              )}
              data-testid="kds-production-station-card"
            >
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Factory className="h-4 w-4 text-muted-foreground" aria-hidden />
                      {station.station}
                    </CardTitle>
                    <CardDescription>
                      {station.activeItems} active · ETA {formatEta(station.estimatedClearMinutes)}
                    </CardDescription>
                  </div>
                  {station.isBottleneck ? (
                    <Badge variant="outline" className="border-amber-500/50 text-amber-700">
                      Bottleneck
                    </Badge>
                  ) : null}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Station load</span>
                    <span className="tabular-nums">{station.loadPercent}%</span>
                  </div>
                  <Progress value={station.loadPercent} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">In progress</dt>
                    <dd className="font-medium tabular-nums">{station.inProgressItems}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Queued</dt>
                    <dd className="font-medium tabular-nums">{station.queuedItems}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Overdue</dt>
                    <dd className="font-medium tabular-nums text-amber-700">{station.overdueItems}</dd>
                  </div>
                </dl>
                <ul className="space-y-2 border-t border-border/70 pt-3">
                  {station.items.slice(0, 5).map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-2">
                      <span className="line-clamp-2">
                        {item.quantity}× {item.title}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {item.minutesWaiting}m
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Snapshot {snapshot.generatedAtIso.slice(11, 19)} UTC ·{" "}
        <Link href="/dashboard/kitchen" className="text-primary underline-offset-2 hover:underline">
          Open KDS
        </Link>{" "}
        · route {KDS_PRODUCTION_VIEW_ROUTE}
      </p>
    </div>
  );
}

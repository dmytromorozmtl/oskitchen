"use client";

import Link from "next/link";
import { AlertTriangle, Gauge, Timer, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { KDS_MANAGER_VIEW_ROUTE, type ManagerViewSnapshot } from "@/lib/kitchen/kds-manager-view";
import { cn } from "@/lib/utils";

type ManagerViewClientProps = {
  snapshot: ManagerViewSnapshot;
};

function formatMinutes(value: number | null): string {
  if (value == null) return "—";
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  return remainder > 0 ? `${hours}h ${remainder}m` : `${hours}h`;
}

function scoreTone(score: number): string {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-amber-600";
  return "text-rose-600";
}

export function ManagerViewClient({ snapshot }: ManagerViewClientProps) {
  return (
    <div className="space-y-6" data-testid="kds-manager-view-root">
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Completed today</CardDescription>
            <CardTitle className="text-3xl tabular-nums">
              {snapshot.performance.ticketsCompletedToday}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Avg ticket time</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {formatMinutes(snapshot.performance.avgTicketMinutes)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>On-time rate</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {snapshot.performance.onTimeRatePercent}%
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1">
              <Gauge className="h-4 w-4" aria-hidden />
              Efficiency
            </CardDescription>
            <CardTitle
              className={cn("text-2xl tabular-nums", scoreTone(snapshot.performance.efficiencyScore))}
              data-testid="kds-manager-efficiency-score"
            >
              {snapshot.performance.efficiencyScore}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm" data-testid="kds-manager-delays-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
              Delays
            </CardTitle>
            <CardDescription>Overdue tickets and expo backlog pressure.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Overdue tickets</p>
              <p className="text-2xl font-semibold tabular-nums">{snapshot.delays.overdueTickets}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Delayed expo</p>
              <p className="text-2xl font-semibold tabular-nums">{snapshot.delays.delayedExpoTickets}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bottleneck</p>
              <p className="font-medium">{snapshot.delays.bottleneckStation ?? "None"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Oldest wait</p>
              <p className="font-medium tabular-nums">{snapshot.delays.oldestWaitMinutes} min</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm" data-testid="kds-manager-efficiency-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
              Flow efficiency
            </CardTitle>
            <CardDescription>Ready vs waiting backlog and kitchen ETA.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Ready backlog</p>
              <p className="text-2xl font-semibold tabular-nums">{snapshot.efficiency.readyBacklog}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Waiting backlog</p>
              <p className="text-2xl font-semibold tabular-nums">{snapshot.efficiency.waitingBacklog}</p>
            </div>
            <div>
              <p className="text-muted-foreground">In progress</p>
              <p className="text-2xl font-semibold tabular-nums">{snapshot.efficiency.inProgressItems}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Kitchen ETA</p>
              <p className="flex items-center gap-1 font-medium tabular-nums">
                <Timer className="h-4 w-4" aria-hidden />
                {formatMinutes(snapshot.efficiency.kitchenEtaMinutes)}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle>Station performance</CardTitle>
          <CardDescription>Per-station throughput, delays, and efficiency score.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {snapshot.stations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No station activity yet today.</p>
          ) : (
            snapshot.stations.map((station) => (
              <div key={station.station} className="space-y-2" data-testid="kds-manager-station-row">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{station.station}</p>
                    <p className="text-xs text-muted-foreground">
                      {station.completedToday} done · {station.activeItems} active ·{" "}
                      {station.overdueItems} overdue
                    </p>
                  </div>
                  <Badge variant="outline" className={scoreTone(station.efficiencyScore)}>
                    {station.efficiencyScore}
                  </Badge>
                </div>
                <Progress value={station.efficiencyScore} className="h-2" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm" data-testid="kds-manager-alerts">
        <CardHeader>
          <CardTitle>Manager alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {snapshot.alerts.map((alert) => (
              <li key={alert} className="rounded-lg border border-border/70 bg-muted/30 px-3 py-2">
                {alert}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Snapshot {snapshot.generatedAtIso.slice(11, 19)} UTC ·{" "}
        <Link href="/dashboard/kitchen/production" className="text-primary underline-offset-2 hover:underline">
          Production view
        </Link>{" "}
        ·{" "}
        <Link href="/dashboard/kitchen/expo" className="text-primary underline-offset-2 hover:underline">
          Expo view
        </Link>{" "}
        · route {KDS_MANAGER_VIEW_ROUTE}
      </p>
    </div>
  );
}

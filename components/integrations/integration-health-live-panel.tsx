import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Minus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { LiveIntegrationHealthDashboard } from "@/lib/integrations/integration-health-live-types";
import { cn } from "@/lib/utils";

const BAND_META = {
  healthy: {
    label: "Healthy",
    badge: "default" as const,
    scoreClass: "text-emerald-600 dark:text-emerald-400",
    ringClass: "border-emerald-500/40",
  },
  watch: {
    label: "Watch",
    badge: "secondary" as const,
    scoreClass: "text-amber-600 dark:text-amber-400",
    ringClass: "border-amber-500/40",
  },
  critical: {
    label: "Critical",
    badge: "destructive" as const,
    scoreClass: "text-rose-600 dark:text-rose-400",
    ringClass: "border-rose-500/40",
  },
} as const;

function TrendIcon({ direction }: { direction: LiveIntegrationHealthDashboard["rows"][number]["trend"]["direction"] }) {
  if (direction === "improving") {
    return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" aria-hidden />;
  }
  if (direction === "declining") {
    return <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" aria-hidden />;
  }
  if (direction === "stable") {
    return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
  }
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
}

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) {
    return <div className="h-8 w-full rounded bg-muted/40" aria-hidden />;
  }

  const max = Math.max(...scores, 100);
  const min = Math.min(...scores, 0);
  const range = Math.max(1, max - min);
  const width = 72;
  const height = 24;
  const step = width / (scores.length - 1);
  const points = scores
    .map((score, index) => {
      const x = index * step;
      const y = height - ((score - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-8 w-[72px]" aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary/70"
        points={points}
      />
    </svg>
  );
}

export function IntegrationHealthLivePanel({
  dashboard,
}: {
  dashboard: LiveIntegrationHealthDashboard;
}) {
  const fleetMeta = BAND_META[dashboard.fleetBand];

  return (
    <div className="space-y-6" data-testid="integration-health-live-panel">
      <Card className={cn("border", fleetMeta.ringClass)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            LIVE fleet health
          </CardTitle>
          <CardDescription>
            Monitoring {dashboard.monitoredCount}/{dashboard.expectedLiveCount} LIVE integrations — scores,
            7-day trends, and predictive alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div>
            <p className={cn("text-4xl font-semibold tabular-nums", fleetMeta.scoreClass)}>
              {dashboard.fleetScore}
            </p>
            <p className="text-xs text-muted-foreground">Fleet score / 100</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Badge variant="outline" className="rounded-full">
              {dashboard.healthyCount} healthy
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {dashboard.watchCount} watch
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {dashboard.criticalCount} critical
            </Badge>
            <Badge variant={fleetMeta.badge} className="rounded-full">
              {fleetMeta.label}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {dashboard.alerts.length > 0 ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
              Active alerts ({dashboard.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {dashboard.alerts.slice(0, 12).map((alert) => (
              <p key={alert.id} className="text-muted-foreground">
                <span
                  className={cn(
                    "mr-2 font-medium uppercase",
                    alert.severity === "critical" ? "text-rose-600" : "text-amber-600",
                  )}
                >
                  {alert.severity}
                </span>
                {alert.message}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {dashboard.rows.map((row) => {
          const meta = BAND_META[row.band];
          return (
            <Card
              key={row.integrationId}
              className={cn("border-border/80", meta.ringClass)}
              data-testid={`live-health-row-${row.integrationId}`}
            >
              <CardHeader className="space-y-2 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <CardTitle className="truncate text-sm font-medium">{row.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {row.connectionStatus === "none"
                        ? "Not connected"
                        : `${row.connectionStatus}${row.connectionName ? ` · ${row.connectionName}` : ""}`}
                    </CardDescription>
                  </div>
                  <p className={cn("text-2xl font-semibold tabular-nums", meta.scoreClass)}>
                    {row.healthScore}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={meta.badge} className="rounded-full text-[10px] uppercase">
                    {meta.label}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] uppercase">
                    env {row.envStatus}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <TrendIcon direction={row.trend.direction} />
                    {row.trend.direction.replace(/_/g, " ")}
                    {row.trend.delta7d !== 0 ? ` (${row.trend.delta7d > 0 ? "+" : ""}${row.trend.delta7d})` : ""}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Sparkline scores={row.trend.recentScores} />
                {row.alerts.length > 0 ? (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{row.alerts[0]?.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">No active alerts.</p>
                )}
                <Button asChild variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs">
                  <Link href={row.setupRoute}>Open integration</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

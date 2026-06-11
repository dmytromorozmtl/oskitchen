import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IntegrationHealthSparkline } from "@/components/integrations/integration-health-sparkline";
import {
  INTEGRATION_HEALTH_DASHBOARD_BAND_META,
  INTEGRATION_HEALTH_DASHBOARD_ROW_SCORE_CLASS,
  integrationHealthScoreCardTestId,
} from "@/lib/design/integration-health-dashboard-policy";
import type { LiveIntegrationHealthRow } from "@/lib/integrations/integration-health-live-types";
import { cn } from "@/lib/utils";

function TrendIcon({
  direction,
}: {
  direction: LiveIntegrationHealthRow["trend"]["direction"];
}) {
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

export function IntegrationHealthScoreCard({ row }: { row: LiveIntegrationHealthRow }) {
  const meta = INTEGRATION_HEALTH_DASHBOARD_BAND_META[row.band];

  return (
    <Card
      className={cn("border-border/80", meta.ringClass)}
      data-testid={integrationHealthScoreCardTestId(row.integrationId)}
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
          <p className={cn(INTEGRATION_HEALTH_DASHBOARD_ROW_SCORE_CLASS, meta.scoreClass)}>
            {row.healthScore}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={meta.badge} className="rounded-full text-xs uppercase">
            {meta.label}
          </Badge>
          <Badge variant="outline" className="rounded-full text-xs uppercase">
            env {row.envStatus}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <TrendIcon direction={row.trend.direction} />
            {row.trend.direction.replace(/_/g, " ")}
            {row.trend.delta7d !== 0
              ? ` (${row.trend.delta7d > 0 ? "+" : ""}${row.trend.delta7d})`
              : ""}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <IntegrationHealthSparkline scores={row.trend.recentScores} />
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
}

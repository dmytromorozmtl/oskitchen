import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { IntegrationHealthAlertsPanel } from "@/components/integrations/integration-health-alerts-panel";
import { IntegrationHealthScoreCard } from "@/components/integrations/integration-health-score-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_DASHBOARD_BAND_META,
  INTEGRATION_HEALTH_DASHBOARD_FLEET_SCORE_CLASS,
  INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID,
  INTEGRATION_HEALTH_DASHBOARD_SCORE_GRID_CLASS,
} from "@/lib/design/integration-health-dashboard-policy";
import type { LiveIntegrationHealthDashboard } from "@/lib/integrations/integration-health-live-types";
import { cn } from "@/lib/utils";

export function IntegrationHealthLivePanel({
  dashboard,
}: {
  dashboard: LiveIntegrationHealthDashboard;
}) {
  const fleetMeta = INTEGRATION_HEALTH_DASHBOARD_BAND_META[dashboard.fleetBand];

  return (
    <div className="space-y-6" data-testid={INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID}>
      <Card className={cn("border", fleetMeta.ringClass)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            LIVE fleet health
          </CardTitle>
          <CardDescription>
            Monitoring {dashboard.monitoredCount}/{dashboard.expectedLiveCount} LIVE integrations —
            scores, 7-day trends, and predictive alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div>
            <p className={cn(INTEGRATION_HEALTH_DASHBOARD_FLEET_SCORE_CLASS, fleetMeta.scoreClass)}>
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

      <IntegrationHealthAlertsPanel alerts={dashboard.alerts} />

      <div className={INTEGRATION_HEALTH_DASHBOARD_SCORE_GRID_CLASS}>
        {dashboard.rows.map((row) => (
          <IntegrationHealthScoreCard key={row.integrationId} row={row} />
        ))}
      </div>
    </div>
  );
}

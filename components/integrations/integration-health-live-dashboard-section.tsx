import Link from "next/link";

import { IntegrationHealthAlertsPanel } from "@/components/integrations/integration-health-alerts-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_DASHBOARD_BAND_META,
  INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID,
} from "@/lib/design/integration-health-dashboard-policy";
import type { LiveIntegrationHealthDashboard } from "@/lib/integrations/integration-health-live-types";
import { cn } from "@/lib/utils";

/** Compact LIVE health strip on the main Integration Health page (P1-70). */
export function IntegrationHealthLiveDashboardSection({
  dashboard,
}: {
  dashboard: LiveIntegrationHealthDashboard;
}) {
  const fleetMeta = INTEGRATION_HEALTH_DASHBOARD_BAND_META[dashboard.fleetBand];

  return (
    <section className="space-y-4" data-testid={INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">LIVE health scores</h2>
          <p className="text-sm text-muted-foreground">
            Fleet score, 7-day trends, and predictive alerts for certified integrations.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/dashboard/integration-health/live">Open full dashboard</Link>
        </Button>
      </div>
      <Card className={cn("border", fleetMeta.ringClass)}>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className={cn("text-3xl font-semibold tabular-nums", fleetMeta.scoreClass)}>
              {dashboard.fleetScore}
            </p>
            <p className="text-xs text-muted-foreground">Fleet score · {fleetMeta.label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-full">
              {dashboard.alerts.length} alerts
            </Badge>
            <Badge variant="outline" className="rounded-full">
              {dashboard.monitoredCount} monitored
            </Badge>
          </div>
        </CardContent>
      </Card>
      <IntegrationHealthAlertsPanel alerts={dashboard.alerts.slice(0, 4)} limit={4} />
    </section>
  );
}

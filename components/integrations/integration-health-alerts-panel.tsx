import { AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  INTEGRATION_HEALTH_DASHBOARD_ALERTS_CARD_CLASS,
  INTEGRATION_HEALTH_DASHBOARD_ALERTS_TEST_ID,
} from "@/lib/design/integration-health-dashboard-policy";
import type { LiveIntegrationHealthAlert } from "@/lib/integrations/integration-health-live-types";
import { cn } from "@/lib/utils";

export function IntegrationHealthAlertsPanel({
  alerts,
  limit = 12,
}: {
  alerts: LiveIntegrationHealthAlert[];
  limit?: number;
}) {
  if (alerts.length === 0) return null;

  return (
    <Card className={INTEGRATION_HEALTH_DASHBOARD_ALERTS_CARD_CLASS} data-testid={INTEGRATION_HEALTH_DASHBOARD_ALERTS_TEST_ID}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
          Active alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {alerts.slice(0, limit).map((alert) => (
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
  );
}

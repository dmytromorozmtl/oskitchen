import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IntegrationHealthSummary } from "@/services/developer/integration-health-service";

export function IntegrationHealthSummaryPanel({ summary }: { summary: IntegrationHealthSummary }) {
  const Icon =
    summary.overall === "healthy" ? CheckCircle2 : summary.overall === "degraded" ? AlertTriangle : XCircle;
  const tone =
    summary.overall === "healthy"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
      : summary.overall === "degraded"
        ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
        : "border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200";

  const title =
    summary.overall === "healthy"
      ? "All systems operational"
      : summary.overall === "degraded"
        ? "Needs attention"
        : "Action required";

  return (
    <Card className={tone}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          Integration command center — {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-sm">
        <Badge variant="outline" className="rounded-full">
          {summary.healthyCount} healthy
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.degradedCount} degraded
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {summary.downCount} down
        </Badge>
        {summary.stripeConfigured ? (
          <Badge variant="secondary" className="rounded-full">
            Stripe configured
          </Badge>
        ) : (
          <Badge variant="destructive" className="rounded-full">
            Stripe missing
          </Badge>
        )}
        {summary.emailConfigured ? (
          <Badge variant="secondary" className="rounded-full">
            Email configured
          </Badge>
        ) : (
          <Badge variant="destructive" className="rounded-full">
            Email missing
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}

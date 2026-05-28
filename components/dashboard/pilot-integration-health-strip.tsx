import Link from "next/link";
import { AlertTriangle, Cable, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";
import { cn } from "@/lib/utils";

export function PilotIntegrationHealthStrip(props: { model: PilotIntegrationHealthStripModel }) {
  const { model } = props;
  const Icon =
    model.overall === "healthy" ? CheckCircle2 : model.overall === "degraded" ? AlertTriangle : XCircle;
  const tone =
    model.overall === "healthy"
      ? "border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20"
      : model.overall === "degraded"
        ? "border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20"
        : "border-rose-200/80 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20";

  return (
    <Card className={cn("shadow-sm", tone)} data-testid="pilot-integration-health-strip">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cable className="h-5 w-5 text-muted-foreground" aria-hidden />
              <Icon className="h-5 w-5" aria-hidden />
              Pilot integration health
            </CardTitle>
            <CardDescription>{model.headline}</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/integration-health">Full health dashboard</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{model.healthyCount} healthy</Badge>
          <Badge variant="outline">{model.degradedCount} degraded</Badge>
          <Badge variant="outline">{model.downCount} down</Badge>
          {model.failedWebhookCount > 0 ? (
            <Badge variant="destructive">{model.failedWebhookCount} webhook backlog</Badge>
          ) : (
            <Badge variant="secondary">No webhook backlog</Badge>
          )}
        </div>

        {model.connections.length ? (
          <div className="space-y-2">
            {model.connections.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium leading-tight">
                    {row.name}{" "}
                    <span className="font-normal text-muted-foreground">({row.provider})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Last sync: {row.lastSyncLabel}</p>
                </div>
                <Badge variant={row.hasError ? "destructive" : "outline"}>{row.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No saved channel connections yet — configure Woo/Shopify from Sales channels before pilot orders
            flow in.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

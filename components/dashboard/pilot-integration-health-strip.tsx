import Link from "next/link";
import { AlertTriangle, ArrowRight, Cable, CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";
import type { PilotIntegrationHealthCommercialInflectionFootnote } from "@/lib/integrations/pilot-integration-health-commercial-inflection-era28";
import { cn } from "@/lib/utils";

export function PilotIntegrationHealthStrip(props: {
  model: PilotIntegrationHealthStripModel & {
    commercialInflection?: PilotIntegrationHealthCommercialInflectionFootnote | null;
  };
}) {
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

        {model.liveProofRows.length > 0 ? (
          <div className="space-y-2" data-testid="pilot-integration-live-proof-rows">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Woo / Shopify live proof
            </p>
            {model.liveProofRows.map((row) => (
              <Link
                key={row.id}
                href={row.href}
                data-testid={`pilot-integration-live-proof-${row.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{row.label}</p>
                    <Badge
                      variant={row.tone === "urgent" ? "destructive" : "secondary"}
                      className="rounded-full text-[10px] font-normal"
                    >
                      {row.statusLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{row.detail}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            ))}
          </div>
        ) : null}

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

        {"commercialInflection" in model && model.commercialInflection ? (
          <div
            className="rounded-xl border border-violet-200/70 bg-violet-50/30 px-3 py-2 text-xs dark:border-violet-900/40 dark:bg-violet-950/20"
            data-testid="pilot-integration-commercial-inflection-footnote"
          >
            <p className="font-medium text-violet-950 dark:text-violet-100">
              {model.commercialInflection.scorecardLabel}
            </p>
            <p className="mt-1 text-muted-foreground">
              {model.commercialInflection.registryHonestyLine} · {model.commercialInflection.topBlockerTitle}
            </p>
            <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
              <Link href={model.commercialInflection.platformOpsHref}>Commercial inflection matrix</Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

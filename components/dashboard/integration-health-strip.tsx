import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Cable,
  CheckCircle2,
  ExternalLink,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PilotIntegrationHealthStripModel } from "@/lib/integrations/pilot-integration-health-strip-era18";
import type { PilotIntegrationHealthCommercialInflectionFootnote } from "@/lib/integrations/pilot-integration-health-commercial-inflection-era28";
import { cn } from "@/lib/utils";

export type IntegrationHealthStripModel = PilotIntegrationHealthStripModel & {
  commercialInflection?: PilotIntegrationHealthCommercialInflectionFootnote | null;
};

const OVERALL_META = {
  healthy: {
    label: "Healthy",
    Icon: CheckCircle2,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    cardClass:
      "border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-background dark:border-emerald-900/40 dark:from-emerald-950/30",
    progressClass: "bg-emerald-500",
  },
  degraded: {
    label: "Degraded",
    Icon: AlertTriangle,
    iconClass: "text-amber-600 dark:text-amber-400",
    cardClass:
      "border-amber-200/80 bg-gradient-to-br from-amber-50/70 to-background dark:border-amber-900/40 dark:from-amber-950/25",
    progressClass: "bg-amber-500",
  },
  down: {
    label: "Action required",
    Icon: XCircle,
    iconClass: "text-rose-600 dark:text-rose-400",
    cardClass:
      "border-rose-200/80 bg-gradient-to-br from-rose-50/70 to-background dark:border-rose-900/40 dark:from-rose-950/25",
    progressClass: "bg-rose-500",
  },
} as const;

function healthScorePercent(model: IntegrationHealthStripModel): number {
  const total = model.healthyCount + model.degradedCount + model.downCount;
  if (total === 0) return model.failedWebhookCount > 0 ? 40 : 100;
  return Math.round((model.healthyCount / total) * 100);
}

/** Today / briefing Integration Health moat strip — honest pilot channel status. */
export function IntegrationHealthStrip({ model }: { model: IntegrationHealthStripModel }) {
  const meta = OVERALL_META[model.overall];
  const StatusIcon = meta.Icon;
  const score = healthScorePercent(model);
  const connectionTotal = model.healthyCount + model.degradedCount + model.downCount;

  return (
    <Card
      className={cn("overflow-hidden shadow-sm", meta.cardClass)}
      data-testid="pilot-integration-health-strip"
      role="status"
      aria-label={`Integration health: ${meta.label}`}
    >
      <CardHeader className="space-y-4 pb-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-background/80 shadow-sm ring-1 ring-border/60"
              aria-hidden
            >
              <Cable className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">Integration Health</CardTitle>
                <Badge
                  variant="outline"
                  className={cn("rounded-full border-current/30 bg-background/60", meta.iconClass)}
                >
                  <StatusIcon className="mr-1 h-3 w-3" aria-hidden />
                  {meta.label}
                </Badge>
              </div>
              <CardDescription className="text-sm leading-relaxed">{model.headline}</CardDescription>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
            <Link href="/dashboard/integration-health">
              Full dashboard
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Channel health score</span>
            <span className="font-medium tabular-nums text-foreground">{score}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={score}
            aria-label="Channel health score"
            className="relative h-2 w-full overflow-hidden rounded-full bg-background/60"
          >
            <div
              className={cn("h-full rounded-full transition-[width] duration-300", meta.progressClass)}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Badge variant="outline" className="shrink-0 snap-start rounded-full bg-background/60">
            {model.healthyCount} healthy
          </Badge>
          <Badge variant="outline" className="shrink-0 snap-start rounded-full bg-background/60">
            {model.degradedCount} degraded
          </Badge>
          <Badge variant="outline" className="shrink-0 snap-start rounded-full bg-background/60">
            {model.downCount} down
          </Badge>
          {model.failedWebhookCount > 0 ? (
            <Badge variant="destructive" className="shrink-0 snap-start rounded-full">
              {model.failedWebhookCount} webhook backlog
            </Badge>
          ) : (
            <Badge variant="secondary" className="shrink-0 snap-start rounded-full">
              No webhook backlog
            </Badge>
          )}
          {connectionTotal > 0 ? (
            <Badge variant="outline" className="shrink-0 snap-start rounded-full bg-background/60">
              {connectionTotal} connected
            </Badge>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {model.liveProofRows.length > 0 ? (
          <div className="space-y-2" data-testid="pilot-integration-live-proof-rows">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Woo / Shopify live proof
            </p>
            {model.liveProofRows.map((row) => (
              <Link
                key={row.id}
                href={row.href}
                data-testid={`pilot-integration-live-proof-${row.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/90 px-3 py-2.5 text-sm shadow-sm transition-colors hover:bg-muted/40"
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
                  <p className="mt-0.5 text-xs text-muted-foreground">{row.detail}</p>
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
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/90 px-3 py-2.5 text-sm shadow-sm",
                  row.hasError
                    ? "border-l-4 border-l-rose-500"
                    : "border-l-4 border-l-emerald-500/70",
                )}
              >
                <div className="min-w-0">
                  <p className="font-medium leading-tight">
                    {row.name}{" "}
                    <span className="font-normal text-muted-foreground">({row.provider})</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Last sync: {row.lastSyncLabel}</p>
                </div>
                <Badge variant={row.hasError ? "destructive" : "outline"} className="rounded-full">
                  {row.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-background/50 px-4 py-5 text-center">
            <p className="text-sm font-medium">No channel connections yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect WooCommerce or Shopify before pilot orders flow into Order Hub.
            </p>
            <Button asChild size="sm" variant="secondary" className="mt-3 rounded-full">
              <Link href="/dashboard/sales-channels/available">Connect sales channel</Link>
            </Button>
          </div>
        )}

        {model.commercialInflection ? (
          <div
            className="rounded-xl border border-violet-200/70 bg-violet-50/40 px-3 py-3 text-xs dark:border-violet-900/40 dark:bg-violet-950/20"
            data-testid="pilot-integration-commercial-inflection-footnote"
          >
            <p className="font-medium text-violet-950 dark:text-violet-100">
              {model.commercialInflection.scorecardLabel}
            </p>
            <p className="mt-1 text-muted-foreground">
              {model.commercialInflection.registryHonestyLine} · {model.commercialInflection.topBlockerTitle}
              {model.commercialInflection.p0VaultMissingCount > 0
                ? ` · vault ${model.commercialInflection.p0VaultMissingCount}/11 missing`
                : ""}
            </p>
            <p className="mt-1 text-muted-foreground">{model.commercialInflection.topBlockerDetail}</p>
            <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
              <Link href={model.commercialInflection.platformOpsHref}>
                {model.commercialInflection.milestone === "p0_ops_vault_blocked" &&
                model.commercialInflection.platformOpsHref.includes("p0-staging-proof")
                  ? "Open P0 staging proof ops"
                  : "Commercial inflection matrix"}
              </Link>
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

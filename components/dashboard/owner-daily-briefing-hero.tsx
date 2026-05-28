import Link from "next/link";
import { ArrowRight, LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  OwnerDailyBriefingAlert,
  OwnerDailyBriefingNextAction,
  OwnerDailyBriefingRankedAction,
  OwnerDailyBriefingTile,
} from "@/lib/briefing/owner-daily-briefing-era19";
import type { OwnerDailyBriefingPayload } from "@/services/briefing/owner-daily-briefing-service";
import { briefingTileLinkStateLabel } from "@/lib/briefing/owner-daily-briefing-tile-links-era19";
import type { OwnerDailyBriefingProductionCalendarSlice } from "@/lib/briefing/owner-daily-briefing-production-calendar-era19";
import type { OwnerDailyBriefingIntegrationHealthSlice } from "@/lib/briefing/owner-daily-briefing-integration-health-era19";
import type { OwnerDailyBriefingPilotReadinessSlice } from "@/lib/briefing/owner-daily-briefing-pilot-readiness-era19";
import { AlertTriangle, Cable, CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function nextActionCardClass(tone: OwnerDailyBriefingNextAction["tone"]): string {
  if (tone === "success") {
    return "border-emerald-200/80 bg-emerald-50/40 shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/20";
  }
  if (tone === "urgent") {
    return "border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20";
  }
  return "border-primary/25 bg-primary/[0.04] shadow-sm";
}

function tileToneClass(tone: OwnerDailyBriefingTile["tone"]): string {
  if (tone === "attention") {
    return "border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15";
  }
  if (tone === "success") {
    return "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10";
  }
  return "border-border/70 bg-background/80";
}

function severityBadge(severity: OwnerDailyBriefingRankedAction["severity"]): string {
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
    case "high":
      return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
    case "normal":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted/60 text-muted-foreground";
  }
}

function availabilityLabel(availability: OwnerDailyBriefingTile["availability"]): string | null {
  if (availability === "not_configured") return "Not configured";
  if (availability === "unavailable") return "Unavailable";
  return null;
}

export function OwnerDailyBriefingHero(props: { briefing: OwnerDailyBriefingPayload }) {
  const { briefing } = props;
  const { nextAction, topActions, heroTiles, alerts, summary, rolePackLabel, rolePackHeadline } =
    briefing;

  return (
    <section className="space-y-4" data-testid="owner-daily-briefing-hero">
      <Card className={nextActionCardClass(nextAction.tone)}>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <LayoutDashboard className="h-5 w-5 text-muted-foreground" aria-hidden />
                {rolePackLabel}
              </CardTitle>
              <CardDescription className="mt-1">{rolePackHeadline}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full capitalize" data-testid="briefing-role-pack">
                {briefing.rolePack}
              </Badge>
              <Badge variant="outline" className="rounded-full tabular-nums">
                Readiness {summary.readinessOverall}%
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Next best action
            </p>
            <p className="mt-1 font-medium">{nextAction.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{nextAction.detail}</p>
          </div>
          <Button
            asChild
            size="lg"
            className="h-12 w-full rounded-2xl text-base sm:w-auto"
            variant={nextAction.tone === "success" ? "default" : "secondary"}
          >
            <Link href={nextAction.href} data-testid="owner-daily-briefing-next-action">
              {nextAction.ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {topActions.length > 0 ? (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Next 3 actions</CardTitle>
            <CardDescription>
              Ranked by severity — each links to the exact workflow that unblocks progress.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {topActions.map((action, index) => (
              <RankedActionRow key={action.id} action={action} rank={index + 1} />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {briefing.showProductionCalendarLane && briefing.productionCalendar ? (
        <ProductionCalendarLane slice={briefing.productionCalendar} />
      ) : null}

      {briefing.showPilotReadinessLane && briefing.pilotReadiness ? (
        <PilotReadinessLane slice={briefing.pilotReadiness} />
      ) : null}

      {briefing.showIntegrationHealthLane && briefing.integrationHealth ? (
        <IntegrationHealthLane slice={briefing.integrationHealth} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {heroTiles.map((tile) => (
          <BriefingTileCard key={tile.id} tile={tile} />
        ))}
      </div>

      {alerts.length > 0 ? (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Risk radar</CardTitle>
            <CardDescription>
              {summary.alertCount} signal(s) — blockers, pilot gaps, and operational exceptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert) => (
              <BriefingAlertRow key={alert.id} alert={alert} />
            ))}
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function RankedActionRow(props: { action: OwnerDailyBriefingRankedAction; rank: number }) {
  const { action, rank } = props;

  return (
    <Link
      href={action.href}
      data-testid={`owner-briefing-action-${action.id}`}
      className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/15 px-3 py-3 text-sm transition-colors hover:bg-muted/35 sm:flex-row sm:items-start sm:justify-between"
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary">
            {rank}
          </span>
          <p className="font-medium">{action.title}</p>
          <Badge className={`rounded-full text-[10px] uppercase ${severityBadge(action.severity)}`}>
            {action.severity}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px] capitalize">
            {action.ownerRole}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{action.reason}</p>
        <p className="text-[11px] text-muted-foreground">
          Unblock: {action.unblockCondition}
        </p>
      </div>
      <ArrowRight className="mt-0.5 hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
    </Link>
  );
}

function BriefingTileCard(props: { tile: OwnerDailyBriefingTile }) {
  const { tile } = props;
  const availability = availabilityLabel(tile.availability);
  const linkStateLabel = briefingTileLinkStateLabel(tile.linkState);

  return (
    <Link
      href={tile.href}
      data-testid={`owner-briefing-tile-${tile.id}`}
      className={`block rounded-2xl border px-3 py-3 transition-colors hover:bg-muted/30 ${tileToneClass(tile.tone)} ${
        tile.linkState === "blocked" ? "ring-1 ring-amber-200/60 dark:ring-amber-900/40" : ""
      } ${tile.linkState === "setup_needed" ? "opacity-95" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {tile.label}
        </p>
        <div className="flex flex-wrap justify-end gap-1">
          {linkStateLabel ? (
            <Badge
              variant={tile.linkState === "blocked" ? "destructive" : "secondary"}
              className="rounded-full text-[10px]"
            >
              {linkStateLabel}
            </Badge>
          ) : null}
          {availability ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {availability}
            </Badge>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums">{tile.value}</p>
      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{tile.detail}</p>
      <p className="mt-2 text-[11px] text-muted-foreground/90 line-clamp-2">{tile.whyItMatters}</p>
    </Link>
  );
}

function BriefingAlertRow(props: { alert: OwnerDailyBriefingAlert }) {
  const { alert } = props;

  return (
    <Link
      href={alert.href}
      data-testid={`owner-briefing-alert-${alert.id}`}
      className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40"
    >
      <div>
        <p className="font-medium">{alert.title}</p>
        <p className="text-xs text-muted-foreground">{alert.detail}</p>
      </div>
      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </Link>
  );
}

function ProductionCalendarLane(props: { slice: OwnerDailyBriefingProductionCalendarSlice }) {
  const { slice } = props;
  const { summary } = slice;

  return (
    <Card
      className="border-border/80 bg-card/90 shadow-sm"
      data-testid="owner-briefing-production-calendar-lane"
    >
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">Production calendar — today</CardTitle>
            <CardDescription>
              Batch prep priorities from the planning calendar — no rush-hour SLO claim.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.calendarHref}>Open calendar</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!slice.hasPlanTasks ? (
          <p className="text-sm text-muted-foreground">
            No batches scheduled through today. Add production plan tasks on the calendar to track
            overdue and due-today prep.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <CalendarStat label="Overdue" value={summary.overdue} tone={summary.overdue > 0 ? "attention" : "neutral"} />
              <CalendarStat label="Due today" value={summary.dueToday} tone={summary.dueToday > 0 ? "attention" : "neutral"} />
              <CalendarStat label="In progress" value={summary.inProgress} tone="neutral" />
              <CalendarStat label="Completed" value={summary.completedToday} tone="success" />
            </div>
            {slice.attentionItems.length > 0 ? (
              <div className="space-y-2">
                {slice.attentionItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    data-testid={`owner-briefing-production-${item.id}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-2 text-sm hover:bg-muted/35"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                All calendar batches through today are complete or on track.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function CalendarStat(props: {
  label: string;
  value: number;
  tone: "attention" | "neutral" | "success";
}) {
  const toneClass =
    props.tone === "attention"
      ? "border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40"
      : props.tone === "success"
        ? "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30"
        : "border-border/70 bg-background/80";

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {props.label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{props.value}</p>
    </div>
  );
}

function PilotReadinessLane(props: { slice: OwnerDailyBriefingPilotReadinessSlice }) {
  const { slice } = props;
  const tone = slice.allClear
    ? "border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/15"
    : slice.hasUrgent
      ? "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
      : "border-border/80 bg-card/90";

  return (
    <Card className={cn("shadow-sm", tone)} data-testid="owner-briefing-pilot-readiness-lane">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" aria-hidden />
              Pilot readiness
            </CardTitle>
            <CardDescription>{slice.headline}</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.hubHref}>Open hub</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <BriefingStat
            label="SSO"
            value={slice.ssoLabel}
            tone={slice.ssoTone}
            compact
          />
          <BriefingStat
            label="Channel gaps"
            value={String(slice.channelIncompleteCount)}
            tone={slice.channelIncompleteCount > 0 ? "attention" : "neutral"}
          />
          <BriefingStat
            label="Go-live blockers"
            value={String(slice.goLiveBlockerCount)}
            tone={slice.goLiveBlockerCount > 0 ? "attention" : "neutral"}
          />
          <BriefingStat
            label="Signals"
            value={String(slice.totalSignals)}
            tone={slice.hasUrgent ? "attention" : slice.allClear ? "success" : "neutral"}
          />
        </div>
        {(slice.commercialDecisionLabel || slice.p0ProofStatusLabel) && (
          <div className="flex flex-wrap gap-2">
            {slice.commercialDecisionLabel ? (
              <Badge variant="destructive" className="rounded-full">
                {slice.commercialDecisionLabel}
              </Badge>
            ) : null}
            {slice.p0ProofStatusLabel ? (
              <Badge variant="outline" className="rounded-full">
                P0: {slice.p0ProofStatusLabel}
              </Badge>
            ) : null}
          </div>
        )}
        {slice.attentionItems.length > 0 ? (
          <div className="space-y-2">
            {slice.attentionItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                data-testid={`owner-briefing-pilot-${item.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-2 text-sm hover:bg-muted/35"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No workspace pilot blockers — confirm commercial evidence gates before paid cutover.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function IntegrationHealthLane(props: { slice: OwnerDailyBriefingIntegrationHealthSlice }) {
  const { slice } = props;
  const Icon =
    slice.overall === "healthy" ? CheckCircle2 : slice.overall === "degraded" ? AlertTriangle : XCircle;
  const tone =
    slice.overall === "healthy" && slice.allClear
      ? "border-emerald-200/80 bg-emerald-50/30 dark:border-emerald-900/40 dark:bg-emerald-950/15"
      : slice.overall === "degraded"
        ? "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
        : "border-rose-200/80 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20";

  return (
    <Card className={cn("shadow-sm", tone)} data-testid="owner-briefing-integration-health-lane">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Cable className="h-4 w-4 text-muted-foreground" aria-hidden />
              <Icon className="h-4 w-4" aria-hidden />
              Integration health
            </CardTitle>
            <CardDescription>{slice.headline}</CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.healthHref}>Full dashboard</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{slice.healthyCount} healthy</Badge>
          <Badge variant="outline">{slice.degradedCount} degraded</Badge>
          <Badge variant="outline">{slice.downCount} down</Badge>
          {slice.failedWebhookCount > 0 ? (
            <Badge variant="destructive">{slice.failedWebhookCount} webhook backlog</Badge>
          ) : (
            <Badge variant="secondary">No webhook backlog</Badge>
          )}
          {slice.channelSmokeOverall ? (
            <Badge
              variant={slice.channelSmokeOverall === "PASSED" ? "default" : "outline"}
              className="rounded-full"
            >
              Live smoke: {slice.channelSmokeOverall}
            </Badge>
          ) : null}
        </div>

        {slice.liveProofRows.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Woo / Shopify pilot proof
            </p>
            {slice.liveProofRows.map((row) => (
              <Link
                key={row.id}
                href={row.href}
                data-testid={`owner-briefing-integration-${row.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-muted/15 px-3 py-2 text-sm hover:bg-muted/35"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{row.label}</p>
                    <Badge
                      variant={row.tone === "urgent" ? "destructive" : "secondary"}
                      className="rounded-full text-[10px]"
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
        ) : slice.connections.length > 0 ? (
          <div className="space-y-2">
            {slice.connections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-muted/15 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{conn.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {conn.provider} · {conn.lastSyncLabel}
                  </p>
                </div>
                <Badge variant={conn.hasError ? "destructive" : "secondary"} className="rounded-full text-[10px]">
                  {conn.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No channel connections yet — connect Woo or Shopify from integration health.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BriefingStat(props: {
  label: string;
  value: string;
  tone: "success" | "attention" | "neutral";
  compact?: boolean;
}) {
  const toneClass =
    props.tone === "attention"
      ? "border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40"
      : props.tone === "success"
        ? "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30"
        : "border-border/70 bg-background/80";

  return (
    <div className={`rounded-xl border px-3 py-2 ${toneClass}`}>
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {props.label}
      </p>
      <p
        className={cn(
          "mt-1 font-semibold tabular-nums",
          props.compact ? "text-xs leading-snug" : "text-xl",
        )}
      >
        {props.value}
      </p>
    </div>
  );
}

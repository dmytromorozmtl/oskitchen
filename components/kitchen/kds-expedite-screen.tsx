"use client";

import Link from "next/link";
import { ArrowRight, Flame, Siren, Zap } from "lucide-react";

import { RushMode } from "@/components/kitchen/rush-mode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_BADGE_ROW_CLASS,
  DESIGN_POLISH_CARD_CLASS,
  DESIGN_POLISH_HERO_BANNER_CLASS,
  DESIGN_POLISH_ROW_SURFACE_CLASS,
  DESIGN_POLISH_STRIPE_OK_CLASS,
} from "@/lib/design/absolute-final-design-polish-tokens";
import {
  formatKdsPriorityReasonLabel,
  type KdsPriorityLaneItem,
} from "@/lib/kitchen/kds-priority-lane-era19";
import {
  KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX,
  KDS_EXPEDITE_SCREEN_ROUTE,
  type KdsExpediteScreenModel,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";
import { formatKdsRushLevelLabel } from "@/lib/kitchen/kds-rush-mode";
import { cn } from "@/lib/utils";

function ExpediteQueueCard({ item }: { item: KdsPriorityLaneItem }) {
  return (
    <Link
      href={item.href}
      data-testid={`kds-expedite-queue-${item.rank}`}
      className={cn(
        "flex min-h-[44px] min-w-[44px] flex-col justify-center p-4 transition-colors hover:bg-muted/40 dark:hover:bg-muted/20",
        DESIGN_POLISH_CARD_CLASS,
        item.lane === "expo" && "border-amber-300/60 dark:border-amber-800/50",
      )}
      style={{ minHeight: KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              #{item.rank}
            </Badge>
            <span className="font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground dark:text-muted-foreground/90">
              {item.ticketNumber}
            </span>
            <Badge variant="secondary" className="rounded-full text-[10px] uppercase">
              {item.lane === "prep" ? "Prep" : "Expo"}
            </Badge>
          </div>
          <p className="truncate text-base font-semibold">
            {item.order.customerName ?? "Guest order"}
          </p>
          <p className="font-mono text-sm tabular-nums text-muted-foreground dark:text-muted-foreground/90">
            {item.elapsedLabel} elapsed
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {item.reasons.map((reason) => (
              <Badge key={reason} variant="outline" className="rounded-full text-[10px]">
                {formatKdsPriorityReasonLabel(reason)}
              </Badge>
            ))}
          </div>
        </div>
        <ArrowRight
          className={`h-5 w-5 shrink-0 ${DESIGN_POLISH_STRIPE_OK_CLASS}`}
          aria-hidden
        />
      </div>
    </Link>
  );
}

export function KdsExpediteScreen({ model }: { model: KdsExpediteScreenModel }) {
  const { rush, hero, queue, overdueCount, activeCount } = model;
  const HeroIcon = rush.level === "rush" ? Siren : Flame;

  return (
    <div
      className="space-y-6 landscape:space-y-4"
      data-testid="kds-expedite-screen"
    >
      <div className={DESIGN_POLISH_HERO_BANNER_CLASS} role="note">
        <p className="font-medium text-foreground">Expedite screen (Beta)</p>
        <p className="mt-1 text-sm text-muted-foreground dark:text-muted-foreground/90">
          <strong className="text-foreground">Expedite screen — BETA polish.</strong> Full-screen
          priority routing for rush service — not rush-hour certified for every venue. Uses the same
          priority routing engine as main KDS rush mode.
        </p>
      </div>

      <div className={DESIGN_POLISH_BADGE_ROW_CLASS}>
        <Badge variant="outline" className="rounded-full tabular-nums">
          {activeCount} active
        </Badge>
        <Badge
          variant={overdueCount > 0 ? "destructive" : "secondary"}
          className="rounded-full tabular-nums"
        >
          {overdueCount} overdue
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {formatKdsRushLevelLabel(rush.level)}
        </Badge>
      </div>

      <RushMode snapshot={rush} />

      {hero ? (
        <Card
          className={cn(
            "border-2 shadow-md dark:shadow-none",
            DESIGN_POLISH_CARD_CLASS,
            rush.level === "rush"
              ? "border-rose-400/70 bg-rose-50/40 dark:border-rose-800/60 dark:bg-rose-950/30"
              : "border-violet-400/60 bg-violet-50/30 dark:border-violet-800/50 dark:bg-violet-950/25",
          )}
          data-testid="kds-expedite-hero"
        >
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 uppercase tracking-wide">
              <Zap className="h-4 w-4" aria-hidden />
              Expedite now
            </CardDescription>
            <CardTitle className="flex flex-wrap items-center gap-2 text-2xl md:text-3xl">
              <HeroIcon
                className={cn(
                  "h-7 w-7",
                  rush.level === "rush"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-violet-600 dark:text-violet-400",
                )}
                aria-hidden
              />
              {hero.ticketNumber}
              <span className="text-lg font-medium text-muted-foreground dark:text-muted-foreground/90">
                {hero.order.customerName ?? "Guest order"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="font-mono text-lg tabular-nums">{hero.elapsedLabel} on the line</p>
              <div className="flex flex-wrap gap-1">
                {hero.reasons.map((reason) => (
                  <Badge key={reason} variant="secondary" className="rounded-full">
                    {formatKdsPriorityReasonLabel(reason)}
                  </Badge>
                ))}
              </div>
            </div>
            <Button asChild size="lg" className="min-h-[44px] rounded-full px-8">
              <Link href={hero.href}>Open ticket</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={`border-dashed ${DESIGN_POLISH_CARD_CLASS}`}
          data-testid="kds-expedite-hero-empty"
        >
          <CardContent className="py-10 text-center text-sm text-muted-foreground dark:text-muted-foreground/90">
            No expedite candidates — queue is clear or within SLA.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3" data-testid="kds-expedite-queue">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground dark:text-muted-foreground/90">
          Priority expedite queue
        </h2>
        {queue.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 landscape:grid-cols-2">
            {queue.map((item) => (
              <ExpediteQueueCard key={item.order.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground dark:text-muted-foreground/90">
            No additional priority tickets queued.
          </p>
        )}
      </div>

      <div className={`flex flex-wrap gap-2 p-3 ${DESIGN_POLISH_ROW_SURFACE_CLASS}`}>
        <Button asChild variant="outline" size="sm" className="min-h-[44px] rounded-full">
          <Link href="/dashboard/kitchen">Main KDS</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="min-h-[44px] rounded-full">
          <Link href="/dashboard/kitchen/expo">Expo view</Link>
        </Button>
        <Button asChild variant="outline" size="sm" className="min-h-[44px] rounded-full">
          <Link href="/dashboard/kitchen/production">Production view</Link>
        </Button>
      </div>

      <p className="sr-only">
        {KDS_EXPEDITE_SCREEN_ROUTE} · kds-expedite-screen-absolute-final-v1
      </p>
      <p className="sr-only">{DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID}</p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Flame, Siren, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatKdsPriorityReasonLabel,
  formatKdsRushLevelLabel,
  formatKdsRushPeakSignalLabel,
  type KdsRushModeSnapshot,
} from "@/lib/kitchen/kds-rush-mode";
import { KDS_RUSH_MODE_ANCHOR } from "@/lib/kitchen/kds-rush-mode-policy";
import type { KdsPriorityLaneItem, KdsPriorityReason } from "@/lib/kitchen/kds-priority-lane-era19";
import { cn } from "@/lib/utils";

function reasonBadgeClass(reason: KdsPriorityReason): string {
  if (reason === "allergen") {
    return "border-violet-300 bg-violet-100 text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100";
  }
  if (reason === "overdue_prep") {
    return "border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100";
  }
  return "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100";
}

function rushLevelTone(level: KdsRushModeSnapshot["level"]): string {
  if (level === "rush") {
    return "border-rose-300/80 bg-rose-50/50 dark:border-rose-900/50 dark:bg-rose-950/30";
  }
  if (level === "building") {
    return "border-amber-300/80 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/25";
  }
  return "border-border/80 bg-muted/20";
}

function RushPriorityRouteCard({ item }: { item: KdsPriorityLaneItem }) {
  return (
    <Link
      href={item.href}
      data-testid={`kds-rush-route-${item.rank}`}
      className={cn(
        "min-w-[220px] flex-1 snap-start rounded-xl border border-border/70 bg-background/90 px-3 py-3 text-sm hover:bg-muted/40 md:min-w-0",
        item.lane === "expo" && "border-amber-200/80",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-full font-mono text-[10px]">
              #{item.rank}
            </Badge>
            <span className="font-mono text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {item.ticketNumber}
            </span>
            <Badge variant="secondary" className="rounded-full text-[10px] uppercase">
              {item.lane === "prep" ? "Prep" : "Expo"}
            </Badge>
          </div>
          <p className="truncate font-medium">{item.order.customerName ?? "Guest order"}</p>
          <p className="font-mono text-xs tabular-nums text-muted-foreground">
            {item.elapsedLabel} elapsed
          </p>
          {item.reasons.length > 0 ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {item.reasons.map((reason) => (
                <Badge
                  key={`${item.order.id}-${reason}`}
                  variant="outline"
                  className={cn("rounded-full text-[10px]", reasonBadgeClass(reason))}
                >
                  {formatKdsPriorityReasonLabel(reason)}
                </Badge>
              ))}
            </div>
          ) : (
            <Badge variant="outline" className="rounded-full text-[10px]">
              Rush route
            </Badge>
          )}
        </div>
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </div>
    </Link>
  );
}

type RushModeProps = {
  snapshot: KdsRushModeSnapshot;
};

export function RushMode({ snapshot }: RushModeProps) {
  const Icon = snapshot.level === "rush" ? Siren : snapshot.level === "building" ? Flame : TrendingUp;

  return (
    <Card
      id={KDS_RUSH_MODE_ANCHOR}
      data-testid="kds-rush-mode"
      className={cn("shadow-sm", rushLevelTone(snapshot.level))}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center gap-2 text-lg">
          <Icon
            className={cn(
              "h-5 w-5",
              snapshot.level === "rush" && "text-rose-600",
              snapshot.level === "building" && "text-amber-600",
              snapshot.level === "normal" && "text-muted-foreground",
            )}
            aria-hidden
          />
          Rush mode
          <Badge
            variant="outline"
            className={cn(
              "rounded-full text-[10px] uppercase",
              snapshot.level === "rush" && "border-rose-300 text-rose-700",
              snapshot.level === "building" && "border-amber-300 text-amber-700",
            )}
            data-testid="kds-rush-level"
          >
            {formatKdsRushLevelLabel(snapshot.level)}
          </Badge>
        </CardTitle>
        <CardDescription>
          Auto peak detection routes allergen, overdue, and oldest tickets first during rush.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="rounded-full font-mono tabular-nums">
            {snapshot.queue.total} active
          </Badge>
          <Badge variant="secondary" className="rounded-full font-mono tabular-nums">
            {snapshot.arrivalsLast10Min} arrivals / 10m
          </Badge>
          <Badge variant="secondary" className="rounded-full font-mono tabular-nums">
            {snapshot.queue.overdue} overdue
          </Badge>
        </div>

        {snapshot.peakSignals.length > 0 ? (
          <div className="flex flex-wrap gap-1.5" data-testid="kds-rush-peak-signals">
            {snapshot.peakSignals.map((signal) => (
              <Badge key={signal} variant="outline" className="rounded-full text-[10px]">
                {formatKdsRushPeakSignalLabel(signal)}
              </Badge>
            ))}
          </div>
        ) : null}

        {snapshot.priorityRoutes.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Priority routing
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible">
              {snapshot.priorityRoutes.map((item) => (
                <RushPriorityRouteCard key={item.order.id} item={item} />
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

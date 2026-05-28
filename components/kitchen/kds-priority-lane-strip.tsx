import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatKdsPriorityReasonLabel,
  type KdsPriorityLaneItem,
} from "@/lib/kitchen/kds-priority-lane-era19";
import { cn } from "@/lib/utils";

function reasonBadgeClass(reason: KdsPriorityLaneItem["reasons"][number]): string {
  if (reason === "allergen") {
    return "border-violet-300 bg-violet-100 text-violet-900 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100";
  }
  if (reason === "overdue_prep") {
    return "border-rose-300 bg-rose-100 text-rose-900 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100";
  }
  return "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100";
}

export function KdsPriorityLaneStrip(props: { items: readonly KdsPriorityLaneItem[] }) {
  if (props.items.length === 0) return null;

  return (
    <Card
      className="border-violet-200/80 bg-violet-50/30 shadow-sm dark:border-violet-900/40 dark:bg-violet-950/20"
      data-testid="kds-priority-lane-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-violet-600" aria-hidden />
          Priority lane
        </CardTitle>
        <CardDescription>
          Allergen and overdue tickets sorted first — prep and expo columns follow the same score.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
          {props.items.map((item) => (
            <Link
              key={item.order.id}
              href={item.href}
              data-testid={`kds-priority-lane-${item.rank}`}
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
                  <p className="truncate font-medium">
                    {item.order.customerName ?? "Guest order"}
                  </p>
                  <p className="font-mono text-xs tabular-nums text-muted-foreground">
                    {item.elapsedLabel} elapsed
                  </p>
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
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

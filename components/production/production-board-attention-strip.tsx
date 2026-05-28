import Link from "next/link";
import { AlertTriangle, ArrowRight, ChefHat } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickProductionBoardAttentionItems,
  summarizeProductionBoardFocus,
  type ProductionBoardFocusSnapshot,
  type ProductionBoardStationWarning,
  type ProductionBoardWorkItemFocus,
} from "@/lib/production/production-board-focus-era18";

export function ProductionBoardAttentionStrip(props: {
  focus: ProductionBoardFocusSnapshot;
  workItems: readonly ProductionBoardWorkItemFocus[];
  stationWarnings: readonly ProductionBoardStationWarning[];
  productionDateIso: string;
}) {
  const summary = summarizeProductionBoardFocus(props.focus);
  const items = pickProductionBoardAttentionItems(
    props.workItems,
    props.focus,
    props.stationWarnings,
    props.productionDateIso,
  );

  if (items.length === 0) return null;

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="production-board-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ChefHat className="h-5 w-5 text-muted-foreground" aria-hidden />
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
          Production board — handle these first
        </CardTitle>
        <CardDescription>
          {summary.hasUrgent
            ? "Late tasks, holds, and station overload prioritized before service windows."
            : `${summary.totalSignals} open signal${summary.totalSignals === 1 ? "" : "s"} on today&apos;s production board.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`production-board-attention-${item.id}`}
            className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/40"
          >
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.detail}</p>
            </div>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

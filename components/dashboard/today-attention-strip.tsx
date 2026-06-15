import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { pickTodayAttentionItems } from "@/lib/today/today-command-center-focus-era18";
import type {
  TodayBlocker,
  TodayCommandCenterPayload,
} from "@/services/today/today-command-center-service";

export function TodayAttentionStrip(props: { data: TodayCommandCenterPayload }) {
  const items = pickTodayAttentionItems({
    blockers: props.data.blockers,
    kpis: props.data.kpis,
  });

  if (items.length === 0) return null;

  const hasBlockers = props.data.blockers.length > 0;

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="today-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
          {hasBlockers ? "Needs attention now" : "Shift in progress"}
        </CardTitle>
        <CardDescription>
          {hasBlockers
            ? "Fix blockers before scaling order volume."
            : "Active operational signals — open a row to act."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`today-attention-${item.id}`}
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

export type { TodayBlocker };

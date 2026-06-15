import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickProductionCalendarAttentionItems,
  summarizeProductionCalendarFocus,
  type ProductionCalendarFocusTask,
} from "@/lib/production/production-calendar-today-focus-era18";
import { isoDateOnly } from "@/lib/production/production-calendar-week-navigation";

export function ProductionCalendarAttentionStrip(props: {
  tasks: ProductionCalendarFocusTask[];
  today?: Date;
}) {
  const todayIso = isoDateOnly(props.today ?? new Date());
  const summary = summarizeProductionCalendarFocus(props.tasks, todayIso);
  const items = pickProductionCalendarAttentionItems(props.tasks, todayIso);

  if (items.length === 0 && summary.completedToday === 0) return null;

  return (
    <div className="space-y-3" data-testid="production-calendar-attention-strip">
      {items.length > 0 ? (
        <Card className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
              Production focus today
            </CardTitle>
            <CardDescription>
              {summary.overdue > 0
                ? "Clear overdue batches before adding new prep load."
                : "Batch tasks that need action on the calendar this shift."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                data-testid={`production-calendar-attention-${item.id}`}
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
      ) : null}

      {summary.completedToday > 0 && items.length === 0 ? (
        <Card className="border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today&apos;s batches complete</CardTitle>
            <CardDescription>
              {summary.completedToday} task{summary.completedToday === 1 ? "" : "s"} marked completed
              for today — plan tomorrow on the calendar below.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}
    </div>
  );
}

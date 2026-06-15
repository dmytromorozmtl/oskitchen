import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickSystemHealthAttentionItems,
  pickSystemHealthEventNextActions,
  summarizeSystemHealthSnapshot,
  type SystemHealthSnapshot,
} from "@/lib/system-health/system-health-focus-era18";
import type { ObservabilityErrorEvent } from "@/services/observability/error-event-service";

export function SystemHealthAttentionStrip(props: {
  snapshot: SystemHealthSnapshot;
  recentEvents: ObservabilityErrorEvent[];
}) {
  const summary = summarizeSystemHealthSnapshot(props.snapshot);
  const categoryItems = pickSystemHealthAttentionItems(props.snapshot);
  const eventActions = pickSystemHealthEventNextActions(props.recentEvents);

  if (categoryItems.length === 0 && eventActions.length === 0) return null;

  return (
    <div className="space-y-4" data-testid="system-health-attention-strip">
      {categoryItems.length > 0 ? (
        <Card className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
              System health — fix these first
            </CardTitle>
            <CardDescription>
              {summary.hasUrgent
                ? "Integration, webhook, and production signals prioritized for this workspace."
                : `${summary.totalSignals} open signal${summary.totalSignals === 1 ? "" : "s"} — review before scaling pilot traffic.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                data-testid={`system-health-attention-${item.id}`}
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

      {eventActions.length > 0 ? (
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Integration &amp; module errors — next action</CardTitle>
            <CardDescription>
              Last 7 days from observability rollup. Open the owning module to recover safely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {eventActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                data-testid={`system-health-event-${action.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/70 px-3 py-2 text-sm hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.detail}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickPlatformSystemHealthAttentionItems,
  pickPlatformSystemHealthEventNextActions,
  summarizePlatformSystemHealthSnapshot,
  type PlatformSystemHealthSnapshot,
} from "@/lib/system-health/system-health-focus-era18";
import type { ObservabilityErrorEvent } from "@/services/observability/error-event-service";

export function PlatformSystemHealthAttentionStrip(props: {
  snapshot: PlatformSystemHealthSnapshot;
  recentEvents: ObservabilityErrorEvent[];
}) {
  const summary = summarizePlatformSystemHealthSnapshot(props.snapshot);
  const categoryItems = pickPlatformSystemHealthAttentionItems(props.snapshot);
  const eventActions = pickPlatformSystemHealthEventNextActions(props.recentEvents);

  if (categoryItems.length === 0 && eventActions.length === 0) return null;

  return (
    <div className="space-y-4" data-testid="platform-system-health-attention-strip">
      {categoryItems.length > 0 ? (
        <Card className="border-amber-800/60 bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden />
              System health — fix these first
            </CardTitle>
            <CardDescription className="text-zinc-400">
              {summary.hasUrgent
                ? "Cross-tenant production, integration, and webhook signals prioritized for platform ops."
                : `${summary.totalSignals} open signal${summary.totalSignals === 1 ? "" : "s"} across tenants — review before the next service window.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {categoryItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                data-testid={`platform-system-health-attention-${item.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
              >
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.detail}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {eventActions.length > 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-white">Cross-tenant errors — next action</CardTitle>
            <CardDescription className="text-zinc-500">
              Last 7 days from observability rollup. Workspace label shown when available.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {eventActions.map((action) => (
              <Link
                key={action.id}
                href={action.href}
                data-testid={`platform-system-health-event-${action.id}`}
                className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900/60"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-white">{action.title}</p>
                  <p className="text-xs text-zinc-400">{action.detail}</p>
                </div>
                <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
              </Link>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

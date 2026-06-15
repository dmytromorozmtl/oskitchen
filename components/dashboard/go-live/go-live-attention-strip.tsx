import Link from "next/link";
import { AlertTriangle, ArrowRight, Rocket } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  pickGoLiveAttentionItems,
  pickGoLiveLegacyAttentionItems,
  summarizeGoLiveFocus,
  type GoLiveFocusSnapshot,
} from "@/lib/go-live/go-live-focus-era18";
import type { LaunchBlocker } from "@/lib/go-live/blocker-engine";

type GoLiveAttentionStripProps =
  | {
      focus: GoLiveFocusSnapshot;
      blockers: readonly LaunchBlocker[];
      legacyChecks?: never;
    }
  | {
      legacyChecks: readonly { label: string; href: string; done: boolean }[];
      focus?: never;
      blockers?: never;
    };

export function GoLiveAttentionStrip(props: GoLiveAttentionStripProps) {
  const items =
    "legacyChecks" in props && props.legacyChecks
      ? pickGoLiveLegacyAttentionItems(props.legacyChecks)
      : pickGoLiveAttentionItems(props.blockers ?? [], props.focus!);

  const summary =
    "focus" in props && props.focus
      ? summarizeGoLiveFocus(props.focus)
      : { totalSignals: items.length, hasUrgent: items.some((item) => item.tone === "urgent") };

  if (items.length === 0) return null;

  const readinessScore = "focus" in props && props.focus ? props.focus.readinessScore : null;

  return (
    <Card
      className="border-amber-200/80 bg-amber-50/40 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20"
      data-testid="go-live-attention-strip"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-muted-foreground" aria-hidden />
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
          Launch readiness — handle these first
        </CardTitle>
        <CardDescription>
          {readinessScore !== null
            ? summary.hasUrgent
              ? `${readinessScore}% readiness — critical blockers and risks prioritized before go-live.`
              : `${readinessScore}% readiness — ${summary.totalSignals} open signal${summary.totalSignals === 1 ? "" : "s"} before launch.`
            : summary.hasUrgent
              ? "Complete pre-flight steps before creating a full launch project."
              : `${summary.totalSignals} pre-flight step${summary.totalSignals === 1 ? "" : "s"} remaining.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            data-testid={`go-live-attention-${item.id}`}
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

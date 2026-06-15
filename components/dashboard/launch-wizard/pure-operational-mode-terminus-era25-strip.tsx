import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PureOperationalModeTerminusEra25UiSlice } from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { cn } from "@/lib/utils";

export function PureOperationalModeTerminusEra25Strip(props: {
  slice: PureOperationalModeTerminusEra25UiSlice;
}) {
  const { slice } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="pure-operational-mode-terminus-era25-strip"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Pure operational mode (era25 terminus)</CardTitle>
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.healthyCount}/{slice.tracks.length}
          </Badge>
        </div>
        <CardDescription>
          Final era25 slice —{" "}
          {slice.sustainedOpsConvergenceReady
            ? "sustained ops convergence ready"
            : "awaiting sustained ops convergence"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={cn(slice.terminusBlocked ? "text-amber-700" : "text-emerald-700")}>
          {slice.headline}
        </p>
        {slice.nextAttentionTrackLabel ? (
          <p className="text-xs text-muted-foreground">Attention: {slice.nextAttentionTrackLabel}</p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link
            href={slice.platformOpsHref}
            className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Open terminus on platform ops
          </Link>
          <Link
            href={slice.improvementLoopHref}
            className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
          >
            Open improvement loop
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

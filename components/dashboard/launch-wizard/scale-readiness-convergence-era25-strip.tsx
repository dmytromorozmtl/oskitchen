import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScaleReadinessConvergenceEra25UiSlice } from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import { cn } from "@/lib/utils";

export function ScaleReadinessConvergenceEra25Strip(props: {
  slice: ScaleReadinessConvergenceEra25UiSlice;
}) {
  const { slice } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="scale-readiness-convergence-era25-strip"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Scale readiness (era25)</CardTitle>
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.completedBlockingCount}/{slice.totalBlockingCount}
          </Badge>
        </div>
        <CardDescription>
          Honest gates —{" "}
          {slice.month2ConvergenceReady
            ? "month 2 convergence ready"
            : "awaiting month 2 convergence"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={cn(slice.convergenceBlocked ? "text-amber-700" : "text-emerald-700")}>
          {slice.launchWizardSlice.headline}
        </p>
        {slice.nextPhaseLabel ? (
          <p className="text-xs text-muted-foreground">Next: {slice.nextPhaseLabel}</p>
        ) : null}
        <Link
          href={slice.platformOpsHref}
          className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open Scale convergence on platform ops
        </Link>
      </CardContent>
    </Card>
  );
}

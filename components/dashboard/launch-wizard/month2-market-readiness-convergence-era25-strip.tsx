import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Month2MarketReadinessConvergenceEra25UiSlice } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import { cn } from "@/lib/utils";

export function Month2MarketReadinessConvergenceEra25Strip(props: {
  slice: Month2MarketReadinessConvergenceEra25UiSlice;
}) {
  const { slice } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="month2-market-readiness-convergence-era25-strip"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Month 2 market readiness (era25)</CardTitle>
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.completedBlockingCount}/{slice.totalBlockingCount}
          </Badge>
        </div>
        <CardDescription>
          Honest workstreams —{" "}
          {slice.week1ConvergenceReady ? "week 1 convergence ready" : "awaiting week 1 convergence"}
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
          Open Month 2 convergence on platform ops
        </Link>
      </CardContent>
    </Card>
  );
}

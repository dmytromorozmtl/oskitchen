import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PilotWeek1ExecutionConvergenceEra25UiSlice } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import { cn } from "@/lib/utils";

export function PilotWeek1ExecutionConvergenceEra25Strip(props: {
  slice: PilotWeek1ExecutionConvergenceEra25UiSlice;
}) {
  const { slice } = props;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="pilot-week1-execution-convergence-era25-strip"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Pilot Week 1 execution (era25)</CardTitle>
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.completedPhaseCount}/{slice.totalPhaseCount} days
          </Badge>
        </div>
        <CardDescription>
          Honest day phases — {slice.goConvergenceReady ? "GO convergence ready" : "awaiting GO convergence"}
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
          Open Week 1 convergence on platform ops
        </Link>
      </CardContent>
    </Card>
  );

}

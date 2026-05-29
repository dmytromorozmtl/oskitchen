import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaidPilotGoConvergenceEra25UiSlice } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import { cn } from "@/lib/utils";

export function PaidPilotGoConvergenceEra25Strip(props: {
  slice: PaidPilotGoConvergenceEra25UiSlice;
}) {
  const { slice } = props;
  const decisionVariant =
    slice.goDecision === "GO"
      ? "default"
      : slice.goDecision === "NO-GO"
        ? "destructive"
        : "outline";

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="paid-pilot-go-convergence-era25-strip"
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">Paid pilot GO/NO-GO (era25 B3)</CardTitle>
          <Badge variant={decisionVariant} className="rounded-full">
            {slice.goDecision ?? "NO ARTIFACT"}
          </Badge>
        </div>
        <CardDescription>
          Honest evaluator — {slice.artifactPresent ? "artifact present" : "run smoke:pilot-gono-go"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p className={cn(slice.convergenceBlocked ? "text-amber-700" : "text-emerald-700")}>
          {slice.launchWizardSlice.headline}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>ICP: {slice.icpQualified ? "qualified" : "not qualified"}</span>
          <span>LOI: {slice.loiRecorded ? "recorded" : "missing"}</span>
          <span>Claims: {slice.forbiddenClaimsPassed ? "PASS" : "FAIL/SKIP"}</span>
        </div>
        <Link
          href={slice.platformOpsHref}
          className="inline-block text-xs font-medium text-primary underline-offset-4 hover:underline"
        >
          Open GO convergence on platform ops
        </Link>
      </CardContent>
    </Card>
  );
}

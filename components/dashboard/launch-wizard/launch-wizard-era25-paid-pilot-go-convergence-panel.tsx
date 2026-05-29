import Link from "next/link";
import { Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-era47";
import type { LaunchWizardEra25PaidPilotGoConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-paid-pilot-go-convergence-era47";

export function LaunchWizardEra25PaidPilotGoConvergencePanel(props: {
  slice: LaunchWizardEra25PaidPilotGoConvergenceSlice;
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
      id={LAUNCH_WIZARD_ERA25_PAID_PILOT_GO_CONVERGENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-rose-200/80 bg-rose-50/20 shadow-sm dark:border-rose-900/50"
      data-testid="launch-wizard-era25-paid-pilot-go-convergence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-rose-950 dark:text-rose-100">
          <Target className="h-5 w-5 shrink-0" aria-hidden />
          Era25 paid pilot GO convergence — B3 tile
        </CardTitle>
        <CardDescription>
          Honest GO/NO-GO evaluator surfaces — only after owner daily briefing breakthrough ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={decisionVariant} className="rounded-full font-mono text-[10px]">
            {slice.goDecision}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">
            {slice.progressLabel}
          </Badge>
          {slice.customerName ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {slice.customerName}
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-full text-[10px]">
            ICP {slice.icpQualified ? "qualified" : "pending"}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">
            LOI {slice.loiRecorded ? "recorded" : "missing"}
          </Badge>
          {slice.convergenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Convergence blocked
            </Badge>
          ) : null}
          {slice.paidPilotGoConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              GO convergence integrity FAIL
            </Badge>
          ) : null}
          {slice.ownerDailyBriefingBreakthroughIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Breakthrough integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>GO convergence checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postBreakthroughOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

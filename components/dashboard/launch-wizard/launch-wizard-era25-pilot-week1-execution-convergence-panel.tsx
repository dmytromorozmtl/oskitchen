import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-era48";
import type { LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-pilot-week1-execution-convergence-era48";

export function LaunchWizardEra25PilotWeek1ExecutionConvergencePanel(props: {
  slice: LaunchWizardEra25PilotWeek1ExecutionConvergenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_PILOT_WEEK1_EXECUTION_CONVERGENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-era25-pilot-week1-execution-convergence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <CalendarDays className="h-5 w-5 shrink-0" aria-hidden />
          Era25 pilot week 1 execution convergence
        </CardTitle>
        <CardDescription>
          Days 1–5 on real pilot workspace — only after paid pilot GO convergence ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
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
            {slice.completedPhaseCount}/{slice.totalPhaseCount} days
          </Badge>
          {slice.convergenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Week 1 blocked
            </Badge>
          ) : null}
          {slice.pilotWeek1ExecutionConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Week 1 integrity FAIL
            </Badge>
          ) : null}
          {slice.paidPilotGoConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              GO convergence integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Week 1 checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.integrationHealthHref}>Integration health</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postGoConvergenceOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

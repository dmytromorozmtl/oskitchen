import Link from "next/link";
import { Repeat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-steady-state-operator-loop-lock-era58";
import type { LaunchWizardEra25SteadyStateOperatorLoopLockSlice } from "@/lib/launch-wizard/launch-wizard-era25-steady-state-operator-loop-lock-era58";

export function LaunchWizardEra25SteadyStateOperatorLoopLockPanel(props: {
  slice: LaunchWizardEra25SteadyStateOperatorLoopLockSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_STEADY_STATE_OPERATOR_LOOP_LOCK_ANCHOR.slice(1)}
      className="scroll-mt-24 border-indigo-300/80 bg-indigo-50/30 shadow-sm dark:border-indigo-700/50"
      data-testid="launch-wizard-era25-steady-state-operator-loop-lock-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-950 dark:text-indigo-100">
          <Repeat className="h-5 w-5 shrink-0" aria-hidden />
          Era25 steady-state operator loop lock
        </CardTitle>
        <CardDescription>
          Lock improvement-loop rhythms and operator cadence after charter lock — era25 convergence env stays frozen.
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
          {slice.steadyStateLockBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Steady-state lock blocked
            </Badge>
          ) : null}
          {slice.era25SteadyStateOperatorLoopLockIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Steady-state integrity FAIL
            </Badge>
          ) : null}
          {slice.improvementLoopRhythmMutationDetected ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Loop rhythm mutation
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Steady-state lock checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.governanceBundlesCertCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.commercialPilotRunbookCertCommand}</p>
      </CardContent>
    </Card>
  );
}

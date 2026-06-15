import Link from "next/link";
import { RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_IMPROVEMENT_LOOP_ANCHOR } from "@/lib/launch-wizard/launch-wizard-improvement-loop-era34";
import type { LaunchWizardImprovementLoopSlice } from "@/lib/launch-wizard/launch-wizard-improvement-loop-era34";

export function LaunchWizardImprovementLoopPanel(props: {
  slice: LaunchWizardImprovementLoopSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_IMPROVEMENT_LOOP_ANCHOR.slice(1)}
      className="scroll-mt-24 border-emerald-200/80 bg-emerald-50/20 shadow-sm dark:border-emerald-900/50"
      data-testid="launch-wizard-improvement-loop-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <RefreshCw className="h-5 w-5 shrink-0" aria-hidden />
          Continuous improvement loop
        </CardTitle>
        <CardDescription>
          Pure operational mode — recurring tracks use artifact freshness; never hand-edit PASS in
          artifacts.
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
          {slice.improvementLoopIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Improvement loop blocked
            </Badge>
          ) : null}
          {slice.sustainedOpsIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Sustained ops integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Improvement loop checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>Today</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postSustainedOpsOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

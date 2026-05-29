import Link from "next/link";
import { Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-scale-readiness-convergence-era50";
import type { LaunchWizardEra25ScaleReadinessConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-scale-readiness-convergence-era50";

export function LaunchWizardEra25ScaleReadinessConvergencePanel(props: {
  slice: LaunchWizardEra25ScaleReadinessConvergenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_SCALE_READINESS_CONVERGENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-emerald-200/80 bg-emerald-50/20 shadow-sm dark:border-emerald-900/50"
      data-testid="launch-wizard-era25-scale-readiness-convergence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <Layers className="h-5 w-5 shrink-0" aria-hidden />
          Era25 scale readiness convergence
        </CardTitle>
        <CardDescription>
          Gates 1–5 for enterprise expansion — only after month 2 market readiness convergence ready.
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
            {slice.completedBlockingCount}/{slice.totalBlockingCount} gates
          </Badge>
          {slice.convergenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Scale blocked
            </Badge>
          ) : null}
          {slice.scaleReadinessConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Scale integrity FAIL
            </Badge>
          ) : null}
          {slice.month2MarketReadinessConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Month 2 integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Scale checklist</Link>
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
          {slice.postMonth2ConvergenceOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

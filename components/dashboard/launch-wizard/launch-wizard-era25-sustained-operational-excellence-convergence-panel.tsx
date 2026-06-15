import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-sustained-operational-excellence-convergence-era53";
import type { LaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-sustained-operational-excellence-convergence-era53";

export function LaunchWizardEra25SustainedOperationalExcellenceConvergencePanel(props: {
  slice: LaunchWizardEra25SustainedOperationalExcellenceConvergenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_SUSTAINED_OPERATIONAL_EXCELLENCE_CONVERGENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-teal-200/80 bg-teal-50/20 shadow-sm dark:border-teal-900/50"
      data-testid="launch-wizard-era25-sustained-operational-excellence-convergence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-teal-950 dark:text-teal-100">
          <CalendarClock className="h-5 w-5 shrink-0" aria-hidden />
          Era25 sustained operational excellence convergence
        </CardTitle>
        <CardDescription>
          Cadences A–D for recurring ops excellence — only after market leader positioning convergence ready.
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
            {slice.completedBlockingCount}/{slice.totalBlockingCount} cadences
          </Badge>
          {slice.convergenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Sustained ops blocked
            </Badge>
          ) : null}
          {slice.sustainedOperationalExcellenceConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Sustained ops integrity FAIL
            </Badge>
          ) : null}
          {slice.marketLeaderPositioningConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Market leader integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Sustained ops checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>Today</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.orderHubHref}>Order Hub</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.productionCalendarHref}>Production calendar</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postMarketLeaderConvergenceOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

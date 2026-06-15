import Link from "next/link";
import { Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-pilot-path-absolute-end-era39";
import type { LaunchWizardCommercialPilotPathAbsoluteEndSlice } from "@/lib/launch-wizard/launch-wizard-commercial-pilot-path-absolute-end-era39";

export function LaunchWizardCommercialPilotPathAbsoluteEndPanel(props: {
  slice: LaunchWizardCommercialPilotPathAbsoluteEndSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_COMMERCIAL_PILOT_PATH_ABSOLUTE_END_ANCHOR.slice(1)}
      className="scroll-mt-24 border-emerald-200/80 bg-emerald-50/20 shadow-sm dark:border-emerald-900/50"
      data-testid="launch-wizard-commercial-pilot-path-absolute-end-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <Flag className="h-5 w-5 shrink-0" aria-hidden />
          Commercial pilot path absolute end
        </CardTitle>
        <CardDescription>
          Step 15 linear engineering closure — never hand-edit PASS in artifacts.
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
          {slice.commercialPilotPathAbsoluteEndIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Absolute end blocked
            </Badge>
          ) : null}
          {slice.postTerminusSteadyStateIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Steady state integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Absolute end checklist</Link>
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
          {slice.postSteadyStateOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

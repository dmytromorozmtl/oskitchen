import Link from "next/link";
import { Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ENGINEERING_TERMINUS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-engineering-terminus-era37";
import type { LaunchWizardEngineeringTerminusSlice } from "@/lib/launch-wizard/launch-wizard-engineering-terminus-era37";

export function LaunchWizardEngineeringTerminusPanel(props: {
  slice: LaunchWizardEngineeringTerminusSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ENGINEERING_TERMINUS_ANCHOR.slice(1)}
      className="scroll-mt-24 border-indigo-200/80 bg-indigo-50/20 shadow-sm dark:border-indigo-900/50"
      data-testid="launch-wizard-engineering-terminus-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-950 dark:text-indigo-100">
          <Route className="h-5 w-5 shrink-0" aria-hidden />
          Engineering path terminus
        </CardTitle>
        <CardDescription>
          Master commercial pilot path — Steps 1–16 orchestration; never hand-edit PASS in artifacts.
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
          {slice.engineeringTerminusIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Engineering terminus blocked
            </Badge>
          ) : null}
          {slice.maintenanceModeIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Maintenance mode integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Engineering path checklist</Link>
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
          {slice.postMaintenanceModeOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

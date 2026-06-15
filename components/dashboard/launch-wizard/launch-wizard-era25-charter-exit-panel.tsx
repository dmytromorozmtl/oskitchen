import Link from "next/link";
import { Scroll } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-charter-exit-era42";
import type { LaunchWizardEra25CharterExitSlice } from "@/lib/launch-wizard/launch-wizard-era25-charter-exit-era42";

export function LaunchWizardEra25CharterExitPanel(props: { slice: LaunchWizardEra25CharterExitSlice }) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_CHARTER_EXIT_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-era25-charter-exit-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <Scroll className="h-5 w-5 shrink-0" aria-hidden />
          Era25+ charter exit — outside linear path
        </CardTitle>
        <CardDescription>
          Not Step 18 · signed era25 charter docs outside Steps 1–16 · never hand-edit PASS in artifacts.
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
          {slice.era25CharterExitIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Charter exit blocked
            </Badge>
          ) : null}
          {slice.linearChainTerminusGuardIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Step 17 guard integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Charter exit checklist</Link>
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
          {slice.postTerminusGuardOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

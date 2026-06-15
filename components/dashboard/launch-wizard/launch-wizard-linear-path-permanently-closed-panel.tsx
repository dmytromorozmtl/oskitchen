import Link from "next/link";
import { Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ANCHOR } from "@/lib/launch-wizard/launch-wizard-linear-path-permanently-closed-era40";
import type { LaunchWizardLinearPathPermanentlyClosedSlice } from "@/lib/launch-wizard/launch-wizard-linear-path-permanently-closed-era40";

export function LaunchWizardLinearPathPermanentlyClosedPanel(props: {
  slice: LaunchWizardLinearPathPermanentlyClosedSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_LINEAR_PATH_PERMANENTLY_CLOSED_ANCHOR.slice(1)}
      className="scroll-mt-24 border-rose-200/80 bg-rose-50/20 shadow-sm dark:border-rose-900/50"
      data-testid="launch-wizard-linear-path-permanently-closed-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-rose-950 dark:text-rose-100">
          <Flag className="h-5 w-5 shrink-0" aria-hidden />
          Linear path permanently closed
        </CardTitle>
        <CardDescription>
          Step 16 doc chain terminus — Step 17+ forbidden · never hand-edit PASS in artifacts.
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
          {slice.linearPathPermanentlyClosedIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Linear path blocked
            </Badge>
          ) : null}
          {slice.commercialPilotPathAbsoluteEndIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Absolute end integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Linear path closure checklist</Link>
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
          {slice.postAbsoluteEndOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

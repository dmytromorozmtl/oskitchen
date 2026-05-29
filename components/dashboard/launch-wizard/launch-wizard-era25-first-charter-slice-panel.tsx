import Link from "next/link";
import { FileCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-first-charter-slice-era43";
import type { LaunchWizardEra25FirstCharterSliceSlice } from "@/lib/launch-wizard/launch-wizard-era25-first-charter-slice-era43";

export function LaunchWizardEra25FirstCharterSlicePanel(props: {
  slice: LaunchWizardEra25FirstCharterSliceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_FIRST_CHARTER_SLICE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-indigo-200/80 bg-indigo-50/20 shadow-sm dark:border-indigo-900/50"
      data-testid="launch-wizard-era25-first-charter-slice-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-950 dark:text-indigo-100">
          <FileCheck className="h-5 w-5 shrink-0" aria-hidden />
          Era25 first charter slice — section readiness
        </CardTitle>
        <CardDescription>
          Validates signed charter doc sections before era25 engineering — never hand-edit PASS in artifacts.
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
          {slice.era25FirstCharterSliceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              First slice blocked
            </Badge>
          ) : null}
          {slice.era25CharterExitIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Charter exit integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Charter slice checklist</Link>
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
          {slice.postCharterExitOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

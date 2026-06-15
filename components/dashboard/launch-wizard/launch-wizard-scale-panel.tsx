import Link from "next/link";
import { Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_SCALE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-scale-era30";
import type { LaunchWizardScaleSlice } from "@/lib/launch-wizard/launch-wizard-scale-era30";

export function LaunchWizardScalePanel(props: { slice: LaunchWizardScaleSlice }) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_SCALE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-indigo-200/80 bg-indigo-50/20 shadow-sm dark:border-indigo-900/50"
      data-testid="launch-wizard-scale-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-950 dark:text-indigo-100">
          <Building2 className="h-5 w-5 shrink-0" aria-hidden />
          Scale readiness
        </CardTitle>
        <CardDescription>
          Enterprise expansion gates — per-customer GO, resilience drills, data room chain.
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
          {slice.scaleIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Scale blocked
            </Badge>
          ) : null}
          {slice.month2IntegrityFailed ? (
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
            <Link href={slice.todayHref}>Today</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.postMonth2OrchestratorCommand}</p>
      </CardContent>
    </Card>
  );
}

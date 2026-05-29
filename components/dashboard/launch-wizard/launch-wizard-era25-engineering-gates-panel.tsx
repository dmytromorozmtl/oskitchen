import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-engineering-gates-era44";
import type { LaunchWizardEra25EngineeringGatesSlice } from "@/lib/launch-wizard/launch-wizard-era25-engineering-gates-era44";

export function LaunchWizardEra25EngineeringGatesPanel(props: {
  slice: LaunchWizardEra25EngineeringGatesSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_ENGINEERING_GATES_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-era25-engineering-gates-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
          Era25 engineering gates — signed charter required
        </CardTitle>
        <CardDescription>
          Opens era25 product engineering only after honest first charter slice — never hand-edit PASS in artifacts.
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
          {slice.gatesBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Gates blocked
            </Badge>
          ) : null}
          {slice.era25EngineeringGatesIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Gates integrity FAIL
            </Badge>
          ) : null}
          {slice.era25FirstCharterSliceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              First slice integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Engineering gates checklist</Link>
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
          {slice.postReadinessOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

import Link from "next/link";
import { CalendarClock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_SUSTAINED_OPS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-sustained-ops-era33";
import type { LaunchWizardSustainedOpsSlice } from "@/lib/launch-wizard/launch-wizard-sustained-ops-era33";

export function LaunchWizardSustainedOpsPanel(props: { slice: LaunchWizardSustainedOpsSlice }) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_SUSTAINED_OPS_ANCHOR.slice(1)}
      className="scroll-mt-24 border-teal-200/80 bg-teal-50/20 shadow-sm dark:border-teal-900/50"
      data-testid="launch-wizard-sustained-ops-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-teal-950 dark:text-teal-100">
          <CalendarClock className="h-5 w-5 shrink-0" aria-hidden />
          Sustained operational excellence
        </CardTitle>
        <CardDescription>
          Daily shift cadence, weekly integration review, monthly metrics refresh, quarterly governance
          — never hand-edit PASS in artifacts.
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
          {slice.sustainedOpsIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Sustained ops blocked
            </Badge>
          ) : null}
          {slice.marketLeaderIntegrityFailed ? (
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
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postMarketLeaderOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

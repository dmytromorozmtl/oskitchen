import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_PILOT_WEEK1_ANCHOR } from "@/lib/launch-wizard/launch-wizard-pilot-week1-era28";
import type { LaunchWizardPilotWeek1Slice } from "@/lib/launch-wizard/launch-wizard-pilot-week1-era28";

export function LaunchWizardPilotWeek1Panel(props: { slice: LaunchWizardPilotWeek1Slice }) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_PILOT_WEEK1_ANCHOR.slice(1)}
      className="scroll-mt-24 border-emerald-200/80 bg-emerald-50/20 shadow-sm dark:border-emerald-900/50"
      data-testid="launch-wizard-pilot-week1-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <CalendarDays className="h-5 w-5 shrink-0" aria-hidden />
          Pilot Week 1 execution
        </CardTitle>
        <CardDescription>
          Days 1–5 on real pilot workspace — record PILOT_WEEK1_* attestations after each milestone.
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
          {slice.week1IntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Week 1 blocked
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Week 1 checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>Today</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.postGoOrchestratorCommand}</p>
      </CardContent>
    </Card>
  );
}

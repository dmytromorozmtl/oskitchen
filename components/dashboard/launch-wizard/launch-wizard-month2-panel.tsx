import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_MONTH2_ANCHOR } from "@/lib/launch-wizard/launch-wizard-month2-era29";
import type { LaunchWizardMonth2Slice } from "@/lib/launch-wizard/launch-wizard-month2-era29";

export function LaunchWizardMonth2Panel(props: { slice: LaunchWizardMonth2Slice }) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_MONTH2_ANCHOR.slice(1)}
      className="scroll-mt-24 border-amber-200/80 bg-amber-50/20 shadow-sm dark:border-amber-900/50"
      data-testid="launch-wizard-month2-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-950 dark:text-amber-100">
          <TrendingUp className="h-5 w-5 shrink-0" aria-hidden />
          Month 2 — market readiness
        </CardTitle>
        <CardDescription>
          Investor one-pager, ICP landings, and case study publish gate — real KPIs only.
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
          {slice.month2IntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Month 2 blocked
            </Badge>
          ) : null}
          {slice.week1IntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Week 1 integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Month 2 checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>Today</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.postWeek1OrchestratorCommand}</p>
      </CardContent>
    </Card>
  );
}

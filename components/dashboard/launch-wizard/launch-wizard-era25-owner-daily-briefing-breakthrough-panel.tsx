import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-owner-daily-briefing-breakthrough-era46";
import type { LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice } from "@/lib/launch-wizard/launch-wizard-era25-owner-daily-briefing-breakthrough-era46";

export function LaunchWizardEra25OwnerDailyBriefingBreakthroughPanel(props: {
  slice: LaunchWizardEra25OwnerDailyBriefingBreakthroughSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_OWNER_DAILY_BRIEFING_BREAKTHROUGH_ANCHOR.slice(1)}
      className="scroll-mt-24 border-pink-200/80 bg-pink-50/20 shadow-sm dark:border-pink-900/50"
      data-testid="launch-wizard-era25-owner-daily-briefing-breakthrough-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-pink-950 dark:text-pink-100">
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
          Era25 owner daily briefing breakthrough — B0–B4
        </CardTitle>
        <CardDescription>
          First era25 product slice tiles on Today — only after honest blueprint ready.
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
          {slice.sliceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Slice blocked
            </Badge>
          ) : null}
          {slice.ownerDailyBriefingBreakthroughIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Breakthrough integrity FAIL
            </Badge>
          ) : null}
          {slice.era25FirstProductSliceBlueprintIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Blueprint integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Breakthrough checklist</Link>
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
          {slice.postGatesOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

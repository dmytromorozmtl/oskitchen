import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_PRODUCT_EVOLUTION_ANCHOR } from "@/lib/launch-wizard/launch-wizard-product-evolution-era35";
import type { LaunchWizardProductEvolutionSlice } from "@/lib/launch-wizard/launch-wizard-product-evolution-era35";

export function LaunchWizardProductEvolutionPanel(props: {
  slice: LaunchWizardProductEvolutionSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_PRODUCT_EVOLUTION_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-product-evolution-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
          Sustained product evolution
        </CardTitle>
        <CardDescription>
          Product-led growth — long-horizon tracks use artifact freshness; never hand-edit PASS in
          artifacts.
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
          {slice.productEvolutionIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Product evolution blocked
            </Badge>
          ) : null}
          {slice.improvementLoopIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Improvement loop integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Product evolution checklist</Link>
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
          {slice.postImprovementLoopOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}

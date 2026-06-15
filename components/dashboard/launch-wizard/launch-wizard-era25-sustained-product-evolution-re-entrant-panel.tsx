import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-sustained-product-evolution-re-entrant-era56";
import type { LaunchWizardEra25SustainedProductEvolutionReentrantSlice } from "@/lib/launch-wizard/launch-wizard-era25-sustained-product-evolution-re-entrant-era56";

export function LaunchWizardEra25SustainedProductEvolutionReentrantPanel(props: {
  slice: LaunchWizardEra25SustainedProductEvolutionReentrantSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_SUSTAINED_PRODUCT_EVOLUTION_REENTRANT_ANCHOR.slice(1)}
      className="scroll-mt-24 border-emerald-200/80 bg-emerald-50/20 shadow-sm dark:border-emerald-900/50"
      data-testid="launch-wizard-era25-sustained-product-evolution-re-entrant-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
          Era25 sustained product evolution re-entrant
        </CardTitle>
        <CardDescription>
          Post-train-closure product growth — improvement loop and Step 11 only; era25 linear convergence stays closed.
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
          {slice.reentrantBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Re-entrant blocked
            </Badge>
          ) : null}
          {slice.sustainedProductEvolutionReentrantIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Re-entrant integrity FAIL
            </Badge>
          ) : null}
          {slice.linearConvergenceSurfaceReopened ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Linear convergence reopened
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Re-entrant checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.productEvolutionHref}>Product evolution</Link>
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

import Link from "next/link";
import { Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-first-product-slice-blueprint-era45";
import type { LaunchWizardEra25FirstProductSliceBlueprintSlice } from "@/lib/launch-wizard/launch-wizard-era25-first-product-slice-blueprint-era45";

export function LaunchWizardEra25FirstProductSliceBlueprintPanel(props: {
  slice: LaunchWizardEra25FirstProductSliceBlueprintSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_FIRST_PRODUCT_SLICE_BLUEPRINT_ANCHOR.slice(1)}
      className="scroll-mt-24 border-fuchsia-200/80 bg-fuchsia-50/20 shadow-sm dark:border-fuchsia-900/50"
      data-testid="launch-wizard-era25-first-product-slice-blueprint-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-fuchsia-950 dark:text-fuchsia-100">
          <Layers className="h-5 w-5 shrink-0" aria-hidden />
          Era25 first product slice — blueprint orchestration
        </CardTitle>
        <CardDescription>
          Canonical slice {slice.canonicalSliceName} — blueprint only after honest engineering gates open.
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
          {slice.blueprintBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Blueprint blocked
            </Badge>
          ) : null}
          {slice.era25FirstProductSliceBlueprintIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Blueprint integrity FAIL
            </Badge>
          ) : null}
          {slice.era25EngineeringGatesIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Gates integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Blueprint checklist</Link>
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

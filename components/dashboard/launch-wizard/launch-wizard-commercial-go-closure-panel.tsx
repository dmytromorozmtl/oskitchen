import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_COMMERCIAL_GO_CLOSURE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-go-closure-era28";
import type { LaunchWizardCommercialGoClosureSlice } from "@/lib/launch-wizard/launch-wizard-commercial-go-closure-era28";

export function LaunchWizardCommercialGoClosurePanel(props: {
  slice: LaunchWizardCommercialGoClosureSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_COMMERCIAL_GO_CLOSURE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-commercial-go-closure-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <ShieldAlert className="h-5 w-5 shrink-0" aria-hidden />
          Commercial GO closure
        </CardTitle>
        <CardDescription>
          ICP + LOI + smoke:pilot-gono-go — never commit fake GO in artifacts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            decision: {slice.decision ?? "unknown"}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">
            {slice.progressLabel}
          </Badge>
          {slice.goIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              GO integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>GO checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.implementationHref}>ICP panel</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.orchestratorCommand}</p>
      </CardContent>
    </Card>
  );
}

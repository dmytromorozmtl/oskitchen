import Link from "next/link";
import { Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildLaunchWizardGoldenPathStepLinks,
  launchWizardGoldenPathWorkflowCount,
} from "@/lib/launch-wizard/launch-wizard-golden-path-era20";
import type { LaunchWizardStep } from "@/lib/launch-wizard/launch-wizard-era19";

export function LaunchWizardGoldenPathPanel(props: {
  steps: readonly LaunchWizardStep[];
  compact?: boolean;
}) {
  const { steps, compact = false } = props;
  const links = buildLaunchWizardGoldenPathStepLinks(steps);
  const blockedCount = steps.filter((s) => s.status === "blocked").length;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="launch-wizard-golden-path-panel"
    >
      <CardHeader className={compact ? "py-3" : undefined}>
        <CardTitle className="flex items-center gap-2 text-base">
          <Route className="h-4 w-4 text-muted-foreground" aria-hidden />
          Operator golden path
        </CardTitle>
        <CardDescription>
          Each wizard step maps to a Tier 2 checklist phase.{" "}
          {launchWizardGoldenPathWorkflowCount()} end-to-end workflows are documented for pilot
          sign-off — execution still requires staging proof.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {blockedCount > 0 ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {blockedCount} step{blockedCount === 1 ? "" : "s"} blocked — resolve blockers before
            Tier 2 golden path sign-off.
          </p>
        ) : null}
        <ul className="space-y-2 text-sm" role="list" aria-label="Golden path phase mapping">
          {links.map((link) => (
            <li
              key={link.stepId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2"
              data-testid={`launch-wizard-golden-path-${link.stepId}`}
            >
              <span className="font-medium capitalize">{link.stepId.replace(/-/g, " ")}</span>
              <Badge variant="outline" className="rounded-full text-[10px] font-normal">
                Tier 2: {link.phaseLabel}
              </Badge>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/today" data-testid="launch-wizard-golden-path-today-link">
              Open Today briefing
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/go-live" data-testid="launch-wizard-golden-path-go-live-link">
              Go-live proof hub
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
